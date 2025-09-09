"""
Image Processing Service for Reynard Backend

Service for managing image processing capabilities with plugin support.
"""

import logging
from typing import List, Optional, Set

from .image_utils_core import ImageUtils

logger = logging.getLogger("uvicorn")


class ImageProcessingService:
    """Image processing service with plugin support."""
    
    def __init__(self):
        self._pillow_jxl_available = False
        self._pillow_avif_available = False
        self._supported_formats: Set[str] = set()
        self._format_info: Dict[str, Dict[str, any]] = {}
    
    async def initialize(self) -> bool:
        """Initialize the image processing service."""
        try:
            logger.info("Initializing image processing service")
            
            # Try to load pillow-jxl plugin
            try:
                import pillow_jxl
                self._pillow_jxl_available = True
                logger.info("pillow-jxl loaded and available for JXL image support")
            except ImportError:
                self._pillow_jxl_available = False
                logger.warning("pillow-jxl not available - JXL images will not be supported")
            
            # Try to load pillow-avif plugin
            try:
                import pillow_avif
                self._pillow_avif_available = True
                logger.info("pillow-avif loaded and available for AVIF image support")
            except ImportError:
                self._pillow_avif_available = False
                logger.warning("pillow-avif not available - AVIF images will not be supported")
            
            # Initialize supported formats
            self._initialize_supported_formats()
            
            logger.info(
                f"Image processing service initialized - JXL: {self._pillow_jxl_available}, "
                f"AVIF: {self._pillow_avif_available}, "
                f"Total formats: {len(self._supported_formats)}"
            )
            return True
            
        except Exception as e:
            logger.error(f"Failed to initialize image processing service: {e}")
            return False
    
    def _initialize_supported_formats(self):
        """Initialize supported formats based on available plugins."""
        # Base formats
        self._supported_formats = {
            'image/jpeg', 'image/jpg', 'image/png', 'image/bmp', 
            'image/tiff', 'image/webp', 'image/gif'
        }
        
        # Add plugin-specific formats
        if self._pillow_jxl_available:
            self._supported_formats.add('image/jxl')
        
        if self._pillow_avif_available:
            self._supported_formats.add('image/avif')
    
    def is_jxl_supported(self) -> bool:
        """Check if JXL format is supported."""
        return self._pillow_jxl_available
    
    def is_avif_supported(self) -> bool:
        """Check if AVIF format is supported."""
        return self._pillow_avif_available
    
    def get_supported_formats_for_inference(self) -> List[str]:
        """Get all supported image formats for inference."""
        return list(self._supported_formats)
    
    def get_pil_image(self):
        """Get PIL.Image with plugin support."""
        from PIL import Image
        return Image
    
    def get_pil_imagedraw(self):
        """Get PIL.ImageDraw with plugin support."""
        from PIL import ImageDraw
        return ImageDraw
    
    def get_pil_imagefont(self):
        """Get PIL.ImageFont with plugin support."""
        from PIL import ImageFont
        return ImageFont


# Global image processing service instance
_global_image_service: Optional[ImageProcessingService] = None


async def get_image_processing_service() -> ImageProcessingService:
    """Get the global image processing service instance."""
    global _global_image_service
    
    if _global_image_service is None:
        _global_image_service = ImageProcessingService()
        await _global_image_service.initialize()
    
    return _global_image_service
