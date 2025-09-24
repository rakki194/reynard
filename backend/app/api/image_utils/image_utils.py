"""Image Utils API for Reynard Backend

Main router that combines all image processing endpoints.
"""

from fastapi import APIRouter

from .image_utils_core_endpoints import router as core_router
from .image_utils_plugin_endpoints import router as plugin_router
from .image_utils_processing_endpoints import router as processing_router

# Create main router
router = APIRouter()

# Include sub-routers
router.include_router(core_router)
router.include_router(plugin_router)
router.include_router(processing_router)
