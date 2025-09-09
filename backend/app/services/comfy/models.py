"""
ComfyUI Service Models

Pydantic models for ComfyUI API requests and responses.
"""

from typing import Any, Dict, List, Optional, Union
from pydantic import BaseModel, Field
from datetime import datetime


class ComfyQueueRequest(BaseModel):
    """Request model for queueing a ComfyUI workflow."""
    workflow: Dict[str, Any] = Field(..., description="ComfyUI workflow definition")
    client_id: Optional[str] = Field(None, description="Optional client identifier")


class ComfyQueueResponse(BaseModel):
    """Response model for queued workflow."""
    prompt_id: str = Field(..., description="Unique prompt identifier")
    client_id: Optional[str] = Field(None, description="Client identifier if provided")


class ComfyStatusResponse(BaseModel):
    """Response model for workflow status."""
    status: str = Field(..., description="Current status: pending, processing, completed, error")
    progress: float = Field(0.0, ge=0.0, le=1.0, description="Progress from 0.0 to 1.0")
    images: List[Dict[str, Any]] = Field(default_factory=list, description="Generated images")
    error: Optional[str] = Field(None, description="Error message if failed")
    message: Optional[str] = Field(None, description="Status message")


class ComfyImageRequest(BaseModel):
    """Request model for retrieving generated images."""
    filename: str = Field(..., description="Image filename")
    subfolder: str = Field("", description="Image subfolder")
    type: str = Field("output", description="Image type (output, input, temp)")


class ComfyText2ImgRequest(BaseModel):
    """Request model for text-to-image generation."""
    caption: str = Field(..., description="Positive prompt")
    negative: Optional[str] = Field(None, description="Negative prompt")
    width: Optional[int] = Field(1024, ge=64, le=4096, description="Image width")
    height: Optional[int] = Field(1024, ge=64, le=4096, description="Image height")
    checkpoint: Optional[str] = Field(None, description="Model checkpoint")
    loras: Optional[List[str]] = Field(None, description="LoRA models to apply")
    lora_weights: Optional[List[float]] = Field(None, description="LoRA weights")
    sampler: Optional[str] = Field(None, description="Sampling method")
    scheduler: Optional[str] = Field(None, description="Scheduler type")
    steps: Optional[int] = Field(24, ge=1, le=150, description="Sampling steps")
    cfg: Optional[float] = Field(5.5, ge=0.1, le=20.0, description="CFG scale")
    seed: Optional[int] = Field(None, ge=0, description="Random seed")
    pag: Optional[bool] = Field(None, description="Enable PAG")
    deepshrink: Optional[bool] = Field(None, description="Enable DeepShrink")
    detail_daemon: Optional[bool] = Field(None, description="Enable Detail Daemon")
    split_sigmas: Optional[bool] = Field(None, description="Enable Split Sigmas")


class ComfyWorkflowRequest(BaseModel):
    """Request model for custom workflow execution."""
    workflow: Dict[str, Any] = Field(..., description="Custom workflow definition")
    parameters: Optional[Dict[str, Any]] = Field(None, description="Workflow parameters")


class ComfyValidationResponse(BaseModel):
    """Response model for validation results."""
    is_valid: bool = Field(..., description="Whether the input is valid")
    suggestions: List[str] = Field(default_factory=list, description="Alternative suggestions")
    errors: List[str] = Field(default_factory=list, description="Validation errors")


class ComfyObjectInfoResponse(BaseModel):
    """Response model for ComfyUI object information."""
    object_info: Dict[str, Any] = Field(..., description="ComfyUI object information")
    etag: Optional[str] = Field(None, description="Cache ETag for validation")


class ComfyPresetRequest(BaseModel):
    """Request model for creating/updating presets."""
    name: str = Field(..., description="Preset name")
    description: Optional[str] = Field(None, description="Preset description")
    category: Optional[str] = Field("General", description="Preset category")
    workflow: Dict[str, Any] = Field(..., description="Preset workflow")
    parameters: Optional[Dict[str, Any]] = Field(None, description="Preset parameters")
    is_default: Optional[bool] = Field(False, description="Whether this is the default preset")


