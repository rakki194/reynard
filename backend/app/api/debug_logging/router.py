"""Debug Logging Router

This module provides the main router for debug logging API endpoints.
"""

from fastapi import APIRouter

from .endpoints import router as debug_endpoints

router = APIRouter()
router.include_router(debug_endpoints)
