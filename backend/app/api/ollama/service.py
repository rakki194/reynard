"""Service layer integration for Ollama API.

Refactored to use standardized logging and service patterns with proper dependency injection.
"""

from typing import Any

from ...core.logging_config import get_service_logger
from ...services.ollama import OllamaService

logger = get_service_logger("ollama")


class OllamaServiceManager:
    """Service manager for Ollama API with proper dependency injection.

    This class manages the Ollama service instance without using globals,
    providing better testability and cleaner architecture.
    """

    def __init__(self):
        self._service: OllamaService | None = None
        self._initialized: bool = False

    def get_service(self) -> OllamaService:
        """Get the Ollama service instance."""
        if self._service is None:
            self._service = OllamaService()
            logger.info("Ollama service instance created")
        return self._service

    async def initialize_service(self, config: dict[str, Any]) -> bool:
        """Initialize the Ollama service with configuration."""
        try:
            service = self.get_service()
            await service.initialize(config)
        except Exception as e:
            logger.exception(
                "Failed to initialize Ollama service",
                extra={
                    "error": str(e),
                    "error_type": type(e).__name__,
                    "config_provided": bool(config),
                },
            )
            return False
        else:
            self._initialized = True
            logger.info(
                "Ollama service initialized successfully",
                extra={
                    "config_keys": list(config.keys()) if config else [],
                    "service_initialized": True,
                },
            )
            return True

    def is_initialized(self) -> bool:
        """Check if the service is initialized."""
        return self._initialized

    def reset_service(self) -> None:
        """Reset the service instance (useful for testing)."""
        self._service = None
        self._initialized = False
        logger.info("Ollama service instance reset")


# Create a singleton instance of the service manager
_service_manager = OllamaServiceManager()


def get_ollama_service() -> OllamaService:
    """Get the Ollama service instance."""
    return _service_manager.get_service()


async def initialize_ollama_service(config: dict[str, Any]) -> bool:
    """Initialize the Ollama service with configuration."""
    return await _service_manager.initialize_service(config)


def is_ollama_service_initialized() -> bool:
    """Check if the Ollama service is initialized."""
    return _service_manager.is_initialized()


def reset_ollama_service() -> None:
    """Reset the Ollama service instance (useful for testing)."""
    _service_manager.reset_service()
