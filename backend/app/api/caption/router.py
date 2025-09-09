"""
Caption API router for Reynard Backend.

This module combines all caption-related endpoints into a single router
for clean organization and easy maintenance.
"""

from fastapi import APIRouter

from .endpoints import router as endpoints_router
from .upload import router as upload_router
from .monitoring import router as monitoring_router

# Create main router
router = APIRouter()

# Include sub-routers
router.include_router(endpoints_router)
router.include_router(upload_router)
router.include_router(monitoring_router)
