"""
Gallery-dl API Endpoints

FastAPI endpoints for gallery-dl integration with Reynard.
Provides comprehensive download management, progress tracking, and error handling.
"""

import logging
from typing import Any

from fastapi import APIRouter, Depends, HTTPException

from app.auth.user_service import get_current_active_user
from app.services.gallery.gallery_service import ReynardGalleryService

logger = logging.getLogger(__name__)

# ============================================================================
# Request/Response Models
# ============================================================================

from pydantic import BaseModel


class GalleryDownloadRequest(BaseModel):
    """Request model for gallery download"""

    url: str
    output_directory: str | None = None
    max_concurrent: int = 3
    retries: int = 3
    timeout: int = 300
    options: dict[str, Any] = {}


class GalleryDownloadResponse(BaseModel):
    """Response model for gallery download"""

    success: bool
    download_id: str
    message: str
    error: str | None = None
    data: dict[str, Any] | None = None


class UrlValidationRequest(BaseModel):
    """Request model for URL validation"""

    url: str


class UrlValidationResponse(BaseModel):
    """Response model for URL validation"""

    is_valid: bool
    extractor: str | None = None
    error: str | None = None


class ExtractorInfo(BaseModel):
    """Extractor information model"""

    name: str
    description: str
    supported_domains: list[str]
    reynard_enabled: bool = False
    type: str = "standard"


class ExtractorListResponse(BaseModel):
    """Response model for extractor list"""

    extractors: list[ExtractorInfo]
    total: int
    reynard_extractors: int


class ProgressResponse(BaseModel):
    """Response model for download progress"""

    download_id: str
    url: str
    status: str
    percentage: float
    current_file: str | None = None
    total_files: int | None = None
    downloaded_files: int | None = None
    total_bytes: int | None = None
    downloaded_bytes: int | None = None
    speed: float | None = None
    estimated_time: str | None = None
    message: str | None = None
    error: str | None = None


class HealthResponse(BaseModel):
    """Response model for service health"""

    status: str
    version: str
    uptime: float
    active_downloads: int
    total_downloads: int
    last_check: str


# ============================================================================
# Router Setup
# ============================================================================

router = APIRouter(prefix="/api/gallerydl", tags=["gallerydl"])

# Global service instance (will be initialized by dependency injection)
_gallery_service: ReynardGalleryService | None = None


def get_gallery_service() -> ReynardGalleryService:
    """Get or create gallery service instance"""
    global _gallery_service
    if _gallery_service is None:
        _gallery_service = ReynardGalleryService(config={})
    return _gallery_service


# ============================================================================
# API Endpoints
# ============================================================================


@router.post("/download", response_model=GalleryDownloadResponse)
async def download_gallery(
    request: GalleryDownloadRequest,
    current_user: dict[str, str] = Depends(get_current_active_user),
    service: ReynardGalleryService = Depends(get_gallery_service),
):
    """
    Download a gallery from URL

    This endpoint starts a gallery download in the background and returns
    a download ID for tracking progress.
    """
    try:
        logger.info(
            f"Starting gallery download for user {current_user.id}: {request.url}"
        )

        # Prepare download options
        options = {
            "output_directory": request.output_directory,
            "max_concurrent": request.max_concurrent,
            "retries": request.retries,
            "timeout": request.timeout,
            **request.options,
        }

        # Start download in background
        result = await service.download_gallery(request.url, options)

        if result.success:
            return GalleryDownloadResponse(
                success=True,
                download_id=result.download_id,
                message="Download started successfully",
                data={
                    "url": request.url,
                    "extractor": result.extractor_info,
                    "estimated_files": result.stats.get("total_files", 0),
                },
            )
        else:
            return GalleryDownloadResponse(
                success=False,
                download_id="",
                message="Download failed to start",
                error=result.error,
            )

    except Exception as e:
        logger.exception(f"Error starting gallery download: {e}")
        raise HTTPException(
            status_code=500, detail=f"Failed to start download: {str(e)}"
        )


@router.post("/validate", response_model=UrlValidationResponse)
async def validate_url(
    request: UrlValidationRequest,
    current_user: dict[str, str] = Depends(get_current_active_user),
    service: ReynardGalleryService = Depends(get_gallery_service),
):
    """
    Validate a URL and detect extractor

    Validates if a URL can be processed by gallery-dl and returns
    information about the detected extractor.
    """
    try:
        logger.info(f"Validating URL for user {current_user.id}: {request.url}")

        result = await service.validate_url(request.url)

        return UrlValidationResponse(
            is_valid=result.get("is_valid", False),
            extractor=result.get("extractor"),
            error=result.get("error"),
        )

    except Exception as e:
        logger.exception(f"Error validating URL: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to validate URL: {str(e)}")


