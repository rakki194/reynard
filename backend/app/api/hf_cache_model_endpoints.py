"""
HuggingFace Cache Model Endpoints for Reynard Backend

Model-specific endpoint implementations for HF cache operations.
"""

import logging
from fastapi import APIRouter, HTTPException, status

from app.utils.hf_cache import (
    get_model_cache_path,
    get_model_snapshot_path,
    is_model_cached
)
from .hf_cache_models import ModelCacheInfoResponse

logger = logging.getLogger("uvicorn")

router = APIRouter(prefix="/api/hf-cache", tags=["hf-cache"])


@router.get("/model/{repo_id}", response_model=ModelCacheInfoResponse)
async def get_model_cache_info(repo_id: str, revision: str = "main"):
    """Get cache information for a specific model."""
    try:
        cache_path = str(get_model_cache_path(repo_id))
        snapshot_path = str(get_model_snapshot_path(repo_id, revision))
        cached = is_model_cached(repo_id)
        
        # Get size and last modified if cached
        size = None
        last_modified = None
        if cached:
            try:
                cache_path_obj = get_model_cache_path(repo_id)
                if cache_path_obj.exists():
                    size = sum(f.stat().st_size for f in cache_path_obj.rglob('*') if f.is_file())
                    # Get last modified time of the directory
                    last_modified = cache_path_obj.stat().st_mtime
            except Exception:
                pass  # Ignore errors getting size/modified time
        
        return ModelCacheInfoResponse(
            repo_id=repo_id,
            cache_path=cache_path,
            snapshot_path=snapshot_path,
            is_cached=cached,
            size=size,
            last_modified=str(last_modified) if last_modified else None
        )
        
    except Exception as e:
        logger.error(f"Failed to get model cache info for {repo_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get model cache info: {str(e)}"
        )


@router.get("/model/{repo_id}/cached")
async def check_model_cached(repo_id: str):
    """Check if a model is cached."""
    try:
        cached = is_model_cached(repo_id)
        return {"repo_id": repo_id, "is_cached": cached}
        
    except Exception as e:
        logger.error(f"Failed to check if model {repo_id} is cached: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to check model cache status: {str(e)}"
        )
