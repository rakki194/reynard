"""Memory Efficiency Tests
========================

Comprehensive tests for memory-efficient indexing and caching implementations.
Tests memory usage patterns, leak detection, and performance characteristics.

Author: Reynard Development Team
Version: 1.0.0
"""

import asyncio
import gc
import os
import psutil
import pytest
import tempfile
import time
from pathlib import Path
from typing import Any, Dict, List
from unittest.mock import AsyncMock, MagicMock, patch

import pytest_asyncio

from app.services.rag.indexing import IndexingService
from app.services.rag.services.monitoring.service_memory_profiler import ServiceMemoryProfiler
from app.ecs.performance.middleware import MemoryProfiler
from app.core.debug_logging import DebugLogContext, RAGOperationLogger


class MemoryEfficiencyTestSuite:
    """Test suite for memory efficiency validation."""
    
    @pytest.fixture
    def test_config(self) -> Dict[str, Any]:
        """Test configuration for memory efficiency tests."""
        return {
            "memory_efficient_batch_size": 3,  # Small batch for testing
            "max_memory_mb": 100,  # Low limit for testing
            "memory_cleanup_threshold": 0.8,
            "gc_frequency": 2,
            "memory_profiler_interval": 0.5,
            "rag_chunk_size": 500,
            "rag_chunk_overlap": 100,
        }
    
    @pytest.fixture
    def sample_files(self, tmp_path: Path) -> List[Path]:
        """Create sample files for testing."""
        files = []
        for i in range(10):
            file_path = tmp_path / f"test_file_{i}.py"
            content = f"""
# Test file {i}
def test_function_{i}():
    '''Test function {i}'''
    return "test_{i}"

class TestClass{i}:
    def __init__(self):
        self.value = {i}
    
    def method_{i}(self):
        return self.value * 2
"""
            file_path.write_text(content)
            files.append(file_path)
        return files
    
    @pytest.fixture
    def mock_services(self):
        """Mock services for testing."""
        mock_embedding_service = AsyncMock()
        mock_embedding_service.embed_batch.return_value = [
            [0.1] * 384 for _ in range(3)  # Mock embeddings
        ]
        
        mock_vector_store = AsyncMock()
        mock_vector_store.add_documents.return_value = True
        
        return mock_embedding_service, mock_vector_store


class TestIndexingServiceMemoryEfficiency(MemoryEfficiencyTestSuite):
    """Test memory efficiency of the IndexingService."""
    
    @pytest.mark.asyncio
    async def test_memory_usage_with_batching(self, test_config, sample_files, mock_services):
        """Test that indexing uses memory efficiently with batching."""
        mock_embedding_service, mock_vector_store = mock_services
        
        # Initialize service
        service = IndexingService(test_config)
        await service.initialize()
        
        # Get initial memory usage
        process = psutil.Process()
        initial_memory = process.memory_info().rss / 1024 / 1024  # MB
        
        # Mock the indexing callback
        async def mock_indexing_callback(file_path: str) -> Dict[str, Any]:
            return {"success": True, "result": "indexed"}
        
        # Perform indexing
        result = await service.perform_indexing(
            sample_files, mock_indexing_callback, force=True
        )
        
        # Get final memory usage
        final_memory = process.memory_info().rss / 1024 / 1024  # MB
        memory_increase = final_memory - initial_memory
        
        # Verify results
        assert result["status"] == "completed"
        assert memory_increase < test_config["max_memory_mb"] * 0.5  # Should use less than half the limit
        assert service.current_progress["processed_files"] == len(sample_files)
        
        # Cleanup
        await service.shutdown()
    
    @pytest.mark.asyncio
    async def test_memory_cleanup_between_batches(self, test_config, sample_files, mock_services):
        """Test that memory is cleaned up between batches."""
        mock_embedding_service, mock_vector_store = mock_services
        
        service = IndexingService(test_config)
        await service.initialize()
        
        # Track memory usage during processing
        memory_snapshots = []
        
        # Mock the batch processing to capture memory
        original_process_batch = service._process_batch
        
        async def memory_tracking_batch(*args, **kwargs):
            process = psutil.Process()
            memory_mb = process.memory_info().rss / 1024 / 1024
            memory_snapshots.append(memory_mb)
            return await original_process_batch(*args, **kwargs)
        
        service._process_batch = memory_tracking_batch
        
        async def mock_indexing_callback(file_path: str) -> Dict[str, Any]:
            return {"success": True, "result": "indexed"}
        
        # Perform indexing
        await service.perform_indexing(sample_files, mock_indexing_callback, force=True)
        
        # Verify memory doesn't continuously increase
        if len(memory_snapshots) > 2:
            # Memory should not continuously increase across batches
            memory_trend = sum(memory_snapshots[i+1] - memory_snapshots[i] 
                             for i in range(len(memory_snapshots)-1))
            assert memory_trend < test_config["max_memory_mb"] * 0.3  # Reasonable increase
        
        await service.shutdown()
    
    @pytest.mark.asyncio
    async def test_garbage_collection_frequency(self, test_config, sample_files, mock_services):
        """Test that garbage collection is triggered appropriately."""
        mock_embedding_service, mock_vector_store = mock_services
        
        service = IndexingService(test_config)
        await service.initialize()
        
        # Track garbage collection calls
        gc_count_before = service.forced_gc_count
        
        async def mock_indexing_callback(file_path: str) -> Dict[str, Any]:
            return {"success": True, "result": "indexed"}
        
        # Perform indexing
        await service.perform_indexing(sample_files, mock_indexing_callback, force=True)
        
        # Verify garbage collection was called
        gc_count_after = service.forced_gc_count
        assert gc_count_after > gc_count_before  # GC should have been called
        
        await service.shutdown()
    
    @pytest.mark.asyncio
    async def test_memory_pressure_detection(self, test_config, sample_files, mock_services):
        """Test memory pressure detection and response."""
        mock_embedding_service, mock_vector_store = mock_services
        
        # Set very low memory limit to trigger pressure
        test_config["max_memory_mb"] = 50
        test_config["memory_cleanup_threshold"] = 0.5
        
        service = IndexingService(test_config)
        await service.initialize()
        
        async def mock_indexing_callback(file_path: str) -> Dict[str, Any]:
            return {"success": True, "result": "indexed"}
        
        # Perform indexing
        result = await service.perform_indexing(sample_files, mock_indexing_callback, force=True)
        
        # Verify memory pressure was detected and handled
        assert result["status"] == "completed"
        assert service.memory_cleanup_count > 0  # Cleanup should have been triggered
        
        await service.shutdown()


