"""Main router for Ollama API endpoints.
"""

from fastapi import APIRouter

from .admin import router as admin_router
from .endpoints import router as endpoints_router

router = APIRouter(prefix="/api/ollama", tags=["ollama"])

# Include endpoint routers
router.include_router(endpoints_router)
router.include_router(admin_router, prefix="/admin")
