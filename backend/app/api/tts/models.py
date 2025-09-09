"""
TTS API Models for Reynard Backend

Pydantic models for TTS API requests and responses.
"""

from typing import Dict, List, Optional
from pydantic import BaseModel, Field


class TTSSynthesisRequest(BaseModel):
    """Request model for TTS synthesis."""
    text: str = Field(..., description="Text to synthesize", min_length=1, max_length=10000)
    backend: Optional[str] = Field(None, description="TTS backend to use (kokoro, coqui, xtts)")
    voice: str = Field("default", description="Voice to use for synthesis")
    speed: float = Field(1.0, description="Speech speed multiplier", ge=0.5, le=2.0)
    lang: str = Field("en", description="Language code")
    to_ogg: bool = Field(False, description="Convert output to OGG format")
    to_opus: bool = Field(False, description="Convert output to Opus format")


class TTSSynthesisResponse(BaseModel):
    """Response model for TTS synthesis."""
    success: bool = Field(..., description="Whether synthesis was successful")
    audio_path: Optional[str] = Field(None, description="Path to generated audio file")
    audio_url: Optional[str] = Field(None, description="URL to access audio file")
    duration: Optional[float] = Field(None, description="Audio duration in seconds")
    backend_used: str = Field(..., description="Backend that was used")
    processing_time: float = Field(..., description="Processing time in seconds")
    error: Optional[str] = Field(None, description="Error message if synthesis failed")


class TTSBatchRequest(BaseModel):
    """Request model for batch TTS synthesis."""
    texts: List[str] = Field(..., description="List of texts to synthesize", min_length=1, max_length=100)
    backend: Optional[str] = Field(None, description="TTS backend to use")
    voice: str = Field("default", description="Voice to use for synthesis")
    speed: float = Field(1.0, description="Speech speed multiplier", ge=0.5, le=2.0)
    lang: str = Field("en", description="Language code")
    to_ogg: bool = Field(False, description="Convert output to OGG format")
    to_opus: bool = Field(False, description="Convert output to Opus format")


class TTSBatchResponse(BaseModel):
    """Response model for batch TTS synthesis."""
    success: bool = Field(..., description="Whether batch synthesis was successful")
    results: List[TTSSynthesisResponse] = Field(..., description="Individual synthesis results")
    total_processing_time: float = Field(..., description="Total processing time in seconds")
    error: Optional[str] = Field(None, description="Error message if batch synthesis failed")


class TTSVoiceInfo(BaseModel):
    """Model for voice information."""
    name: str = Field(..., description="Voice name")
    language: str = Field(..., description="Language code")
    gender: Optional[str] = Field(None, description="Voice gender")
    description: Optional[str] = Field(None, description="Voice description")
    available: bool = Field(..., description="Whether voice is available")


class TTSBackendInfo(BaseModel):
    """Model for backend information."""
    name: str = Field(..., description="Backend name")
    enabled: bool = Field(..., description="Whether backend is enabled")
    available: bool = Field(..., description="Whether backend is available")
    voices: List[TTSVoiceInfo] = Field(..., description="Available voices")
    supported_languages: List[str] = Field(..., description="Supported languages")
    supported_formats: List[str] = Field(..., description="Supported output formats")


class TTSConfigRequest(BaseModel):
    """Request model for TTS configuration updates."""
    default_backend: Optional[str] = Field(None, description="Default backend to use")
    default_voice: Optional[str] = Field(None, description="Default voice to use")
    default_speed: Optional[float] = Field(None, description="Default speech speed", ge=0.5, le=2.0)
    default_language: Optional[str] = Field(None, description="Default language")
    max_text_length: Optional[int] = Field(None, description="Maximum text length", ge=100, le=50000)
    chunk_size: Optional[int] = Field(None, description="Text chunk size for long texts", ge=100, le=5000)
    enable_audio_processing: Optional[bool] = Field(None, description="Enable audio processing")
    output_directory: Optional[str] = Field(None, description="Output directory for audio files")


class TTSConfigResponse(BaseModel):
    """Response model for TTS configuration."""
    default_backend: str = Field(..., description="Default backend")
    default_voice: str = Field(..., description="Default voice")
    default_speed: float = Field(..., description="Default speech speed")
    default_language: str = Field(..., description="Default language")
    max_text_length: int = Field(..., description="Maximum text length")
    chunk_size: int = Field(..., description="Text chunk size")
    enable_audio_processing: bool = Field(..., description="Audio processing enabled")
    output_directory: str = Field(..., description="Output directory")
    backends: List[TTSBackendInfo] = Field(..., description="Available backends")


class TTSStatsResponse(BaseModel):
    """Response model for TTS statistics."""
    total_synthesis_requests: int = Field(..., description="Total synthesis requests")
    successful_synthesis: int = Field(..., description="Successful synthesis count")
    failed_synthesis: int = Field(..., description="Failed synthesis count")
    average_processing_time: float = Field(..., description="Average processing time")
    total_audio_generated: float = Field(..., description="Total audio duration generated")
    backend_usage: Dict[str, int] = Field(..., description="Backend usage statistics")
    voice_usage: Dict[str, int] = Field(..., description="Voice usage statistics")
    error_rate: float = Field(..., description="Error rate percentage")