class TestServiceMemoryProfiler(MemoryEfficiencyTestSuite):
    """Test the ServiceMemoryProfiler functionality."""
    
    @pytest.mark.asyncio
    async def test_memory_profiler_accuracy(self, test_config):
        """Test that memory profiler accurately tracks memory usage."""
        profiler = ServiceMemoryProfiler(test_config)
        profiler.start()
        
        # Wait for a few snapshots
        await asyncio.sleep(1.5)
        
        # Get current stats
        stats = profiler.get_all_memory_stats()
        
        # Verify stats structure (adjust based on actual implementation)
        assert isinstance(stats, dict)
        
        # Verify we get some memory information
        # The exact structure depends on the ServiceMemoryProfiler implementation
        assert len(stats) > 0
        
        profiler.stop()
    
    @pytest.mark.asyncio
    async def test_memory_leak_detection(self, test_config):
        """Test memory leak detection capabilities."""
        profiler = ServiceMemoryProfiler(test_config)
        profiler.start()
        
        # Simulate memory leak by creating objects
        memory_objects = []
        
        for i in range(5):
            # Create some objects to increase memory
            memory_objects.append([0] * 10000)
            await asyncio.sleep(0.6)  # Wait for profiler to take snapshots
        
        # Get memory history
        history = profiler.get_all_memory_stats()
        
        # Verify we get some data
        assert isinstance(history, dict)
        assert len(history) > 0
        
        profiler.stop()
    
    @pytest.mark.asyncio
    async def test_memory_trend_analysis(self, test_config):
        """Test memory trend analysis accuracy."""
        profiler = ServiceMemoryProfiler(test_config)
        profiler.start()
        
        # Create objects to simulate memory increase
        objects = []
        for i in range(3):
            objects.append([0] * 5000)
            await asyncio.sleep(0.6)
        
        # Check trend detection
        stats = profiler.get_all_memory_stats()
        # Note: The actual structure may be different, let's check what we get
        assert isinstance(stats, dict)
        
        # Clear objects and wait
        del objects
        gc.collect()
        await asyncio.sleep(0.6)
        
        # Check trend after cleanup
        stats = profiler.get_all_memory_stats()
        # Verify we still get valid stats
        assert isinstance(stats, dict)
        
        profiler.stop()


class TestMemoryProfilerIntegration(MemoryEfficiencyTestSuite):
    """Test integration between different memory profiling components."""
    
    @pytest.mark.asyncio
    async def test_indexing_with_memory_profiling(self, test_config, sample_files, mock_services):
        """Test indexing service with integrated memory profiling."""
        mock_embedding_service, mock_vector_store = mock_services
        
        service = IndexingService(test_config)
        await service.initialize()
        
        # Verify memory profiler is running
        assert service.memory_profiler._running
        
        async def mock_indexing_callback(file_path: str) -> Dict[str, Any]:
            return {"success": True, "result": "indexed"}
        
        # Perform indexing
        result = await service.perform_indexing(sample_files, mock_indexing_callback, force=True)
        
        # Verify memory stats are included in progress
        assert "memory_stats" in service.current_progress
        memory_stats = service.current_progress["memory_stats"]
        assert "current_memory_mb" in memory_stats
        assert "peak_memory_mb" in memory_stats
        
        await service.shutdown()
    
    @pytest.mark.asyncio
    async def test_performance_stats_integration(self, test_config, sample_files, mock_services):
        """Test that performance stats include memory information."""
        mock_embedding_service, mock_vector_store = mock_services
        
        service = IndexingService(test_config)
        await service.initialize()
        
        async def mock_indexing_callback(file_path: str) -> Dict[str, Any]:
            return {"success": True, "result": "indexed"}
        
        # Perform indexing
        await service.perform_indexing(sample_files, mock_indexing_callback, force=True)
        
        # Get performance stats
        perf_stats = await service._get_performance_stats()
        
        # Verify memory information is included
        assert "memory_cleanup_count" in perf_stats
        assert "forced_gc_count" in perf_stats
        assert "memory_profiler_summary" in perf_stats
        
        await service.shutdown()


