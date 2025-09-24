"""Main router for Diffusion-LLM API endpoints.
"""

from fastapi import APIRouter

from .admin import router as admin_router
from .endpoints import router as endpoints_router

router = APIRouter(prefix="/api/diffusion", tags=["diffusion"])

# Include endpoint routers
router.include_router(endpoints_router)
router.include_router(admin_router, prefix="/admin")
