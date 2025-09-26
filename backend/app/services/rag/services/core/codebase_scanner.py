#!/usr/bin/env python3
"""Modular Codebase Scanner for Reynard RAG System

A reusable, high-performance codebase scanner that provides intelligent file discovery,
filtering, and metadata extraction. Designed to be used across different services
without duplication.

🦊 Fox approach: Strategic, efficient, and reusable - like a fox that knows
exactly where to look and what to find!
"""

import logging
import os
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Any, AsyncGenerator, Dict, List, Optional, Set

logger = logging.getLogger(__name__)


@dataclass
class FileInfo:
    """Information about a discovered file."""

    path: str
    relative_path: str
    file_type: str
    language: str
    size: int
    modified_time: float
    metadata: Dict[str, Any]


class CodebaseScanner:
    """Modular, reusable codebase scanner for intelligent file discovery.

    Features:
    - Configurable file type filtering
    - Intelligent directory exclusion
    - Language detection
    - Metadata extraction
    - Progress reporting
    - Performance optimization
    """

    def __init__(self, config: Optional[Dict[str, Any]] = None):
        """Initialize the codebase scanner."""
        self.config = config or {}

        # Default configuration
        self.supported_extensions = self.config.get(
            "supported_extensions",
            {
                '.py',
                '.js',
                '.ts',
                '.tsx',
                '.jsx',
                '.vue',
                '.md',
                '.txt',
                '.json',
                '.yaml',
                '.yml',
                '.toml',
                '.ini',
                '.cfg',
                '.conf',
                '.html',
                '.css',
                '.scss',
                '.sass',
                '.less',
                '.xml',
                '.sql',
            },
        )

        self.excluded_dirs = self.config.get(
            "excluded_dirs",
            {
                '.git',
                '.svn',
                '.hg',
                'node_modules',
                '__pycache__',
                'venv',
                'env',
                '.venv',
                '.env',
                'dist',
                'build',
                'target',
                '.next',
                '.nuxt',
                'coverage',
                '.nyc_output',
                'logs',
                'tmp',
                'temp',
                '.cache',
                '.parcel-cache',
            },
        )

        self.excluded_files = self.config.get(
            "excluded_files",
            {
                '.DS_Store',
                'Thumbs.db',
                '.gitignore',
                '.gitattributes',
                'package-lock.json',
                'yarn.lock',
                'pnpm-lock.yaml',
            },
        )

        self.max_file_size_mb = self.config.get("max_file_size_mb", 10)
        self.batch_size = self.config.get("batch_size", 100)

        # Language detection mapping
        self.language_map = {
            '.py': 'python',
            '.js': 'javascript',
            '.ts': 'typescript',
            '.tsx': 'typescript',
            '.jsx': 'javascript',
            '.vue': 'vue',
            '.md': 'markdown',
            '.json': 'json',
            '.yaml': 'yaml',
            '.yml': 'yaml',
            '.toml': 'toml',
            '.ini': 'ini',
            '.cfg': 'ini',
            '.conf': 'ini',
            '.txt': 'text',
            '.html': 'html',
            '.css': 'css',
            '.scss': 'scss',
            '.sass': 'sass',
            '.less': 'less',
            '.xml': 'xml',
            '.sql': 'sql',
        }

    def _should_scan_directory(self, dir_path: Path) -> bool:
        """Check if a directory should be scanned."""
        dir_name = dir_path.name
        return not (dir_name.startswith('.') or dir_name in self.excluded_dirs)

    def _should_scan_file(self, file_path: Path) -> bool:
        """Check if a file should be scanned."""
        # Check file extension
        if file_path.suffix.lower() not in self.supported_extensions:
            return False

        # Check excluded files
        if file_path.name in self.excluded_files:
            return False

        # Check file size
        try:
            file_size_mb = file_path.stat().st_size / (1024 * 1024)
            if file_size_mb > self.max_file_size_mb:
                return False
        except (OSError, IOError):
            return False

        return True

    def _detect_language(self, file_ext: str) -> str:
        """Detect programming language from file extension."""
        return self.language_map.get(file_ext.lower(), 'text')

    def _extract_file_metadata(self, file_path: Path, base_path: Path) -> FileInfo:
        """Extract metadata from a file."""
        try:
            stat = file_path.stat()
            relative_path = str(file_path.relative_to(base_path))

            return FileInfo(
                path=str(file_path),
                relative_path=relative_path,
                file_type=file_path.suffix[1:] if file_path.suffix else 'unknown',
                language=self._detect_language(file_path.suffix),
                size=stat.st_size,
                modified_time=stat.st_mtime,
                metadata={
                    'file_name': file_path.name,
                    'parent_dir': str(file_path.parent),
                    'depth': len(file_path.relative_to(base_path).parts) - 1,
                    'is_binary': self._is_binary_file(file_path),
                },
            )
        except Exception as e:
            logger.warning(f"Failed to extract metadata for {file_path}: {e}")
            return None

    def _is_binary_file(self, file_path: Path) -> bool:
        """Check if a file is binary."""
        try:
            with open(file_path, 'rb') as f:
                chunk = f.read(1024)
                return b'\0' in chunk
        except Exception:
            return False

    async def scan_codebase(
        self,
        root_path: Optional[str] = None,
        progress_callback: Optional[callable] = None,
    ) -> AsyncGenerator[Dict[str, Any], None]:
        """Scan the codebase and yield file information.

        Args:
            root_path: Root directory to scan (defaults to Reynard project root)
            progress_callback: Optional callback for progress updates

        Yields:
            Dictionary with file information and progress updates
        """
        if root_path is None:
            from app.core.project_root import get_project_root

            root_path = os.getenv(
                "RAG_CONTINUOUS_INDEXING_WATCH_ROOT", str(get_project_root())
            )

        base_path = Path(root_path)
        if not base_path.exists():
            yield {"type": "error", "error": f"Root path does not exist: {root_path}"}
            return

        logger.info(f"🔍 Scanning codebase at: {base_path}")

        files_found = 0
        files_processed = 0
        start_time = time.time()

        try:
            for root, dirs, files in os.walk(base_path):
                root_path_obj = Path(root)

                # Filter directories
                dirs[:] = [
                    d for d in dirs if self._should_scan_directory(root_path_obj / d)
                ]

                for file in files:
                    file_path = root_path_obj / file

                    if self._should_scan_file(file_path):
                        files_found += 1

                        # Extract file metadata
                        file_info = self._extract_file_metadata(file_path, base_path)
                        if file_info:
                            yield {
                                "type": "file",
                                "data": {
                                    "path": file_info.path,
                                    "relative_path": file_info.relative_path,
                                    "file_type": file_info.file_type,
                                    "language": file_info.language,
                                    "size": file_info.size,
                                    "modified_time": file_info.modified_time,
                                    "metadata": file_info.metadata,
                                },
                            }

                            files_processed += 1

                            # Progress reporting
                            if files_processed % self.batch_size == 0:
                                elapsed = time.time() - start_time
                                rate = files_processed / elapsed if elapsed > 0 else 0

                                progress_msg = {
                                    "type": "progress",
                                    "message": f"Scanned {files_processed} files ({rate:.1f} files/sec)",
                                    "files_found": files_found,
                                    "files_processed": files_processed,
                                    "elapsed_time": elapsed,
                                    "scan_rate": rate,
                                }

                                yield progress_msg

                                if progress_callback:
                                    progress_callback(progress_msg)

            # Final summary
            elapsed = time.time() - start_time
            rate = files_processed / elapsed if elapsed > 0 else 0

            yield {
                "type": "complete",
                "message": f"Scan complete. Found {files_found} files, processed {files_processed} files in {elapsed:.2f}s ({rate:.1f} files/sec)",
                "files_found": files_found,
                "files_processed": files_processed,
                "elapsed_time": elapsed,
                "scan_rate": rate,
            }

        except Exception as e:
            logger.error(f"Codebase scan failed: {e}")
            yield {"type": "error", "error": f"Scan failed: {e}"}

    async def scan_and_index(
        self,
        root_path: Optional[str] = None,
        document_processor: Optional[Any] = None,
        vector_store: Optional[Any] = None,
        embedding_service: Optional[Any] = None,
    ) -> AsyncGenerator[Dict[str, Any], None]:
        """Scan the codebase and index documents.

        Args:
            root_path: Root directory to scan
            document_processor: Document processor for content processing
            vector_store: Vector store for document storage
            embedding_service: Embedding service for vector generation

        Yields:
            Dictionary with indexing progress and results
        """
        indexed_count = 0
        failed_count = 0

        async for item in self.scan_codebase(root_path):
            if item["type"] == "file":
                try:
                    file_data = item["data"]

                    # Read file content
                    with open(
                        file_data["path"], 'r', encoding='utf-8', errors='ignore'
                    ) as f:
                        content = f.read()

                    # Create document
                    document = {
                        "id": file_data["relative_path"],
                        "content": content,
                        "metadata": {
                            "file_path": file_data["path"],
                            "relative_path": file_data["relative_path"],
                            "file_type": file_data["file_type"],
                            "language": file_data["language"],
                            "file_size": file_data["size"],
                            "modified_time": file_data["modified_time"],
                            **file_data["metadata"],
                        },
                    }

                    # Process document if processor is available
                    if document_processor:
                        processed_doc = await document_processor.process_document(
                            document
                        )
                        if processed_doc:
                            # Store in vector store if available
                            if vector_store and embedding_service:
                                # Generate embedding
                                embedding = await embedding_service.embed_text(content)

                                # Store document
                                await vector_store.insert_document_embeddings(
                                    [
                                        {
                                            "file_id": document["id"],
                                            "chunk_index": 0,
                                            "text": content,
                                            "embedding": embedding,
                                            "metadata": document["metadata"],
                                        }
                                    ]
                                )

                    indexed_count += 1

                    if indexed_count % 50 == 0:
                        yield {
                            "type": "progress",
                            "message": f"Indexed {indexed_count} files, {failed_count} failed",
                            "indexed": indexed_count,
                            "failed": failed_count,
                        }

                except Exception as e:
                    failed_count += 1
                    logger.warning(f"Failed to index {item['data']['path']}: {e}")

            elif item["type"] in ["progress", "complete", "error"]:
                yield item

        # Final indexing summary
        yield {
            "type": "complete",
            "message": f"Indexing complete. {indexed_count} files indexed, {failed_count} failed.",
            "indexed": indexed_count,
            "failed": failed_count,
        }

    def get_supported_extensions(self) -> Set[str]:
        """Get the set of supported file extensions."""
        return self.supported_extensions.copy()

    def get_excluded_directories(self) -> Set[str]:
        """Get the set of excluded directory names."""
        return self.excluded_dirs.copy()

    def get_excluded_files(self) -> Set[str]:
        """Get the set of excluded file names."""
        return self.excluded_files.copy()

    def get_language_map(self) -> Dict[str, str]:
        """Get the language detection mapping."""
        return self.language_map.copy()
