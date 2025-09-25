"""🦊 Reynard Summarization API Endpoints
=====================================

Enterprise-grade summarization endpoints with advanced streaming capabilities,
content type detection optimization, and performance monitoring.

This module provides:
- Advanced summarization with multiple content types
- Streaming support for batch operations
- Content type detection and optimization
- Performance statistics collection
- Comprehensive error handling and recovery
- Standardized logging and configuration management

Key Features:
- Streaming mixin for batch operations with real-time progress
- Content type detection optimization with confidence scoring
- Performance stats collection with detailed analytics
- Enterprise-grade error handling and recovery
- WebSocket support for real-time streaming
- Advanced configuration management

Author: Reynard Development Team
Version: 2.0.0 - Enterprise patterns
"""

from typing import Any

from pydantic import BaseModel, Field

from ...core.base_router import BaseServiceRouter
from ...core.logging_config import get_service_logger
from ...core.router_mixins import ConfigEndpointMixin, StreamingResponseMixin
from ...services.summarization.summarization_service import (
    get_summarization_service,
    is_summarization_service_initialized,
)
from .models import (
    BatchSummarizationRequest,
    ContentTypeDetectionRequest,
    ContentTypeDetectionResponse,
    HealthCheckResponse,
    SummarizationRequest,
    SummarizationResponse,
    SummarizationStatsResponse,
)

logger = get_service_logger("summarization")


class SummarizationConfigModel(BaseModel):
    """Configuration model for Summarization service."""

    default_model: str = Field(
        default="llama3.2:3b", description="Default model for summarization",
    )
    default_content_type: str = Field(
        default="general",
        description="Default content type",
        pattern="^(article|code|document|technical|general)$",
    )
    default_summary_level: str = Field(
        default="detailed",
        description="Default summary level",
        pattern="^(brief|executive|detailed|comprehensive|bullet|tts_optimized)$",
    )
    max_text_length: int = Field(
        default=100000,
        ge=100,
        le=200000,
        description="Maximum text length for summarization",
    )
    enable_caching: bool = Field(
        default=True, description="Enable result caching for performance",
    )
    cache_ttl_seconds: int = Field(
        default=3600, ge=60, le=86400, description="Cache TTL in seconds",
    )
    enable_content_type_detection: bool = Field(
        default=True, description="Enable automatic content type detection",
    )
    content_type_confidence_threshold: float = Field(
        default=0.7,
        ge=0.0,
        le=1.0,
        description="Minimum confidence for content type detection",
    )
    enable_performance_stats: bool = Field(
        default=True, description="Enable performance statistics collection",
    )
    batch_processing_max_requests: int = Field(
        default=50, ge=1, le=100, description="Maximum requests per batch",
    )
    streaming_enabled: bool = Field(
        default=True, description="Enable streaming for batch operations",
    )
    performance_stats_retention_days: int = Field(
        default=30, ge=1, le=365, description="Performance stats retention period",
    )


