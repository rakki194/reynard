"""
ComfyUI API Router

Main router for ComfyUI API endpoints.
"""

from fastapi import APIRouter
from .endpoints import router

# Export the router
__all__ = ["router"]
