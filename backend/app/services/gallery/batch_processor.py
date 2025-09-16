"""
Gallery Batch Download Processor

Handles batch downloads with priority queues, concurrency control, and progress tracking.
Integrates with WebSocket manager for real-time updates.
"""

import asyncio
import logging
import uuid
from contextlib import suppress
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import Any

from app.services.gallery.websocket_manager import ProgressUpdate, websocket_manager

logger = logging.getLogger(__name__)


class DownloadPriority(Enum):
    """Download priority levels"""

    LOW = 1
    NORMAL = 2
    HIGH = 3
    URGENT = 4


class DownloadStatus(Enum):
    """Download status"""

    PENDING = "pending"
    QUEUED = "queued"
    DOWNLOADING = "downloading"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


@dataclass
class BatchDownloadItem:
    """Individual download item in a batch"""

    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    url: str = ""
    options: dict[str, Any] = field(default_factory=dict)
    priority: DownloadPriority = DownloadPriority.NORMAL
    status: DownloadStatus = DownloadStatus.PENDING
    created_at: str = field(default_factory=lambda: datetime.now().isoformat())
    started_at: str | None = None
    completed_at: str | None = None
    error: str | None = None
    result: dict[str, Any] | None = None
    retry_count: int = 0
    max_retries: int = 3


@dataclass
class BatchDownload:
    """Batch download configuration"""

    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    name: str = ""
    description: str = ""
    items: list[BatchDownloadItem] = field(default_factory=list)
    status: DownloadStatus = DownloadStatus.PENDING
    created_at: str = field(default_factory=lambda: datetime.now().isoformat())
    started_at: str | None = None
    completed_at: str | None = None
    settings: dict[str, Any] = field(default_factory=dict)
    total_items: int = 0
    completed_items: int = 0
    failed_items: int = 0


