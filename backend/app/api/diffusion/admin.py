"""
Administrative endpoints for Diffusion-LLM service.
"""

import logging

from fastapi import APIRouter, HTTPException

from .models import DiffusionStats
from .service import get_diffusion_service

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/stats", response_model=DiffusionStats)
async def get_stats():
    """Get service statistics."""
    try:
        service = get_diffusion_service()
        stats = await service.get_stats()
        return stats

    except Exception as e:
        logger.error(f"Failed to get stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health")
async def health_check():
    """Check service health."""
    try:
        service = get_diffusion_service()
        is_healthy = await service.health_check()

        return {
            "healthy": is_healthy,
            "status": "healthy" if is_healthy else "unhealthy",
        }

    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return {"healthy": False, "status": "error", "error": str(e)}


@router.get("/models")
async def get_models():
    """Get available models with detailed information."""
    try:
        service = get_diffusion_service()
        models = await service.get_available_models()
        return {"models": models}

    except Exception as e:
        logger.error(f"Failed to get models: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/models/{model_id}/reload")
async def reload_model(model_id: str):
    """Reload a specific model."""
    try:
        service = get_diffusion_service()
        success = await service.reload_model(model_id)

        if not success:
            raise HTTPException(
                status_code=400, detail=f"Failed to reload model {model_id}"
            )

        return {"success": True, "message": f"Model {model_id} reloaded successfully"}

    except Exception as e:
        logger.error(f"Failed to reload model {model_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/cleanup")
async def cleanup():
    """Cleanup service resources."""
    try:
        service = get_diffusion_service()
        await service.cleanup()

        return {"success": True, "message": "Service cleanup completed successfully"}

    except Exception as e:
        logger.error(f"Cleanup failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
