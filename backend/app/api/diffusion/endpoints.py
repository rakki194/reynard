"""
Core API endpoints for Diffusion-LLM service.
"""

import logging

from fastapi import APIRouter, HTTPException
from sse_starlette import EventSourceResponse

from .models import (
    DiffusionGenerationRequest,
    DiffusionGenerationResponse,
    DiffusionInfillingRequest,
    DiffusionInfillingResponse,
)
from .service import get_diffusion_service

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/generate", response_model=DiffusionGenerationResponse)
async def generate_text(request: DiffusionGenerationRequest):
    """Generate text using diffusion models."""
    try:
        service = get_diffusion_service()
        
        # Convert request to service params
        from ...services.diffusion.models import DiffusionGenerationParams
        params = DiffusionGenerationParams(
            text=request.text,
            model_id=request.model_id,
            max_length=request.max_length,
            temperature=request.temperature,
            top_p=request.top_p,
            top_k=request.top_k,
            repetition_penalty=request.repetition_penalty,
            stream=False  # Non-streaming for this endpoint
        )
        
        # Generate text
        generated_text = ""
        tokens_generated = 0
        processing_time = 0.0
        
        async for event in service.generate_stream(params):
            if event.type == "token":
                generated_text += event.data
                tokens_generated += 1
            elif event.type == "complete":
                processing_time = event.metadata.get("processing_time", 0.0)
            elif event.type == "error":
                raise HTTPException(status_code=500, detail=event.data)
        
        return DiffusionGenerationResponse(
            success=True,
            generated_text=generated_text,
            model_id=request.model_id,
            processing_time=processing_time,
            tokens_generated=tokens_generated
        )
        
    except Exception as e:
        logger.error(f"Text generation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/generate/stream")
async def generate_text_stream(request: DiffusionGenerationRequest):
    """Generate text with streaming support."""
    try:
        service = get_diffusion_service()
        
        # Convert request to service params
        from ...services.diffusion.models import DiffusionGenerationParams
        params = DiffusionGenerationParams(
            text=request.text,
            model_id=request.model_id,
            max_length=request.max_length,
            temperature=request.temperature,
            top_p=request.top_p,
            top_k=request.top_k,
            repetition_penalty=request.repetition_penalty,
            stream=True
        )
        
        async def event_generator():
            async for event in service.generate_stream(params):
                yield {
                    "type": event.type,
                    "data": event.data,
                    "timestamp": event.timestamp,
                    "metadata": event.metadata
                }
        
        return EventSourceResponse(event_generator())
        
    except Exception as e:
        logger.error(f"Streaming generation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/infill", response_model=DiffusionInfillingResponse)
async def infill_text(request: DiffusionInfillingRequest):
    """Infill text using diffusion models."""
    try:
        service = get_diffusion_service()
        
        # Convert request to service params
        from ...services.diffusion.models import DiffusionInfillingParams
        params = DiffusionInfillingParams(
            prefix=request.prefix,
            suffix=request.suffix,
            model_id=request.model_id,
            max_length=request.max_length,
            temperature=request.temperature,
            top_p=request.top_p,
            stream=False  # Non-streaming for this endpoint
        )
        
        # Infill text
        infilled_text = ""
        tokens_generated = 0
        processing_time = 0.0
        
        async for event in service.infill_stream(params):
            if event.type == "token":
                infilled_text += event.data
                tokens_generated += 1
            elif event.type == "complete":
                processing_time = event.metadata.get("processing_time", 0.0)
            elif event.type == "error":
                raise HTTPException(status_code=500, detail=event.data)
        
        return DiffusionInfillingResponse(
            success=True,
            infilled_text=infilled_text,
            model_id=request.model_id,
            processing_time=processing_time,
            tokens_generated=tokens_generated
        )
        
    except Exception as e:
        logger.error(f"Text infilling failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/infill/stream")
async def infill_text_stream(request: DiffusionInfillingRequest):
    """Infill text with streaming support."""
    try:
        service = get_diffusion_service()
        
        # Convert request to service params
        from ...services.diffusion.models import DiffusionInfillingParams
        params = DiffusionInfillingParams(
            prefix=request.prefix,
            suffix=request.suffix,
            model_id=request.model_id,
            max_length=request.max_length,
            temperature=request.temperature,
            top_p=request.top_p,
            stream=True
        )
        
        async def event_generator():
            async for event in service.infill_stream(params):
                yield {
                    "type": event.type,
                    "data": event.data,
                    "timestamp": event.timestamp,
                    "metadata": event.metadata
                }
        
        return EventSourceResponse(event_generator())
        
    except Exception as e:
        logger.error(f"Streaming infilling failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/models")
async def get_models():
    """Get available diffusion models."""
    try:
        service = get_diffusion_service()
        models = await service.get_available_models()
        return {"models": models}
        
    except Exception as e:
        logger.error(f"Failed to get models: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/config")
async def get_config():
    """Get current configuration."""
    try:
        service = get_diffusion_service()
        config = await service.get_config()
        return config
        
    except Exception as e:
        logger.error(f"Failed to get config: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/config")
async def update_config(config: dict):
    """Update configuration."""
    try:
        service = get_diffusion_service()
        success = await service.update_config(config)
        
        if not success:
            raise HTTPException(status_code=400, detail="Failed to update configuration")
        
        return {"success": True, "message": "Configuration updated successfully"}
        
    except Exception as e:
        logger.error(f"Failed to update config: {e}")
        raise HTTPException(status_code=500, detail=str(e))
