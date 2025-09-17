"""
Tests for embedding visualization API endpoints.

This module tests the embedding visualization API endpoints for
dimensionality reduction and visualization functionality.
"""

from datetime import datetime
from unittest.mock import AsyncMock, MagicMock, patch

from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.api.embedding_visualization import (
    CacheStatsResponse,
    EmbeddingQualityRequest,
    EmbeddingReductionRequest,
    router,
)

# Create test app
app = FastAPI()
app.include_router(router)


class TestEmbeddingReductionEndpoint:
    """Test the embedding dimensionality reduction endpoint."""

    def test_reduce_embeddings_success(self):
        """Test successful embedding dimensionality reduction."""
        with patch(
            "app.api.embedding_visualization.embedding_viz_service"
        ) as mock_service:
            # Mock the service
            mock_result = MagicMock()
            mock_result.success = True
            mock_result.method = "pca"
            mock_result.transformed_data = [[1.0, 2.0], [3.0, 4.0]]
            mock_result.original_indices = [0, 1]
            mock_result.parameters = {"n_components": 2}
            mock_result.metadata = {"samples": 100}
            mock_result.processing_time_ms = 1500
            mock_result.job_id = "test-job-id"
            mock_result.cached = False
            mock_result.error = None

            mock_service.perform_reduction = AsyncMock(return_value=mock_result)

            # Create test client
            client = TestClient(app)

            # Test request
            request_data = {
                "method": "pca",
                "filters": {"category": "text"},
                "parameters": {"n_components": 2},
                "max_samples": 1000,
            }

            response = client.post(
                "/api/embedding-visualization/reduce", json=request_data
            )

            assert response.status_code == 200
            data = response.json()
            assert data["success"] is True
            assert data["method"] == "pca"
            assert data["transformed_data"] == [[1.0, 2.0], [3.0, 4.0]]
            assert data["original_indices"] == [0, 1]
            assert data["processing_time_ms"] == 1500
            assert data["metadata"]["samples"] == 100

    def test_reduce_embeddings_invalid_method(self):
        """Test embedding reduction with invalid method."""
        client = TestClient(app)

        # Test with invalid method
        request_data = {
            "method": "invalid_method",
            "filters": {"category": "text"},
            "parameters": {"n_components": 2},
            "max_samples": 1000,
        }

        response = client.post("/api/embedding-visualization/reduce", json=request_data)
        assert response.status_code == 400

    def test_reduce_embeddings_service_error(self):
        """Test embedding reduction with service error."""
        with patch(
            "app.api.embedding_visualization.embedding_viz_service"
        ) as mock_service:
            # Mock the service to raise an exception
            mock_service.perform_reduction = AsyncMock(
                side_effect=Exception("Service error")
            )

            # Create test client
            client = TestClient(app)

            # Test request
            request_data = {
                "method": "pca",
                "filters": {"category": "text"},
                "parameters": {"n_components": 2},
                "max_samples": 1000,
            }

            response = client.post(
                "/api/embedding-visualization/reduce", json=request_data
            )

            assert response.status_code == 500
            data = response.json()
            assert data["detail"] == "Service error"

    def test_reduce_embeddings_invalid_request(self):
        """Test embedding reduction with invalid request data."""
        client = TestClient(app)

        # Test with missing required field
        request_data = {
            "filters": {"category": "text"},
            "parameters": {"n_components": 2},
            "max_samples": 1000,
        }

        response = client.post("/api/embedding-visualization/reduce", json=request_data)
        assert response.status_code == 422

    def test_reduce_embeddings_validation_errors(self):
        """Test embedding reduction with validation errors."""
        client = TestClient(app)

        # Test with invalid method (this should trigger validation error)
        request_data = {
            "method": "invalid_method",
            "filters": {"category": "text"},
            "parameters": {"n_components": 2},
            "max_samples": 1000,
        }

        response = client.post("/api/embedding-visualization/reduce", json=request_data)
        assert response.status_code == 400  # Invalid method returns 400, not 422


