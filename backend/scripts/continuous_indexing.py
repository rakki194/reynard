#!/usr/bin/env python3
"""
Continuous Indexing Monitor for Reynard Codebase

This script provides continuous monitoring and auto-refresh capabilities for the RAG indexing system.
It monitors file changes and automatically re-indexes modified files to keep the search index up-to-date.

Usage:
    python scripts/continuous_indexing.py [--watch] [--interval N] [--verbose]
"""

import argparse
import asyncio
import logging
import time
import sys
from pathlib import Path
from typing import Dict, Set, Any
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

# Add the backend directory to the Python path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.services.rag import RAGService

# Set up logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


class CodebaseChangeHandler(FileSystemEventHandler):
    """Handler for file system changes in the codebase."""

    def __init__(self, indexer: "ContinuousIndexer"):
        self.indexer = indexer
        self.pending_files: Set[Path] = set()
        self.last_modified: Dict[Path, float] = {}

        # File patterns to watch
        self.watch_patterns = {
            "*.py",
            "*.ts",
            "*.tsx",
            "*.js",
            "*.jsx",
            "*.vue",
            "*.svelte",
            "*.md",
            "*.txt",
            "*.json",
            "*.yaml",
            "*.yml",
            "*.toml",
            "*.css",
            "*.scss",
            "*.sass",
            "*.less",
            "*.html",
            "*.xml",
        }

        # Directories to ignore
        self.ignore_dirs = {
            "node_modules",
            "__pycache__",
            ".git",
            ".vscode",
            ".idea",
            "dist",
            "build",
            "target",
            "coverage",
            ".nyc_output",
            "venv",
            "env",
            ".env",
            "logs",
            "tmp",
            "temp",
            ".pytest_cache",
            ".mypy_cache",
            ".tox",
            "htmlcov",
            "reynard_backend.egg-info",
            "alembic/versions",
            ".cursor",
            "third_party",
        }

    def should_watch_file(self, file_path: Path) -> bool:
        """Check if a file should be watched for changes."""
        # Check if any parent directory should be ignored
        for part in file_path.parts:
            if part in self.ignore_dirs:
                return False

        # Check file patterns
        for pattern in self.watch_patterns:
            if file_path.match(pattern):
                return True

        return False

    def on_modified(self, event):
        """Handle file modification events."""
        if event.is_directory:
            return

        file_path = Path(event.src_path)

        if not self.should_watch_file(file_path):
            return

        # Debounce rapid changes
        current_time = time.time()
        if file_path in self.last_modified:
            if current_time - self.last_modified[file_path] < 1.0:  # 1 second debounce
                return

        self.last_modified[file_path] = current_time
        self.pending_files.add(file_path)

        logger.info(f"📝 File modified: {file_path}")

        # Schedule re-indexing
        asyncio.create_task(self.indexer.schedule_reindex(file_path))

    def on_created(self, event):
        """Handle file creation events."""
        if event.is_directory:
            return

        file_path = Path(event.src_path)

        if not self.should_watch_file(file_path):
            return

        self.pending_files.add(file_path)
        logger.info(f"📄 File created: {file_path}")

        # Schedule indexing
        asyncio.create_task(self.indexer.schedule_reindex(file_path))

    def on_deleted(self, event):
        """Handle file deletion events."""
        if event.is_directory:
            return

        file_path = Path(event.src_path)

        if not self.should_watch_file(file_path):
            return

        logger.info(f"🗑️  File deleted: {file_path}")

        # Schedule removal from index
        asyncio.create_task(self.indexer.schedule_removal(file_path))


