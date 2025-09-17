"""
ComfyUI Service Models

Pydantic models for ComfyUI API requests and responses.
"""

from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class ComfyQueueRequest(BaseModel):
    """Request model for queueing a ComfyUI workflow."""

    workflow: dict[str, Any] = Field(..., description="ComfyUI workflow definition")
    client_id: str | None = Field(None, description="Optional client identifier")


class ComfyQueueResponse(BaseModel):
    """Response model for queued workflow."""

    prompt_id: str = Field(..., description="Unique prompt identifier")
    client_id: str | None = Field(None, description="Client identifier if provided")


class ComfyStatusResponse(BaseModel):
    """Response model for workflow status."""

    status: str = Field(
        ..., description="Current status: pending, processing, completed, error"
    )
    progress: float = Field(0.0, ge=0.0, le=1.0, description="Progress from 0.0 to 1.0")
    images: list[dict[str, Any]] = Field(
        default_factory=list, description="Generated images"
    )
    error: str | None = Field(None, description="Error message if failed")
    message: str | None = Field(None, description="Status message")


class ComfyImageRequest(BaseModel):
    """Request model for retrieving generated images."""

    filename: str = Field(..., description="Image filename")
    subfolder: str = Field("", description="Image subfolder")
    type: str = Field("output", description="Image type (output, input, temp)")


class ComfyText2ImgRequest(BaseModel):
    """Request model for text-to-image generation."""

    caption: str = Field(..., description="Positive prompt")
    negative: str | None = Field(None, description="Negative prompt")
    width: int | None = Field(1024, ge=64, le=4096, description="Image width")
    height: int | None = Field(1024, ge=64, le=4096, description="Image height")
    checkpoint: str | None = Field(None, description="Model checkpoint")
    loras: list[str] | None = Field(None, description="LoRA models to apply")
    lora_weights: list[float] | None = Field(None, description="LoRA weights")
    sampler: str | None = Field(None, description="Sampling method")
    scheduler: str | None = Field(None, description="Scheduler type")
    steps: int | None = Field(24, ge=1, le=150, description="Sampling steps")
    cfg: float | None = Field(5.5, ge=0.1, le=20.0, description="CFG scale")
    seed: int | None = Field(None, ge=0, description="Random seed")
    pag: bool | None = Field(None, description="Enable PAG")
    deepshrink: bool | None = Field(None, description="Enable DeepShrink")
    detail_daemon: bool | None = Field(None, description="Enable Detail Daemon")
    split_sigmas: bool | None = Field(None, description="Enable Split Sigmas")


class ComfyWorkflowRequest(BaseModel):
    """Request model for custom workflow execution."""

    workflow: dict[str, Any] = Field(..., description="Custom workflow definition")
    parameters: dict[str, Any] | None = Field(None, description="Workflow parameters")


class ComfyValidationResponse(BaseModel):
    """Response model for validation results."""

    is_valid: bool = Field(..., description="Whether the input is valid")
    suggestions: list[str] = Field(
        default_factory=list, description="Alternative suggestions"
    )
    errors: list[str] = Field(default_factory=list, description="Validation errors")


class ComfyObjectInfoResponse(BaseModel):
    """Response model for ComfyUI object information."""

    object_info: dict[str, Any] = Field(..., description="ComfyUI object information")
    etag: str | None = Field(None, description="Cache ETag for validation")


class ComfyPresetRequest(BaseModel):
    """Request model for creating/updating presets."""

    name: str = Field(..., description="Preset name")
    description: str | None = Field(None, description="Preset description")
    category: str | None = Field("General", description="Preset category")
    workflow: dict[str, Any] = Field(..., description="Preset workflow")
    parameters: dict[str, Any] | None = Field(None, description="Preset parameters")
    is_default: bool | None = Field(
        False, description="Whether this is the default preset"
    )


