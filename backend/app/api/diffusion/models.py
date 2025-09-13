"""
Pydantic models for Diffusion-LLM API endpoints.
"""

from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field, ConfigDict


class DiffusionGenerationRequest(BaseModel):
    """Request model for diffusion text generation."""
    text: str = Field(..., description="Input text for generation", min_length=1, max_length=10000)
    model_id: str = Field("dreamon", description="Model ID to use for generation")
    max_length: int = Field(512, description="Maximum generation length", ge=1, le=2048)
    temperature: float = Field(0.7, description="Sampling temperature", ge=0.1, le=2.0)
    top_p: float = Field(0.9, description="Top-p sampling parameter", ge=0.1, le=1.0)
    top_k: int = Field(50, description="Top-k sampling parameter", ge=1, le=100)
    repetition_penalty: float = Field(1.1, description="Repetition penalty", ge=1.0, le=2.0)
    stream: bool = Field(True, description="Enable streaming response")


class DiffusionInfillingRequest(BaseModel):
    """Request model for diffusion text infilling."""
    prefix: str = Field(..., description="Text prefix", min_length=1, max_length=5000)
    suffix: str = Field(..., description="Text suffix", min_length=1, max_length=5000)
    model_id: str = Field("dreamon", description="Model ID to use for infilling")
    max_length: int = Field(256, description="Maximum infill length", ge=1, le=1024)
    temperature: float = Field(0.7, description="Sampling temperature", ge=0.1, le=2.0)
    top_p: float = Field(0.9, description="Top-p sampling parameter", ge=0.1, le=1.0)
    stream: bool = Field(True, description="Enable streaming response")


class DiffusionGenerationResponse(BaseModel):
    """Response model for diffusion text generation."""
    success: bool = Field(..., description="Whether generation was successful")
    generated_text: str = Field("", description="Generated text")
    model_id: str = Field(..., description="Model used for generation")
    processing_time: float = Field(..., description="Processing time in seconds")
    tokens_generated: int = Field(0, description="Number of tokens generated")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Additional metadata")


class DiffusionInfillingResponse(BaseModel):
    """Response model for diffusion text infilling."""
    success: bool = Field(..., description="Whether infilling was successful")
    infilled_text: str = Field("", description="Infilled text")
    model_id: str = Field(..., description="Model used for infilling")
    processing_time: float = Field(..., description="Processing time in seconds")
    tokens_generated: int = Field(0, description="Number of tokens generated")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Additional metadata")


class DiffusionStreamEvent(BaseModel):
    """Event model for streaming diffusion responses."""
    type: str = Field(..., description="Event type (token, complete, error)")
    data: str = Field("", description="Event data (token text or error message)")
    timestamp: float = Field(..., description="Event timestamp")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Additional metadata")


class DiffusionModelInfo(BaseModel):
    """Information about a diffusion model."""
    model_id: str = Field(..., description="Model identifier")
    name: str = Field(..., description="Human-readable model name")
    description: str = Field("", description="Model description")
    max_length: int = Field(..., description="Maximum generation length")
    is_available: bool = Field(..., description="Whether model is currently available")
    device: str = Field("", description="Device the model is loaded on")
    memory_usage: float = Field(0.0, description="Memory usage in MB")


class DiffusionConfig(BaseModel):
    """Configuration for diffusion service."""
    enabled: bool = Field(True, description="Whether diffusion service is enabled")
    default_model: str = Field("dreamon", description="Default model for generation")
    max_concurrent_requests: int = Field(3, description="Maximum concurrent generation requests")
    device_preference: str = Field("auto", description="Device preference (auto, cuda, cpu)")
    memory_threshold: float = Field(0.8, description="Memory threshold for device switching")
    timeout_seconds: int = Field(300, description="Request timeout in seconds")


class DiffusionStats(BaseModel):
    """Statistics for diffusion service."""
    model_config = ConfigDict(protected_namespaces=())
    
    total_requests: int = Field(..., description="Total generation requests")
    successful_requests: int = Field(..., description="Successful generation requests")
    failed_requests: int = Field(..., description="Failed generation requests")
    average_processing_time: float = Field(..., description="Average processing time in seconds")
    total_tokens_generated: int = Field(..., description="Total tokens generated")
    model_usage: Dict[str, int] = Field(..., description="Model usage statistics")
    device_usage: Dict[str, int] = Field(..., description="Device usage statistics")
    error_rate: float = Field(..., description="Error rate percentage")
