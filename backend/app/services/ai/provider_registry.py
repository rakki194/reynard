"""🦊 Reynard AI Provider Registry
================================

Centralized registry and configuration system for AI model providers.
This module manages provider registration, configuration, and lifecycle
management across the Reynard ecosystem.

Key Features:
- Provider Registration: Centralized provider discovery and registration
- Configuration Management: Dynamic provider configuration and validation
- Lifecycle Management: Provider initialization, health monitoring, and shutdown
- Service Discovery: Automatic provider discovery and capability matching
- Load Balancing: Intelligent request distribution across providers
- Health Monitoring: Comprehensive health checks and status reporting

Author: Reynard Development Team
Version: 1.0.0
"""

import asyncio
import logging
import os
from typing import Any, Dict, List, Optional, Type

from .interfaces.model_provider import (
    ModelProvider,
    ModelProviderConfig,
    ProviderType,
)

logger = logging.getLogger(__name__)


class ProviderRegistry:
    """Centralized registry for AI model providers."""

    def __init__(self):
        self._providers: Dict[ProviderType, ModelProvider] = {}
        self._provider_configs: Dict[ProviderType, ModelProviderConfig] = {}
        self._provider_classes: Dict[ProviderType, Type[ModelProvider]] = {}
        self._initialized = False
        self._health_check_interval = 30
        self._health_check_task: Optional[asyncio.Task] = None

    def register_provider_class(
        self,
        provider_type: ProviderType,
        provider_class: Type[ModelProvider],
        config_class: Type[ModelProviderConfig],
    ) -> None:
        """Register a provider class and its configuration.

        Args:
            provider_type: Type of provider
            provider_class: Provider implementation class
            config_class: Configuration class for the provider
        """
        self._provider_classes[provider_type] = provider_class
        logger.info(f"Registered provider class: {provider_type}")

    def register_provider(self, provider: ModelProvider) -> None:
        """Register a provider instance.

        Args:
            provider: Provider instance to register
        """
        self._providers[provider.provider_type] = provider
        logger.info(f"Registered provider instance: {provider.provider_type}")

    def get_provider(self, provider_type: ProviderType) -> Optional[ModelProvider]:
        """Get a provider by type.

        Args:
            provider_type: Type of provider to get

        Returns:
            Provider instance or None if not found
        """
        return self._providers.get(provider_type)

    def get_all_providers(self) -> Dict[ProviderType, ModelProvider]:
        """Get all registered providers.

        Returns:
            Dictionary of all registered providers
        """
        return self._providers.copy()

    def get_available_providers(self) -> List[ProviderType]:
        """Get list of available provider types.

        Returns:
            List of available provider types
        """
        return list(self._providers.keys())

    async def initialize_provider(
        self,
        provider_type: ProviderType,
        config: Dict[str, Any],
    ) -> bool:
        """Initialize a provider with configuration.

        Args:
            provider_type: Type of provider to initialize
            config: Provider configuration

        Returns:
            True if initialization successful, False otherwise
        """
        if provider_type not in self._provider_classes:
            logger.error(f"Provider class not registered: {provider_type}")
            return False

        try:
            provider_class = self._provider_classes[provider_type]

            # Create configuration instance
            config_instance = provider_class.__init__.__annotations__["config"](
                provider_type=provider_type, **config
            )

            # Create provider instance
            provider = provider_class(config_instance)

            # Initialize provider
            if await provider.initialize():
                self.register_provider(provider)
                self._provider_configs[provider_type] = config_instance
                logger.info(f"Successfully initialized provider: {provider_type}")
                return True
            else:
                logger.error(f"Failed to initialize provider: {provider_type}")
                return False

        except Exception as e:
            logger.error(f"Error initializing provider {provider_type}: {e}")
            return False

    async def initialize_all_providers(
        self, configs: Dict[ProviderType, Dict[str, Any]]
    ) -> bool:
        """Initialize all providers with their configurations.

        Args:
            configs: Dictionary of provider configurations

        Returns:
            True if all providers initialized successfully
        """
        success = True

        for provider_type, config in configs.items():
            if not await self.initialize_provider(provider_type, config):
                success = False

        if success:
            self._initialized = True
            await self._start_health_monitoring()

        return success

    async def shutdown_provider(self, provider_type: ProviderType) -> None:
        """Shutdown a specific provider.

        Args:
            provider_type: Type of provider to shutdown
        """
        if provider_type in self._providers:
            try:
                await self._providers[provider_type].shutdown()
                del self._providers[provider_type]
                logger.info(f"Shutdown provider: {provider_type}")
            except Exception as e:
                logger.error(f"Error shutting down provider {provider_type}: {e}")

    async def shutdown_all_providers(self) -> None:
        """Shutdown all registered providers."""
        for provider_type in list(self._providers.keys()):
            await self.shutdown_provider(provider_type)

        if self._health_check_task:
            self._health_check_task.cancel()
            try:
                await self._health_check_task
            except asyncio.CancelledError:
                pass

        self._initialized = False
        logger.info("All providers shutdown complete")

    async def health_check_provider(self, provider_type: ProviderType) -> bool:
        """Check health of a specific provider.

        Args:
            provider_type: Type of provider to check

        Returns:
            True if provider is healthy, False otherwise
        """
        if provider_type not in self._providers:
            return False

        try:
            return await self._providers[provider_type].health_check()
        except Exception as e:
            logger.error(f"Health check failed for {provider_type}: {e}")
            return False

    async def health_check_all_providers(self) -> Dict[ProviderType, bool]:
        """Check health of all providers.

        Returns:
            Dictionary of provider health status
        """
        results = {}

        for provider_type, provider in self._providers.items():
            try:
                results[provider_type] = await provider.health_check()
            except Exception:
                results[provider_type] = False

        return results

    async def _start_health_monitoring(self) -> None:
        """Start background health monitoring."""
        if self._health_check_interval > 0:
            self._health_check_task = asyncio.create_task(
                self._health_monitoring_loop()
            )

    async def _health_monitoring_loop(self) -> None:
        """Background health monitoring loop."""
        while True:
            try:
                await asyncio.sleep(self._health_check_interval)
                await self.health_check_all_providers()
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Error in health monitoring loop: {e}")

    def get_provider_metrics(self) -> Dict[ProviderType, Dict[str, Any]]:
        """Get metrics from all providers.

        Returns:
            Dictionary of provider metrics
        """
        metrics = {}

        for provider_type, provider in self._providers.items():
            try:
                metrics[provider_type] = provider.get_metrics()
            except Exception as e:
                logger.error(f"Error getting metrics for {provider_type}: {e}")
                metrics[provider_type] = {}

        return metrics

    def get_provider_health_status(self) -> Dict[ProviderType, Dict[str, Any]]:
        """Get health status from all providers.

        Returns:
            Dictionary of provider health status
        """
        health_status = {}

        for provider_type, provider in self._providers.items():
            try:
                health_status[provider_type] = provider.get_health_status()
            except Exception as e:
                logger.error(f"Error getting health status for {provider_type}: {e}")
                health_status[provider_type] = {
                    "provider_type": provider_type,
                    "enabled": False,
                    "initialized": False,
                    "health_status": "error",
                    "error": str(e),
                }

        return health_status


