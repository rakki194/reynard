"""
Enhanced Image Format Support for Reynard Backend

Format detection and validation utilities with runtime plugin detection.
"""

import logging
from pathlib import Path

from .image_types import ImageFormat

logger = logging.getLogger("uvicorn")


class ImageFormatSupport:
    """Enhanced image format support utilities with runtime plugin detection."""

    # Base supported image formats (always available)
    BASE_FORMATS = {
        ".jpg": ImageFormat(".jpg", "image/jpeg", True),
        ".jpeg": ImageFormat(".jpeg", "image/jpeg", True),
        ".png": ImageFormat(".png", "image/png", True),
        ".gif": ImageFormat(".gif", "image/gif", True),
        ".bmp": ImageFormat(".bmp", "image/bmp", True),
        ".tiff": ImageFormat(".tiff", "image/tiff", True),
        ".tif": ImageFormat(".tif", "image/tiff", True),
        ".webp": ImageFormat(".webp", "image/webp", True),
    }

    # Plugin-dependent formats
    PLUGIN_FORMATS = {
        ".jxl": ImageFormat(".jxl", "image/jxl", False, True),
        ".avif": ImageFormat(".avif", "image/avif", False, True),
    }

    # Combined formats (updated at runtime)
    SUPPORTED_FORMATS = BASE_FORMATS.copy()

    @classmethod
    def update_plugin_support(cls) -> None:
        """Update plugin support based on runtime detection."""
        try:
            # Try to get the global service instance directly
            from app.services.image_processing_service import _global_image_service

            if _global_image_service is None:
                logger.debug("No global service instance available, using fallback")
                # Fallback to plugin formats as unsupported
                cls.SUPPORTED_FORMATS.update(cls.PLUGIN_FORMATS)
                return

            # Update JXL support
            if _global_image_service.is_jxl_supported():
                cls.SUPPORTED_FORMATS[".jxl"] = ImageFormat(
                    ".jxl", "image/jxl", True, True
                )
                logger.info("JXL format support enabled")
            else:
                cls.SUPPORTED_FORMATS[".jxl"] = ImageFormat(
                    ".jxl", "image/jxl", False, True
                )
                logger.debug("JXL format support not available")

            # Update AVIF support
            if _global_image_service.is_avif_supported():
                cls.SUPPORTED_FORMATS[".avif"] = ImageFormat(
                    ".avif", "image/avif", True, True
                )
                logger.info("AVIF format support enabled")
            else:
                cls.SUPPORTED_FORMATS[".avif"] = ImageFormat(
                    ".avif", "image/avif", False, True
                )
                logger.debug("AVIF format support not available")

        except Exception as e:
            logger.warning(f"Failed to update plugin support: {e}")
            # Fallback to plugin formats as unsupported
            cls.SUPPORTED_FORMATS.update(cls.PLUGIN_FORMATS)

    @classmethod
    def get_supported_formats(cls) -> set[str]:
        """Get supported image file extensions with runtime plugin detection."""
        # Update plugin support before returning
        cls.update_plugin_support()
        return {ext for ext, fmt in cls.SUPPORTED_FORMATS.items() if fmt.supported}

    @classmethod
    def is_supported_format(cls, extension: str) -> bool:
        """Check if a file extension is supported with runtime detection."""
        normalized_ext = extension.lower()

        # For plugin formats, check runtime availability
        if normalized_ext in cls.PLUGIN_FORMATS:
            cls.update_plugin_support()

        format_info = cls.SUPPORTED_FORMATS.get(normalized_ext)
        return format_info.supported if format_info else False

    @classmethod
    def get_format_info(cls, extension: str) -> ImageFormat | None:
        """Get format information for an extension with runtime detection."""
        normalized_ext = extension.lower()

        # For plugin formats, check runtime availability
        if normalized_ext in cls.PLUGIN_FORMATS:
            cls.update_plugin_support()

        return cls.SUPPORTED_FORMATS.get(normalized_ext)

    @classmethod
    def validate_image_path(cls, file_path: str) -> bool:
        """Validate image file path with runtime plugin detection."""
        path = file_path.lower()
        extension = Path(path).suffix.lower()

        # Check if it's a plugin format and update support
        if extension in cls.PLUGIN_FORMATS:
            cls.update_plugin_support()

        return any(path.endswith(ext) for ext in cls.SUPPORTED_FORMATS.keys())

    @classmethod
    def get_file_extension(cls, file_path: str) -> str:
        """Extract file extension from path."""
        path = Path(file_path)
        return path.suffix.lower()

    @classmethod
    def get_mime_type(cls, extension: str) -> str | None:
        """Get MIME type for file extension."""
        format_info = cls.SUPPORTED_FORMATS.get(extension.lower())
        return format_info.mime_type if format_info else None

    @classmethod
    def requires_plugin(cls, extension: str) -> bool:
        """Check if format requires additional plugins."""
        format_info = cls.SUPPORTED_FORMATS.get(extension.lower())
        return format_info.requires_plugin if format_info else False

    @classmethod
    def supports_transparency(cls, extension: str) -> bool:
        """Check if image format supports transparency."""
        format_ext = extension.lower()
        return format_ext in [".png", ".gif", ".webp"]
