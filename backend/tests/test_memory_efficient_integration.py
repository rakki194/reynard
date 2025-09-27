"""Memory-Efficient Indexing Integration Tests
============================================

Comprehensive tests for memory-efficient indexing integration across services.
Tests the integration of IndexingService with continuous indexing, document processing,
and other services that benefit from memory-efficient operations.

Author: Reynard Development Team
Version: 1.0.0
"""

import asyncio
import os
import pytest
import tempfile
from pathlib import Path
from typing import Any, Dict, List
from unittest.mock import AsyncMock, MagicMock, patch

from app.services.rag.indexing import IndexingService
from app.services.email.infrastructure.continuous_indexing import ContinuousIndexingService
from app.services.rag.services.core.document_processor import ASTDocumentProcessor
from app.services.rag.interfaces.document import Document


@pytest.mark.memory_efficiency
@pytest.mark.integration
class TestMemoryEfficientIndexingIntegration:
    """Test memory-efficient indexing integration across services."""

    @pytest.fixture
    def memory_test_config(self) -> Dict[str, Any]:
        """Configuration optimized for memory testing."""
        return {
            "memory_efficient_batch_size": 2,
            "max_memory_mb": 200,
            "memory_cleanup_threshold": 0.8,
            "gc_frequency": 2,
            "memory_profiler_interval": 0.1,
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
    def mock_rag_service(self):
        """Mock RAG service for testing."""
        mock_service = AsyncMock()
        mock_service.index_documents.return_value = {
            "status": "success",
            "indexed_count": 1,
            "message": "Document indexed successfully"
        }
        return mock_service

    @pytest.fixture
    def sample_documents(self) -> List[Document]:
        """Create sample documents for testing."""
        documents = []
        for i in range(5):
            doc = Document(
                id=f"doc_{i}",
                content=f"Test content {i}",
                file_path=f"/tmp/test_file_{i}.py",
                file_type="py",
                language="python",
                metadata={"type": "test", "index": i}
            )
            documents.append(doc)
        return documents

    @pytest.mark.asyncio
    async def test_indexing_service_integration(self, memory_test_config, sample_files):
        """Test IndexingService integration with memory management."""
        # Create indexing service
        indexing_service = IndexingService(memory_test_config)
        await indexing_service.initialize()
        
        try:
            # Mock indexing callback (synchronous for thread pool execution)
            def mock_callback(file_path: str) -> Dict[str, Any]:
                return {"success": True, "result": f"processed_{file_path}"}
            
            # Test memory-efficient indexing
            result = await indexing_service.perform_indexing(
                sample_files, mock_callback, force=True
            )
            
            # Verify results
            assert result["status"] == "completed"
            assert result["total_files"] == len(sample_files)
            assert result["processed_files"] == len(sample_files)
            assert result["failed_files"] == 0
            
            # Verify memory stats are tracked
            memory_stats = indexing_service.get_memory_stats()
            assert "current_memory_mb" in memory_stats
            assert "peak_memory_mb" in memory_stats
            assert "memory_trend" in memory_stats
            
        finally:
            await indexing_service.shutdown()

    @pytest.mark.asyncio
    async def test_continuous_indexing_memory_efficiency(self, memory_test_config, mock_rag_service):
        """Test continuous indexing service with memory-efficient processing."""
        # Create continuous indexing service
        config = {
            "max_memory_mb": 200,
            "memory_cleanup_threshold": 0.8,
            "gc_frequency": 2,
        }
        continuous_service = ContinuousIndexingService(config)
        
        # Mock the RAG service
        continuous_service.rag_service = mock_rag_service
        
        try:
            # Initialize the service
            await continuous_service.initialize()
            
            # Verify indexing service was created
            assert continuous_service.indexing_service is not None
            assert isinstance(continuous_service.indexing_service, IndexingService)
            
            # Test memory-efficient file indexing
            test_files = [Path("/tmp/test1.py"), Path("/tmp/test2.py")]
            
            # Mock file creation
            with patch.object(continuous_service, '_create_document_from_file') as mock_create:
                mock_create.return_value = {
                    "id": "test_doc",
                    "content": "test content",
                    "file_path": "/tmp/test.py"
                }
                
                await continuous_service.index_files(test_files)
            
            # Verify RAG service was called
            mock_rag_service.index_documents.assert_called()
            
        finally:
            await continuous_service.shutdown()

    @pytest.mark.asyncio
    async def test_document_processor_memory_efficiency(self, memory_test_config, sample_documents):
        """Test document processor with memory-efficient batching."""
        # Create document processor with memory-efficient config
        config = {
            "memory_efficient_batch_size": 2,
            "max_memory_mb": 200,
            "memory_cleanup_threshold": 0.8,
            "gc_frequency": 2,
        }
        processor = ASTDocumentProcessor(config)
        
        try:
            # Initialize processor
            await processor.initialize()
            
            # Test memory-efficient document processing
            results = []
            async for result in processor.process_documents(sample_documents):
                results.append(result)
            
            # Verify batch processing occurred
            assert len(results) > 0
            
            # Check for progress updates
            progress_updates = [r for r in results if r.get("type") == "progress"]
            assert len(progress_updates) > 0
            
            # Check for completion
            completion_updates = [r for r in results if r.get("type") == "completion"]
            assert len(completion_updates) == 1
            
            completion = completion_updates[0]
            assert completion["total_processed"] == len(sample_documents)
            assert completion["total_documents"] == len(sample_documents)
            
        finally:
            await processor.shutdown()

    @pytest.mark.asyncio
    async def test_memory_cleanup_between_batches(self, memory_test_config):
        """Test memory cleanup between processing batches."""
        # Create indexing service with small batch size
        config = memory_test_config.copy()
        config["memory_efficient_batch_size"] = 2
        config["gc_frequency"] = 1  # Force GC every batch
        
        indexing_service = IndexingService(config)
        await indexing_service.initialize()
        
        try:
            # Create test files
            with tempfile.TemporaryDirectory() as temp_dir:
                test_files = []
                for i in range(6):  # 3 batches of 2 files each
                    file_path = Path(temp_dir) / f"test_{i}.py"
                    file_path.write_text(f"# Test file {i}\ndef test_{i}(): pass")
                    test_files.append(file_path)
                
                # Mock callback that uses some memory
                def memory_intensive_callback(file_path: str) -> Dict[str, Any]:
                    # Simulate memory usage
                    data = [f"data_{i}" for i in range(1000)]
                    return {"success": True, "data": data}
                
                # Process files
                result = await indexing_service.perform_indexing(
                    test_files, memory_intensive_callback, force=True
                )
                
                # Verify processing completed
                assert result["status"] == "completed"
                assert result["processed_files"] == len(test_files)
                
                # Verify memory management occurred
                memory_stats = indexing_service.get_memory_stats()
                assert memory_stats["forced_gc_count"] > 0
                
        finally:
            await indexing_service.shutdown()

    @pytest.mark.asyncio
    async def test_memory_threshold_cleanup(self, memory_test_config):
        """Test memory cleanup when threshold is exceeded."""
        # Create indexing service with very low memory limit
        config = memory_test_config.copy()
        config["max_memory_mb"] = 50  # Very low limit
        config["memory_cleanup_threshold"] = 0.5  # Cleanup at 50%
        
        indexing_service = IndexingService(config)
        await indexing_service.initialize()
        
        try:
            # Create test files
            with tempfile.TemporaryDirectory() as temp_dir:
                test_files = []
                for i in range(4):
                    file_path = Path(temp_dir) / f"test_{i}.py"
                    file_path.write_text(f"# Test file {i}\ndef test_{i}(): pass")
                    test_files.append(file_path)
                
                # Mock callback that uses memory
                def memory_callback(file_path: str) -> Dict[str, Any]:
                    # Simulate memory usage
                    data = [f"data_{i}" for i in range(500)]
                    return {"success": True, "data": data}
                
                # Process files
                result = await indexing_service.perform_indexing(
                    test_files, memory_callback, force=True
                )
                
                # Verify processing completed despite memory constraints
                assert result["status"] == "completed"
                
                # Verify memory cleanup was triggered
                memory_stats = indexing_service.get_memory_stats()
                assert memory_stats["memory_cleanup_count"] > 0
                
        finally:
            await indexing_service.shutdown()

    @pytest.mark.asyncio
    async def test_error_handling_in_memory_efficient_processing(self, memory_test_config):
        """Test error handling in memory-efficient processing."""
        indexing_service = IndexingService(memory_test_config)
        await indexing_service.initialize()
        
        try:
            # Create test files
            with tempfile.TemporaryDirectory() as temp_dir:
                test_files = []
                for i in range(4):
                    file_path = Path(temp_dir) / f"test_{i}.py"
                    file_path.write_text(f"# Test file {i}\ndef test_{i}(): pass")
                    test_files.append(file_path)
                
                # Mock callback that fails for some files
                def failing_callback(file_path: str) -> Dict[str, Any]:
                    if "test_1" in file_path or "test_3" in file_path:
                        raise Exception(f"Simulated error for {file_path}")
                    return {"success": True, "result": f"processed_{file_path}"}
                
                # Process files
                result = await indexing_service.perform_indexing(
                    test_files, failing_callback, force=True
                )
                
                # Verify processing completed with some failures
                assert result["status"] == "completed"
                assert result["total_files"] == len(test_files)
                assert result["processed_files"] == 2  # 2 successful
                assert result["failed_files"] == 2  # 2 failed
                
                # Verify error details are captured in progress
                progress = indexing_service.get_current_progress()
                assert "errors" in progress
                assert len(progress["errors"]) == 2
                
        finally:
            await indexing_service.shutdown()

    @pytest.mark.asyncio
    async def test_concurrent_memory_efficient_processing(self, memory_test_config):
        """Test concurrent memory-efficient processing."""
        indexing_service = IndexingService(memory_test_config)
        await indexing_service.initialize()
        
        try:
            # Create test files
            with tempfile.TemporaryDirectory() as temp_dir:
                test_files = []
                for i in range(8):
                    file_path = Path(temp_dir) / f"test_{i}.py"
                    file_path.write_text(f"# Test file {i}\ndef test_{i}(): pass")
                    test_files.append(file_path)
                
                # Mock callback
                def mock_callback(file_path: str) -> Dict[str, Any]:
                    import time
                    time.sleep(0.1)  # Simulate processing time
                    return {"success": True, "result": f"processed_{file_path}"}
                
                # Process files concurrently
                tasks = []
                for i in range(0, len(test_files), 4):
                    batch = test_files[i:i+4]
                    task = indexing_service.perform_indexing(batch, mock_callback, force=True)
                    tasks.append(task)
                
                # Wait for all tasks to complete
                results = await asyncio.gather(*tasks)
                
                # Verify all batches completed successfully
                for result in results:
                    assert result["status"] == "completed"
                    assert result["failed_files"] == 0
                
        finally:
            await indexing_service.shutdown()

    @pytest.mark.asyncio
    async def test_memory_profiling_integration(self, memory_test_config):
        """Test memory profiling integration."""
        indexing_service = IndexingService(memory_test_config)
        await indexing_service.initialize()
        
        try:
            # Create test files
            with tempfile.TemporaryDirectory() as temp_dir:
                test_files = []
                for i in range(6):
                    file_path = Path(temp_dir) / f"test_{i}.py"
                    file_path.write_text(f"# Test file {i}\ndef test_{i}(): pass")
                    test_files.append(file_path)
                
                # Mock callback
                def mock_callback(file_path: str) -> Dict[str, Any]:
                    return {"success": True, "result": f"processed_{file_path}"}
                
                # Process files
                result = await indexing_service.perform_indexing(
                    test_files, mock_callback, force=True
                )
                
                # Verify memory profiling data
                assert result["status"] == "completed"
                assert "performance_stats" in result
                
                perf_stats = result["performance_stats"]
                assert "memory_profiler_summary" in perf_stats
                assert "rag_profiler_stats" in perf_stats
                assert "batch_memory_history" in perf_stats
                
                # Verify batch memory history
                batch_history = perf_stats["batch_memory_history"]
                assert len(batch_history) > 0
                
                for batch in batch_history:
                    assert "batch_num" in batch
                    assert "memory_start_mb" in batch
                    assert "memory_end_mb" in batch
                    assert "memory_used_mb" in batch
                    assert "duration_s" in batch
                
        finally:
            await indexing_service.shutdown()

    @pytest.mark.asyncio
    async def test_service_integration_health_checks(self, memory_test_config, mock_rag_service):
        """Test health checks for integrated services."""
        # Test continuous indexing service health
        config = memory_test_config.copy()
        continuous_service = ContinuousIndexingService(config)
        continuous_service.rag_service = mock_rag_service
        
        try:
            await continuous_service.initialize()
            
            # Test health check
            health = await continuous_service.health_check()
            assert health["status"] == "healthy"
            assert "indexing_service" in health
            assert "integrated_services" in health
            
        finally:
            await continuous_service.shutdown()
        
        # Test document processor health
        processor = ASTDocumentProcessor(memory_test_config)
        
        try:
            await processor.initialize()
            
            # Test health check
            health = await processor.health_check()
            assert health["status"] == "healthy"
            assert "metrics" in health
            assert "supported_languages" in health
            
        finally:
            await processor.shutdown()

    @pytest.mark.asyncio
    async def test_memory_efficient_configuration_validation(self):
        """Test memory-efficient configuration validation."""
        # Test valid configuration
        valid_config = {
            "memory_efficient_batch_size": 5,
            "max_memory_mb": 1024,
            "memory_cleanup_threshold": 0.8,
            "gc_frequency": 3,
        }
        
        indexing_service = IndexingService(valid_config)
        await indexing_service.initialize()
        
        try:
            # Verify configuration was applied
            assert indexing_service.batch_size == 5
            assert indexing_service.max_memory_mb == 1024
            assert indexing_service.memory_cleanup_threshold == 0.8
            assert indexing_service.gc_frequency == 3
            
        finally:
            await indexing_service.shutdown()
        
        # Test invalid configuration (should use defaults)
        invalid_config = {
            "memory_efficient_batch_size": -1,  # Invalid
            "max_memory_mb": 0,  # Invalid
            "memory_cleanup_threshold": 1.5,  # Invalid
            "gc_frequency": -1,  # Invalid
        }
        
        indexing_service = IndexingService(invalid_config)
        await indexing_service.initialize()
        
        try:
            # Verify defaults were used
            assert indexing_service.batch_size > 0
            assert indexing_service.max_memory_mb > 0
            assert 0 < indexing_service.memory_cleanup_threshold < 1
            assert indexing_service.gc_frequency > 0
            
        finally:
            await indexing_service.shutdown()


@pytest.mark.memory_efficiency
@pytest.mark.performance
class TestMemoryEfficiencyBenchmarks:
    """Benchmark tests for memory efficiency."""

    @pytest.mark.asyncio
    async def test_memory_usage_comparison(self, tmp_path: Path):
        """Compare memory usage between efficient and inefficient processing."""
        # Create test files
        test_files = []
        for i in range(20):
            file_path = tmp_path / f"test_{i}.py"
            file_path.write_text(f"# Test file {i}\n" + "x" * 1000)  # 1KB per file
            test_files.append(file_path)
        
        # Test memory-efficient processing
        efficient_config = {
            "memory_efficient_batch_size": 5,
            "max_memory_mb": 200,
            "memory_cleanup_threshold": 0.8,
            "gc_frequency": 2,
        }
        
        efficient_service = IndexingService(efficient_config)
        await efficient_service.initialize()
        
        try:
            async def mock_callback(file_path: str) -> Dict[str, Any]:
                return {"success": True, "result": f"processed_{file_path}"}
            
            result = await efficient_service.perform_indexing(
                test_files, mock_callback, force=True
            )
            
            # Verify efficient processing completed
            assert result["status"] == "completed"
            
            # Get memory statistics
            memory_stats = efficient_service.get_memory_stats()
            peak_memory = memory_stats["peak_memory_mb"]
            
            # Verify memory usage was reasonable
            assert peak_memory < 200  # Should stay under limit
            
        finally:
            await efficient_service.shutdown()

    @pytest.mark.asyncio
    async def test_processing_speed_with_memory_management(self, tmp_path: Path):
        """Test processing speed with memory management enabled."""
        # Create test files
        test_files = []
        for i in range(50):
            file_path = tmp_path / f"test_{i}.py"
            file_path.write_text(f"# Test file {i}\ndef test_{i}(): pass")
            test_files.append(file_path)
        
        # Test with memory management
        config = {
            "memory_efficient_batch_size": 10,
            "max_memory_mb": 500,
            "memory_cleanup_threshold": 0.8,
            "gc_frequency": 3,
        }
        
        indexing_service = IndexingService(config)
        await indexing_service.initialize()
        
        try:
            import time
            start_time = time.time()
            
            async def mock_callback(file_path: str) -> Dict[str, Any]:
                await asyncio.sleep(0.01)  # Simulate processing
                return {"success": True, "result": f"processed_{file_path}"}
            
            result = await indexing_service.perform_indexing(
                test_files, mock_callback, force=True
            )
            
            end_time = time.time()
            processing_time = end_time - start_time
            
            # Verify processing completed
            assert result["status"] == "completed"
            assert result["processed_files"] == len(test_files)
            
            # Verify reasonable processing time (should be fast with batching)
            assert processing_time < 10.0  # Should complete within 10 seconds
            
            # Verify performance stats
            perf_stats = result["performance_stats"]
            assert "batch_memory_history" in perf_stats
            
        finally:
            await indexing_service.shutdown()
