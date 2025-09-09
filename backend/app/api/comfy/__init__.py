"""
ComfyUI API Module

Provides REST API endpoints for ComfyUI workflow automation,
queue management, and image generation.
"""

from .router import router

__all__ = ["router"]
