"""
Tests for embedding visualization service.

This module tests the EmbeddingVisualizationService class and its methods
for dimensionality reduction, quality analysis, and caching functionality.
"""

from datetime import datetime, timedelta
from unittest.mock import MagicMock, patch

import numpy as np
import pytest

from app.services.processing.embedding_visualization_service import (
    EmbeddingQualityMetrics,
    EmbeddingReductionResult,
    EmbeddingStats,
    EmbeddingVisualizationService,
)


class TestEmbeddingVisualizationService:
    """Test the EmbeddingVisualizationService class."""

    @pytest.fixture
    def service(self):
        """Create a service instance for testing."""
        return EmbeddingVisualizationService()

    @pytest.fixture
    def sample_embeddings(self):
        """Create sample embedding data for testing."""
        return np.random.rand(100, 512).astype(np.float32)

    def test_service_initialization(self, service):
        """Test service initialization."""
        assert service is not None
        assert hasattr(service, "cache")
        assert hasattr(service, "cache_ttl")
        assert service.cache_ttl == 3600

    @pytest.mark.asyncio
    async def test_get_embedding_stats_success(self, service, sample_embeddings):
        """Test successful embedding statistics retrieval."""
        with patch.object(service, "_load_embeddings", return_value=sample_embeddings):
            stats = await service.get_embedding_stats()

            assert isinstance(stats, EmbeddingStats)
            assert stats.total_embeddings == 100
            assert stats.embedding_dimension == 512
            assert len(stats.mean_values) == 512
            assert len(stats.std_values) == 512
            assert len(stats.min_values) == 512
            assert len(stats.max_values) == 512
            assert 0 <= stats.quality_score <= 1

    @pytest.mark.asyncio
    async def test_get_embedding_stats_no_embeddings(self, service):
        """Test embedding statistics with no embeddings."""
        with patch.object(service, "_load_embeddings", return_value=np.array([])):
            stats = await service.get_embedding_stats()

            assert isinstance(stats, EmbeddingStats)
            assert stats.total_embeddings == 0
            assert stats.embedding_dimension == 0
            assert stats.mean_values == []
            assert stats.std_values == []
            assert stats.min_values == []
            assert stats.max_values == []
            assert stats.quality_score == 0.0

    @pytest.mark.asyncio
    async def test_perform_reduction_pca_success(self, service, sample_embeddings):
        """Test successful PCA reduction."""
        with patch.object(service, "_load_embeddings", return_value=sample_embeddings):
            with patch(
                "app.services.embedding_visualization_service.get_dimensionality_reducer"
            ) as mock_get_reducer:
                mock_reducer = MagicMock()
                mock_reducer.reduce.return_value = (
                    np.random.rand(100, 2),
                    [0.8, 0.2],
                    {"n_components": 2},
                )
                mock_get_reducer.return_value = mock_reducer

                result = await service.perform_reduction(
                    method="pca", parameters={"n_components": 2}
                )

                assert isinstance(result, EmbeddingReductionResult)
                assert result.success is True
                assert result.method == "pca"
                assert len(result.transformed_data) == 100
                assert len(result.transformed_data[0]) == 2
                assert result.original_indices == list(range(100))
                assert result.parameters["n_components"] == 2

    @pytest.mark.asyncio
    async def test_perform_reduction_invalid_method(self, service, sample_embeddings):
        """Test reduction with invalid method."""
        with patch.object(service, "_load_embeddings", return_value=sample_embeddings):
            result = await service.perform_reduction(
                method="invalid_method", parameters={}
            )

            assert isinstance(result, EmbeddingReductionResult)
            assert result.success is False
            assert result.method == "invalid_method"
            assert "Unsupported reduction method" in result.error

    @pytest.mark.asyncio
    async def test_perform_reduction_no_embeddings(self, service):
        """Test reduction with no embeddings."""
        with patch.object(service, "_load_embeddings", return_value=np.array([])):
            result = await service.perform_reduction(
                method="pca", parameters={"n_components": 2}
            )

            assert isinstance(result, EmbeddingReductionResult)
            assert result.success is False
            assert "No embeddings found" in result.error

    @pytest.mark.asyncio
    async def test_analyze_embedding_quality_success(self, service):
        """Test successful embedding quality analysis."""
        embeddings = [
            [1.0, 2.0, 3.0],
            [1.1, 2.1, 3.1],
            [4.0, 5.0, 6.0],
            [4.1, 5.1, 6.1],
        ]

        quality = await service.analyze_embedding_quality(embeddings)

        assert isinstance(quality, EmbeddingQualityMetrics)
        assert 0 <= quality.overall_score <= 1
        assert 0 <= quality.coherence_score <= 1
        assert 0 <= quality.separation_score <= 1
        assert 0 <= quality.density_score <= 1
        assert 0 <= quality.distribution_score <= 1
        assert isinstance(quality.recommendations, list)
        assert isinstance(quality.issues, list)

    @pytest.mark.asyncio
    async def test_analyze_embedding_quality_empty(self, service):
        """Test embedding quality analysis with empty embeddings."""
        quality = await service.analyze_embedding_quality([])

        assert isinstance(quality, EmbeddingQualityMetrics)
        assert quality.overall_score == 0.0
        assert quality.coherence_score == 0.0
        assert quality.separation_score == 0.0
        assert quality.density_score == 0.0
        assert quality.distribution_score == 0.0

    @pytest.mark.asyncio
    async def test_get_available_methods(self, service):
        """Test getting available reduction methods."""
        methods = await service.get_available_methods()

        assert isinstance(methods, dict)
        assert "pca" in methods
        assert "tsne" in methods
        assert "umap" in methods

        # Check that each method has parameter information
        for method_name, method_info in methods.items():
            assert "parameters" in method_info
            assert isinstance(method_info["parameters"], dict)

    @pytest.mark.asyncio
    async def test_get_cache_stats(self, service):
        """Test getting cache statistics."""
        # Add some test entries to cache
        service.cache["test_key_1"] = {
            "transformed_data": [[1.0, 2.0], [3.0, 4.0]],
            "original_indices": [0, 1],
            "parameters": {"n_components": 2},
            "metadata": {"samples": 2},
            "timestamp": datetime.now() - timedelta(hours=1),
            "ttl": 3600,
        }
        service.cache["test_key_2"] = {
            "transformed_data": [[5.0, 6.0], [7.0, 8.0]],
            "original_indices": [2, 3],
            "parameters": {"n_components": 2},
            "metadata": {"samples": 2},
            "timestamp": datetime.now() - timedelta(minutes=30),
            "ttl": 3600,
        }

        stats = await service.get_cache_stats()

        assert isinstance(stats, dict)
        assert stats["total_entries"] == 2
        assert stats["total_size_bytes"] > 0
        assert stats["default_ttl_seconds"] == 3600
        assert 0 <= stats["cache_hit_rate"] <= 1
        assert stats["oldest_entry"] is not None
        assert stats["newest_entry"] is not None

    @pytest.mark.asyncio
    async def test_get_cache_stats_empty(self, service):
        """Test getting cache statistics with empty cache."""
        stats = await service.get_cache_stats()

        assert isinstance(stats, dict)
        assert stats["total_entries"] == 0
        assert stats["total_size_bytes"] == 0
        assert stats["cache_hit_rate"] == 0.0
        assert stats["oldest_entry"] is None
        assert stats["newest_entry"] is None

    @pytest.mark.asyncio
    async def test_clear_cache(self, service):
        """Test clearing cache."""
        # Add some test entries to cache
        service.cache["test_key_1"] = {
            "transformed_data": [[1.0, 2.0], [3.0, 4.0]],
            "original_indices": [0, 1],
            "parameters": {"n_components": 2},
            "metadata": {"samples": 2},
            "timestamp": datetime.now(),
            "ttl": 3600,
        }
        service.cache["test_key_2"] = {
            "transformed_data": [[5.0, 6.0], [7.0, 8.0]],
            "original_indices": [2, 3],
            "parameters": {"n_components": 2},
            "metadata": {"samples": 2},
            "timestamp": datetime.now(),
            "ttl": 3600,
        }

        assert len(service.cache) == 2

        result = await service.clear_cache()

        assert isinstance(result, dict)
        assert result["cleared_entries"] == 2
        assert len(service.cache) == 0

    @pytest.mark.asyncio
    async def test_clear_cache_empty(self, service):
        """Test clearing empty cache."""
        result = await service.clear_cache()

        assert isinstance(result, dict)
        assert result["cleared_entries"] == 0

    def test_cache_validity_check(self, service):
        """Test cache validity checking logic."""
        # Test valid cache entry
        valid_entry = {
            "transformed_data": [[1.0, 2.0]],
            "original_indices": [0],
            "parameters": {"n_components": 2},
            "metadata": {"samples": 1},
            "timestamp": datetime.now() - timedelta(minutes=30),
            "ttl": 3600,
        }

        assert service._is_cache_valid(valid_entry)

        # Test expired cache entry
        expired_entry = {
            "transformed_data": [[1.0, 2.0]],
            "original_indices": [0],
            "parameters": {"n_components": 2},
            "metadata": {"samples": 1},
            "timestamp": datetime.now() - timedelta(hours=2),
            "ttl": 3600,
        }

        assert not service._is_cache_valid(expired_entry)

    def test_cache_key_generation(self, service):
        """Test cache key generation."""
        key1 = service._generate_cache_key(
            "pca", {"category": "text"}, {"n_components": 2}, 1000, 42
        )
        key2 = service._generate_cache_key(
            "pca", {"category": "text"}, {"n_components": 2}, 1000, 42
        )
        key3 = service._generate_cache_key(
            "tsne", {"category": "text"}, {"n_components": 2}, 1000, 42
        )

        # Same parameters should generate same key
        assert key1 == key2

        # Different method should generate different key
        assert key1 != key3

    @pytest.mark.asyncio
    async def test_perform_reduction_error_handling(self, service, sample_embeddings):
        """Test error handling in perform_reduction."""
        with patch.object(service, "_load_embeddings", return_value=sample_embeddings):
            with patch(
                "app.services.embedding_visualization_service.get_dimensionality_reducer"
            ) as mock_get_reducer:
                mock_reducer = MagicMock()
                mock_reducer.reduce.side_effect = Exception("Test error")
                mock_get_reducer.return_value = mock_reducer

                result = await service.perform_reduction(
                    method="pca", parameters={"n_components": 2}
                )

                assert isinstance(result, EmbeddingReductionResult)
                assert result.success is False
                assert "Test error" in result.error