class TestEmbeddingStatsEndpoint:
    """Test the embedding statistics endpoint."""

    def test_get_embedding_stats_success(self):
        """Test successful embedding statistics retrieval."""
        with patch(
            "app.api.embedding_visualization.embedding_viz_service"
        ) as mock_service:
            # Mock the service
            mock_stats = MagicMock()
            mock_stats.total_embeddings = 1000
            mock_stats.embedding_dimension = 512
            mock_stats.mean_values = [0.1, 0.2, 0.3]
            mock_stats.std_values = [0.05, 0.1, 0.15]
            mock_stats.min_values = [-1.0, -0.5, 0.0]
            mock_stats.max_values = [1.0, 0.5, 1.0]
            mock_stats.quality_score = 0.85
            mock_stats.last_updated = datetime.now()

            mock_service.get_embedding_stats = AsyncMock(return_value=mock_stats)

            # Create test client
            client = TestClient(app)

            response = client.get("/api/embedding-visualization/stats")

            assert response.status_code == 200
            data = response.json()
            assert data["total_embeddings"] == 1000
            assert data["embedding_dimension"] == 512
            assert data["mean_values"] == [0.1, 0.2, 0.3]
            assert data["std_values"] == [0.05, 0.1, 0.15]
            assert data["quality_score"] == 0.85
            assert "last_updated" in data

    def test_get_embedding_stats_service_error(self):
        """Test embedding statistics with service error."""
        with patch(
            "app.api.embedding_visualization.embedding_viz_service"
        ) as mock_service:
            # Mock the service to raise an exception
            mock_service.get_embedding_stats = AsyncMock(
                side_effect=Exception("Service error")
            )

            # Create test client
            client = TestClient(app)

            response = client.get("/api/embedding-visualization/stats")

            assert response.status_code == 500
            data = response.json()
            assert data["detail"] == "Service error"


class TestEmbeddingQualityEndpoint:
    """Test the embedding quality assessment endpoint."""

    def test_assess_embedding_quality_success(self):
        """Test successful embedding quality assessment."""
        with patch(
            "app.api.embedding_visualization.embedding_viz_service"
        ) as mock_service:
            # Mock the service
            mock_quality = MagicMock()
            mock_quality.overall_score = 0.85
            mock_quality.coherence_score = 0.9
            mock_quality.separation_score = 0.8
            mock_quality.density_score = 0.85
            mock_quality.distribution_score = 0.8
            mock_quality.recommendations = ["Increase sample size", "Adjust parameters"]
            mock_quality.issues = []

            mock_service.analyze_embedding_quality = AsyncMock(
                return_value=mock_quality
            )

            # Create test client
            client = TestClient(app)

            # Test request
            request_data = {
                "embeddings": [[1.0, 2.0, 3.0], [4.0, 5.0, 6.0], [7.0, 8.0, 9.0]]
            }

            response = client.post(
                "/api/embedding-visualization/quality", json=request_data
            )

            assert response.status_code == 200
            data = response.json()
            assert data["overall_score"] == 0.85
            assert data["coherence_score"] == 0.9
            assert data["separation_score"] == 0.8
            assert data["density_score"] == 0.85
            assert data["distribution_score"] == 0.8
            assert data["recommendations"] == [
                "Increase sample size",
                "Adjust parameters",
            ]
            assert data["issues"] == []

    def test_assess_embedding_quality_service_error(self):
        """Test embedding quality assessment with service error."""
        with patch(
            "app.api.embedding_visualization.embedding_viz_service"
        ) as mock_service:
            # Mock the service to raise an exception
            mock_service.analyze_embedding_quality = AsyncMock(
                side_effect=Exception("Service error")
            )

            # Create test client
            client = TestClient(app)

            # Test request
            request_data = {
                "embeddings": [[1.0, 2.0, 3.0], [4.0, 5.0, 6.0], [7.0, 8.0, 9.0]]
            }

            response = client.post(
                "/api/embedding-visualization/quality", json=request_data
            )

            assert response.status_code == 500
            data = response.json()
            assert data["detail"] == "Service error"

    def test_assess_embedding_quality_invalid_request(self):
        """Test embedding quality assessment with invalid request data."""
        client = TestClient(app)

        # Test with missing required field
        request_data = {}

        response = client.post(
            "/api/embedding-visualization/quality", json=request_data
        )
        assert response.status_code == 422


class TestEmbeddingMethodsEndpoint:
    """Test the embedding methods endpoint."""

    def test_get_available_methods_success(self):
        """Test successful methods retrieval."""
        with patch(
            "app.api.embedding_visualization.embedding_viz_service"
        ) as mock_service:
            # Mock the service
            mock_service.get_available_methods = AsyncMock(
                return_value={
                    "pca": {"parameters": {"n_components": "int"}},
                    "tsne": {"parameters": {"perplexity": "float"}},
                    "umap": {"parameters": {"n_neighbors": "int"}},
                }
            )

            # Create test client
            client = TestClient(app)

            response = client.get("/api/embedding-visualization/methods")

            assert response.status_code == 200
            data = response.json()
            assert "pca" in data
            assert "tsne" in data
            assert "umap" in data

    def test_get_available_methods_service_error(self):
        """Test methods retrieval with service error."""
        with patch(
            "app.api.embedding_visualization.embedding_viz_service"
        ) as mock_service:
            # Mock the service to raise an exception
            mock_service.get_available_methods = AsyncMock(
                side_effect=Exception("Service error")
            )

            # Create test client
            client = TestClient(app)

            response = client.get("/api/embedding-visualization/methods")

            assert response.status_code == 500
            data = response.json()
            assert data["detail"] == "Service error"


