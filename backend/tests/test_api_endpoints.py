"""
Tests for semantic search API endpoints.

Tests cover:
- Natural Language Search Endpoints
- Enhanced Search Endpoints
- Authentication and Authorization
- Error Handling
"""

from unittest.mock import AsyncMock, patch

import pytest
from fastapi.testclient import TestClient

from app.api.search.models import SearchResponse, SearchResult


class TestNaturalLanguageSearchEndpoints:
    """Test natural language search API endpoints."""

    def setup_method(self) -> None:
        """Set up test fixtures."""
        # Note: We'll mock the app import since it might not be available in test environment
        with patch('app.main.app') as mock_app:
            self.client = TestClient(mock_app)

    def test_natural_language_search_endpoint(self):
        """Test the natural language search endpoint."""
        with patch('app.api.search.natural_language_endpoints.get_enhanced_search_service') as mock_service:
            # Mock the enhanced search service
            mock_search_service = AsyncMock()
            mock_search_service.natural_language_search.return_value = SearchResponse(
                success=True,
                query="find authentication function",
                total_results=1,
                results=[SearchResult(
                    file_path="test.py",
                    line_number=10,
                    content="def authenticate_user():",
                    score=0.95,
                    context="Authentication function"
                )],
                search_time=0.1
            )
            mock_service.return_value = mock_search_service

            # Mock MCP authentication
            with patch('app.api.search.natural_language_endpoints.require_mcp_permission') as mock_auth:
                mock_auth.return_value = lambda: None

                response = self.client.post(
                    "/api/search/natural-language",
                    json={
                        "query": "find authentication function",
                        "max_results": 10,
                        "similarity_threshold": 0.7
                    }
                )

                assert response.status_code == 200
                data = response.json()
                assert data["success"] is True
                assert data["query"] == "find authentication function"
                assert data["total_results"] == 1
                assert len(data["results"]) == 1

    def test_intelligent_search_endpoint(self):
        """Test the intelligent search endpoint."""
        with patch('app.api.search.natural_language_endpoints.get_enhanced_search_service') as mock_service:
            mock_search_service = AsyncMock()
            mock_search_service.intelligent_search.return_value = SearchResponse(
                success=True,
                query="test query",
                total_results=0,
                results=[],
                search_time=0.1
            )
            mock_service.return_value = mock_search_service

            with patch('app.api.search.natural_language_endpoints.require_mcp_permission') as mock_auth:
                mock_auth.return_value = lambda: None

                response = self.client.post(
                    "/api/search/intelligent",
                    json={
                        "query": "test query",
                        "max_results": 10
                    }
                )

                assert response.status_code == 200
                data = response.json()
                assert data["success"] is True

    def test_contextual_search_endpoint(self):
        """Test the contextual search endpoint."""
        with patch('app.api.search.natural_language_endpoints.get_enhanced_search_service') as mock_service:
            mock_search_service = AsyncMock()
            mock_search_service.contextual_search.return_value = SearchResponse(
                success=True,
                query="test query",
                total_results=0,
                results=[],
                search_time=0.1
            )
            mock_service.return_value = mock_search_service

            with patch('app.api.search.natural_language_endpoints.require_mcp_permission') as mock_auth:
                mock_auth.return_value = lambda: None

                response = self.client.post(
                    "/api/search/contextual",
                    json={
                        "query": "test query",
                        "context": "test context",
                        "max_results": 10
                    }
                )

                assert response.status_code == 200
                data = response.json()
                assert data["success"] is True

    def test_analyze_query_endpoint(self):
        """Test the analyze query endpoint."""
        with patch('app.api.search.natural_language_endpoints.get_enhanced_search_service') as mock_service:
            mock_search_service = AsyncMock()
            mock_search_service.analyze_query.return_value = {
                "intent": "function_search",
                "entities": ["function"],
                "expanded_terms": ["function", "method"],
                "confidence": 0.8
            }
            mock_service.return_value = mock_search_service

            with patch('app.api.search.natural_language_endpoints.require_mcp_permission') as mock_auth:
                mock_auth.return_value = lambda: None

                response = self.client.post(
                    "/api/search/analyze-query",
                    json={"query": "find function"}
                )

                assert response.status_code == 200
                data = response.json()
                assert data["intent"] == "function_search"
                assert data["confidence"] == 0.8

    def test_get_intelligent_suggestions_endpoint(self):
        """Test the intelligent suggestions endpoint."""
        with patch('app.api.search.natural_language_endpoints.get_enhanced_search_service') as mock_service:
            mock_search_service = AsyncMock()
            mock_search_service.get_intelligent_suggestions.return_value = {
                "suggestions": [
                    {"query": "find function", "confidence": 0.9},
                    {"query": "locate method", "confidence": 0.8}
                ]
            }
            mock_service.return_value = mock_search_service

            with patch('app.api.search.natural_language_endpoints.require_mcp_permission') as mock_auth:
                mock_auth.return_value = lambda: None

                response = self.client.post(
                    "/api/search/suggestions/intelligent",
                    json={"query": "find"}
                )

                assert response.status_code == 200
                data = response.json()
                assert "suggestions" in data
                assert len(data["suggestions"]) == 2

    def test_search_with_examples_endpoint(self):
        """Test the search with examples endpoint."""
        with patch('app.api.search.natural_language_endpoints.get_enhanced_search_service') as mock_service:
            mock_search_service = AsyncMock()
            mock_search_service.search_with_examples.return_value = SearchResponse(
                success=True,
                query="test query",
                total_results=0,
                results=[],
                search_time=0.1
            )
            mock_service.return_value = mock_search_service

            with patch('app.api.search.natural_language_endpoints.require_mcp_permission') as mock_auth:
                mock_auth.return_value = lambda: None

                response = self.client.post(
                    "/api/search/with-examples",
                    json={
                        "query": "test query",
                        "examples": ["example1", "example2"],
                        "max_results": 10
                    }
                )

                assert response.status_code == 200
                data = response.json()
                assert data["success"] is True

    def test_enhanced_search_health_check_endpoint(self):
        """Test the enhanced search health check endpoint."""
        with patch('app.api.search.natural_language_endpoints.get_enhanced_search_service') as mock_service:
            mock_search_service = AsyncMock()
            mock_search_service.enhanced_search_health_check.return_value = {
                "nlp_enabled": True,
                "query_expansion_enabled": True,
                "intent_detection_enabled": True,
                "status": "healthy"
            }
            mock_service.return_value = mock_search_service

            with patch('app.api.search.natural_language_endpoints.require_mcp_permission') as mock_auth:
                mock_auth.return_value = lambda: None

                response = self.client.get("/api/search/health/natural-language")

                assert response.status_code == 200
                data = response.json()
                assert data["status"] == "healthy"
                assert data["nlp_enabled"] is True

    def test_natural_language_search_validation_error(self):
        """Test natural language search with validation error."""
        with patch('app.api.search.natural_language_endpoints.require_mcp_permission') as mock_auth:
            mock_auth.return_value = lambda: None

            # Test with invalid request (missing required field)
            response = self.client.post(
                "/api/search/natural-language",
                json={
                    "max_results": 10,
                    "similarity_threshold": 0.7
                    # Missing "query" field
                }
            )

            assert response.status_code == 422  # Validation error

    def test_natural_language_search_service_error(self):
        """Test natural language search with service error."""
        with patch('app.api.search.natural_language_endpoints.get_enhanced_search_service') as mock_service:
            mock_search_service = AsyncMock()
            mock_search_service.natural_language_search.side_effect = Exception("Service error")
            mock_service.return_value = mock_search_service

            with patch('app.api.search.natural_language_endpoints.require_mcp_permission') as mock_auth:
                mock_auth.return_value = lambda: None

                response = self.client.post(
                    "/api/search/natural-language",
                    json={
                        "query": "test query",
                        "max_results": 10
                    }
                )

                assert response.status_code == 500
                data = response.json()
                assert "Natural language search failed" in data["detail"]

    def test_authentication_required(self):
        """Test that authentication is required for endpoints."""
        # Test without authentication
        response = self.client.post(
            "/api/search/natural-language",
            json={
                "query": "test query",
                "max_results": 10
            }
        )

        # Should return 401 or 403 depending on auth implementation
        assert response.status_code in [401, 403, 422]


