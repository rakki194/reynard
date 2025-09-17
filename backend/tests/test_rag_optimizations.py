"""
Test suite for RAG embedding optimizations.

Tests the enhanced embedding service, tokenization service, and performance monitoring.
"""

import pytest
import asyncio
import time
from unittest.mock import AsyncMock, patch, MagicMock
from typing import List, Dict, Any

from app.services.rag.enhanced_embedding_service import EnhancedEmbeddingService
from app.services.rag.tokenization_service import TokenizationService
from app.services.rag.performance_monitor import PerformanceMonitor


class TestTokenizationService:
    """Test tokenization service functionality."""

    def setup_method(self):
        """Set up test fixtures."""
        self.tokenizer = TokenizationService()

    def test_estimate_tokens_accurate(self):
        """Test accurate token estimation."""
        test_text = "def hello_world():\n    return 'Hello, World!'"
        
        # Test with EmbeddingGemma
        tokens = self.tokenizer.estimate_tokens_accurate(test_text, "embeddinggemma:latest")
        assert isinstance(tokens, int)
        assert tokens > 0
        
        # Test with different model
        tokens_nomic = self.tokenizer.estimate_tokens_accurate(test_text, "nomic-embed-text")
        assert isinstance(tokens_nomic, int)
        assert tokens_nomic > 0

    def test_get_optimal_chunk_size(self):
        """Test optimal chunk size retrieval."""
        chunk_size = self.tokenizer.get_optimal_chunk_size("embeddinggemma:latest")
        assert chunk_size == 410  # 80% of 512
        
        chunk_size_nomic = self.tokenizer.get_optimal_chunk_size("nomic-embed-text")
        assert chunk_size_nomic == 1638  # 80% of 2048

    def test_is_text_within_limits(self):
        """Test text limit validation."""
        short_text = "Hello world"
        long_text = "Hello world " * 1000  # Very long text
        
        assert self.tokenizer.is_text_within_limits(short_text, "embeddinggemma:latest")
        assert not self.tokenizer.is_text_within_limits(long_text, "embeddinggemma:latest")

    def test_truncate_text_to_limit(self):
        """Test text truncation."""
        long_text = "Hello world " * 1000
        truncated = self.tokenizer.truncate_text_to_limit(long_text, "embeddinggemma:latest")
        
        assert len(truncated) < len(long_text)
        assert self.tokenizer.is_text_within_limits(truncated, "embeddinggemma:latest")

    def test_get_tokenization_stats(self):
        """Test tokenization statistics."""
        stats = self.tokenizer.get_tokenization_stats()
        
        assert "tiktoken_available" in stats
        assert "sentencepiece_available" in stats
        assert "supported_models" in stats
        assert "cached_tokenizers" in stats
        assert "model_configs" in stats


