"""
RAG Admin Endpoints for Reynard Backend

Administrative endpoints for RAG system management and monitoring.
"""

import logging

from fastapi import APIRouter, HTTPException, status

from .models import RAGStatsResponse, RAGIndexingStatusResponse
from .service import get_rag_service

logger = logging.getLogger("uvicorn")

router = APIRouter(prefix="/api/rag", tags=["rag"])


@router.get("/admin/stats", response_model=RAGStatsResponse)
async def get_rag_stats():
    """Get RAG system statistics."""
    try:
        service = get_rag_service()
        stats = await service.get_stats()
        return RAGStatsResponse(**stats)
    except Exception as e:
        logger.error(f"Failed to get RAG stats: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get RAG stats: {str(e)}"
        )


@router.get("/admin/indexing-status", response_model=RAGIndexingStatusResponse)
async def get_indexing_status():
    """Get current indexing status."""
    try:
        service = get_rag_service()
        status = await service.get_indexing_status()
        return RAGIndexingStatusResponse(**status)
    except Exception as e:
        logger.error(f"Failed to get indexing status: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get indexing status: {str(e)}"
        )


@router.post("/admin/rebuild-index")
async def rebuild_index():
    """Rebuild the vector index."""
    try:
        service = get_rag_service()
        result = await service.rebuild_index()
        return {"message": "Index rebuild initiated", "result": result}
    except Exception as e:
        logger.error(f"Failed to rebuild index: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to rebuild index: {str(e)}"
        )


@router.post("/admin/clear-cache")
async def clear_cache():
    """Clear the RAG system cache."""
    try:
        service = get_rag_service()
        result = await service.clear_cache()
        return {"message": "Cache cleared", "result": result}
    except Exception as e:
        logger.error(f"Failed to clear cache: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to clear cache: {str(e)}"
        )
