"""
Caption API endpoints for Reynard Backend.

This module provides the core caption generation endpoints
separated from upload and monitoring functionality.
"""

import logging
from typing import Dict, List

from fastapi import APIRouter, HTTPException, status
from fastapi.responses import JSONResponse

from .models import CaptionRequest, BatchCaptionRequest, CaptionResponse, GeneratorInfo, ModelLoadRequest
from .service import get_caption_api_service

logger = logging.getLogger("uvicorn")

router = APIRouter(prefix="/caption", tags=["caption"])


@router.get("/generators", response_model=Dict[str, GeneratorInfo])
async def get_available_generators():
    """Get information about all available caption generators."""
    try:
        service = get_caption_api_service()
        return service.get_available_generators()
    except Exception as e:
        logger.error(f"Failed to get available generators: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/generators/{generator_name}", response_model=GeneratorInfo)
async def get_generator_info(generator_name: str):
    """Get information about a specific caption generator."""
    try:
        service = get_caption_api_service()
        info = service.get_generator_info(generator_name)
        
        if not info:
            raise HTTPException(status_code=404, detail=f"Generator '{generator_name}' not found")
        
        return info
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get generator info for {generator_name}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/generate", response_model=CaptionResponse)
async def generate_caption(request: CaptionRequest):
    """Generate a caption for a single image."""
    try:
        service = get_caption_api_service()
        return await service.generate_single_caption(request)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Failed to generate caption: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/batch", response_model=List[CaptionResponse])
async def generate_batch_captions(request: BatchCaptionRequest):
    """Generate captions for multiple images in batch."""
    try:
        service = get_caption_api_service()
        return await service.generate_batch_captions(request)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Failed to generate batch captions: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/models/{model_name}/load")
async def load_model(model_name: str, request: ModelLoadRequest):
    """Load a specific caption model."""
    try:
        service = get_caption_api_service()
        success = await service.load_model(model_name, request.config)
        
        if success:
            return {"message": f"Model '{model_name}' loaded successfully"}
        else:
            raise HTTPException(
                status_code=500, 
                detail=f"Failed to load model '{model_name}'"
            )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Failed to load model {model_name}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/models/{model_name}/unload")
async def unload_model(model_name: str):
    """Unload a specific caption model."""
    try:
        service = get_caption_api_service()
        success = await service.unload_model(model_name)
        
        if success:
            return {"message": f"Model '{model_name}' unloaded successfully"}
        else:
            raise HTTPException(
                status_code=500, 
                detail=f"Failed to unload model '{model_name}'"
            )
    except Exception as e:
        logger.error(f"Failed to unload model {model_name}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/models/loaded")
async def get_loaded_models():
    """Get list of currently loaded models."""
    try:
        service = get_caption_api_service()
        loaded_models = service.get_loaded_models()
        
        return {
            "loaded_models": loaded_models,
            "count": len(loaded_models)
        }
    except Exception as e:
        logger.error(f"Failed to get loaded models: {e}")
        raise HTTPException(status_code=500, detail=str(e))