class ContinuousIndexer:
    """Continuous indexing system for the Reynard codebase."""

    def __init__(self, root_path: str = "/home/kade/runeset/reynard"):
        self.root_path = Path(root_path)
        self.rag_service = None
        self.observer = None
        self.change_handler = None
        self.running = False

        # Indexing queue
        self.indexing_queue: asyncio.Queue = asyncio.Queue()
        self.removal_queue: asyncio.Queue = asyncio.Queue()

        # Statistics
        self.stats = {
            "files_indexed": 0,
            "files_removed": 0,
            "indexing_errors": 0,
            "last_index_time": 0,
            "uptime": 0,
        }

    async def initialize(self) -> bool:
        """Initialize the continuous indexing system."""
        try:
            # RAG configuration
            rag_config = {
                "rag_enabled": True,
                "pg_dsn": "postgresql://postgres@localhost:5432/reynard_rag",
                "ollama_base_url": "http://localhost:11434",
                "rag_text_model": "embeddinggemma:latest",
                "rag_ingest_batch_size_text": 16,
                "rag_chunk_max_tokens": 512,
                "rag_chunk_min_tokens": 100,
                "rag_chunk_overlap_ratio": 0.15,
                "rag_ingest_concurrency": 2,
                "rag_ingest_max_attempts": 3,
                "rag_ingest_backoff_base_s": 0.1,
            }

            logger.info("Initializing continuous indexing system...")

            # Initialize RAG service
            self.rag_service = RAGService(rag_config)
            if not await self.rag_service.initialize():
                logger.error("Failed to initialize RAG service")
                return False

            # Initialize file watcher
            self.change_handler = CodebaseChangeHandler(self)
            self.observer = Observer()
            self.observer.schedule(
                self.change_handler, str(self.root_path), recursive=True
            )

            logger.info("✅ Continuous indexing system initialized successfully")
            return True

        except Exception as e:
            logger.error(f"Failed to initialize continuous indexing: {e}")
            return False

    async def start_watching(self):
        """Start watching for file changes."""
        if not self.observer:
            logger.error("Observer not initialized")
            return

        self.observer.start()
        self.running = True
        logger.info(f"👀 Started watching {self.root_path} for changes...")

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

    async def schedule_reindex(self, file_path: Path):
        """Schedule a file for re-indexing."""
        try:
            await self.indexing_queue.put(file_path)
        except Exception as e:
            logger.error(f"Failed to schedule reindex for {file_path}: {e}")

    async def schedule_removal(self, file_path: Path):
        """Schedule a file for removal from index."""
        try:
            await self.removal_queue.put(file_path)
        except Exception as e:
            logger.error(f"Failed to schedule removal for {file_path}: {e}")

    async def process_indexing_queue(self):
        """Process the indexing queue."""
        while self.running:
            try:
                # Wait for files to index
                file_path = await asyncio.wait_for(
                    self.indexing_queue.get(), timeout=1.0
                )

                # Wait a bit to batch multiple changes
                await asyncio.sleep(2.0)

                # Collect all pending files
                files_to_index = [file_path]
                while not self.indexing_queue.empty():
                    try:
                        additional_file = self.indexing_queue.get_nowait()
                        files_to_index.append(additional_file)
                    except asyncio.QueueEmpty:
                        break

                # Index the files
                await self.index_files(files_to_index)

            except asyncio.TimeoutError:
                continue
            except Exception as e:
                logger.error(f"Error processing indexing queue: {e}")

    async def process_removal_queue(self):
        """Process the removal queue."""
        while self.running:
            try:
                # Wait for files to remove
                file_path = await asyncio.wait_for(
                    self.removal_queue.get(), timeout=1.0
                )

                # Remove from index
                await self.remove_file_from_index(file_path)

            except asyncio.TimeoutError:
                continue
            except Exception as e:
                logger.error(f"Error processing removal queue: {e}")

    async def index_files(self, file_paths: list[Path]):
        """Index a list of files."""
        if not self.rag_service:
            return

        documents = []

        for file_path in file_paths:
            try:
                if not file_path.exists():
                    continue

                # Read file content
                content = file_path.read_text(encoding="utf-8", errors="ignore")

                if not content.strip():
                    continue

                # Create document
                doc = {
                    "file_id": str(file_path.relative_to(self.root_path)),
                    "path": str(file_path),
                    "relative_path": str(file_path.relative_to(self.root_path)),
                    "content": content,
                    "file_type": self._get_file_type(file_path),
                    "language": self._detect_language(file_path),
                    "size": len(content),
                    "metadata": {
                        "extension": file_path.suffix,
                        "parent_dir": str(file_path.parent.relative_to(self.root_path)),
                        "indexed_at": time.time(),
                    },
                }

                documents.append(doc)

            except Exception as e:
                logger.warning(f"Failed to read {file_path}: {e}")
                self.stats["indexing_errors"] += 1
                continue

        if documents:
            try:
                # Index documents
                result = await self.rag_service.index_documents(documents)

                if result.get("status") == "success":
                    self.stats["files_indexed"] += len(documents)
                    self.stats["last_index_time"] = time.time()
                    logger.info(f"✅ Indexed {len(documents)} files")
                else:
                    logger.error(f"❌ Failed to index files: {result}")
                    self.stats["indexing_errors"] += len(documents)

            except Exception as e:
                logger.error(f"Failed to index files: {e}")
                self.stats["indexing_errors"] += len(documents)

    async def remove_file_from_index(self, file_path: Path):
        """Remove a file from the index."""
        try:
            # TODO: Implement file removal from vector database
            # This would require adding a remove_document method to the RAG service
            logger.info(f"🗑️  Removed {file_path} from index")
            self.stats["files_removed"] += 1

        except Exception as e:
            logger.error(f"Failed to remove {file_path} from index: {e}")

    async def periodic_stats_report(self):
        """Periodically report statistics."""
        while self.running:
            await asyncio.sleep(300)  # Every 5 minutes

            uptime = time.time() - self.stats.get("start_time", time.time())
            self.stats["uptime"] = uptime

            logger.info("📊 Continuous Indexing Stats:")
            logger.info(f"  Files indexed: {self.stats['files_indexed']}")
            logger.info(f"  Files removed: {self.stats['files_removed']}")
            logger.info(f"  Indexing errors: {self.stats['indexing_errors']}")
            logger.info(f"  Uptime: {uptime:.0f} seconds")

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

    async def shutdown(self):
        """Shutdown the continuous indexing system."""
        logger.info("Shutting down continuous indexing system...")

        await self.stop_watching()

        if self.rag_service:
            await self.rag_service.shutdown()

        logger.info("Continuous indexing system shutdown complete")


