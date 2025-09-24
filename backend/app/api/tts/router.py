"""TTS API Router for Reynard Backend

Main router for TTS API endpoints.
"""

from fastapi import APIRouter

from .admin import router as admin_router
from .endpoints import router as endpoints_router

router = APIRouter(prefix="/api/tts", tags=["tts"])

# Include sub-routers
router.include_router(endpoints_router)
router.include_router(admin_router)
