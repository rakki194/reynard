"""
Legacy Image Processing Service for Reynard Backend

This module provides backward compatibility while redirecting to the new
enhanced image processing service.
"""

import logging

logger = logging.getLogger("uvicorn")


class ImageProcessingService:
    """
    Legacy image processing service - redirects to enhanced service.

    This class provides backward compatibility while using the new
    enhanced image processing service under the hood.
    """

    def __init__(self):
        self._enhanced_service = None

    async def _get_enhanced_service(self):
        """Get the enhanced image processing service."""
        if self._enhanced_service is None:
            from app.services.image_processing_service import (
                get_image_processing_service,
            )

            self._enhanced_service = await get_image_processing_service()
        return self._enhanced_service

    async def initialize(self) -> bool:
        """Initialize the image processing service."""
        try:
            enhanced_service = await self._get_enhanced_service()
            return enhanced_service._initialized
        except Exception as e:
            logger.error(f"Failed to initialize legacy image processing service: {e}")
            return False

    def is_jxl_supported(self) -> bool:
        """Check if JXL format is supported."""
        try:
            import asyncio

            loop = asyncio.get_event_loop()
            enhanced_service = loop.run_until_complete(self._get_enhanced_service())
            return enhanced_service.is_jxl_supported()
        except Exception:
            return False

    def is_avif_supported(self) -> bool:
        """Check if AVIF format is supported."""
        try:
            import asyncio

            loop = asyncio.get_event_loop()
            enhanced_service = loop.run_until_complete(self._get_enhanced_service())
            return enhanced_service.is_avif_supported()
        except Exception:
            return False

    def get_supported_formats_for_inference(self) -> list[str]:
        """Get all supported image formats for inference."""
        try:
            import asyncio

            loop = asyncio.get_event_loop()
            enhanced_service = loop.run_until_complete(self._get_enhanced_service())
            return enhanced_service.get_supported_formats_for_inference()
        except Exception:
            # Fallback to basic formats
            return [
                "image/jpeg",
                "image/jpg",
                "image/png",
                "image/bmp",
                "image/tiff",
                "image/webp",
                "image/gif",
            ]

    def get_pil_image(self):
        """Get PIL.Image with plugin support."""
        try:
            import asyncio

            loop = asyncio.get_event_loop()
            enhanced_service = loop.run_until_complete(self._get_enhanced_service())
            return enhanced_service.get_pil_image()
        except Exception:
            from PIL import Image

            return Image

    def get_pil_imagedraw(self):
        """Get PIL.ImageDraw with plugin support."""
        try:
            import asyncio

            loop = asyncio.get_event_loop()
            enhanced_service = loop.run_until_complete(self._get_enhanced_service())
            return enhanced_service.get_pil_imagedraw()
        except Exception:
            from PIL import ImageDraw

            return ImageDraw

    def get_pil_imagefont(self):
        """Get PIL.ImageFont with plugin support."""
        try:
            import asyncio

            loop = asyncio.get_event_loop()
            enhanced_service = loop.run_until_complete(self._get_enhanced_service())
            return enhanced_service.get_pil_imagefont()
        except Exception:
            from PIL import ImageFont

            return ImageFont


# Global image processing service instance
_global_image_service: ImageProcessingService | None = None


async def get_image_processing_service() -> ImageProcessingService:
    """Get the global image processing service instance."""
    global _global_image_service

    if _global_image_service is None:
        _global_image_service = ImageProcessingService()
        await _global_image_service.initialize()

    return _global_image_service
