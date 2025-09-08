"""
Reynard Caption Generation API

This module provides FastAPI endpoints for the Reynard caption generation system.
It exposes the sophisticated caption generation capabilities through a clean REST API.

Endpoints:
- GET /caption/generators - List available caption generators
- GET /caption/generators/{name} - Get specific generator information
- POST /caption/generate - Generate caption for a single image
- POST /caption/batch - Generate captions for multiple images
- POST /caption/models/{name}/load - Load a specific model
- POST /caption/models/{name}/unload - Unload a specific model
- GET /caption/models/loaded - Get list of loaded models
"""

import asyncio
import logging
from pathlib import Path
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, BackgroundTasks, HTTPException, UploadFile, File, Form
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

from ..caption_generation import get_caption_service, CaptionTask, CaptionResult

logger = logging.getLogger("uvicorn")

router = APIRouter(prefix="/caption", tags=["caption"])


class CaptionRequest(BaseModel):
    """Request model for single caption generation."""
    
    image_path: str = Field(..., description="Path to the image file")
    generator_name: str = Field(..., description="Name of the caption generator")
    config: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Generator configuration")
    force: bool = Field(default=False, description="Force regeneration even if caption exists")
    post_process: bool = Field(default=True, description="Apply post-processing to caption")


class BatchCaptionRequest(BaseModel):
    """Request model for batch caption generation."""
    
    tasks: List[CaptionRequest] = Field(..., description="List of caption generation tasks")
    max_concurrent: int = Field(default=4, description="Maximum number of concurrent operations")


class CaptionResponse(BaseModel):
    """Response model for caption generation."""
    
    success: bool
    image_path: str
    generator_name: str
    caption: Optional[str] = None
    error: Optional[str] = None
    error_type: Optional[str] = None
    retryable: bool = False
    processing_time: Optional[float] = None
    caption_type: Optional[str] = None


class GeneratorInfo(BaseModel):
    """Information about a caption generator."""
    
    model_config = {"protected_namespaces": ()}
    
    name: str
    description: str
    version: str
    caption_type: str
    is_available: bool
    is_loaded: bool
    config_schema: Dict[str, Any]
    features: List[str]
    model_category: str


class ModelLoadRequest(BaseModel):
    """Request model for loading a caption model."""
    
    config: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Model configuration")


@router.get("/generators", response_model=Dict[str, GeneratorInfo])
async def get_available_generators():
    """Get information about all available caption generators."""
    try:
        service = get_caption_service()
        generators = service.get_available_generators()
        
        return {
            name: GeneratorInfo(**info) 
            for name, info in generators.items()
        }
    except Exception as e:
        logger.error(f"Failed to get available generators: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/generators/{generator_name}", response_model=GeneratorInfo)
async def get_generator_info(generator_name: str):
    """Get information about a specific caption generator."""
    try:
        service = get_caption_service()
        info = service.get_generator_info(generator_name)
        
        if not info:
            raise HTTPException(status_code=404, detail=f"Generator '{generator_name}' not found")
        
        return GeneratorInfo(**info)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get generator info for {generator_name}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/generate", response_model=CaptionResponse)
