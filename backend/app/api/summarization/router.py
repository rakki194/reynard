"""
Main router for summarization API endpoints.
"""

from fastapi import APIRouter

from .endpoints import router as endpoints_router

router = APIRouter(prefix="/api/summarization", tags=["summarization"])

# Include endpoint routers
router.include_router(endpoints_router)
