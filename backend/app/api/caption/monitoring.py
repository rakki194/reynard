"""
Caption monitoring endpoints for Reynard Backend.

This module provides monitoring and statistics endpoints for
caption generation system health and performance.
"""

import logging

from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse

from .service import get_caption_api_service

logger = logging.getLogger("uvicorn")

router = APIRouter(prefix="/caption", tags=["caption-monitoring"])


@router.get("/stats")
async def get_system_statistics():
    """Get comprehensive system statistics and usage metrics."""
    try:
        service = get_caption_api_service()
        stats = service.get_system_statistics()
        return JSONResponse(content=stats)
    except Exception as e:
        logger.error(f"Failed to get system statistics: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health")
async def get_health_status():
    """Get system health status."""
    try:
        service = get_caption_api_service()
        health = service.get_health_status()
        return JSONResponse(content=health)
    except Exception as e:
        logger.error(f"Failed to get health status: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/models/{model_name}/stats")
async def get_model_usage_stats(model_name: str):
    """Get usage statistics for a specific model."""
    try:
        service = get_caption_api_service()
        stats = service.get_model_usage_stats(model_name)
        if stats is None:
            raise HTTPException(
                status_code=404,
                detail=f"No usage statistics found for model '{model_name}'",
            )
        return JSONResponse(content=stats)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get model usage stats: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/models/{model_name}/health")
async def get_model_health_status(model_name: str):
    """Get health status for a specific model."""
    try:
        service = get_caption_api_service()
        health = service.get_health_status(model_name)
        return JSONResponse(content=health)
    except Exception as e:
        logger.error(f"Failed to get model health status: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/models/{model_name}/circuit-breaker")
async def get_circuit_breaker_state(model_name: str):
    """Get circuit breaker state for a specific model."""
    try:
        service = get_caption_api_service()
        state = service.get_circuit_breaker_state(model_name)
        return JSONResponse(content=state)
    except Exception as e:
        logger.error(f"Failed to get circuit breaker state: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/queue")
async def get_queue_status():
    """Get request queue status."""
    try:
        service = get_caption_api_service()
        queue_status = service.get_queue_status()
        return JSONResponse(content=queue_status)
    except Exception as e:
        logger.error(f"Failed to get queue status: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
