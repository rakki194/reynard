"""Pydantic models for Diffusion-LLM API endpoints.
"""

import re
from typing import Any

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


class DiffusionGenerationRequest(BaseModel):
    """Request model for diffusion text generation with comprehensive validation."""

    model_config = ConfigDict(protected_namespaces=())

    text: str = Field(
        ..., description="Input text for generation", min_length=1, max_length=10000,
    )
    model_id: str = Field("dreamon", description="Model ID to use for generation")
    max_length: int = Field(512, description="Maximum generation length", ge=1, le=2048)
    temperature: float = Field(0.7, description="Sampling temperature", ge=0.1, le=2.0)
    top_p: float = Field(0.9, description="Top-p sampling parameter", ge=0.1, le=1.0)
    top_k: int = Field(50, description="Top-k sampling parameter", ge=1, le=100)
    repetition_penalty: float = Field(
        1.1, description="Repetition penalty", ge=1.0, le=2.0,
    )
    stream: bool = Field(True, description="Enable streaming response")

    @field_validator("text")
    @classmethod
    def validate_text(cls, v: str) -> str:
        """Validate input text for security and quality."""
        if not v or not v.strip():
            raise ValueError("Text cannot be empty or whitespace only")

        # Check for potential injection attempts
        dangerous_patterns = [
            r"<script[^>]*>.*?</script>",  # Script tags
            r"javascript:",  # JavaScript protocol
            r"data:text/html",  # Data URLs
            r"vbscript:",  # VBScript protocol
            r"on\w+\s*=",  # Event handlers
        ]

        for pattern in dangerous_patterns:
            if re.search(pattern, v, re.IGNORECASE):
                raise ValueError(
                    f"Text contains potentially dangerous content: {pattern}",
                )

        # Check for excessive repetition (potential spam)
        words = v.split()
        if len(words) > 10:
            word_counts = {}
            for word in words:
                word_counts[word] = word_counts.get(word, 0) + 1

            # Check if any word appears more than 30% of the time
            max_repetition = max(word_counts.values()) if word_counts else 0
            if max_repetition > len(words) * 0.3:
                raise ValueError("Text contains excessive repetition")

        return v.strip()

    @field_validator("model_id")
    @classmethod
    def validate_model_id(cls, v: str) -> str:
        """Validate model ID format and safety."""
        if not v or not v.strip():
            raise ValueError("Model ID cannot be empty")

        # Check for valid model ID format (alphanumeric, dash, underscore, dot)
        if not re.match(r"^[a-zA-Z0-9._-]+$", v):
            raise ValueError("Model ID contains invalid characters")

        # Check for reasonable length
        if len(v) > 100:
            raise ValueError("Model ID is too long")

        return v.strip()

    @model_validator(mode="after")
    def validate_request_consistency(self) -> "DiffusionGenerationRequest":
        """Validate overall request consistency."""
        # Check if max_length is reasonable for the input text
        text_length = len(str(getattr(self, "text", "")))
        if self.max_length < text_length * 0.5:
            raise ValueError("max_length may be too low for the input text length")

        # Check if temperature and top_p combination makes sense
        if self.temperature > 1.5 and self.top_p < 0.8:
            # High temperature with low top_p might be inefficient
            pass  # Just a warning, not an error

        return self


class DiffusionInfillingRequest(BaseModel):
    """Request model for diffusion text infilling with comprehensive validation."""

    model_config = ConfigDict(protected_namespaces=())

    prefix: str = Field(..., description="Text prefix", min_length=1, max_length=5000)
    suffix: str = Field(..., description="Text suffix", min_length=1, max_length=5000)
    model_id: str = Field("dreamon", description="Model ID to use for infilling")
    max_length: int = Field(256, description="Maximum infill length", ge=1, le=1024)
    temperature: float = Field(0.7, description="Sampling temperature", ge=0.1, le=2.0)
    top_p: float = Field(0.9, description="Top-p sampling parameter", ge=0.1, le=1.0)
    stream: bool = Field(True, description="Enable streaming response")

    @field_validator("prefix", "suffix")
    @classmethod
    def validate_text_parts(cls, v: str) -> str:
        """Validate prefix and suffix text for security and quality."""
        if not v or not v.strip():
            raise ValueError("Text part cannot be empty or whitespace only")

        # Check for potential injection attempts
        dangerous_patterns = [
            r"<script[^>]*>.*?</script>",  # Script tags
            r"javascript:",  # JavaScript protocol
            r"data:text/html",  # Data URLs
            r"vbscript:",  # VBScript protocol
            r"on\w+\s*=",  # Event handlers
        ]

        for pattern in dangerous_patterns:
            if re.search(pattern, v, re.IGNORECASE):
                raise ValueError(
                    f"Text contains potentially dangerous content: {pattern}",
                )

        return v.strip()

    @field_validator("model_id")
    @classmethod
    def validate_model_id(cls, v: str) -> str:
        """Validate model ID format and safety."""
        if not v or not v.strip():
            raise ValueError("Model ID cannot be empty")

        # Check for valid model ID format (alphanumeric, dash, underscore, dot)
        if not re.match(r"^[a-zA-Z0-9._-]+$", v):
            raise ValueError("Model ID contains invalid characters")

        # Check for reasonable length
        if len(v) > 100:
            raise ValueError("Model ID is too long")

        return v.strip()

    @model_validator(mode="after")
    def validate_request_consistency(self) -> "DiffusionInfillingRequest":
        """Validate overall request consistency."""
        # Check if max_length is reasonable for the combined text length
        combined_length = len(str(getattr(self, "prefix", ""))) + len(
            str(getattr(self, "suffix", "")),
        )
        if self.max_length < combined_length * 0.3:
            raise ValueError("max_length may be too low for the combined text length")

        return self


