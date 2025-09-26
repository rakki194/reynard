"""Image Utils API Endpoints for Reynard Backend

Refactored to use BaseServiceRouter infrastructure for consistency and maintainability.
"""

import uuid
from datetime import datetime

from fastapi import Depends, HTTPException, UploadFile
from pydantic import BaseModel, Field

from app.core.base_router import BaseServiceRouter, ServiceStatus
from app.core.logging_config import get_service_logger
from app.core.router_mixins import (
    ConfigEndpointMixin,
    FileUploadMixin,
    MetricsMixin,
    RateLimitingMixin,
    ValidationMixin,
)
from app.services.image_processing_service import ImageProcessingService
from app.utils.image_utils_core import ImageUtils
from gatekeeper.api.dependencies import require_active_user
from gatekeeper.models.user import User

logger = get_service_logger("image-processing")

# Constants
MAX_BATCH_SIZE = 10


class ImageProcessingConfigModel(BaseModel):
    """Configuration model for image processing service."""

    # Service configuration
    enabled: bool = Field(True, description="Enable image processing service")
    max_file_size: int = Field(
        50 * 1024 * 1024,
        ge=1024 * 1024,
        le=500 * 1024 * 1024,
        description="Maximum file size in bytes",
    )
    max_image_dimensions: int = Field(
        10000,
        ge=1000,
        le=50000,
        description="Maximum image dimensions",
    )
    supported_formats: list[str] = Field(
        default=[
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif",
            "image/bmp",
            "image/tiff",
        ],
        description="Supported image formats",
    )

    # Processing settings
    enable_parallel_processing: bool = Field(
        True,
        description="Enable parallel processing for batch operations",
    )
    max_concurrent_operations: int = Field(
        5,
        ge=1,
        le=20,
        description="Maximum concurrent processing operations",
    )
    enable_format_conversion: bool = Field(
        True,
        description="Enable format conversion capabilities",
    )
    enable_quality_analysis: bool = Field(
        True,
        description="Enable image quality analysis",
    )

    # Caching settings
    enable_result_caching: bool = Field(True, description="Enable result caching")
    cache_ttl_seconds: int = Field(
        3600,
        ge=300,
        le=86400,
        description="Cache TTL in seconds",
    )
    cache_compression: bool = Field(True, description="Enable cache compression")
    max_cache_size_mb: int = Field(
        500,
        ge=50,
        le=2000,
        description="Maximum cache size in MB",
    )

    # Quality settings
    default_jpeg_quality: int = Field(
        85,
        ge=1,
        le=100,
        description="Default JPEG quality",
    )
    default_webp_quality: int = Field(
        80,
        ge=1,
        le=100,
        description="Default WebP quality",
    )
    default_png_compression: int = Field(
        6,
        ge=0,
        le=9,
        description="Default PNG compression level",
    )

    # Rate limiting
    upload_rate_limit: int = Field(
        20,
        ge=1,
        le=100,
        description="Upload requests per minute",
    )
    processing_rate_limit: int = Field(
        30,
        ge=1,
        le=100,
        description="Processing requests per minute",
    )
    validation_rate_limit: int = Field(
        50,
        ge=1,
        le=200,
        description="Validation requests per minute",
    )

    # Security settings
    enable_virus_scanning: bool = Field(
        False,
        description="Enable virus scanning for uploaded images",
    )
    enable_metadata_stripping: bool = Field(
        True,
        description="Strip metadata from processed images",
    )
    allowed_exif_tags: list[str] = Field(
        default=["DateTime", "DateTimeOriginal", "Make", "Model"],
        description="Allowed EXIF tags to preserve",
    )