class TestEmbeddingCacheEndpoint:
    """Test the embedding cache management endpoints."""

    def test_get_cache_stats_success(self):
        """Test successful cache stats retrieval."""
        with patch(
            "app.api.embedding_visualization.embedding_viz_service"
        ) as mock_service:
            # Mock the service
            mock_service.get_cache_stats = AsyncMock(
                return_value={
                    "total_entries": 10,
                    "total_size_bytes": 1024,
                    "default_ttl_seconds": 3600,
                    "cache_hit_rate": 0.85,
                    "oldest_entry": datetime.now(),
                    "newest_entry": datetime.now(),
                }
            )

            # Create test client
            client = TestClient(app)

            response = client.get("/api/embedding-visualization/cache/stats")

            assert response.status_code == 200
            data = response.json()
            assert data["total_entries"] == 10
            assert data["total_size_bytes"] == 1024
            assert data["default_ttl_seconds"] == 3600
            assert data["cache_hit_rate"] == 0.85

    def test_clear_cache_success(self):
        """Test successful cache clearing."""
        with patch(
            "app.api.embedding_visualization.embedding_viz_service"
        ) as mock_service:
            # Mock the service
            mock_service.clear_cache = AsyncMock(return_value={"cleared_entries": 5})

            # Create test client
            client = TestClient(app)

            response = client.delete("/api/embedding-visualization/cache")

            assert response.status_code == 200
            data = response.json()
            assert data["cleared_entries"] == 5


class TestEmbeddingHealthEndpoint:
    """Test the embedding health endpoint."""

    def test_get_embedding_health_success(self):
        """Test successful embedding health check."""
        with patch(
            "app.api.embedding_visualization.embedding_viz_service"
        ) as mock_service:
            # Mock the service
            mock_stats = MagicMock()
            mock_stats.total_embeddings = 1000
            mock_stats.embedding_dimension = 512

            mock_service.get_embedding_stats = AsyncMock(return_value=mock_stats)

            # Create test client
            client = TestClient(app)

            response = client.get("/api/embedding-visualization/health")

            assert response.status_code == 200
            data = response.json()
            assert data["status"] == "healthy"
            assert data["service"] == "embedding-visualization"
            assert data["total_embeddings"] == 1000
            assert data["embedding_dimension"] == 512

    def test_get_embedding_health_service_error(self):
        """Test embedding health check with service error."""
        with patch(
            "app.api.embedding_visualization.embedding_viz_service"
        ) as mock_service:
            # Mock the service to raise an exception
            mock_service.get_embedding_stats = AsyncMock(
                side_effect=Exception("Service error")
            )

            # Create test client
            client = TestClient(app)

            response = client.get("/api/embedding-visualization/health")

            assert (
                response.status_code == 200
            )  # Health endpoint returns 200 even on error
            data = response.json()
            assert data["status"] == "unhealthy"
            assert data["service"] == "embedding-visualization"
            assert "error" in data


class TestEmbeddingModels:
    """Test the embedding visualization API models."""

    def test_embedding_reduction_request_valid(self):
        """Test EmbeddingReductionRequest with valid data."""
        request = EmbeddingReductionRequest(
            method="pca",
            filters={"category": "text"},
            parameters={"n_components": 2},
            max_samples=1000,
        )

        assert request.method == "pca"
        assert request.filters == {"category": "text"}
        assert request.parameters == {"n_components": 2}
        assert request.max_samples == 1000

    def test_embedding_reduction_request_defaults(self):
        """Test EmbeddingReductionRequest with default values."""
        request = EmbeddingReductionRequest(method="pca")

        assert request.method == "pca"
        assert request.filters is None
        assert request.parameters is None
        assert request.max_samples == 10000

    def test_embedding_quality_request_valid(self):
        """Test EmbeddingQualityRequest with valid data."""
        request = EmbeddingQualityRequest(embeddings=[[1.0, 2.0], [3.0, 4.0]])

        assert request.embeddings == [[1.0, 2.0], [3.0, 4.0]]

    def test_embedding_quality_request_empty(self):
        """Test EmbeddingQualityRequest with empty embeddings."""
        request = EmbeddingQualityRequest(embeddings=[])

        assert request.embeddings == []

    def test_cache_stats_response_valid(self):
        """Test CacheStatsResponse with valid data."""
        response = CacheStatsResponse(
            total_entries=10,
            total_size_bytes=1024,
            default_ttl_seconds=3600,
            cache_hit_rate=0.85,
            oldest_entry="2023-01-01T00:00:00",
            newest_entry="2023-01-02T00:00:00",
        )

        assert response.total_entries == 10
        assert response.total_size_bytes == 1024
        assert response.default_ttl_seconds == 3600
        assert response.cache_hit_rate == 0.85
        assert response.oldest_entry == "2023-01-01T00:00:00"
        assert response.newest_entry == "2023-01-02T00:00:00"