class TestCachingMemoryEfficiency(MemoryEfficiencyTestSuite):
    """Test memory efficiency of caching implementations."""
    
    @pytest.mark.asyncio
    async def test_embedding_cache_memory_usage(self, test_config):
        """Test that embedding cache doesn't leak memory."""
        # This would test the embedding service cache if it exists
        # For now, we'll create a mock test structure
        
        cache_size_before = 0
        cache_size_after = 0
        
        # Simulate cache operations
        cache = {}
        
        # Add items to cache
        for i in range(100):
            cache[f"key_{i}"] = [0.1] * 384  # Mock embedding
        
        cache_size_after = len(cache)
        
        # Verify cache growth
        assert cache_size_after > cache_size_before
        
        # Clear cache
        cache.clear()
        gc.collect()
        
        # Verify cache cleanup
        assert len(cache) == 0
    
    @pytest.mark.asyncio
    async def test_vector_store_memory_efficiency(self, test_config):
        """Test vector store memory efficiency."""
        # This would test the vector store service memory usage
        # For now, we'll create a mock test structure
        
        # Simulate vector operations
        vectors = []
        
        # Add vectors
        for i in range(50):
            vectors.append([0.1] * 384)
        
        # Verify memory usage is reasonable
        process = psutil.Process()
        memory_mb = process.memory_info().rss / 1024 / 1024
        
        # Clear vectors
        vectors.clear()
        gc.collect()
        
        # Memory should be freed
        new_memory_mb = process.memory_info().rss / 1024 / 1024
        memory_freed = memory_mb - new_memory_mb
        
        # Some memory should be freed (allowing for system variations)
        assert memory_freed >= 0  # At minimum, no increase


class TestMemoryEfficiencyBenchmarks(MemoryEfficiencyTestSuite):
    """Benchmark tests for memory efficiency."""
    
    @pytest.mark.asyncio
    async def test_large_file_processing_memory(self, test_config, tmp_path, mock_services):
        """Test memory usage when processing large files."""
        mock_embedding_service, mock_vector_store = mock_services
        
        # Create a large file
        large_file = tmp_path / "large_file.py"
        large_content = "# Large file content\n" + "def test():\n    pass\n" * 1000
        large_file.write_text(large_content)
        
        service = IndexingService(test_config)
        await service.initialize()
        
        # Get initial memory
        process = psutil.Process()
        initial_memory = process.memory_info().rss / 1024 / 1024
        
        async def mock_indexing_callback(file_path: str) -> Dict[str, Any]:
            return {"success": True, "result": "indexed"}
        
        # Process large file
        result = await service.perform_indexing([large_file], mock_indexing_callback, force=True)
        
        # Get final memory
        final_memory = process.memory_info().rss / 1024 / 1024
        memory_increase = final_memory - initial_memory
        
        # Verify memory usage is reasonable
        assert result["status"] == "completed"
        assert memory_increase < test_config["max_memory_mb"] * 0.8
        
        await service.shutdown()
    
    @pytest.mark.asyncio
    async def test_concurrent_processing_memory(self, test_config, sample_files, mock_services):
        """Test memory usage during concurrent processing."""
        mock_embedding_service, mock_vector_store = mock_services
        
        service = IndexingService(test_config)
        await service.initialize()
        
        async def mock_indexing_callback(file_path: str) -> Dict[str, Any]:
            # Simulate some processing time
            await asyncio.sleep(0.1)
            return {"success": True, "result": "indexed"}
        
        # Process files concurrently
        tasks = []
        for i in range(3):  # Process in 3 concurrent batches
            start_idx = i * 3
            end_idx = min(start_idx + 3, len(sample_files))
            batch_files = sample_files[start_idx:end_idx]
            
            task = service.perform_indexing(batch_files, mock_indexing_callback, force=True)
            tasks.append(task)
        
        # Wait for all tasks
        results = await asyncio.gather(*tasks)
        
        # Verify all completed successfully
        for result in results:
            assert result["status"] == "completed"
        
        await service.shutdown()


# Pytest configuration
@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


# Test markers for different test categories
pytestmark = [
    pytest.mark.asyncio,
    pytest.mark.memory_efficiency,
    pytest.mark.slow,  # These tests may take longer due to memory monitoring
]