@router.get("/extractors", response_model=ExtractorListResponse)
async def get_extractors(
    current_user: dict[str, str] = Depends(get_current_active_user),
    service: ReynardGalleryService = Depends(get_gallery_service),
):
    """
    Get list of available extractors

    Returns all available extractors including Reynard custom extractors.
    """
    try:
        logger.info(f"Getting extractors for user {current_user.id}")

        extractors = await service.get_extractors()
        reynard_extractors = [
            ext for ext in extractors if ext.get("reynard_enabled", False)
        ]

        extractor_list = []
        for ext in extractors:
            extractor_list.append(
                ExtractorInfo(
                    name=ext.get("name", ""),
                    description=ext.get("description", ""),
                    supported_domains=ext.get("domains", []),
                    reynard_enabled=ext.get("reynard_enabled", False),
                    type=ext.get("type", "standard"),
                )
            )

        return ExtractorListResponse(
            extractors=extractor_list,
            total=len(extractor_list),
            reynard_extractors=len(reynard_extractors),
        )

    except Exception as e:
        logger.exception(f"Error getting extractors: {e}")
        raise HTTPException(
            status_code=500, detail=f"Failed to get extractors: {str(e)}"
        )


@router.get("/progress/{download_id}", response_model=ProgressResponse)
async def get_download_progress(
    download_id: str,
    current_user: dict[str, str] = Depends(get_current_active_user),
    service: ReynardGalleryService = Depends(get_gallery_service),
):
    """
    Get download progress for a specific download

    Returns current progress information for an active download.
    """
    try:
        logger.info(
            f"Getting progress for download {download_id} (user {current_user.id})"
        )

        progress = await service.get_download_progress(download_id)

        if progress is None:
            raise HTTPException(status_code=404, detail="Download not found")

        return ProgressResponse(
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
        logger.exception(f"Error getting download progress: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get progress: {str(e)}")


@router.get("/downloads/active", response_model=list[ProgressResponse])
async def get_active_downloads(
    current_user: dict[str, str] = Depends(get_current_active_user),
    service: ReynardGalleryService = Depends(get_gallery_service),
):
    """
    Get all active downloads

    Returns list of all currently active downloads.
    """
    try:
        logger.info(f"Getting active downloads for user {current_user.id}")

        downloads = await service.get_active_downloads()

        return [
            ProgressResponse(
                download_id=download.download_id,
                url=download.url,
                status=download.status,
                percentage=download.percentage,
                current_file=download.current_file,
                total_files=download.total_files,
                downloaded_files=download.downloaded_files,
                total_bytes=download.total_bytes,
                downloaded_bytes=download.downloaded_bytes,
                speed=download.speed,
                estimated_time=download.estimated_time,
                message=download.message,
                error=download.error,
            )
            for download in downloads
        ]

    except Exception as e:
        logger.exception(f"Error getting active downloads: {e}")
        raise HTTPException(
            status_code=500, detail=f"Failed to get active downloads: {str(e)}"
        )


@router.post("/downloads/{download_id}/cancel")
async def cancel_download(
    download_id: str,
    current_user: dict[str, str] = Depends(get_current_active_user),
    service: ReynardGalleryService = Depends(get_gallery_service),
):
    """
    Cancel an active download

    Cancels a download that is currently in progress.
    """
    try:
        logger.info(f"Cancelling download {download_id} for user {current_user.id}")

        result = await service.cancel_download(download_id)

        if result.success:
            return {"success": True, "message": "Download cancelled successfully"}
        else:
            raise HTTPException(status_code=400, detail=result.error)

    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Error cancelling download: {e}")
        raise HTTPException(
            status_code=500, detail=f"Failed to cancel download: {str(e)}"
        )


@router.get("/downloads/history", response_model=list[dict[str, Any]])
async def get_download_history(
    current_user: dict[str, str] = Depends(get_current_active_user),
    service: ReynardGalleryService = Depends(get_gallery_service),
):
    """
    Get download history

    Returns list of completed downloads with metadata.
    """
    try:
        logger.info(f"Getting download history for user {current_user.id}")

        history = await service.get_download_history()
        return history

    except Exception as e:
        logger.exception(f"Error getting download history: {e}")
        raise HTTPException(
            status_code=500, detail=f"Failed to get download history: {str(e)}"
        )


@router.get("/health", response_model=HealthResponse)
async def get_health(service: ReynardGalleryService = Depends(get_gallery_service)):
    """
    Get service health status

    Returns current health status and metrics.
    """
    try:
        health = await service.get_health()
        return HealthResponse(
            status=health.get("status", "unknown"),
            version=health.get("version", "1.0.0"),
            uptime=health.get("uptime", 0.0),
            active_downloads=health.get("active_downloads", 0),
            total_downloads=health.get("total_downloads", 0),
            last_check=health.get("last_check", ""),
        )

    except Exception as e:
        logger.exception(f"Error getting health status: {e}")
        raise HTTPException(
            status_code=500, detail=f"Failed to get health status: {str(e)}"
        )


@router.get("/stats", response_model=dict[str, Any])
async def get_stats(
    current_user: dict[str, str] = Depends(get_current_active_user),
    service: ReynardGalleryService = Depends(get_gallery_service),
):
    """
    Get extractor statistics

    Returns statistics about extractor usage and performance.
    """
    try:
        logger.info(f"Getting stats for user {current_user.id}")

        stats = await service.get_extractor_stats()
        return stats

    except Exception as e:
        logger.exception(f"Error getting stats: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get stats: {str(e)}")
