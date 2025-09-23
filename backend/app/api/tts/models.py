"""
TTS API Models for Reynard Backend

Pydantic models for TTS API requests and responses.
"""

import re
from typing import Any

from pydantic import BaseModel, Field, field_validator, model_validator


class TTSSynthesisRequest(BaseModel):
    """Request model for TTS synthesis with comprehensive validation."""

    text: str = Field(
        ..., description="Text to synthesize", min_length=1, max_length=10000
    )
    backend: str | None = Field(
        None, description="TTS backend to use (kokoro, coqui, xtts)"
    )
    voice: str = Field("default", description="Voice to use for synthesis")
    speed: float = Field(1.0, description="Speech speed multiplier", ge=0.5, le=2.0)
    lang: str = Field("en", description="Language code")
    to_ogg: bool = Field(False, description="Convert output to OGG format")
    to_opus: bool = Field(False, description="Convert output to Opus format")

    @field_validator("text")
    @classmethod
    def validate_text(cls, v: str) -> str:
        """Validate input text for TTS synthesis."""
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
                    f"Text contains potentially dangerous content: {pattern}"
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

        # Check for reasonable character distribution
        if len(v) > 1000:
            # For long texts, check for reasonable character diversity
            unique_chars = len(set(v.lower()))
            if unique_chars < 10:  # Too few unique characters
                raise ValueError(
                    "Text appears to have insufficient character diversity"
                )

        return v.strip()

    @field_validator("backend")
    @classmethod
    def validate_backend(cls, v: str | None) -> str | None:
        """Validate TTS backend selection."""
        if v is None:
            return v

        valid_backends = ["espeak", "festival", "coqui", "xtts", "kokoro"]
        if v.lower() not in valid_backends:
            raise ValueError(
                f"Invalid backend: {v}. Valid options: {', '.join(valid_backends)}"
            )

        return v.lower()

    @field_validator("voice")
    @classmethod
    def validate_voice(cls, v: str) -> str:
        """Validate voice selection."""
        if not v or not v.strip():
            raise ValueError("Voice cannot be empty")

        # Check for valid voice format (alphanumeric, dash, underscore)
        if not re.match(r"^[a-zA-Z0-9._-]+$", v):
            raise ValueError("Voice contains invalid characters")

        # Check for reasonable length
        if len(v) > 50:
            raise ValueError("Voice name is too long")

        return v.strip()

    @field_validator("lang")
    @classmethod
    def validate_language(cls, v: str) -> str:
        """Validate language code."""
        if not v or not v.strip():
            raise ValueError("Language code cannot be empty")

        # Check for valid language code format (ISO 639-1)
        if not re.match(r"^[a-z]{2}(-[A-Z]{2})?$", v):
            raise ValueError(
                "Invalid language code format. Use ISO 639-1 format (e.g., 'en', 'en-US')"
            )

        return v.strip().lower()

    @model_validator(mode="after")
    def validate_request_consistency(self) -> "TTSSynthesisRequest":
        """Validate overall request consistency."""
        # Check if both OGG and Opus conversion are requested
        if self.to_ogg and self.to_opus:
            raise ValueError(
                "Cannot convert to both OGG and Opus formats simultaneously"
            )

        # Check if speed is reasonable for the text length
        text_length = len(str(getattr(self, "text", "")))
        if text_length > 5000 and self.speed > 1.5:
            # Very long text with high speed might cause issues
            pass  # Just a warning, not an error

        return self


class TTSSynthesisResponse(BaseModel):
    """Response model for TTS synthesis with quality metrics."""

    success: bool = Field(..., description="Whether synthesis was successful")
    audio_path: str | None = Field(None, description="Path to generated audio file")
    audio_url: str | None = Field(None, description="URL to access audio file")
    duration: float | None = Field(None, description="Audio duration in seconds")
    backend_used: str = Field(..., description="Backend that was used")
    processing_time: float = Field(..., description="Processing time in seconds")
    error: str | None = Field(None, description="Error message if synthesis failed")

    # Audio quality metrics
    quality_metrics: dict[str, Any] = Field(
        default_factory=dict, description="Audio quality metrics and analysis"
    )
    audio_format: str | None = Field(None, description="Detected audio format")
    sample_rate: int | None = Field(None, description="Audio sample rate in Hz")
    channels: int | None = Field(None, description="Number of audio channels")
    bitrate: int | None = Field(None, description="Audio bitrate in bps")

    # Quality scores (0.0 to 1.0)
    overall_quality: float | None = Field(
        None, description="Overall audio quality score"
    )
    clarity_score: float | None = Field(None, description="Audio clarity score")
    naturalness_score: float | None = Field(
        None, description="Speech naturalness score"
    )
    intelligibility_score: float | None = Field(
        None, description="Speech intelligibility score"
    )

    # Issues and recommendations
    quality_issues: list[str] = Field(
        default_factory=list, description="Identified quality issues"
    )
    recommendations: list[str] = Field(
        default_factory=list, description="Quality improvement recommendations"
    )


