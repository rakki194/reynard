"""Administrative endpoints for Ollama service.
"""

import logging

from fastapi import APIRouter, HTTPException

from .models import OllamaStats
from .service import get_ollama_service

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/stats", response_model=OllamaStats)
async def get_stats():
    """Get service statistics."""
    try:
        service = get_ollama_service()
        stats = await service.get_stats()
        return stats

    except Exception as e:
        logger.error(f"Failed to get stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health")
async def health_check():
    """Check service health."""
    try:
        service = get_ollama_service()
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
        service = get_ollama_service()
        models = await service.get_available_models()
        return {"models": models}

    except Exception as e:
        logger.error(f"Failed to get models: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/models/{model_name}/pull")
async def pull_model(model_name: str):
    """Pull a model from Ollama registry."""
    try:
        service = get_ollama_service()
        success = await service.pull_model(model_name)

        if not success:
            raise HTTPException(
                status_code=400, detail=f"Failed to pull model {model_name}",
            )

        return {"success": True, "message": f"Model {model_name} pulled successfully"}

    except Exception as e:
        logger.error(f"Failed to pull model {model_name}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/cleanup")
async def cleanup():
    """Cleanup service resources."""
    try:
        service = get_ollama_service()
        await service.cleanup()

        return {"success": True, "message": "Service cleanup completed successfully"}

    except Exception as e:
        logger.error(f"Cleanup failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
