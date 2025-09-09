"""
Image Types for Reynard Backend

Type definitions for the image processing system.
"""

from typing import Dict, List, Optional, Tuple


class ImageFormat:
    """Image format information."""
    
    def __init__(
        self, 
        extension: str, 
        mime_type: str, 
        supported: bool = True,
        requires_plugin: bool = False
    ):
        self.extension = extension
        self.mime_type = mime_type
        self.supported = supported
        self.requires_plugin = requires_plugin


class ImageInfo:
    """Image information."""
    
    def __init__(
        self,
        width: int,
        height: int,
        format: str,
        mode: str,
        size: int
    ):
        self.width = width
        self.height = height
        self.format = format
        self.mode = mode
        self.size = size


class ImageTransform:
    """Image transformation configuration."""
    
    def __init__(
        self,
        resize: Optional[Tuple[int, int]] = None,
        crop: Optional[Tuple[int, int, int, int]] = None,
        normalize: Optional[Dict[str, List[float]]] = None,
        convert: Optional[str] = None
    ):
        self.resize = resize
        self.crop = crop
        self.normalize = normalize
        self.convert = convert
