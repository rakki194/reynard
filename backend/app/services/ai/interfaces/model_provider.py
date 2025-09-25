"""🦊 Reynard AI Model Provider Interface
========================================

Interface for all AI model providers in the Reynard ecosystem.
This module defines the standard contract that all model providers must implement,
ensuring consistency, testability, and maintainability across different serving frameworks.

The interface supports:
- Multiple model serving frameworks (Ollama, vLLM, SGLang, LLaMA.cpp)
- Consistent chat, completion, and streaming interfaces
- Provider-specific optimizations and configurations
- Health monitoring and performance metrics
- Graceful fallback and error handling

Key Features:
- Provider Abstraction: Consistent interface across different serving frameworks
- Performance Optimization: Framework-specific optimizations (PagedAttention, RadixAttention)
- Configuration Management: Provider-specific configuration with validation
- Health Monitoring: Comprehensive health checks and metrics collection
- Error Handling: Graceful degradation and fallback mechanisms
- Streaming Support: Real-time response streaming for interactive experiences

Author: Reynard Development Team
Version: 1.0.0
"""

import asyncio
from abc import ABC, abstractmethod
from dataclasses import dataclass
from datetime import datetime
from enum import Enum
from typing import Any, AsyncGenerator, Dict, List, Optional, Union

from pydantic import BaseModel, Field


class ProviderType(str, Enum):
    """Supported model provider types."""
    
    OLLAMA = "ollama"
    VLLM = "vllm"
    SGLANG = "sglang"
    LLAMACPP = "llamacpp"
    OPENAI = "openai"
    ANTHROPIC = "anthropic"
    HUGGINGFACE = "huggingface"


class ModelCapability(str, Enum):
    """Model capabilities and features."""
    
    CHAT = "chat"
    COMPLETION = "completion"
    EMBEDDING = "embedding"
    TOOL_CALLING = "tool_calling"
    STREAMING = "streaming"
    BATCH_PROCESSING = "batch_processing"
    STRUCTURED_OUTPUT = "structured_output"
    MULTIMODAL = "multimodal"


@dataclass
class ModelInfo:
    """Information about a specific model."""
    
    name: str
    provider: ProviderType
    capabilities: List[ModelCapability]
    max_tokens: int
    context_length: int
    supports_streaming: bool
    supports_tools: bool
    description: str
    metadata: Dict[str, Any]


@dataclass
class GenerationResult:
    """Result of a model generation request."""
    
    text: str
    tokens_generated: int
    processing_time_ms: float
    model_used: str
    provider: ProviderType
    metadata: Dict[str, Any]
    finish_reason: Optional[str] = None


@dataclass
class ChatMessage:
    """Chat message for conversational interfaces."""
    
    role: str  # "system", "user", "assistant", "tool"
    content: str
    name: Optional[str] = None
    tool_calls: Optional[List[Dict[str, Any]]] = None
    tool_call_id: Optional[str] = None


@dataclass
class ChatResult:
    """Result of a chat completion request."""
    
    message: ChatMessage
    tokens_generated: int
    processing_time_ms: float
    model_used: str
    provider: ProviderType
    metadata: Dict[str, Any]
    finish_reason: Optional[str] = None


class ModelProviderConfig(BaseModel):
    """Base configuration for model providers."""
    
    provider_type: ProviderType
    enabled: bool = True
    base_url: Optional[str] = None
    api_key: Optional[str] = None
    timeout_seconds: int = 300
    max_concurrent_requests: int = 10
    default_model: Optional[str] = None
    supported_models: List[str] = Field(default_factory=list)
    capabilities: List[ModelCapability] = Field(default_factory=list)
    metadata: Dict[str, Any] = Field(default_factory=dict)


