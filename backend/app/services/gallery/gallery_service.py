"""
Gallery Service for Reynard Backend

This service provides comprehensive gallery-dl integration with progress tracking,
batch processing, and seamless integration with the Reynard ecosystem.
"""

import importlib.util
import logging
import time
from dataclasses import dataclass
from typing import Any

# Reynard imports
from app.extractors.registry import extractor_registry

# Check if gallery-dl is available
GALLERY_DL_AVAILABLE = importlib.util.find_spec("gallery_dl") is not None

if GALLERY_DL_AVAILABLE:
    from gallery_dl import config, job
else:
    logging.warning("gallery-dl not available. Install with: pip install gallery-dl")

logger = logging.getLogger(__name__)


@dataclass
class DownloadProgress:
    """Download progress information"""

    download_id: str
    url: str
    status: str  # pending, downloading, completed, error
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


@dataclass
class DownloadResult:
    """Download result information"""

    download_id: str
    success: bool
    files: list[dict[str, Any]]
    stats: dict[str, Any]
    duration: float
    extractor_info: dict[str, Any]
    error: str | None = None


class ReynardGalleryService:
    """
    Reynard Gallery Service

    Provides comprehensive gallery-dl integration with:
    - Progress tracking
    - Batch processing
    - Error handling
    - Reynard-specific configuration
    """

    def __init__(self, config: dict[str, Any]):
        self.config = config
        self.name = "gallery-service"
        self.gallery_dl_available = GALLERY_DL_AVAILABLE
        self.active_downloads: dict[str, DownloadProgress] = {}
        self.download_history: list[DownloadResult] = []
        self._setup_gallery_dl_config()

    def _setup_gallery_dl_config(self) -> None:
        """Setup gallery-dl configuration for Reynard"""
        if not self.gallery_dl_available:
            return

        # Configure gallery-dl with Reynard-specific settings
        self.gallery_config = {
            "base-directory": self.config.get("download_directory", "./downloads"),
            "skip": True,  # Skip existing files
            "retries": self.config.get("retries", 3),
            "timeout": self.config.get("timeout", 30),
            "sleep": self.config.get("sleep", 1),
            "filesize-min": self.config.get("min_file_size", 0),
            "filesize-max": self.config.get("max_file_size", 0),
            "format": self.config.get("filename_format", "{filename}"),
        }

        # Apply configuration
        config.set(self.gallery_config)
        logger.info("Gallery-dl configuration applied")

    async def initialize(self) -> bool:
        """Initialize the gallery service"""
        try:
            if not self.gallery_dl_available:
                logger.error("Gallery-dl not available. Cannot initialize service.")
                return False

            # Test gallery-dl availability
            test_extractors = self._get_available_extractors()
            if not test_extractors:
                logger.warning("No extractors available")
            else:
                logger.info(
                    f"Gallery service initialized with {len(test_extractors)} extractors"
                )

        except Exception:
            logger.exception("Failed to initialize gallery service")
            return False
        else:
            return True

    async def shutdown(self) -> None:
        """Shutdown the gallery service"""
        # Cancel all active downloads
        for download_id in list(self.active_downloads.keys()):
            await self.cancel_download(download_id)

        logger.info("Gallery service shutdown complete")

    async def health_check(self) -> bool:
        """Check service health"""
        try:
            if not self.gallery_dl_available:
                return False

            # Test basic functionality
            return len(self._get_available_extractors()) > 0

        except Exception:
            logger.exception("Health check failed")
            return False

    def _get_available_extractors(self) -> list[dict[str, Any]]:
        """Get list of available extractors including Reynard custom extractors"""
        if not self.gallery_dl_available:
            return []

        # Get all extractors from registry (includes Reynard custom extractors)
        return extractor_registry.get_available_extractors()

    async def get_extractors(self) -> list[dict[str, Any]]:
        """Get available extractors"""
        return self._get_available_extractors()

    async def get_reynard_extractors(self) -> list[dict[str, Any]]:
        """Get Reynard custom extractors"""
        if not self.gallery_dl_available:
            return []

        return extractor_registry.get_reynard_extractors()

    async def get_extractor_stats(self) -> dict[str, Any]:
        """Get extractor statistics"""
        if not self.gallery_dl_available:
            return {"error": "Gallery-dl not available"}

        return extractor_registry.get_extractor_stats()

    async def validate_url(self, url: str) -> dict[str, Any]:
        """Validate URL and detect extractor including Reynard custom extractors"""
        if not self.gallery_dl_available:
            return {"is_valid": False, "error": "Gallery-dl not available"}

        try:
            # Use registry to find extractor
            extractor_info = extractor_registry.find_extractor_for_url(url)

            if extractor_info:
                return {
                    "is_valid": True,
                    "extractor": {
                        "name": extractor_info["name"],
                        "category": extractor_info["category"],
                        "subcategory": extractor_info["subcategory"],
                        "patterns": extractor_info["pattern"],
                        "description": extractor_info["description"],
                        "features": extractor_info["features"],
                        "reynard_enabled": extractor_info["reynard_enabled"],
                        "type": extractor_info["type"],
                    },
                    "pattern": extractor_info["pattern"],
                }
        except Exception as e:
            return {"is_valid": False, "error": f"Validation failed: {e!s}"}
        else:
            return {"is_valid": False, "error": "No matching extractor found"}

    async def download_gallery(
        self, url: str, options: dict[str, Any] | None = None
    ) -> DownloadResult:
        """Download a gallery from URL"""
        if not self.gallery_dl_available:
            return DownloadResult(
                download_id="",
                success=False,
                files=[],
                stats={},
                duration=0,
                extractor_info={},
                error="Gallery-dl not available",
            )

        download_id = self._generate_download_id()
        start_time = time.time()

        # Initialize progress tracking
        progress = DownloadProgress(
            download_id=download_id,
            url=url,
            status="pending",
            percentage=0.0,
            message="Starting download...",
        )
        self.active_downloads[download_id] = progress

        try:
            # Update progress
            progress.status = "downloading"
            progress.message = "Extracting gallery information..."
            progress.percentage = 10.0

            # Create download job
            job_config = self._create_job_config(options or {})
            download_job = job.DownloadJob(url, job_config)

            # Get extractor info
            extractor_info = await self.validate_url(url)

            # Perform download
            files = []
            total_files = 0
            downloaded_files = 0
            downloaded_bytes = 0

            progress.message = "Downloading files..."
            progress.percentage = 20.0

            # Execute download
            for msg in download_job.run():
                if msg[0] == job.Message.Directory:
                    # Directory message
                    total_files = len(msg[1].get("files", []))
                    progress.total_files = total_files
                    progress.message = f"Found {total_files} files"

                elif msg[0] == job.Message.Url:
                    # File download message
                    file_info = msg[1]
                    files.append(
                        {
                            "url": msg[2],
                            "filename": file_info.get("filename", ""),
                            "extension": file_info.get("extension", ""),
                            "size": file_info.get("filesize", 0),
                            "metadata": file_info,
                        }
                    )

                    downloaded_files += 1
                    downloaded_bytes += file_info.get("filesize", 0)

                    # Update progress
                    if total_files > 0:
                        progress.percentage = (
                            20.0 + (downloaded_files / total_files) * 70.0
                        )
                    progress.downloaded_files = downloaded_files
                    progress.downloaded_bytes = downloaded_bytes
                    progress.current_file = file_info.get("filename", "")
                    progress.message = (
                        f"Downloaded {downloaded_files}/{total_files} files"
                    )

            # Complete download
            progress.status = "completed"
            progress.percentage = 100.0
            progress.message = "Download completed successfully"

            duration = time.time() - start_time

            # Calculate stats
            stats = {
                "total_files": total_files,
                "downloaded_files": downloaded_files,
                "total_bytes": downloaded_bytes,
                "average_speed": downloaded_bytes / duration if duration > 0 else 0,
                "success_rate": 100.0 if total_files > 0 else 0,
                "failed_downloads": 0,
                "skipped_files": 0,
            }

            result = DownloadResult(
                download_id=download_id,
                success=True,
                files=files,
                stats=stats,
                duration=duration,
                extractor_info=extractor_info.get("extractor", {}),
                error=None,
            )

            # Add to history
            self.download_history.append(result)

        except Exception as e:
            # Handle error
            progress.status = "error"
            progress.error = str(e)
            progress.message = f"Download failed: {e!s}"

            duration = time.time() - start_time

            return DownloadResult(
                download_id=download_id,
                success=False,
                files=[],
                stats={},
                duration=duration,
                extractor_info={},
                error=str(e),
            )
        else:
            return result

        finally:
            # Clean up progress tracking
            if download_id in self.active_downloads:
                del self.active_downloads[download_id]

    async def get_download_progress(self, download_id: str) -> DownloadProgress | None:
        """Get download progress"""
        return self.active_downloads.get(download_id)

    async def get_active_downloads(self) -> list[DownloadProgress]:
        """Get all active downloads"""
        return list(self.active_downloads.values())

    async def cancel_download(self, download_id: str) -> bool:
        """Cancel a download"""
        if download_id in self.active_downloads:
            progress = self.active_downloads[download_id]
            progress.status = "cancelled"
            progress.message = "Download cancelled"
            del self.active_downloads[download_id]
            return True
        return False

    async def get_download_history(self, limit: int = 100) -> list[DownloadResult]:
        """Get download history"""
        return self.download_history[-limit:]

    def _create_job_config(self, options: dict[str, Any]) -> dict[str, Any]:
        """Create job configuration"""
        job_config = self.gallery_config.copy()

        # Apply custom options
        if "output_directory" in options:
            job_config["base-directory"] = options["output_directory"]

        if "filename" in options:
            job_config["format"] = options["filename"]

        if "extractor_options" in options:
            job_config.update(options["extractor_options"])

        return job_config

    def _generate_download_id(self) -> str:
        """Generate unique download ID"""
        return f"download_{int(time.time())}_{id(self)}"

    async def get_service_metrics(self) -> dict[str, Any]:
        """Get service metrics"""
        return {
            "total_requests": len(self.download_history),
            "successful_requests": len([r for r in self.download_history if r.success]),
            "failed_requests": len([r for r in self.download_history if not r.success]),
            "average_response_time": (
                sum(r.duration for r in self.download_history)
                / len(self.download_history)
                if self.download_history
                else 0
            ),
            "active_downloads": len(self.active_downloads),
            "queue_size": 0,  # No queue in this implementation
            "gallery_dl_available": self.gallery_dl_available,
            "extractors_count": len(self._get_available_extractors()),
        }
