"""
Image Format Support for Reynard Backend

Format detection and validation utilities.
"""

from pathlib import Path
from typing import Optional, Set

from .image_types import ImageFormat


class ImageFormatSupport:
    """Image format support utilities."""
    
    # Supported image formats
    SUPPORTED_FORMATS = {
        '.jpg': ImageFormat('.jpg', 'image/jpeg', True),
        '.jpeg': ImageFormat('.jpeg', 'image/jpeg', True),
        '.png': ImageFormat('.png', 'image/png', True),
        '.gif': ImageFormat('.gif', 'image/gif', True),
        '.bmp': ImageFormat('.bmp', 'image/bmp', True),
        '.tiff': ImageFormat('.tiff', 'image/tiff', True),
        '.tif': ImageFormat('.tif', 'image/tiff', True),
        '.webp': ImageFormat('.webp', 'image/webp', True),
        '.jxl': ImageFormat('.jxl', 'image/jxl', False, True),
        '.avif': ImageFormat('.avif', 'image/avif', False, True)
    }
    
    @classmethod
    def get_supported_formats(cls) -> Set[str]:
        """Get supported image file extensions."""
        return {ext for ext, fmt in cls.SUPPORTED_FORMATS.items() if fmt.supported}
    
    @classmethod
    def is_supported_format(cls, extension: str) -> bool:
        """Check if a file extension is supported."""
        normalized_ext = extension.lower()
        format_info = cls.SUPPORTED_FORMATS.get(normalized_ext)
        return format_info.supported if format_info else False
    
    @classmethod
    def get_format_info(cls, extension: str) -> Optional[ImageFormat]:
        """Get format information for an extension."""
        return cls.SUPPORTED_FORMATS.get(extension.lower())
    
    @classmethod
    def validate_image_path(cls, file_path: str) -> bool:
        """Validate image file path."""
        path = file_path.lower()
        return any(path.endswith(ext) for ext in cls.SUPPORTED_FORMATS.keys())
    
    @classmethod
    def get_file_extension(cls, file_path: str) -> str:
        """Extract file extension from path."""
        path = Path(file_path)
        return path.suffix.lower()
    
    @classmethod
    def get_mime_type(cls, extension: str) -> Optional[str]:
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
        return format_ext in ['.png', '.gif', '.webp']
