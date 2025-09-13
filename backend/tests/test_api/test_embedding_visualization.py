"""
Tests for embedding visualization API endpoints.

This module tests the embedding visualization API endpoints for
dimensionality reduction and visualization functionality.
"""

import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from fastapi.testclient import TestClient
from fastapi import FastAPI
from datetime import datetime
import json

from app.api.embedding_visualization import router
from app.api.embedding_visualization import (
    EmbeddingReductionRequest,
    EmbeddingReductionResponse,
    EmbeddingStatsResponse,
    EmbeddingQualityRequest,
    EmbeddingQualityResponse,
    CacheStatsResponse,
)


# Create test app
app = FastAPI()
app.include_router(router)


class TestEmbeddingReductionEndpoint:
    """Test the embedding dimensionality reduction endpoint."""

    def test_reduce_embeddings_success(self):
        """Test successful embedding dimensionality reduction."""
        with patch('app.api.embedding_visualization.embedding_viz_service') as mock_service:
            # Mock the service
            mock_service.reduce_embeddings.return_value = MagicMock(
                method="pca",
                reduced_embeddings=[[1.0, 2.0], [3.0, 4.0]],
                explained_variance_ratio=[0.8, 0.2],
                processing_time=1.5,
                metadata={"samples": 100}
            )
            
            # Create test client
            client = TestClient(app)
            
            # Test request
            request_data = {
                "method": "pca",
                "filters": {"category": "text"},
                "parameters": {"n_components": 2},
                "max_samples": 1000
            }
            
            response = client.post("/api/embedding-visualization/reduce", json=request_data)
            
            assert response.status_code == 200
            data = response.json()
            assert data["success"] is True
            assert data["method"] == "pca"
            assert data["reduced_embeddings"] == [[1.0, 2.0], [3.0, 4.0]]
            assert data["explained_variance_ratio"] == [0.8, 0.2]
            assert data["processing_time"] == 1.5
            assert data["metadata"]["samples"] == 100

    def test_reduce_embeddings_invalid_method(self):
        """Test embedding reduction with invalid method."""
        client = TestClient(app)
        
        # Test with invalid method
        request_data = {
            "method": "invalid_method",
            "filters": {"category": "text"},
            "parameters": {"n_components": 2},
            "max_samples": 1000
        }
        
        response = client.post("/api/embedding-visualization/reduce", json=request_data)
        assert response.status_code == 400

    def test_reduce_embeddings_service_error(self):
        """Test embedding reduction with service error."""
        with patch('app.api.embedding_visualization.embedding_viz_service') as mock_service:
            # Mock the service to raise an exception
            mock_service.reduce_embeddings.side_effect = Exception("Service error")
            
            # Create test client
            client = TestClient(app)
            
            # Test request
            request_data = {
                "method": "pca",
                "filters": {"category": "text"},
                "parameters": {"n_components": 2},
                "max_samples": 1000
            }
            
            response = client.post("/api/embedding-visualization/reduce", json=request_data)
            
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
            "max_samples": 1000
        }
        
        response = client.post("/api/embedding-visualization/reduce", json=request_data)
        assert response.status_code == 422

    def test_reduce_embeddings_validation_errors(self):
        """Test embedding reduction with validation errors."""
        client = TestClient(app)
        
        # Test with invalid field values
        request_data = {
            "method": "pca",
            "filters": {"category": "text"},
            "parameters": {"n_components": 2},
            "max_samples": -1  # Invalid max_samples (should be positive)
        }
        
        response = client.post("/api/embedding-visualization/reduce", json=request_data)
        assert response.status_code == 422


class TestEmbeddingStatsEndpoint:
    """Test the embedding statistics endpoint."""

    def test_get_embedding_stats_success(self):
        """Test successful embedding statistics retrieval."""
        with patch('app.api.embedding_visualization.embedding_viz_service') as mock_service:
            # Mock the service
            mock_service.get_embedding_stats.return_value = MagicMock(
                total_embeddings=1000,
                dimensions=512,
                categories=["text", "image"],
                quality_score=0.85,
                last_updated=datetime.now()
            )
            
            # Create test client
            client = TestClient(app)
            
            response = client.get("/api/embedding-visualization/stats")
            
            assert response.status_code == 200
            data = response.json()
            assert data["success"] is True
            assert data["total_embeddings"] == 1000
            assert data["dimensions"] == 512
            assert data["categories"] == ["text", "image"]
            assert data["quality_score"] == 0.85
            assert "last_updated" in data

    def test_get_embedding_stats_service_error(self):
        """Test embedding statistics with service error."""
        with patch('app.api.embedding_visualization.embedding_viz_service') as mock_service:
            # Mock the service to raise an exception
            mock_service.get_embedding_stats.side_effect = Exception("Service error")
            
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
        with patch('app.api.embedding_visualization.embedding_viz_service') as mock_service:
            # Mock the service
            mock_service.assess_embedding_quality.return_value = MagicMock(
                quality_score=0.85,
                metrics={
                    "coherence": 0.9,
                    "separation": 0.8,
                    "density": 0.85
                },
                recommendations=["Increase sample size", "Adjust parameters"],
                processing_time=2.0
            )
            
            # Create test client
            client = TestClient(app)
            
            # Test request
            request_data = {
                "filters": {"category": "text"},
                "quality_metrics": ["coherence", "separation"],
                "threshold": 0.8
            }
            
            response = client.post("/api/embedding-visualization/quality", json=request_data)
            
            assert response.status_code == 200
            data = response.json()
            assert data["success"] is True
            assert data["quality_score"] == 0.85
            assert data["metrics"]["coherence"] == 0.9
            assert data["metrics"]["separation"] == 0.8
            assert data["recommendations"] == ["Increase sample size", "Adjust parameters"]
            assert data["processing_time"] == 2.0

    def test_assess_embedding_quality_service_error(self):
        """Test embedding quality assessment with service error."""
        with patch('app.api.embedding_visualization.embedding_viz_service') as mock_service:
            # Mock the service to raise an exception
            mock_service.assess_embedding_quality.side_effect = Exception("Service error")
            
            # Create test client
            client = TestClient(app)
            
            # Test request
            request_data = {
                "filters": {"category": "text"},
                "quality_metrics": ["coherence", "separation"],
                "threshold": 0.8
            }
            
            response = client.post("/api/embedding-visualization/quality", json=request_data)
            
            assert response.status_code == 500
            data = response.json()
            assert data["detail"] == "Service error"

    def test_assess_embedding_quality_invalid_request(self):
        """Test embedding quality assessment with invalid request data."""
        client = TestClient(app)
        
        # Test with missing required field
        request_data = {
            "filters": {"category": "text"},
            "threshold": 0.8
        }
        
        response = client.post("/api/embedding-visualization/quality", json=request_data)
        assert response.status_code == 422