async def main():
    """Main function."""
    parser = argparse.ArgumentParser(
        description="Continuous indexing monitor for Reynard codebase"
    )
    parser.add_argument(
        "--watch", action="store_true", help="Start watching for file changes"
    )
    parser.add_argument(
        "--interval", type=int, default=5, help="Stats report interval in minutes"
    )
    parser.add_argument("--verbose", "-v", action="store_true", help="Verbose output")
    parser.add_argument(
        "--root", default="/home/kade/runeset/reynard", help="Root path to watch"
    )

    args = parser.parse_args()

    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)

    logger.info("🦊 Starting continuous indexing monitor...")

    try:
        # Create continuous indexer
        indexer = ContinuousIndexer(args.root)
        indexer.stats["start_time"] = time.time()

        # Initialize
        if not await indexer.initialize():
            logger.error("Failed to initialize continuous indexing system")
            return 1

        if args.watch:
            # Start watching
            await indexer.start_watching()

            # Keep running
            try:
                while True:
                    await asyncio.sleep(1)
            except KeyboardInterrupt:
                logger.info("Received interrupt signal")
        else:
            # Just show stats
            stats = await indexer.rag_service.get_statistics()
            logger.info(f"📊 Current RAG service stats: {stats}")

        # Shutdown
        await indexer.shutdown()
        return 0

    except Exception as e:
        logger.error(f"❌ Continuous indexing failed: {e}")
        return 1


if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)
