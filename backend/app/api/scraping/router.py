"""
Scraping API Router for Reynard Backend

FastAPI router for scraping operations.
"""

import logging
from typing import Any
from uuid import UUID

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException

from app.services.scraping import ScrapingService
from app.services.scraping.models import (
    PipelineConfig,
    ProcessingPipeline,
    ScrapingApiRequest,
    ScrapingApiResponse,
)

logger = logging.getLogger(__name__)

# Create router
router = APIRouter(prefix="/api/scraping", tags=["scraping"])

# Global scraping service instance
_scraping_service: ScrapingService | None = None


def get_scraping_service() -> ScrapingService:
    """Get the scraping service instance."""
    global _scraping_service
    if _scraping_service is None:
        _scraping_service = ScrapingService()
    return _scraping_service


@router.get("/health")
async def health_check(service: ScrapingService = Depends(get_scraping_service)):
    """Get scraping service health status."""
    try:
        health = await service.get_health_status()
        return ScrapingApiResponse(success=True, data=health)
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return ScrapingApiResponse(success=False, error=str(e))


@router.post("/jobs", response_model=ScrapingApiResponse)
async def create_job(
    request: ScrapingApiRequest,
    background_tasks: BackgroundTasks,
    service: ScrapingService = Depends(get_scraping_service),
):
    """Create a new scraping job."""
    try:
        job = await service.create_job(request)
        background_tasks.add_task(service.start_job, job.id)
        return ScrapingApiResponse(success=True, data=job.dict())
    except Exception as e:
        logger.error(f"Failed to create job: {e}")
        return ScrapingApiResponse(success=False, error=str(e))


@router.get("/jobs", response_model=ScrapingApiResponse)
async def get_jobs(service: ScrapingService = Depends(get_scraping_service)):
    """Get all scraping jobs."""
    try:
        jobs = await service.get_all_jobs()
        return ScrapingApiResponse(success=True, data=[job.dict() for job in jobs])
    except Exception as e:
        logger.error(f"Failed to get jobs: {e}")
        return ScrapingApiResponse(success=False, error=str(e))


@router.get("/jobs/{job_id}", response_model=ScrapingApiResponse)
async def get_job(
    job_id: UUID, service: ScrapingService = Depends(get_scraping_service)
):
    """Get a specific scraping job."""
    try:
        job = await service.get_job(job_id)
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
        return ScrapingApiResponse(success=True, data=job.dict())
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get job {job_id}: {e}")
        return ScrapingApiResponse(success=False, error=str(e))


@router.get("/jobs/{job_id}/results", response_model=ScrapingApiResponse)
async def get_job_results(
    job_id: UUID, service: ScrapingService = Depends(get_scraping_service)
):
    """Get results for a scraping job."""
    try:
        results = await service.get_job_results(job_id)
        return ScrapingApiResponse(
            success=True, data=[result.dict() for result in results]
        )
    except Exception as e:
        logger.error(f"Failed to get job results {job_id}: {e}")
        return ScrapingApiResponse(success=False, error=str(e))


@router.post("/jobs/{job_id}/cancel", response_model=ScrapingApiResponse)
async def cancel_job(
    job_id: UUID, service: ScrapingService = Depends(get_scraping_service)
):
    """Cancel a scraping job."""
    try:
        success = await service.cancel_job(job_id)
        if not success:
            raise HTTPException(status_code=404, detail="Job not found")
        return ScrapingApiResponse(success=True, message="Job cancelled")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to cancel job {job_id}: {e}")
        return ScrapingApiResponse(success=False, error=str(e))


@router.get("/statistics", response_model=ScrapingApiResponse)
async def get_statistics(service: ScrapingService = Depends(get_scraping_service)):
    """Get scraping statistics."""
    try:
        stats = await service.get_statistics()
        return ScrapingApiResponse(success=True, data=stats.dict())
    except Exception as e:
        logger.error(f"Failed to get statistics: {e}")
        return ScrapingApiResponse(success=False, error=str(e))


@router.get("/configs", response_model=ScrapingApiResponse)
async def get_configs(service: ScrapingService = Depends(get_scraping_service)):
    """Get scraping configurations."""
    try:
        # TODO: Implement configuration management
        configs = {}
        return ScrapingApiResponse(success=True, data=configs)
    except Exception as e:
        logger.error(f"Failed to get configs: {e}")
        return ScrapingApiResponse(success=False, error=str(e))


