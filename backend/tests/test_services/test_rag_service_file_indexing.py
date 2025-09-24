"""🔥 RAG Service with File Indexing Tests
=======================================

Comprehensive pytest tests for RAG service integration with file indexing service.
Tests the refactored RAG service that depends on file indexing service for
file discovery and caching operations.

Author: Phoenix-Prime-94
Version: 1.0.0
"""

import asyncio
import tempfile
from pathlib import Path
from unittest.mock import AsyncMock, patch

import pytest

from app.config.file_indexing_config import get_file_indexing_config
from app.services.rag.file_indexing_service import get_file_indexing_service
from app.services.rag.rag_service import RAGService


class TestRAGServiceFileIndexingIntegration:
    """Test suite for RAG service with file indexing integration."""

    @pytest.fixture
    def rag_config(self):
        """Create RAG service configuration."""
        config = get_file_indexing_config()
        config.update(
            {
                "rag_enabled": True,
                "file_indexing_enabled": True,
                "caching_enabled": True,
                "rag_monitoring_enabled": False,  # Disable for testing
                "rag_security_enabled": False,  # Disable for testing
            },
        )
        return config

    @pytest.fixture
    async def rag_service_lightweight(self, rag_config):
        """Create RAG service in lightweight mode (file indexing only)."""
        # Mock the heavy dependencies to test lightweight mode
        with (
            patch("app.services.rag.rag_service.EmbeddingService") as mock_embedding,
            patch(
                "app.services.rag.rag_service.VectorStoreService",
            ) as mock_vector_store,
            patch(
                "app.services.rag.rag_service.DocumentIndexer",
            ) as mock_document_indexer,
            patch("app.services.rag.rag_service.SearchEngine") as mock_search_engine,
        ):

            # Configure mocks
            mock_embedding_instance = AsyncMock()
            mock_embedding_instance.initialize.return_value = True
            mock_embedding.return_value = mock_embedding_instance

            mock_vector_store_instance = AsyncMock()
            mock_vector_store_instance.initialize.return_value = True
            mock_vector_store.return_value = mock_vector_store_instance

            mock_document_indexer_instance = AsyncMock()
            mock_document_indexer_instance.initialize.return_value = True
            mock_document_indexer.return_value = mock_document_indexer_instance

            mock_search_engine_instance = AsyncMock()
            mock_search_engine.return_value = mock_search_engine_instance

            # Create RAG service
            service = RAGService(rag_config)
            yield service

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

