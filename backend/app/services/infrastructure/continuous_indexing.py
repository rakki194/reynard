"""Continuous Indexing Service for Reynard Backend.

This module provides continuous monitoring and indexing of the codebase for search and analysis.
"""

import asyncio
import hashlib
import json
import logging
import os
import uuid
from dataclasses import asdict, dataclass
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any

# File monitoring imports
try:
    from watchdog.events import FileSystemEventHandler
    from watchdog.observers import Observer

    WATCHDOG_AVAILABLE = True
except ImportError:
    WATCHDOG_AVAILABLE = False

# Text processing imports
try:
    import pygments
    from pygments.formatters import RawTokenFormatter
    from pygments.lexers import get_lexer_for_filename, guess_lexer_for_filename
    from pygments.util import ClassNotFound

    PYGMENTS_AVAILABLE = True
except ImportError:
    PYGMENTS_AVAILABLE = False

# Search imports
try:
    from whoosh import index
    from whoosh.fields import DATETIME, ID, NUMERIC, TEXT, Schema
    from whoosh.qparser import MultifieldParser, QueryParser
    from whoosh.query import And, Every, Or, Term
    from whoosh.writing import AsyncWriter

    WHOOSH_AVAILABLE = True
except ImportError:
    WHOOSH_AVAILABLE = False

logger = logging.getLogger(__name__)


@dataclass
class IndexedFile:
    """Indexed file data structure."""

    file_id: str
    file_path: str
    relative_path: str
    file_hash: str
    file_size: int
    last_modified: datetime
    file_type: str
    language: str | None = None
    content: str = ""
    tokens: list[str] = None
    metadata: dict[str, Any] = None
    indexed_at: datetime = None
    is_deleted: bool = False

    def __post_init__(self):
        if self.tokens is None:
            self.tokens = []
        if self.metadata is None:
            self.metadata = {}
        if self.indexed_at is None:
            self.indexed_at = datetime.now()


@dataclass
class IndexingConfig:
    """Indexing configuration."""

    watch_directories: list[str] = None
    exclude_patterns: list[str] = None
    include_extensions: list[str] = None
    max_file_size_mb: int = 10
    index_interval_seconds: int = 30
    batch_size: int = 100
    enable_syntax_highlighting: bool = True
    enable_tokenization: bool = True
    enable_metadata_extraction: bool = True
    auto_cleanup_days: int = 30

    def __post_init__(self):
        if self.watch_directories is None:
            self.watch_directories = ["src", "packages", "backend"]
        if self.exclude_patterns is None:
            self.exclude_patterns = [
                "*.pyc",
                "*.pyo",
                "__pycache__",
                ".git",
                "node_modules",
                ".venv",
                "venv",
                ".env",
                "*.log",
                "*.tmp",
                "*.swp",
                "*.swo",
                "*~",
            ]
        if self.include_extensions is None:
            self.include_extensions = [
                ".py",
                ".js",
                ".ts",
                ".tsx",
                ".jsx",
                ".vue",
                ".html",
                ".css",
                ".scss",
                ".sass",
                ".less",
                ".json",
                ".yaml",
                ".yml",
                ".toml",
                ".md",
                ".txt",
                ".xml",
                ".sql",
                ".sh",
                ".bash",
                ".zsh",
                ".fish",
                ".ps1",
                ".bat",
                ".cmd",
            ]


@dataclass
class SearchResult:
    """Search result data structure."""

    file_id: str
    file_path: str
    relative_path: str
    score: float
    highlights: list[str] = None
    context: str = ""
    matched_terms: list[str] = None

    def __post_init__(self):
        if self.highlights is None:
            self.highlights = []
        if self.matched_terms is None:
            self.matched_terms = []


class FileChangeHandler(FileSystemEventHandler):
    """Handler for file system changes."""

    def __init__(self, indexing_service):
        self.indexing_service = indexing_service

    def on_modified(self, event):
        if not event.is_directory:
            self.indexing_service._queue_file_for_indexing(event.src_path)

    def on_created(self, event):
        if not event.is_directory:
            self.indexing_service._queue_file_for_indexing(event.src_path)

    def on_deleted(self, event):
        if not event.is_directory:
            self.indexing_service._queue_file_for_deletion(event.src_path)

    def on_moved(self, event):
        if not event.is_directory:
            self.indexing_service._queue_file_for_deletion(event.src_path)
            self.indexing_service._queue_file_for_indexing(event.dest_path)