@router.put("/configs", response_model=ScrapingApiResponse)
async def update_configs(
    configs: dict[str, Any], service: ScrapingService = Depends(get_scraping_service)
):
    """Update scraping configurations."""
    try:
        # TODO: Implement configuration management
        return ScrapingApiResponse(success=True, message="Configurations updated")
    except Exception as e:
        logger.error(f"Failed to update configs: {e}")
        return ScrapingApiResponse(success=False, error=str(e))


@router.get("/configs/{config_type}/reset", response_model=ScrapingApiResponse)
async def reset_config(
    config_type: str, service: ScrapingService = Depends(get_scraping_service)
):
    """Reset a specific configuration to defaults."""
    try:
        # TODO: Implement configuration reset
        return ScrapingApiResponse(
            success=True, message=f"Configuration {config_type} reset"
        )
    except Exception as e:
        logger.error(f"Failed to reset config {config_type}: {e}")
        return ScrapingApiResponse(success=False, error=str(e))


@router.post("/quality/assess", response_model=ScrapingApiResponse)
async def assess_quality(
    content: str,
    metadata: dict[str, Any] | None = None,
    service: ScrapingService = Depends(get_scraping_service),
):
    """Assess content quality."""
    try:
        # TODO: Implement quality assessment endpoint
        return ScrapingApiResponse(success=True, data={"score": 75.0, "level": "good"})
    except Exception as e:
        logger.error(f"Failed to assess quality: {e}")
        return ScrapingApiResponse(success=False, error=str(e))


@router.get("/pipelines", response_model=ScrapingApiResponse)
async def get_pipelines(service: ScrapingService = Depends(get_scraping_service)):
    """Get processing pipelines."""
    try:
        # TODO: Implement pipeline management
        pipelines = []
        return ScrapingApiResponse(success=True, data=[p.dict() for p in pipelines])
    except Exception as e:
        logger.error(f"Failed to get pipelines: {e}")
        return ScrapingApiResponse(success=False, error=str(e))


@router.post("/pipelines", response_model=ScrapingApiResponse)
async def create_pipeline(
    name: str,
    config: PipelineConfig,
    service: ScrapingService = Depends(get_scraping_service),
):
    """Create a processing pipeline."""
    try:
        # TODO: Implement pipeline creation
        pipeline = ProcessingPipeline(name=name, config=config)
        return ScrapingApiResponse(success=True, data=pipeline.dict())
    except Exception as e:
        logger.error(f"Failed to create pipeline: {e}")
        return ScrapingApiResponse(success=False, error=str(e))


@router.post("/pipelines/{pipeline_id}/start", response_model=ScrapingApiResponse)
async def start_pipeline(
    pipeline_id: UUID, service: ScrapingService = Depends(get_scraping_service)
):
    """Start a processing pipeline."""
    try:
        # TODO: Implement pipeline start
        return ScrapingApiResponse(success=True, message="Pipeline started")
    except Exception as e:
        logger.error(f"Failed to start pipeline {pipeline_id}: {e}")
        return ScrapingApiResponse(success=False, error=str(e))


@router.post("/pipelines/{pipeline_id}/stop", response_model=ScrapingApiResponse)
async def stop_pipeline(
    pipeline_id: UUID, service: ScrapingService = Depends(get_scraping_service)
):
    """Stop a processing pipeline."""
    try:
        # TODO: Implement pipeline stop
        return ScrapingApiResponse(success=True, message="Pipeline stopped")
    except Exception as e:
        logger.error(f"Failed to stop pipeline {pipeline_id}: {e}")
        return ScrapingApiResponse(success=False, error=str(e))


@router.post("/pipelines/{pipeline_id}/pause", response_model=ScrapingApiResponse)
async def pause_pipeline(
    pipeline_id: UUID, service: ScrapingService = Depends(get_scraping_service)
):
    """Pause a processing pipeline."""
    try:
        # TODO: Implement pipeline pause
        return ScrapingApiResponse(success=True, message="Pipeline paused")
    except Exception as e:
        logger.error(f"Failed to pause pipeline {pipeline_id}: {e}")
        return ScrapingApiResponse(success=False, error=str(e))


@router.post("/pipelines/{pipeline_id}/resume", response_model=ScrapingApiResponse)
async def resume_pipeline(
    pipeline_id: UUID, service: ScrapingService = Depends(get_scraping_service)
):
    """Resume a processing pipeline."""
    try:
        # TODO: Implement pipeline resume
        return ScrapingApiResponse(success=True, message="Pipeline resumed")
    except Exception as e:
        logger.error(f"Failed to resume pipeline {pipeline_id}: {e}")
        return ScrapingApiResponse(success=False, error=str(e))


