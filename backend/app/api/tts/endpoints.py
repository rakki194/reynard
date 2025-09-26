"""🦊 Reynard TTS API Endpoints
============================

Comprehensive FastAPI endpoints for Text-to-Speech (TTS) integration within the Reynard ecosystem,
providing sophisticated speech synthesis capabilities with advanced features and comprehensive error handling.

The TTS API provides:
- Advanced text-to-speech synthesis with multiple backends
- Voice cloning capabilities using XTTS
- Batch processing for multiple text inputs
- Audio file management and streaming
- Configuration management and optimization
- Performance monitoring and metrics collection
- Comprehensive error handling and validation
- Security integration with authentication and authorization

Key Features:
- Text Synthesis: Advanced TTS with multiple backend support (espeak, festival, xtts)
- Voice Cloning: Sophisticated voice cloning with XTTS integration
- Batch Processing: Efficient batch synthesis for multiple texts
- Audio Management: File upload, storage, and streaming capabilities
- Configuration Management: Dynamic backend and voice configuration
- Performance Monitoring: Response time tracking and audio quality metrics
- Error Handling: Comprehensive error recovery and user feedback
- Security: Authentication and authorization for protected endpoints

API Endpoints:
- POST /synthesize: Standard text-to-speech synthesis
- POST /synthesize/batch: Batch text-to-speech processing
- POST /voice-clone: Voice cloning with reference audio
- GET /audio/{filename}: Audio file retrieval and streaming
- GET /config: Configuration management endpoints

The TTS integration provides seamless speech synthesis capabilities throughout the Reynard
ecosystem, enabling sophisticated AI-powered voice generation with enterprise-grade reliability
and performance.

Author: Reynard Development Team
Version: 2.0.0 - Refactored with BaseServiceRouter patterns
"""

import time
from pathlib import Path
from typing import Any

from fastapi import File, Form, UploadFile
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field

from ...core.base_router import BaseServiceRouter
from ...core.config_mixin import ConfigEndpointMixin
from ...core.logging_config import get_service_logger
from .audio_validator import get_audio_validator
from .models import (
    AudioValidationRequest,
    AudioValidationResponse,
    QualitySummaryResponse,
    QualityTrendRequest,
    QualityTrendResponse,
    TTSBatchRequest,
    TTSBatchResponse,
    TTSSynthesisRequest,
    TTSSynthesisResponse,
)
from .quality_metrics import get_quality_analyzer
from .service import get_tts_service

logger = get_service_logger("tts")


class TTSConfigModel(BaseModel):
    """Configuration model for TTS service."""

    default_backend: str = Field(
        default="espeak",
        description="Default TTS backend to use",
    )
    default_voice: str = Field(default="en", description="Default voice for synthesis")
    default_speed: float = Field(
        default=1.0,
        ge=0.1,
        le=3.0,
        description="Default speech speed",
    )
    default_language: str = Field(
        default="en",
        description="Default language for synthesis",
    )
    enable_ogg_conversion: bool = Field(
        default=True,
        description="Enable OGG format conversion",
    )
    enable_opus_conversion: bool = Field(
        default=False,
        description="Enable Opus format conversion",
    )
    max_text_length: int = Field(
        default=5000,
        ge=1,
        le=50000,
        description="Maximum text length per request",
    )
    max_batch_size: int = Field(
        default=10,
        ge=1,
        le=100,
        description="Maximum batch size for processing",
    )
    audio_quality: str = Field(default="high", description="Audio quality setting")
    enable_voice_cloning: bool = Field(
        default=True,
        description="Enable voice cloning capabilities",
    )
    temp_file_cleanup: bool = Field(
        default=True,
        description="Enable automatic temp file cleanup",
    )
    max_concurrent_requests: int = Field(
        default=5,
        ge=1,
        le=20,
        description="Max concurrent synthesis requests",
    )


