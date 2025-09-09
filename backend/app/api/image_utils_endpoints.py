"""
Image Utils API Endpoints for Reynard Backend

Main endpoints module that combines core and processing endpoints.
"""

from fastapi import APIRouter

from .image_utils_core_endpoints import router as core_router
from .image_utils_processing_endpoints import router as processing_router

# Combine core and processing routers
router = APIRouter(prefix="/api/image-utils", tags=["image-utils"])
router.include_router(core_router)
router.include_router(processing_router)