class TestEnhancedEmbeddingService:
    """Test enhanced embedding service functionality."""

    @pytest.fixture
    async def embedding_service(self):
        """Create enhanced embedding service for testing."""
        service = EnhancedEmbeddingService()
        config = {
            "rag_enabled": True,
            "ollama_base_url": "http://localhost:11434",
            "rag_max_concurrent_requests": 4,
            "rag_rate_limit_per_second": 5,
            "rag_batch_size": 8,
        }
        await service.initialize(config)
        return service

    @pytest.mark.asyncio
    async def test_concurrent_batch_processing(self, embedding_service):
        """Test concurrent batch processing performance."""
        # Mock the base embedding method to avoid actual Ollama calls
        with patch.object(embedding_service, '_embed_with_ollama', new_callable=AsyncMock) as mock_embed:
            mock_embed.return_value = [0.1] * 1024
            
            texts = [f"Test text {i}" for i in range(20)]
            
            start_time = time.time()
            results = await embedding_service._embed_batch_with_ollama_concurrent(
                texts, "embeddinggemma:latest"
            )
            end_time = time.time()
            
            # Should complete in reasonable time
            assert (end_time - start_time) < 10  # Should be much faster than sequential
            assert len(results) == 20
            assert all(isinstance(r, list) for r in results)
            assert all(len(r) == 1024 for r in results)

    @pytest.mark.asyncio
    async def test_lru_cache_functionality(self, embedding_service):
        """Test LRU cache functionality."""
        # Mock embedding generation
        with patch.object(embedding_service, '_embed_with_ollama', new_callable=AsyncMock) as mock_embed:
            mock_embed.return_value = [0.1] * 1024
            
            text = "Test text for caching"
            
            # First call should miss cache
            result1 = await embedding_service.embed_text(text, "embeddinggemma:latest")
            assert embedding_service.performance_metrics["cache_misses"] == 1
            
            # Second call should hit cache
            result2 = await embedding_service.embed_text(text, "embeddinggemma:latest")
            assert embedding_service.performance_metrics["cache_hits"] == 1
            assert result1 == result2

    @pytest.mark.asyncio
    async def test_rate_limiting(self, embedding_service):
        """Test rate limiting functionality."""
        # Mock embedding generation
        with patch.object(embedding_service, '_embed_with_ollama', new_callable=AsyncMock) as mock_embed:
            mock_embed.return_value = [0.1] * 1024
            
            # Create multiple concurrent requests
            tasks = []
            for i in range(10):
                task = embedding_service.embed_text(f"Text {i}", "embeddinggemma:latest")
                tasks.append(task)
            
            # All should complete successfully
            results = await asyncio.gather(*tasks)
            assert len(results) == 10
            assert all(isinstance(r, list) for r in results)

    @pytest.mark.asyncio
    async def test_retry_logic(self, embedding_service):
        """Test exponential backoff retry logic."""
        # Mock embedding to fail first two times, then succeed
        call_count = 0
        
        async def mock_embed_with_failures(text, model):
            nonlocal call_count
            call_count += 1
            if call_count <= 2:
                raise Exception("Simulated failure")
            return [0.1] * 1024
        
        with patch.object(embedding_service, '_embed_with_ollama', side_effect=mock_embed_with_failures):
            result = await embedding_service._embed_with_retry("test text", "embeddinggemma:latest")
            
            assert call_count == 3  # Should have retried twice
            assert result == [0.1] * 1024
            assert embedding_service.performance_metrics["retry_attempts"] == 2

    @pytest.mark.asyncio
    async def test_enhanced_stats(self, embedding_service):
        """Test enhanced statistics collection."""
        stats = await embedding_service.get_enhanced_stats()
        
        assert "enhanced_features" in stats
        assert "cache_stats" in stats
        assert "tokenization_stats" in stats
        
        enhanced_features = stats["enhanced_features"]
        assert "concurrent_requests" in enhanced_features
        assert "cache_hits" in enhanced_features
        assert "cache_misses" in enhanced_features
        assert "average_latency" in enhanced_features

    def test_get_optimal_concurrency(self, embedding_service):
        """Test optimal concurrency calculation."""
        concurrency = embedding_service._get_optimal_concurrency()
        
        assert isinstance(concurrency, int)
        assert 2 <= concurrency <= 8  # Should be within reasonable bounds