class ModelProvider(ABC):
    """Abstract base class for all model providers.
    
    This interface ensures consistency across different model serving frameworks
    while allowing provider-specific optimizations and features.
    """
    
    def __init__(self, config: ModelProviderConfig):
        """Initialize the model provider.
        
        Args:
            config: Provider-specific configuration
        """
        self.config = config
        self.provider_type = config.provider_type
        self.enabled = config.enabled
        self._initialized = False
        self._health_status = "unknown"
        self._last_health_check = None
        self._metrics = {
            "requests_total": 0,
            "requests_successful": 0,
            "requests_failed": 0,
            "total_tokens_generated": 0,
            "average_latency_ms": 0.0,
        }
    
    @abstractmethod
    async def initialize(self) -> bool:
        """Initialize the provider.
        
        Returns:
            bool: True if initialization successful, False otherwise
        """
        pass
    
    @abstractmethod
    async def shutdown(self) -> None:
        """Shutdown the provider and cleanup resources."""
        pass
    
    @abstractmethod
    async def health_check(self) -> bool:
        """Check provider health.
        
        Returns:
            bool: True if provider is healthy, False otherwise
        """
        pass
    
    @abstractmethod
    async def get_available_models(self) -> List[ModelInfo]:
        """Get list of available models.
        
        Returns:
            List[ModelInfo]: Available models with their capabilities
        """
        pass
    
    @abstractmethod
    async def generate_completion(
        self,
        prompt: str,
        model: Optional[str] = None,
        max_tokens: Optional[int] = None,
        temperature: Optional[float] = None,
        **kwargs
    ) -> GenerationResult:
        """Generate text completion.
        
        Args:
            prompt: Input prompt
            model: Model to use (uses default if None)
            max_tokens: Maximum tokens to generate
            temperature: Sampling temperature
            **kwargs: Additional provider-specific parameters
            
        Returns:
            GenerationResult: Generated text and metadata
        """
        pass
    
    @abstractmethod
    async def generate_chat_completion(
        self,
        messages: List[ChatMessage],
        model: Optional[str] = None,
        max_tokens: Optional[int] = None,
        temperature: Optional[float] = None,
        tools: Optional[List[Dict[str, Any]]] = None,
        **kwargs
    ) -> ChatResult:
        """Generate chat completion.
        
        Args:
            messages: List of chat messages
            model: Model to use (uses default if None)
            max_tokens: Maximum tokens to generate
            temperature: Sampling temperature
            tools: Available tools for function calling
            **kwargs: Additional provider-specific parameters
            
        Returns:
            ChatResult: Generated response and metadata
        """
        pass
    
    @abstractmethod
    async def stream_completion(
        self,
        prompt: str,
        model: Optional[str] = None,
        max_tokens: Optional[int] = None,
        temperature: Optional[float] = None,
        **kwargs
    ) -> AsyncGenerator[str, None]:
        """Stream text completion.
        
        Args:
            prompt: Input prompt
            model: Model to use (uses default if None)
            max_tokens: Maximum tokens to generate
            temperature: Sampling temperature
            **kwargs: Additional provider-specific parameters
            
        Yields:
            str: Streaming text chunks
        """
        pass
    
    @abstractmethod
    async def stream_chat_completion(
        self,
        messages: List[ChatMessage],
        model: Optional[str] = None,
        max_tokens: Optional[int] = None,
        temperature: Optional[float] = None,
        tools: Optional[List[Dict[str, Any]]] = None,
        **kwargs
    ) -> AsyncGenerator[ChatMessage, None]:
        """Stream chat completion.
        
        Args:
            messages: List of chat messages
            model: Model to use (uses default if None)
            max_tokens: Maximum tokens to generate
            temperature: Sampling temperature
            tools: Available tools for function calling
            **kwargs: Additional provider-specific parameters
            
        Yields:
            ChatMessage: Streaming chat message chunks
        """
        pass
    
    def get_metrics(self) -> Dict[str, Any]:
        """Get provider metrics.
        
        Returns:
            Dict[str, Any]: Provider performance metrics
        """
        return self._metrics.copy()
    
    def get_health_status(self) -> Dict[str, Any]:
        """Get provider health status.
        
        Returns:
            Dict[str, Any]: Health status information
        """
        return {
            "provider_type": self.provider_type,
            "enabled": self.enabled,
            "initialized": self._initialized,
            "health_status": self._health_status,
            "last_health_check": self._last_health_check,
            "metrics": self._metrics,
        }
    
    def supports_capability(self, capability: ModelCapability) -> bool:
        """Check if provider supports a specific capability.
        
        Args:
            capability: Capability to check
            
        Returns:
            bool: True if capability is supported
        """
        return capability in self.config.capabilities
    
    def is_model_supported(self, model: str) -> bool:
        """Check if a model is supported by this provider.
        
        Args:
            model: Model name to check
            
        Returns:
            bool: True if model is supported
        """
        return model in self.config.supported_models or model == self.config.default_model


class ModelProviderRegistry:
    """Registry for managing model providers."""
    
    def __init__(self):
        self._providers: Dict[ProviderType, ModelProvider] = {}
        self._default_provider: Optional[ProviderType] = None
    
    def register_provider(self, provider: ModelProvider) -> None:
        """Register a model provider.
        
        Args:
            provider: Provider instance to register
        """
        self._providers[provider.provider_type] = provider
    
    def get_provider(self, provider_type: ProviderType) -> Optional[ModelProvider]:
        """Get a provider by type.
        
        Args:
            provider_type: Type of provider to get
            
        Returns:
            Optional[ModelProvider]: Provider instance or None
        """
        return self._providers.get(provider_type)
    
    def get_all_providers(self) -> Dict[ProviderType, ModelProvider]:
        """Get all registered providers.
        
        Returns:
            Dict[ProviderType, ModelProvider]: All registered providers
        """
        return self._providers.copy()
    
    def get_available_providers(self) -> List[ProviderType]:
        """Get list of available provider types.
        
        Returns:
            List[ProviderType]: Available provider types
        """
        return list(self._providers.keys())
    
    def set_default_provider(self, provider_type: ProviderType) -> None:
        """Set the default provider.
        
        Args:
            provider_type: Provider type to set as default
        """
        if provider_type in self._providers:
            self._default_provider = provider_type
    
    def get_default_provider(self) -> Optional[ModelProvider]:
        """Get the default provider.
        
        Returns:
            Optional[ModelProvider]: Default provider or None
        """
        if self._default_provider:
            return self._providers.get(self._default_provider)
        return None
    
    async def health_check_all(self) -> Dict[ProviderType, bool]:
        """Check health of all providers.
        
        Returns:
            Dict[ProviderType, bool]: Health status for each provider
        """
        results = {}
        for provider_type, provider in self._providers.items():
            try:
                results[provider_type] = await provider.health_check()
            except Exception:
                results[provider_type] = False
        return results
    
    async def initialize_all(self) -> bool:
        """Initialize all registered providers.
        
        Returns:
            bool: True if all providers initialized successfully
        """
        success = True
        for provider in self._providers.values():
            try:
                if not await provider.initialize():
                    success = False
            except Exception:
                success = False
        return success
    
    async def shutdown_all(self) -> None:
        """Shutdown all registered providers."""
        for provider in self._providers.values():
            try:
                await provider.shutdown()
            except Exception:
                pass  # Continue shutdown even if one fails
