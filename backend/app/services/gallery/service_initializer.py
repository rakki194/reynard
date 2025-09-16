"""
Gallery Service Initializer

Initializes the gallery service with proper configuration and error handling.
"""

import logging
from typing import Any

from app.services.gallery.gallery_service import ReynardGalleryService

logger = logging.getLogger(__name__)


class GalleryServiceManager:
    """Manages the gallery service instance using a singleton pattern."""

    _instance: ReynardGalleryService | None = None

    @classmethod
    def initialize(cls, service_config: dict[str, Any]) -> ReynardGalleryService:
        """
        Initialize the gallery service.

        Args:
            service_config: Service configuration dictionary

        Returns:
            Initialized ReynardGalleryService instance

        Raises:
            RuntimeError: If service initialization fails
        """
        try:
            logger.info("Initializing gallery service...")

            # Create service instance
            cls._instance = ReynardGalleryService(service_config)

        except Exception as e:
            logger.exception("Failed to initialize gallery service")
            raise RuntimeError(f"Gallery service initialization failed: {e}") from e
        else:
            logger.info("Gallery service initialized successfully")
            return cls._instance

    @classmethod
    def get_instance(cls) -> ReynardGalleryService | None:
        """
        Get the current gallery service instance.

        Returns:
            ReynardGalleryService instance or None if not initialized
        """
        return cls._instance

    @classmethod
    async def shutdown(cls) -> None:
        """
        Shutdown the gallery service.
        """
        if cls._instance:
            try:
                logger.info("Shutting down gallery service...")
                await cls._instance.shutdown()
                cls._instance = None
                logger.info("Gallery service shutdown complete")
            except Exception:
                logger.exception("Error during gallery service shutdown")
        else:
            logger.info("Gallery service not initialized, skipping shutdown")


# Convenience functions for backward compatibility
def initialize_gallery_service(service_config: dict[str, Any]) -> ReynardGalleryService:
    """Initialize the gallery service."""
    return GalleryServiceManager.initialize(service_config)


def get_gallery_service() -> ReynardGalleryService | None:
    """Get the current gallery service instance."""
    return GalleryServiceManager.get_instance()


async def shutdown_gallery_service() -> None:
    """Shutdown the gallery service."""
    await GalleryServiceManager.shutdown()