This is test documentation for the RAG service.
It contains information about the test modules.
""",
            )

            yield temp_path

    @pytest.mark.asyncio
    async def test_rag_service_initialization_with_file_indexing(self, rag_config):
        """Test RAG service initialization with file indexing dependency."""
        # Mock heavy dependencies
        with (
            patch("app.services.rag.rag_service.EmbeddingService") as mock_embedding,
            patch(
                "app.services.rag.rag_service.VectorStoreService",
            ) as mock_vector_store,
            patch(
                "app.services.rag.rag_service.DocumentIndexer",
            ) as mock_document_indexer,
            patch("app.services.rag.rag_service.SearchEngine") as mock_search_engine,
        ):

            # Configure mocks
            mock_embedding_instance = AsyncMock()
            mock_embedding_instance.initialize.return_value = True
            mock_embedding.return_value = mock_embedding_instance

            mock_vector_store_instance = AsyncMock()
            mock_vector_store_instance.initialize.return_value = True
            mock_vector_store.return_value = mock_vector_store_instance

            mock_document_indexer_instance = AsyncMock()
            mock_document_indexer_instance.initialize.return_value = True
            mock_document_indexer.return_value = mock_document_indexer_instance

            mock_search_engine_instance = AsyncMock()
            mock_search_engine.return_value = mock_search_engine_instance

            # Create and initialize RAG service
            service = RAGService(rag_config)

            # Verify file indexing service is available
            assert service.file_indexing_service is not None
            assert hasattr(service.file_indexing_service, "initialize")

            # Test initialization
            result = await service.initialize()
            assert result is True
            assert service.initialized is True

            # Verify file indexing service was initialized
            assert service.file_indexing_service.enabled is True

    @pytest.mark.asyncio
    async def test_rag_service_file_indexing_dependency(self, rag_service_lightweight):
        """Test that RAG service properly depends on file indexing service."""
        service = rag_service_lightweight

        # Verify file indexing service dependency
        assert service.file_indexing_service is not None
        assert isinstance(
            service.file_indexing_service, type(get_file_indexing_service()),
        )

        # Test file indexing service functionality
        config = get_file_indexing_config()
        await service.file_indexing_service.initialize(config)

        # Verify file indexing service is working
        stats = await service.file_indexing_service.get_stats()
        assert stats["service_type"] == "file_indexing"

    @pytest.mark.asyncio
    async def test_rag_service_lightweight_mode(self, rag_config):
        """Test RAG service in lightweight mode (file indexing only)."""
        # Disable heavy RAG components
        rag_config.update(
            {
                "rag_enabled": False,
                "file_indexing_enabled": True,
                "caching_enabled": True,
            },
        )

        service = RAGService(rag_config)

        # Test initialization in lightweight mode
        result = await service.initialize()
        assert result is True

        # Verify file indexing service is available and working
        assert service.file_indexing_service is not None
        await service.file_indexing_service.initialize(rag_config)

        # Test file indexing functionality
        with tempfile.TemporaryDirectory() as temp_dir:
            temp_path = Path(temp_dir)
            (temp_path / "test.py").write_text("def test(): pass")

            result = await service.file_indexing_service.index_files(
                [str(temp_path)], [".py"],
            )
            assert result["success"] is True
            assert result["indexed_files"] == 1

    @pytest.mark.asyncio
    async def test_document_indexer_file_indexing_integration(self, rag_config):
        """Test document indexer integration with file indexing service."""
        # Mock dependencies
        with (
            patch("app.services.rag.rag_service.EmbeddingService") as mock_embedding,
            patch(
                "app.services.rag.rag_service.VectorStoreService",
            ) as mock_vector_store,
            patch("app.services.rag.rag_service.SearchEngine") as mock_search_engine,
        ):

            # Configure mocks
            mock_embedding_instance = AsyncMock()
            mock_embedding_instance.initialize.return_value = True
            mock_embedding.return_value = mock_embedding_instance

            mock_vector_store_instance = AsyncMock()
            mock_vector_store_instance.initialize.return_value = True
            mock_vector_store.return_value = mock_vector_store_instance

            mock_search_engine_instance = AsyncMock()
            mock_search_engine.return_value = mock_search_engine_instance

            # Create RAG service
            service = RAGService(rag_config)

            # Mock document indexer to verify it receives file indexing service
            mock_document_indexer = AsyncMock()
            mock_document_indexer.initialize.return_value = True

            with patch(
                "app.services.rag.rag_service.DocumentIndexer",
                return_value=mock_document_indexer,
            ):
                await service.initialize()

                # Verify document indexer was initialized with file indexing service
                mock_document_indexer.initialize.assert_called_once()
                call_args = mock_document_indexer.initialize.call_args[0]
                assert (
                    len(call_args) >= 4
                )  # config, vector_store, embedding, file_indexing
                assert call_args[3] == service.file_indexing_service

    @pytest.mark.asyncio
    async def test_rag_service_file_discovery_performance(
        self, rag_service_lightweight, temp_directory_with_files,
    ):
        """Test RAG service file discovery performance using file indexing."""
        service = rag_service_lightweight

        # Initialize file indexing service
        config = get_file_indexing_config()
        await service.file_indexing_service.initialize(config)

        # Test file discovery performance
        directories = [str(temp_directory_with_files)]
        file_types = [".py", ".md"]

        # Time the file indexing
        import time

        start_time = time.time()
        result = await service.file_indexing_service.index_files(
            directories, file_types,
        )
        end_time = time.time()

        assert result["success"] is True
        assert result["indexed_files"] == 3  # module1.py, module2.py, documentation.md
        assert (end_time - start_time) < 1.0  # Should be fast

        # Test file search
        search_results = await service.file_indexing_service.search_files(
            "function", max_results=10,
        )
        assert len(search_results) > 0

    @pytest.mark.asyncio
    async def test_rag_service_error_handling(self, rag_config):
        """Test RAG service error handling with file indexing."""
        # Test with invalid file indexing configuration
        rag_config["file_indexing_enabled"] = False

        service = RAGService(rag_config)

        # Mock heavy dependencies to avoid initialization errors
        with (
            patch("app.services.rag.rag_service.EmbeddingService") as mock_embedding,
            patch(
                "app.services.rag.rag_service.VectorStoreService",
            ) as mock_vector_store,
            patch(
                "app.services.rag.rag_service.DocumentIndexer",
            ) as mock_document_indexer,
            patch("app.services.rag.rag_service.SearchEngine") as mock_search_engine,
        ):

            # Configure mocks
            mock_embedding_instance = AsyncMock()
            mock_embedding_instance.initialize.return_value = True
            mock_embedding.return_value = mock_embedding_instance

            mock_vector_store_instance = AsyncMock()
            mock_vector_store_instance.initialize.return_value = True
            mock_vector_store.return_value = mock_vector_store_instance

            mock_document_indexer_instance = AsyncMock()
            mock_document_indexer_instance.initialize.return_value = True
            mock_document_indexer.return_value = mock_document_indexer_instance

            mock_search_engine_instance = AsyncMock()
            mock_search_engine.return_value = mock_search_engine_instance

            # Test initialization
            result = await service.initialize()
            assert result is True

            # File indexing service should be disabled
            assert service.file_indexing_service.enabled is False

    @pytest.mark.asyncio
    async def test_rag_service_statistics(self, rag_service_lightweight):
        """Test RAG service statistics with file indexing integration."""
        service = rag_service_lightweight

        # Initialize file indexing service
        config = get_file_indexing_config()
        await service.file_indexing_service.initialize(config)

        # Test file indexing operations
        with tempfile.TemporaryDirectory() as temp_dir:
            temp_path = Path(temp_dir)
            (temp_path / "test.py").write_text("def test(): pass")

            await service.file_indexing_service.index_files([str(temp_path)], [".py"])
            await service.file_indexing_service.search_files("test", max_results=5)

        # Get statistics
        stats = await service.file_indexing_service.get_stats()
        assert stats["files_indexed"] > 0
        assert stats["searches_performed"] > 0
        assert stats["avg_search_time_ms"] >= 0

    @pytest.mark.asyncio
    async def test_rag_service_concurrent_operations(
        self, rag_service_lightweight, temp_directory_with_files,
    ):
        """Test RAG service concurrent operations with file indexing."""
        service = rag_service_lightweight

        # Initialize file indexing service
        config = get_file_indexing_config()
        await service.file_indexing_service.initialize(config)

        directories = [str(temp_directory_with_files)]
        file_types = [".py", ".md"]

        # Test concurrent file indexing
        tasks = [
            service.file_indexing_service.index_files(directories, file_types)
            for _ in range(3)
        ]
        results = await asyncio.gather(*tasks)

        # All should succeed
        for result in results:
            assert result["success"] is True

        # Test concurrent searching
        search_tasks = [
            service.file_indexing_service.search_files("function", max_results=5)
            for _ in range(5)
        ]
        search_results = await asyncio.gather(*search_tasks)

        # All searches should return results
        for results in search_results:
            assert len(results) > 0

    @pytest.mark.asyncio
    async def test_rag_service_health_check(self, rag_service_lightweight):
        """Test RAG service health check with file indexing."""
        service = rag_service_lightweight

        # Initialize file indexing service
        config = get_file_indexing_config()
        await service.file_indexing_service.initialize(config)

        # Test health check
        health = await service.file_indexing_service.health_check()
        assert health is True

    @pytest.mark.asyncio
    async def test_rag_service_shutdown(self, rag_service_lightweight):
        """Test RAG service shutdown with file indexing."""
        service = rag_service_lightweight

        # Initialize file indexing service
        config = get_file_indexing_config()
        await service.file_indexing_service.initialize(config)

        # Test shutdown
        await service.file_indexing_service.shutdown()

        # Service should still respond to health check (graceful shutdown)
        health = await service.file_indexing_service.health_check()
        assert health is True


class TestRAGServiceFileIndexingPerformance:
    """Performance tests for RAG service with file indexing."""

    @pytest.mark.asyncio
    async def test_file_indexing_performance_benchmark(self):
        """Benchmark file indexing performance."""
        service = get_file_indexing_service()
        config = get_file_indexing_config()
        await service.initialize(config)

        # Create test files
        with tempfile.TemporaryDirectory() as temp_dir:
            temp_path = Path(temp_dir)

            # Create multiple test files
            for i in range(10):
                (temp_path / f"test_{i}.py").write_text(
                    f"""
