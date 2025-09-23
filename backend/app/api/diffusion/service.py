"""
Service layer integration for Diffusion-LLM API.

Refactored to use standardized logging and service patterns with proper dependency injection.
"""

from typing import Any

from ...core.logging_config import get_service_logger
from ...services.diffusion import DiffusionLLMService

logger = get_service_logger("diffusion")


class DiffusionServiceManager:
    """
    Service manager for Diffusion-LLM API with proper dependency injection.

    This class manages the Diffusion service instance without using globals,
    providing better testability and cleaner architecture.
    """

    def __init__(self):
        self._service: DiffusionLLMService | None = None
        self._initialized: bool = False

    def get_service(self) -> DiffusionLLMService:
        """Get the Diffusion service instance."""
        if self._service is None:
            self._service = DiffusionLLMService()
            logger.info("Diffusion service instance created")
        return self._service

    async def initialize_service(self, config: dict[str, Any]) -> bool:
        """Initialize the Diffusion service with configuration."""
        try:
            service = self.get_service()
            await service.initialize(config)
        except (
            Exception
        ) as e:  # noqa: BLE001 - We want to catch all initialization errors
            logger.exception(
                "Failed to initialize Diffusion service",
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
                "Diffusion service initialized successfully",
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
        logger.info("Diffusion service instance reset")


# Create a singleton instance of the service manager
_service_manager = DiffusionServiceManager()


def get_diffusion_service() -> DiffusionLLMService:
    """Get the Diffusion service instance."""
    return _service_manager.get_service()


async def initialize_diffusion_service(config: dict[str, Any]) -> bool:
    """Initialize the Diffusion service with configuration."""
    return await _service_manager.initialize_service(config)


def is_diffusion_service_initialized() -> bool:
    """Check if the Diffusion service is initialized."""
    return _service_manager.is_initialized()


def reset_diffusion_service() -> None:
    """Reset the Diffusion service instance (useful for testing)."""
    _service_manager.reset_service()
