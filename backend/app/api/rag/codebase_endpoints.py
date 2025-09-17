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
from app.services.rag.codebase_indexer import CodebaseIndexer

logger = logging.getLogger("uvicorn")

router = APIRouter(prefix="/codebase", tags=["codebase"])

# Global codebase indexer instance
_codebase_indexer: CodebaseIndexer | None = None


async def get_codebase_indexer() -> CodebaseIndexer:
    """Get the codebase indexer instance."""
    global _codebase_indexer
    if _codebase_indexer is None:
        _codebase_indexer = CodebaseIndexer()
        config = get_config()
        service_configs = config.get_service_configs()
        rag_config = service_configs.get("rag", {})
        
        success = await _codebase_indexer.initialize(rag_config)
        if not success:
            raise HTTPException(status_code=500, detail="Failed to initialize codebase indexer")
    
    return _codebase_indexer


@router.post("/index")
async def index_codebase(
    indexer: CodebaseIndexer = Depends(get_codebase_indexer)
) -> StreamingResponse:
    """Index the Reynard codebase for semantic search."""
    try:
        async def generate():
            async for item in indexer.index_codebase():
                import json
                yield f"data: {json.dumps(item)}\n\n"
        
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
    indexer: CodebaseIndexer = Depends(get_codebase_indexer)
) -> Dict[str, Any]:
    """Get codebase indexing statistics."""
    try:
        stats = await indexer.get_stats()
        return stats
    
    except Exception as e:
        logger.error(f"Failed to get codebase stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health")
async def health_check(
    indexer: CodebaseIndexer = Depends(get_codebase_indexer)
) -> Dict[str, Any]:
    """Check codebase indexer health."""
    try:
        is_healthy = await indexer.health_check()
        return {
            "healthy": is_healthy,
            "service": "codebase_indexer"
        }
    
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return {
            "healthy": False,
            "service": "codebase_indexer",
            "error": str(e)
        }


@router.post("/scan")
async def scan_codebase(
    indexer: CodebaseIndexer = Depends(get_codebase_indexer)
) -> StreamingResponse:
    """Scan the codebase and return file information."""
    try:
        async def generate():
            async for item in indexer.scan_codebase():
                import json
                yield f"data: {json.dumps(item)}\n\n"
        
        return StreamingResponse(
            generate(),
            media_type="text/plain",
            headers={"Cache-Control": "no-cache", "Connection": "keep-alive"}
        )
    
    except Exception as e:
        logger.error(f"Failed to scan codebase: {e}")
        raise HTTPException(status_code=500, detail=str(e))
