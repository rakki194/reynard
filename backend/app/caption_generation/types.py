"""
Caption Generation Types

This module defines enums and type definitions for the caption generation system.
"""

from enum import Enum
from typing import Any, Dict, Optional
from pathlib import Path


class CaptionType(Enum):
    """Types of captions that can be generated."""
    CAPTION = "caption"
    TAGS = "tags"
    E621 = "e621"
    TOML = "toml"


class ModelCategory(Enum):
    """Categories for caption models based on resource requirements."""
    LIGHTWEIGHT = "lightweight"  # JTP2, WDV3 - fast, small models
    HEAVY = "heavy"  # JoyCaption, Florence2 - large, slow models


class CaptionTask:
    """Represents a caption generation task."""
    
    def __init__(self, image_path: Path, generator_name: str, **kwargs):
        self.image_path = image_path
        self.generator_name = generator_name
        self.kwargs = kwargs
        self.status = "pending"
        self.result = None
        self.error = None


class CaptionResult:
    """Represents the result of a caption generation task."""
    
    def __init__(self, image_path: str, generator_name: str, success: bool = True, 
                 caption: str = None, error: str = None, error_type: str = None, 
                 retryable: bool = False, processing_time: float = None, 
                 caption_type: str = None, confidence: float = None):
        self.image_path = image_path
        self.generator_name = generator_name
        self.success = success
        self.caption = caption
        self.error = error
        self.error_type = error_type
        self.retryable = retryable
        self.processing_time = processing_time
        self.caption_type = caption_type
        self.confidence = confidence