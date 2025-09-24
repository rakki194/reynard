"""ECS Main API Router
===================

Main router that combines all ECS API endpoints into a single organized structure.
"""

from fastapi import APIRouter

from .agents import router as agents_router
from .naming import router as naming_router
from .spirits import router as spirits_router
from .traits import router as traits_router
from .world import router as world_router

# Create main ECS router
router = APIRouter(prefix="", tags=["ECS World"])

# Include all sub-routers
router.include_router(world_router)
router.include_router(agents_router)
router.include_router(naming_router)
router.include_router(traits_router)
router.include_router(spirits_router)
