"""ComfyUI API Models

Pydantic models for ComfyUI API endpoints.
"""

from typing import Any

from pydantic import BaseModel, Field


class ComfyQueueRequest(BaseModel):
    """Request model for queueing a ComfyUI workflow."""

    workflow: dict[str, Any] = Field(..., description="ComfyUI workflow definition")
    client_id: str | None = Field(None, description="Optional client identifier")


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


class ComfyPresetRequest(BaseModel):
    """Request model for creating/updating presets."""

    name: str = Field(..., description="Preset name")
    description: str | None = Field(None, description="Preset description")
    category: str | None = Field("General", description="Preset category")
    workflow: dict[str, Any] = Field(..., description="Preset workflow")
    parameters: dict[str, Any] | None = Field(None, description="Preset parameters")
    is_default: bool | None = Field(
        False, description="Whether this is the default preset",
    )


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
        None, description="Parent template ID for branches",
    )
    branch_name: str | None = Field(None, description="Branch name")
    is_community: bool | None = Field(
        False, description="Whether this is a community template",
    )


class ComfyIngestRequest(BaseModel):
    """Request model for ingesting generated images."""

    prompt_id: str = Field(..., description="Prompt ID")
    workflow: dict[str, Any] = Field(..., description="Workflow definition")
    metadata: dict[str, Any] = Field(
        default_factory=dict, description="Additional metadata",
    )
