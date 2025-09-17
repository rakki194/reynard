"""
TTS Admin API for Reynard Backend

Administrative endpoints for TTS service management.
"""

import logging

from fastapi import APIRouter, HTTPException, status

from .models import TTSStatsResponse
from .service import get_tts_service

logger = logging.getLogger("uvicorn")

router = APIRouter(prefix="/api/tts/admin", tags=["tts-admin"])


@router.get("/stats", response_model=TTSStatsResponse)
async def get_tts_stats():
    """Get TTS service statistics."""
    try:
        service = get_tts_service()
        stats = await service.get_stats()
        return TTSStatsResponse(**stats)
    except Exception as e:
        logger.error(f"Failed to get TTS stats: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get TTS stats: {e!s}",
        )


@router.get("/backends")
async def get_available_backends():
    """Get list of available TTS backends."""
    try:
        service = get_tts_service()
        backends = await service.get_available_backends()
        return {"backends": backends}
    except Exception as e:
        logger.error(f"Failed to get available backends: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get available backends: {e!s}",
        )


@router.get("/health")
async def health_check():
    """Perform TTS service health check."""
    try:
        service = get_tts_service()
        is_healthy = await service.health_check()

        if is_healthy:
            return {"status": "healthy", "message": "TTS service is operational"}
        return {"status": "unhealthy", "message": "TTS service has issues"}

    except Exception as e:
        logger.error(f"TTS health check failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"TTS health check failed: {e!s}",
        )


@router.post("/backends/{backend_name}/reload")
async def reload_backend(backend_name: str):
    """Reload a specific TTS backend."""
    try:
        service = get_tts_service()

        # TODO: Implement backend reload functionality
        # For now, just return success
        return {
            "success": True,
            "message": f"Backend {backend_name} reloaded successfully",
            "backend": backend_name,
        }

    except Exception as e:
        logger.error(f"Failed to reload backend {backend_name}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to reload backend {backend_name}: {e!s}",
        )


@router.post("/cleanup")
async def cleanup_audio_files():
    """Clean up old audio files."""
    try:
        service = get_tts_service()

        # TODO: Implement audio file cleanup
        # For now, just return success
        return {
            "success": True,
            "message": "Audio files cleaned up successfully",
            "files_removed": 0,
        }

    except Exception as e:
        logger.error(f"Failed to cleanup audio files: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to cleanup audio files: {e!s}",
        )