@router.delete("/pipelines/{pipeline_id}", response_model=ScrapingApiResponse)
async def delete_pipeline(
    pipeline_id: UUID, service: ScrapingService = Depends(get_scraping_service)
):
    """Delete a processing pipeline."""
    try:
        # TODO: Implement pipeline deletion
        return ScrapingApiResponse(success=True, message="Pipeline deleted")
    except Exception as e:
        logger.error(f"Failed to delete pipeline {pipeline_id}: {e}")
        return ScrapingApiResponse(success=False, error=str(e))


# Gallery-dl Integration Endpoints


@router.get("/gallery-downloads", response_model=ScrapingApiResponse)
async def get_gallery_downloads(
    service: ScrapingService = Depends(get_scraping_service),
):
    """Get all gallery download jobs."""
    try:
        downloads = await service.get_gallery_downloads()
        return ScrapingApiResponse(success=True, data=[d.dict() for d in downloads])
    except Exception as e:
        logger.error(f"Failed to get gallery downloads: {e}")
        return ScrapingApiResponse(success=False, error=str(e))


@router.get("/gallery-downloads/{job_id}", response_model=ScrapingApiResponse)
async def get_gallery_download(
    job_id: str, service: ScrapingService = Depends(get_scraping_service)
):
    """Get a specific gallery download job."""
    try:
        download = await service.get_gallery_download(job_id)
        if not download:
            return ScrapingApiResponse(success=False, error="Download not found")
        return ScrapingApiResponse(success=True, data=download.dict())
    except Exception as e:
        logger.error(f"Failed to get gallery download {job_id}: {e}")
        return ScrapingApiResponse(success=False, error=str(e))


@router.post("/gallery-downloads", response_model=ScrapingApiResponse)
async def start_gallery_download(
    request: dict, service: ScrapingService = Depends(get_scraping_service)
):
    """Start a new gallery download job."""
    try:
        url = request.get("url")
        options = request.get("options", {})

        if not url:
            return ScrapingApiResponse(success=False, error="URL is required")

        download = await service.start_gallery_download(url, options)
        return ScrapingApiResponse(success=True, data=download.dict())
    except Exception as e:
        logger.error(f"Failed to start gallery download: {e}")
        return ScrapingApiResponse(success=False, error=str(e))


@router.post("/gallery-downloads/validate", response_model=ScrapingApiResponse)
async def validate_gallery_url(
    request: dict, service: ScrapingService = Depends(get_scraping_service)
):
    """Validate a URL for gallery download."""
    try:
        url = request.get("url")
        if not url:
            return ScrapingApiResponse(success=False, error="URL is required")

        validation = await service.validate_gallery_url(url)
        return ScrapingApiResponse(success=True, data=validation)
    except Exception as e:
        logger.error(f"Failed to validate gallery URL: {e}")
        return ScrapingApiResponse(success=False, error=str(e))


@router.get("/gallery-downloads/extractors", response_model=ScrapingApiResponse)
async def get_gallery_extractors(
    service: ScrapingService = Depends(get_scraping_service),
):
    """Get available gallery extractors."""
    try:
        extractors = await service.get_gallery_extractors()
        return ScrapingApiResponse(success=True, data=extractors)
    except Exception as e:
        logger.error(f"Failed to get gallery extractors: {e}")
        return ScrapingApiResponse(success=False, error=str(e))


@router.get("/gallery-downloads/{job_id}/progress", response_model=ScrapingApiResponse)
async def get_gallery_download_progress(
    job_id: str, service: ScrapingService = Depends(get_scraping_service)
):
    """Get download progress for a specific gallery job."""
    try:
        progress = await service.get_gallery_download_progress(job_id)
        if not progress:
            return ScrapingApiResponse(success=False, error="Download not found")
        return ScrapingApiResponse(success=True, data=progress)
    except Exception as e:
        logger.error(f"Failed to get gallery download progress {job_id}: {e}")
        return ScrapingApiResponse(success=False, error=str(e))


