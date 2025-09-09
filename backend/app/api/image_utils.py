"""
Image Utils API for Reynard Backend

Main API module that combines all image processing endpoints.
"""

from fastapi import APIRouter

from .image_utils_endpoints import router as endpoints_router
from .image_utils_plugin_endpoints import router as plugin_router

# Combine all image utils routers
router = APIRouter(prefix="/api/image-utils", tags=["image-utils"])
router.include_router(endpoints_router)
router.include_router(plugin_router)
