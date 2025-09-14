"""
Enhanced Image Format Converter for Reynard Backend

Comprehensive image format conversion with optimization and validation,
supporting multiple input and output formats with format-specific
optimization settings and quality controls.
"""

import logging
from typing import Dict, Any, Optional, List
from pathlib import Path

logger = logging.getLogger("uvicorn")

# Import the global service for plugin support checking
try:
    from app.services.image_processing_service import _global_image_service
except ImportError:
    _global_image_service = None


class FormatConversionError(Exception):
    """Base exception for format conversion errors."""

    pass


class UnsupportedFormatError(FormatConversionError):
    """Exception raised when a format is not supported."""

    pass


class ImageFormatConverter:
    """
    Handles image format conversion with optimization and validation.

    This class provides comprehensive image format conversion capabilities,
    supporting multiple input and output formats with format-specific
    optimization settings and quality controls.
    """

    def __init__(self):
        """Initialize the image format converter."""
        self.supported_formats = {
            "webp": {
                "extensions": [".webp"],
                "mime_type": "image/webp",
                "supports_animation": True,
                "supports_alpha": True,
                "default_quality": 80,
                "default_method": 4,
                "compression_levels": list(range(0, 7)),
            },
            "png": {
                "extensions": [".png"],
                "mime_type": "image/png",
                "supports_animation": True,  # APNG
                "supports_alpha": True,
                "default_quality": 95,
                "optimize": True,
                "compression_levels": list(range(0, 10)),
            },
            "jpeg": {
                "extensions": [".jpg", ".jpeg"],
                "mime_type": "image/jpeg",
                "supports_animation": False,
                "supports_alpha": False,
                "default_quality": 85,
                "optimize": True,
                "progressive": True,
            },
            "jxl": {
                "extensions": [".jxl"],
                "mime_type": "image/jxl",
                "supports_animation": True,
                "supports_alpha": True,
                "default_quality": 90,
                "default_effort": 7,
                "compression_levels": list(range(0, 10)),
            },
            "avif": {
                "extensions": [".avif"],
                "mime_type": "image/avif",
                "supports_animation": True,
                "supports_alpha": True,
                "default_quality": 80,
                "compression_levels": list(range(0, 10)),
            },
            "gif": {
                "extensions": [".gif"],
                "mime_type": "image/gif",
                "supports_animation": True,
                "supports_alpha": True,
                "default_quality": 75,
                "optimize": True,
            },
            "bmp": {
                "extensions": [".bmp"],
                "mime_type": "image/bmp",
                "supports_animation": False,
                "supports_alpha": False,
                "default_quality": 100,
            },
            "tiff": {
                "extensions": [".tiff", ".tif"],
                "mime_type": "image/tiff",
                "supports_animation": False,
                "supports_alpha": True,
                "default_quality": 95,
                "compression": "lzw",
            },
        }

        # Check for optional format support
        self._check_optional_formats()

    def _check_optional_formats(self) -> None:
        """Check for optional format support and update supported formats."""
        self._check_jxl_support()
        self._check_avif_support()

    def _check_jxl_support(self) -> None:
        """Check JXL plugin support."""
        try:
            if _global_image_service is None:
                logger.debug("No global service instance available, removing JXL support")
                if "jxl" in self.supported_formats:
                    del self.supported_formats["jxl"]
                return

            if not _global_image_service.is_jxl_supported():
                logger.debug(
                    "JXL format support not available (pillow-jxl not installed)"
                )
                if "jxl" in self.supported_formats:
                    del self.supported_formats["jxl"]
            else:
                logger.debug("JXL format support available via pillow-jxl")

        except Exception as e:
            logger.debug(f"Failed to check JXL support: {e}")
            if "jxl" in self.supported_formats:
                del self.supported_formats["jxl"]

    def _check_avif_support(self) -> None:
        """Check AVIF plugin support."""
        try:
            if _global_image_service is None:
                logger.debug("No global service instance available, removing AVIF support")
                if "avif" in self.supported_formats:
                    del self.supported_formats["avif"]
                return

            if not _global_image_service.is_avif_supported():
                logger.debug(
                    "AVIF format support not available (pillow-avif not installed)"
                )
                if "avif" in self.supported_formats:
                    del self.supported_formats["avif"]
            else:
                logger.debug("AVIF format support available via pillow-avif")

        except Exception as e:
            logger.debug(f"Failed to check AVIF support: {e}")
            if "avif" in self.supported_formats:
                del self.supported_formats["avif"]

    def get_supported_formats(self) -> Dict[str, Dict[str, Any]]:
        """
        Get dictionary of supported formats and their capabilities.

        Returns:
            Dictionary mapping format names to their capabilities
        """
        return self.supported_formats.copy()

    def is_format_supported(self, format_name: str) -> bool:
        """
        Check if a format is supported for conversion.

        Args:
            format_name: Format name (e.g., 'webp', 'png', 'jpeg')

        Returns:
            True if format is supported, False otherwise
        """
        return format_name.lower() in self.supported_formats

    def get_format_info(self, format_name: str) -> Optional[Dict[str, Any]]:
        """
        Get detailed information about a specific format.

        Args:
            format_name: Format name (e.g., 'webp', 'png', 'jpeg')

        Returns:
            Dictionary with format information or None if not supported
        """
        return self.supported_formats.get(format_name.lower())

    def get_conversion_options(self, format_name: str) -> Dict[str, Any]:
        """
        Get conversion options for a specific format.

        Args:
            format_name: Format name (e.g., 'webp', 'png', 'jpeg')

        Returns:
            Dictionary with conversion options
        """
        format_info = self.get_format_info(format_name)
        if not format_info:
            raise UnsupportedFormatError(f"Format '{format_name}' is not supported")

        options = {}

        # Add quality setting if supported
        if "default_quality" in format_info:
            options["quality"] = format_info["default_quality"]

        # Add method setting for WebP
        if format_name.lower() == "webp" and "default_method" in format_info:
            options["method"] = format_info["default_method"]

        # Add effort setting for JXL
        if format_name.lower() == "jxl" and "default_effort" in format_info:
            options["effort"] = format_info["default_effort"]

        # Add optimization settings
        if format_info.get("optimize", False):
            options["optimize"] = True

        # Add progressive setting for JPEG
        if format_name.lower() == "jpeg" and format_info.get("progressive", False):
            options["progressive"] = True

        # Add compression setting for TIFF
        if format_name.lower() == "tiff" and "compression" in format_info:
            options["compression"] = format_info["compression"]

        return options

    def validate_conversion(self, input_format: str, output_format: str) -> bool:
        """
        Validate if conversion from input to output format is supported.

        Args:
            input_format: Input format name
            output_format: Output format name

        Returns:
            True if conversion is supported, False otherwise
        """
        if not self.is_format_supported(input_format):
            logger.warning(f"Input format '{input_format}' is not supported")
            return False

        if not self.is_format_supported(output_format):
            logger.warning(f"Output format '{output_format}' is not supported")
            return False

        # Check for specific conversion limitations
        input_info = self.get_format_info(input_format)
        output_info = self.get_format_info(output_format)

        # Check alpha channel support
        if input_info.get("supports_alpha", False) and not output_info.get(
            "supports_alpha", False
        ):
            logger.warning(
                f"Converting from {input_format} (with alpha) to {output_format} (no alpha) may lose transparency"
            )

        # Check animation support
        if input_info.get("supports_animation", False) and not output_info.get(
            "supports_animation", False
        ):
            logger.warning(
                f"Converting from {input_format} (animated) to {output_format} (not animated) may lose animation"
            )

        return True

    def get_optimal_format(self, requirements: Dict[str, Any]) -> Optional[str]:
        """
        Get the optimal format based on requirements.

        Args:
            requirements: Dictionary with requirements like:
                - needs_alpha: bool
                - needs_animation: bool
                - quality_priority: str ('high', 'medium', 'low')
                - size_priority: str ('small', 'medium', 'large')

        Returns:
            Recommended format name or None if no suitable format found
        """
        candidates = []

        for format_name, format_info in self.supported_formats.items():
            score = self._calculate_format_score(format_name, format_info, requirements)
            if score >= 0:  # -1 means format doesn't meet requirements
                candidates.append((format_name, score))

        if not candidates:
            return None

        # Return format with highest score
        candidates.sort(key=lambda x: x[1], reverse=True)
        return candidates[0][0]

    def _calculate_format_score(
        self, format_name: str, format_info: Dict[str, Any], requirements: Dict[str, Any]
    ) -> int:
        """Calculate score for a format based on requirements."""
        score = 0

        # Check alpha support
        if requirements.get("needs_alpha", False):
            if format_info.get("supports_alpha", False):
                score += 10
            else:
                return -1  # Format doesn't meet requirements

        # Check animation support
        if requirements.get("needs_animation", False):
            if format_info.get("supports_animation", False):
                score += 10
            else:
                return -1  # Format doesn't meet requirements

        # Quality priority scoring
        score += self._score_quality_priority(format_info, requirements)

        # Size priority scoring
        score += self._score_size_priority(format_info, requirements)

        return score

    def _score_quality_priority(
        self, format_info: Dict[str, Any], requirements: Dict[str, Any]
    ) -> int:
        """Score format based on quality priority."""
        quality_priority = requirements.get("quality_priority", "medium")
        default_quality = format_info.get("default_quality", 80)

        if quality_priority == "high" and default_quality >= 90:
            return 5
        elif quality_priority == "medium" and 70 <= default_quality < 90:
            return 5
        elif quality_priority == "low" and default_quality < 70:
            return 5
        return 0

    def _score_size_priority(
        self, format_info: Dict[str, Any], requirements: Dict[str, Any]
    ) -> int:
        """Score format based on size priority."""
        size_priority = requirements.get("size_priority", "medium")
        default_quality = format_info.get("default_quality", 80)

        if size_priority == "small" and default_quality <= 80:
            return 5
        elif size_priority == "medium" and 70 <= default_quality <= 95:
            return 5
        elif size_priority == "large" and default_quality >= 90:
            return 5
        return 0

    def get_file_extension(self, format_name: str) -> str:
        """
        Get the primary file extension for a format.

        Args:
            format_name: Format name

        Returns:
            Primary file extension (e.g., '.jpg', '.png')
        """
        format_info = self.get_format_info(format_name)
        if not format_info:
            raise UnsupportedFormatError(f"Format '{format_name}' is not supported")

        extensions = format_info.get("extensions", [])
        return extensions[0] if extensions else f".{format_name}"

    def get_mime_type(self, format_name: str) -> str:
        """
        Get the MIME type for a format.

        Args:
            format_name: Format name

        Returns:
            MIME type (e.g., 'image/jpeg', 'image/png')
        """
        format_info = self.get_format_info(format_name)
        if not format_info:
            raise UnsupportedFormatError(f"Format '{format_name}' is not supported")

        return format_info.get("mime_type", "application/octet-stream")


# Global format converter instance
_global_format_converter: Optional[ImageFormatConverter] = None


def get_format_converter() -> ImageFormatConverter:
    """Get the global format converter instance."""
    global _global_format_converter

    if _global_format_converter is None:
        _global_format_converter = ImageFormatConverter()

    return _global_format_converter
