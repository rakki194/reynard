"""
Gallery API Endpoints

FastAPI endpoints for gallery-dl integration with comprehensive error handling,
progress tracking, and Reynard ecosystem integration.
"""

import json
import logging
from typing import Any

from fastapi import (
    BackgroundTasks,
    Depends,
    HTTPException,
    WebSocket,
    WebSocketDisconnect,
)
from pydantic import BaseModel, Field

# Reynard imports
from app.core.base_router import BaseServiceRouter
from app.services.gallery import ReynardGalleryService, get_gallery_service
from app.services.gallery.batch_processor import DownloadPriority, batch_processor
from app.services.gallery.websocket_manager import websocket_manager
from gatekeeper.api.dependencies import User, require_active_user

logger = logging.getLogger(__name__)


# ============================================================================
# Request/Response Models
# ============================================================================


class GalleryDownloadRequest(BaseModel):
    """Request model for gallery download"""

    url: str = Field(..., description="URL to download from")
    output_directory: str | None = Field(None, description="Output directory")
    filename: str | None = Field(None, description="Filename pattern")
    postprocessors: list[str] | None = Field(
        None, description="Post-processors to apply"
    )
    extractor_options: dict[str, Any] | None = Field(
        None, description="Extractor-specific options"
    )
    max_concurrent: int | None = Field(3, description="Maximum concurrent downloads")
    retry_config: dict[str, Any] | None = Field(None, description="Retry configuration")


class BatchDownloadRequest(BaseModel):
    """Request model for batch download"""

    urls: list[str] = Field(..., description="URLs to download")
    name: str | None = Field(None, description="Batch name")
    options: GalleryDownloadRequest | None = Field(None, description="Download options")


class ValidationRequest(BaseModel):
    """Request model for URL validation"""

    url: str = Field(..., description="URL to validate")


class DownloadProgressResponse(BaseModel):
    """Response model for download progress"""

    download_id: str
    url: str
    status: str
    percentage: float
    current_file: str | None = None
    total_files: int = 0
    downloaded_files: int = 0
    total_bytes: int = 0
    downloaded_bytes: int = 0
    speed: float = 0.0
    estimated_time: float | None = None
    message: str | None = None
    error: str | None = None


class DownloadResultResponse(BaseModel):
    """Response model for download result"""

    download_id: str
    success: bool
    files: list[dict[str, Any]]
    stats: dict[str, Any]
    duration: float
    extractor_info: dict[str, Any]
    error: str | None = None


class ExtractorInfoResponse(BaseModel):
    """Response model for extractor information"""

    name: str
    category: str
    subcategory: str | None = None
    patterns: list[str]
    description: str | None = None
    available: bool


class ValidationResponse(BaseModel):
    """Response model for URL validation"""

    is_valid: bool
    extractor: ExtractorInfoResponse | None = None
    error: str | None = None
    pattern: list[str] | None = None


class ServiceHealthResponse(BaseModel):
    """Response model for service health"""

    status: str
    last_check: str
    check_duration: float
    error: str | None = None


class BatchDownloadResponse(BaseModel):
    """Batch download response"""

    batch_id: str
    name: str
    total_items: int
    status: str
    created_at: str


class BatchDownloadItemResponse(BaseModel):
    """Batch download item response"""

    id: str
    url: str
    status: str
    priority: str
    created_at: str
    started_at: str | None = None
    completed_at: str | None = None
    error: str | None = None
    retry_count: int = 0
    metrics: dict[str, Any] | None = None


# ============================================================================
# Gallery Router
# ============================================================================


