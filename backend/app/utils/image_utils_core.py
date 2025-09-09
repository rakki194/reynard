"""
Image Utils Core for Reynard Backend

Main ImageUtils class that combines format support and processing utilities.
"""

from .image_formats import ImageFormatSupport
from .image_processing import ImageProcessing


class ImageUtils:
    """Image processing utilities combining format support and processing."""
    
    # Delegate format operations to ImageFormatSupport
    get_supported_formats = ImageFormatSupport.get_supported_formats
    is_supported_format = ImageFormatSupport.is_supported_format
    get_format_info = ImageFormatSupport.get_format_info
    validate_image_path = ImageFormatSupport.validate_image_path
    get_file_extension = ImageFormatSupport.get_file_extension
    get_mime_type = ImageFormatSupport.get_mime_type
    requires_plugin = ImageFormatSupport.requires_plugin
    supports_transparency = ImageFormatSupport.supports_transparency
    
    # Delegate processing operations to ImageProcessing
    validate_dimensions = ImageProcessing.validate_dimensions
    get_aspect_ratio = ImageProcessing.get_aspect_ratio
    calculate_resize_dimensions = ImageProcessing.calculate_resize_dimensions
    generate_filename = ImageProcessing.generate_filename
    get_default_normalization = ImageProcessing.get_default_normalization
    create_transform = ImageProcessing.create_transform
