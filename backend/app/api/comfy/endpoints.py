"""
ComfyUI API Endpoints

REST API endpoints for ComfyUI workflow automation and management.
"""

import hashlib
import json
import logging
import time
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Request
from fastapi.responses import Response, StreamingResponse

from gatekeeper.api.dependencies import require_active_user
from gatekeeper.models.user import User
from ...services.comfy.service_initializer import get_comfy_service, initialize_comfy_service
from .models import (
    ComfyQueueRequest,
    ComfyText2ImgRequest,
    ComfyWorkflowRequest,
    ComfyPresetRequest,
    ComfyWorkflowTemplateRequest,
    ComfyIngestRequest,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/comfy", tags=["comfy"])

# Service will be initialized by the service initializer


@router.get("/health")
async def health_check(current_user: User = Depends(require_active_user)):
    """Check ComfyUI service health."""
    try:
        service = get_comfy_service()
        health_info = await service.health_check()
        return health_info
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"ComfyUI health check error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/health/force-check")
async def force_health_check(current_user: User = Depends(require_active_user)):
    """Force a health check."""
    try:
        service = get_comfy_service()
        health_info = await service.health_check()
        service_info = service.get_info()
        return {
            "result": health_info.get("status", "unknown"),
            "connection_state": service_info.get("connection_state"),
            "connection_attempts": service_info.get("connection_attempts"),
            "base_url": service_info.get("api_url"),
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"ComfyUI force health check error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/queue")
async def queue_prompt(
    request: ComfyQueueRequest,
    current_user: User = Depends(require_active_user)
):
    """Queue a ComfyUI workflow for execution."""
    try:
        service = get_comfy_service()
        result = await service.queue_prompt(request.workflow, request.client_id)
        return {
            "prompt_id": result.prompt_id,
            "client_id": result.client_id
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"ComfyUI queue error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/status/{prompt_id}")
async def get_status(
    prompt_id: str,
    current_user: User = Depends(require_active_user)
):
    """Get the status of a queued prompt."""
    try:
        service = get_comfy_service()
        result = await service.check_status(prompt_id)
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"ComfyUI status error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/history/{prompt_id}")
async def get_history(
    prompt_id: str,
    current_user: User = Depends(require_active_user)
):
    """Get the history for a prompt."""
    try:
        service = get_comfy_service()
        result = await service.get_history(prompt_id)
        return {
            "prompt_id": prompt_id,
            "status": result.get("status"),
            "progress": result.get("progress"),
            "images": result.get("images", []),
            "items": result.get("items", []),
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"ComfyUI history error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/object-info")
async def get_object_info(
    refresh: bool = False,
    current_user: User = Depends(require_active_user),
    request: Request = None
):
    """Get ComfyUI object information."""
    try:
        service = get_comfy_service()
        
        # Check ETag for cache validation
        if not refresh and request:
            etag = service.get_object_info_etag()
            if etag:
                if_none_match = request.headers.get("if-none-match")
                if if_none_match and if_none_match.strip('"') == etag:
                    return Response(status_code=304)
        
        result = await service.get_object_info(force_refresh=refresh)
        
        # Return with ETag header
        etag = service.get_object_info_etag()
        response = Response(content=json.dumps(result), media_type="application/json")
        if etag:
            response.headers["ETag"] = f'"{etag}"'
        return response
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"ComfyUI object-info error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/view")
async def view_image(
    filename: str,
    subfolder: str = "",
    type: str = "output",
    current_user: User = Depends(require_active_user)
):
    """View a generated image."""
    try:
        service = get_comfy_service()
        blob = await service.get_image(filename, subfolder, type)
        return Response(content=blob, media_type="image/png")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"ComfyUI view error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/text2img")
