"""Data models for Diffusion-LLM service."""

from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class DiffusionConfig(BaseModel):
    """Configuration for diffusion service."""

    enabled: bool = Field(True, description="Whether diffusion service is enabled")
    default_model: str = Field("dreamon", description="Default model for generation")
    max_concurrent_requests: int = Field(
        3,
        description="Maximum concurrent generation requests",
    )
    device_preference: str = Field(
        "auto",
        description="Device preference (auto, cuda, cpu)",
    )
    memory_threshold: float = Field(
        0.8,
        description="Memory threshold for device switching",
    )
    timeout_seconds: int = Field(300, description="Request timeout in seconds")


class DiffusionGenerationParams(BaseModel):
    """Parameters for diffusion text generation."""

    model_config = ConfigDict(protected_namespaces=())

    text: str = Field(..., description="Input text for generation")
    model_id: str = Field("dreamon", description="Model ID to use")
    max_length: int = Field(512, description="Maximum generation length")
    temperature: float = Field(0.7, description="Sampling temperature")
    top_p: float = Field(0.9, description="Top-p sampling parameter")
    top_k: int = Field(50, description="Top-k sampling parameter")
    repetition_penalty: float = Field(1.1, description="Repetition penalty")
    stream: bool = Field(True, description="Enable streaming")


class DiffusionInfillingParams(BaseModel):
    """Parameters for diffusion text infilling."""

    model_config = ConfigDict(protected_namespaces=())

    prefix: str = Field(..., description="Text prefix")
    suffix: str = Field(..., description="Text suffix")
    model_id: str = Field("dreamon", description="Model ID to use")
    max_length: int = Field(256, description="Maximum infill length")
    temperature: float = Field(0.7, description="Sampling temperature")
    top_p: float = Field(0.9, description="Top-p sampling parameter")
    stream: bool = Field(True, description="Enable streaming")


class DiffusionModelInfo(BaseModel):
    """Information about a diffusion model."""

    model_config = ConfigDict(protected_namespaces=())

    model_id: str = Field(..., description="Model identifier")
    name: str = Field(..., description="Human-readable model name")
    description: str = Field("", description="Model description")
    max_length: int = Field(..., description="Maximum generation length")
    is_available: bool = Field(..., description="Whether model is currently available")
    device: str = Field("", description="Device the model is loaded on")
    memory_usage: float = Field(0.0, description="Memory usage in MB")


class DiffusionStats(BaseModel):
    """Statistics for diffusion service."""

    model_config = ConfigDict(protected_namespaces=())

    total_requests: int = Field(..., description="Total generation requests")
    successful_requests: int = Field(..., description="Successful generation requests")
    failed_requests: int = Field(..., description="Failed generation requests")
    average_processing_time: float = Field(
        ...,
        description="Average processing time in seconds",
    )
    total_tokens_generated: int = Field(..., description="Total tokens generated")
    model_usage: dict[str, int] = Field(..., description="Model usage statistics")
    device_usage: dict[str, int] = Field(..., description="Device usage statistics")
    error_rate: float = Field(..., description="Error rate percentage")


class DiffusionStreamEvent(BaseModel):
    """Event model for streaming diffusion responses."""

    type: str = Field(..., description="Event type (token, complete, error)")
    data: str = Field("", description="Event data (token text or error message)")
    timestamp: float = Field(..., description="Event timestamp")
    metadata: dict[str, Any] = Field(
        default_factory=dict,
        description="Additional metadata",
    )
