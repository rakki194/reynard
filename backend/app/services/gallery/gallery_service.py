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

# Import gallery-dl library
try:
    from gallery_dl import config, job, extractor, option, output, util
    from gallery_dl.extractor.common import Extractor, Message
    GALLERY_DL_AVAILABLE = True
except ImportError as e:
    logging.error(f"Failed to import gallery-dl: {e}")
    GALLERY_DL_AVAILABLE = False

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

        # Apply configuration using the correct API
        for key, value in self.gallery_config.items():
            config.set((), key, value)
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

        extractors = []
        
        # Get standard gallery-dl extractors
        try:
            standard_extractors = extractor.extractors()
            for extr in standard_extractors:
                extractors.append({
                    "name": extr.__name__,
                    "category": getattr(extr, "category", "unknown"),
                    "subcategory": getattr(extr, "subcategory", "unknown"),
                    "pattern": getattr(extr, "pattern", ""),
                    "example": getattr(extr, "example", ""),
                    "description": extr.__doc__ or "",
                    "features": [],
                    "reynard_enabled": False,
                    "type": "standard",
                })
        except Exception as e:
            logger.warning(f"Failed to get standard extractors: {e}")

        # Add Reynard custom extractors
        reynard_extractors = extractor_registry.get_available_extractors()
        extractors.extend(reynard_extractors)

        return extractors

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
            # First check Reynard custom extractors
            reynard_extractor = extractor_registry.find_extractor_for_url(url)
            if reynard_extractor:
                return {
                    "is_valid": True,
                    "extractor": {
                        "name": reynard_extractor["name"],
                        "category": reynard_extractor["category"],
                        "subcategory": reynard_extractor["subcategory"],
                        "patterns": reynard_extractor["pattern"],
                        "description": reynard_extractor["description"],
                        "features": reynard_extractor["features"],
                        "reynard_enabled": reynard_extractor["reynard_enabled"],
                        "type": reynard_extractor["type"],
                    },
                    "pattern": reynard_extractor["pattern"],
                }

            # Then check standard gallery-dl extractors
            try:
                # Use gallery-dl's built-in extractor detection
                extr = extractor.find(url)
                if extr:
                    return {
                        "is_valid": True,
                        "extractor": {
                            "name": extr.__name__,
                            "category": getattr(extr, "category", "unknown"),
                            "subcategory": getattr(extr, "subcategory", "unknown"),
                            "patterns": getattr(extr, "pattern", ""),
                            "description": extr.__doc__ or "",
                            "features": [],
                            "reynard_enabled": False,
                            "type": "standard",
                        },
                        "pattern": getattr(extr, "pattern", ""),
                    }
            except Exception as e:
                logger.debug(f"Standard extractor detection failed: {e}")

            return {"is_valid": False, "error": "No matching extractor found"}

        except Exception as e:
            return {"is_valid": False, "error": f"Validation failed: {e!s}"}

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

            # Create download job with proper configuration
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

            # Execute download using gallery-dl's job system
            for msg in download_job.run():
                if msg[0] == Message.Directory:
                    # Directory message - contains metadata about the gallery
                    directory_info = msg[1]
                    total_files = directory_info.get("count", 0)
                    progress.total_files = total_files
                    progress.message = f"Found {total_files} files"
                    logger.info(f"Gallery info: {directory_info}")

                elif msg[0] == Message.Url:
                    # File download message
                    file_info = msg[1]
                    file_url = msg[2]
                    
                    files.append(
                        {
                            "url": file_url,
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

                elif msg[0] == Message.Complete:
                    # Download completed
                    progress.message = "Download completed"
                    logger.info("Download job completed successfully")

                elif msg[0] == Message.Error:
                    # Download error
                    error_info = msg[1]
                    logger.error(f"Download error: {error_info}")
                    progress.message = f"Error: {error_info}"

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
        """Create job configuration using gallery-dl's configuration system"""
        # Start with base configuration
        job_config = self.gallery_config.copy()

        # Apply custom options
        if "output_directory" in options:
            job_config["base-directory"] = options["output_directory"]

        if "filename" in options:
            job_config["format"] = options["filename"]

        if "max_concurrent" in options:
            job_config["concurrent"] = options["max_concurrent"]

        if "retries" in options:
            job_config["retries"] = options["retries"]

        if "timeout" in options:
            job_config["timeout"] = options["timeout"]

        # Apply extractor-specific options
        if "extractor_options" in options:
            for key, value in options["extractor_options"].items():
                job_config[key] = value

        # Apply post-processor options
        if "postprocessors" in options:
            job_config["postprocessors"] = options["postprocessors"]

        # Set configuration in gallery-dl using the correct API
        for key, value in job_config.items():
            config.set((), key, value)

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