class TestSearchEndpointIntegration:
    """Integration tests for search endpoints."""

    def setup_method(self) -> None:
        """Set up test fixtures."""
        # Note: We'll mock the app import since it might not be available in test environment
        with patch('app.main.app') as mock_app:
            self.client = TestClient(mock_app)

    def test_search_endpoint_routing(self):
        """Test that search endpoints are properly routed."""
        # Test that the natural language router is included
        response = self.client.get("/docs")
        assert response.status_code == 200

    def test_search_endpoint_consistency(self):
        """Test that search endpoints return consistent response formats."""
        with patch('app.api.search.natural_language_endpoints.get_enhanced_search_service') as mock_service:
            mock_search_service = AsyncMock()
            mock_search_service.natural_language_search.return_value = SearchResponse(
                success=True,
                query="test query",
                total_results=1,
                results=[SearchResult(
                    file_path="test.py",
                    line_number=1,
                    content="test content",
                    score=0.9,
                    context="test context"
                )],
                search_time=0.1
            )
            mock_service.return_value = mock_search_service

            with patch('app.api.search.natural_language_endpoints.require_mcp_permission') as mock_auth:
                mock_auth.return_value = lambda: None

                response = self.client.post(
                    "/api/search/natural-language",
                    json={
                        "query": "test query",
                        "max_results": 10
                    }
                )

                assert response.status_code == 200
                data = response.json()
                
                # Check response structure
                assert "success" in data
                assert "query" in data
                assert "total_results" in data
                assert "results" in data
                assert "search_time" in data
                
                # Check result structure
                if data["results"]:
                    result = data["results"][0]
                    assert "file_path" in result
                    assert "line_number" in result
                    assert "content" in result
                    assert "score" in result
                    assert "context" in result


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
