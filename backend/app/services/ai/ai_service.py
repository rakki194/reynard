"""🦊 Reynard AI Service
======================

AI service that manages multiple model providers and provides
a consistent interface for all AI operations across the Reynard ecosystem.

This service orchestrates different model providers (Ollama, vLLM, SGLang, LLaMA.cpp)
and provides intelligent routing, load balancing, and fallback mechanisms.

Key Features:
- Multi-Provider Support: Consistent interface across different serving frameworks
- Intelligent Routing: Automatic provider selection based on capabilities and load
- Load Balancing: Distribute requests across available providers
- Fallback Mechanisms: Graceful degradation when providers are unavailable
- Performance Monitoring: Comprehensive metrics and health monitoring
- Configuration Management: Dynamic provider configuration and management
- Provider Registry: Centralized provider registration and discovery

Author: Reynard Development Team
Version: 1.0.0
"""

import asyncio
import logging
import time
from typing import Any, AsyncGenerator, Dict, List, Optional, Union

from .interfaces.model_provider import (
    ChatMessage,
    ChatResult,
    GenerationResult,
    ModelCapability,
    ModelInfo,
    ModelProvider,
    ModelProviderConfig,
    ModelProviderRegistry,
    ProviderType,
)

logger = logging.getLogger(__name__)


class AIServiceConfig:
    """Configuration for the AI service."""
    
    def __init__(
        self,
        default_provider: Optional[ProviderType] = None,
        enable_load_balancing: bool = True,
        enable_fallback: bool = True,
        health_check_interval: int = 30,
        max_retries: int = 3,
        retry_delay: float = 1.0,
        provider_configs: Optional[Dict[ProviderType, Dict[str, Any]]] = None,
    ):
        self.default_provider = default_provider or ProviderType.OLLAMA
        self.enable_load_balancing = enable_load_balancing
        self.enable_fallback = enable_fallback
        self.health_check_interval = health_check_interval
        self.max_retries = max_retries
        self.retry_delay = retry_delay
        self.provider_configs = provider_configs or {}


