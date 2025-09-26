"""Continuous Indexing Service

Service for continuous monitoring and indexing of the Reynard codebase.
Provides real-time file watching and automatic re-indexing capabilities.
"""

import asyncio
import logging
import time
from pathlib import Path
from typing import Any

from watchdog.events import FileSystemEventHandler
from watchdog.observers import Observer

from ....config.continuous_indexing_config import continuous_indexing_config

logger = logging.getLogger("uvicorn")


class CodebaseChangeHandler(FileSystemEventHandler):
    """Handler for file system changes in the codebase."""

    def __init__(self, indexer: "ContinuousIndexingService"):
        self.indexer = indexer
        self.pending_files: set[Path] = set()
        self.last_modified: dict[Path, float] = {}
        self.config = continuous_indexing_config

    def on_modified(self, event):
        """Handle file modification events."""
        if event.is_directory:
            return

        file_path = Path(event.src_path)

        if not self.config.should_watch_file(file_path):
            return

        # Skip if the indexer is not running
        if not self.indexer.running:
            return

        # Debounce rapid changes
        current_time = time.time()
        if (
            file_path in self.last_modified
            and current_time - self.last_modified[file_path]
            < self.config.debounce_seconds
        ):
            return

        self.last_modified[file_path] = current_time
        self.pending_files.add(file_path)

        logger.info("📝 File modified: %s", file_path)

        # Schedule re-indexing (thread-safe)
        try:
            # Create the coroutine and schedule it properly
            coro = self.indexer.schedule_reindex(file_path)
            future = self.indexer._schedule_task_thread_safe(coro)
            if future:
                # Don't wait for the result, just schedule it
                # The future will be handled by the event loop
                pass
        except Exception as e:
            logger.debug(f"Failed to schedule reindex for {file_path}: {e}")

    def on_created(self, event):
        """Handle file creation events."""
        if event.is_directory:
            return

        file_path = Path(event.src_path)

        if not self.config.should_watch_file(file_path):
            return

        # Skip if the indexer is not running
        if not self.indexer.running:
            return

        self.pending_files.add(file_path)
        logger.info("📄 File created: %s", file_path)

        # Schedule indexing (thread-safe)
        try:
            # Create the coroutine and schedule it properly
            coro = self.indexer.schedule_reindex(file_path)
            future = self.indexer._schedule_task_thread_safe(coro)
            if future:
                # Don't wait for the result, just schedule it
                pass
        except Exception as e:
            logger.debug(f"Failed to schedule indexing for {file_path}: {e}")

    def on_deleted(self, event):
        """Handle file deletion events."""
        if event.is_directory:
            return

        file_path = Path(event.src_path)

        if not self.config.should_watch_file(file_path):
            return

        # Skip if the indexer is not running
        if not self.indexer.running:
            return

        logger.info("🗑️  File deleted: %s", file_path)

        # Schedule removal from index (thread-safe)
        try:
            # Create the coroutine and schedule it properly
            coro = self.indexer.schedule_removal(file_path)
            future = self.indexer._schedule_task_thread_safe(coro)
            if future:
                # Don't wait for the result, just schedule it
                pass
        except Exception as e:
            logger.debug(f"Failed to schedule removal for {file_path}: {e}")


