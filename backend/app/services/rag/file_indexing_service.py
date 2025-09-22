#!/usr/bin/env python3
"""
File Indexing and Caching Service
=================================

A high-performance file indexing and caching service that provides fast file discovery,
content caching, and text-based search capabilities. Designed for development environments
and resource-constrained systems.

🔥 Phoenix approach: We rise from the ashes of slow filesystem scanning to soar
with efficient, intelligent file indexing and caching!
"""

import asyncio
import hashlib
import logging
import time
from pathlib import Path
from typing import Any, Dict, List, Optional

logger = logging.getLogger(__name__)


class FileIndexingService:
    """
    High-performance file indexing and caching service.

    Provides:
    - Fast file discovery and indexing
    - Text-based search capabilities
    - Intelligent content caching
    - Performance monitoring
    - Efficient file metadata storage
    """

    def __init__(self):
        """Initialize the file indexing service."""
        self.enabled = True
        self._file_index = {}
        self._text_index = {}
        self._content_cache = {}
        self._stats = {
            "files_indexed": 0,
            "searches_performed": 0,
            "cache_hits": 0,
            "cache_misses": 0,
            "total_search_time": 0.0,
        }

    async def initialize(self, config: Dict[str, Any]) -> bool:
        """Initialize the file indexing service."""
        try:
            self.enabled = config.get("file_indexing_enabled", True)
            if not self.enabled:
                logger.info("🔥 File indexing service disabled by config")
                return True

            logger.info("🔥 File indexing service initialized successfully")
            return True

        except Exception as e:
            logger.error("🔥 Failed to initialize file indexing service: %s", e)
            return False

    async def index_files(
        self, directories: List[str], file_types: List[str]
    ) -> Dict[str, Any]:
        """
        Index files in specified directories for fast discovery.

        This replaces the need for heavy vector embeddings with efficient
        file indexing and text-based search capabilities.
        """
        start_time = time.time()
        indexed_files = []

        for directory in directories:
            dir_path = Path(directory)
            if not dir_path.exists():
                continue

            for file_path in dir_path.rglob("*"):
                if file_path.is_file() and file_path.suffix.lower() in file_types:
                    try:
                        # Read file content for indexing
                        with open(file_path, "r", encoding="utf-8") as f:
                            content = f.read()

                        # Create file index entry
                        file_info = {
                            "path": str(file_path),
                            "size": file_path.stat().st_size,
                            "modified": file_path.stat().st_mtime,
                            "content_hash": hashlib.md5(content.encode()).hexdigest(),
                            "lines": len(content.splitlines()),
                            "content": content,
                        }

                        self._file_index[str(file_path)] = file_info

                        # Create text index for search
                        self._build_text_index(str(file_path), content)

                        indexed_files.append(str(file_path))

                    except Exception as e:
                        logger.debug("Failed to index %s: %s", file_path, e)
                        continue

        self._stats["files_indexed"] += len(indexed_files)
        index_time = time.time() - start_time

        logger.info(
            "🔥 Indexed %d files in %.2f seconds", len(indexed_files), index_time
        )

        return {
            "success": True,
            "indexed_files": len(indexed_files),
            "index_time": index_time,
            "files": indexed_files,
        }

    def _build_text_index(self, file_path: str, content: str) -> None:
        """Build a simple text index for fast searching."""
        lines = content.splitlines()
        for line_num, line in enumerate(lines, 1):
            words = line.lower().split()
            for word in words:
                if word not in self._text_index:
                    self._text_index[word] = []
                self._text_index[word].append(
                    {
                        "file": file_path,
                        "line": line_num,
                        "content": line.strip(),
                    }
                )

    async def search_files(self, query: str, max_results: int = 20) -> List[str]:
        """
        Search for files using text-based search.

        This provides fast file discovery without needing vector embeddings.
        """
        start_time = time.time()
        query_lower = query.lower()
        query_words = query_lower.split()

        # Score files based on query word matches
        file_scores = {}

        for word in query_words:
            if word in self._text_index:
                for match in self._text_index[word]:
                    file_path = match["file"]
                    if file_path not in file_scores:
                        file_scores[file_path] = 0
                    file_scores[file_path] += 1

        # Sort by score and return top results
        sorted_files = sorted(file_scores.items(), key=lambda x: x[1], reverse=True)
        max_results_int = int(max_results) if max_results is not None else 100
        results = [file_path for file_path, score in sorted_files[:max_results_int]]

        search_time = time.time() - start_time
        self._stats["searches_performed"] += 1
        self._stats["total_search_time"] += search_time

        logger.debug(
            "🔥 Text search found %d files in %.3f seconds", len(results), search_time
        )

        return results

    async def get_file_content(self, file_path: str) -> Optional[str]:
        """Get file content from the index."""
        if file_path in self._file_index:
            return self._file_index[file_path]["content"]
        return None

    async def get_file_metadata(self, file_path: str) -> Optional[Dict[str, Any]]:
        """Get file metadata from the index."""
        if file_path in self._file_index:
            file_info = self._file_index[file_path].copy()
            # Remove content to save memory
            file_info.pop("content", None)
            return file_info
        return None

    async def get_cached_content(self, file_path: str) -> Optional[str]:
        """Get cached file content if available."""
        if file_path in self._content_cache:
            self._stats["cache_hits"] += 1
            return self._content_cache[file_path]

        self._stats["cache_misses"] += 1
        return None

    async def cache_content(self, file_path: str, content: str) -> None:
        """Cache file content for fast access."""
        self._content_cache[file_path] = content

    async def get_stats(self) -> Dict[str, Any]:
        """Get service statistics."""
        avg_search_time = (
            self._stats["total_search_time"] / self._stats["searches_performed"]
            if self._stats["searches_performed"] > 0
            else 0.0
        )

        cache_hit_rate = (
            self._stats["cache_hits"]
            / (self._stats["cache_hits"] + self._stats["cache_misses"])
            * 100
            if (self._stats["cache_hits"] + self._stats["cache_misses"]) > 0
            else 0.0
        )

        return {
            "service_type": "file_indexing",
            "enabled": self.enabled,
            "files_indexed": self._stats["files_indexed"],
            "searches_performed": self._stats["searches_performed"],
            "avg_search_time_ms": avg_search_time * 1000,
            "cache_hit_rate": cache_hit_rate,
            "text_index_size": len(self._text_index),
            "file_index_size": len(self._file_index),
            "content_cache_size": len(self._content_cache),
        }

    async def health_check(self) -> bool:
        """Perform health check."""
        return self.enabled and len(self._file_index) >= 0

    async def shutdown(self) -> None:
        """Shutdown the service."""
        logger.info("🔥 File indexing service shutting down")
        self._file_index.clear()
        self._text_index.clear()
        self._content_cache.clear()


# Global instance
_file_indexing_service = None


def get_file_indexing_service() -> FileIndexingService:
    """Get the global file indexing service instance."""
    global _file_indexing_service
    if _file_indexing_service is None:
        _file_indexing_service = FileIndexingService()
    return _file_indexing_service
