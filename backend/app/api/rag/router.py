"""
RAG API Router for Reynard Backend

Main router that combines all RAG-related endpoints.
"""

from fastapi import APIRouter

from .admin import router as admin_router
from .codebase_endpoints import router as codebase_router
from .endpoints import router as endpoints_router
from .ingest import router as ingest_router

# Combine all RAG routers
router = APIRouter(prefix="/api/rag", tags=["rag"])
router.include_router(endpoints_router)
router.include_router(admin_router)
router.include_router(ingest_router)
router.include_router(codebase_router)
