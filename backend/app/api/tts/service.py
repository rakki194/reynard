"""TTS Service for Reynard Backend

Service layer for TTS operations.

Refactored to use standardized logging and service patterns with proper dependency injection.
"""

from typing import Any

from ...core.logging_config import get_service_logger
from ...services.tts import TTSService

logger = get_service_logger("tts")


class TTSServiceManager:
    """Service manager for TTS API with proper dependency injection.

    This class manages the TTS service instance without using globals,
    providing better testability and cleaner architecture.
    """

    def __init__(self):
        self._service: TTSService | None = None
        self._initialized: bool = False

    def get_service(self) -> TTSService:
        """Get the TTS service instance."""
        if self._service is None:
            self._service = TTSService()
            logger.info("TTS service instance created")
        return self._service

    async def initialize_service(self, config: dict[str, Any]) -> bool:
        """Initialize the TTS service with configuration."""
        try:
            service = self.get_service()
            result = await service.initialize(config)
        except Exception as e:
            logger.exception(
                "Failed to initialize TTS service",
                extra={
                    "error": str(e),
                    "error_type": type(e).__name__,
                    "config_provided": bool(config),
                },
            )
            return False
        else:
            self._initialized = result
            logger.info(
                "TTS service initialized successfully",
                extra={
                    "config_keys": list(config.keys()) if config else [],
                    "service_initialized": result,
                },
            )
            return result

    def is_initialized(self) -> bool:
        """Check if the service is initialized."""
        return self._initialized

    def reset_service(self) -> None:
        """Reset the service instance (useful for testing)."""
        self._service = None
        self._initialized = False
        logger.info("TTS service instance reset")


# Create a singleton instance of the service manager
_service_manager = TTSServiceManager()


def get_tts_service() -> TTSService:
    """Get the TTS service instance."""
    return _service_manager.get_service()


async def initialize_tts_service(config: dict[str, Any]) -> bool:
    """Initialize the TTS service with configuration."""
    return await _service_manager.initialize_service(config)


def is_tts_service_initialized() -> bool:
    """Check if the TTS service is initialized."""
    return _service_manager.is_initialized()


def reset_tts_service() -> None:
    """Reset the TTS service instance (useful for testing)."""
    _service_manager.reset_service()
