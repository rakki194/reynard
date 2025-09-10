"""
Pydantic models for summarization API endpoints.
"""

from typing import Any, Dict, List, Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator


class SummarizationRequest(BaseModel):
    """Request model for text summarization."""

    text: str = Field(..., description="Text to summarize", min_length=50, max_length=100000)
    content_type: str = Field(
        default="general",
        description="Type of content",
        pattern="^(article|code|document|technical|general)$"
    )
    summary_level: str = Field(
        default="detailed",
        description="Level of detail for summary",
        pattern="^(brief|executive|detailed|comprehensive|bullet|tts_optimized)$"
    )
    max_length: Optional[int] = Field(
        default=None,
        description="Maximum length of summary in words",
        ge=10,
        le=5000
    )
    include_outline: bool = Field(
        default=False,
        description="Whether to include structured outline"
    )
    include_highlights: bool = Field(
        default=False,
        description="Whether to include important highlights"
    )
    model: Optional[str] = Field(
        default=None,
        description="Specific model to use for summarization"
    )
    temperature: float = Field(
        default=0.3,
        description="Temperature for text generation",
        ge=0.0,
        le=2.0
    )
    top_p: float = Field(
        default=0.9,
        description="Top-p for text generation",
        ge=0.0,
        le=1.0
    )

    @field_validator('text')
    @classmethod
    def validate_text(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError('Text cannot be empty or whitespace only')
        return v.strip()


class SummarizationResponse(BaseModel):
    """Response model for text summarization."""
    model_config = ConfigDict(protected_namespaces=())

    success: bool = Field(..., description="Whether summarization was successful")
    result: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Summarization result if successful"
    )
    error: Optional[str] = Field(
        default=None,
        description="Error message if summarization failed"
    )
    processing_time: float = Field(..., description="Processing time in seconds")
    model_used: Optional[str] = Field(
        default=None,
        description="Model used for summarization"
    )


class BatchSummarizationRequest(BaseModel):
    """Request model for batch summarization."""

    requests: List[Dict[str, Any]] = Field(
        ...,
        description="List of summarization requests",
        min_length=1,
        max_length=50
    )
    enable_streaming: bool = Field(
        default=False,
        description="Whether to stream progress updates"
    )

    @field_validator('requests')
    @classmethod
    def validate_requests(cls, v: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        for i, req in enumerate(v):
            if 'text' not in req:
                raise ValueError(f'Request {i} missing required field: text')
            if not req['text'] or not req['text'].strip():
                raise ValueError(f'Request {i} has empty text')
        return v


class ContentTypeDetectionRequest(BaseModel):
    """Request model for content type detection."""

    text: str = Field(..., description="Text to analyze", min_length=10, max_length=10000)

    @field_validator('text')
    @classmethod
    def validate_text(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError('Text cannot be empty or whitespace only')
        return v.strip()


class ContentTypeDetectionResponse(BaseModel):
    """Response model for content type detection."""

    content_type: str = Field(..., description="Detected content type")
    confidence: float = Field(
        default=0.0,
        description="Confidence score for detection",
        ge=0.0,
        le=1.0
    )


class SummarizationConfigRequest(BaseModel):
    """Request model for summarization configuration."""

    default_model: Optional[str] = Field(
        default=None,
        description="Default model for summarization"
    )
    default_content_type: Optional[str] = Field(
        default=None,
        description="Default content type",
        pattern="^(article|code|document|technical|general)$"
    )
    default_summary_level: Optional[str] = Field(
        default=None,
        description="Default summary level",
        pattern="^(brief|executive|detailed|comprehensive|bullet|tts_optimized)$"
    )
    max_text_length: Optional[int] = Field(
        default=None,
        description="Maximum text length for summarization",
        ge=100,
        le=200000
    )
    enable_caching: Optional[bool] = Field(
        default=None,
        description="Whether to enable result caching"
    )


class SummarizationConfigResponse(BaseModel):
    """Response model for summarization configuration."""

    success: bool = Field(..., description="Whether configuration was successful")
    message: str = Field(..., description="Configuration result message")
    config: Dict[str, Any] = Field(..., description="Current configuration")


class SummarizationStatsResponse(BaseModel):
    """Response model for summarization statistics."""
    model_config = ConfigDict(protected_namespaces=())

    total_requests: int = Field(..., description="Total number of requests processed")
    cache_hits: int = Field(..., description="Number of cache hits")
    cache_misses: int = Field(..., description="Number of cache misses")
    cache_hit_rate: float = Field(..., description="Cache hit rate")
    average_processing_time: float = Field(..., description="Average processing time")
    total_processing_time: float = Field(..., description="Total processing time")
    available_summarizers: List[str] = Field(..., description="Available summarizers")
    supported_content_types: Dict[str, List[str]] = Field(
        ...,
        description="Supported content types and their summarizers"
    )


class HealthCheckResponse(BaseModel):
    """Response model for health check."""

    status: str = Field(..., description="Service status")
    message: str = Field(..., description="Status message")
    details: Dict[str, Any] = Field(..., description="Detailed status information")
    timestamp: str = Field(..., description="Health check timestamp")