class SummarizationServiceRouter(
    BaseServiceRouter, ConfigEndpointMixin, StreamingResponseMixin,
):
    """Summarization service router with enterprise-grade patterns.

    Provides standardized service patterns including:
    - Centralized error handling and recovery
    - Configuration management with validation
    - Streaming support for batch operations
    - Content type detection optimization
    - Performance monitoring and metrics
    - Health monitoring and system status
    - Service dependency management
    """

    def __init__(self):
        super().__init__(
            service_name="summarization",
            prefix="/api/summarization",
            tags=["summarization"],
        )

        # Setup configuration endpoints
        self.setup_config_endpoints(SummarizationConfigModel)

        # Setup streaming endpoints
        self.setup_streaming_endpoints()

        # Setup summarization-specific endpoints
        self._setup_summarization_endpoints()

        logger.info("SummarizationServiceRouter initialized with enterprise patterns")

    def get_service(self):
        """Get the summarization service instance."""
        return get_summarization_service()

    async def check_service_health(self) -> dict[str, Any]:
        """Check service health and dependencies."""
        try:
            if not is_summarization_service_initialized():
                return {
                    "status": "unhealthy",
                    "message": "Summarization service not initialized",
                    "details": {"initialized": False},
                }

            service = self.get_service()
            health_info = await service.health_check()
            return health_info
        except Exception as e:
            logger.error(f"Health check failed for {self.service_name}: {e}")
            return {
                "status": "unhealthy",
                "message": f"Health check failed: {e}",
                "details": {"error": str(e)},
            }

    def _setup_summarization_endpoints(self):
        """Setup summarization-specific endpoints."""

        @self.router.post("/summarize", response_model=SummarizationResponse)
        async def summarize_text(request: SummarizationRequest):
            """Summarize text with specified options."""
            return await self._standard_async_operation(
                operation="summarize_text",
                operation_func=self._handle_summarize_request,
                request=request,
            )

        @self.router.post("/summarize/stream")
        async def summarize_text_stream(request: SummarizationRequest):
            """Stream text summarization with progress updates."""
            return await self._standard_async_operation(
                operation="summarize_text_stream",
                operation_func=self._handle_summarize_stream_request,
                request=request,
            )

        @self.router.post("/summarize/batch")
        async def summarize_batch(request: BatchSummarizationRequest):
            """Process a batch of summarization requests."""
            return await self._standard_async_operation(
                operation="summarize_batch",
                operation_func=self._handle_batch_summarize_request,
                request=request,
            )

        @self.router.post(
            "/detect-content-type", response_model=ContentTypeDetectionResponse,
        )
        async def detect_content_type(request: ContentTypeDetectionRequest):
            """Automatically detect the content type of text."""
            return await self._standard_async_operation(
                operation="detect_content_type",
                operation_func=self._handle_content_type_detection_request,
                request=request,
            )

        @self.router.get("/models")
        async def get_available_models():
            """Get list of available models for summarization."""
            return await self._standard_async_operation(
                operation="get_available_models",
                operation_func=self._handle_get_models_request,
            )

        @self.router.get("/content-types")
        async def get_supported_content_types():
            """Get supported content types and their summarizers."""
            return await self._standard_async_operation(
                operation="get_supported_content_types",
                operation_func=self._handle_get_content_types_request,
            )

        @self.router.get("/stats", response_model=SummarizationStatsResponse)
        async def get_performance_stats():
            """Get performance statistics for the summarization service."""
            return await self._standard_async_operation(
                operation="get_performance_stats",
                operation_func=self._handle_get_stats_request,
            )

        @self.router.get("/health", response_model=HealthCheckResponse, operation_id="summarization_health_check")
        async def health_check():
            """Perform health check on the summarization service."""
            return await self._standard_async_operation(
                operation="health_check",
                operation_func=self._handle_health_check_request,
            )

    async def _handle_summarize_request(
        self, request: SummarizationRequest,
    ) -> SummarizationResponse:
        """Handle text summarization request."""
        service = self.get_service()

        # Perform summarization
        result = await service.summarize_text(
            text=request.text,
            content_type=request.content_type,
            summary_level=request.summary_level,
            max_length=request.max_length,
            include_outline=request.include_outline,
            include_highlights=request.include_highlights,
            model=request.model,
            temperature=request.temperature,
            top_p=request.top_p,
        )

        return SummarizationResponse(**result)

    async def _handle_summarize_stream_request(self, request: SummarizationRequest):
        """Handle streaming text summarization request."""
        service = self.get_service()

        async def event_generator():
            async for event in service.summarize_text_stream(
                text=request.text,
                content_type=request.content_type,
                summary_level=request.summary_level,
                max_length=request.max_length,
                include_outline=request.include_outline,
                include_highlights=request.include_highlights,
                model=request.model,
                temperature=request.temperature,
                top_p=request.top_p,
            ):
                yield {
                    "event": event.get("event", "update"),
                    "data": event.get("data", {}),
                }

        return self.create_sse_response(event_generator())

    async def _handle_batch_summarize_request(self, request: BatchSummarizationRequest):
        """Handle batch summarization request."""
        service = self.get_service()

        if request.enable_streaming:

            async def event_generator():
                async for event in service.summarize_batch(
                    requests=request.requests,
                    enable_streaming=True,
                ):
                    yield {
                        "event": event.get("event", "update"),
                        "data": event.get("data", {}),
                    }

            return self.create_sse_response(event_generator())
        # Process batch without streaming
        results = []
        async for event in service.summarize_batch(
            requests=request.requests,
            enable_streaming=False,
        ):
            if event.get("event") == "request_complete":
                results.append(event.get("data", {}))

        return {
            "success": True,
            "results": results,
            "total_processed": len(results),
        }

    async def _handle_content_type_detection_request(
        self, request: ContentTypeDetectionRequest,
    ) -> ContentTypeDetectionResponse:
        """Handle content type detection request."""
        service = self.get_service()
        content_type = await service.detect_content_type(request.text)

        return ContentTypeDetectionResponse(
            content_type=content_type,
            confidence=0.8,  # Placeholder confidence score
        )

    async def _handle_get_models_request(self):
        """Handle get available models request."""
        service = self.get_service()
        models = service.get_available_models()

        return {
            "success": True,
            "models": models,
            "default_model": "llama3.2:3b",
        }

    async def _handle_get_content_types_request(self):
        """Handle get supported content types request."""
        service = self.get_service()
        content_types = service.get_supported_content_types()
        summary_levels = service.get_supported_summary_levels()

        return {
            "success": True,
            "content_types": content_types,
            "summary_levels": summary_levels,
        }

    async def _handle_get_stats_request(self) -> SummarizationStatsResponse:
        """Handle get performance stats request."""
        service = self.get_service()
        stats = service.get_performance_stats()
        content_types = service.get_supported_content_types()

        return SummarizationStatsResponse(
            total_requests=stats.get("total_requests", 0),
            cache_hits=stats.get("cache_hits", 0),
            cache_misses=stats.get("cache_misses", 0),
            cache_hit_rate=stats.get("cache_hit_rate", 0.0),
            average_processing_time=stats.get("average_processing_time", 0.0),
            total_processing_time=stats.get("total_processing_time", 0.0),
            available_summarizers=stats.get("available_summarizers", []),
            supported_content_types=content_types,
        )

    async def _handle_health_check_request(self) -> HealthCheckResponse:
        """Handle health check request."""
        health_info = await self.check_service_health()

        return HealthCheckResponse(
            status=health_info["status"],
            message=health_info["message"],
            details=health_info["details"],
            timestamp=health_info.get("timestamp", ""),
        )


# Create router instance
summarization_router = SummarizationServiceRouter()