async def text2img(
    request: ComfyText2ImgRequest,
    current_user: User = Depends(require_active_user)
):
    """Generate an image from text using a simple workflow."""
    try:
        service = get_comfy_service()
        
        # Create a simple text-to-image workflow
        workflow = create_simple_text2img_workflow(
            caption=request.caption,
            negative=request.negative,
            width=request.width or 1024,
            height=request.height or 1024,
            steps=request.steps or 24,
            cfg=request.cfg or 5.5,
            seed=request.seed,
            checkpoint=request.checkpoint,
            sampler=request.sampler,
            scheduler=request.scheduler
        )
        
        result = await service.queue_prompt(workflow)
        return {"prompt_id": result.prompt_id}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"ComfyUI text2img error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/ingest")
async def ingest_generated_image(
    file: UploadFile = File(...),
    prompt_id: str = Form(...),
    workflow: str = Form(...),
    metadata: str = Form("{}"),
    current_user: User = Depends(require_active_user)
):
    """Ingest a generated image into the gallery."""
    try:
        service = get_comfy_service()
        service_info = service.get_info()
        image_dir = Path(service_info.get("image_dir", "generated/comfy"))
        
        # Create date-based subfolder
        today = datetime.now().strftime("%Y-%m-%d")
        date_dir = image_dir / today
        date_dir.mkdir(parents=True, exist_ok=True)
        
        # Read uploaded file content
        content = await file.read()
        if not content:
            raise HTTPException(status_code=400, detail="Empty file uploaded")
        
        # Compute content hash for deduplication
        file_hash = hashlib.sha256(content).hexdigest()
        
        # Determine file extension
        ext = Path(file.filename).suffix.lower() if file.filename else ".png"
        if not ext or ext not in [".png", ".jpg", ".jpeg", ".webp"]:
            ext = ".png"
        
        # Create filename with hash
        filename = f"comfy_{file_hash[:16]}{ext}"
        dest_path = date_dir / filename
        sidecar_path = dest_path.with_suffix(".json")
        
        # Check for existing file (deduplication)
        if dest_path.exists():
            return {
                "success": True,
                "image_path": str(dest_path),
                "metadata_path": str(sidecar_path),
                "deduplicated": True,
                "message": "Image already exists",
            }
        
        # Write the image file
        with open(dest_path, "wb") as f:
            f.write(content)
        
        # Parse workflow and metadata
        try:
            workflow_data = json.loads(workflow) if workflow else {}
        except json.JSONDecodeError:
            workflow_data = {"raw_workflow": workflow}
        
        try:
            metadata_data = json.loads(metadata) if metadata else {}
        except json.JSONDecodeError:
            metadata_data = {"raw_metadata": metadata}
        
        # Create sidecar metadata
        sidecar_data = {
            "hash": file_hash,
            "prompt_id": prompt_id,
            "workflow": workflow_data,
            "ingested_by": current_user.username,
            "ingested_at": datetime.now().isoformat(),
            "original_filename": file.filename,
            "file_size": len(content),
            "content_type": file.content_type,
        }
        sidecar_data.update(metadata_data)
        
        # Write sidecar JSON
        with open(sidecar_path, "w", encoding="utf-8") as f:
            json.dump(sidecar_data, f, ensure_ascii=False, indent=2)
        
        return {
            "success": True,
            "image_path": str(dest_path),
            "metadata_path": str(sidecar_path),
            "deduplicated": False,
            "message": "Image ingested successfully",
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error ingesting ComfyUI image: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/stream/{prompt_id}")
async def stream_status(
    prompt_id: str,
    current_user: User = Depends(require_active_user)
):
    """Stream status updates for a prompt."""
    try:
        service = get_comfy_service()
        
        async def event_stream():
            try:
                async for event in service.stream_status(prompt_id):
                    yield f"data: {json.dumps(event)}\n\n"
            except Exception as e:
                logger.error(f"ComfyUI stream error: {e}")
                yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"
        
        return StreamingResponse(
            event_stream(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "Access-Control-Allow-Origin": "*",
            },
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"ComfyUI stream error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/validate/checkpoint/{checkpoint}")
async def validate_checkpoint(
    checkpoint: str,
    current_user: User = Depends(require_active_user)
):
    """Validate checkpoint and suggest alternatives."""
    try:
        service = get_comfy_service()
        result = await service.validate_checkpoint(checkpoint)
        return {
            "is_valid": result.is_valid,
            "suggestions": result.suggestions,
            "errors": result.errors
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"ComfyUI checkpoint validation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/validate/lora/{lora}")
async def validate_lora(
    lora: str,
    current_user: User = Depends(require_active_user)
):
    """Validate LoRA and suggest alternatives."""
    try:
        service = get_comfy_service()
        result = await service.validate_lora(lora)
        return {
            "is_valid": result.is_valid,
            "suggestions": result.suggestions,
            "errors": result.errors
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"ComfyUI LoRA validation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/validate/sampler/{sampler}")
async def validate_sampler(
    sampler: str,
    current_user: User = Depends(require_active_user)
):
    """Validate sampler and suggest alternatives."""
    try:
        service = get_comfy_service()
        result = await service.validate_sampler(sampler)
        return {
            "is_valid": result.is_valid,
            "suggestions": result.suggestions,
            "errors": result.errors
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"ComfyUI sampler validation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/validate/scheduler/{scheduler}")
async def validate_scheduler(
    scheduler: str,
    current_user: User = Depends(require_active_user)
):
    """Validate scheduler and suggest alternatives."""
    try:
        service = get_comfy_service()
        result = await service.validate_scheduler(scheduler)
        return {
            "is_valid": result.is_valid,
            "suggestions": result.suggestions,
            "errors": result.errors
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"ComfyUI scheduler validation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


def create_simple_text2img_workflow(
    caption: str,
    negative: Optional[str] = None,
    width: int = 1024,
    height: int = 1024,
    steps: int = 24,
    cfg: float = 5.5,
    seed: Optional[int] = None,
    checkpoint: Optional[str] = None,
    sampler: Optional[str] = None,
    scheduler: Optional[str] = None
) -> Dict[str, Any]:
    """Create a simple text-to-image workflow."""
    import uuid
    
    # Generate unique node IDs
    checkpoint_loader = str(uuid.uuid4())
    clip_text_encode = str(uuid.uuid4())
    clip_text_encode_2 = str(uuid.uuid4())
    ksampler = str(uuid.uuid4())
    vae_decode = str(uuid.uuid4())
    save_image = str(uuid.uuid4())
    
    workflow = {
        checkpoint_loader: {
            "class_type": "CheckpointLoaderSimple",
            "inputs": {
                "ckpt_name": checkpoint or "v1-5-pruned-emaonly.ckpt"
            }
        },
        clip_text_encode: {
            "class_type": "CLIPTextEncode",
            "inputs": {
                "text": caption,
                "clip": [checkpoint_loader, 1]
            }
        },
        clip_text_encode_2: {
            "class_type": "CLIPTextEncode",
            "inputs": {
                "text": negative or "",
                "clip": [checkpoint_loader, 1]
            }
        },
        ksampler: {
            "class_type": "KSampler",
            "inputs": {
                "seed": seed or 42,
                "steps": steps,
                "cfg": cfg,
                "sampler_name": sampler or "euler",
                "scheduler": scheduler or "normal",
                "denoise": 1.0,
                "model": [checkpoint_loader, 0],
                "positive": [clip_text_encode, 0],
                "negative": [clip_text_encode_2, 0],
                "latent_image": ["4", 0]  # Empty latent
            }
        },
        vae_decode: {
            "class_type": "VAEDecode",
            "inputs": {
                "samples": [ksampler, 0],
                "vae": [checkpoint_loader, 2]
            }
        },
        save_image: {
            "class_type": "SaveImage",
            "inputs": {
                "filename_prefix": "ComfyUI",
                "images": [vae_decode, 0]
            }
        },
        "4": {
            "class_type": "EmptyLatentImage",
            "inputs": {
                "width": width,
                "height": height,
                "batch_size": 1
            }
        }
    }
    
    return workflow