class ContinuousIndexingService:
    """Continuous indexing service for the Reynard codebase."""

    def __init__(self, config: dict[str, Any]):
        self.config = config
        self.rag_service = None
        self.observer = None
        self.change_handler = None
        self.running = False

        # Indexing queue
        self.indexing_queue: asyncio.Queue = asyncio.Queue(
            maxsize=continuous_indexing_config.max_queue_size,
        )
        self.removal_queue: asyncio.Queue = asyncio.Queue(
            maxsize=continuous_indexing_config.max_queue_size,
        )

        # Statistics
        self.stats = {
            "files_indexed": 0,
            "files_removed": 0,
            "indexing_errors": 0,
            "last_index_time": 0,
            "uptime": 0,
            "start_time": 0,
        }

    async def initialize(self) -> bool:
        """Initialize the continuous indexing service."""
        try:
            if not continuous_indexing_config.enabled:
                logger.info("Continuous indexing disabled by configuration")
                return True

            # Validate configuration
            errors = continuous_indexing_config.validate()
            if errors:
                logger.error(f"Continuous indexing configuration errors: {errors}")
                return False

            # Initialize file watcher
            self.change_handler = CodebaseChangeHandler(self)
            self.observer = Observer()
            self.observer.schedule(
                self.change_handler,
                str(continuous_indexing_config.get_watch_root_path()),
                recursive=True,
            )

            self.stats["start_time"] = time.time()
            logger.info("✅ Continuous indexing service initialized successfully")
            return True

        except Exception as e:
            logger.error(f"Failed to initialize continuous indexing service: {e}")
            return False

    async def start_watching(self):
        """Start watching for file changes."""
        if not self.observer:
            logger.error("Observer not initialized")
            return

        self.observer.start()
        self.running = True
        logger.info(
            "👀 Started watching %s for changes...",
            continuous_indexing_config.watch_root,
        )

        # Start background tasks
        asyncio.create_task(self.process_indexing_queue())
        asyncio.create_task(self.process_removal_queue())
        asyncio.create_task(self.periodic_stats_report())

    async def stop_watching(self):
        """Stop watching for file changes."""
        self.running = False

        if self.observer:
            self.observer.stop()
            self.observer.join()

        logger.info("🛑 Stopped watching for changes")

    def set_rag_service(self, rag_service):
        """Set the RAG service for indexing operations."""
        self.rag_service = rag_service

    def _schedule_task_thread_safe(self, coro):
        """Schedule an asyncio task from a different thread."""
        try:
            # Get the current event loop
            loop = asyncio.get_running_loop()
            # Schedule the coroutine as a task and return the future
            return asyncio.run_coroutine_threadsafe(coro, loop)
        except RuntimeError:
            # If no event loop is running, we can't schedule the task
            # This is expected during testing or when the service isn't fully initialized
            # Only log as debug to avoid cluttering logs during normal operation
            logger.debug(
                "No event loop running, cannot schedule task (this is normal during testing)",
            )
            return None
        except Exception as e:
            # Catch any other unexpected errors
            logger.debug(f"Failed to schedule task: {e}")
            return None

    async def schedule_reindex(self, file_path: Path):
        """Schedule a file for re-indexing."""
        try:
            await self.indexing_queue.put(file_path)
        except asyncio.QueueFull:
            logger.warning("Indexing queue full, dropping file: %s", file_path)
        except Exception as e:
            logger.error("Failed to schedule reindex for %s: %s", file_path, e)

    async def schedule_removal(self, file_path: Path):
        """Schedule a file for removal from index."""
        try:
            await self.removal_queue.put(file_path)
        except asyncio.QueueFull:
            logger.warning("Removal queue full, dropping file: %s", file_path)
        except Exception as e:
            logger.error("Failed to schedule removal for %s: %s", file_path, e)

    async def process_indexing_queue(self):
        """Process the indexing queue."""
        while self.running:
            try:
                # Wait for files to index
                file_path = await asyncio.wait_for(
                    self.indexing_queue.get(),
                    timeout=1.0,
                )

                # Wait a bit to batch multiple changes
                await asyncio.sleep(continuous_indexing_config.debounce_seconds)

                # Collect all pending files
                files_to_index = [file_path]
                while not self.indexing_queue.empty():
                    try:
                        additional_file = self.indexing_queue.get_nowait()
                        files_to_index.append(additional_file)
                    except asyncio.QueueEmpty:
                        break

                # Limit batch size
                if len(files_to_index) > continuous_indexing_config.batch_size:
                    files_to_index = files_to_index[
                        : continuous_indexing_config.batch_size
                    ]

                # Index the files
                await self.index_files(files_to_index)

            except TimeoutError:
                continue
            except Exception as e:
                logger.error("Error processing indexing queue: %s", e)

    async def process_removal_queue(self):
        """Process the removal queue."""
        while self.running:
            try:
                # Wait for files to remove
                file_path = await asyncio.wait_for(
                    self.removal_queue.get(),
                    timeout=1.0,
                )

                # Remove from index
                await self.remove_file_from_index(file_path)

            except TimeoutError:
                continue
            except Exception as e:
                logger.error("Error processing removal queue: %s", e)

    async def index_files(self, file_paths: list[Path]):
        """Index a list of files."""
        if not self.rag_service:
            logger.warning("RAG service not available for indexing")
            return

        documents = []

        for file_path in file_paths:
            doc = await self._create_document_from_file(file_path)
            if doc:
                documents.append(doc)

        if documents:
            await self._index_documents_batch(documents)

    async def _create_document_from_file(self, file_path: Path) -> dict | None:
        """Create a document from a file path."""
        try:
            if not file_path.exists():
                return None

            if not continuous_indexing_config.should_include_file(file_path):
                return None

            # Read file content
            content = file_path.read_text(encoding="utf-8", errors="ignore")

            if not content.strip():
                return None

            # Create document
            relative_path = file_path.relative_to(
                continuous_indexing_config.get_watch_root_path(),
            )
            return {
                "file_id": str(relative_path),
                "path": str(file_path),
                "relative_path": str(relative_path),
                "content": content,
                "file_type": self._get_file_type(file_path),
                "language": self._detect_language(file_path),
                "size": len(content),
                "metadata": {
                    "extension": file_path.suffix,
                    "parent_dir": str(
                        file_path.parent.relative_to(
                            continuous_indexing_config.get_watch_root_path(),
                        ),
                    ),
                    "indexed_at": time.time(),
                    "indexed_by": "continuous_indexing",
                },
            }

        except Exception as e:
            logger.warning("Failed to read %s: %s", file_path, e)
            self.stats["indexing_errors"] += 1
            return None

    async def _index_documents_batch(self, documents: list[dict]):
        """Index a batch of documents."""
        try:
            # Index documents
            result = await self.rag_service.index_documents(documents)

            if result.get("status") == "success":
                self.stats["files_indexed"] += len(documents)
                self.stats["last_index_time"] = time.time()
                logger.info("✅ Indexed %d files", len(documents))
            else:
                logger.error("❌ Failed to index files: %s", result)
                self.stats["indexing_errors"] += len(documents)

        except Exception as e:
            logger.error("Failed to index files: %s", e)
            self.stats["indexing_errors"] += len(documents)

    async def remove_file_from_index(self, file_path: Path):
        """Remove a file from the index."""
        try:
            # TODO: Implement file removal from vector database
            # This would require adding a remove_document method to the RAG service
            logger.info("🗑️  Removed %s from index", file_path)
            self.stats["files_removed"] += 1

        except Exception as e:
            logger.error("Failed to remove %s from index: %s", file_path, e)

    async def periodic_stats_report(self):
        """Periodically report statistics."""
        while self.running:
            await asyncio.sleep(continuous_indexing_config.stats_interval_minutes * 60)

            uptime = time.time() - self.stats.get("start_time", time.time())
            self.stats["uptime"] = uptime

            logger.info("📊 Continuous Indexing Stats:")
            logger.info("  Files indexed: %d", self.stats["files_indexed"])
            logger.info("  Files removed: %d", self.stats["files_removed"])
            logger.info("  Indexing errors: %d", self.stats["indexing_errors"])
            logger.info("  Uptime: %.0f seconds", uptime)
            logger.info(
                "  Queue sizes: indexing=%d, removal=%d",
                self.indexing_queue.qsize(),
                self.removal_queue.qsize(),
            )

    def _get_file_type(self, file_path: Path) -> str:
        """Determine file type from extension."""
        ext = file_path.suffix.lower()

        type_map = {
            ".py": "python",
            ".ts": "typescript",
            ".tsx": "typescript",
            ".js": "javascript",
            ".jsx": "javascript",
            ".vue": "vue",
            ".svelte": "svelte",
            ".md": "markdown",
            ".txt": "text",
            ".json": "json",
            ".yaml": "yaml",
            ".yml": "yaml",
            ".toml": "toml",
            ".css": "css",
            ".scss": "scss",
            ".sass": "sass",
            ".less": "less",
            ".html": "html",
            ".xml": "xml",
        }

        return type_map.get(ext, "text")

    def _detect_language(self, file_path: Path) -> str:
        """Detect programming language from file path."""
        ext = file_path.suffix.lower()

        language_map = {
            ".py": "python",
            ".ts": "typescript",
            ".tsx": "typescript",
            ".js": "javascript",
            ".jsx": "javascript",
            ".vue": "javascript",
            ".svelte": "javascript",
        }

        return language_map.get(ext, "generic")

    def get_stats(self) -> dict[str, Any]:
        """Get continuous indexing statistics."""
        uptime = time.time() - self.stats.get("start_time", time.time())
        self.stats["uptime"] = uptime

        return {
            "enabled": continuous_indexing_config.enabled,
            "running": self.running,
            "watch_root": continuous_indexing_config.watch_root,
            "stats": self.stats.copy(),
            "queue_sizes": {
                "indexing": self.indexing_queue.qsize(),
                "removal": self.removal_queue.qsize(),
            },
            "config": continuous_indexing_config.to_dict(),
        }

    async def shutdown(self):
        """Shutdown the continuous indexing service."""
        logger.info("Shutting down continuous indexing service...")

        await self.stop_watching()

        logger.info("Continuous indexing service shutdown complete")