@router.delete("/gallery-downloads/{job_id}/cancel", response_model=ScrapingApiResponse)
async def cancel_gallery_download(
    job_id: str, service: ScrapingService = Depends(get_scraping_service)
):
    """Cancel a gallery download job."""
    try:
        success = await service.cancel_gallery_download(job_id)
        if not success:
            return ScrapingApiResponse(success=False, error="Failed to cancel download")
        return ScrapingApiResponse(
            success=True, message="Download cancelled successfully"
        )
    except Exception as e:
        logger.error(f"Failed to cancel gallery download {job_id}: {e}")
        return ScrapingApiResponse(success=False, error=str(e))


@router.delete("/gallery-downloads/{job_id}", response_model=ScrapingApiResponse)
async def delete_gallery_download(
    job_id: str, service: ScrapingService = Depends(get_scraping_service)
):
    """Delete a gallery download job."""
    try:
        success = await service.delete_gallery_download(job_id)
        if not success:
            return ScrapingApiResponse(success=False, error="Failed to delete download")
        return ScrapingApiResponse(
            success=True, message="Download deleted successfully"
        )
    except Exception as e:
        logger.error(f"Failed to delete gallery download {job_id}: {e}")
        return ScrapingApiResponse(success=False, error=str(e))


@router.get("/gallery-downloads/statistics", response_model=ScrapingApiResponse)
async def get_gallery_download_statistics(
    service: ScrapingService = Depends(get_scraping_service),
):
    """Get gallery download statistics."""
    try:
        stats = await service.get_gallery_download_statistics()
        return ScrapingApiResponse(success=True, data=stats)
    except Exception as e:
        logger.error(f"Failed to get gallery download statistics: {e}")
        return ScrapingApiResponse(success=False, error=str(e))


# Enhanced Extraction Endpoints

@router.post("/enhanced/extract", response_model=ScrapingApiResponse)
async def extract_content_enhanced(
    request: dict, service: ScrapingService = Depends(get_scraping_service)
):
    """Extract content using enhanced extractor with multi-tier fallback."""
    try:
        url = request.get("url")
        if not url:
            return ScrapingApiResponse(success=False, error="URL is required")

        result = await service.extract_content_enhanced(url)
        return ScrapingApiResponse(success=True, data=result.dict())
    except Exception as e:
        logger.error(f"Enhanced content extraction failed: {e}")
        return ScrapingApiResponse(success=False, error=str(e))


@router.get("/enhanced/methods", response_model=ScrapingApiResponse)
async def get_enhanced_extraction_methods(
    service: ScrapingService = Depends(get_scraping_service)
):
    """Get available enhanced extraction methods."""
    try:
        methods = await service.get_enhanced_extraction_methods()
        return ScrapingApiResponse(success=True, data=methods)
    except Exception as e:
        logger.error(f"Failed to get extraction methods: {e}")
        return ScrapingApiResponse(success=False, error=str(e))


@router.post("/enhanced/test-methods", response_model=ScrapingApiResponse)
async def test_extraction_methods(
    request: dict, service: ScrapingService = Depends(get_scraping_service)
):
    """Test all available extraction methods on a URL."""
    try:
        url = request.get("url")
        if not url:
            return ScrapingApiResponse(success=False, error="URL is required")

        results = await service.test_extraction_methods(url)
        # Convert results to dict format
        results_dict = {method: result.dict() for method, result in results.items()}
        return ScrapingApiResponse(success=True, data=results_dict)
    except Exception as e:
        logger.error(f"Failed to test extraction methods: {e}")
        return ScrapingApiResponse(success=False, error=str(e))


@router.post("/enhanced/best-method", response_model=ScrapingApiResponse)
async def get_best_extraction_method(
    request: dict, service: ScrapingService = Depends(get_scraping_service)
):
    """Determine the best extraction method for a URL."""
    try:
        url = request.get("url")
        if not url:
            return ScrapingApiResponse(success=False, error="URL is required")

        best_method = await service.get_best_extraction_method(url)
        return ScrapingApiResponse(success=True, data={"best_method": best_method})
    except Exception as e:
        logger.error(f"Failed to determine best extraction method: {e}")
        return ScrapingApiResponse(success=False, error=str(e))


@router.get("/enhanced/pipeline-stats", response_model=ScrapingApiResponse)
async def get_enhanced_pipeline_stats(
    service: ScrapingService = Depends(get_scraping_service)
):
    """Get enhanced pipeline processing statistics."""
    try:
        stats = service.get_enhanced_pipeline_stats()
        return ScrapingApiResponse(success=True, data=stats)
    except Exception as e:
        logger.error(f"Failed to get pipeline stats: {e}")
        return ScrapingApiResponse(success=False, error=str(e))
