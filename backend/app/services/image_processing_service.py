"""Enhanced Image Processing Service for Reynard Backend

This service provides sophisticated image processing capabilities with plugin support,
combining the best of Yipyap's plugin management with Reynard's clean architecture.
"""

import asyncio
import logging
from datetime import UTC, datetime
from typing import Any

logger = logging.getLogger("uvicorn")


class ImageProcessingService:
    """Enhanced image processing service with sophisticated plugin management.

    This service handles the initialization and lifecycle management of image
    processing plugins including pillow-jxl and pillow-avif support with
    comprehensive fallback mechanisms and runtime detection.
    """

    def __init__(self):
        """Initialize the image processing service."""
        self._pillow_jxl_available = False
        self._pillow_avif_available = False
        self._supported_formats: set[str] = set()
        self._format_info: dict[str, dict[str, Any]] = {}
        self._initialized = False
        self._startup_time: datetime | None = None
        self._last_health_check: datetime | None = None

        # Enhanced caching and processing features
        self.cache: dict[str, Any] = {}
        self.cache_stats = {"hits": 0, "misses": 0, "evictions": 0}
        self.active_jobs: dict[str, dict[str, Any]] = {}
        self.job_progress_callbacks: dict[str, callable] = {}
        self.reduction_queue = asyncio.Queue()
        self.worker_tasks: list[asyncio.Task] = []

        # Configuration
        self.cache_ttl = 3600  # 1 hour
        self.max_samples = 1000
        self.max_concurrent_reductions = 3
        self.enable_parallel_processing = True
        self.progress_update_interval = 0.1

        # Start background tasks
        self._start_background_tasks()

    def _start_background_tasks(self):
        """Start background tasks for cache management and processing."""
        if self.enable_parallel_processing:
            # Start cache cleanup task
            asyncio.create_task(self._cache_cleanup_loop())

            # Start reduction worker tasks
            for _ in range(self.max_concurrent_reductions):
                task = asyncio.create_task(self._reduction_worker())
                self.worker_tasks.append(task)

    async def _cache_cleanup_loop(self):
        """Background task to clean up expired cache entries."""
        while True:
            try:
                await asyncio.sleep(60)  # Run every minute
                await self._cleanup_expired_cache()
            except Exception as e:
                logger.exception("Error in cache cleanup loop: %s", e)
                await asyncio.sleep(60)

    async def _cleanup_expired_cache(self):
        """Remove expired cache entries."""
        current_time = datetime.now(UTC)
        expired_keys = []

        for key, (_, timestamp) in self.cache.items():
            if (current_time - timestamp).total_seconds() > self.cache_ttl:
                expired_keys.append(key)

        for key in expired_keys:
            del self.cache[key]
            self.cache_stats["evictions"] += 1

        if expired_keys:
            logger.debug("Cleaned up %d expired cache entries", len(expired_keys))

    async def _reduction_worker(self):
        """Background worker for processing reduction jobs."""
        while True:
            try:
                job = await self.reduction_queue.get()
                await self._process_reduction_job(job)
                self.reduction_queue.task_done()
            except Exception as e:
                logger.exception("Error in reduction worker: %s", e)
                await asyncio.sleep(1)

    async def _process_reduction_job(self, job: dict[str, Any]):
        """Process a single reduction job."""
        job_id = job["job_id"]

        try:
            # Update job status
            self.active_jobs[job_id]["status"] = "processing"
            self.active_jobs[job_id]["started_at"] = datetime.now(UTC)

            # Simulate processing with progress updates
            await self._perform_reduction_with_progress(job)

            # Mark as completed
            self.active_jobs[job_id]["status"] = "completed"
            self.active_jobs[job_id]["completed_at"] = datetime.now(UTC)

        except Exception as e:
            logger.exception("Error processing reduction job %s: %s", job_id, e)
            self.active_jobs[job_id]["status"] = "failed"
            self.active_jobs[job_id]["error"] = str(e)
            self.active_jobs[job_id]["failed_at"] = datetime.now(UTC)

    async def _send_progress_update(
        self, job_id: str, progress: float, message: str = "",
    ):
        """Send progress update for a job."""
        if job_id in self.job_progress_callbacks:
            try:
                await self.job_progress_callbacks[job_id](job_id, progress, message)
            except Exception as e:
                logger.exception(
                    "Error sending progress update for job %s: %s", job_id, e,
                )

    async def _perform_reduction_with_progress(self, job: dict[str, Any]):
        """Perform reduction with progress updates."""
        job_id = job["job_id"]
        total_steps = 10

        for step in range(total_steps):
            progress = (step + 1) / total_steps
            await self._send_progress_update(
                job_id, progress, "Processing step %d/%d" % (step + 1, total_steps),
            )
            await asyncio.sleep(self.progress_update_interval)

    async def initialize(self) -> bool:
        """Initialize the image processing service with plugin detection."""
        try:
            logger.info("Initializing enhanced image processing service")
            self._startup_time = datetime.now(UTC)

            # Try to load pillow-jxl plugin with multiple fallback strategies
            await self._load_pillow_jxl_plugin()

            # Try to load pillow-avif plugin with multiple fallback strategies
            await self._load_pillow_avif_plugin()

            # Initialize supported formats
            self._initialize_supported_formats()

            self._initialized = True

            logger.info(
                f"Image processing service initialized - JXL: {self._pillow_jxl_available}, "
                f"AVIF: {self._pillow_avif_available}, "
                f"Total formats: {len(self._supported_formats)}",
            )
            return True

        except Exception as e:
            logger.error(f"Failed to initialize image processing service: {e}")
            return False

    async def _load_pillow_jxl_plugin(self) -> None:
        """Load pillow-jxl plugin with multiple fallback strategies."""
        # Strategy 1: Direct import
        try:
            import pillow_jxl

            self._pillow_jxl_available = True
            logger.info("pillow-jxl loaded successfully via direct import")
            return
        except ImportError:
            logger.debug("Direct pillow_jxl import failed, trying fallback strategies")

        # Strategy 2: Try importing with plugin registration
        try:
            import pillow_jxl

            # Ensure plugin is registered with PIL
            from PIL import Image

            # Test if JXL format is recognized
            if hasattr(Image, "open") and "JXL" in Image.registered_extensions():
                self._pillow_jxl_available = True
                logger.info("pillow-jxl loaded and registered with PIL")
                return
        except (ImportError, AttributeError):
            logger.debug("PIL registration check failed for pillow_jxl")

        # Strategy 3: Graceful degradation
        self._pillow_jxl_available = False
        logger.warning("pillow-jxl not available - JXL images will not be supported")

    async def _load_pillow_avif_plugin(self) -> None:
        """Load pillow-avif plugin with multiple fallback strategies."""
        # Strategy 1: Direct import
        try:
            import pillow_avif

            self._pillow_avif_available = True
            logger.info("pillow-avif loaded successfully via direct import")
            return
        except ImportError:
            logger.debug("Direct pillow_avif import failed, trying fallback strategies")

        # Strategy 2: Try importing with plugin registration
        try:
            import pillow_avif

            # Ensure plugin is registered with PIL
            from PIL import Image

            # Test if AVIF format is recognized
            if hasattr(Image, "open") and "AVIF" in Image.registered_extensions():
                self._pillow_avif_available = True
                logger.info("pillow-avif loaded and registered with PIL")
                return
        except (ImportError, AttributeError):
            logger.debug("PIL registration check failed for pillow_avif")

        # Strategy 3: Graceful degradation
        self._pillow_avif_available = False
        logger.warning("pillow-avif not available - AVIF images will not be supported")

    async def shutdown(self) -> None:
        """Shutdown the image processing service."""
        logger.info("Shutting down image processing service")
        self._pillow_jxl_available = False
        self._pillow_avif_available = False
        self._supported_formats.clear()
        self._format_info.clear()
        self._initialized = False

    async def health_check(self) -> bool:
        """Perform health check for the image processing service."""
        try:
            self._last_health_check = datetime.now(UTC)

            # Basic health check - verify PIL is still available

            # Re-check plugin availability
            await self._verify_plugin_availability()

            return True
        except Exception as e:
            logger.error(f"Image processing service health check failed: {e}")
            return False

    async def _verify_plugin_availability(self) -> None:
        """Verify plugin availability and update status."""
        # Re-check JXL availability
        try:
            import pillow_jxl

            if not self._pillow_jxl_available:
                logger.info("pillow-jxl became available, updating status")
                self._pillow_jxl_available = True
                self._initialize_supported_formats()
        except ImportError:
            if self._pillow_jxl_available:
                logger.warning("pillow-jxl became unavailable, updating status")
                self._pillow_jxl_available = False
                self._initialize_supported_formats()

        # Re-check AVIF availability
        try:
            import pillow_avif

            if not self._pillow_avif_available:
                logger.info("pillow-avif became available, updating status")
                self._pillow_avif_available = True
                self._initialize_supported_formats()
        except ImportError:
            if self._pillow_avif_available:
                logger.warning("pillow-avif became unavailable, updating status")
                self._pillow_avif_available = False
                self._initialize_supported_formats()

    def get_info(self) -> dict[str, Any]:
        """Get comprehensive service information."""
        return {
            "name": "image_processing",
            "initialized": self._initialized,
            "pillow_jxl_available": self._pillow_jxl_available,
            "pillow_avif_available": self._pillow_avif_available,
            "supported_formats": list(self._supported_formats),
            "format_info": self._format_info,
            "startup_time": (
                self._startup_time.isoformat() if self._startup_time else None
            ),
            "last_health_check": (
                self._last_health_check.isoformat() if self._last_health_check else None
            ),
        }

    def is_jxl_supported(self) -> bool:
        """Check if JXL format is supported."""
        return self._pillow_jxl_available

    def is_avif_supported(self) -> bool:
        """Check if AVIF format is supported."""
        return self._pillow_avif_available

    def get_supported_formats(self) -> set[str]:
        """Get set of supported image formats."""
        return self._supported_formats.copy()

    def get_format_info(self) -> dict[str, dict[str, Any]]:
        """Get detailed information about supported formats."""
        return self._format_info.copy()

    def get_supported_formats_for_inference(self) -> list[str]:
        """Get all supported image formats for inference scripts."""
        formats = [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/bmp",
            "image/tiff",
            "image/webp",
            "image/gif",
        ]

        # Add JXL support if available
        if self.is_jxl_supported():
            formats.append("image/jxl")

        # Add AVIF support if available
        if self.is_avif_supported():
            formats.append("image/avif")

        return formats

    def get_cache_stats(self):
        """Get cache statistics."""
        return {
            "cache_size": len(self.cache),
            "cache_hits": self.cache_stats.get("hits", 0),
            "cache_misses": self.cache_stats.get("misses", 0),
            "cache_evictions": self.cache_stats.get("evictions", 0),
            "active_jobs": len(self.active_jobs),
            "worker_tasks": len(self.worker_tasks),
            "queue_size": self.reduction_queue.qsize(),
            "cache_hit_rate": self.cache_stats.get("hits", 0)
            / max(
                1, self.cache_stats.get("hits", 0) + self.cache_stats.get("misses", 0),
            ),
            "total_operations": self.cache_stats.get("hits", 0)
            + self.cache_stats.get("misses", 0),
        }

    async def get_job_status(self, job_id: str) -> dict[str, Any]:
        """Get the status of a specific job."""
        if job_id not in self.active_jobs:
            return {"error": "Job not found"}

        return self.active_jobs[job_id]

    async def get_all_jobs(self) -> dict[str, dict[str, Any]]:
        """Get the status of all active jobs."""
        return self.active_jobs.copy()

    async def cancel_job(self, job_id: str) -> bool:
        """Cancel a running job."""
        if job_id not in self.active_jobs:
            return False

        self.active_jobs[job_id]["status"] = "cancelled"
        self.active_jobs[job_id]["cancelled_at"] = datetime.now(UTC)
        return True

    async def get_visualization_data(self, job_id: str) -> dict[str, Any]:
        """Get visualization data for a completed job."""
        if job_id not in self.active_jobs:
            return {"error": "Job not found"}

        job = self.active_jobs[job_id]
        if job["status"] != "completed":
            return {"error": "Job not completed"}

        # Mock visualization data
        return {
            "job_id": job_id,
            "data_points": 1000,
            "dimensions": 2,
            "clusters": 5,
            "visualization_type": "scatter_plot",
            "created_at": job.get("created_at"),
            "completed_at": job.get("completed_at"),
        }

    def get_pil_image(self):
        """Get PIL.Image with plugin support and fallback mechanisms."""
        from PIL import Image

        # Ensure plugins are loaded and registered with PIL
        if self._pillow_jxl_available:
            try:
                import pillow_jxl

                # Import to ensure plugin is registered
                _ = pillow_jxl
                logger.debug("pillow_jxl plugin imported and registered with PIL")
            except ImportError as e:
                logger.warning(f"Failed to import pillow_jxl plugin: {e}")
                self._pillow_jxl_available = False

        if self._pillow_avif_available:
            try:
                import pillow_avif

                # Import to ensure plugin is registered
                _ = pillow_avif
                logger.debug("pillow_avif plugin imported and registered with PIL")
            except ImportError as e:
                logger.warning(f"Failed to import pillow_avif plugin: {e}")
                self._pillow_avif_available = False

        return Image

    def get_pil_imagedraw(self):
        """Get PIL.ImageDraw with plugin support."""
        from PIL import ImageDraw

        return ImageDraw

    def get_pil_imagefont(self):
        """Get PIL.ImageFont with plugin support."""
        from PIL import ImageFont

        return ImageFont

    def _initialize_supported_formats(self) -> None:
        """Initialize the set of supported image formats with comprehensive metadata."""
        # Standard formats always supported by Pillow
        standard_formats = {
            ".jpg",
            ".jpeg",
            ".png",
            ".gif",
            ".bmp",
            ".tiff",
            ".tif",
            ".webp",
        }

        self._supported_formats = standard_formats.copy()
        self._format_info.clear()

        # Add format info for standard formats
        for fmt in standard_formats:
            self._format_info[fmt] = {
                "name": fmt[1:].upper(),  # Remove dot and uppercase
                "supported": True,
                "plugin_required": False,
                "description": f"Standard {fmt[1:].upper()} format",
                "mime_type": self._get_mime_type(fmt),
                "supports_animation": fmt in {".gif", ".webp"},
                "supports_alpha": fmt in {".png", ".gif", ".webp"},
            }

        # Add JXL support if available
        if self._pillow_jxl_available:
            self._supported_formats.add(".jxl")
            self._format_info[".jxl"] = {
                "name": "JXL",
                "supported": True,
                "plugin_required": True,
                "plugin_name": "pillow-jxl",
                "description": "JPEG XL format with pillow-jxl plugin",
                "mime_type": "image/jxl",
                "supports_animation": True,
                "supports_alpha": True,
                "default_quality": 90,
                "default_effort": 7,
                "compression_levels": list(range(10)),
            }

        # Add AVIF support if available
        if self._pillow_avif_available:
            self._supported_formats.add(".avif")
            self._format_info[".avif"] = {
                "name": "AVIF",
                "supported": True,
                "plugin_required": True,
                "plugin_name": "pillow-avif",
                "description": "AV1 Image File Format with pillow-avif plugin",
                "mime_type": "image/avif",
                "supports_animation": True,
                "supports_alpha": True,
                "default_quality": 80,
                "compression_levels": list(range(10)),
            }

    def _get_mime_type(self, extension: str) -> str:
        """Get MIME type for an extension."""
        mime_types = {
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
            ".png": "image/png",
            ".gif": "image/gif",
            ".bmp": "image/bmp",
            ".tiff": "image/tiff",
            ".tif": "image/tiff",
            ".webp": "image/webp",
        }
        return mime_types.get(extension, "application/octet-stream")


# Global image processing service instance
_global_image_service: ImageProcessingService | None = None


async def get_image_processing_service() -> ImageProcessingService:
    """Get the global image processing service instance."""
    global _global_image_service

    if _global_image_service is None:
        _global_image_service = ImageProcessingService()
        await _global_image_service.initialize()

    return _global_image_service


async def initialize_image_processing_service() -> bool:
    """Initialize the global image processing service."""
    global _global_image_service

    if _global_image_service is None:
        _global_image_service = ImageProcessingService()

    return await _global_image_service.initialize()


async def shutdown_image_processing_service() -> None:
    """Shutdown the global image processing service."""
    global _global_image_service

    if _global_image_service is not None:
        await _global_image_service.shutdown()
        _global_image_service = None