class GalleryBatchProcessor:
    """Processes batch downloads with priority queues and concurrency control"""

    def __init__(self, max_concurrent_downloads: int = 3):
        self.max_concurrent_downloads = max_concurrent_downloads
        self.active_downloads: dict[str, asyncio.Task] = {}
        self.download_queue: list[BatchDownloadItem] = []
        self.batch_downloads: dict[str, BatchDownload] = {}
        self.processing_lock = asyncio.Lock()
        self._shutdown = False

        # Start background processor
        self._processor_task = asyncio.create_task(self._process_downloads())

    async def create_batch_download(
        self,
        name: str,
        urls: list[str],
        options: dict[str, Any] | None = None,
        priority: DownloadPriority = DownloadPriority.NORMAL,
        settings: dict[str, Any] | None = None,
    ) -> BatchDownload:
        """Create a new batch download"""
        options = options or {}
        settings = settings or {}

        # Create batch download
        batch = BatchDownload(
            name=name,
            description=f"Batch download with {len(urls)} items",
            settings=settings,
        )

        # Create download items
        for url in urls:
            item = BatchDownloadItem(url=url, options=options.copy(), priority=priority)
            batch.items.append(item)

        batch.total_items = len(batch.items)

        # Store batch
        self.batch_downloads[batch.id] = batch

        # Add items to queue
        async with self.processing_lock:
            for item in batch.items:
                self.download_queue.append(item)
                item.status = DownloadStatus.QUEUED

        # Sort queue by priority
        self.download_queue.sort(key=lambda x: x.priority.value, reverse=True)

        logger.info(f"Created batch download '{name}' with {len(urls)} items")

        # Notify WebSocket subscribers
        await self._notify_batch_created(batch)

        return batch

    async def get_batch_download(self, batch_id: str) -> BatchDownload | None:
        """Get batch download by ID"""
        return self.batch_downloads.get(batch_id)

    async def get_batch_downloads(self) -> list[BatchDownload]:
        """Get all batch downloads"""
        return list(self.batch_downloads.values())

    async def cancel_batch_download(self, batch_id: str) -> bool:
        """Cancel a batch download"""
        batch = self.batch_downloads.get(batch_id)
        if not batch:
            return False

        batch.status = DownloadStatus.CANCELLED
        batch.completed_at = datetime.now().isoformat()

        # Cancel active downloads for this batch
        for item in batch.items:
            if item.id in self.active_downloads:
                task = self.active_downloads[item.id]
                task.cancel()
                del self.active_downloads[item.id]

            if item.status == DownloadStatus.DOWNLOADING:
                item.status = DownloadStatus.CANCELLED
                item.completed_at = datetime.now().isoformat()

        # Remove from queue
        async with self.processing_lock:
            self.download_queue = [
                item for item in self.download_queue if item not in batch.items
            ]

        logger.info(f"Cancelled batch download '{batch.name}'")

        # Notify WebSocket subscribers
        await self._notify_batch_cancelled(batch)

        return True

    async def retry_failed_items(self, batch_id: str) -> bool:
        """Retry failed items in a batch"""
        batch = self.batch_downloads.get(batch_id)
        if not batch:
            return False

        retry_items = []
        for item in batch.items:
            if (
                item.status == DownloadStatus.FAILED
                and item.retry_count < item.max_retries
            ):
                item.status = DownloadStatus.PENDING
                item.retry_count += 1
                item.error = None
                retry_items.append(item)

        if retry_items:
            async with self.processing_lock:
                for item in retry_items:
                    self.download_queue.append(item)
                    item.status = DownloadStatus.QUEUED

            # Sort queue by priority
            self.download_queue.sort(key=lambda x: x.priority.value, reverse=True)

            logger.info(
                f"Retrying {len(retry_items)} failed items in batch '{batch.name}'"
            )

        return len(retry_items) > 0

    async def _process_downloads(self) -> None:
        """Background processor for download queue"""
        while not self._shutdown:
            try:
                await self._start_new_downloads()
                await self._handle_completed_downloads()
                await asyncio.sleep(0.1)
            except Exception:
                logger.exception("Error in download processor")
                await asyncio.sleep(1)

    async def _start_new_downloads(self) -> None:
        """Start new downloads if capacity allows"""
        if len(self.active_downloads) >= self.max_concurrent_downloads:
            return

        async with self.processing_lock:
            if not self.download_queue:
                return

            item = self.download_queue.pop(0)
            task = asyncio.create_task(self._download_item(item))
            self.active_downloads[item.id] = task

            item.status = DownloadStatus.DOWNLOADING
            item.started_at = datetime.now().isoformat()

            logger.debug(f"Started download for item {item.id}")

    async def _handle_completed_downloads(self) -> None:
        """Handle completed download tasks"""
        completed_tasks = [
            item_id for item_id, task in self.active_downloads.items() if task.done()
        ]

        for item_id in completed_tasks:
            task = self.active_downloads.pop(item_id)
            try:
                await task  # Get result or raise exception
            except Exception:
                logger.exception(f"Download task {item_id} failed")

    async def _download_item(self, item: BatchDownloadItem) -> None:
        """Download a single item"""
        try:
            # This would integrate with the actual gallery service
            # For now, simulate download with progress updates

            # Simulate download progress
            for progress in range(0, 101, 10):
                if item.status == DownloadStatus.CANCELLED:
                    return

                # Send progress update
                progress_update = ProgressUpdate(
                    download_id=item.id,
                    url=item.url,
                    status=DownloadStatus.DOWNLOADING.value,
                    percentage=progress,
                    current_file=f"file_{progress}.jpg",
                    total_files=10,
                    downloaded_files=progress // 10,
                    total_bytes=1000000,
                    downloaded_bytes=progress * 10000,
                    speed=1000000.0,
                    estimated_time=10.0 - (progress / 10),
                    message=f"Downloading file {progress // 10 + 1} of 10",
                )

                await websocket_manager.send_progress_update(progress_update)
                await asyncio.sleep(0.5)  # Simulate download time

            # Mark as completed
            item.status = DownloadStatus.COMPLETED
            item.completed_at = datetime.now().isoformat()
            item.result = {
                "files_downloaded": 10,
                "total_size": 1000000,
                "duration": 5.0,
            }

            # Update batch statistics
            await self._update_batch_statistics(item)

            # Notify completion
            await websocket_manager.send_download_completed(item.id, item.result)

            logger.info(f"Completed download for item {item.id}")

        except asyncio.CancelledError:
            item.status = DownloadStatus.CANCELLED
            item.completed_at = datetime.now().isoformat()
            await websocket_manager.send_download_cancelled(item.id)
            logger.info(f"Cancelled download for item {item.id}")
            raise

        except Exception as e:
            item.status = DownloadStatus.FAILED
            item.error = str(e)
            item.completed_at = datetime.now().isoformat()

            # Update batch statistics
            await self._update_batch_statistics(item)

            # Notify error
            await websocket_manager.send_download_error(item.id, str(e))
            logger.exception(f"Failed download for item {item.id}")

    async def _update_batch_statistics(self, item: BatchDownloadItem) -> None:
        """Update batch statistics after item completion"""
        # Find batch containing this item
        for batch in self.batch_downloads.values():
            if item in batch.items:
                if item.status == DownloadStatus.COMPLETED:
                    batch.completed_items += 1
                elif item.status == DownloadStatus.FAILED:
                    batch.failed_items += 1

                # Check if batch is complete
                total_processed = batch.completed_items + batch.failed_items
                if total_processed >= batch.total_items:
                    batch.status = DownloadStatus.COMPLETED
                    batch.completed_at = datetime.now().isoformat()

                    # Notify batch completion
                    await self._notify_batch_completed(batch)

                break

    async def _notify_batch_created(self, batch: BatchDownload) -> None:
        """Notify WebSocket subscribers about batch creation"""
        # This would broadcast to all connected clients
        # For now, just log
        logger.info(f"Batch created: {batch.name}")

    async def _notify_batch_completed(self, batch: BatchDownload) -> None:
        """Notify WebSocket subscribers about batch completion"""
        # This would broadcast to all connected clients
        # For now, just log
        logger.info(f"Batch completed: {batch.name}")

    async def _notify_batch_cancelled(self, batch: BatchDownload) -> None:
        """Notify WebSocket subscribers about batch cancellation"""
        # This would broadcast to all connected clients
        # For now, just log
        logger.info(f"Batch cancelled: {batch.name}")

    async def get_processor_stats(self) -> dict[str, Any]:
        """Get processor statistics"""
        return {
            "active_downloads": len(self.active_downloads),
            "queued_downloads": len(self.download_queue),
            "total_batches": len(self.batch_downloads),
            "max_concurrent_downloads": self.max_concurrent_downloads,
            "active_download_ids": list(self.active_downloads.keys()),
            "queued_download_ids": [item.id for item in self.download_queue],
        }

    async def shutdown(self) -> None:
        """Shutdown the processor"""
        self._shutdown = True

        # Cancel all active downloads
        for task in self.active_downloads.values():
            task.cancel()

        # Wait for processor task to complete
        if self._processor_task:
            self._processor_task.cancel()
            with suppress(asyncio.CancelledError):
                await self._processor_task

        logger.info("Gallery batch processor shutdown complete")


# Global batch processor instance
batch_processor = GalleryBatchProcessor()
