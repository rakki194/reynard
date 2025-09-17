"""
HuggingFace Cache Core Endpoints for Reynard Backend

Core endpoint implementations for HF cache operations.
"""

import logging

from fastapi import APIRouter, HTTPException, status

from app.utils.hf_cache import ensure_hf_cache_dir, get_hf_cache_dir, get_hf_hub_dir

from .hf_cache_models import HFCacheInfoResponse

logger = logging.getLogger("uvicorn")

router = APIRouter(prefix="/api/hf-cache", tags=["hf-cache"])


@router.get("/info", response_model=HFCacheInfoResponse)
async def get_cache_info():
    """Get HuggingFace cache information."""
    try:
        cache_dir = str(get_hf_cache_dir())
        hub_dir = str(get_hf_hub_dir())

        # Get cache size
        from app.utils.hf_cache import get_cache_size

        size = get_cache_size()

        # Count models (simplified - just count directories in hub)
        model_count = 0
        hub_path = get_hf_hub_dir()
        if hub_path.exists():
            model_count = len([d for d in hub_path.iterdir() if d.is_dir()])

        return HFCacheInfoResponse(
            cache_dir=cache_dir, hub_dir=hub_dir, size=size, model_count=model_count
        )

    except Exception as e:
        logger.error(f"Failed to get cache info: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get cache info: {e!s}",
        )


@router.get("/cache-dir")
async def get_cache_directory():
    """Get the HuggingFace cache directory path."""
    try:
        cache_dir = str(get_hf_cache_dir())
        return {"cache_dir": cache_dir}

    except Exception as e:
        logger.error(f"Failed to get cache directory: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get cache directory: {e!s}",
        )


@router.get("/hub-dir")
async def get_hub_directory():
    """Get the HuggingFace Hub directory path."""
    try:
        hub_dir = str(get_hf_hub_dir())
        return {"hub_dir": hub_dir}

    except Exception as e:
        logger.error(f"Failed to get hub directory: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get hub directory: {e!s}",
        )


@router.post("/ensure-cache-dir")
async def ensure_cache_directory():
    """Ensure the HuggingFace cache directory exists."""
    try:
        cache_dir = str(ensure_hf_cache_dir())
        return {"cache_dir": cache_dir, "created": True}

    except Exception as e:
        logger.error(f"Failed to ensure cache directory: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to ensure cache directory: {e!s}",
        )
