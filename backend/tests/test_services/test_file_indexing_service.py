"""🔥 File Indexing Service Tests
==============================

Comprehensive pytest tests for the file indexing and caching service.
Tests all core functionality including file discovery, indexing, searching,
caching, and performance metrics.

Author: Phoenix-Prime-94
Version: 1.0.0
"""

import asyncio
import tempfile
from pathlib import Path

import pytest
import pytest_asyncio

from app.config.file_indexing_config import get_file_indexing_config
from app.services.rag.file_indexing_service import get_file_indexing_service


class TestFileIndexingService:
    """Test suite for FileIndexingService."""

    @pytest_asyncio.fixture
    async def file_indexing_service(self):
        """Create a file indexing service instance for testing."""
        service = get_file_indexing_service()
        config = get_file_indexing_config()
        config.update(
            {
                "file_indexing_enabled": True,
                "caching_enabled": True,
                "file_indexing_batch_size": 10,
                "content_cache_max_size": 100,
            },
        )

        await service.initialize(config)
        yield service
        await service.shutdown()

    @pytest.fixture
    def temp_directory(self):
        """Create a temporary directory with test files."""
        with tempfile.TemporaryDirectory() as temp_dir:
            temp_path = Path(temp_dir)

            # Create test files
            (temp_path / "test1.py").write_text(
                """
def hello_world():
    '''A simple hello world function.'''
    return "Hello, World!"

class TestClass:
    def __init__(self):
        self.value = 42
""",
            )

            (temp_path / "test2.py").write_text(
                """
import os
import sys

def complex_function():
    '''A more complex function with imports.'''
    return os.path.join(sys.path[0], "test")
""",
            )

            (temp_path / "readme.md").write_text(
                """
# Test Project

This is a test project for file indexing.
It contains Python files and documentation.
""",
            )

            (temp_path / "config.json").write_text('{"test": true, "value": 42}')

            yield temp_path

    @pytest.mark.asyncio
    async def test_service_initialization(self):
        """Test service initialization and configuration."""
        service = get_file_indexing_service()
        config = get_file_indexing_config()

        # Test successful initialization
        result = await service.initialize(config)
        assert result is True
        assert service.enabled is True

        # Test stats after initialization
        stats = await service.get_stats()
        assert stats["service_type"] == "file_indexing"
        assert stats["enabled"] is True
        assert stats["files_indexed"] == 0

    @pytest.mark.asyncio
    async def test_service_initialization_disabled(self):
        """Test service initialization when disabled."""
        service = get_file_indexing_service()
        config = get_file_indexing_config()
        config["file_indexing_enabled"] = False

        result = await service.initialize(config)
        assert result is True
        assert service.enabled is False

    @pytest.mark.asyncio
    async def test_file_indexing(self, file_indexing_service, temp_directory):
        """Test file indexing functionality."""
        directories = [str(temp_directory)]
        file_types = [".py", ".md"]

        result = await file_indexing_service.index_files(directories, file_types)

        assert result["success"] is True
        assert result["indexed_files"] == 3  # test1.py, test2.py, readme.md
        assert result["index_time"] > 0
        assert len(result["files"]) == 3

        # Verify files are in the index
        stats = await file_indexing_service.get_stats()
        assert stats["files_indexed"] == 3
        assert stats["file_index_size"] == 3

    @pytest.mark.asyncio
    async def test_file_indexing_with_filters(
        self, file_indexing_service, temp_directory,
    ):
        """Test file indexing with file type filters."""
        directories = [str(temp_directory)]

        # Test Python files only
        result = await file_indexing_service.index_files(directories, [".py"])
        assert result["success"] is True
        assert result["indexed_files"] == 2  # Only Python files

        # Test markdown files only
        result = await file_indexing_service.index_files(directories, [".md"])
        assert result["success"] is True
        assert result["indexed_files"] == 1  # Only markdown files

    @pytest.mark.asyncio
    async def test_file_search(self, file_indexing_service, temp_directory):
        """Test file search functionality."""
        # First index the files
        directories = [str(temp_directory)]
        file_types = [".py", ".md"]
        await file_indexing_service.index_files(directories, file_types)

        # Test search for "hello"
        results = await file_indexing_service.search_files("hello", max_results=10)
        assert len(results) > 0
        assert any("test1.py" in result for result in results)

        # Test search for "complex"
        results = await file_indexing_service.search_files("complex", max_results=10)
        assert len(results) > 0
        assert any("test2.py" in result for result in results)

        # Test search for "project"
        results = await file_indexing_service.search_files("project", max_results=10)
        assert len(results) > 0
        assert any("readme.md" in result for result in results)

    @pytest.mark.asyncio
    async def test_file_content_retrieval(self, file_indexing_service, temp_directory):
        """Test file content retrieval."""
        # First index the files
        directories = [str(temp_directory)]
        file_types = [".py"]
        await file_indexing_service.index_files(directories, file_types)

        # Test content retrieval
        test_file = str(temp_directory / "test1.py")
        content = await file_indexing_service.get_file_content(test_file)

        assert content is not None
        assert "def hello_world():" in content
        assert "Hello, World!" in content
        assert "class TestClass:" in content

    @pytest.mark.asyncio
    async def test_content_caching(self, file_indexing_service, temp_directory):
        """Test content caching functionality."""
        # First index the files
        directories = [str(temp_directory)]
        file_types = [".py"]
        await file_indexing_service.index_files(directories, file_types)

        test_file = str(temp_directory / "test1.py")

        # Get content (should cache it)
        content1 = await file_indexing_service.get_file_content(test_file)
        assert content1 is not None

        # Get cached content
        cached_content = await file_indexing_service.get_cached_content(test_file)
        assert cached_content is not None
        assert cached_content == content1

        # Test cache content directly
        test_content = "This is test content for caching"
        await file_indexing_service.cache_content(test_file, test_content)

        cached_content = await file_indexing_service.get_cached_content(test_file)
        assert cached_content == test_content

    @pytest.mark.asyncio
    async def test_performance_metrics(self, file_indexing_service, temp_directory):
        """Test performance metrics tracking."""
        directories = [str(temp_directory)]
        file_types = [".py", ".md"]

        # Perform indexing
        result = await file_indexing_service.index_files(directories, file_types)
        assert result["success"] is True

        # Perform search
        await file_indexing_service.search_files("test", max_results=5)

        # Check metrics
        stats = await file_indexing_service.get_stats()
        assert stats["files_indexed"] == 3
        assert stats["searches_performed"] == 1
        assert stats["avg_search_time_ms"] > 0
        assert stats["text_index_size"] > 0
        assert stats["file_index_size"] == 3

    @pytest.mark.asyncio
    async def test_health_check(self, file_indexing_service):
        """Test health check functionality."""
        health = await file_indexing_service.health_check()
        assert health is True

    @pytest.mark.asyncio
    async def test_error_handling(self, file_indexing_service):
        """Test error handling for invalid inputs."""
        # Test indexing non-existent directory
        result = await file_indexing_service.index_files(
            ["/non/existent/path"], [".py"],
        )
        assert result["success"] is False
        assert result["indexed_files"] == 0

        # Test getting content for non-indexed file
        content = await file_indexing_service.get_file_content("/non/existent/file.py")
        assert content is None

        # Test getting cached content for non-cached file
        cached_content = await file_indexing_service.get_cached_content(
            "/non/existent/file.py",
        )
        assert cached_content is None

    @pytest.mark.asyncio
    async def test_concurrent_operations(self, file_indexing_service, temp_directory):
        """Test concurrent file operations."""
        directories = [str(temp_directory)]
        file_types = [".py", ".md"]

        # Test concurrent indexing
        tasks = [
            file_indexing_service.index_files(directories, file_types) for _ in range(3)
        ]
        results = await asyncio.gather(*tasks)

        # All should succeed
        for result in results:
            assert result["success"] is True

        # Test concurrent searching
        search_tasks = [
            file_indexing_service.search_files("test", max_results=5) for _ in range(5)
        ]
        search_results = await asyncio.gather(*search_tasks)

        # All searches should return results
        for results in search_results:
            assert len(results) > 0

    @pytest.mark.asyncio
    async def test_service_shutdown(self, file_indexing_service):
        """Test service shutdown functionality."""
        # Service should be running
        health = await file_indexing_service.health_check()
        assert health is True

        # Shutdown service
        await file_indexing_service.shutdown()

        # Service should still respond to health check (graceful shutdown)
        health = await file_indexing_service.health_check()
        assert health is True

    @pytest.mark.asyncio
    async def test_large_file_handling(self, file_indexing_service):
        """Test handling of large files."""
        with tempfile.TemporaryDirectory() as temp_dir:
            temp_path = Path(temp_dir)

            # Create a large file
            large_file = temp_path / "large_file.py"
            large_content = "# Large file\n" + "print('test')\n" * 1000
            large_file.write_text(large_content)

            # Index the large file
            result = await file_indexing_service.index_files([str(temp_path)], [".py"])
            assert result["success"] is True
            assert result["indexed_files"] == 1

            # Verify content can be retrieved
            content = await file_indexing_service.get_file_content(str(large_file))
            assert content is not None
            assert len(content) > 1000

    @pytest.mark.asyncio
    async def test_text_index_building(self, file_indexing_service, temp_directory):
        """Test text index building functionality."""
        directories = [str(temp_directory)]
        file_types = [".py"]

        # Index files
        await file_indexing_service.index_files(directories, file_types)

        # Check that text index was built
        stats = await file_indexing_service.get_stats()
        assert stats["text_index_size"] > 0

        # Test searching for specific terms
        results = await file_indexing_service.search_files(
            "hello_world", max_results=10,
        )
        assert len(results) > 0

        results = await file_indexing_service.search_files("TestClass", max_results=10)
        assert len(results) > 0


class TestFileIndexingServiceIntegration:
    """Integration tests for file indexing service with other components."""

    @pytest.mark.asyncio
    async def test_monolith_detection_integration(self):
        """Test integration with monolith detection service."""
        import sys

        sys.path.append("../../services/mcp-server")
        from services.monolith_analysis_service import MonolithAnalysisService

        service = MonolithAnalysisService()

        # Test monolith detection with file indexing
        result = await service.detect_monoliths(
            max_lines=100,
            directories=["backend/app/services/rag"],
            file_types=[".py"],
            top_n=3,
        )

        assert result is not None
        assert "monoliths" in result or "files_analyzed" in result

    @pytest.mark.asyncio
    async def test_config_integration(self):
        """Test integration with configuration system."""
        config = get_file_indexing_config()

        # Verify config structure
        assert "file_indexing" in config
        assert "content_caching" in config
        assert "text_search" in config
        assert "performance" in config

        # Test service creation with config
        service = get_file_indexing_service()
        result = await service.initialize(config)
        assert result is True


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
