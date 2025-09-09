"""
Pydantic models for Caption API.

This module defines the request/response models for caption generation operations
with proper validation and documentation.
"""

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class CaptionRequest(BaseModel):
    """Request model for single caption generation."""
    
    image_path: str = Field(..., description="Path to the image file")
    generator_name: str = Field(..., description="Name of the caption generator")
    config: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Generator configuration")
    force: bool = Field(default=False, description="Force regeneration even if caption exists")
    post_process: bool = Field(default=True, description="Apply post-processing to caption")


class BatchCaptionRequest(BaseModel):
    """Request model for batch caption generation."""
    
    tasks: List[CaptionRequest] = Field(..., description="List of caption generation tasks")
    max_concurrent: int = Field(default=4, description="Maximum number of concurrent operations")


class CaptionResponse(BaseModel):
    """Response model for caption generation."""
    
    success: bool
    image_path: str
    generator_name: str
    caption: Optional[str] = None
    error: Optional[str] = None
    error_type: Optional[str] = None
    retryable: bool = False
    processing_time: Optional[float] = None
    caption_type: Optional[str] = None


class GeneratorInfo(BaseModel):
    """Information about a caption generator."""
    
    model_config = {"protected_namespaces": ()}
    
    name: str
    description: str
    version: str
    caption_type: str
    is_available: bool
    is_loaded: bool
    config_schema: Dict[str, Any]
    features: List[str]
    model_category: str


class ModelLoadRequest(BaseModel):
    """Request model for loading a caption model."""
    
    config: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Model configuration")