class TTSBatchRequest(BaseModel):
    """Request model for batch TTS synthesis with comprehensive validation."""

    texts: list[str] = Field(
        ..., description="List of texts to synthesize", min_length=1, max_length=100
    )
    backend: str | None = Field(None, description="TTS backend to use")
    voice: str = Field("default", description="Voice to use for synthesis")
    speed: float = Field(1.0, description="Speech speed multiplier", ge=0.5, le=2.0)
    lang: str = Field("en", description="Language code")
    to_ogg: bool = Field(False, description="Convert output to OGG format")
    to_opus: bool = Field(False, description="Convert output to Opus format")

    @field_validator("texts")
    @classmethod
    def validate_texts(cls, v: list[str]) -> list[str]:
        """Validate list of input texts."""
        if not v:
            raise ValueError("Texts list cannot be empty")

        if len(v) > 100:
            raise ValueError("Too many texts in batch (max 100)")

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
                        f"Text {i} contains potentially dangerous content: {pattern}"
                    )

            validated_texts.append(text.strip())

        return validated_texts

    @field_validator("backend")
    @classmethod
    def validate_backend(cls, v: str | None) -> str | None:
        """Validate TTS backend selection."""
        if v is None:
            return v

        valid_backends = ["espeak", "festival", "coqui", "xtts", "kokoro"]
        if v.lower() not in valid_backends:
            raise ValueError(
                f"Invalid backend: {v}. Valid options: {', '.join(valid_backends)}"
            )

        return v.lower()

    @field_validator("voice")
    @classmethod
    def validate_voice(cls, v: str) -> str:
        """Validate voice selection."""
        if not v or not v.strip():
            raise ValueError("Voice cannot be empty")

        if not re.match(r"^[a-zA-Z0-9._-]+$", v):
            raise ValueError("Voice contains invalid characters")

        if len(v) > 50:
            raise ValueError("Voice name is too long")

        return v.strip()

    @field_validator("lang")
    @classmethod
    def validate_language(cls, v: str) -> str:
        """Validate language code."""
        if not v or not v.strip():
            raise ValueError("Language code cannot be empty")

        if not re.match(r"^[a-z]{2}(-[A-Z]{2})?$", v):
            raise ValueError(
                "Invalid language code format. Use ISO 639-1 format (e.g., 'en', 'en-US')"
            )

        return v.strip().lower()

    @model_validator(mode="after")
    def validate_request_consistency(self) -> "TTSBatchRequest":
        """Validate overall request consistency."""
        if self.to_ogg and self.to_opus:
            raise ValueError(
                "Cannot convert to both OGG and Opus formats simultaneously"
            )

        # Check total text length
        total_length = sum(len(text) for text in self.texts)
        if total_length > 50000:  # 50KB total
            raise ValueError("Total text length exceeds maximum limit (50KB)")

        return self


class TTSBatchResponse(BaseModel):
    """Response model for batch TTS synthesis."""

    success: bool = Field(..., description="Whether batch synthesis was successful")
    results: list[TTSSynthesisResponse] = Field(
        ..., description="Individual synthesis results"
    )
    total_processing_time: float = Field(
        ..., description="Total processing time in seconds"
    )
    error: str | None = Field(
        None, description="Error message if batch synthesis failed"
    )


class TTSVoiceInfo(BaseModel):
    """Model for voice information."""

    name: str = Field(..., description="Voice name")
    language: str = Field(..., description="Language code")
    gender: str | None = Field(None, description="Voice gender")
    description: str | None = Field(None, description="Voice description")
    available: bool = Field(..., description="Whether voice is available")


class TTSBackendInfo(BaseModel):
    """Model for backend information."""

    name: str = Field(..., description="Backend name")
    enabled: bool = Field(..., description="Whether backend is enabled")
    available: bool = Field(..., description="Whether backend is available")
    voices: list[TTSVoiceInfo] = Field(..., description="Available voices")
    supported_languages: list[str] = Field(..., description="Supported languages")
    supported_formats: list[str] = Field(..., description="Supported output formats")


class TTSConfigRequest(BaseModel):
    """Request model for TTS configuration updates."""

    default_backend: str | None = Field(None, description="Default backend to use")
    default_voice: str | None = Field(None, description="Default voice to use")
    default_speed: float | None = Field(
        None, description="Default speech speed", ge=0.5, le=2.0
    )
    default_language: str | None = Field(None, description="Default language")
    max_text_length: int | None = Field(
        None, description="Maximum text length", ge=100, le=50000
    )
    chunk_size: int | None = Field(
        None, description="Text chunk size for long texts", ge=100, le=5000
    )
    enable_audio_processing: bool | None = Field(
        None, description="Enable audio processing"
    )
    output_directory: str | None = Field(
        None, description="Output directory for audio files"
    )


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
    backends: list[TTSBackendInfo] = Field(..., description="Available backends")


