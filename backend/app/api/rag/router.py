"""
RAG API Router for Reynard Backend

Main router that combines all RAG-related endpoints.
"""

from fastapi import APIRouter

from .admin import router as admin_router
from .codebase_endpoints import router as codebase_router
from .document_indexer_endpoints import router as document_indexer_router
from .endpoints import router as endpoints_router
from .ingest import router as ingest_router
from .initial_indexing_endpoints import router as initial_indexing_router
from .progress_endpoints import router as progress_router
from .semantic_search_endpoints import router as semantic_search_router

# Combine all RAG routers
router = APIRouter(prefix="/api/rag", tags=["rag"])
router.include_router(endpoints_router)
router.include_router(admin_router)
router.include_router(ingest_router)
router.include_router(codebase_router)
router.include_router(initial_indexing_router)
router.include_router(progress_router)
router.include_router(document_indexer_router)
router.include_router(semantic_search_router)

router.include_router(progress_router)
router.include_router(document_indexer_router)
router.include_router(semantic_search_router)