class AIService:
    """AI service managing multiple model providers."""
    
    def __init__(self, config: AIServiceConfig):
        """Initialize the AI service.
        
        Args:
            config: AI service configuration
        """
        self.config = config
        self.registry = ModelProviderRegistry()
        self._initialized = False
        self._health_check_task: Optional[asyncio.Task] = None
        self._metrics = {
            "total_requests": 0,
            "successful_requests": 0,
            "failed_requests": 0,
            "provider_requests": {},
            "average_latency_ms": 0.0,
            "fallback_usage": 0,
        }
    
    async def initialize(self) -> bool:
        """Initialize the AI service and all providers."""
        try:
            logger.info("Initializing AI service...")
            
            # Initialize providers based on configuration
            await self._initialize_providers()
            
            # Start health monitoring
            if self.config.health_check_interval > 0:
                self._health_check_task = asyncio.create_task(
                    self._health_check_loop()
                )
            
            self._initialized = True
            logger.info("AI service initialized successfully")
            return True
            
        except Exception as e:
            logger.error(f"Failed to initialize AI service: {e}")
            return False
    
    async def shutdown(self) -> None:
        """Shutdown the AI service and all providers."""
        try:
            logger.info("Shutting down AI service...")
            
            # Stop health monitoring
            if self._health_check_task:
                self._health_check_task.cancel()
                try:
                    await self._health_check_task
                except asyncio.CancelledError:
                    pass
            
            # Shutdown all providers
            await self.registry.shutdown_all()
            
            self._initialized = False
            logger.info("AI service shutdown complete")
            
        except Exception as e:
            logger.error(f"Error during AI service shutdown: {e}")
    
    async def _initialize_providers(self) -> None:
        """Initialize all configured providers."""
        from .providers.ollama_provider import OllamaConfig, OllamaProvider
        from .providers.vllm_provider import VLLMConfig, VLLMProvider
        from .providers.sglang_provider import SGLangConfig, SGLangProvider
        from .providers.llamacpp_provider import LLaMACppConfig, LLaMACppProvider
        
        provider_classes = {
            ProviderType.OLLAMA: (OllamaProvider, OllamaConfig),
            ProviderType.VLLM: (VLLMProvider, VLLMConfig),
            ProviderType.SGLANG: (SGLangProvider, SGLangConfig),
            ProviderType.LLAMACPP: (LLaMACppProvider, LLaMACppConfig),
        }
        
        for provider_type, (provider_class, config_class) in provider_classes.items():
            if provider_type in self.config.provider_configs:
                try:
                    # Create provider configuration
                    provider_config = config_class(**self.config.provider_configs[provider_type])
                    
                    # Create and initialize provider
                    provider = provider_class(provider_config)
                    
                    if await provider.initialize():
                        self.registry.register_provider(provider)
                        logger.info(f"Initialized {provider_type} provider")
                    else:
                        logger.warning(f"Failed to initialize {provider_type} provider")
                        
                except Exception as e:
                    logger.error(f"Error initializing {provider_type} provider: {e}")
    
    async def _health_check_loop(self) -> None:
        """Background health check loop for all providers."""
        while True:
            try:
                await asyncio.sleep(self.config.health_check_interval)
                await self._perform_health_checks()
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Error in health check loop: {e}")
    
    async def _perform_health_checks(self) -> None:
        """Perform health checks on all providers."""
        health_results = await self.registry.health_check_all()
        
        for provider_type, is_healthy in health_results.items():
            provider = self.registry.get_provider(provider_type)
            if provider:
                provider._health_status = "healthy" if is_healthy else "unhealthy"
                provider._last_health_check = time.time()
    
    def _select_provider(
        self,
        capability: Optional[ModelCapability] = None,
        model: Optional[str] = None,
        preferred_provider: Optional[ProviderType] = None,
    ) -> Optional[ModelProvider]:
        """Select the best provider for a request.
        
        Args:
            capability: Required capability
            model: Specific model requirement
            preferred_provider: Preferred provider type
            
        Returns:
            Selected provider or None if no suitable provider found
        """
        available_providers = self.registry.get_all_providers()
        
        if not available_providers:
            return None
        
        # Filter providers by capability
        if capability:
            available_providers = {
                ptype: provider
                for ptype, provider in available_providers.items()
                if provider.supports_capability(capability)
            }
        
        # Filter providers by model support
        if model:
            available_providers = {
                ptype: provider
                for ptype, provider in available_providers.items()
                if provider.is_model_supported(model)
            }
        
        if not available_providers:
            return None
        
        # Select provider based on preference and health
        if preferred_provider and preferred_provider in available_providers:
            provider = available_providers[preferred_provider]
            if provider._health_status == "healthy":
                return provider
        
        # Select healthy provider with best performance
        healthy_providers = {
            ptype: provider
            for ptype, provider in available_providers.items()
            if provider._health_status == "healthy"
        }
        
        if healthy_providers:
            # Select provider with lowest average latency
            best_provider = min(
                healthy_providers.values(),
                key=lambda p: p._metrics.get("average_latency_ms", float('inf'))
            )
            return best_provider
        
        # Fallback to any available provider
        return next(iter(available_providers.values()))
    
    async def generate_completion(
        self,
        prompt: str,
        model: Optional[str] = None,
        max_tokens: Optional[int] = None,
        temperature: Optional[float] = None,
        provider: Optional[ProviderType] = None,
        **kwargs
    ) -> GenerationResult:
        """Generate text completion using the best available provider."""
        if not self._initialized:
            raise RuntimeError("AI service not initialized")
        
        # Select provider
        selected_provider = self._select_provider(
            capability=ModelCapability.COMPLETION,
            model=model,
            preferred_provider=provider,
        )
        
        if not selected_provider:
            raise RuntimeError("No suitable provider available for completion")
        
        # Execute with retry logic
        for attempt in range(self.config.max_retries):
            try:
                result = await selected_provider.generate_completion(
                    prompt, model, max_tokens, temperature, **kwargs
                )
                
                # Update metrics
                self._metrics["total_requests"] += 1
                self._metrics["successful_requests"] += 1
                self._metrics["provider_requests"][selected_provider.provider_type] = (
                    self._metrics["provider_requests"].get(selected_provider.provider_type, 0) + 1
                )
                
                return result
                
            except Exception as e:
                if attempt < self.config.max_retries - 1:
                    logger.warning(f"Completion attempt {attempt + 1} failed: {e}")
                    await asyncio.sleep(self.config.retry_delay)
                    
                    # Try fallback provider
                    if self.config.enable_fallback:
                        fallback_provider = self._select_provider(
                            capability=ModelCapability.COMPLETION,
                            model=model,
                        )
                        if fallback_provider and fallback_provider != selected_provider:
                            selected_provider = fallback_provider
                            self._metrics["fallback_usage"] += 1
                            continue
                else:
                    self._metrics["total_requests"] += 1
                    self._metrics["failed_requests"] += 1
                    raise RuntimeError(f"Completion failed after {self.config.max_retries} attempts: {e}")
    
    async def generate_chat_completion(
        self,
        messages: List[ChatMessage],
        model: Optional[str] = None,
        max_tokens: Optional[int] = None,
        temperature: Optional[float] = None,
        tools: Optional[List[Dict[str, Any]]] = None,
        provider: Optional[ProviderType] = None,
        **kwargs
    ) -> ChatResult:
        """Generate chat completion using the best available provider."""
        if not self._initialized:
            raise RuntimeError("AI service not initialized")
        
        # Select provider
        selected_provider = self._select_provider(
            capability=ModelCapability.CHAT,
            model=model,
            preferred_provider=provider,
        )
        
        if not selected_provider:
            raise RuntimeError("No suitable provider available for chat completion")
        
        # Execute with retry logic
        for attempt in range(self.config.max_retries):
            try:
                result = await selected_provider.generate_chat_completion(
                    messages, model, max_tokens, temperature, tools, **kwargs
                )
                
                # Update metrics
                self._metrics["total_requests"] += 1
                self._metrics["successful_requests"] += 1
                self._metrics["provider_requests"][selected_provider.provider_type] = (
                    self._metrics["provider_requests"].get(selected_provider.provider_type, 0) + 1
                )
                
                return result
                
            except Exception as e:
                if attempt < self.config.max_retries - 1:
                    logger.warning(f"Chat completion attempt {attempt + 1} failed: {e}")
                    await asyncio.sleep(self.config.retry_delay)
                    
                    # Try fallback provider
                    if self.config.enable_fallback:
                        fallback_provider = self._select_provider(
                            capability=ModelCapability.CHAT,
                            model=model,
                        )
                        if fallback_provider and fallback_provider != selected_provider:
                            selected_provider = fallback_provider
                            self._metrics["fallback_usage"] += 1
                            continue
                else:
                    self._metrics["total_requests"] += 1
                    self._metrics["failed_requests"] += 1
                    raise RuntimeError(f"Chat completion failed after {self.config.max_retries} attempts: {e}")
    
    async def stream_completion(
        self,
        prompt: str,
        model: Optional[str] = None,
        max_tokens: Optional[int] = None,
        temperature: Optional[float] = None,
        provider: Optional[ProviderType] = None,
        **kwargs
    ) -> AsyncGenerator[str, None]:
        """Stream text completion using the best available provider."""
        if not self._initialized:
            raise RuntimeError("AI service not initialized")
        
        # Select provider
        selected_provider = self._select_provider(
            capability=ModelCapability.STREAMING,
            model=model,
            preferred_provider=provider,
        )
        
        if not selected_provider:
            raise RuntimeError("No suitable provider available for streaming completion")
        
        try:
            async for chunk in selected_provider.stream_completion(
                prompt, model, max_tokens, temperature, **kwargs
            ):
                yield chunk
                
        except Exception as e:
            self._metrics["total_requests"] += 1
            self._metrics["failed_requests"] += 1
            raise RuntimeError(f"Streaming completion failed: {e}")
    
    async def stream_chat_completion(
        self,
        messages: List[ChatMessage],
        model: Optional[str] = None,
        max_tokens: Optional[int] = None,
        temperature: Optional[float] = None,
        tools: Optional[List[Dict[str, Any]]] = None,
        provider: Optional[ProviderType] = None,
        **kwargs
    ) -> AsyncGenerator[ChatMessage, None]:
        """Stream chat completion using the best available provider."""
        if not self._initialized:
            raise RuntimeError("AI service not initialized")
        
        # Select provider
        selected_provider = self._select_provider(
            capability=ModelCapability.STREAMING,
            model=model,
            preferred_provider=provider,
        )
        
        if not selected_provider:
            raise RuntimeError("No suitable provider available for streaming chat completion")
        
        try:
            async for message in selected_provider.stream_chat_completion(
                messages, model, max_tokens, temperature, tools, **kwargs
            ):
                yield message
                
        except Exception as e:
            self._metrics["total_requests"] += 1
            self._metrics["failed_requests"] += 1
            raise RuntimeError(f"Streaming chat completion failed: {e}")
    
    async def get_available_models(self) -> List[ModelInfo]:
        """Get all available models from all providers."""
        if not self._initialized:
            raise RuntimeError("AI service not initialized")
        
        all_models = []
        for provider in self.registry.get_all_providers().values():
            try:
                models = await provider.get_available_models()
                all_models.extend(models)
            except Exception as e:
                logger.warning(f"Failed to get models from {provider.provider_type}: {e}")
        
        return all_models
    
    def get_metrics(self) -> Dict[str, Any]:
        """Get comprehensive service metrics."""
        provider_metrics = {}
        for provider_type, provider in self.registry.get_all_providers().items():
            provider_metrics[provider_type] = provider.get_metrics()
        
        return {
            "service_metrics": self._metrics,
            "provider_metrics": provider_metrics,
            "available_providers": self.registry.get_available_providers(),
            "default_provider": self.config.default_provider,
        }
    
    def get_health_status(self) -> Dict[str, Any]:
        """Get health status of all providers."""
        health_status = {}
        for provider_type, provider in self.registry.get_all_providers().items():
            health_status[provider_type] = provider.get_health_status()
        
        return {
            "service_initialized": self._initialized,
            "provider_health": health_status,
            "total_providers": len(self.registry.get_all_providers()),
            "healthy_providers": len([
                p for p in self.registry.get_all_providers().values()
                if p._health_status == "healthy"
            ]),
        }