class TestPerformanceMonitor:
    """Test performance monitoring functionality."""

    @pytest.fixture
    async def performance_monitor(self):
        """Create performance monitor for testing."""
        monitor = PerformanceMonitor()
        await monitor.start()
        yield monitor
        await monitor.stop()

    @pytest.mark.asyncio
    async def test_record_embedding_metrics(self, performance_monitor):
        """Test embedding metrics recording."""
        await performance_monitor.record_embedding_metrics(
            model="embeddinggemma:latest",
            latency_ms=150.0,
            success=True,
            cache_hit=False,
            tokens=100,
            batch_size=1
        )
        
        # Check that metric was added to buffer
        assert len(performance_monitor.metrics_buffer) == 1
        metric = performance_monitor.metrics_buffer[0]
        assert metric["metric_name"] == "embedding_generation"
        assert metric["model"] == "embeddinggemma:latest"
        assert metric["latency_ms"] == 150.0

    @pytest.mark.asyncio
    async def test_record_search_metrics(self, performance_monitor):
        """Test search metrics recording."""
        await performance_monitor.record_search_metrics(
            query_type="semantic",
            latency_ms=25.0,
            results_count=10,
            recall_at_10=0.92
        )
        
        assert len(performance_monitor.metrics_buffer) == 1
        metric = performance_monitor.metrics_buffer[0]
        assert metric["metric_name"] == "search_performance"
        assert metric["query_type"] == "semantic"
        assert metric["recall_at_10"] == 0.92

    @pytest.mark.asyncio
    async def test_record_optimization_metrics(self, performance_monitor):
        """Test optimization metrics recording."""
        before_metrics = {
            "recall_at_10": 0.85,
            "query_latency_ms": 5.0,
            "memory_usage_mb": 100.0
        }
        
        after_metrics = {
            "recall_at_10": 0.92,
            "query_latency_ms": 8.0,
            "memory_usage_mb": 195.0
        }
        
        await performance_monitor.record_optimization_metrics(
            optimization_type="hnsw_optimization",
            before_metrics=before_metrics,
            after_metrics=after_metrics
        )
        
        assert len(performance_monitor.metrics_buffer) == 1
        metric = performance_monitor.metrics_buffer[0]
        assert metric["metric_name"] == "optimization_impact"
        assert metric["optimization_type"] == "hnsw_optimization"
        
        improvements = metric["improvements"]
        assert "recall_at_10_improvement_pct" in improvements
        assert "query_latency_ms_improvement_pct" in improvements
        assert "memory_usage_mb_improvement_pct" in improvements

    @pytest.mark.asyncio
    async def test_performance_alerts(self, performance_monitor):
        """Test performance alert generation."""
        alerts = await performance_monitor.check_performance_alerts()
        
        # Should return list of alerts (may be empty if no issues)
        assert isinstance(alerts, list)
        for alert in alerts:
            assert "type" in alert
            assert "severity" in alert
            assert "message" in alert
            assert "timestamp" in alert

    @pytest.mark.asyncio
    async def test_optimization_recommendations(self, performance_monitor):
        """Test optimization recommendations generation."""
        recommendations = await performance_monitor.get_optimization_recommendations()
        
        # Should return list of recommendations
        assert isinstance(recommendations, list)
        for rec in recommendations:
            assert "type" in rec
            assert "priority" in rec
            assert "title" in rec
            assert "description" in rec
            assert "expected_improvement" in rec
            assert "implementation_effort" in rec

    def test_monitor_stats(self, performance_monitor):
        """Test monitor statistics."""
        stats = performance_monitor.get_monitor_stats()
        
        assert "buffer_size" in stats
        assert "buffer_capacity" in stats
        assert "flush_interval" in stats
        assert "running" in stats
        assert "thresholds" in stats


class TestIntegration:
    """Integration tests for the complete optimization system."""

    @pytest.mark.asyncio
    async def test_end_to_end_optimization_workflow(self):
        """Test complete optimization workflow."""
        # Initialize services
        embedding_service = EnhancedEmbeddingService()
        performance_monitor = PerformanceMonitor()
        
        config = {
            "rag_enabled": True,
            "ollama_base_url": "http://localhost:11434",
            "rag_max_concurrent_requests": 4,
            "rag_rate_limit_per_second": 5,
        }
        
        await embedding_service.initialize(config)
        await performance_monitor.start()
        
        try:
            # Mock embedding generation
            with patch.object(embedding_service, '_embed_with_ollama', new_callable=AsyncMock) as mock_embed:
                mock_embed.return_value = [0.1] * 1024
                
                # Test concurrent batch processing
                texts = [f"Integration test text {i}" for i in range(10)]
                start_time = time.time()
                results = await embedding_service.embed_batch(texts, "embeddinggemma:latest")
                end_time = time.time()
                
                # Verify results
                assert len(results) == 10
                assert all(isinstance(r, list) for r in results)
                
                # Record performance metrics
                await performance_monitor.record_embedding_metrics(
                    model="embeddinggemma:latest",
                    latency_ms=(end_time - start_time) * 1000,
                    success=True,
                    cache_hit=False,
                    tokens=100,
                    batch_size=10
                )
                
                # Get enhanced stats
                stats = await embedding_service.get_enhanced_stats()
                assert "enhanced_features" in stats
                assert "cache_stats" in stats
                
        finally:
            await embedding_service.shutdown()
            await performance_monitor.stop()


if __name__ == "__main__":
    pytest.main([__file__])
