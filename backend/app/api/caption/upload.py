"""Caption upload endpoints for Reynard Backend.

This module provides file upload functionality for caption generation
with proper file handling and cleanup.
"""

import logging

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from .models import CaptionResponse
from .service import get_caption_api_service

logger = logging.getLogger("uvicorn")

router = APIRouter(prefix="/caption", tags=["caption-upload"])


@router.post("/upload", response_model=CaptionResponse)
async def upload_and_generate_caption(
    file: UploadFile = File(...),
    generator_name: str = Form(...),
    config: str | None = Form(None),
    force: bool = Form(False),
    post_process: bool = Form(True),
):
    """Upload an image and generate a caption for it."""
    try:
        service = get_caption_api_service()
        return await service.upload_and_generate_caption(
            file=file,
            generator_name=generator_name,
            config=config,
            force=force,
            post_process=post_process,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Failed to upload and generate caption: {e}")
        raise HTTPException(status_code=500, detail=str(e))