class ComfyPresetResponse(BaseModel):
    """Response model for preset operations."""
    name: str = Field(..., description="Preset name")
    description: Optional[str] = Field(None, description="Preset description")
    category: str = Field(..., description="Preset category")
    workflow: Dict[str, Any] = Field(..., description="Preset workflow")
    parameters: Optional[Dict[str, Any]] = Field(None, description="Preset parameters")
    is_default: bool = Field(False, description="Whether this is the default preset")
    created_at: Optional[datetime] = Field(None, description="Creation timestamp")
    updated_at: Optional[datetime] = Field(None, description="Last update timestamp")
    created_by: Optional[str] = Field(None, description="Creator username")


class ComfyWorkflowTemplateRequest(BaseModel):
    """Request model for workflow templates."""
    name: str = Field(..., description="Template name")
    description: str = Field(..., description="Template description")
    category: str = Field(..., description="Template category")
    workflow: Dict[str, Any] = Field(..., description="Template workflow")
    author: Optional[str] = Field(None, description="Template author")
    tags: Optional[List[str]] = Field(None, description="Template tags")
    parameters: Optional[Dict[str, Any]] = Field(None, description="Template parameters")
    visibility: Optional[str] = Field("private", description="Template visibility")
    parent_template_id: Optional[str] = Field(None, description="Parent template ID for branches")
    branch_name: Optional[str] = Field(None, description="Branch name")
    is_community: Optional[bool] = Field(False, description="Whether this is a community template")


class ComfyWorkflowTemplateResponse(BaseModel):
    """Response model for workflow templates."""
    id: str = Field(..., description="Template ID")
    name: str = Field(..., description="Template name")
    description: str = Field(..., description="Template description")
    category: str = Field(..., description="Template category")
    workflow: Dict[str, Any] = Field(..., description="Template workflow")
    author: str = Field(..., description="Template author")
    tags: List[str] = Field(default_factory=list, description="Template tags")
    parameters: Optional[Dict[str, Any]] = Field(None, description="Template parameters")
    visibility: str = Field(..., description="Template visibility")
    parent_template_id: Optional[str] = Field(None, description="Parent template ID")
    branch_name: Optional[str] = Field(None, description="Branch name")
    is_community: bool = Field(False, description="Whether this is a community template")
    usage_count: int = Field(0, description="Usage count")
    rating: Optional[float] = Field(None, description="Average rating")
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
    workflow: Optional[Dict[str, Any]] = Field(None, description="Workflow definition")
    client_id: Optional[str] = Field(None, description="Client ID")


class ComfyHealthResponse(BaseModel):
    """Response model for health checks."""
    enabled: bool = Field(..., description="Whether ComfyUI integration is enabled")
    status: str = Field(..., description="Service status: ok, error, disabled")
    connection_state: Optional[str] = Field(None, description="Connection state")
    connection_attempts: Optional[int] = Field(None, description="Connection attempts")
    base_url: Optional[str] = Field(None, description="ComfyUI base URL")
    service: Optional[Dict[str, Any]] = Field(None, description="Service information")


class ComfyIngestRequest(BaseModel):
    """Request model for ingesting generated images."""
    prompt_id: str = Field(..., description="Prompt ID")
    workflow: Dict[str, Any] = Field(..., description="Workflow definition")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Additional metadata")


class ComfyIngestResponse(BaseModel):
    """Response model for image ingestion."""
    success: bool = Field(..., description="Whether ingestion was successful")
    image_path: Optional[str] = Field(None, description="Path to ingested image")
    metadata_path: Optional[str] = Field(None, description="Path to metadata file")
    deduplicated: bool = Field(False, description="Whether image was deduplicated")
    message: str = Field(..., description="Result message")
