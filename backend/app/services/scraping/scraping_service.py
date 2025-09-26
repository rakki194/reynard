"""Scraping Service for Reynard Backend

Main service that orchestrates scraping operations, content extraction,
and quality assessment. Ported from Pawprint with enhanced integration.
"""

import asyncio
import logging
import time
from datetime import datetime
from typing import Any
from uuid import UUID

from .extractors import ContentExtractor, GeneralScraper
from .gallery_integration import GalleryIntegration
from .models import (
    ScrapingApiRequest,
    ScrapingConfig,
    ScrapingEvent,
    ScrapingEventType,
    ScrapingJob,
    ScrapingResult,
    ScrapingStatistics,
    ScrapingStatus,
    ScrapingType,
)
from .pipeline import ProcessingPipelineManager
from .pipeline.enhanced_pipeline import EnhancedContentPipeline
from .quality import ContentQualityScorer
from .scraping_manager import ScrapingManager
from .scraping_router import ScrapingRouter

logger = logging.getLogger(__name__)


class ScrapingService:
    """Main scraping service that orchestrates all scraping operations.

    This service provides a unified interface for content scraping,
    integrating with gallery-dl and providing specialized scrapers
    for different content types and platforms.
    """

    def __init__(self, configuration: dict[str, Any] | None = None):
        """Initialize the scraping service.

        Args:
            configuration: Service configuration dictionary

        """
        self.configuration = configuration or {}
        self.manager = ScrapingManager()
        self.router = ScrapingRouter()
        self.quality_scorer = ContentQualityScorer()
        self.pipeline_manager = ProcessingPipelineManager()
        self.enhanced_pipeline = EnhancedContentPipeline()
        self.enhanced_extractor = ContentExtractor()
        self.gallery_integration: GalleryIntegration | None = None
        self.initialized = False
        self.enabled = self.configuration.get("enabled", True)

        # Service state
        self.connection_state = "disconnected"
        self.connection_attempts = 0
        self.last_ok_timestamp: datetime | None = None

        # Performance tracking
        self.start_time = time.time()
        self.total_jobs = 0
        self.successful_jobs = 0
        self.failed_jobs = 0

        # Active jobs tracking
        self.active_jobs: dict[UUID, ScrapingJob] = {}
        self.job_results: dict[UUID, list[ScrapingResult]] = {}

        # Event handlers
        self.event_handlers: list[callable] = []

    async def initialize(self) -> bool:
        """Initialize the scraping service."""
        if self.initialized:
            return True

        try:
            if not self.enabled:
                logger.info("Scraping service disabled in configuration")
                return True

            # Initialize manager
            await self.manager.initialize()

            # Initialize router
            await self.router.initialize()

            # Initialize quality scorer
            await self.quality_scorer.initialize()

            # Initialize pipeline manager
            await self.pipeline_manager.initialize()

            # Initialize enhanced components
            # Note: Enhanced pipeline and extractor don't need async initialization

            # Initialize gallery integration if gallery service is available
            try:
                from app.services.gallery.gallery_service import GalleryService

                gallery_service = GalleryService()
                self.gallery_integration = GalleryIntegration(gallery_service)
                logger.info("Gallery integration initialized")
            except ImportError:
                logger.warning(
                    "Gallery service not available, gallery integration disabled",
                )

            # Register default scrapers
            await self._register_default_scrapers()

            # Set up health monitoring
            await self._setup_health_monitoring()

            self.initialized = True
            self.connection_state = "connected"
            self.last_ok_timestamp = datetime.now()

            logger.info("Scraping service initialized successfully")
            return True

        except Exception as e:
            logger.error(f"Failed to initialize scraping service: {e}")
            self.connection_state = "error"
            return False

    async def shutdown(self) -> bool:
        """Shutdown the scraping service."""
        try:
            self.enabled = False
            self.connection_state = "disconnected"
            self.initialized = False

            # Cancel all active jobs
            for job_id in list(self.active_jobs.keys()):
                await self.cancel_job(job_id)

            # Shutdown components
            await self.manager.shutdown()
            await self.router.shutdown()
            await self.quality_scorer.shutdown()
            await self.pipeline_manager.shutdown()

            logger.info("Scraping service shutdown successfully")
            return True

        except Exception as e:
            logger.error(f"Error during scraping service shutdown: {e}")
            return False

    async def create_job(self, request: ScrapingApiRequest) -> ScrapingJob:
        """Create a new scraping job."""
        if not self.enabled or not self.initialized:
            raise RuntimeError("Scraping service is not available")

        try:
            self.total_jobs += 1

            # Determine scraping type
            scraping_type = request.type or self._detect_scraping_type(request.url)

            # Create job
            job = ScrapingJob(
                url=request.url,
                type=scraping_type,
                status=ScrapingStatus.PENDING,
                config=await self._get_scraper_config(scraping_type, request.config),
            )

            # Store job
            self.active_jobs[job.id] = job
            self.job_results[job.id] = []

            # Emit event
            await self._emit_event(
                ScrapingEventType.JOB_CREATED,
                job.id,
                {
                    "url": job.url,
                    "type": job.type,
                    "config": job.config.dict() if job.config else None,
                },
            )

            logger.info(f"Created scraping job {job.id} for {job.url}")
            return job

        except Exception as e:
            self.failed_jobs += 1
            logger.error(f"Error creating scraping job: {e}")
            raise

    async def start_job(self, job_id: UUID) -> bool:
        """Start a scraping job."""
        try:
            if job_id not in self.active_jobs:
                raise ValueError(f"Job {job_id} not found")

            job = self.active_jobs[job_id]
            if job.status != ScrapingStatus.PENDING:
                raise ValueError(f"Job {job_id} is not in pending status")

            # Update job status
            job.status = ScrapingStatus.RUNNING
            job.updated_at = datetime.utcnow()

            # Emit event
            await self._emit_event(
                ScrapingEventType.JOB_STARTED,
                job_id,
                {"url": job.url, "type": job.type},
            )

            # Start scraping in background
            asyncio.create_task(self._execute_job(job))

            logger.info(f"Started scraping job {job_id}")
            return True

        except Exception as e:
            logger.error(f"Error starting job {job_id}: {e}")
            return False

    async def cancel_job(self, job_id: UUID) -> bool:
        """Cancel a scraping job."""
        try:
            if job_id not in self.active_jobs:
                return False

            job = self.active_jobs[job_id]
            job.status = ScrapingStatus.CANCELLED
            job.updated_at = datetime.utcnow()

            # Emit event
            await self._emit_event(
                ScrapingEventType.JOB_CANCELLED,
                job_id,
                {"reason": "User requested cancellation"},
            )

            # Remove from active jobs
            del self.active_jobs[job_id]
            if job_id in self.job_results:
                del self.job_results[job_id]

            logger.info(f"Cancelled scraping job {job_id}")
            return True

        except Exception as e:
            logger.error(f"Error cancelling job {job_id}: {e}")
            return False

    async def get_job(self, job_id: UUID) -> ScrapingJob | None:
        """Get a scraping job by ID."""
        return self.active_jobs.get(job_id)

    async def get_job_results(self, job_id: UUID) -> list[ScrapingResult]:
        """Get results for a scraping job."""
        return self.job_results.get(job_id, [])

    async def get_all_jobs(self) -> list[ScrapingJob]:
        """Get all scraping jobs."""
        return list(self.active_jobs.values())

    async def get_statistics(self) -> ScrapingStatistics:
        """Get scraping statistics."""
        try:
            total_jobs = self.total_jobs
            completed_jobs = self.successful_jobs
            failed_jobs = self.failed_jobs
            active_jobs = len(self.active_jobs)

            # Calculate total results
            total_results = sum(len(results) for results in self.job_results.values())

            # Calculate average quality
            all_results = []
            for results in self.job_results.values():
                all_results.extend(results)

            average_quality = 0
            if all_results:
                quality_scores = [result.quality.score for result in all_results]
                average_quality = sum(quality_scores) / len(quality_scores)

            # Calculate category stats
            category_counts = {}
            for results in self.job_results.values():
                for result in results:
                    if result.category:
                        cat_type = result.category.type
                        if cat_type not in category_counts:
                            category_counts[cat_type] = []
                        category_counts[cat_type].append(result.quality.score)

            top_categories = []
            for cat_type, scores in category_counts.items():
                avg_quality = sum(scores) / len(scores) if scores else 0
                percentage = (
                    (len(scores) / total_results * 100) if total_results > 0 else 0
                )
                top_categories.append(
                    {
                        "category": cat_type,
                        "count": len(scores),
                        "average_quality": avg_quality,
                        "percentage": percentage,
                    },
                )

            # Sort by count
            top_categories.sort(key=lambda x: x["count"], reverse=True)

            # Calculate performance metrics
            uptime_hours = (time.time() - self.start_time) / 3600
            throughput = total_results / uptime_hours if uptime_hours > 0 else 0
            success_rate = (completed_jobs / total_jobs * 100) if total_jobs > 0 else 0

            return ScrapingStatistics(
                total_jobs=total_jobs,
                completed_jobs=completed_jobs,
                failed_jobs=failed_jobs,
                active_jobs=active_jobs,
                total_results=total_results,
                average_quality=average_quality,
                top_categories=top_categories,
                performance_metrics={
                    "average_processing_time": 0,  # TODO: Calculate from job history
                    "average_quality_score": average_quality,
                    "success_rate": success_rate,
                    "throughput": throughput,
                },
            )

        except Exception as e:
            logger.error(f"Error getting statistics: {e}")
            return ScrapingStatistics(
                total_jobs=0,
                completed_jobs=0,
                failed_jobs=0,
                active_jobs=0,
                total_results=0,
                average_quality=0,
                top_categories=[],
                performance_metrics={
                    "average_processing_time": 0,
                    "average_quality_score": 0,
                    "success_rate": 0,
                    "throughput": 0,
                },
            )

    async def get_health_status(self) -> dict[str, Any]:
        """Get the health status of the scraping service."""
        try:
            # Determine overall status
            if not self.enabled:
                status = "disabled"
            elif not self.initialized:
                status = "unhealthy"
            elif self.connection_state == "connected":
                status = "healthy"
            else:
                status = "unhealthy"

            return {
                "status": status,
                "enabled": self.enabled,
                "initialized": self.initialized,
                "connection_state": self.connection_state,
                "connection_attempts": self.connection_attempts,
                "last_ok_timestamp": self.last_ok_timestamp,
                "active_jobs": len(self.active_jobs),
                "total_jobs": self.total_jobs,
                "successful_jobs": self.successful_jobs,
                "failed_jobs": self.failed_jobs,
                "uptime_seconds": time.time() - self.start_time,
            }

        except Exception as e:
            logger.error(f"Error getting health status: {e}")
            return {
                "status": "unhealthy",
                "enabled": False,
                "initialized": False,
                "connection_state": "error",
                "connection_attempts": self.connection_attempts,
                "last_ok_timestamp": None,
                "active_jobs": 0,
                "total_jobs": 0,
                "successful_jobs": 0,
                "failed_jobs": 0,
                "uptime_seconds": 0,
            }

    async def _execute_job(self, job: ScrapingJob) -> None:
        """Execute a scraping job."""
        try:
            # Get appropriate scraper
            scraper = await self.router.get_scraper(job.type)
            if not scraper:
                raise ValueError(f"No scraper available for type {job.type}")

            # Execute scraping
            results = await scraper.scrape_url(job.url, job.config)

            # Process results
            processed_results = []
            for result_data in results:
                # Assess quality
                quality = await self.quality_scorer.assess_quality(
                    result_data.get("content", ""),
                    result_data.get("metadata", {}),
                )

                # Create result
                result = ScrapingResult(
                    job_id=job.id,
                    url=result_data.get("url", job.url),
                    title=result_data.get("title"),
                    content=result_data.get("content", ""),
                    metadata=result_data.get("metadata", {}),
                    quality=quality,
                )

                processed_results.append(result)

                # Emit event
                await self._emit_event(
                    ScrapingEventType.RESULT_EXTRACTED,
                    job.id,
                    {
                        "result_id": str(result.id),
                        "url": result.url,
                        "quality_score": quality.score,
                    },
                )

            # Store results
            self.job_results[job.id] = processed_results

            # Update job status
            job.status = ScrapingStatus.COMPLETED
            job.progress = 100
            job.completed_at = datetime.utcnow()
            job.updated_at = datetime.utcnow()
            job.results = processed_results

            # Remove from active jobs
            if job.id in self.active_jobs:
                del self.active_jobs[job.id]

            self.successful_jobs += 1

            # Emit event
            await self._emit_event(
                ScrapingEventType.JOB_COMPLETED,
                job.id,
                {
                    "results_count": len(processed_results),
                    "average_quality": (
                        sum(r.quality.score for r in processed_results)
                        / len(processed_results)
                        if processed_results
                        else 0
                    ),
                },
            )

            logger.info(
                f"Completed scraping job {job.id} with {len(processed_results)} results",
            )

        except Exception as e:
            # Update job status
            job.status = ScrapingStatus.FAILED
            job.error = str(e)
            job.updated_at = datetime.utcnow()

            # Remove from active jobs
            if job.id in self.active_jobs:
                del self.active_jobs[job.id]

            self.failed_jobs += 1

            # Emit event
            await self._emit_event(
                ScrapingEventType.JOB_FAILED,
                job.id,
                {"error": str(e)},
            )

            logger.error(f"Failed scraping job {job.id}: {e}")

    async def _detect_scraping_type(self, url: str) -> ScrapingType:
        """Detect the appropriate scraping type for a URL."""
        # Simple URL pattern matching
        url_lower = url.lower()

        if "hackernews" in url_lower or "news.ycombinator.com" in url_lower:
            return ScrapingType.HACKER_NEWS
        if "github.com" in url_lower:
            return ScrapingType.GITHUB
        if "stackoverflow.com" in url_lower or "stackexchange.com" in url_lower:
            return ScrapingType.STACKOVERFLOW
        if "twitter.com" in url_lower or "x.com" in url_lower:
            return ScrapingType.TWITTER
        if "wikipedia.org" in url_lower:
            return ScrapingType.WIKIPEDIA
        if "wikifur.com" in url_lower:
            return ScrapingType.WIKIFUR
        if "e621.net" in url_lower:
            return ScrapingType.E621_WIKI
        if "arstechnica.com" in url_lower:
            return ScrapingType.ARS_TECHNICA
        if "techcrunch.com" in url_lower:
            return ScrapingType.TECHCRUNCH
        if "wired.com" in url_lower:
            return ScrapingType.WIRED
        return ScrapingType.GENERAL

    async def _get_scraper_config(
        self,
        scraping_type: ScrapingType,
        config_override: dict[str, Any] | None = None,
    ) -> ScrapingConfig | None:
        """Get scraper configuration for a type."""
        # TODO: Load from configuration store
        default_config = ScrapingConfig(
            name=f"{scraping_type.value}_scraper",
            type=scraping_type,
            enabled=True,
        )

        if config_override:
            # Apply overrides
            for key, value in config_override.items():
                if hasattr(default_config, key):
                    setattr(default_config, key, value)

        return default_config

    async def _register_default_scrapers(self) -> None:
        """Register default scrapers."""
        try:
            # Register scrapers with the router
            await self.router.register_scraper(ScrapingType.GENERAL, GeneralScraper())

            # TODO: Register other scrapers as they are implemented
            # await self.router.register_scraper(ScrapingType.HACKER_NEWS, HackerNewsScraper())
            # await self.router.register_scraper(ScrapingType.GITHUB, GitHubScraper())
            # etc.

            logger.info("Registered default scrapers")

        except Exception as e:
            logger.error(f"Error registering default scrapers: {e}")

    async def _setup_health_monitoring(self) -> None:
        """Set up health monitoring."""
        try:
            # TODO: Set up periodic health checks
            pass
        except Exception as e:
            logger.error(f"Error setting up health monitoring: {e}")

    async def _emit_event(
        self,
        event_type: ScrapingEventType,
        job_id: UUID,
        data: dict[str, Any],
    ) -> None:
        """Emit a scraping event."""
        try:
            event = ScrapingEvent(type=event_type, job_id=job_id, data=data)

            # Call event handlers
            for handler in self.event_handlers:
                try:
                    await handler(event)
                except Exception as e:
                    logger.error(f"Error in event handler: {e}")

        except Exception as e:
            logger.error(f"Error emitting event: {e}")

    def add_event_handler(self, handler: callable) -> None:
        """Add an event handler."""
        self.event_handlers.append(handler)

    def remove_event_handler(self, handler: callable) -> None:
        """Remove an event handler."""
        if handler in self.event_handlers:
            self.event_handlers.remove(handler)

    def is_available(self) -> bool:
        """Check if the service is available."""
        return self.enabled and self.initialized

    def get_info(self) -> dict[str, Any]:
        """Get service information."""
        return {
            "name": "Scraping Service",
            "version": "1.0.0",
            "enabled": self.enabled,
            "initialized": self.initialized,
            "connection_state": self.connection_state,
            "connection_attempts": self.connection_attempts,
            "uptime_seconds": time.time() - self.start_time,
            "total_jobs": self.total_jobs,
            "successful_jobs": self.successful_jobs,
            "failed_jobs": self.failed_jobs,
            "active_jobs": len(self.active_jobs),
            "gallery_integration": self.gallery_integration is not None,
        }

    # Gallery Integration Methods

    async def start_gallery_download(
        self,
        url: str,
        config: dict[str, Any] | None = None,
    ):
        """Start a gallery download job"""
        if not self.gallery_integration:
            raise RuntimeError("Gallery integration not available")

        return await self.gallery_integration.start_gallery_download(url, config)

    async def cancel_gallery_download(self, job_id: str) -> bool:
        """Cancel a gallery download job"""
        if not self.gallery_integration:
            raise RuntimeError("Gallery integration not available")

        return await self.gallery_integration.cancel_download(job_id)

    async def delete_gallery_download(self, job_id: str) -> bool:
        """Delete a gallery download job"""
        if not self.gallery_integration:
            raise RuntimeError("Gallery integration not available")

        return await self.gallery_integration.delete_download(job_id)

    async def get_gallery_download(self, job_id: str):
        """Get a specific gallery download job"""
        if not self.gallery_integration:
            raise RuntimeError("Gallery integration not available")

        return await self.gallery_integration.get_download(job_id)

    async def get_gallery_downloads(self):
        """Get all gallery download jobs"""
        if not self.gallery_integration:
            raise RuntimeError("Gallery integration not available")

        return await self.gallery_integration.get_downloads()

    async def get_gallery_download_statistics(self) -> dict[str, Any]:
        """Get gallery download statistics"""
        if not self.gallery_integration:
            raise RuntimeError("Gallery integration not available")

        return await self.gallery_integration.get_download_statistics()

    async def validate_gallery_url(self, url: str) -> dict[str, Any]:
        """Validate a URL for gallery download"""
        if not self.gallery_integration:
            raise RuntimeError("Gallery integration not available")

        return await self.gallery_integration.validate_url(url)

    async def get_gallery_extractors(self):
        """Get available gallery extractors"""
        if not self.gallery_integration:
            raise RuntimeError("Gallery integration not available")

        return await self.gallery_integration.get_extractors()

    async def get_gallery_download_progress(self, job_id: str) -> dict[str, Any] | None:
        """Get download progress for a specific gallery job"""
        if not self.gallery_integration:
            raise RuntimeError("Gallery integration not available")

            return await self.gallery_integration.get_download_progress(job_id)

    # Enhanced Extraction Methods

    async def extract_content_enhanced(self, url: str) -> ScrapingResult:
        """Extract content using the enhanced extractor with multi-tier fallback.

        Args:
            url: URL to extract content from

        Returns:
            ScrapingResult with extracted and processed content

        """
        try:
            # Extract content using enhanced extractor
            result = await self.enhanced_extractor.scrape_content(url)

            # Process through enhanced pipeline
            result = await self.enhanced_pipeline.process_content(result)

            return result

        except Exception as e:
            logger.error(f"Enhanced content extraction failed for {url}: {e}")
            # Return a basic result on failure
            return ScrapingResult(
                url=url,
                title="Content",
                content="",
                metadata={
                    "source": "enhanced",
                    "extraction_method": "failed",
                    "error": str(e),
                },
                quality={"score": 0.0, "factors": {}},
            )

    async def get_enhanced_extraction_methods(self) -> list[dict[str, Any]]:
        """Get available enhanced extraction methods."""
        methods = []
        for method_name in self.enhanced_extractor.get_available_methods():
            method_info = self.enhanced_extractor.get_method_info(method_name)
            methods.append(method_info)
        return methods

    async def test_extraction_methods(self, url: str) -> dict[str, ScrapingResult]:
        """Test all available extraction methods on a URL.

        Args:
            url: URL to test

        Returns:
            Dictionary mapping method names to results

        """
        return await self.enhanced_extractor.test_extraction_methods(url)

    async def get_best_extraction_method(self, url: str) -> str:
        """Determine the best extraction method for a URL.

        Args:
            url: URL to analyze

        Returns:
            Name of the best extraction method

        """
        return await self.enhanced_extractor.get_best_method(url)

    def get_enhanced_pipeline_stats(self) -> dict[str, Any]:
        """Get enhanced pipeline processing statistics."""
        return self.enhanced_pipeline.get_processing_stats()
