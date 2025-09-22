"""
🦊 Reynard Document Indexer Control API Endpoints
=================================================

API endpoints for controlling the document indexer service.
Provides pause/resume functionality and status monitoring.

Features:
- Pause/Resume document indexer
- Queue management and monitoring
- Worker status and performance metrics
- Dead letter queue management

Author: Reynard Development Team
Version: 1.0.0
"""

import logging
from typing import Any, Dict

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse

from app.core.service_registry import get_service_registry

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/document-indexer", tags=["document-indexer"])


@router.post("/resume")
async def resume_document_indexer() -> JSONResponse:
    """Resume the document indexer."""
    try:
        registry = get_service_registry()
        rag_service = registry.get_service_instance("rag")

        if not rag_service:
            raise HTTPException(status_code=503, detail="RAG service not available")

        # Get the document indexer
        document_indexer = getattr(rag_service, "document_indexer", None)
        if not document_indexer:
            raise HTTPException(
                status_code=503, detail="Document indexer not available"
            )

        # Resume the indexer
        await document_indexer.resume()

        return JSONResponse(
            {"status": "success", "message": "Document indexer resumed successfully"}
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to resume document indexer: {e}")
        raise HTTPException(
            status_code=500, detail=f"Failed to resume document indexer: {str(e)}"
        )


@router.post("/pause")
async def pause_document_indexer() -> JSONResponse:
    """Pause the document indexer."""
    try:
        registry = get_service_registry()
        rag_service = registry.get_service_instance("rag")

        if not rag_service:
            raise HTTPException(status_code=503, detail="RAG service not available")

        # Get the document indexer
        document_indexer = getattr(rag_service, "document_indexer", None)
        if not document_indexer:
            raise HTTPException(
                status_code=503, detail="Document indexer not available"
            )

        # Pause the indexer
        await document_indexer.pause()

        return JSONResponse(
            {"status": "success", "message": "Document indexer paused successfully"}
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to pause document indexer: {e}")
        raise HTTPException(
            status_code=500, detail=f"Failed to pause document indexer: {str(e)}"
        )


@router.get("/status")
async def get_document_indexer_status() -> JSONResponse:
    """Get document indexer status and metrics."""
    try:
        registry = get_service_registry()
        rag_service = registry.get_service_instance("rag")

        if not rag_service:
            raise HTTPException(status_code=503, detail="RAG service not available")

        # Get the document indexer
        document_indexer = getattr(rag_service, "document_indexer", None)
        if not document_indexer:
            raise HTTPException(
                status_code=503, detail="Document indexer not available"
            )

        # Get status
        stats = await document_indexer.get_stats()

        return JSONResponse({"status": "success", "data": stats})

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get document indexer status: {e}")
        raise HTTPException(
            status_code=500, detail=f"Failed to get document indexer status: {str(e)}"
        )


@router.get("/queue")
async def get_queue_status() -> JSONResponse:
    """Get queue status and metrics."""
    try:
        registry = get_service_registry()
        rag_service = registry.get_service_instance("rag")

        if not rag_service:
            raise HTTPException(status_code=503, detail="RAG service not available")

        # Get the document indexer
        document_indexer = getattr(rag_service, "document_indexer", None)
        if not document_indexer:
            raise HTTPException(
                status_code=503, detail="Document indexer not available"
            )

        # Get queue status
        stats = await document_indexer.get_stats()
        queue_info = {
            "queue_size": stats.get("queue_size", 0),
            "dead_letter_size": stats.get("dead_letter_size", 0),
            "paused": stats.get("paused", True),
            "workers": stats.get("workers", 0),
            "concurrency": stats.get("concurrency", 0),
            "metrics": stats.get("metrics", {}),
        }

        return JSONResponse({"status": "success", "data": queue_info})

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get queue status: {e}")
        raise HTTPException(
            status_code=500, detail=f"Failed to get queue status: {str(e)}"
        )
