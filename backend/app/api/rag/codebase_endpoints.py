"""
Codebase indexing API endpoints.

Provides endpoints for:
- Indexing the Reynard codebase
- Getting indexing statistics
- Health checks
"""

import logging
from typing import Any, Dict

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse

from app.core.config import get_config
from .service import get_rag_service

logger = logging.getLogger("uvicorn")

router = APIRouter(prefix="/codebase", tags=["codebase"])

# Use the existing RAG service from the API module


@router.post("/index")
async def index_codebase(
    rag_service = Depends(get_rag_service)
) -> StreamingResponse:
    """Index the Reynard codebase for semantic search."""
    try:
        async def generate():
            # TODO: Implement codebase indexing using the new RAG service
            # For now, return a placeholder response
            import json
            yield f"data: {json.dumps({'type': 'info', 'message': 'Codebase indexing not yet implemented with new RAG service'})}\n\n"
        
        return StreamingResponse(
            generate(),
            media_type="text/plain",
            headers={"Cache-Control": "no-cache", "Connection": "keep-alive"}
        )
    
    except Exception as e:
        logger.error(f"Failed to index codebase: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/stats")
async def get_codebase_stats(
    rag_service = Depends(get_rag_service)
) -> Dict[str, Any]:
    """Get codebase indexing statistics."""
    try:
        stats = await rag_service.get_stats()
        return stats
    
    except Exception as e:
        logger.error(f"Failed to get codebase stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health")
async def health_check(
    rag_service = Depends(get_rag_service)
) -> Dict[str, Any]:
    """Check RAG service health."""
    try:
        # Simple health check - just verify the service is initialized
        if hasattr(rag_service, '_initialized') and rag_service._initialized:
            return {
                "healthy": True,
                "service": "rag_service",
                "status": "initialized"
            }
        else:
            return {
                "healthy": False,
                "service": "rag_service",
                "status": "not_initialized"
            }
    
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return {
            "healthy": False,
            "service": "rag_service",
            "error": str(e)
        }


@router.post("/scan")
async def scan_codebase(
    rag_service = Depends(get_rag_service)
) -> StreamingResponse:
    """Scan the codebase and return file information."""
    try:
        async def generate():
            # TODO: Implement codebase scanning using the new RAG service
            # For now, return a placeholder response
            import json
            yield f"data: {json.dumps({'type': 'info', 'message': 'Codebase scanning not yet implemented with new RAG service'})}\n\n"
        
        return StreamingResponse(
            generate(),
            media_type="text/plain",
            headers={"Cache-Control": "no-cache", "Connection": "keep-alive"}
        )
    
    except Exception as e:
        logger.error(f"Failed to scan codebase: {e}")
        raise HTTPException(status_code=500, detail=str(e))
