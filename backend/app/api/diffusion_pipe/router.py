"""Main router for Diffusion-Pipe API endpoints.
"""

from fastapi import APIRouter

from .endpoints import router as endpoints_router

router = APIRouter(prefix="/api/diffusion-pipe", tags=["diffusion-pipe"])

# Include endpoint routers
router.include_router(endpoints_router)