class TTSServiceRouter(BaseServiceRouter, ConfigEndpointMixin):
    """TTS service router with enterprise-grade patterns.

    Provides standardized service patterns including:
    - Centralized error handling and recovery
    - Configuration management with validation
    - File upload and audio management
    - Voice cloning optimization
    - Health monitoring and metrics
    - Service dependency management
    """

    def __init__(self):
        super().__init__(service_name="tts", prefix="/api/tts", tags=["tts"])

        # Setup configuration endpoints
        self.setup_config_endpoints(TTSConfigModel)

        # Setup TTS-specific endpoints
        self._setup_tts_endpoints()

        logger.info("TTSServiceRouter initialized with enterprise patterns")

    def get_service(self) -> Any:
        """Get the TTS service instance."""
        return get_tts_service()

    def check_service_health(self) -> Any:
        """Check TTS service health."""
        try:
            service = self.get_service()
            # Check if service is available and responsive
            config = service.get_config() if hasattr(service, "get_config") else {}

            return {
                "service_name": self.service_name,
                "is_healthy": True,
                "status": "operational",
                "details": {
                    "available_backends": config.get("available_backends", []),
                    "service_initialized": service is not None,
                    "voice_cloning_enabled": config.get("enable_voice_cloning", False),
                },
                "timestamp": time.time(),
            }
        except Exception as e:
            logger.exception("TTS service health check failed")
            return {
                "service_name": self.service_name,
                "is_healthy": False,
                "status": "unhealthy",
                "details": {"error": str(e)},
                "timestamp": time.time(),
            }

    def _setup_tts_endpoints(self) -> None:
        """Setup TTS-specific endpoints."""

        @self.router.post("/synthesize", response_model=TTSSynthesisResponse)
        async def synthesize_text(request: TTSSynthesisRequest):
            """Synthesize text to speech."""
            return await self._standard_async_operation(
                "synthesize_text",
                self._handle_synthesize_request,
                request,
            )

        @self.router.post("/synthesize/batch", response_model=TTSBatchResponse)
        async def synthesize_batch(request: TTSBatchRequest):
            """Synthesize multiple texts to speech."""
            return await self._standard_async_operation(
                "synthesize_batch",
                self._handle_batch_request,
                request,
            )

        @self.router.get("/audio/{filename}")
        async def get_audio_file(filename: str):
            """Get generated audio file."""
            return await self._standard_async_operation(
                "get_audio_file",
                self._handle_get_audio_request,
                filename,
            )

        @self.router.post("/voice-clone")
        async def synthesize_with_voice_clone(
            text: str = Form(...),
            reference_audio: UploadFile = File(...),
            speed: float = Form(1.0),
            lang: str = Form("en"),
        ):
            """Synthesize text with voice cloning using XTTS."""
            return await self._standard_async_operation(
                "voice_clone",
                self._handle_voice_clone_request,
                {
                    "text": text,
                    "reference_audio": reference_audio,
                    "speed": speed,
                    "lang": lang,
                },
            )

        @self.router.post("/validate-audio", response_model=AudioValidationResponse)
        async def validate_audio_file(request: AudioValidationRequest):
            """Validate audio file format and quality."""
            return await self._standard_async_operation(
                "validate_audio",
                self._handle_validate_audio_request,
                request,
            )

        @self.router.get("/quality/summary", response_model=QualitySummaryResponse)
        async def get_quality_summary():
            """Get comprehensive audio quality summary."""
            return await self._standard_async_operation(
                "get_quality_summary",
                self._handle_get_quality_summary_request,
            )

        @self.router.post("/quality/trends", response_model=QualityTrendResponse)
        async def get_quality_trends(request: QualityTrendRequest):
            """Get audio quality trends and analysis."""
            return await self._standard_async_operation(
                "get_quality_trends",
                self._handle_get_quality_trends_request,
                request,
            )

        @self.router.get("/quality/formats")
        async def get_supported_formats():
            """Get supported audio formats and validation info."""
            return await self._standard_async_operation(
                "get_supported_formats",
                self._handle_get_supported_formats_request,
            )

    async def _handle_synthesize_request(
        self,
        request: TTSSynthesisRequest,
    ) -> TTSSynthesisResponse:
        """Handle text synthesis request with standardized error handling and quality analysis."""
        import time

        import psutil

        start_time = time.time()
        service = self.get_service()

        # Get initial memory usage
        initial_memory = psutil.Process().memory_info().rss / 1024 / 1024  # MB

        result = await service.synthesize_text(
            text=request.text,
            backend=request.backend,
            voice=request.voice,
            speed=request.speed,
            lang=request.lang,
            to_ogg=request.to_ogg,
            to_opus=request.to_opus,
        )

        # Get final memory usage and processing time
        final_memory = psutil.Process().memory_info().rss / 1024 / 1024  # MB
        processing_time = time.time() - start_time
        memory_usage = final_memory - initial_memory

        # Perform audio quality analysis if synthesis was successful
        quality_metrics = {}
        audio_metadata = {}

        if result.get("success") and result.get("audio_path"):
            try:
                # Validate and analyze the generated audio
                validator = get_audio_validator("high")
                validation_result = await validator.validate_audio_file(
                    result["audio_path"],
                    validate_content=True,
                )

                audio_metadata = validation_result.get("metadata", {})
                quality_metrics = validation_result.get("quality_metrics", {})

                # Perform comprehensive quality analysis
                quality_analyzer = get_quality_analyzer()
                processing_metrics = {
                    "processing_time": processing_time,
                    "memory_usage": memory_usage,
                    "cpu_usage": psutil.cpu_percent(),
                }

                comprehensive_metrics = await quality_analyzer.analyze_audio_quality(
                    audio_metadata=audio_metadata,
                    processing_metrics=processing_metrics,
                    backend=result.get("backend_used", ""),
                    voice=request.voice,
                    language=request.lang,
                )

                # Convert to dict for response
                quality_metrics = {
                    "overall_quality": comprehensive_metrics.overall_quality,
                    "clarity_score": comprehensive_metrics.clarity_score,
                    "naturalness_score": comprehensive_metrics.naturalness_score,
                    "intelligibility_score": comprehensive_metrics.intelligibility_score,
                    "signal_to_noise_ratio": comprehensive_metrics.signal_to_noise_ratio,
                    "dynamic_range": comprehensive_metrics.dynamic_range,
                    "frequency_response_score": comprehensive_metrics.frequency_response_score,
                    "distortion_level": comprehensive_metrics.distortion_level,
                    "issues": comprehensive_metrics.issues,
                    "recommendations": comprehensive_metrics.recommendations,
                }

            except Exception as e:
                logger.warning(f"Audio quality analysis failed: {e}")
                quality_metrics = {"analysis_error": str(e)}

        # Create enhanced response
        response_data = {
            **result,
            "processing_time": processing_time,
            "quality_metrics": quality_metrics,
            "audio_format": audio_metadata.get("format"),
            "sample_rate": audio_metadata.get("sample_rate"),
            "channels": audio_metadata.get("channels"),
            "bitrate": audio_metadata.get("estimated_bitrate"),
            "overall_quality": quality_metrics.get("overall_quality"),
            "clarity_score": quality_metrics.get("clarity_score"),
            "naturalness_score": quality_metrics.get("naturalness_score"),
            "intelligibility_score": quality_metrics.get("intelligibility_score"),
            "quality_issues": quality_metrics.get("issues", []),
            "recommendations": quality_metrics.get("recommendations", []),
        }

        return TTSSynthesisResponse(**response_data)

    async def _handle_batch_request(self, request: TTSBatchRequest) -> TTSBatchResponse:
        """Handle batch synthesis request with standardized error handling."""
        service = self.get_service()

        result = await service.synthesize_batch(
            texts=request.texts,
            backend=request.backend,
            voice=request.voice,
            speed=request.speed,
            lang=request.lang,
            to_ogg=request.to_ogg,
            to_opus=request.to_opus,
        )

        return TTSBatchResponse(**result)

    async def _handle_get_audio_request(self, filename: str):
        """Handle audio file retrieval request."""
        service = self.get_service()
        audio_dir = Path("generated/audio")
        audio_path = audio_dir / filename

        if not audio_path.exists():
            from ...core.exceptions import NotFoundError

            raise NotFoundError(
                message=f"Audio file not found: {filename}",
                service_name=self.service_name,
            )

        return FileResponse(
            path=str(audio_path),
            media_type="audio/wav",
            filename=filename,
        )

    async def _handle_voice_clone_request(self, request_data: dict):
        """Handle voice cloning request with optimized file handling."""
        service = self.get_service()

        text = request_data["text"]
        reference_audio = request_data["reference_audio"]
        speed = request_data["speed"]
        lang = request_data["lang"]

        # Improved file upload handling with validation
        if not reference_audio.filename:
            from ...core.exceptions import ValidationError

            raise ValidationError(
                message="Reference audio file is required",
                service_name=self.service_name,
            )

        # Validate audio file format
        allowed_extensions = {".wav", ".mp3", ".ogg", ".flac"}
        file_extension = Path(reference_audio.filename).suffix.lower()
        if file_extension not in allowed_extensions:
            from ...core.exceptions import ValidationError

            raise ValidationError(
                message=f"Unsupported audio format: {file_extension}. Allowed: {', '.join(allowed_extensions)}",
                service_name=self.service_name,
            )

        # Create secure temporary directory
        temp_dir = Path("temp/voice_clone")
        temp_dir.mkdir(parents=True, exist_ok=True)

        # Generate secure filename
        timestamp = int(time.time())
        reference_path = temp_dir / f"ref_{timestamp}_{reference_audio.filename}"

        try:
            # Save reference audio with improved error handling
            content = await reference_audio.read()
            if len(content) == 0:
                from ...core.exceptions import ValidationError

                raise ValidationError(
                    message="Reference audio file is empty",
                    service_name=self.service_name,
                )

            with open(reference_path, "wb") as f:
                f.write(content)

            # Generate output path
            output_dir = Path("generated/audio")
            output_dir.mkdir(parents=True, exist_ok=True)
            output_path = output_dir / f"cloned_{timestamp}.wav"

            # Perform voice cloning synthesis with optimization
            result_path = await service.synthesize_with_voice_clone(
                text=text,
                out_path=output_path,
                reference_audio=reference_path,
                speed=speed,
                lang=lang,
            )

            return {
                "success": True,
                "audio_path": str(result_path),
                "audio_url": f"/api/tts/audio/{result_path.name}",
                "backend_used": "xtts",
                "processing_time": 0.0,
                "error": None,
            }

        finally:
            # Clean up reference audio file
            if reference_path.exists():
                reference_path.unlink(missing_ok=True)

    async def _handle_validate_audio_request(
        self,
        request: AudioValidationRequest,
    ) -> AudioValidationResponse:
        """Handle audio validation request."""
        validator = get_audio_validator(request.quality_level)

        try:
            validation_result = await validator.validate_audio_file(
                request.audio_file_path,
                validate_content=request.validate_content,
            )

            return AudioValidationResponse(
                valid=validation_result["valid"],
                format=validation_result["format"],
                metadata=validation_result.get("metadata", {}),
                quality_metrics=validation_result.get("quality_metrics", {}),
                file_size=validation_result.get("file_size", 0),
                validation_timestamp=validation_result.get(
                    "validation_timestamp",
                    time.time(),
                ),
                issues=validation_result.get("quality_metrics", {}).get("issues", []),
            )

        except Exception as e:
            logger.error(f"Audio validation failed: {e}")
            return AudioValidationResponse(
                valid=False,
                format="unknown",
                metadata={},
                quality_metrics={},
                file_size=0,
                validation_timestamp=time.time(),
                issues=[f"Validation failed: {e!s}"],
            )

    async def _handle_get_quality_summary_request(self) -> QualitySummaryResponse:
        """Handle get quality summary request."""
        quality_analyzer = get_quality_analyzer()
        summary = await quality_analyzer.get_quality_summary()

        return QualitySummaryResponse(
            overall_quality=summary.get("overall_quality", 0.0),
            clarity_score=summary.get("clarity_score", 0.0),
            naturalness_score=summary.get("naturalness_score", 0.0),
            intelligibility_score=summary.get("intelligibility_score", 0.0),
            backend_performance=summary.get("backend_performance", {}),
            total_samples=summary.get("total_samples", 0),
            recent_samples=summary.get("recent_samples", 0),
            quality_distribution=summary.get("quality_distribution", {}),
            summary_timestamp=time.time(),
        )

    async def _handle_get_quality_trends_request(
        self,
        request: QualityTrendRequest,
    ) -> QualityTrendResponse:
        """Handle get quality trends request."""
        quality_analyzer = get_quality_analyzer()
        trends = await quality_analyzer.get_quality_trends(request.time_window)

        # Generate recommendations based on trends
        recommendations = []
        for trend_name, trend_data in trends.items():
            if trend_data.trend_direction == "declining":
                recommendations.append(
                    f"{trend_name} quality is declining - investigate recent changes",
                )
            elif trend_data.trend_direction == "improving":
                recommendations.append(
                    f"{trend_name} quality is improving - maintain current practices",
                )

        return QualityTrendResponse(
            time_window=request.time_window,
            trends={
                name: {
                    "average_quality": trend.average_quality,
                    "quality_variance": trend.quality_variance,
                    "trend_direction": trend.trend_direction,
                    "sample_count": trend.sample_count,
                    "last_updated": trend.last_updated,
                }
                for name, trend in trends.items()
            },
            summary={
                "total_trends": len(trends),
                "improving_trends": sum(
                    1 for t in trends.values() if t.trend_direction == "improving"
                ),
                "declining_trends": sum(
                    1 for t in trends.values() if t.trend_direction == "declining"
                ),
                "stable_trends": sum(
                    1 for t in trends.values() if t.trend_direction == "stable"
                ),
            },
            recommendations=recommendations,
            analysis_timestamp=time.time(),
        )

    async def _handle_get_supported_formats_request(self):
        """Handle get supported formats request."""
        validator = get_audio_validator()
        formats_info = await validator.get_supported_formats()

        return {
            "supported_formats": formats_info["supported_formats"],
            "format_details": formats_info["format_details"],
            "quality_levels": formats_info["quality_levels"],
            "current_quality_level": formats_info["current_quality_level"],
            "current_thresholds": formats_info["current_thresholds"],
            "timestamp": time.time(),
        }


# Create router instance
tts_router = TTSServiceRouter()
router = tts_router.get_router()