def function_{i}():
    '''Test function {i}'''
    return "Hello from function {i}"

class Class{i}:
    def method_{i}(self):
        return "Method from class {i}"
""",
                )

            # Benchmark indexing
            import time

            start_time = time.time()
            result = await service.index_files([str(temp_path)], [".py"])
            end_time = time.time()

            assert result["success"] is True
            assert result["indexed_files"] == 10
            assert (end_time - start_time) < 2.0  # Should be fast

            # Benchmark searching
            start_time = time.time()
            search_results = await service.search_files("function", max_results=20)
            end_time = time.time()

            assert len(search_results) > 0
            assert (end_time - start_time) < 1.0  # Should be very fast

    @pytest.mark.asyncio
    async def test_memory_usage(self):
        """Test memory usage of file indexing service."""
        import os

        import psutil

        process = psutil.Process(os.getpid())
        initial_memory = process.memory_info().rss

        service = get_file_indexing_service()
        config = get_file_indexing_config()
        await service.initialize(config)

        # Create and index many files
        with tempfile.TemporaryDirectory() as temp_dir:
            temp_path = Path(temp_dir)

            # Create 50 test files
            for i in range(50):
                (temp_path / f"test_{i}.py").write_text(f"def test_{i}(): return {i}")

            await service.index_files([str(temp_path)], [".py"])

            # Check memory usage
            final_memory = process.memory_info().rss
            memory_increase = final_memory - initial_memory

            # Memory increase should be reasonable (less than 100MB)
            assert memory_increase < 100 * 1024 * 1024  # 100MB


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
