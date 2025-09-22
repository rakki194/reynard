"""
ECS Endpoints Package

Contains all API endpoint modules for the ECS system.
"""

from fastapi import APIRouter

from .legacy_endpoints import router as legacy_router
from .modular_legacy_endpoints import router as modular_legacy_router

# Create main router that combines all endpoint routers
router = APIRouter(prefix="/ecs", tags=["ECS"])

# Include all sub-routers
router.include_router(legacy_router)
router.include_router(modular_legacy_router)

__all__ = ["router"]
