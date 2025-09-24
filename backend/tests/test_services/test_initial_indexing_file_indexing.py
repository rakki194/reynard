"""🔥 Initial Indexing Service with File Indexing Tests
====================================================

Comprehensive pytest tests for initial indexing service integration with file indexing.
Tests the refactored initial indexing service that uses file indexing service for
fast file discovery instead of manual filesystem scanning.

Author: Phoenix-Prime-94
Version: 1.0.0
"""

import asyncio
import tempfile
from pathlib import Path
from unittest.mock import AsyncMock

import pytest

from app.config.file_indexing_config import get_file_indexing_config
from app.services.rag.initial_indexing import InitialIndexingService


class TestInitialIndexingServiceFileIndexingIntegration:
    """Test suite for initial indexing service with file indexing integration."""

    @pytest.fixture
    def initial_indexing_config(self):
        """Create initial indexing service configuration."""
        config = get_file_indexing_config()
        config.update(
            {
                "rag_continuous_indexing_watch_root": "/tmp/test_watch_root",
                "file_indexing_enabled": True,
                "caching_enabled": True,
            },
        )
        return config

    @pytest.fixture
    async def initial_indexing_service(self, initial_indexing_config):
        """Create initial indexing service instance for testing."""
        service = InitialIndexingService(initial_indexing_config)

        # Initialize file indexing service
        await service.file_indexing_service.initialize(initial_indexing_config)

        return service

    @pytest.fixture
    def temp_directory_with_files(self):
        """Create temporary directory with test files."""
        with tempfile.TemporaryDirectory() as temp_dir:
            temp_path = Path(temp_dir)

            # Create test Python files
            (temp_path / "module1.py").write_text(
                """
def function_one():
    '''First test function.'''
    return "Hello from module 1"

class ClassOne:
    def method_one(self):
        return "Method from class one"
""",
            )

            (temp_path / "module2.py").write_text(
                """
import os
import sys

def function_two():
    '''Second test function with imports.'''
    return os.path.join(sys.path[0], "test")

class ClassTwo:
    def __init__(self):
        self.value = 42
""",
            )

            (temp_path / "documentation.md").write_text(
                """
# Test Documentation

This is test documentation for the initial indexing service.
It contains information about the test modules.
""",
            )

            (temp_path / "config.json").write_text('{"test": true, "value": 42}')

            # Create subdirectory with more files
            subdir = temp_path / "subdir"
            subdir.mkdir()
            (subdir / "submodule.py").write_text(
                """
def sub_function():
    '''Function in subdirectory.'''
    return "Hello from subdirectory"
""",
            )

            yield temp_path

    @pytest.mark.asyncio
    async def test_initial_indexing_service_creation(self, initial_indexing_config):
        """Test initial indexing service creation with file indexing dependency."""
        service = InitialIndexingService(initial_indexing_config)

        # Verify file indexing service dependency
        assert service.file_indexing_service is not None
        assert hasattr(service.file_indexing_service, "initialize")
        assert hasattr(service.file_indexing_service, "index_files")
        assert hasattr(service.file_indexing_service, "search_files")

    @pytest.mark.asyncio
    async def test_file_discovery_with_file_indexing(
        self, initial_indexing_service, temp_directory_with_files,
    ):
        """Test file discovery using file indexing service."""
        # Update config to use temp directory
        initial_indexing_service.config["rag_continuous_indexing_watch_root"] = str(
            temp_directory_with_files,
        )

        # Test file discovery
        files = await initial_indexing_service.discover_files()

        # Should find Python and markdown files (not JSON)
        assert len(files) >= 3  # At least module1.py, module2.py, documentation.md
        assert any("module1.py" in str(f) for f in files)
        assert any("module2.py" in str(f) for f in files)
        assert any("documentation.md" in str(f) for f in files)
        assert any("submodule.py" in str(f) for f in files)  # From subdirectory

    @pytest.mark.asyncio
    async def test_file_discovery_performance(
        self, initial_indexing_service, temp_directory_with_files,
    ):
        """Test file discovery performance using file indexing service."""
        # Update config to use temp directory
        initial_indexing_service.config["rag_continuous_indexing_watch_root"] = str(
            temp_directory_with_files,
        )

        # Time the file discovery
        import time

        start_time = time.time()
        files = await initial_indexing_service.discover_files()
        end_time = time.time()

        assert len(files) > 0
        assert (end_time - start_time) < 1.0  # Should be fast with file indexing

    @pytest.mark.asyncio
    async def test_file_discovery_fallback(
        self, initial_indexing_config, temp_directory_with_files,
    ):
        """Test file discovery fallback when file indexing fails."""
        service = InitialIndexingService(initial_indexing_config)

        # Mock file indexing service to fail
        mock_file_indexing_service = AsyncMock()
        mock_file_indexing_service.index_files.return_value = {"success": False}
        service.file_indexing_service = mock_file_indexing_service

        # Update config to use temp directory
        service.config["rag_continuous_indexing_watch_root"] = str(
            temp_directory_with_files,
        )

        # Test file discovery with fallback
        files = await service.discover_files()

        # Should still find files using fallback method
        assert len(files) > 0
        assert any("module1.py" in str(f) for f in files)

    @pytest.mark.asyncio
    async def test_file_discovery_with_nonexistent_directory(
        self, initial_indexing_service,
    ):
        """Test file discovery with non-existent directory."""
        # Set non-existent directory
        initial_indexing_service.config["rag_continuous_indexing_watch_root"] = (
            "/non/existent/directory"
        )

        # Test file discovery
        files = await initial_indexing_service.discover_files()

        # Should return empty list
        assert len(files) == 0

    @pytest.mark.asyncio
    async def test_file_discovery_with_empty_directory(self, initial_indexing_service):
        """Test file discovery with empty directory."""
        with tempfile.TemporaryDirectory() as temp_dir:
            # Set empty directory
            initial_indexing_service.config["rag_continuous_indexing_watch_root"] = (
                temp_dir
            )

            # Test file discovery
            files = await initial_indexing_service.discover_files()

            # Should return empty list
            assert len(files) == 0

    @pytest.mark.asyncio
    async def test_file_discovery_file_type_filtering(
        self, initial_indexing_service, temp_directory_with_files,
    ):
        """Test file discovery with different file types."""
        # Update config to use temp directory
        initial_indexing_service.config["rag_continuous_indexing_watch_root"] = str(
            temp_directory_with_files,
        )

        # Test file discovery
        files = await initial_indexing_service.discover_files()

        # Should find Python and markdown files, but not JSON
        python_files = [f for f in files if str(f).endswith(".py")]
        markdown_files = [f for f in files if str(f).endswith(".md")]
        json_files = [f for f in files if str(f).endswith(".json")]

        assert len(python_files) >= 3  # module1.py, module2.py, submodule.py
        assert len(markdown_files) >= 1  # documentation.md
        assert len(json_files) == 0  # config.json should be filtered out

    @pytest.mark.asyncio
    async def test_file_discovery_recursive(
        self, initial_indexing_service, temp_directory_with_files,
    ):
        """Test recursive file discovery in subdirectories."""
        # Update config to use temp directory
        initial_indexing_service.config["rag_continuous_indexing_watch_root"] = str(
            temp_directory_with_files,
        )

        # Test file discovery
        files = await initial_indexing_service.discover_files()

        # Should find files in subdirectories
        subdir_files = [f for f in files if "subdir" in str(f)]
        assert len(subdir_files) >= 1  # submodule.py in subdir

    @pytest.mark.asyncio
    async def test_file_indexing_service_integration(
        self, initial_indexing_service, temp_directory_with_files,
    ):
        """Test integration with file indexing service."""
        # Update config to use temp directory
        initial_indexing_service.config["rag_continuous_indexing_watch_root"] = str(
            temp_directory_with_files,
        )

        # Test file discovery
        files = await initial_indexing_service.discover_files()
        assert len(files) > 0

        # Verify file indexing service stats
        stats = await initial_indexing_service.file_indexing_service.get_stats()
        assert stats["files_indexed"] > 0
        assert stats["file_index_size"] > 0

    @pytest.mark.asyncio
    async def test_concurrent_file_discovery(
        self, initial_indexing_service, temp_directory_with_files,
    ):
        """Test concurrent file discovery operations."""
        # Update config to use temp directory
        initial_indexing_service.config["rag_continuous_indexing_watch_root"] = str(
            temp_directory_with_files,
        )

        # Test concurrent file discovery
        tasks = [initial_indexing_service.discover_files() for _ in range(5)]
        results = await asyncio.gather(*tasks)

        # All should return the same files
        for result in results:
            assert len(result) > 0
            assert len(result) == len(
                results[0],
            )  # All should have same number of files

    @pytest.mark.asyncio
    async def test_file_discovery_error_handling(self, initial_indexing_config):
        """Test file discovery error handling."""
        service = InitialIndexingService(initial_indexing_config)

        # Mock file indexing service to raise exception
        mock_file_indexing_service = AsyncMock()
        mock_file_indexing_service.index_files.side_effect = Exception("Test error")
        service.file_indexing_service = mock_file_indexing_service

        # Test file discovery with error
        files = await service.discover_files()

        # Should return empty list on error
        assert len(files) == 0

    @pytest.mark.asyncio
    async def test_file_discovery_with_large_directory(self, initial_indexing_service):
        """Test file discovery with large directory structure."""
        with tempfile.TemporaryDirectory() as temp_dir:
            temp_path = Path(temp_dir)

            # Create many files in subdirectories
            for i in range(10):
                subdir = temp_path / f"subdir_{i}"
                subdir.mkdir()

                for j in range(5):
                    (subdir / f"file_{i}_{j}.py").write_text(
                        f"def test_{i}_{j}(): pass",
                    )

            # Update config to use temp directory
            initial_indexing_service.config["rag_continuous_indexing_watch_root"] = str(
                temp_path,
            )

            # Test file discovery
            files = await initial_indexing_service.discover_files()

            # Should find all Python files
            assert len(files) == 50  # 10 subdirs * 5 files each

    @pytest.mark.asyncio
    async def test_file_discovery_performance_benchmark(self, initial_indexing_service):
        """Benchmark file discovery performance."""
        with tempfile.TemporaryDirectory() as temp_dir:
            temp_path = Path(temp_dir)

            # Create many test files
            for i in range(100):
                (temp_path / f"test_{i}.py").write_text(f"def test_{i}(): return {i}")

            # Update config to use temp directory
            initial_indexing_service.config["rag_continuous_indexing_watch_root"] = str(
                temp_path,
            )

            # Benchmark file discovery
            import time

            start_time = time.time()
            files = await initial_indexing_service.discover_files()
            end_time = time.time()

            assert len(files) == 100
            assert (end_time - start_time) < 5.0  # Should be fast with file indexing

    @pytest.mark.asyncio
    async def test_file_discovery_memory_usage(self, initial_indexing_service):
        """Test memory usage during file discovery."""
        import os

        import psutil

        process = psutil.Process(os.getpid())
        initial_memory = process.memory_info().rss

        with tempfile.TemporaryDirectory() as temp_dir:
            temp_path = Path(temp_dir)

            # Create many test files
            for i in range(50):
                (temp_path / f"test_{i}.py").write_text(f"def test_{i}(): return {i}")

            # Update config to use temp directory
            initial_indexing_service.config["rag_continuous_indexing_watch_root"] = str(
                temp_path,
            )

            # Test file discovery
            files = await initial_indexing_service.discover_files()

            # Check memory usage
            final_memory = process.memory_info().rss
            memory_increase = final_memory - initial_memory

            # Memory increase should be reasonable (less than 50MB)
            assert memory_increase < 50 * 1024 * 1024  # 50MB
            assert len(files) == 50


