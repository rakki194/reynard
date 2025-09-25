"""🦊 Reynard Document Indexer Control API Endpoints
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
from typing import NoReturn

from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse

from app.core.service_registry import get_service_registry

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/document-indexer", tags=["document-indexer"])


def _raise_service_unavailable(detail: str) -> NoReturn:
    """Raise HTTPException for service unavailable."""
    raise HTTPException(status_code=503, detail=detail)


def _get_document_indexer():
    """Get the document indexer from the RAG service."""
    registry = get_service_registry()
    rag_service = registry.get_service_instance("rag")

    if not rag_service:
        _raise_service_unavailable("RAG service not available")

    document_indexer = getattr(rag_service, "document_indexer", None)
    if not document_indexer:
        _raise_service_unavailable("Document indexer not available")

    return document_indexer


@router.post("/resume", operation_id="rag_document_indexer_resume")
async def resume_document_indexer() -> JSONResponse:
    """Resume the document indexer."""
    try:
        document_indexer = _get_document_indexer()
        await document_indexer.resume()

        return JSONResponse(
            {"status": "success", "message": "Document indexer resumed successfully"},
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Failed to resume document indexer")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to resume document indexer: {e!s}",
        ) from e


@router.post("/pause", operation_id="rag_document_indexer_pause")
async def pause_document_indexer() -> JSONResponse:
    """Pause the document indexer."""
    try:
        document_indexer = _get_document_indexer()
        await document_indexer.pause()

        return JSONResponse(
            {"status": "success", "message": "Document indexer paused successfully"},
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Failed to pause document indexer")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to pause document indexer: {e!s}",
        ) from e


@router.get("/status", operation_id="rag_document_indexer_status")
async def get_document_indexer_status() -> JSONResponse:
    """Get document indexer status and metrics."""
    try:
        document_indexer = _get_document_indexer()
        stats = await document_indexer.get_stats()

        return JSONResponse({"status": "success", "data": stats})

    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Failed to get document indexer status")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get document indexer status: {e!s}",
        ) from e


@router.get("/queue", operation_id="rag_document_indexer_queue")
async def get_queue_status() -> JSONResponse:
    """Get queue status and metrics."""
    try:
        document_indexer = _get_document_indexer()
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
        logger.exception("Failed to get queue status")
        raise HTTPException(
            status_code=500, detail=f"Failed to get queue status: {e!s}",
        ) from e
