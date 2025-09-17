"""
ComfyUI Integration Service

Provides workflow automation, queue management, and image generation
capabilities through ComfyUI integration.
"""

from .comfy_service import ComfyService
from .models import (
    ComfyImageRequest,
    ComfyObjectInfoResponse,
    ComfyPresetRequest,
    ComfyPresetResponse,
    ComfyQueueRequest,
    ComfyQueueResponse,
    ComfyStatusResponse,
    ComfyText2ImgRequest,
    ComfyValidationResponse,
    ComfyWorkflowRequest,
    ComfyWorkflowTemplateRequest,
    ComfyWorkflowTemplateResponse,
)
from .service_initializer import (
    get_comfy_service,
    initialize_comfy_service,
    shutdown_comfy_service,
)

__all__ = [
    "ComfyImageRequest",
    "ComfyObjectInfoResponse",
    "ComfyPresetRequest",
    "ComfyPresetResponse",
    "ComfyQueueRequest",
    "ComfyQueueResponse",
    "ComfyService",
    "ComfyStatusResponse",
    "ComfyText2ImgRequest",
    "ComfyValidationResponse",
    "ComfyWorkflowRequest",
    "ComfyWorkflowTemplateRequest",
    "ComfyWorkflowTemplateResponse",
    "get_comfy_service",
    "initialize_comfy_service",
    "shutdown_comfy_service",
]
