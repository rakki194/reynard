"""
🦊 Reynard Initial Indexing API Endpoints
==========================================

API endpoints for triggering and managing initial codebase indexing.
Provides comprehensive indexing control with progress monitoring.

Features:
- Trigger initial indexing with database checks
- Force re-indexing when needed
- Progress monitoring integration
- Indexing status and control
- Comprehensive error handling

Author: Reynard Development Team
Version: 1.0.0
"""

import logging
from typing import Any, Dict

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse

from app.core.service_registry import get_service_registry
from app.services.rag.progress_monitor import get_progress_monitor

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/initial-indexing", tags=["initial-indexing"])


@router.post("/start")
async def start_initial_indexing(force: bool = False) -> JSONResponse:
    """Start initial indexing of the codebase."""
    try:
        registry = get_service_registry()
        rag_service = registry.get_service_instance("rag")

        if not rag_service:
            raise HTTPException(status_code=503, detail="RAG service not available")

        # Get the initial indexing service
        initial_indexing_service = getattr(
            rag_service, "initial_indexing_service", None
        )
        if not initial_indexing_service:
            raise HTTPException(
                status_code=503, detail="Initial indexing service not available"
            )

        # Check if already running
        if initial_indexing_service.is_running:
            return JSONResponse(
                {
                    "status": "already_running",
                    "message": "Initial indexing is already in progress",
                    "progress": await initial_indexing_service.get_progress(),
                }
            )

        # Start progress monitoring
        progress_monitor = get_progress_monitor()
        await progress_monitor.start_monitoring(initial_indexing_service)

        # Start indexing in background
        import asyncio

        asyncio.create_task(
            initial_indexing_service.perform_initial_indexing(force=force)
        )

        return JSONResponse(
            {
                "status": "started",
                "message": "Initial indexing started successfully",
                "force": force,
                "monitoring": {
                    "websocket_url": "/api/rag/progress/ws",
                    "progress_url": "/api/rag/progress/current",
                },
            }
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to start initial indexing: {e}")
        raise HTTPException(
            status_code=500, detail=f"Failed to start initial indexing: {str(e)}"
        )


@router.get("/status")
async def get_indexing_status() -> JSONResponse:
    """Get current indexing status."""
    try:
        registry = get_service_registry()
        rag_service = registry.get_service_instance("rag")

        if not rag_service:
            raise HTTPException(status_code=503, detail="RAG service not available")

        # Get the initial indexing service
        initial_indexing_service = getattr(
            rag_service, "initial_indexing_service", None
        )
        if not initial_indexing_service:
            raise HTTPException(
                status_code=503, detail="Initial indexing service not available"
            )

        progress = await initial_indexing_service.get_progress()
        is_running = initial_indexing_service.is_running

        return JSONResponse(
            {
                "status": "success",
                "data": {
                    "is_running": is_running,
                    "progress": progress,
                    "database_empty": await initial_indexing_service.is_database_empty(),
                },
            }
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get indexing status: {e}")
        raise HTTPException(
            status_code=500, detail=f"Failed to get indexing status: {str(e)}"
        )


@router.post("/stop")
async def stop_indexing() -> JSONResponse:
    """Stop the current indexing process."""
    try:
        registry = get_service_registry()
        rag_service = registry.get_service_instance("rag")

        if not rag_service:
            raise HTTPException(status_code=503, detail="RAG service not available")

        # Get the initial indexing service
        initial_indexing_service = getattr(
            rag_service, "initial_indexing_service", None
        )
        if not initial_indexing_service:
            raise HTTPException(
                status_code=503, detail="Initial indexing service not available"
            )

        if not initial_indexing_service.is_running:
            return JSONResponse(
                {
                    "status": "not_running",
                    "message": "No indexing process is currently running",
                }
            )

        # Stop indexing
        success = await initial_indexing_service.stop_indexing()

        # Stop progress monitoring
        progress_monitor = get_progress_monitor()
        await progress_monitor.stop_monitoring()

        return JSONResponse(
            {
                "status": "stopped" if success else "failed",
                "message": (
                    "Indexing process stopped" if success else "Failed to stop indexing"
                ),
            }
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to stop indexing: {e}")
        raise HTTPException(
            status_code=500, detail=f"Failed to stop indexing: {str(e)}"
        )


@router.get("/database-status")
async def get_database_status() -> JSONResponse:
    """Check if the database is empty and needs initial indexing."""
    try:
        registry = get_service_registry()
        rag_service = registry.get_service_instance("rag")

        if not rag_service:
            raise HTTPException(status_code=503, detail="RAG service not available")

        # Get the initial indexing service
        initial_indexing_service = getattr(
            rag_service, "initial_indexing_service", None
        )
        if not initial_indexing_service:
            raise HTTPException(
                status_code=503, detail="Initial indexing service not available"
            )

        is_empty = await initial_indexing_service.is_database_empty()

        return JSONResponse(
            {
                "status": "success",
                "data": {
                    "is_empty": is_empty,
                    "needs_indexing": is_empty,
                    "message": (
                        "Database is empty and needs initial indexing"
                        if is_empty
                        else "Database has content"
                    ),
                },
            }
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to check database status: {e}")
        raise HTTPException(
            status_code=500, detail=f"Failed to check database status: {str(e)}"
        )


@router.get("/file-discovery")
async def discover_files() -> JSONResponse:
    """Discover files that would be indexed."""
    try:
        registry = get_service_registry()
        rag_service = registry.get_service_instance("rag")

        if not rag_service:
            raise HTTPException(status_code=503, detail="RAG service not available")

        # Get the initial indexing service
        initial_indexing_service = getattr(
            rag_service, "initial_indexing_service", None
        )
        if not initial_indexing_service:
            raise HTTPException(
                status_code=503, detail="Initial indexing service not available"
            )

        files = await initial_indexing_service.discover_files()
        file_info = [
            {
                "path": str(f),
                "name": f.name,
                "size": f.stat().st_size if f.exists() else 0,
                "extension": f.suffix,
            }
            for f in files
        ]

        return JSONResponse(
            {
                "status": "success",
                "data": {
                    "total_files": len(files),
                    "files": file_info[
                        :100
                    ],  # Limit to first 100 files for response size
                    "truncated": len(files) > 100,
                },
            }
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to discover files: {e}")
        raise HTTPException(
            status_code=500, detail=f"Failed to discover files: {str(e)}"
        )