class GalleryRouter(BaseServiceRouter):
    """Gallery service router with comprehensive endpoints"""

    def __init__(self):
        super().__init__(
            service_name="gallery",
            prefix="/api/gallery",
            tags=["gallery", "download", "media"],
        )

    def get_service(self) -> ReynardGalleryService:
        """Get the gallery service instance"""
        service = get_gallery_service()
        if not service:
            raise HTTPException(status_code=503, detail="Gallery service not available")
        return service

    def check_service_health(self) -> dict[str, Any]:
        """Check gallery service health"""
        service = self.get_service()
        return {
            "status": "healthy" if service.gallery_dl_available else "unhealthy",
            "service": "gallery",
            "timestamp": 0.0,
            "details": {
                "gallery_dl_available": service.gallery_dl_available,
                "active_downloads": len(service.active_downloads),
                "extractors_count": len(service._get_available_extractors()),
            },
        }

    def _setup_routes(self):
        """Setup all gallery routes"""

        @self.router.post("/download", response_model=DownloadResultResponse)
        async def download_gallery(
            request: GalleryDownloadRequest,
            background_tasks: BackgroundTasks,
            current_user: User = Depends(require_active_user),
        ):
            """Download a gallery from URL"""
            try:
                service = self.get_service()

                # Convert request to options dict
                options = {
                    "output_directory": request.output_directory,
                    "filename": request.filename,
                    "postprocessors": request.postprocessors,
                    "extractor_options": request.extractor_options,
                    "max_concurrent": request.max_concurrent,
                    "retry_config": request.retry_config,
                }

                # Perform download
                result = await service.download_gallery(request.url, options)

                return DownloadResultResponse(
                    download_id=result.download_id,
                    success=result.success,
                    files=result.files,
                    stats=result.stats,
                    duration=result.duration,
                    extractor_info=result.extractor_info,
                    error=result.error,
                )

            except Exception as e:
                logger.error(f"Download failed: {e}")
                raise HTTPException(status_code=500, detail=f"Download failed: {e!s}")

        @self.router.get("/extractors", response_model=list[ExtractorInfoResponse])
        async def get_extractors(current_user: User = Depends(require_active_user)):
            """Get available extractors"""
            try:
                service = self.get_service()
                extractors = await service.get_extractors()

                return [
                    ExtractorInfoResponse(
                        name=ext["name"],
                        category=ext["category"],
                        subcategory=ext.get("subcategory"),
                        patterns=ext["patterns"],
                        description=ext.get("description"),
                        available=ext["available"],
                    )
                    for ext in extractors
                ]

            except Exception as e:
                logger.error(f"Failed to get extractors: {e}")
                raise HTTPException(
                    status_code=500, detail=f"Failed to get extractors: {e!s}"
                )

        @self.router.post("/validate", response_model=ValidationResponse)
        async def validate_url(
            request: ValidationRequest,
            current_user: User = Depends(require_active_user),
        ):
            """Validate URL and detect extractor"""
            try:
                service = self.get_service()
                validation = await service.validate_url(request.url)

                extractor_info = None
                if validation.get("is_valid") and validation.get("extractor"):
                    ext = validation["extractor"]
                    extractor_info = ExtractorInfoResponse(
                        name=ext["name"],
                        category=ext["category"],
                        subcategory=ext.get("subcategory"),
                        patterns=ext["patterns"],
                        available=True,
                    )

                return ValidationResponse(
                    is_valid=validation["is_valid"],
                    extractor=extractor_info,
                    error=validation.get("error"),
                    pattern=validation.get("pattern"),
                )

            except Exception as e:
                logger.error(f"Validation failed: {e}")
                raise HTTPException(status_code=500, detail=f"Validation failed: {e!s}")

        @self.router.get(
            "/progress/{download_id}", response_model=DownloadProgressResponse
        )
        async def get_download_progress(
            download_id: str, current_user: User = Depends(require_active_user)
        ):
            """Get download progress"""
            try:
                service = self.get_service()
                progress = await service.get_download_progress(download_id)

                if not progress:
                    raise HTTPException(status_code=404, detail="Download not found")

                return DownloadProgressResponse(
                    download_id=progress.download_id,
                    url=progress.url,
                    status=progress.status,
                    percentage=progress.percentage,
                    current_file=progress.current_file,
                    total_files=progress.total_files,
                    downloaded_files=progress.downloaded_files,
                    total_bytes=progress.total_bytes,
                    downloaded_bytes=progress.downloaded_bytes,
                    speed=progress.speed,
                    estimated_time=progress.estimated_time,
                    message=progress.message,
                    error=progress.error,
                )

            except HTTPException:
                raise
            except Exception as e:
                logger.error(f"Failed to get progress: {e}")
                raise HTTPException(
                    status_code=500, detail=f"Failed to get progress: {e!s}"
                )

        @self.router.get(
            "/downloads/active", response_model=list[DownloadProgressResponse]
        )
        async def get_active_downloads(
            current_user: User = Depends(require_active_user),
        ):
            """Get all active downloads"""
            try:
                service = self.get_service()
                downloads = await service.get_active_downloads()

                return [
                    DownloadProgressResponse(
                        download_id=dl.download_id,
                        url=dl.url,
                        status=dl.status,
                        percentage=dl.percentage,
                        current_file=dl.current_file,
                        total_files=dl.total_files,
                        downloaded_files=dl.downloaded_files,
                        total_bytes=dl.total_bytes,
                        downloaded_bytes=dl.downloaded_bytes,
                        speed=dl.speed,
                        estimated_time=dl.estimated_time,
                        message=dl.message,
                        error=dl.error,
                    )
                    for dl in downloads
                ]

            except Exception as e:
                logger.error(f"Failed to get active downloads: {e}")
                raise HTTPException(
                    status_code=500, detail=f"Failed to get active downloads: {e!s}"
                )

        @self.router.delete("/downloads/{download_id}")
        async def cancel_download(
            download_id: str, current_user: User = Depends(require_active_user)
        ):
            """Cancel a download"""
            try:
                service = self.get_service()
                success = await service.cancel_download(download_id)

                if not success:
                    raise HTTPException(status_code=404, detail="Download not found")

                return {"message": "Download cancelled successfully"}

            except HTTPException:
                raise
            except Exception as e:
                logger.error(f"Failed to cancel download: {e}")
                raise HTTPException(
                    status_code=500, detail=f"Failed to cancel download: {e!s}"
                )

        @self.router.get("/history", response_model=list[DownloadResultResponse])
        async def get_download_history(
            limit: int = 100, current_user: User = Depends(require_active_user)
        ):
            """Get download history"""
            try:
                service = self.get_service()
                history = await service.get_download_history(limit)

                return [
                    DownloadResultResponse(
                        download_id=result.download_id,
                        success=result.success,
                        files=result.files,
                        stats=result.stats,
                        duration=result.duration,
                        extractor_info=result.extractor_info,
                        error=result.error,
                    )
                    for result in history
                ]

            except Exception as e:
                logger.error(f"Failed to get download history: {e}")
                raise HTTPException(
                    status_code=500, detail=f"Failed to get download history: {e!s}"
                )

        @self.router.get(
            "/extractors/reynard", response_model=list[ExtractorInfoResponse]
        )
        async def get_reynard_extractors(
            current_user: User = Depends(require_active_user),
        ):
            """Get Reynard custom extractors"""
            try:
                service = self.get_service()
                extractors = await service.get_reynard_extractors()

                return [
                    ExtractorInfoResponse(
                        name=ext["name"],
                        category=ext["category"],
                        subcategory=ext["subcategory"],
                        patterns=ext["pattern"],
                        description=ext.get("description"),
                        available=ext["reynard_enabled"],
                    )
                    for ext in extractors
                ]

            except Exception as e:
                logger.error(f"Failed to get Reynard extractors: {e}")
                raise HTTPException(
                    status_code=500, detail=f"Failed to get Reynard extractors: {e!s}"
                )

        @self.router.get("/extractors/stats")
        async def get_extractor_stats(
            current_user: User = Depends(require_active_user),
        ):
            """Get extractor statistics"""
            try:
                service = self.get_service()
                stats = await service.get_extractor_stats()

                return stats

            except Exception as e:
                logger.error(f"Failed to get extractor stats: {e}")
                raise HTTPException(
                    status_code=500, detail=f"Failed to get extractor stats: {e!s}"
                )

        @self.router.websocket("/ws")
        async def websocket_endpoint(websocket: WebSocket):
            """WebSocket endpoint for real-time progress updates"""
            connection_index = None
            try:
                # Accept connection
                connection_index = await websocket_manager.connect(websocket)

                # Keep connection alive and handle messages
                while True:
                    try:
                        # Wait for messages from client
                        data = await websocket.receive_text()
                        message = json.loads(data)

                        if message.get("type") == "subscribe":
                            download_id = message.get("download_id")
                            if download_id:
                                await websocket_manager.subscribe_to_download(
                                    connection_index, download_id
                                )
                                await websocket.send_text(
                                    json.dumps(
                                        {
                                            "type": "subscribed",
                                            "download_id": download_id,
                                        }
                                    )
                                )

                        elif message.get("type") == "unsubscribe":
                            download_id = message.get("download_id")
                            if download_id:
                                await websocket_manager.unsubscribe_from_download(
                                    connection_index, download_id
                                )
                                await websocket.send_text(
                                    json.dumps(
                                        {
                                            "type": "unsubscribed",
                                            "download_id": download_id,
                                        }
                                    )
                                )

                        elif message.get("type") == "ping":
                            await websocket.send_text(json.dumps({"type": "pong"}))

                    except WebSocketDisconnect:
                        break
                    except Exception as e:
                        logger.error(f"WebSocket message handling error: {e}")
                        await websocket.send_text(
                            json.dumps({"type": "error", "message": str(e)})
                        )

            except WebSocketDisconnect:
                pass
            except Exception as e:
                logger.error(f"WebSocket connection error: {e}")
            finally:
                if connection_index is not None:
                    await websocket_manager.disconnect(connection_index)

        @self.router.get("/ws/stats")
        async def get_websocket_stats(
            current_user: User = Depends(require_active_user),
        ):
            """Get WebSocket connection statistics"""
            try:
                stats = await websocket_manager.get_connection_stats()
                return stats
            except Exception as e:
                logger.error(f"Failed to get WebSocket stats: {e}")
                raise HTTPException(
                    status_code=500, detail=f"Failed to get WebSocket stats: {e!s}"
                )

        @self.router.post("/batch", response_model=BatchDownloadResponse)
        async def create_batch_download(
            request: BatchDownloadRequest,
            current_user: User = Depends(require_active_user),
        ):
            """Create a new batch download"""
            try:
                # Convert priority string to enum
                priority_map = {
                    "low": DownloadPriority.LOW,
                    "normal": DownloadPriority.NORMAL,
                    "high": DownloadPriority.HIGH,
                    "urgent": DownloadPriority.URGENT,
                }
                priority = priority_map.get(
                    request.priority.lower(), DownloadPriority.NORMAL
                )

                # Create batch download
                batch = await batch_processor.create_batch_download(
                    name=request.name or f"Batch Download {len(request.urls)} items",
                    urls=request.urls,
                    options=request.options or {},
                    priority=priority,
                    settings=request.settings or {},
                )

                return BatchDownloadResponse(
                    batch_id=batch.id,
                    name=batch.name,
                    total_items=batch.total_items,
                    status=batch.status.value,
                    created_at=batch.created_at,
                )

            except Exception as e:
                logger.error(f"Failed to create batch download: {e}")
                raise HTTPException(
                    status_code=500, detail=f"Failed to create batch download: {e!s}"
                )

        @self.router.get("/batch", response_model=list[BatchDownloadResponse])
        async def get_batch_downloads(
            current_user: User = Depends(require_active_user),
        ):
            """Get all batch downloads"""
            try:
                batches = await batch_processor.get_batch_downloads()

                return [
                    BatchDownloadResponse(
                        batch_id=batch.id,
                        name=batch.name,
                        total_items=batch.total_items,
                        status=batch.status.value,
                        created_at=batch.created_at,
                    )
                    for batch in batches
                ]

            except Exception as e:
                logger.error(f"Failed to get batch downloads: {e}")
                raise HTTPException(
                    status_code=500, detail=f"Failed to get batch downloads: {e!s}"
                )

        @self.router.get("/batch/{batch_id}", response_model=BatchDownloadResponse)
        async def get_batch_download(
            batch_id: str, current_user: User = Depends(require_active_user)
        ):
            """Get batch download by ID"""
            try:
                batch = await batch_processor.get_batch_download(batch_id)
                if not batch:
                    raise HTTPException(
                        status_code=404, detail="Batch download not found"
                    )

                return BatchDownloadResponse(
                    batch_id=batch.id,
                    name=batch.name,
                    total_items=batch.total_items,
                    status=batch.status.value,
                    created_at=batch.created_at,
                )

            except HTTPException:
                raise
            except Exception as e:
                logger.error(f"Failed to get batch download {batch_id}: {e}")
                raise HTTPException(
                    status_code=500, detail=f"Failed to get batch download: {e!s}"
                )

        @self.router.delete("/batch/{batch_id}")
        async def cancel_batch_download(
            batch_id: str, current_user: User = Depends(require_active_user)
        ):
            """Cancel a batch download"""
            try:
                success = await batch_processor.cancel_batch_download(batch_id)
                if not success:
                    raise HTTPException(
                        status_code=404, detail="Batch download not found"
                    )

                return {"message": "Batch download cancelled successfully"}

            except HTTPException:
                raise
            except Exception as e:
                logger.error(f"Failed to cancel batch download {batch_id}: {e}")
                raise HTTPException(
                    status_code=500, detail=f"Failed to cancel batch download: {e!s}"
                )

        @self.router.post("/batch/{batch_id}/retry")
        async def retry_batch_download(
            batch_id: str, current_user: User = Depends(require_active_user)
        ):
            """Retry failed items in a batch download"""
            try:
                success = await batch_processor.retry_failed_items(batch_id)
                if not success:
                    raise HTTPException(
                        status_code=404, detail="Batch download not found"
                    )

                return {"message": "Failed items queued for retry"}

            except HTTPException:
                raise
            except Exception as e:
                logger.error(f"Failed to retry batch download {batch_id}: {e}")
                raise HTTPException(
                    status_code=500, detail=f"Failed to retry batch download: {e!s}"
                )

        @self.router.get("/batch/processor/stats")
        async def get_batch_processor_stats(
            current_user: User = Depends(require_active_user),
        ):
            """Get batch processor statistics"""
            try:
                stats = await batch_processor.get_processor_stats()
                return stats
            except Exception as e:
                logger.error(f"Failed to get batch processor stats: {e}")
                raise HTTPException(
                    status_code=500,
                    detail=f"Failed to get batch processor stats: {e!s}",
                )

        @self.router.get("/health", response_model=ServiceHealthResponse)
        async def get_service_health():
            """Get service health"""
            try:
                service = self.get_service()
                metrics = await service.get_service_metrics()

                return ServiceHealthResponse(
                    status="healthy" if service.gallery_dl_available else "unhealthy",
                    last_check="",
                    check_duration=0.0,
                    metrics=metrics,
                )

            except Exception as e:
                logger.error(f"Health check failed: {e}")
                return ServiceHealthResponse(
                    status="unhealthy", last_check="", check_duration=0.0, error=str(e)
                )


# Create router instance
gallery_router = GalleryRouter()
router = gallery_router.router
