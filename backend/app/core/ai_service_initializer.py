"""🦊 Reynard AI Service Initializer
===================================

Service initializer for the AI service that manages multiple model providers.
This module integrates the AI service with the existing Reynard service architecture
and provides proper lifecycle management.

Key Features:
- Multi-Provider Initialization: Initialize all configured providers
- Service Integration: Integrate with existing service registry and lifecycle
- Configuration Management: Load and validate provider configurations
- Health Monitoring: Start background health monitoring
- Graceful Shutdown: Proper cleanup of all providers and resources

Author: Reynard Development Team
Version: 1.0.0
"""

import logging
from typing import Any

from ..services.ai import AIService, AIServiceConfig, get_config_manager
from ..services.ai.interfaces.model_provider import ProviderType

logger = logging.getLogger(__name__)


class AIServiceInitializer:
    """Initializer for the AI service."""
    
    def __init__(self):
        self._ai_service: AIService | None = None
        self._initialized = False
    
    async def initialize(self, config: dict[str, Any]) -> bool:
        """Initialize the AI service with configuration.
        
        Args:
            config: Service configuration dictionary
            
        Returns:
            True if initialization successful, False otherwise
        """
        try:
            logger.info("Initializing AI service...")
            
            # Get configuration manager
            config_manager = get_config_manager()
            
            # Load all provider configurations
            provider_configs = config_manager.load_all_configs()
            
            # Filter enabled providers
            enabled_providers = {
                provider_type: provider_config
                for provider_type, provider_config in provider_configs.items()
                if provider_config.get("enabled", False)
            }
            
            if not enabled_providers:
                logger.warning("No AI providers enabled in configuration")
                return False
            
            # Create AI service configuration
            ai_config = AIServiceConfig(
                default_provider=ProviderType.OLLAMA,  # Default to Ollama for compatibility
                enable_load_balancing=config.get("enable_load_balancing", True),
                enable_fallback=config.get("enable_fallback", True),
                health_check_interval=config.get("health_check_interval", 30),
                max_retries=config.get("max_retries", 3),
                retry_delay=config.get("retry_delay", 1.0),
                provider_configs=enabled_providers,
            )
            
            # Create and initialize AI service
            self._ai_service = AIService(ai_config)
            
            if await self._ai_service.initialize():
                self._initialized = True
                logger.info(f"AI service initialized with {len(enabled_providers)} providers")
                return True
            else:
                logger.error("Failed to initialize AI service")
                return False
                
        except Exception as e:
            logger.error(f"Error initializing AI service: {e}")
            return False
    
    async def shutdown(self) -> None:
        """Shutdown the AI service and cleanup resources."""
        try:
            if self._ai_service:
                await self._ai_service.shutdown()
                self._ai_service = None
                self._initialized = False
                logger.info("AI service shutdown complete")
        except Exception as e:
            logger.error(f"Error during AI service shutdown: {e}")
    
    async def health_check(self) -> bool:
        """Check AI service health.
        
        Returns:
            True if service is healthy, False otherwise
        """
        try:
            if not self._ai_service or not self._initialized:
                return False
            
            health_status = self._ai_service.get_health_status()
            return health_status["service_initialized"] and health_status["healthy_providers"] > 0
            
        except Exception as e:
            logger.error(f"Error checking AI service health: {e}")
            return False
    
    def get_service(self) -> AIService | None:
        """Get the AI service instance.
        
        Returns:
            AI service instance or None if not initialized
        """
        return self._ai_service
    
    def is_initialized(self) -> bool:
        """Check if the service is initialized.
        
        Returns:
            True if service is initialized, False otherwise
        """
        return self._initialized


# Global initializer instance
_ai_service_initializer: AIServiceInitializer | None = None


def get_ai_service_initializer() -> AIServiceInitializer:
    """Get the global AI service initializer instance."""
    global _ai_service_initializer
    if _ai_service_initializer is None:
        _ai_service_initializer = AIServiceInitializer()
    return _ai_service_initializer


async def init_ai_service(service_config: dict[str, Any]) -> bool:
    """Initialize the AI service.
    
    Args:
        service_config: Service configuration dictionary
        
    Returns:
        True if initialization successful, False otherwise
    """
    initializer = get_ai_service_initializer()
    return await initializer.initialize(service_config)


async def shutdown_ai_service() -> None:
    """Shutdown the AI service."""
    initializer = get_ai_service_initializer()
    await initializer.shutdown()


async def health_check_ai_service() -> bool:
    """Check AI service health.
    
    Returns:
        True if service is healthy, False otherwise
    """
    initializer = get_ai_service_initializer()
    return await initializer.health_check()


def get_ai_service() -> AIService | None:
    """Get the AI service instance.
    
    Returns:
        AI service instance or None if not initialized
    """
    initializer = get_ai_service_initializer()
    return initializer.get_service()