class DiffusionGenerationResponse(BaseModel):
    """Response model for diffusion text generation."""

    model_config = ConfigDict(protected_namespaces=())

    success: bool = Field(..., description="Whether generation was successful")
    generated_text: str = Field("", description="Generated text")
    model_id: str = Field(..., description="Model used for generation")
    processing_time: float = Field(..., description="Processing time in seconds")
    tokens_generated: int = Field(0, description="Number of tokens generated")
    metadata: dict[str, Any] = Field(
        default_factory=dict, description="Additional metadata",
    )


class DiffusionInfillingResponse(BaseModel):
    """Response model for diffusion text infilling."""

    model_config = ConfigDict(protected_namespaces=())

    success: bool = Field(..., description="Whether infilling was successful")
    infilled_text: str = Field("", description="Infilled text")
    model_id: str = Field(..., description="Model used for infilling")
    processing_time: float = Field(..., description="Processing time in seconds")
    tokens_generated: int = Field(0, description="Number of tokens generated")
    metadata: dict[str, Any] = Field(
        default_factory=dict, description="Additional metadata",
    )


class DiffusionStreamEvent(BaseModel):
    """Event model for streaming diffusion responses."""

    type: str = Field(..., description="Event type (token, complete, error)")
    data: str = Field("", description="Event data (token text or error message)")
    timestamp: float = Field(..., description="Event timestamp")
    metadata: dict[str, Any] = Field(
        default_factory=dict, description="Additional metadata",
    )


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


class DiffusionConfig(BaseModel):
    """Configuration for diffusion service."""

    enabled: bool = Field(True, description="Whether diffusion service is enabled")
    default_model: str = Field("dreamon", description="Default model for generation")
    max_concurrent_requests: int = Field(
        3, description="Maximum concurrent generation requests",
    )
    device_preference: str = Field(
        "auto", description="Device preference (auto, cuda, cpu)",
    )
    memory_threshold: float = Field(
        0.8, description="Memory threshold for device switching",
    )


# Batch Processing Models
class DiffusionBatchGenerationRequest(BaseModel):
    """Request model for batch text generation with optimization."""

    model_config = ConfigDict(protected_namespaces=())

    texts: list[str] = Field(
        ...,
        description="List of input texts for generation",
        min_length=1,
        max_length=50,
    )
    model_id: str = Field("dreamon", description="Model ID to use for generation")
    max_length: int = Field(512, description="Maximum generation length", ge=1, le=2048)
    temperature: float = Field(0.7, description="Sampling temperature", ge=0.1, le=2.0)
    top_p: float = Field(0.9, description="Top-p sampling parameter", ge=0.1, le=1.0)
    top_k: int = Field(50, description="Top-k sampling parameter", ge=1, le=100)
    repetition_penalty: float = Field(
        1.1, description="Repetition penalty", ge=1.0, le=2.0,
    )
    batch_size: int = Field(4, description="Batch size for processing", ge=1, le=16)
    parallel_processing: bool = Field(True, description="Enable parallel processing")

    @field_validator("texts")
    @classmethod
    def validate_texts(cls, v: list[str]) -> list[str]:
        """Validate list of input texts."""
        if not v:
            raise ValueError("Texts list cannot be empty")

        if len(v) > 50:
            raise ValueError("Too many texts in batch (max 50)")

        validated_texts = []
        for i, text in enumerate(v):
            if not text or not text.strip():
                raise ValueError(f"Text {i} cannot be empty or whitespace only")

            # Check for dangerous patterns
            dangerous_patterns = [
                r"<script[^>]*>.*?</script>",
                r"javascript:",
                r"data:text/html",
                r"vbscript:",
                r"on\w+\s*=",
            ]

            for pattern in dangerous_patterns:
                if re.search(pattern, text, re.IGNORECASE):
                    raise ValueError(
                        f"Text {i} contains potentially dangerous content: {pattern}",
                    )

            validated_texts.append(text.strip())

        return validated_texts

    @field_validator("model_id")
    @classmethod
    def validate_model_id(cls, v: str) -> str:
        """Validate model ID format and safety."""
        if not v or not v.strip():
            raise ValueError("Model ID cannot be empty")

        if not re.match(r"^[a-zA-Z0-9._-]+$", v):
            raise ValueError("Model ID contains invalid characters")

        if len(v) > 100:
            raise ValueError("Model ID is too long")

        return v.strip()