class TestEmbeddingCacheEndpoint:
    """Test the embedding cache management endpoints."""

    def test_get_cache_stats_success(self):
        """Test successful cache stats retrieval."""
        with patch('app.api.embedding_visualization.embedding_viz_service') as mock_service:
            # Mock the service
            mock_service.get_cache_stats.return_value = {
                'total_entries': 10,
                'total_size_bytes': 1024,
                'default_ttl_seconds': 3600,
                'cache_hit_rate': 0.85,
                'oldest_entry': datetime.now(),
                'newest_entry': datetime.now()
            }
            
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
        with patch('app.api.embedding_visualization.embedding_viz_service') as mock_service:
            # Mock the service
            mock_service.clear_cache.return_value = {"cleared_entries": 5}
            
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
        with patch('app.api.embedding_visualization.embedding_viz_service') as mock_service:
            # Mock the service
            mock_service.get_embedding_stats.return_value = MagicMock(
                total_embeddings=1000,
                embedding_dimension=512
            )
            
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
        with patch('app.api.embedding_visualization.embedding_viz_service') as mock_service:
            # Mock the service to raise an exception
            mock_service.get_embedding_stats.side_effect = Exception("Service error")
            
            # Create test client
            client = TestClient(app)
            
            response = client.get("/api/embedding-visualization/health")
            
            assert response.status_code == 200  # Health endpoint returns 200 even on error
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
            max_samples=1000
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
        request = EmbeddingQualityRequest(
            filters={"category": "text"},
            quality_metrics=["coherence", "separation"],
            threshold=0.8
        )
        
        assert request.filters == {"category": "text"}
        assert request.quality_metrics == ["coherence", "separation"]
        assert request.threshold == 0.8

    def test_embedding_quality_request_defaults(self):
        """Test EmbeddingQualityRequest with default values."""
        request = EmbeddingQualityRequest(quality_metrics=["coherence"])
        
        assert request.filters is None
        assert request.quality_metrics == ["coherence"]
        assert request.threshold == 0.5

    def test_embedding_comparison_request_valid(self):
        """Test EmbeddingComparisonRequest with valid data."""
        request = EmbeddingComparisonRequest(
            embedding1_id="emb1",
            embedding2_id="emb2",
            comparison_method="cosine",
            normalize=True
        )
        
        assert request.embedding1_id == "emb1"
        assert request.embedding2_id == "emb2"
        assert request.comparison_method == "cosine"
        assert request.normalize is True

    def test_embedding_comparison_request_defaults(self):
        """Test EmbeddingComparisonRequest with default values."""
        request = EmbeddingComparisonRequest(
            embedding1_id="emb1",
            embedding2_id="emb2"
        )
        
        assert request.embedding1_id == "emb1"
        assert request.embedding2_id == "emb2"
        assert request.comparison_method == "cosine"
        assert request.normalize is False

    def test_embedding_export_request_valid(self):
        """Test EmbeddingExportRequest with valid data."""
        request = EmbeddingExportRequest(
            filters={"category": "text"},
            export_format="json",
            include_metadata=True,
            compression=False
        )
        
        assert request.filters == {"category": "text"}
        assert request.export_format == "json"
        assert request.include_metadata is True
        assert request.compression is False

    def test_embedding_export_request_defaults(self):
        """Test EmbeddingExportRequest with default values."""
        request = EmbeddingExportRequest(export_format="json")
        
        assert request.filters is None
        assert request.export_format == "json"
        assert request.include_metadata is False
        assert request.compression is False

    def test_embedding_import_request_valid(self):
        """Test EmbeddingImportRequest with valid data."""
        request = EmbeddingImportRequest(
            file_path="/tmp/embeddings.json",
            import_format="json",
            validate_data=True,
            overwrite_existing=False
        )
        
        assert request.file_path == "/tmp/embeddings.json"
        assert request.import_format == "json"
        assert request.validate_data is True
        assert request.overwrite_existing is False

    def test_embedding_import_request_defaults(self):
        """Test EmbeddingImportRequest with default values."""
        request = EmbeddingImportRequest(
            file_path="/tmp/embeddings.json",
            import_format="json"
        )
        
        assert request.file_path == "/tmp/embeddings.json"
        assert request.import_format == "json"
        assert request.validate_data is False
        assert request.overwrite_existing is False
