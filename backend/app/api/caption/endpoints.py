"""
Caption Generation API Endpoints for Reynard Backend

Refactored to use BaseServiceRouter infrastructure for consistency and maintainability.
"""

from datetime import datetime
from pathlib import Path

from fastapi import Depends, HTTPException, UploadFile
from pydantic import BaseModel, Field

from gatekeeper.api.dependencies import require_active_user
from gatekeeper.models.user import User

from app.core.base_router import BaseServiceRouter, ServiceStatus
from app.core.router_mixins import (
    ConfigEndpointMixin,
    FileUploadMixin,
    MetricsMixin,
    RateLimitingMixin,
    ValidationMixin,
)
from app.core.logging_config import get_service_logger
from app.caption_generation import CaptionTask, get_caption_service

logger = get_service_logger("caption-generation")

# Constants
MAX_BATCH_SIZE = 20
MAX_CONCURRENT_OPERATIONS = 8


class CaptionConfigModel(BaseModel):
    """Configuration model for caption generation service."""

    # Service configuration
    enabled: bool = Field(True, description="Enable caption generation service")
    max_batch_size: int = Field(
        20, ge=1, le=100, description="Maximum batch size for caption generation"
    )
    max_concurrent_operations: int = Field(
        8, ge=1, le=20, description="Maximum concurrent operations"
    )
    default_timeout: int = Field(
        300,
        ge=30,
        le=1800,
        description="Default timeout for caption generation in seconds",
    )

    # Model management
    enable_auto_loading: bool = Field(
        True, description="Enable automatic model loading"
    )
    enable_model_caching: bool = Field(True, description="Enable model caching")
    max_loaded_models: int = Field(
        5, ge=1, le=20, description="Maximum number of loaded models"
    )
    model_unload_timeout: int = Field(
        1800, ge=300, le=7200, description="Model unload timeout in seconds"
    )

    # Quality settings
    enable_quality_validation: bool = Field(
        True, description="Enable caption quality validation"
    )
    min_caption_length: int = Field(
        5, ge=1, le=50, description="Minimum caption length"
    )
    max_caption_length: int = Field(
        500, ge=50, le=2000, description="Maximum caption length"
    )
    quality_threshold: float = Field(
        0.7, ge=0.0, le=1.0, description="Minimum quality threshold"
    )

    # Processing settings
    enable_post_processing: bool = Field(
        True, description="Enable post-processing of captions"
    )
    enable_retry_logic: bool = Field(
        True, description="Enable retry logic for failed operations"
    )
    max_retry_attempts: int = Field(
        3, ge=1, le=10, description="Maximum retry attempts"
    )
    retry_backoff_factor: float = Field(
        2.0, ge=1.0, le=5.0, description="Retry backoff factor"
    )

    # Caching settings
    enable_result_caching: bool = Field(True, description="Enable result caching")
    cache_ttl_seconds: int = Field(
        3600, ge=300, le=86400, description="Cache TTL in seconds"
    )
    cache_compression: bool = Field(True, description="Enable cache compression")
    max_cache_size_mb: int = Field(
        500, ge=50, le=2000, description="Maximum cache size in MB"
    )

    # Rate limiting
    generation_rate_limit: int = Field(
        30, ge=1, le=100, description="Generation requests per minute"
    )
    batch_rate_limit: int = Field(
        10, ge=1, le=50, description="Batch requests per minute"
    )
    model_management_rate_limit: int = Field(
        20, ge=1, le=100, description="Model management requests per minute"
    )

    # Security settings
    enable_input_validation: bool = Field(True, description="Enable input validation")
    allowed_image_formats: list[str] = Field(
        default=[
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif",
            "image/bmp",
            "image/tiff",
        ],
        description="Allowed image formats",
    )
    max_file_size_mb: int = Field(
        50, ge=1, le=500, description="Maximum file size in MB"
    )
    enable_content_filtering: bool = Field(
        True, description="Enable content filtering for generated captions"
    )