class DiffusionBatchGenerationResponse(BaseModel):
    """Response model for batch text generation."""

    success: bool = Field(..., description="Whether batch generation was successful")
    results: list[dict[str, Any]] = Field(..., description="List of generation results")
    total_processing_time: float = Field(
        ..., description="Total processing time in seconds",
    )
    average_processing_time: float = Field(
        ..., description="Average processing time per text",
    )
    tokens_generated: int = Field(0, description="Total tokens generated")
    batch_size: int = Field(..., description="Actual batch size used")
    parallel_processing_used: bool = Field(
        ..., description="Whether parallel processing was used",
    )
    metadata: dict[str, Any] = Field(
        default_factory=dict, description="Additional metadata",
    )


class DiffusionBatchInfillingRequest(BaseModel):
    """Request model for batch text infilling with optimization."""

    model_config = ConfigDict(protected_namespaces=())

    infill_requests: list[dict[str, str]] = Field(
        ..., description="List of infill requests", min_length=1, max_length=50,
    )
    model_id: str = Field("dreamon", description="Model ID to use for infilling")
    max_length: int = Field(256, description="Maximum infill length", ge=1, le=1024)
    temperature: float = Field(0.7, description="Sampling temperature", ge=0.1, le=2.0)
    top_p: float = Field(0.9, description="Top-p sampling parameter", ge=0.1, le=1.0)
    batch_size: int = Field(4, description="Batch size for processing", ge=1, le=16)
    parallel_processing: bool = Field(True, description="Enable parallel processing")

    @field_validator("infill_requests")
    @classmethod
    def validate_infill_requests(cls, v: list[dict[str, str]]) -> list[dict[str, str]]:
        """Validate list of infill requests."""
        if not v:
            raise ValueError("Infill requests list cannot be empty")

        if len(v) > 50:
            raise ValueError("Too many infill requests in batch (max 50)")

        validated_requests = []
        for i, request in enumerate(v):
            if not isinstance(request, dict):
                raise ValueError(f"Infill request {i} must be a dictionary")

            if "prefix" not in request or "suffix" not in request:
                raise ValueError(
                    f"Infill request {i} missing required 'prefix' or 'suffix' fields",
                )

            prefix = request["prefix"]
            suffix = request["suffix"]

            if not prefix or not prefix.strip():
                raise ValueError(f"Infill request {i} prefix cannot be empty")

            if not suffix or not suffix.strip():
                raise ValueError(f"Infill request {i} suffix cannot be empty")

            # Check for dangerous patterns
            dangerous_patterns = [
                r"<script[^>]*>.*?</script>",
                r"javascript:",
                r"data:text/html",
                r"vbscript:",
                r"on\w+\s*=",
            ]

            for pattern in dangerous_patterns:
                if re.search(pattern, prefix, re.IGNORECASE) or re.search(
                    pattern, suffix, re.IGNORECASE,
                ):
                    raise ValueError(
                        f"Infill request {i} contains potentially dangerous content: {pattern}",
                    )

            validated_requests.append(
                {"prefix": prefix.strip(), "suffix": suffix.strip()},
            )

        return validated_requests

    @field_validator("model_id")
    @classmethod
    def validate_model_id(cls, v: str) -> str:
        """Validate model ID format and safety."""
        if not v or not v.strip():
            raise ValueError("Model ID cannot be empty")

        if not re.match(r"^[a-zA-Z0-9._-]+$", v):
            raise ValueError("Model ID contains invalid characters")

        if len(v) > 100:
            raise ValueError("Model ID is too long")

        return v.strip()


class DiffusionBatchInfillingResponse(BaseModel):
    """Response model for batch text infilling."""

    success: bool = Field(..., description="Whether batch infilling was successful")
    results: list[dict[str, Any]] = Field(..., description="List of infilling results")
    total_processing_time: float = Field(
        ..., description="Total processing time in seconds",
    )
    average_processing_time: float = Field(
        ..., description="Average processing time per request",
    )
    tokens_generated: int = Field(0, description="Total tokens generated")
    batch_size: int = Field(..., description="Actual batch size used")
    parallel_processing_used: bool = Field(
        ..., description="Whether parallel processing was used",
    )
    metadata: dict[str, Any] = Field(
        default_factory=dict, description="Additional metadata",
    )
    timeout_seconds: int = Field(300, description="Request timeout in seconds")


class DiffusionStats(BaseModel):
    """Statistics for diffusion service."""

    model_config = ConfigDict(protected_namespaces=())

    total_requests: int = Field(..., description="Total generation requests")
    successful_requests: int = Field(..., description="Successful generation requests")
    failed_requests: int = Field(..., description="Failed generation requests")
    average_processing_time: float = Field(
        ..., description="Average processing time in seconds",
    )
    total_tokens_generated: int = Field(..., description="Total tokens generated")
    model_usage: dict[str, int] = Field(..., description="Model usage statistics")
    device_usage: dict[str, int] = Field(..., description="Device usage statistics")
    error_rate: float = Field(..., description="Error rate percentage")