class ComfyPresetResponse(BaseModel):
    """Response model for preset operations."""

    name: str = Field(..., description="Preset name")
    description: str | None = Field(None, description="Preset description")
    category: str = Field(..., description="Preset category")
    workflow: dict[str, Any] = Field(..., description="Preset workflow")
    parameters: dict[str, Any] | None = Field(None, description="Preset parameters")
    is_default: bool = Field(False, description="Whether this is the default preset")
    created_at: datetime | None = Field(None, description="Creation timestamp")
    updated_at: datetime | None = Field(None, description="Last update timestamp")
    created_by: str | None = Field(None, description="Creator username")


class ComfyWorkflowTemplateRequest(BaseModel):
    """Request model for workflow templates."""

    name: str = Field(..., description="Template name")
    description: str = Field(..., description="Template description")
    category: str = Field(..., description="Template category")
    workflow: dict[str, Any] = Field(..., description="Template workflow")
    author: str | None = Field(None, description="Template author")
    tags: list[str] | None = Field(None, description="Template tags")
    parameters: dict[str, Any] | None = Field(None, description="Template parameters")
    visibility: str | None = Field("private", description="Template visibility")
    parent_template_id: str | None = Field(
        None, description="Parent template ID for branches"
    )
    branch_name: str | None = Field(None, description="Branch name")
    is_community: bool | None = Field(
        False, description="Whether this is a community template"
    )


class ComfyWorkflowTemplateResponse(BaseModel):
    """Response model for workflow templates."""

    id: str = Field(..., description="Template ID")
    name: str = Field(..., description="Template name")
    description: str = Field(..., description="Template description")
    category: str = Field(..., description="Template category")
    workflow: dict[str, Any] = Field(..., description="Template workflow")
    author: str = Field(..., description="Template author")
    tags: list[str] = Field(default_factory=list, description="Template tags")
    parameters: dict[str, Any] | None = Field(None, description="Template parameters")
    visibility: str = Field(..., description="Template visibility")
    parent_template_id: str | None = Field(None, description="Parent template ID")
    branch_name: str | None = Field(None, description="Branch name")
    is_community: bool = Field(
        False, description="Whether this is a community template"
    )
    usage_count: int = Field(0, description="Usage count")
    rating: float | None = Field(None, description="Average rating")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")


class ComfyQueueStatusResponse(BaseModel):
    """Response model for queue status."""

    queue_running: bool = Field(..., description="Whether the queue is running")
    queue_remaining: int = Field(..., description="Number of items remaining in queue")
    queue_paused: bool = Field(..., description="Whether the queue is paused")
    queue_size: int = Field(..., description="Total queue size")


class ComfyQueueItemResponse(BaseModel):
    """Response model for queue items."""

    prompt_id: str = Field(..., description="Prompt ID")
    status: str = Field(..., description="Item status")
    progress: float = Field(0.0, ge=0.0, le=1.0, description="Progress from 0.0 to 1.0")
    timestamp: int = Field(..., description="Timestamp")
    workflow: dict[str, Any] | None = Field(None, description="Workflow definition")
    client_id: str | None = Field(None, description="Client ID")


class ComfyHealthResponse(BaseModel):
    """Response model for health checks."""

    enabled: bool = Field(..., description="Whether ComfyUI integration is enabled")
    status: str = Field(..., description="Service status: ok, error, disabled")
    connection_state: str | None = Field(None, description="Connection state")
    connection_attempts: int | None = Field(None, description="Connection attempts")
    base_url: str | None = Field(None, description="ComfyUI base URL")
    service: dict[str, Any] | None = Field(None, description="Service information")


class ComfyIngestRequest(BaseModel):
    """Request model for ingesting generated images."""

    prompt_id: str = Field(..., description="Prompt ID")
    workflow: dict[str, Any] = Field(..., description="Workflow definition")
    metadata: dict[str, Any] = Field(
        default_factory=dict, description="Additional metadata"
    )


class ComfyIngestResponse(BaseModel):
    """Response model for image ingestion."""

    success: bool = Field(..., description="Whether ingestion was successful")
    image_path: str | None = Field(None, description="Path to ingested image")
    metadata_path: str | None = Field(None, description="Path to metadata file")
    deduplicated: bool = Field(False, description="Whether image was deduplicated")
    message: str = Field(..., description="Result message")
