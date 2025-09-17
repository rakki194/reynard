"""
HuggingFace Cache Management Endpoints for Reynard Backend

Management endpoint implementations for HF cache operations.
"""

import logging

from fastapi import APIRouter, HTTPException, status

from app.utils.hf_cache import clear_cache, get_cache_size

logger = logging.getLogger("uvicorn")

router = APIRouter(prefix="/api/hf-cache", tags=["hf-cache"])


@router.get("/size")
async def get_cache_size_endpoint():
    """Get the total size of the HuggingFace cache."""
    try:
        size = get_cache_size()
        return {"size_bytes": size, "size_mb": size / (1024 * 1024)}

    except Exception as e:
        logger.error(f"Failed to get cache size: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get cache size: {e!s}",
        )


@router.delete("/clear")
async def clear_cache_endpoint():
    """Clear the HuggingFace cache."""
    try:
        success = clear_cache()
        if success:
            return {"success": True, "message": "Cache cleared successfully"}
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to clear cache",
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to clear cache: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to clear cache: {e!s}",
        )
