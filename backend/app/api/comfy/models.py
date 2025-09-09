"""
ComfyUI API Models

Pydantic models for ComfyUI API endpoints.
"""

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class ComfyQueueRequest(BaseModel):
    """Request model for queueing a ComfyUI workflow."""
    workflow: Dict[str, Any] = Field(..., description="ComfyUI workflow definition")
    client_id: Optional[str] = Field(None, description="Optional client identifier")


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


class ComfyPresetRequest(BaseModel):
    """Request model for creating/updating presets."""
    name: str = Field(..., description="Preset name")
    description: Optional[str] = Field(None, description="Preset description")
    category: Optional[str] = Field("General", description="Preset category")
    workflow: Dict[str, Any] = Field(..., description="Preset workflow")
    parameters: Optional[Dict[str, Any]] = Field(None, description="Preset parameters")
    is_default: Optional[bool] = Field(False, description="Whether this is the default preset")


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


class ComfyIngestRequest(BaseModel):
    """Request model for ingesting generated images."""
    prompt_id: str = Field(..., description="Prompt ID")
    workflow: Dict[str, Any] = Field(..., description="Workflow definition")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Additional metadata")
