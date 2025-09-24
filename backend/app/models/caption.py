"""Caption generation models for Reynard backend.

These models define the request/response schemas for caption generation APIs
that bridge Reynard's frontend to Yipyap's sophisticated caption services.
"""

from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class CaptionRequest(BaseModel):
    """Request model for caption generation."""

    image_path: str = Field(..., description="Path to the image file")
    generator_name: str = Field(
        ...,
        description="Name of the caption generator (jtp2, florence2, wdv3, joycaption)",
    )
    config: dict[str, Any] | None = Field(
        default_factory=dict, description="Generator configuration",
    )
    force: bool = Field(
        default=False, description="Force regeneration even if caption exists",
    )
    post_process: bool = Field(
        default=True, description="Apply post-processing to caption",
    )


class CaptionResponse(BaseModel):
    """Response model for caption generation."""

    success: bool = Field(..., description="Whether caption generation was successful")
    caption: str | None = Field(None, description="Generated caption text")
    error: str | None = Field(None, description="Error message if generation failed")
    error_type: str | None = Field(None, description="Type of error that occurred")
    retryable: bool = Field(default=False, description="Whether the error is retryable")
    processing_time: float | None = Field(
        None, description="Time taken to generate caption in seconds",
    )
    caption_type: str | None = Field(
        None, description="Type of caption generated (tags, caption, etc.)",
    )


class BatchCaptionRequest(BaseModel):
    """Request model for batch caption generation."""

    tasks: list[CaptionRequest] = Field(
        ..., description="List of caption generation tasks",
    )
    max_concurrent: int = Field(
        default=4, description="Maximum number of concurrent operations",
    )
    progress_callback: str | None = Field(
        None, description="WebSocket endpoint for progress updates",
    )


class BatchCaptionResponse(BaseModel):
    """Response model for batch caption generation."""

    success: bool = Field(..., description="Whether batch processing was successful")
    results: list[CaptionResponse] = Field(
        ..., description="Results for each caption task",
    )
    total_processed: int = Field(..., description="Total number of tasks processed")
    successful_count: int = Field(..., description="Number of successful generations")
    failed_count: int = Field(..., description="Number of failed generations")
    processing_time: float = Field(..., description="Total processing time in seconds")


class GeneratorInfo(BaseModel):
    """Information about a caption generator."""

    name: str = Field(..., description="Generator name")
    description: str = Field(..., description="Generator description")
    version: str = Field(..., description="Generator version")
    caption_type: str = Field(..., description="Type of captions generated")
    is_available: bool = Field(..., description="Whether generator is available")
    is_loaded: bool = Field(..., description="Whether generator is currently loaded")
    features: list[str] = Field(default_factory=list, description="Generator features")
    config_schema: dict[str, Any] = Field(
        default_factory=dict, description="Configuration schema",
    )


class ModelStatus(BaseModel):
    """Status information for a model."""

    model_config = ConfigDict(protected_namespaces=())

    model_id: str = Field(..., description="Model identifier")
    name: str = Field(..., description="Model name")
    type: str = Field(..., description="Model type")
    status: str = Field(..., description="Model status (loading, loaded, error, etc.)")
    is_available: bool = Field(..., description="Whether model is available")
    is_loaded: bool = Field(..., description="Whether model is currently loaded")
    config: dict[str, Any] | None = Field(None, description="Model configuration")
    error_message: str | None = Field(
        None, description="Error message if model failed to load",
    )


class ModelManagementRequest(BaseModel):
    """Request model for model management operations."""

    model_config = ConfigDict(protected_namespaces=())

    model_id: str = Field(..., description="Model identifier")
    action: str = Field(..., description="Action to perform (load, unload, download)")
    config: dict[str, Any] | None = Field(
        None, description="Model configuration for loading",
    )


class ModelManagementResponse(BaseModel):
    """Response model for model management operations."""

    model_config = ConfigDict(protected_namespaces=())

    success: bool = Field(..., description="Whether operation was successful")
    message: str = Field(..., description="Operation result message")
    model_status: ModelStatus | None = Field(None, description="Updated model status")