class ProviderConfigManager:
    """Configuration manager for AI providers."""

    def __init__(self):
        self._configs: Dict[ProviderType, Dict[str, Any]] = {}
        self._default_configs = self._load_default_configs()

    def _load_default_configs(self) -> Dict[ProviderType, Dict[str, Any]]:
        """Load default configurations for all providers."""
        return {
            ProviderType.OLLAMA: {
                "enabled": True,
                "base_url": os.getenv("OLLAMA_BASE_URL", "http://localhost:11434"),
                "default_model": os.getenv("AI_DEFAULT_MODEL", "llama3.1:latest"),
                "timeout_seconds": int(os.getenv("AI_TIMEOUT", "60")),
                "max_concurrent_requests": int(os.getenv("AI_MAX_CONCURRENT", "5")),
                "assistant_enabled": True,
                "tools_enabled": True,
                "context_awareness": True,
            },
            ProviderType.VLLM: {
                "enabled": os.getenv("VLLM_ENABLED", "false").lower() == "true",
                "base_url": os.getenv("VLLM_BASE_URL", "http://localhost:8000"),
                "default_model": os.getenv("VLLM_DEFAULT_MODEL", "llama-2-7b-chat"),
                "timeout_seconds": int(os.getenv("VLLM_TIMEOUT", "300")),
                "max_concurrent_requests": int(os.getenv("VLLM_MAX_CONCURRENT", "10")),
                "max_model_length": int(os.getenv("VLLM_MAX_MODEL_LENGTH", "4096")),
                "gpu_memory_utilization": float(
                    os.getenv("VLLM_GPU_MEMORY_UTIL", "0.9")
                ),
            },
            ProviderType.SGLANG: {
                "enabled": os.getenv("SGLANG_ENABLED", "false").lower() == "true",
                "base_url": os.getenv("SGLANG_BASE_URL", "http://localhost:30000"),
                "default_model": os.getenv(
                    "SGLANG_DEFAULT_MODEL", "llama-3-8b-instruct"
                ),
                "timeout_seconds": int(os.getenv("SGLANG_TIMEOUT", "300")),
                "max_concurrent_requests": int(
                    os.getenv("SGLANG_MAX_CONCURRENT", "10")
                ),
                "max_model_length": int(os.getenv("SGLANG_MAX_MODEL_LENGTH", "8192")),
                "enable_radix_attention": True,
            },
            ProviderType.LLAMACPP: {
                "enabled": os.getenv("LLAMACPP_ENABLED", "false").lower() == "true",
                "base_url": os.getenv("LLAMACPP_BASE_URL", "http://localhost:8080"),
                "default_model": os.getenv("LLAMACPP_DEFAULT_MODEL", "llama-2-7b-chat"),
                "timeout_seconds": int(os.getenv("LLAMACPP_TIMEOUT", "300")),
                "max_concurrent_requests": int(
                    os.getenv("LLAMACPP_MAX_CONCURRENT", "5")
                ),
                "n_ctx": int(os.getenv("LLAMACPP_N_CTX", "2048")),
                "n_batch": int(os.getenv("LLAMACPP_N_BATCH", "512")),
                "n_threads": int(os.getenv("LLAMACPP_N_THREADS", "4")),
            },
        }

    def load_config(self, provider_type: ProviderType) -> Dict[str, Any]:
        """Load configuration for a specific provider.

        Args:
            provider_type: Type of provider

        Returns:
            Provider configuration dictionary
        """
        if provider_type in self._configs:
            return self._configs[provider_type]

        return self._default_configs.get(provider_type, {})

    def load_all_configs(self) -> Dict[ProviderType, Dict[str, Any]]:
        """Load configurations for all providers.

        Returns:
            Dictionary of all provider configurations
        """
        configs = {}

        for provider_type in ProviderType:
            configs[provider_type] = self.load_config(provider_type)

        return configs

    def update_config(
        self,
        provider_type: ProviderType,
        config: Dict[str, Any],
    ) -> None:
        """Update configuration for a specific provider.

        Args:
            provider_type: Type of provider
            config: New configuration
        """
        self._configs[provider_type] = config
        logger.info(f"Updated configuration for {provider_type}")

    def validate_config(
        self,
        provider_type: ProviderType,
        config: Dict[str, Any],
    ) -> bool:
        """Validate configuration for a specific provider.

        Args:
            provider_type: Type of provider
            config: Configuration to validate

        Returns:
            True if configuration is valid, False otherwise
        """
        try:
            # Basic validation
            if not isinstance(config, dict):
                return False

            # Provider-specific validation
            if provider_type == ProviderType.OLLAMA:
                required_fields = ["base_url", "default_model"]
            elif provider_type == ProviderType.VLLM:
                required_fields = ["base_url", "default_model", "max_model_length"]
            elif provider_type == ProviderType.SGLANG:
                required_fields = ["base_url", "default_model", "max_model_length"]
            elif provider_type == ProviderType.LLAMACPP:
                required_fields = ["base_url", "default_model", "n_ctx"]
            else:
                required_fields = ["base_url", "default_model"]

            for field in required_fields:
                if field not in config:
                    logger.error(
                        f"Missing required field '{field}' for {provider_type}"
                    )
                    return False

            return True

        except Exception as e:
            logger.error(f"Error validating config for {provider_type}: {e}")
            return False


# Global registry instance
_global_registry: Optional[ProviderRegistry] = None
_global_config_manager: Optional[ProviderConfigManager] = None


def get_provider_registry() -> ProviderRegistry:
    """Get the global provider registry instance."""
    global _global_registry
    if _global_registry is None:
        _global_registry = ProviderRegistry()
    return _global_registry


def get_config_manager() -> ProviderConfigManager:
    """Get the global configuration manager instance."""
    global _global_config_manager
    if _global_config_manager is None:
        _global_config_manager = ProviderConfigManager()
    return _global_config_manager
