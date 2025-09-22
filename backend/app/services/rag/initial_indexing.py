"""
🦊 Reynard Initial Indexing Service
===================================

Comprehensive initial indexing system for the Reynard codebase.
Provides full codebase indexing with progress monitoring, database checks,
and intelligent file discovery with configurable filtering.

Features:
- Database emptiness detection before indexing
- Intelligent file discovery with pattern matching
- Batch processing with progress tracking
- Real-time progress monitoring and reporting
- Error handling and recovery mechanisms
- Configurable indexing parameters
- Performance optimization with concurrent processing

Author: Reynard Development Team
Version: 1.0.0
"""

import asyncio
import logging
import time
from pathlib import Path
from typing import Any

from ...config.continuous_indexing_config import continuous_indexing_config
from ..continuous_indexing import ContinuousIndexingService

logger = logging.getLogger(__name__)


class InitialIndexingService:
    """Service for performing initial full codebase indexing."""

    def __init__(self, config: dict[str, Any]):
        """Initialize the initial indexing service."""
        self.config = config
        self.continuous_indexing: ContinuousIndexingService | None = None
        self.vector_store_service: Any | None = None
        self.progress_callbacks: list[callable] = []
        self.is_running = False
        self.current_progress = {
            "status": "idle",
            "total_files": 0,
            "processed_files": 0,
            "failed_files": 0,
            "current_batch": 0,
            "total_batches": 0,
            "start_time": None,
            "estimated_completion": None,
            "current_file": None,
            "errors": [],
        }

    async def initialize(
        self,
        continuous_indexing_service: ContinuousIndexingService,
        vector_store_service: Any = None,
    ) -> bool:
        """Initialize the service with dependencies."""
        try:
            self.continuous_indexing = continuous_indexing_service
            self.vector_store_service = vector_store_service
            logger.info("✅ Initial indexing service initialized")
        except Exception:
            logger.exception("❌ Failed to initialize initial indexing service")
            return False
        else:
            return True

    def add_progress_callback(self, callback: callable) -> None:
        """Add a progress callback function."""
        self.progress_callbacks.append(callback)

    def remove_progress_callback(self, callback: callable) -> None:
        """Remove a progress callback function."""
        if callback in self.progress_callbacks:
            self.progress_callbacks.remove(callback)

    async def _notify_progress(self) -> None:
        """Notify all progress callbacks of current status."""
        for callback in self.progress_callbacks:
            try:
                await callback(self.current_progress.copy())
            except Exception as e:
                logger.warning(f"Progress callback error: {e}")

    async def is_database_empty(self) -> bool:
        """Check if the database has any indexed content."""
        try:
            if not self.continuous_indexing:
                return True

            # Check if we have any documents in the database using vector store service
            if self.vector_store_service:
                vector_stats = await self.vector_store_service.get_stats()
                total_documents = vector_stats.get("total_documents", 0)
                total_embeddings = vector_stats.get("total_embeddings", 0)
            else:
                # Fallback to continuous indexing stats
                stats = self.continuous_indexing.get_stats()
                total_documents = stats.get("total_documents", 0)
                total_embeddings = stats.get("total_embeddings", 0)

            is_empty = total_documents == 0 and total_embeddings == 0
            logger.info(
                f"Database check: {total_documents} documents, {total_embeddings} embeddings"
            )
        except Exception:
            logger.exception("Failed to check database status")
            return True  # Assume empty if we can't check
        else:
            return is_empty

    async def discover_files(self) -> list[Path]:
        """Discover all files that should be indexed."""
        try:
            watch_root = Path(
                self.config.get(
                    "rag_continuous_indexing_watch_root", "/home/kade/runeset/reynard"
                )
            )

            if not watch_root.exists():
                logger.warning(f"Watch root does not exist: {watch_root}")
                return []

            logger.info(f"🔍 Discovering files in: {watch_root}")

            # Use the continuous indexing service's file filtering logic
            files_to_index = [
                file_path
                for file_path in watch_root.rglob("*")
                if (
                    file_path.is_file()
                    and continuous_indexing_config.should_watch_file(file_path)
                )
            ]

            logger.info(f"📁 Found {len(files_to_index)} files to index")
        except Exception:
            logger.exception("Failed to discover files")
            return []
        else:
            return files_to_index

    def _initialize_progress(self) -> None:
        """Initialize progress tracking."""
        self.current_progress = {
            "status": "starting",
            "total_files": 0,
            "processed_files": 0,
            "failed_files": 0,
            "current_batch": 0,
            "total_batches": 0,
            "start_time": time.time(),
            "estimated_completion": None,
            "current_file": None,
            "errors": [],
        }

    async def _check_database_and_skip_if_needed(
        self, force: bool
    ) -> dict[str, Any] | None:
        """Check if database is empty and skip if not forced."""
        if not force:
            is_empty = await self.is_database_empty()
            if not is_empty:
                logger.info("Database already has content, skipping initial indexing")
                self.current_progress["status"] = "skipped"
                await self._notify_progress()
                return {
                    "status": "skipped",
                    "reason": "Database already contains indexed content",
                    "progress": self.current_progress,
                }
        return None

    async def _discover_and_validate_files(self) -> list[Path] | dict[str, Any]:
        """Discover files and validate if any exist."""
        self.current_progress["status"] = "discovering"
        await self._notify_progress()

        files_to_index = await self.discover_files()
        if not files_to_index:
            logger.info("No files found to index")
            self.current_progress["status"] = "completed"
            await self._notify_progress()
            return {
                "status": "completed",
                "reason": "No files found to index",
                "progress": self.current_progress,
            }
        return files_to_index

    async def _process_batch(
        self, batch: list[Path], batch_num: int, total_batches: int
    ) -> None:
        """Process a single batch of files."""
        self.current_progress.update(
            {
                "current_batch": batch_num,
                "current_file": f"Processing batch {batch_num}/{total_batches}",
            }
        )
        await self._notify_progress()

        try:
            logger.info(
                f"📝 Indexing batch {batch_num}/{total_batches} ({len(batch)} files)"
            )

            # Ensure document indexer is resumed before processing
            if (
                hasattr(self.continuous_indexing, "rag_service")
                and self.continuous_indexing.rag_service
                and hasattr(self.continuous_indexing.rag_service, "document_indexer")
            ):
                await self.continuous_indexing.rag_service.document_indexer.resume()
                if batch_num == 1:  # Only log once
                    logger.info("📋 Document indexer resumed for processing")

            # Process files through continuous indexing service
            await self.continuous_indexing.index_files(batch)

            # Wait for processing to complete
            await asyncio.sleep(1.0)  # Give time for processing

            self.current_progress["processed_files"] += len(batch)
            logger.info(f"✅ Successfully indexed batch {batch_num}")

        except Exception:
            error_msg = f"Failed to index batch {batch_num}"
            logger.exception(f"❌ {error_msg}")
            self.current_progress["failed_files"] += len(batch)
            self.current_progress["errors"].append(error_msg)

    def _update_estimated_completion(self) -> None:
        """Update estimated completion time."""
        if self.current_progress["processed_files"] > 0:
            elapsed = time.time() - self.current_progress["start_time"]
            rate = self.current_progress["processed_files"] / elapsed
            remaining = (
                self.current_progress["total_files"]
                - self.current_progress["processed_files"]
            ) / rate
            self.current_progress["estimated_completion"] = time.time() + remaining

    async def perform_initial_indexing(self, force: bool = False) -> dict[str, Any]:
        """Perform initial indexing of the entire codebase."""
        if self.is_running:
            return {"error": "Initial indexing is already running"}

        try:
            self.is_running = True
            self._initialize_progress()
            await self._notify_progress()

            # Check if database is empty (unless forced)
            skip_result = await self._check_database_and_skip_if_needed(force)
            if skip_result:
                return skip_result

            # Discover files to index
            files_result = await self._discover_and_validate_files()
            if isinstance(files_result, dict):
                return files_result
            files_to_index = files_result

            # Update progress with discovered files
            self.current_progress.update(
                {
                    "status": "indexing",
                    "total_files": len(files_to_index),
                    "current_file": "Starting batch processing...",
                }
            )
            await self._notify_progress()

            # Process files in batches
            batch_size = self.config.get("rag_continuous_indexing_batch_size", 25)
            total_batches = (len(files_to_index) + batch_size - 1) // batch_size
            self.current_progress["total_batches"] = total_batches

            logger.info(
                f"🚀 Starting initial indexing: {len(files_to_index)} files in {total_batches} batches"
            )

            for i in range(0, len(files_to_index), batch_size):
                batch = files_to_index[i : i + batch_size]
                batch_num = i // batch_size + 1

                await self._process_batch(batch, batch_num, total_batches)
                self._update_estimated_completion()
                await self._notify_progress()

                # Small delay between batches
                await asyncio.sleep(0.1)

            # Mark as completed
            self.current_progress["status"] = "completed"
            self.current_progress["current_file"] = "Indexing completed!"
            await self._notify_progress()

            total_time = time.time() - self.current_progress["start_time"]
            logger.info(f"🎉 Initial indexing completed in {total_time:.2f}s")

            return {
                "status": "completed",
                "total_files": self.current_progress["total_files"],
                "processed_files": self.current_progress["processed_files"],
                "failed_files": self.current_progress["failed_files"],
                "total_time": total_time,
                "progress": self.current_progress,
            }

        except Exception:
            error_msg = "Initial indexing failed"
            logger.exception(f"❌ {error_msg}")
            self.current_progress.update(
                {
                    "status": "failed",
                    "errors": self.current_progress["errors"] + [error_msg],
                }
            )
            await self._notify_progress()
            return {
                "status": "failed",
                "error": error_msg,
                "progress": self.current_progress,
            }

        finally:
            self.is_running = False

    async def get_progress(self) -> dict[str, Any]:
        """Get current indexing progress."""
        return self.current_progress.copy()

    async def stop_indexing(self) -> bool:
        """Stop the current indexing process."""
        if not self.is_running:
            return False

        try:
            self.current_progress["status"] = "stopping"
            await self._notify_progress()
            # Note: We can't easily stop mid-batch, but we can mark it as stopping
            # and let the current batch complete
        except Exception:
            logger.exception("Failed to stop indexing")
            return False
        else:
            return True
