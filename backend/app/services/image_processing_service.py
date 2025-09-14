"""
Enhanced Image Processing Service for Reynard Backend

This service provides sophisticated image processing capabilities with plugin support,
combining the best of Yipyap's plugin management with Reynard's clean architecture.
"""

import logging
from typing import Dict, Any, List, Set, Optional
from datetime import datetime, timezone

logger = logging.getLogger("uvicorn")


class ImageProcessingService:
    """
    Enhanced image processing service with sophisticated plugin management.

    This service handles the initialization and lifecycle management of image
    processing plugins including pillow-jxl and pillow-avif support with
    comprehensive fallback mechanisms and runtime detection.
    """

    def __init__(self):
        """Initialize the image processing service."""
        self._pillow_jxl_available = False
        self._pillow_avif_available = False
        self._supported_formats: Set[str] = set()
        self._format_info: Dict[str, Dict[str, Any]] = {}
        self._initialized = False
        self._startup_time: Optional[datetime] = None
        self._last_health_check: Optional[datetime] = None

    async def initialize(self) -> bool:
        """Initialize the image processing service with plugin detection."""
        try:
            logger.info("Initializing enhanced image processing service")
            self._startup_time = datetime.now(timezone.utc)

            # Try to load pillow-jxl plugin with multiple fallback strategies
            await self._load_pillow_jxl_plugin()

            # Try to load pillow-avif plugin with multiple fallback strategies
            await self._load_pillow_avif_plugin()

            # Initialize supported formats
            self._initialize_supported_formats()

            self._initialized = True

            logger.info(
                f"Image processing service initialized - JXL: {self._pillow_jxl_available}, "
                f"AVIF: {self._pillow_avif_available}, "
                f"Total formats: {len(self._supported_formats)}"
            )
            return True

        except Exception as e:
            logger.error(f"Failed to initialize image processing service: {e}")
            return False

    async def _load_pillow_jxl_plugin(self) -> None:
        """Load pillow-jxl plugin with multiple fallback strategies."""
        # Strategy 1: Direct import
        try:
            import pillow_jxl

            self._pillow_jxl_available = True
            logger.info("pillow-jxl loaded successfully via direct import")
            return
        except ImportError:
            logger.debug("Direct pillow_jxl import failed, trying fallback strategies")

        # Strategy 2: Try importing with plugin registration
        try:
            import pillow_jxl

            # Ensure plugin is registered with PIL
            from PIL import Image

            # Test if JXL format is recognized
            if hasattr(Image, "open") and "JXL" in Image.registered_extensions():
                self._pillow_jxl_available = True
                logger.info("pillow-jxl loaded and registered with PIL")
                return
        except (ImportError, AttributeError):
            logger.debug("PIL registration check failed for pillow_jxl")

        # Strategy 3: Graceful degradation
        self._pillow_jxl_available = False
        logger.warning("pillow-jxl not available - JXL images will not be supported")

    async def _load_pillow_avif_plugin(self) -> None:
        """Load pillow-avif plugin with multiple fallback strategies."""
        # Strategy 1: Direct import
        try:
            import pillow_avif

            self._pillow_avif_available = True
            logger.info("pillow-avif loaded successfully via direct import")
            return
        except ImportError:
            logger.debug("Direct pillow_avif import failed, trying fallback strategies")

        # Strategy 2: Try importing with plugin registration
        try:
            import pillow_avif

            # Ensure plugin is registered with PIL
            from PIL import Image

            # Test if AVIF format is recognized
            if hasattr(Image, "open") and "AVIF" in Image.registered_extensions():
                self._pillow_avif_available = True
                logger.info("pillow-avif loaded and registered with PIL")
                return
        except (ImportError, AttributeError):
            logger.debug("PIL registration check failed for pillow_avif")

        # Strategy 3: Graceful degradation
        self._pillow_avif_available = False
        logger.warning("pillow-avif not available - AVIF images will not be supported")

    async def shutdown(self) -> None:
        """Shutdown the image processing service."""
        logger.info("Shutting down image processing service")
        self._pillow_jxl_available = False
        self._pillow_avif_available = False
        self._supported_formats.clear()
        self._format_info.clear()
        self._initialized = False

    async def health_check(self) -> bool:
        """Perform health check for the image processing service."""
        try:
            self._last_health_check = datetime.now(timezone.utc)

            # Basic health check - verify PIL is still available
            from PIL import Image

            # Re-check plugin availability
            await self._verify_plugin_availability()

            return True
        except Exception as e:
            logger.error(f"Image processing service health check failed: {e}")
            return False

    async def _verify_plugin_availability(self) -> None:
        """Verify plugin availability and update status."""
        # Re-check JXL availability
        try:
            import pillow_jxl

            if not self._pillow_jxl_available:
                logger.info("pillow-jxl became available, updating status")
                self._pillow_jxl_available = True
                self._initialize_supported_formats()
        except ImportError:
            if self._pillow_jxl_available:
                logger.warning("pillow-jxl became unavailable, updating status")
                self._pillow_jxl_available = False
                self._initialize_supported_formats()

        # Re-check AVIF availability
        try:
            import pillow_avif

            if not self._pillow_avif_available:
                logger.info("pillow-avif became available, updating status")
                self._pillow_avif_available = True
                self._initialize_supported_formats()
        except ImportError:
            if self._pillow_avif_available:
                logger.warning("pillow-avif became unavailable, updating status")
                self._pillow_avif_available = False
                self._initialize_supported_formats()

    def get_info(self) -> Dict[str, Any]:
        """Get comprehensive service information."""
        return {
            "name": "image_processing",
            "initialized": self._initialized,
            "pillow_jxl_available": self._pillow_jxl_available,
            "pillow_avif_available": self._pillow_avif_available,
            "supported_formats": list(self._supported_formats),
            "format_info": self._format_info,
            "startup_time": (
                self._startup_time.isoformat() if self._startup_time else None
            ),
            "last_health_check": (
                self._last_health_check.isoformat() if self._last_health_check else None
            ),
        }

    def is_jxl_supported(self) -> bool:
        """Check if JXL format is supported."""
        return self._pillow_jxl_available

    def is_avif_supported(self) -> bool:
        """Check if AVIF format is supported."""
        return self._pillow_avif_available

    def get_supported_formats(self) -> Set[str]:
        """Get set of supported image formats."""
        return self._supported_formats.copy()

    def get_format_info(self) -> Dict[str, Dict[str, Any]]:
        """Get detailed information about supported formats."""
        return self._format_info.copy()

    def get_supported_formats_for_inference(self) -> List[str]:
        """Get all supported image formats for inference scripts."""
        formats = [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/bmp",
            "image/tiff",
            "image/webp",
            "image/gif",
        ]

        # Add JXL support if available
        if self.is_jxl_supported():
            formats.append("image/jxl")

        # Add AVIF support if available
        if self.is_avif_supported():
            formats.append("image/avif")

        return formats

    def get_pil_image(self):
        """Get PIL.Image with plugin support and fallback mechanisms."""
        from PIL import Image

        # Ensure plugins are loaded and registered with PIL
        if self._pillow_jxl_available:
            try:
                import pillow_jxl

                # Import to ensure plugin is registered
                _ = pillow_jxl
                logger.debug("pillow_jxl plugin imported and registered with PIL")
            except ImportError as e:
                logger.warning(f"Failed to import pillow_jxl plugin: {e}")
                self._pillow_jxl_available = False

        if self._pillow_avif_available:
            try:
                import pillow_avif

                # Import to ensure plugin is registered
                _ = pillow_avif
                logger.debug("pillow_avif plugin imported and registered with PIL")
            except ImportError as e:
                logger.warning(f"Failed to import pillow_avif plugin: {e}")
                self._pillow_avif_available = False

        return Image

    def get_pil_imagedraw(self):
        """Get PIL.ImageDraw with plugin support."""
        from PIL import ImageDraw

        return ImageDraw

    def get_pil_imagefont(self):
        """Get PIL.ImageFont with plugin support."""
        from PIL import ImageFont

        return ImageFont

    def _initialize_supported_formats(self) -> None:
        """Initialize the set of supported image formats with comprehensive metadata."""
        # Standard formats always supported by Pillow
        standard_formats = {
            ".jpg",
            ".jpeg",
            ".png",
            ".gif",
            ".bmp",
            ".tiff",
            ".tif",
            ".webp",
        }

        self._supported_formats = standard_formats.copy()
        self._format_info.clear()

        # Add format info for standard formats
        for fmt in standard_formats:
            self._format_info[fmt] = {
                "name": fmt[1:].upper(),  # Remove dot and uppercase
                "supported": True,
                "plugin_required": False,
                "description": f"Standard {fmt[1:].upper()} format",
                "mime_type": self._get_mime_type(fmt),
                "supports_animation": fmt in {".gif", ".webp"},
                "supports_alpha": fmt in {".png", ".gif", ".webp"},
            }

        # Add JXL support if available
        if self._pillow_jxl_available:
            self._supported_formats.add(".jxl")
            self._format_info[".jxl"] = {
                "name": "JXL",
                "supported": True,
                "plugin_required": True,
                "plugin_name": "pillow-jxl",
                "description": "JPEG XL format with pillow-jxl plugin",
                "mime_type": "image/jxl",
                "supports_animation": True,
                "supports_alpha": True,
                "default_quality": 90,
                "default_effort": 7,
                "compression_levels": list(range(0, 10)),
            }

        # Add AVIF support if available
        if self._pillow_avif_available:
            self._supported_formats.add(".avif")
            self._format_info[".avif"] = {
                "name": "AVIF",
                "supported": True,
                "plugin_required": True,
                "plugin_name": "pillow-avif",
                "description": "AV1 Image File Format with pillow-avif plugin",
                "mime_type": "image/avif",
                "supports_animation": True,
                "supports_alpha": True,
                "default_quality": 80,
                "compression_levels": list(range(0, 10)),
            }

    def _get_mime_type(self, extension: str) -> str:
        """Get MIME type for an extension."""
        mime_types = {
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
            ".png": "image/png",
            ".gif": "image/gif",
            ".bmp": "image/bmp",
            ".tiff": "image/tiff",
            ".tif": "image/tiff",
            ".webp": "image/webp",
        }
        return mime_types.get(extension, "application/octet-stream")


# Global image processing service instance
_global_image_service: Optional[ImageProcessingService] = None


async def get_image_processing_service() -> ImageProcessingService:
    """Get the global image processing service instance."""
    global _global_image_service

    if _global_image_service is None:
        _global_image_service = ImageProcessingService()
        await _global_image_service.initialize()

    return _global_image_service


async def initialize_image_processing_service() -> bool:
    """Initialize the global image processing service."""
    global _global_image_service

    if _global_image_service is None:
        _global_image_service = ImageProcessingService()

    return await _global_image_service.initialize()


async def shutdown_image_processing_service() -> None:
    """Shutdown the global image processing service."""
    global _global_image_service

    if _global_image_service is not None:
        await _global_image_service.shutdown()
        _global_image_service = None