class TestInitialIndexingServiceIntegration:
    """Integration tests for initial indexing service."""

    @pytest.mark.asyncio
    async def test_initial_indexing_service_with_continuous_indexing(
        self, initial_indexing_config,
    ):
        """Test initial indexing service with continuous indexing integration."""
        # Mock continuous indexing service
        mock_continuous_indexing = AsyncMock()
        mock_continuous_indexing.running = True

        # Mock vector store service
        mock_vector_store = AsyncMock()
        mock_vector_store.get_stats.return_value = {
            "total_documents": 0,
            "total_embeddings": 0,
        }

        service = InitialIndexingService(initial_indexing_config)

        # Initialize with mocked dependencies
        result = await service.initialize(mock_continuous_indexing, mock_vector_store)
        assert result is True

        # Verify dependencies are set
        assert service.continuous_indexing == mock_continuous_indexing
        assert service.vector_store_service == mock_vector_store

    @pytest.mark.asyncio
    async def test_database_empty_check(self, initial_indexing_config):
        """Test database empty check functionality."""
        # Mock continuous indexing service
        mock_continuous_indexing = AsyncMock()
        mock_continuous_indexing.running = True

        # Mock vector store service with empty database
        mock_vector_store = AsyncMock()
        mock_vector_store.get_stats.return_value = {
            "total_documents": 0,
            "total_embeddings": 0,
        }

        service = InitialIndexingService(initial_indexing_config)
        await service.initialize(mock_continuous_indexing, mock_vector_store)

        # Test database empty check
        is_empty = await service.is_database_empty()
        assert is_empty is True

        # Test with non-empty database
        mock_vector_store.get_stats.return_value = {
            "total_documents": 100,
            "total_embeddings": 100,
        }

        is_empty = await service.is_database_empty()
        assert is_empty is False

    @pytest.mark.asyncio
    async def test_progress_callbacks(self, initial_indexing_config):
        """Test progress callback functionality."""
        service = InitialIndexingService(initial_indexing_config)

        # Mock callback
        callback_called = False
        callback_data = None

        async def test_callback(progress_data):
            nonlocal callback_called, callback_data
            callback_called = True
            callback_data = progress_data

        # Add callback
        service.add_progress_callback(test_callback)

        # Test progress notification
        await service._notify_progress()

        assert callback_called is True
        assert callback_data is not None
        assert "status" in callback_data

        # Remove callback
        service.remove_progress_callback(test_callback)

        # Reset callback state
        callback_called = False

        # Test progress notification after removal
        await service._notify_progress()

        assert callback_called is False


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
