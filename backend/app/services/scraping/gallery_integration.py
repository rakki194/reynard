"""
Gallery-dl integration for the scraping service
"""

import asyncio
import logging
from datetime import datetime
from typing import Any

from app.services.gallery.gallery_service import GalleryService
from app.services.scraping.models import GalleryDownloadJob, ScrapingStatus

logger = logging.getLogger(__name__)


class GalleryIntegration:
    """Integration layer between scraping service and gallery-dl"""

    def __init__(self, gallery_service: GalleryService):
        self.gallery_service = gallery_service
        self.active_downloads: dict[str, GalleryDownloadJob] = {}
        self.download_history: list[GalleryDownloadJob] = []

    async def start_gallery_download(
        self, url: str, config: dict[str, Any] | None = None
    ) -> GalleryDownloadJob:
        """Start a gallery download job"""
        try:
            # Create download job
            job = GalleryDownloadJob(
                id=f"gallery-{datetime.now().timestamp()}",
                url=url,
                status=ScrapingStatus.PENDING,
                progress=0,
                createdAt=datetime.now(),
                updatedAt=datetime.now(),
                galleryDlConfig=config or {},
            )

            # Add to active downloads
            self.active_downloads[job.id] = job

            # Start download asynchronously
            asyncio.create_task(self._execute_download(job))

            logger.info(f"Started gallery download job {job.id} for URL: {url}")
            return job

        except Exception as e:
            logger.error(f"Failed to start gallery download: {e}")
            raise

    async def _execute_download(self, job: GalleryDownloadJob) -> None:
        """Execute the gallery download"""
        try:
            # Update status to running
            job.status = ScrapingStatus.RUNNING
            job.updatedAt = datetime.now()

            # Configure gallery-dl options
            options = {
                "output": job.galleryDlConfig.get("outputDirectory", "./downloads"),
                "filename": job.galleryDlConfig.get("filename", "{title}_{id}"),
                "max-concurrent": job.galleryDlConfig.get("maxConcurrent", 5),
                **job.galleryDlConfig.get("extractorOptions", {}),
            }

            # Start download with progress tracking
            download_result = await self.gallery_service.download_gallery(
                job.url, options=options, on_progress=self._on_download_progress(job.id)
            )

            if download_result.success:
                # Update job with results
                job.status = ScrapingStatus.COMPLETED
                job.progress = 100
                job.result = {
                    "files_downloaded": len(download_result.files),
                    "total_size_bytes": sum(f.size for f in download_result.files),
                    "download_path": options["output"],
                    "extractor": download_result.extractor.name,
                    "duration": download_result.duration,
                }
                job.updatedAt = datetime.now()

                logger.info(f"Gallery download completed: {job.id}")
            else:
                # Handle download failure
                job.status = ScrapingStatus.FAILED
                job.error = download_result.error or "Download failed"
                job.updatedAt = datetime.now()

                logger.error(f"Gallery download failed: {job.id} - {job.error}")

        except Exception as e:
            # Handle unexpected errors
            job.status = ScrapingStatus.FAILED
            job.error = str(e)
            job.updatedAt = datetime.now()

            logger.error(f"Gallery download error: {job.id} - {e}")

        finally:
            # Move to history and remove from active
            self.download_history.append(job)
            if job.id in self.active_downloads:
                del self.active_downloads[job.id]

    def _on_download_progress(self, job_id: str):
        """Create progress callback for a specific job"""

        def progress_callback(progress_data: dict[str, Any]):
            if job_id in self.active_downloads:
                job = self.active_downloads[job_id]
                job.progress = progress_data.get("percentage", 0)
                job.updatedAt = datetime.now()

                # Emit progress event
                self._emit_progress_event(job, progress_data)

        return progress_callback

    def _emit_progress_event(
        self, job: GalleryDownloadJob, progress_data: dict[str, Any]
    ) -> None:
        """Emit progress event for WebSocket clients"""
        # This would integrate with the event system
        # For now, just log the progress
        logger.debug(f"Download progress {job.id}: {progress_data}")

    async def cancel_download(self, job_id: str) -> bool:
        """Cancel a gallery download"""
        try:
            if job_id in self.active_downloads:
                job = self.active_downloads[job_id]
                job.status = ScrapingStatus.CANCELLED
                job.updatedAt = datetime.now()

                # Cancel the actual download
                await self.gallery_service.cancel_download(job_id)

                # Move to history
                self.download_history.append(job)
                del self.active_downloads[job_id]

                logger.info(f"Cancelled gallery download: {job_id}")
                return True
            logger.warning(f"Download job not found: {job_id}")
            return False

        except Exception as e:
            logger.error(f"Failed to cancel download {job_id}: {e}")
            return False

    async def delete_download(self, job_id: str) -> bool:
        """Delete a gallery download job"""
        try:
            # Remove from active downloads
            if job_id in self.active_downloads:
                del self.active_downloads[job_id]

            # Remove from history
            self.download_history = [
                job for job in self.download_history if job.id != job_id
            ]

            logger.info(f"Deleted gallery download: {job_id}")
            return True

        except Exception as e:
            logger.error(f"Failed to delete download {job_id}: {e}")
            return False

    async def get_download(self, job_id: str) -> GalleryDownloadJob | None:
        """Get a specific download job"""
        # Check active downloads first
        if job_id in self.active_downloads:
            return self.active_downloads[job_id]

        # Check history
        for job in self.download_history:
            if job.id == job_id:
                return job

        return None

    async def get_downloads(self) -> list[GalleryDownloadJob]:
        """Get all download jobs (active + history)"""
        return list(self.active_downloads.values()) + self.download_history

    async def get_active_downloads(self) -> list[GalleryDownloadJob]:
        """Get only active download jobs"""
        return list(self.active_downloads.values())

    async def get_download_statistics(self) -> dict[str, Any]:
        """Get download statistics"""
        all_downloads = await self.get_downloads()

        total_downloads = len(all_downloads)
        completed_downloads = len(
            [j for j in all_downloads if j.status == ScrapingStatus.COMPLETED]
        )
        failed_downloads = len(
            [j for j in all_downloads if j.status == ScrapingStatus.FAILED]
        )
        active_downloads = len(self.active_downloads)

        total_files = sum(
            j.result.get("files_downloaded", 0)
            for j in all_downloads
            if j.result and j.status == ScrapingStatus.COMPLETED
        )

        total_size = sum(
            j.result.get("total_size_bytes", 0)
            for j in all_downloads
            if j.result and j.status == ScrapingStatus.COMPLETED
        )

        return {
            "total_downloads": total_downloads,
            "completed_downloads": completed_downloads,
            "failed_downloads": failed_downloads,
            "active_downloads": active_downloads,
            "total_files_downloaded": total_files,
            "total_size_bytes": total_size,
            "success_rate": completed_downloads / total_downloads
            if total_downloads > 0
            else 0,
        }

    async def validate_url(self, url: str) -> dict[str, Any]:
        """Validate a URL for gallery download"""
        try:
            # Use gallery service to validate URL
            validation_result = await self.gallery_service.validate_url(url)

            return {
                "isValid": validation_result.isValid,
                "extractor": validation_result.extractor.dict()
                if validation_result.extractor
                else None,
                "error": validation_result.error,
                "pattern": validation_result.pattern,
            }

        except Exception as e:
            logger.error(f"URL validation failed: {e}")
            return {
                "isValid": False,
                "error": str(e),
                "extractor": None,
                "pattern": None,
            }

    async def get_extractors(self) -> list[dict[str, Any]]:
        """Get available extractors"""
        try:
            extractors = await self.gallery_service.get_extractors()
            return [extractor.dict() for extractor in extractors]

        except Exception as e:
            logger.error(f"Failed to get extractors: {e}")
            return []

    async def get_download_progress(self, job_id: str) -> dict[str, Any] | None:
        """Get download progress for a specific job"""
        job = await self.get_download(job_id)
        if not job:
            return None

        return {
            "jobId": job.id,
            "progress": job.progress,
            "status": job.status.value,
            "currentFile": None,  # Would be populated by gallery-dl
            "estimatedTime": None,  # Would be calculated
            "speed": None,  # Would be tracked
            "bytesDownloaded": None,  # Would be tracked
            "totalBytes": None,  # Would be estimated
            "message": f"Downloading {job.url}",
        }