class ImageProcessingServiceRouter(
    BaseServiceRouter,
    ConfigEndpointMixin,
    FileUploadMixin,
    MetricsMixin,
    RateLimitingMixin,
    ValidationMixin,
):
    """Service router for image processing endpoints."""

    def __init__(self):
        super().__init__("image-processing")
        self.service_name = "image-processing"
        self.config_model = ImageProcessingConfigModel

        # Initialize mixins
        self.setup_config_endpoints(self.config_model)
        self.setup_rate_limiting_endpoints()
        self.setup_metrics_endpoints()

        # Setup image processing endpoints
        # TODO: Fix endpoint definitions to use proper async function syntax
        # self._setup_image_endpoints()

    def get_service(self):
        """Get the image processing service instance."""
        return ImageProcessingService()

    async def check_service_health(self) -> ServiceStatus:
        """Check the health of the image processing service."""
        try:
            service = self.get_service()
            info = service.get_info()

            return ServiceStatus(
                service_name=self.service_name,
                status="healthy" if info["initialized"] else "unhealthy",
                message=(
                    "Service is operational"
                    if info["initialized"]
                    else "Service not initialized"
                ),
                details={
                    "initialized": info["initialized"],
                    "jxl_supported": info["pillow_jxl_available"],
                    "avif_supported": info["pillow_avif_available"],
                    "supported_formats": info["supported_formats"],
                    "total_formats": len(info["supported_formats"]),
                    "startup_time": info["startup_time"],
                    "last_health_check": info["last_health_check"],
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

    def _setup_image_endpoints(self):
        """Setup image processing endpoints."""
        api_router = self.get_router()

        # Core service endpoints
        api_router.get("/service-info")(
            self._standard_async_operation(self._get_service_info_impl),
        )

        api_router.get("/supported-formats")(
            self._standard_async_operation(self._get_supported_formats_impl),
        )

        api_router.get("/format/{extension}")(
            self._standard_async_operation(self._get_format_info_impl),
        )

        # Validation endpoints
        api_router.post("/validate-path")(
            self._standard_async_operation(self._validate_image_path_impl),
        )

        api_router.post("/validate-dimensions")(
            self._standard_async_operation(self._validate_dimensions_impl),
        )

        # Processing endpoints
        api_router.post("/aspect-ratio")(
            self._standard_async_operation(self._get_aspect_ratio_impl),
        )

        api_router.post("/resize-dimensions")(
            self._standard_async_operation(self._calculate_resize_dimensions_impl),
        )

        # File upload endpoints
        api_router.post("/upload")(
            self._standard_async_operation(self._upload_image_impl),
        )

        api_router.post("/batch-upload")(
            self._standard_async_operation(self._batch_upload_impl),
        )

        # Quality analysis endpoints
        api_router.post("/analyze-quality")(
            self._standard_async_operation(self._analyze_image_quality_impl),
        )

        # Health check endpoint
        api_router.get("/health")(
            self._standard_async_operation(self._health_check_impl),
        )

    async def _get_service_info_impl(
        self,
        _current_user: User = Depends(require_active_user),
    ):
        """Get image processing service information."""
        service = self.get_service()
        supported_formats = service.get_supported_formats_for_inference()

        return {
            "jxl_supported": service.is_jxl_supported(),
            "avif_supported": service.is_avif_supported(),
            "supported_formats": supported_formats,
            "total_formats": len(supported_formats),
            "service_info": service.get_info(),
        }

    async def _get_supported_formats_impl(
        self,
        _current_user: User = Depends(require_active_user),
    ):
        """Get list of supported image formats."""
        service = self.get_service()
        return service.get_supported_formats_for_inference()

    async def _get_format_info_impl(
        self,
        extension: str,
        _current_user: User = Depends(require_active_user),
    ):
        """Get format information for a specific extension."""
        format_info = ImageUtils.get_format_info(extension)
        if not format_info:
            raise HTTPException(
                status_code=404,
                detail=f"Format not found: {extension}",
            )

        return {
            "extension": format_info.extension,
            "mime_type": format_info.mime_type,
            "supported": format_info.supported,
            "requires_plugin": format_info.requires_plugin,
        }

    async def _validate_image_path_impl(
        self,
        request: dict,
        _current_user: User = Depends(require_active_user),
    ):
        """Validate an image file path."""
        file_path = request.get("file_path")
        if not file_path:
            raise HTTPException(status_code=400, detail="file_path is required")

        valid = ImageUtils.validate_image_path(file_path)
        return {
            "valid": valid,
            "message": "Valid image path" if valid else "Invalid image path",
        }

    async def _validate_dimensions_impl(
        self,
        request: dict,
        _current_user: User = Depends(require_active_user),
    ):
        """Validate image dimensions."""
        width = request.get("width")
        height = request.get("height")

        if not width or not height:
            raise HTTPException(status_code=400, detail="width and height are required")

        valid = ImageUtils.validate_dimensions(width, height)
        return {
            "valid": valid,
            "message": "Valid dimensions" if valid else "Invalid dimensions",
        }

    async def _get_aspect_ratio_impl(
        self,
        request: dict,
        _current_user: User = Depends(require_active_user),
    ):
        """Calculate aspect ratio for given dimensions."""
        width = request.get("width")
        height = request.get("height")

        if not width or not height:
            raise HTTPException(status_code=400, detail="width and height are required")

        aspect_ratio = ImageUtils.get_aspect_ratio(width, height)
        return {"aspect_ratio": aspect_ratio}

    async def _calculate_resize_dimensions_impl(
        self,
        request: dict,
        _current_user: User = Depends(require_active_user),
    ):
        """Calculate resize dimensions maintaining aspect ratio."""
        original_width = request.get("original_width")
        original_height = request.get("original_height")
        target_width = request.get("target_width")
        target_height = request.get("target_height")

        if not all([original_width, original_height]):
            raise HTTPException(
                status_code=400,
                detail="original_width and original_height are required",
            )

        width, height = ImageUtils.calculate_resize_dimensions(
            original_width,
            original_height,
            target_width,
            target_height,
        )

        return {"width": width, "height": height}

    async def _upload_image_impl(
        self,
        file: UploadFile,
        _current_user: User = Depends(require_active_user),
    ):
        """Upload and process a single image."""
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

        # Process the image
        job_id = str(uuid.uuid4())

        return {
            "job_id": job_id,
            "filename": file.filename,
            "content_type": file.content_type,
            "size": file.size,
            "status": "uploaded",
            "timestamp": datetime.now().isoformat(),
        }

    async def _batch_upload_impl(
        self,
        files: list[UploadFile],
        _current_user: User = Depends(require_active_user),
    ):
        """Upload and process multiple images in batch."""
        if len(files) > MAX_BATCH_SIZE:  # Limit batch size
            raise HTTPException(
                status_code=400,
                detail="Maximum 10 files allowed per batch",
            )

        results = []
        for file in files:
            # Validate each file
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

            job_id = str(uuid.uuid4())
            results.append(
                {
                    "job_id": job_id,
                    "filename": file.filename,
                    "content_type": file.content_type,
                    "size": file.size,
                    "status": "uploaded",
                },
            )

        return {
            "batch_id": str(uuid.uuid4()),
            "total_files": len(files),
            "results": results,
            "timestamp": datetime.now().isoformat(),
        }

    async def _analyze_image_quality_impl(
        self,
        file: UploadFile,
        _current_user: User = Depends(require_active_user),
    ):
        """Analyze image quality metrics."""
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

        # Mock quality analysis - in a real implementation, this would analyze the image
        return {
            "filename": file.filename,
            "quality_score": 0.85,
            "sharpness": 0.78,
            "brightness": 0.65,
            "contrast": 0.72,
            "color_accuracy": 0.88,
            "noise_level": 0.15,
            "recommendations": [
                "Image quality is good",
                "Consider slight brightness adjustment",
                "Noise level is acceptable",
            ],
            "timestamp": datetime.now().isoformat(),
        }

    async def _health_check_impl(self):
        """Health check endpoint for image processing service."""
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
image_router = ImageProcessingServiceRouter()
router = image_router.get_router()