class CaptionGenerationServiceRouter(
    BaseServiceRouter,
    ConfigEndpointMixin,
    FileUploadMixin,
    MetricsMixin,
    RateLimitingMixin,
    ValidationMixin,
):
    """Service router for caption generation endpoints."""

    def __init__(self):
        super().__init__("caption-generation")
        self.config_model = CaptionConfigModel

        # Initialize mixins
        self.setup_config_endpoints(self.config_model)
        self.setup_rate_limiting_endpoints()
        self.setup_metrics_endpoints()

        # Setup caption generation endpoints
        # TODO: Fix endpoint definitions to use proper async function syntax
        # self._setup_caption_endpoints()

    def get_service(self):
        """Get the caption generation service instance."""
        return get_caption_service()

    async def check_service_health(self) -> ServiceStatus:
        """Check the health of the caption generation service."""
        try:
            service = self.get_service()
            health_status = service.get_health_status()

            return ServiceStatus(
                service_name=self.service_name,
                status=(
                    "healthy" if health_status.get("healthy", False) else "unhealthy"
                ),
                message=(
                    "Service is operational"
                    if health_status.get("healthy", False)
                    else "Service issues detected"
                ),
                details={
                    "healthy": health_status.get("healthy", False),
                    "loaded_models": len(service.get_loaded_models()),
                    "available_generators": len(service.get_available_generators()),
                    "total_processed": health_status.get("total_processed", 0),
                    "average_processing_time": health_status.get(
                        "average_processing_time", 0
                    ),
                    "active_tasks": health_status.get("active_tasks", 0),
                },
            )
        except Exception as e:
            logger.exception("Health check failed for %s", self.service_name)
            return ServiceStatus(
                service_name=self.service_name,
                status="unhealthy",
                message="Service health check failed: %s" % str(e),
                details={"error": str(e)},
            )

    def _setup_caption_endpoints(self):
        """Setup caption generation endpoints."""
        api_router = self.get_router()

        # Generator management endpoints
        @api_router.get("/generators")
        async def get_available_generators():
            return await self._standard_async_operation(
                "get_available_generators", self._get_available_generators_impl
            )

        @api_router.get("/generators/{generator_name}")
        async def get_generator_info(generator_name: str):
            return await self._standard_async_operation(
                "get_generator_info", self._get_generator_info_impl, generator_name
            )

        # Caption generation endpoints
        api_router.post("/generate")(
            self._standard_async_operation(self._generate_caption_impl)
        )

        api_router.post("/batch")(
            self._standard_async_operation(self._generate_batch_captions_impl)
        )

        # File upload endpoints
        api_router.post("/upload")(
            self._standard_async_operation(self._upload_and_generate_impl)
        )

        # Model management endpoints
        api_router.post("/models/{model_name}/load")(
            self._standard_async_operation(self._load_model_impl)
        )

        api_router.post("/models/{model_name}/unload")(
            self._standard_async_operation(self._unload_model_impl)
        )

        api_router.get("/models/loaded")(
            self._standard_async_operation(self._get_loaded_models_impl)
        )

        # Quality analysis endpoints
        api_router.post("/analyze-quality")(
            self._standard_async_operation(self._analyze_caption_quality_impl)
        )

        # Statistics and monitoring endpoints
        api_router.get("/statistics")(
            self._standard_async_operation(self._get_system_statistics_impl)
        )

        api_router.get("/health")(
            self._standard_async_operation(self._health_check_impl)
        )

    async def _get_available_generators_impl(
        self, _current_user: User = Depends(require_active_user)
    ):
        """Get information about all available caption generators."""
        service = self.get_service()
        generators = service.get_available_generators()

        return {
            "generators": generators,
            "count": len(generators),
            "timestamp": datetime.now().isoformat(),
        }

    async def _get_generator_info_impl(
        self, generator_name: str, _current_user: User = Depends(require_active_user)
    ):
        """Get information about a specific caption generator."""
        service = self.get_service()
        info = service.get_generator_info(generator_name)

        if not info:
            raise HTTPException(
                status_code=404,
                detail=f"Generator '{generator_name}' not found",
            )

        return {
            "generator": info,
            "timestamp": datetime.now().isoformat(),
        }

    async def _generate_caption_impl(
        self, request: dict, _current_user: User = Depends(require_active_user)
    ):
        """Generate a caption for a single image."""
        # Validate request
        image_path = request.get("image_path")
        generator_name = request.get("generator_name")
        config = request.get("config", {})
        force = request.get("force", False)
        post_process = request.get("post_process", True)

        if not image_path or not generator_name:
            raise HTTPException(
                status_code=400, detail="image_path and generator_name are required"
            )

        # Validate image path
        image_path_obj = Path(image_path)
        if not image_path_obj.exists():
            raise HTTPException(
                status_code=404, detail=f"Image not found: {image_path}"
            )

        # Check if generator is available
        service = self.get_service()
        if not service.is_generator_available(generator_name):
            raise HTTPException(
                status_code=400, detail=f"Generator '{generator_name}' is not available"
            )

        # Generate caption
        result = await service.generate_single_caption(
            image_path=image_path_obj,
            generator_name=generator_name,
            config=config,
            force=force,
        )

        # Apply post-processing if enabled
        if post_process and result.success and result.caption:
            # Mock post-processing - in a real implementation, this would apply actual post-processing
            result.caption = result.caption.strip()

        return {
            "success": result.success,
            "image_path": str(result.image_path),
            "generator_name": result.generator_name,
            "caption": result.caption,
            "error": result.error,
            "error_type": result.error_type,
            "retryable": result.retryable,
            "processing_time": result.processing_time,
            "caption_type": result.caption_type,
            "timestamp": datetime.now().isoformat(),
        }

    async def _generate_batch_captions_impl(
        self, request: dict, _current_user: User = Depends(require_active_user)
    ):
        """Generate captions for multiple images in batch."""
        tasks = request.get("tasks", [])
        max_concurrent = request.get("max_concurrent", MAX_CONCURRENT_OPERATIONS)

        if not tasks:
            raise HTTPException(status_code=400, detail="tasks are required")

        if len(tasks) > MAX_BATCH_SIZE:
            raise HTTPException(
                status_code=400,
                detail=f"Maximum {MAX_BATCH_SIZE} tasks allowed per batch",
            )

        # Validate all tasks
        service = self.get_service()
        validated_tasks = []

        for task in tasks:
            image_path = task.get("image_path")
            generator_name = task.get("generator_name")

            if not image_path or not generator_name:
                raise HTTPException(
                    status_code=400,
                    detail="Each task must have image_path and generator_name",
                )

            # Validate image path
            image_path_obj = Path(image_path)
            if not image_path_obj.exists():
                raise HTTPException(
                    status_code=404, detail=f"Image not found: {image_path}"
                )

            # Check if generator is available
            if not service.is_generator_available(generator_name):
                raise HTTPException(
                    status_code=400,
                    detail=f"Generator '{generator_name}' is not available",
                )

            validated_tasks.append(
                CaptionTask(
                    image_path=image_path_obj,
                    generator_name=generator_name,
                    config=task.get("config", {}),
                    force=task.get("force", False),
                    post_process=task.get("post_process", True),
                )
            )

        # Generate captions
        results = await service.generate_batch_captions(
            tasks=validated_tasks, max_concurrent=max_concurrent
        )

        return {
            "results": [
                {
                    "success": result.success,
                    "image_path": str(result.image_path),
                    "generator_name": result.generator_name,
                    "caption": result.caption,
                    "error": result.error,
                    "error_type": result.error_type,
                    "retryable": result.retryable,
                    "processing_time": result.processing_time,
                    "caption_type": result.caption_type,
                }
                for result in results
            ],
            "total_tasks": len(tasks),
            "successful": sum(1 for r in results if r.success),
            "failed": sum(1 for r in results if not r.success),
            "timestamp": datetime.now().isoformat(),
        }

    async def _upload_and_generate_impl(
        self,
        file: UploadFile,
        generator_name: str,
        _current_user: User = Depends(require_active_user),
    ):
        """Upload an image and generate a caption for it."""
        # Validate file
        await self._validate_uploaded_file(
            file,
            allowed_types=[
                "image/jpeg",
                "image/png",
                "image/webp",
                "image/gif",
                "image/bmp",
                "image/tiff",
            ],
        )

        # Check if generator is available
        service = self.get_service()
        if not service.is_generator_available(generator_name):
            raise HTTPException(
                status_code=400, detail=f"Generator '{generator_name}' is not available"
            )

        # Save uploaded file temporarily
        temp_path = Path(f"/tmp/{file.filename}")
        with open(temp_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)

        try:
            # Generate caption
            result = await service.generate_single_caption(
                image_path=temp_path,
                generator_name=generator_name,
                config={},
                force=False,
            )

            return {
                "success": result.success,
                "filename": file.filename,
                "generator_name": result.generator_name,
                "caption": result.caption,
                "error": result.error,
                "error_type": result.error_type,
                "retryable": result.retryable,
                "processing_time": result.processing_time,
                "caption_type": result.caption_type,
                "timestamp": datetime.now().isoformat(),
            }

        finally:
            # Clean up temporary file
            if temp_path.exists():
                temp_path.unlink()

    async def _load_model_impl(
        self,
        model_name: str,
        request: dict,
        _current_user: User = Depends(require_active_user),
    ):
        """Load a specific caption model."""
        _config = request.get("config", {})

        service = self.get_service()
        if not service.is_generator_available(model_name):
            raise HTTPException(
                status_code=404, detail=f"Generator '{model_name}' not found"
            )

        success = await service.load_model(model_name)

        if success:
            return {
                "message": f"Model '{model_name}' loaded successfully",
                "model_name": model_name,
                "timestamp": datetime.now().isoformat(),
            }

        raise HTTPException(
            status_code=500, detail=f"Failed to load model '{model_name}'"
        )

    async def _unload_model_impl(
        self, model_name: str, _current_user: User = Depends(require_active_user)
    ):
        """Unload a specific caption model."""
        service = self.get_service()
        success = await service.unload_model(model_name)

        if success:
            return {
                "message": f"Model '{model_name}' unloaded successfully",
                "model_name": model_name,
                "timestamp": datetime.now().isoformat(),
            }

        raise HTTPException(
            status_code=500, detail=f"Failed to unload model '{model_name}'"
        )

    async def _get_loaded_models_impl(
        self, _current_user: User = Depends(require_active_user)
    ):
        """Get list of currently loaded models."""
        service = self.get_service()
        loaded_models = list(service.get_loaded_models())

        return {
            "loaded_models": loaded_models,
            "count": len(loaded_models),
            "timestamp": datetime.now().isoformat(),
        }

    async def _analyze_caption_quality_impl(
        self, request: dict, _current_user: User = Depends(require_active_user)
    ):
        """Analyze caption quality metrics."""
        caption = request.get("caption")
        generator_name = request.get("generator_name")

        if not caption:
            raise HTTPException(status_code=400, detail="caption is required")

        # Mock quality analysis - in a real implementation, this would analyze the caption
        quality_score = 0.85
        length_score = min(1.0, len(caption) / 100)  # Optimal around 100 characters
        readability_score = 0.78
        relevance_score = 0.82

        return {
            "caption": caption,
            "generator_name": generator_name,
            "quality_score": quality_score,
            "length_score": length_score,
            "readability_score": readability_score,
            "relevance_score": relevance_score,
            "overall_score": (
                quality_score + length_score + readability_score + relevance_score
            )
            / 4,
            "recommendations": [
                "Caption quality is good",
                "Consider adding more descriptive details",
                "Length is appropriate for the content",
            ],
            "timestamp": datetime.now().isoformat(),
        }

    async def _get_system_statistics_impl(
        self, _current_user: User = Depends(require_active_user)
    ):
        """Get comprehensive system statistics."""
        service = self.get_service()
        stats = service.get_system_statistics()

        return {
            "statistics": stats,
            "timestamp": datetime.now().isoformat(),
        }

    async def _health_check_impl(self):
        """Health check endpoint for caption generation service."""
        health_status = await self.check_service_health()

        if health_status.status == "healthy":
            return {
                "status": "healthy",
                "service": self.service_name,
                "timestamp": datetime.now().isoformat(),
                **health_status.details,
            }

        return {
            "status": "unhealthy",
            "service": self.service_name,
            "timestamp": datetime.now().isoformat(),
            "error": health_status.message,
        }


# Create router instance
caption_router = CaptionGenerationServiceRouter()
router = caption_router.get_router()
