"""
TTS API Endpoints for Reynard Backend

Core TTS synthesis endpoints.
"""

import logging
import time
from pathlib import Path

from fastapi import APIRouter, HTTPException, status, UploadFile, File, Form
from fastapi.responses import FileResponse

from .models import (
    TTSSynthesisRequest, TTSSynthesisResponse,
    TTSBatchRequest, TTSBatchResponse,
    TTSConfigRequest, TTSConfigResponse
)
from .service import get_tts_service

logger = logging.getLogger("uvicorn")

router = APIRouter(prefix="/api/tts", tags=["tts"])


@router.post("/synthesize", response_model=TTSSynthesisResponse)
async def synthesize_text(request: TTSSynthesisRequest):
    """Synthesize text to speech."""
    try:
        service = get_tts_service()
        result = await service.synthesize_text(
            text=request.text,
            backend=request.backend,
            voice=request.voice,
            speed=request.speed,
            lang=request.lang,
            to_ogg=request.to_ogg,
            to_opus=request.to_opus
        )
        return TTSSynthesisResponse(**result)
    except Exception as e:
        logger.error(f"TTS synthesis failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"TTS synthesis failed: {str(e)}"
        )


@router.post("/synthesize/batch", response_model=TTSBatchResponse)
async def synthesize_batch(request: TTSBatchRequest):
    """Synthesize multiple texts to speech."""
    try:
        service = get_tts_service()
        result = await service.synthesize_batch(
            texts=request.texts,
            backend=request.backend,
            voice=request.voice,
            speed=request.speed,
            lang=request.lang,
            to_ogg=request.to_ogg,
            to_opus=request.to_opus
        )
        return TTSBatchResponse(**result)
    except Exception as e:
        logger.error(f"Batch TTS synthesis failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Batch TTS synthesis failed: {str(e)}"
        )


@router.get("/audio/{filename}")
async def get_audio_file(filename: str):
    """Get generated audio file."""
    try:
        service = get_tts_service()
        audio_dir = Path("generated/audio")
        audio_path = audio_dir / filename
        
        if not audio_path.exists():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Audio file not found"
            )
        
        return FileResponse(
            path=str(audio_path),
            media_type="audio/wav",
            filename=filename
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get audio file: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get audio file: {str(e)}"
        )


@router.get("/config", response_model=TTSConfigResponse)
async def get_tts_config():
    """Get current TTS configuration."""
    try:
        service = get_tts_service()
        config = await service.get_config()
        return TTSConfigResponse(**config)
    except Exception as e:
        logger.error(f"Failed to get TTS config: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get TTS config: {str(e)}"
        )


@router.post("/config", response_model=TTSConfigResponse)
async def update_tts_config(request: TTSConfigRequest):
    """Update TTS configuration."""
    try:
        service = get_tts_service()
        
        # Convert request to dict, excluding None values
        config_dict = request.dict(exclude_unset=True)
        await service.update_config(config_dict)
        
        # Return updated config
        updated_config = await service.get_config()
        return TTSConfigResponse(**updated_config)
    except Exception as e:
        logger.error(f"Failed to update TTS config: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update TTS config: {str(e)}"
        )


@router.post("/voice-clone")
async def synthesize_with_voice_clone(
    text: str = Form(...),
    reference_audio: UploadFile = File(...),
    speed: float = Form(1.0),
    lang: str = Form("en")
):
    """Synthesize text with voice cloning using XTTS."""
    try:
        service = get_tts_service()
        
        # Save reference audio temporarily
        temp_dir = Path("temp/voice_clone")
        temp_dir.mkdir(parents=True, exist_ok=True)
        reference_path = temp_dir / f"ref_{reference_audio.filename}"
        
        with open(reference_path, "wb") as f:
            content = await reference_audio.read()
            f.write(content)
        
        # Generate output path
        output_dir = Path("generated/audio")
        output_dir.mkdir(parents=True, exist_ok=True)
        output_path = output_dir / f"cloned_{int(time.time())}.wav"
        
        # Perform voice cloning synthesis
        result_path = await service.synthesize_with_voice_clone(
            text=text,
            out_path=output_path,
            reference_audio=reference_path,
            speed=speed,
            lang=lang
        )
        
        # Clean up reference audio
        reference_path.unlink(missing_ok=True)
        
        return {
            "success": True,
            "audio_path": str(result_path),
            "audio_url": f"/api/tts/audio/{result_path.name}",
            "backend_used": "xtts",
            "processing_time": 0.0,
            "error": None
        }
        
    except Exception as e:
        logger.error(f"Voice cloning synthesis failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Voice cloning synthesis failed: {str(e)}"
        )