async def generate_caption(request: CaptionRequest):
    """Generate a caption for a single image."""
    try:
        service = get_caption_service()
        
        # Validate image path
        image_path = Path(request.image_path)
        if not image_path.exists():
            raise HTTPException(status_code=404, detail=f"Image not found: {request.image_path}")
        
        # Check if generator is available
        if not service.is_generator_available(request.generator_name):
            raise HTTPException(
                status_code=400, 
                detail=f"Generator '{request.generator_name}' is not available"
            )
        
        # Generate caption
        result = await service.generate_single_caption(
            image_path=image_path,
            generator_name=request.generator_name,
            config=request.config,
            force=request.force
        )
        
        return CaptionResponse(
            success=result.success,
            image_path=str(result.image_path),
            generator_name=result.generator_name,
            caption=result.caption,
            error=result.error,
            error_type=result.error_type,
            retryable=result.retryable,
            processing_time=result.processing_time,
            caption_type=result.caption_type
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to generate caption: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/batch", response_model=List[CaptionResponse])
async def generate_batch_captions(request: BatchCaptionRequest):
    """Generate captions for multiple images in batch."""
    try:
        service = get_caption_service()
        
        # Validate all image paths
        tasks = []
        for task_request in request.tasks:
            image_path = Path(task_request.image_path)
            if not image_path.exists():
                raise HTTPException(
                    status_code=404, 
                    detail=f"Image not found: {task_request.image_path}"
                )
            
            # Check if generator is available
            if not service.is_generator_available(task_request.generator_name):
                raise HTTPException(
                    status_code=400, 
                    detail=f"Generator '{task_request.generator_name}' is not available"
                )
            
            tasks.append(CaptionTask(
                image_path=image_path,
                generator_name=task_request.generator_name,
                config=task_request.config,
                force=task_request.force,
                post_process=task_request.post_process
            ))
        
        # Generate captions
        results = await service.generate_batch_captions(
            tasks=tasks,
            max_concurrent=request.max_concurrent
        )
        
        return [
            CaptionResponse(
                success=result.success,
                image_path=str(result.image_path),
                generator_name=result.generator_name,
                caption=result.caption,
                error=result.error,
                error_type=result.error_type,
                retryable=result.retryable,
                processing_time=result.processing_time,
                caption_type=result.caption_type
            )
            for result in results
        ]
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to generate batch captions: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/models/{model_name}/load")
async def load_model(model_name: str, request: ModelLoadRequest):
    """Load a specific caption model."""
    try:
        service = get_caption_service()
        
        # Check if generator exists
        if not service.is_generator_available(model_name):
            raise HTTPException(
                status_code=404, 
                detail=f"Generator '{model_name}' not found"
            )
        
        # Load the model
        success = await service.load_model(model_name)
        
        if success:
            return {"message": f"Model '{model_name}' loaded successfully"}
        else:
            raise HTTPException(
                status_code=500, 
                detail=f"Failed to load model '{model_name}'"
            )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to load model {model_name}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/models/{model_name}/unload")
async def unload_model(model_name: str):
    """Unload a specific caption model."""
    try:
        service = get_caption_service()
        
        # Unload the model
        success = await service.unload_model(model_name)
        
        if success:
            return {"message": f"Model '{model_name}' unloaded successfully"}
        else:
            raise HTTPException(
                status_code=500, 
                detail=f"Failed to unload model '{model_name}'"
            )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to unload model {model_name}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/models/loaded")
async def get_loaded_models():
    """Get list of currently loaded models."""
    try:
        service = get_caption_service()
        loaded_models = service.get_loaded_models()
        
        return {
            "loaded_models": list(loaded_models),
            "count": len(loaded_models)
        }
        
    except Exception as e:
        logger.error(f"Failed to get loaded models: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/upload")
async def upload_and_generate_caption(
    file: UploadFile = File(...),
    generator_name: str = Form(...),
    config: Optional[str] = Form(None),
    force: bool = Form(False),
    post_process: bool = Form(True)
):
    """Upload an image and generate a caption for it."""
    try:
        service = get_caption_service()
        
        # Check if generator is available
        if not service.is_generator_available(generator_name):
            raise HTTPException(
                status_code=400, 
                detail=f"Generator '{generator_name}' is not available"
            )
        
        # Save uploaded file temporarily
        temp_path = Path(f"/tmp/{file.filename}")
        with open(temp_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        try:
            # Parse config if provided
            import json
            config_dict = json.loads(config) if config else {}
            
            # Generate caption
            result = await service.generate_single_caption(
                image_path=temp_path,
                generator_name=generator_name,
                config=config_dict,
                force=force
            )
            
            return CaptionResponse(
                success=result.success,
                image_path=file.filename,
                generator_name=result.generator_name,
                caption=result.caption,
                error=result.error,
                error_type=result.error_type,
                retryable=result.retryable,
                processing_time=result.processing_time,
                caption_type=result.caption_type
            )
            
        finally:
            # Clean up temporary file
            if temp_path.exists():
                temp_path.unlink()
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to upload and generate caption: {e}")
        raise HTTPException(status_code=500, detail=str(e))