class ContinuousIndexingService:
    """Service for continuous codebase indexing and search."""

    def __init__(
        self,
        config: IndexingConfig | None = None,
        data_dir: str = "data/indexing",
    ):
        self.config = config or IndexingConfig()
        self.data_dir = Path(data_dir)
        self.data_dir.mkdir(parents=True, exist_ok=True)

        # Storage directories
        self.index_dir = self.data_dir / "index"
        self.index_dir.mkdir(exist_ok=True)
        self.metadata_dir = self.data_dir / "metadata"
        self.metadata_dir.mkdir(exist_ok=True)

        # File monitoring
        self.observer = None
        self.file_handler = None
        self.is_monitoring = False

        # Indexing state
        self.indexed_files: dict[str, IndexedFile] = {}
        self.pending_files: set[str] = set()
        self.deleted_files: set[str] = set()
        self.index_lock = asyncio.Lock()

        # Search index
        self.search_index = None
        self.index_schema = None

        # Load existing data
        self._load_metadata()
        self._setup_search_index()

    def _load_metadata(self) -> None:
        """Load existing file metadata."""
        try:
            metadata_file = self.data_dir / "metadata.json"
            if metadata_file.exists():
                with open(metadata_file, encoding="utf-8") as f:
                    metadata_data = json.load(f)
                    self.indexed_files = {
                        file_id: IndexedFile(**file_data)
                        for file_id, file_data in metadata_data.items()
                    }
            else:
                self.indexed_files = {}
        except Exception as e:
            logger.error(f"Failed to load indexing metadata: {e}")
            self.indexed_files = {}

    def _save_metadata(self) -> None:
        """Save file metadata to storage."""
        try:
            metadata_file = self.data_dir / "metadata.json"
            metadata_data = {
                file_id: asdict(file_data)
                for file_id, file_data in self.indexed_files.items()
            }

            # Convert datetime objects to ISO strings
            for file_data in metadata_data.values():
                for key, value in file_data.items():
                    if isinstance(value, datetime):
                        file_data[key] = value.isoformat()

            with open(metadata_file, "w", encoding="utf-8") as f:
                json.dump(metadata_data, f, indent=2, default=str)

        except Exception as e:
            logger.error(f"Failed to save indexing metadata: {e}")

    def _setup_search_index(self) -> None:
        """Setup search index schema and index."""
        try:
            if not WHOOSH_AVAILABLE:
                logger.warning("Whoosh not available, search functionality disabled")
                return

            # Define schema
            self.index_schema = Schema(
                file_id=ID(stored=True, unique=True),
                file_path=TEXT(stored=True),
                relative_path=TEXT(stored=True),
                content=TEXT(stored=True),
                language=TEXT(stored=True),
                file_type=TEXT(stored=True),
                tokens=TEXT(stored=True),
                metadata=TEXT(stored=True),
                indexed_at=DATETIME(stored=True),
                file_size=NUMERIC(stored=True),
            )

            # Create or open index
            if self.index_dir.exists() and index.exists_in(str(self.index_dir)):
                self.search_index = index.open_dir(str(self.index_dir))
            else:
                self.search_index = index.create_in(
                    str(self.index_dir), self.index_schema,
                )

            logger.info("Search index initialized")

        except Exception as e:
            logger.error(f"Failed to setup search index: {e}")
            self.search_index = None

    def _should_index_file(self, file_path: str) -> bool:
        """Check if a file should be indexed."""
        try:
            file_path_obj = Path(file_path)

            # Check file size
            if file_path_obj.exists():
                file_size_mb = file_path_obj.stat().st_size / (1024 * 1024)
                if file_size_mb > self.config.max_file_size_mb:
                    return False

            # Check extension
            if file_path_obj.suffix.lower() not in self.config.include_extensions:
                return False

            # Check exclude patterns
            for pattern in self.config.exclude_patterns:
                if file_path_obj.match(pattern):
                    return False

            return True

        except Exception as e:
            logger.error(f"Error checking file {file_path}: {e}")
            return False

    def _calculate_file_hash(self, file_path: str) -> str:
        """Calculate SHA256 hash of a file."""
        try:
            hash_sha256 = hashlib.sha256()
            with open(file_path, "rb") as f:
                for chunk in iter(lambda: f.read(4096), b""):
                    hash_sha256.update(chunk)
            return hash_sha256.hexdigest()
        except Exception as e:
            logger.error(f"Failed to calculate hash for {file_path}: {e}")
            return ""

    def _extract_file_metadata(self, file_path: str) -> dict[str, Any]:
        """Extract metadata from a file."""
        try:
            file_path_obj = Path(file_path)
            stat = file_path_obj.stat()

            metadata = {
                "file_name": file_path_obj.name,
                "file_extension": file_path_obj.suffix,
                "file_size": stat.st_size,
                "created_at": datetime.fromtimestamp(stat.st_ctime).isoformat(),
                "modified_at": datetime.fromtimestamp(stat.st_mtime).isoformat(),
                "is_executable": os.access(file_path, os.X_OK),
                "is_readable": os.access(file_path, os.R_OK),
                "is_writable": os.access(file_path, os.W_OK),
            }

            # Add language detection
            if PYGMENTS_AVAILABLE:
                try:
                    lexer = get_lexer_for_filename(file_path)
                    metadata["language"] = lexer.name
                except ClassNotFound:
                    try:
                        with open(
                            file_path, encoding="utf-8", errors="ignore",
                        ) as f:
                            content = f.read(1024)  # Read first 1KB
                        lexer = guess_lexer_for_filename(file_path, content)
                        metadata["language"] = lexer.name
                    except:
                        metadata["language"] = "unknown"
            else:
                metadata["language"] = "unknown"

            return metadata

        except Exception as e:
            logger.error(f"Failed to extract metadata for {file_path}: {e}")
            return {}

    def _tokenize_content(self, content: str, language: str) -> list[str]:
        """Tokenize file content."""
        try:
            if not PYGMENTS_AVAILABLE or not self.config.enable_tokenization:
                # Simple tokenization fallback
                import re

                # Remove comments and strings for better tokenization
                if language.lower() in ["python", "javascript", "typescript"]:
                    # Remove single-line comments
                    content = re.sub(r"//.*$", "", content, flags=re.MULTILINE)
                    # Remove multi-line comments
                    content = re.sub(r"/\*.*?\*/", "", content, flags=re.DOTALL)
                    # Remove string literals
                    content = re.sub(r'"[^"]*"', "", content)
                    content = re.sub(r"'[^']*'", "", content)

                # Extract tokens
                tokens = re.findall(r"\b[a-zA-Z_][a-zA-Z0-9_]*\b", content)
                return list(set(tokens))  # Remove duplicates

            # Use Pygments for better tokenization
            try:
                lexer = get_lexer_for_filename(f"file.{language.lower()}")
                formatter = RawTokenFormatter()
                tokens = pygments.lex(content, lexer)
                return [token[1] for token in tokens if token[1].strip()]
            except:
                # Fallback to simple tokenization
                import re

                tokens = re.findall(r"\b[a-zA-Z_][a-zA-Z0-9_]*\b", content)
                return list(set(tokens))

        except Exception as e:
            logger.error(f"Failed to tokenize content: {e}")
            return []

    async def index_file(self, file_path: str) -> IndexedFile | None:
        """Index a single file.

        Args:
            file_path: Path to the file to index

        Returns:
            IndexedFile object if successful, None otherwise

        """
        try:
            if not self._should_index_file(file_path):
                return None

            file_path_obj = Path(file_path)
            if not file_path_obj.exists():
                return None

            # Calculate file hash
            file_hash = self._calculate_file_hash(file_path)

            # Check if file is already indexed and unchanged
            for existing_file in self.indexed_files.values():
                if (
                    existing_file.file_path == file_path
                    and existing_file.file_hash == file_hash
                    and not existing_file.is_deleted
                ):
                    return existing_file

            # Read file content
            try:
                with open(file_path, encoding="utf-8", errors="ignore") as f:
                    content = f.read()
            except Exception as e:
                logger.error(f"Failed to read file {file_path}: {e}")
                return None

            # Extract metadata
            metadata = self._extract_file_metadata(file_path)

            # Tokenize content
            tokens = self._tokenize_content(
                content, metadata.get("language", "unknown"),
            )

            # Create indexed file
            indexed_file = IndexedFile(
                file_id=str(uuid.uuid4()),
                file_path=str(file_path_obj.absolute()),
                relative_path=str(file_path_obj.relative_to(Path.cwd())),
                file_hash=file_hash,
                file_size=file_path_obj.stat().st_size,
                last_modified=datetime.fromtimestamp(file_path_obj.stat().st_mtime),
                file_type=file_path_obj.suffix.lower(),
                language=metadata.get("language"),
                content=content,
                tokens=tokens,
                metadata=metadata,
            )

            # Store in memory
            self.indexed_files[indexed_file.file_id] = indexed_file

            # Add to search index
            if self.search_index:
                await self._add_to_search_index(indexed_file)

            # Save metadata
            self._save_metadata()

            logger.info(f"Indexed file: {file_path}")
            return indexed_file

        except Exception as e:
            logger.error(f"Failed to index file {file_path}: {e}")
            return None

    async def _add_to_search_index(self, indexed_file: IndexedFile) -> None:
        """Add a file to the search index."""
        try:
            if not self.search_index:
                return

            writer = self.search_index.writer()
            try:
                writer.update_document(
                    file_id=indexed_file.file_id,
                    file_path=indexed_file.file_path,
                    relative_path=indexed_file.relative_path,
                    content=indexed_file.content,
                    language=indexed_file.language or "",
                    file_type=indexed_file.file_type,
                    tokens=" ".join(indexed_file.tokens),
                    metadata=json.dumps(indexed_file.metadata),
                    indexed_at=indexed_file.indexed_at,
                    file_size=indexed_file.file_size,
                )
                writer.commit()
            except Exception as e:
                writer.cancel()
                raise e

        except Exception as e:
            logger.error(f"Failed to add file to search index: {e}")

    async def remove_file_from_index(self, file_path: str) -> bool:
        """Remove a file from the index.

        Args:
            file_path: Path to the file to remove

        Returns:
            True if successful

        """
        try:
            # Find the file in indexed files
            file_to_remove = None
            for file_id, indexed_file in self.indexed_files.items():
                if indexed_file.file_path == file_path:
                    file_to_remove = indexed_file
                    break

            if not file_to_remove:
                return False

            # Mark as deleted
            file_to_remove.is_deleted = True

            # Remove from search index
            if self.search_index:
                writer = self.search_index.writer()
                try:
                    writer.delete_by_term("file_id", file_to_remove.file_id)
                    writer.commit()
                except Exception as e:
                    writer.cancel()
                    raise e

            # Save metadata
            self._save_metadata()

            logger.info(f"Removed file from index: {file_path}")
            return True

        except Exception as e:
            logger.error(f"Failed to remove file from index: {e}")
            return False

    def _queue_file_for_indexing(self, file_path: str) -> None:
        """Queue a file for indexing."""
        self.pending_files.add(file_path)

    def _queue_file_for_deletion(self, file_path: str) -> None:
        """Queue a file for deletion from index."""
        self.deleted_files.add(file_path)

    async def start_monitoring(self) -> None:
        """Start file system monitoring."""
        try:
            if not WATCHDOG_AVAILABLE:
                logger.warning("Watchdog not available, file monitoring disabled")
                return

            if self.is_monitoring:
                return

            # Create file handler
            self.file_handler = FileChangeHandler(self)

            # Create observer
            self.observer = Observer()
            for directory in self.config.watch_directories:
                if Path(directory).exists():
                    self.observer.schedule(self.file_handler, directory, recursive=True)
                    logger.info(f"Monitoring directory: {directory}")

            # Start observer
            self.observer.start()
            self.is_monitoring = True

            # Start background indexing task
            asyncio.create_task(self._background_indexing_task())

            logger.info("File system monitoring started")

        except Exception as e:
            logger.error(f"Failed to start monitoring: {e}")

    async def stop_monitoring(self) -> None:
        """Stop file system monitoring."""
        try:
            if not self.is_monitoring:
                return

            if self.observer:
                self.observer.stop()
                self.observer.join()
                self.observer = None

            self.is_monitoring = False
            logger.info("File system monitoring stopped")

        except Exception as e:
            logger.error(f"Failed to stop monitoring: {e}")

    async def _background_indexing_task(self) -> None:
        """Background task for processing queued files."""
        while self.is_monitoring:
            try:
                # Process pending files
                if self.pending_files:
                    async with self.index_lock:
                        files_to_process = list(self.pending_files)[
                            : self.config.batch_size
                        ]
                        self.pending_files -= set(files_to_process)

                    for file_path in files_to_process:
                        await self.index_file(file_path)

                # Process deleted files
                if self.deleted_files:
                    async with self.index_lock:
                        files_to_delete = list(self.deleted_files)[
                            : self.config.batch_size
                        ]
                        self.deleted_files -= set(files_to_delete)

                    for file_path in files_to_delete:
                        await self.remove_file_from_index(file_path)

                # Wait before next iteration
                await asyncio.sleep(self.config.index_interval_seconds)

            except Exception as e:
                logger.error(f"Error in background indexing task: {e}")
                await asyncio.sleep(self.config.index_interval_seconds)

    async def search(
        self,
        query: str,
        limit: int = 20,
        file_types: list[str] | None = None,
        languages: list[str] | None = None,
    ) -> list[SearchResult]:
        """Search the indexed files.

        Args:
            query: Search query
            limit: Maximum number of results
            file_types: Filter by file types
            languages: Filter by languages

        Returns:
            List of SearchResult objects

        """
        try:
            if not self.search_index:
                logger.warning("Search index not available")
                return []

            with self.search_index.searcher() as searcher:
                # Build query
                if query.strip():
                    # Use multifield parser for better search
                    parser = MultifieldParser(
                        ["content", "tokens", "file_path", "relative_path"],
                        schema=self.index_schema,
                    )
                    search_query = parser.parse(query)
                else:
                    search_query = Every()

                # Add filters
                filters = []
                if file_types:
                    file_type_filter = Or([Term("file_type", ft) for ft in file_types])
                    filters.append(file_type_filter)

                if languages:
                    language_filter = Or([Term("language", lang) for lang in languages])
                    filters.append(language_filter)

                if filters:
                    search_query = And([search_query] + filters)

                # Execute search
                results = searcher.search(search_query, limit=limit)

                # Convert to SearchResult objects
                search_results = []
                for hit in results:
                    result = SearchResult(
                        file_id=hit["file_id"],
                        file_path=hit["file_path"],
                        relative_path=hit["relative_path"],
                        score=hit.score,
                        context=hit["content"][:500],  # First 500 characters
                        highlights=(
                            hit.highlights("content")
                            if hasattr(hit, "highlights")
                            else []
                        ),
                        matched_terms=query.split(),
                    )
                    search_results.append(result)

                return search_results

        except Exception as e:
            logger.error(f"Search failed: {e}")
            return []

    async def get_file_statistics(self) -> dict[str, Any]:
        """Get statistics about indexed files.

        Returns:
            Dictionary containing statistics

        """
        try:
            total_files = len(self.indexed_files)
            active_files = len(
                [f for f in self.indexed_files.values() if not f.is_deleted],
            )
            deleted_files = total_files - active_files

            # File type distribution
            file_types = {}
            languages = {}
            total_size = 0

            for file_data in self.indexed_files.values():
                if not file_data.is_deleted:
                    # File types
                    file_type = file_data.file_type or "unknown"
                    file_types[file_type] = file_types.get(file_type, 0) + 1

                    # Languages
                    language = file_data.language or "unknown"
                    languages[language] = languages.get(language, 0) + 1

                    # Total size
                    total_size += file_data.file_size

            # Recent activity
            recent_files = [
                f
                for f in self.indexed_files.values()
                if f.indexed_at and f.indexed_at > datetime.now() - timedelta(days=1)
            ]

            statistics = {
                "total_files": total_files,
                "active_files": active_files,
                "deleted_files": deleted_files,
                "total_size_bytes": total_size,
                "total_size_mb": total_size / (1024 * 1024),
                "file_types": file_types,
                "languages": languages,
                "recent_files_count": len(recent_files),
                "is_monitoring": self.is_monitoring,
                "search_index_available": self.search_index is not None,
                "pending_files": len(self.pending_files),
                "deleted_files_queue": len(self.deleted_files),
            }

            return statistics

        except Exception as e:
            logger.error(f"Failed to get file statistics: {e}")
            return {}

    async def cleanup_old_files(self) -> int:
        """Clean up old deleted files from the index.

        Returns:
            Number of files cleaned up

        """
        try:
            cutoff_date = datetime.now() - timedelta(days=self.config.auto_cleanup_days)
            files_to_remove = []

            for file_id, file_data in self.indexed_files.items():
                if file_data.is_deleted and file_data.indexed_at < cutoff_date:
                    files_to_remove.append(file_id)

            # Remove files
            for file_id in files_to_remove:
                del self.indexed_files[file_id]

            # Save metadata
            if files_to_remove:
                self._save_metadata()

            logger.info(f"Cleaned up {len(files_to_remove)} old files")
            return len(files_to_remove)

        except Exception as e:
            logger.error(f"Failed to cleanup old files: {e}")
            return 0

    async def rebuild_index(self) -> int:
        """Rebuild the entire search index.

        Returns:
            Number of files indexed

        """
        try:
            if not self.search_index:
                logger.warning("Search index not available")
                return 0

            # Clear existing index
            self.search_index = index.create_in(str(self.index_dir), self.index_schema)

            # Re-index all active files
            indexed_count = 0
            for file_data in self.indexed_files.values():
                if not file_data.is_deleted:
                    await self._add_to_search_index(file_data)
                    indexed_count += 1

            logger.info(f"Rebuilt index with {indexed_count} files")
            return indexed_count

        except Exception as e:
            logger.error(f"Failed to rebuild index: {e}")
            return 0


# Global continuous indexing service instance
continuous_indexing_service = ContinuousIndexingService()