class TTSStatsResponse(BaseModel):
    """Response model for TTS statistics."""

    total_synthesis_requests: int = Field(..., description="Total synthesis requests")
    successful_synthesis: int = Field(..., description="Successful synthesis count")
    failed_synthesis: int = Field(..., description="Failed synthesis count")
    average_processing_time: float = Field(..., description="Average processing time")
    total_audio_generated: float = Field(
        ..., description="Total audio duration generated"
    )
    backend_usage: dict[str, int] = Field(..., description="Backend usage statistics")
    voice_usage: dict[str, int] = Field(..., description="Voice usage statistics")
    error_rate: float = Field(..., description="Error rate percentage")


# Audio Quality Models
class AudioQualityMetrics(BaseModel):
    """Comprehensive audio quality metrics."""

    # Basic metrics
    sample_rate: int = Field(0, description="Audio sample rate in Hz")
    channels: int = Field(0, description="Number of audio channels")
    bits_per_sample: int = Field(0, description="Bits per sample")
    duration: float = Field(0.0, description="Audio duration in seconds")
    bitrate: int = Field(0, description="Audio bitrate in bps")

    # Quality scores (0.0 to 1.0)
    overall_quality: float = Field(0.0, description="Overall audio quality score")
    clarity_score: float = Field(0.0, description="Audio clarity score")
    naturalness_score: float = Field(0.0, description="Speech naturalness score")
    intelligibility_score: float = Field(
        0.0, description="Speech intelligibility score"
    )

    # Technical metrics
    signal_to_noise_ratio: float = Field(0.0, description="Signal-to-noise ratio in dB")
    dynamic_range: float = Field(0.0, description="Dynamic range in dB")
    frequency_response_score: float = Field(
        0.0, description="Frequency response quality"
    )
    distortion_level: float = Field(0.0, description="Distortion level (0.0 to 1.0)")

    # Performance metrics
    processing_time: float = Field(0.0, description="Processing time in seconds")
    memory_usage: float = Field(0.0, description="Memory usage in MB")
    cpu_usage: float = Field(0.0, description="CPU usage percentage")

    # Metadata
    backend_used: str = Field("", description="TTS backend used")
    voice_used: str = Field("", description="Voice used for synthesis")
    language: str = Field("", description="Language of synthesis")
    timestamp: float = Field(0.0, description="Analysis timestamp")

    # Issues and recommendations
    issues: list[str] = Field(
        default_factory=list, description="Identified quality issues"
    )
    recommendations: list[str] = Field(
        default_factory=list, description="Quality improvement recommendations"
    )


class AudioValidationRequest(BaseModel):
    """Request model for audio validation."""

    audio_file_path: str = Field(..., description="Path to audio file for validation")
    validate_content: bool = Field(
        True, description="Whether to perform content validation"
    )
    quality_level: str = Field("high", description="Quality validation level")


class AudioValidationResponse(BaseModel):
    """Response model for audio validation."""

    valid: bool = Field(..., description="Whether audio file is valid")
    format: str = Field(..., description="Detected audio format")
    metadata: dict[str, Any] = Field(default_factory=dict, description="Audio metadata")
    quality_metrics: dict[str, Any] = Field(
        default_factory=dict, description="Quality metrics"
    )
    file_size: int = Field(0, description="File size in bytes")
    validation_timestamp: float = Field(0.0, description="Validation timestamp")
    issues: list[str] = Field(
        default_factory=list, description="Validation issues found"
    )


class QualityTrendRequest(BaseModel):
    """Request model for quality trend analysis."""

    time_window: str = Field("24h", description="Time window for analysis")
    backend: str | None = Field(None, description="Filter by specific backend")
    voice: str | None = Field(None, description="Filter by specific voice")
    language: str | None = Field(None, description="Filter by specific language")


class QualityTrendResponse(BaseModel):
    """Response model for quality trend analysis."""

    time_window: str = Field(..., description="Analysis time window")
    trends: dict[str, Any] = Field(
        default_factory=dict, description="Quality trends by category"
    )
    summary: dict[str, Any] = Field(
        default_factory=dict, description="Trend summary statistics"
    )
    recommendations: list[str] = Field(
        default_factory=list, description="Trend-based recommendations"
    )
    analysis_timestamp: float = Field(0.0, description="Analysis timestamp")


class QualitySummaryResponse(BaseModel):
    """Response model for quality summary."""

    overall_quality: float = Field(..., description="Overall quality score")
    clarity_score: float = Field(..., description="Average clarity score")
    naturalness_score: float = Field(..., description="Average naturalness score")
    intelligibility_score: float = Field(
        ..., description="Average intelligibility score"
    )
    backend_performance: dict[str, Any] = Field(
        default_factory=dict, description="Backend performance metrics"
    )
    total_samples: int = Field(0, description="Total quality samples analyzed")
    recent_samples: int = Field(0, description="Recent samples count")
    quality_distribution: dict[str, int] = Field(
        default_factory=dict, description="Quality level distribution"
    )
    summary_timestamp: float = Field(0.0, description="Summary timestamp")
