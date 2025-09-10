"""
Tests for NLWeb API endpoints.

This module tests all NLWeb endpoints including tool suggestions,
health monitoring, performance stats, and integration with Ollama.
"""

import json
import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from fastapi.testclient import TestClient
from datetime import datetime

from app.services.nlweb.models import (
    NLWebSuggestionRequest,
    NLWebSuggestionResponse,
    NLWebHealthStatus,
    NLWebPerformanceStats,
    NLWebTool,
    NLWebContext,
    NLWebAskRequest,
    NLWebVerificationResponse
)


class TestNLWebToolSuggestions:
    """Test NLWeb tool suggestion endpoints."""

    def test_suggest_tools_success(self, client: TestClient, access_token):
        """Test successful tool suggestion."""
        with patch('app.api.nlweb.endpoints.get_nlweb_service') as mock_service:
            # Mock the service response
            mock_nlweb_service = MagicMock()
            mock_nlweb_service.is_available.return_value = True
            
            # Mock tool suggestion response
            mock_tool = NLWebTool(
                name="file_list",
                description="List files in a directory",
                category="file_operations",
                tags=["files", "directory"],
                path="/api/tools/file-list",
                method="POST",
                parameters=[],
                examples=["list files", "show directory contents"]
            )
            
            mock_suggestion_response = NLWebSuggestionResponse(
                suggestions=[{
                    "tool": mock_tool,
                    "score": 95.0,
                    "parameters": {"path": "/current/directory"},
                    "reasoning": "User wants to list files in current directory",
                    "parameter_hints": {"path": "Current working directory"}
                }],
                query="list files in current directory",
                processing_time_ms=150.0,
                cache_hit=False,
                total_tools_considered=25
            )
            
            mock_nlweb_service.suggest_tools.return_value = mock_suggestion_response
            mock_service.return_value = mock_nlweb_service
            
            # Make request
            request_data = {
                "query": "list files in current directory",
                "context": {
                    "current_path": "/home/user/project",
                    "git_status": {
                        "is_repository": True,
                        "branch": "main",
                        "is_dirty": False
                    }
                },
                "max_suggestions": 5,
                "min_score": 50.0,
                "include_reasoning": True
            }
            
            response = client.post(
                "/api/nlweb/suggest",
                json=request_data,
                headers={"Authorization": f"Bearer {access_token}"}
            )
            
            assert response.status_code == 200
            data = response.json()
            assert "suggestions" in data
            assert len(data["suggestions"]) == 1
            assert data["suggestions"][0]["tool"]["name"] == "file_list"
            assert data["suggestions"][0]["score"] == 95.0
            assert data["query"] == "list files in current directory"
            assert data["processing_time_ms"] == 150.0

    def test_suggest_tools_unauthorized(self, client: TestClient):
        """Test tool suggestion without authentication."""
        request_data = {
            "query": "list files in current directory"
        }
        
        response = client.post("/api/nlweb/suggest", json=request_data)
        assert response.status_code == 401

    def test_suggest_tools_service_unavailable(self, client: TestClient, access_token):
        """Test tool suggestion when service is unavailable."""
        with patch('app.api.nlweb.endpoints.get_nlweb_service') as mock_service:
            mock_nlweb_service = MagicMock()
            mock_nlweb_service.is_available.return_value = False
            mock_service.return_value = mock_nlweb_service
            
            request_data = {"query": "list files"}
            
            response = client.post(
                "/api/nlweb/suggest",
                json=request_data,
                headers={"Authorization": f"Bearer {access_token}"}
            )
            
            assert response.status_code == 503
            assert "NLWeb service is not available" in response.json()["detail"]

    def test_suggest_tools_invalid_query(self, client: TestClient, access_token):
        """Test tool suggestion with invalid query."""
        request_data = {
            "query": "",  # Empty query should fail validation
            "max_suggestions": 0  # Invalid max_suggestions
        }
        
        response = client.post(
            "/api/nlweb/suggest",
            json=request_data,
            headers={"Authorization": f"Bearer {access_token}"}
        )
        
        assert response.status_code == 422

    def test_suggest_tools_service_error(self, client: TestClient, access_token):
        """Test tool suggestion when service throws an error."""
        with patch('app.api.nlweb.endpoints.get_nlweb_service') as mock_service:
            mock_nlweb_service = MagicMock()
            mock_nlweb_service.is_available.return_value = True
            mock_nlweb_service.suggest_tools.side_effect = Exception("Service error")
            mock_service.return_value = mock_nlweb_service
            
            request_data = {"query": "list files"}
            
            response = client.post(
                "/api/nlweb/suggest",
                json=request_data,
                headers={"Authorization": f"Bearer {access_token}"}
            )
            
            assert response.status_code == 500
            assert "Service error" in response.json()["detail"]


class TestNLWebHealthMonitoring:
    """Test NLWeb health monitoring endpoints."""

    def test_get_health_status_success(self, client: TestClient, access_token):
        """Test successful health status retrieval."""
        with patch('app.api.nlweb.endpoints.get_nlweb_service') as mock_service:
            mock_nlweb_service = MagicMock()
            mock_nlweb_service.get_health_status.return_value = NLWebHealthStatus(
                status="healthy",
                enabled=True,
                connection_state="connected",
                connection_attempts=0,
                last_ok_timestamp=datetime.now(),
                base_url="http://localhost:3001",
                canary_enabled=False,
                canary_percentage=0.0,
                rollback_enabled=False,
                performance_monitoring=True
            )
            mock_service.return_value = mock_nlweb_service
            
            response = client.get(
                "/api/nlweb/health",
                headers={"Authorization": f"Bearer {access_token}"}
            )
            
            assert response.status_code == 200
            data = response.json()
            assert data["status"] == "healthy"
            assert data["enabled"] is True
            assert data["connection_state"] == "connected"
            assert "base_url" in data

    def test_get_health_status_unauthorized(self, client: TestClient):
        """Test health status without authentication."""
        response = client.get("/api/nlweb/health")
        assert response.status_code == 401

    def test_get_health_status_service_error(self, client: TestClient, access_token):
        """Test health status when service throws an error."""
        with patch('app.api.nlweb.endpoints.get_nlweb_service') as mock_service:
            mock_nlweb_service = MagicMock()
            mock_nlweb_service.get_health_status.side_effect = Exception("Health check failed")
            mock_service.return_value = mock_nlweb_service
            
            response = client.get(
                "/api/nlweb/health",
                headers={"Authorization": f"Bearer {access_token}"}
            )
            
            assert response.status_code == 500
            assert "Health check failed" in response.json()["detail"]


class TestNLWebPerformanceStats:
    """Test NLWeb performance statistics endpoints."""

    def test_get_performance_stats_success(self, client: TestClient, access_token):
        """Test successful performance stats retrieval."""
        with patch('app.api.nlweb.endpoints.get_nlweb_service') as mock_service:
            mock_nlweb_service = MagicMock()
            mock_nlweb_service.get_performance_stats.return_value = NLWebPerformanceStats(
                total_requests=1000,
                successful_requests=950,
                failed_requests=50,
                avg_processing_time_ms=150.0,
                p95_processing_time_ms=300.0,
                p99_processing_time_ms=500.0,
                cache_hit_rate=75.0,
                cache_hits=750,
                cache_misses=250,
                cache_size=64,
                max_cache_size=1000,
                rate_limit_hits=5,
                stale_served_count=10,
                degradation_events=2
            )
            mock_service.return_value = mock_nlweb_service
            
            response = client.get(
                "/api/nlweb/stats",
                headers={"Authorization": f"Bearer {access_token}"}
            )
            
            assert response.status_code == 200
            data = response.json()
            assert data["total_requests"] == 1000
            assert data["successful_requests"] == 950
            assert data["failed_requests"] == 50
            assert data["avg_processing_time_ms"] == 150.0
            assert data["cache_hit_rate"] == 75.0

    def test_get_performance_stats_unauthorized(self, client: TestClient):
        """Test performance stats without authentication."""
        response = client.get("/api/nlweb/stats")
        assert response.status_code == 401

    def test_get_performance_stats_service_error(self, client: TestClient, access_token):
        """Test performance stats when service throws an error."""
        with patch('app.api.nlweb.endpoints.get_nlweb_service') as mock_service:
            mock_nlweb_service = MagicMock()
            mock_nlweb_service.get_performance_stats.side_effect = Exception("Stats error")
            mock_service.return_value = mock_nlweb_service
            
            response = client.get(
                "/api/nlweb/stats",
                headers={"Authorization": f"Bearer {access_token}"}
            )
            
            assert response.status_code == 500
            assert "Stats error" in response.json()["detail"]


class TestNLWebAskEndpoint:
    """Test NLWeb ask endpoint with Ollama integration."""

    def test_ask_endpoint_success(self, client: TestClient, access_token):
        """Test successful ask endpoint with streaming."""
        with patch('app.api.nlweb.endpoints.get_nlweb_service') as mock_service:
            mock_nlweb_service = MagicMock()
            mock_nlweb_service.is_available.return_value = True
            mock_nlweb_service.configuration.base_url = "http://localhost:3001"
            
            # Mock streaming response
            async def mock_stream():
                yield {"type": "token", "data": "Hello", "timestamp": 1234567890, "metadata": {}}
                yield {"type": "token", "data": " world", "timestamp": 1234567891, "metadata": {}}
                yield {"type": "complete", "data": "", "timestamp": 1234567892, "metadata": {"processing_time": 1.5}}
            
            mock_nlweb_service.proxy_ask_request.return_value = mock_stream()
            mock_service.return_value = mock_nlweb_service
            
            request_data = {
                "query": "Hello, how are you?",
                "context": {
                    "current_path": "/home/user",
                    "user_id": "testuser"
                },
                "stream": True,
                "max_tokens": 100,
                "temperature": 0.7
            }
            
            response = client.post(
                "/api/nlweb/ask",
                json=request_data,
                headers={"Authorization": f"Bearer {access_token}"}
            )
            
            assert response.status_code == 200
            # For streaming responses, we'd need to handle SSE properly in tests
            # This is a simplified test - in practice, you'd use httpx.AsyncClient

    def test_ask_endpoint_service_unavailable(self, client: TestClient, access_token):
        """Test ask endpoint when service is unavailable."""
        with patch('app.api.nlweb.endpoints.get_nlweb_service') as mock_service:
            mock_nlweb_service = MagicMock()
            mock_nlweb_service.is_available.return_value = False
            mock_service.return_value = mock_nlweb_service
            
            request_data = {"query": "Hello"}
            
            response = client.post(
                "/api/nlweb/ask",
                json=request_data,
                headers={"Authorization": f"Bearer {access_token}"}
            )
            
            assert response.status_code == 503
            assert "NLWeb service is not available" in response.json()["detail"]

    def test_ask_endpoint_no_external_service(self, client: TestClient, access_token):
        """Test ask endpoint when external service is not configured."""
        with patch('app.api.nlweb.endpoints.get_nlweb_service') as mock_service:
            mock_nlweb_service = MagicMock()
            mock_nlweb_service.is_available.return_value = True
            mock_nlweb_service.configuration.base_url = None
            mock_service.return_value = mock_nlweb_service
            
            request_data = {"query": "Hello"}
            
            response = client.post(
                "/api/nlweb/ask",
                json=request_data,
                headers={"Authorization": f"Bearer {access_token}"}
            )
            
            assert response.status_code == 404
            assert "External NLWeb service not configured" in response.json()["detail"]


class TestNLWebVerification:
    """Test NLWeb verification endpoints."""

    def test_get_verification_checklist_success(self, client: TestClient, access_token):
        """Test successful verification checklist retrieval."""
        with patch('app.api.nlweb.endpoints.get_nlweb_service') as mock_service:
            mock_nlweb_service = MagicMock()
            mock_nlweb_service.get_verification_checklist.return_value = NLWebVerificationResponse(
                service_available=True,
                config_loaded=True,
                checks=[
                    {
                        "name": "service_connectivity",
                        "description": "Check if NLWeb service is reachable",
                        "status": "pass",
                        "value": "connected",
                        "threshold": "must be connected"
                    },
                    {
                        "name": "ollama_integration",
                        "description": "Check Ollama integration",
                        "status": "pass",
                        "value": "available",
                        "threshold": "must be available"
                    }
                ],
                overall_status="pass"
            )
            mock_service.return_value = mock_nlweb_service
            
            response = client.get(
                "/api/nlweb/verification",
                headers={"Authorization": f"Bearer {access_token}"}
            )
            
            assert response.status_code == 200
            data = response.json()
            assert data["service_available"] is True
            assert data["config_loaded"] is True
            assert data["overall_status"] == "pass"
            assert len(data["checks"]) == 2
            assert data["checks"][0]["name"] == "service_connectivity"
            assert data["checks"][0]["status"] == "pass"

    def test_get_verification_checklist_unauthorized(self, client: TestClient):
        """Test verification checklist without authentication."""
        response = client.get("/api/nlweb/verification")
        assert response.status_code == 401

    def test_get_verification_checklist_service_error(self, client: TestClient, access_token):
        """Test verification checklist when service throws an error."""
        with patch('app.api.nlweb.endpoints.get_nlweb_service') as mock_service:
            mock_nlweb_service = MagicMock()
            mock_nlweb_service.get_verification_checklist.side_effect = Exception("Verification failed")
            mock_service.return_value = mock_nlweb_service
            
            response = client.get(
                "/api/nlweb/verification",
                headers={"Authorization": f"Bearer {access_token}"}
            )
            
            assert response.status_code == 500
            assert "Verification failed" in response.json()["detail"]


class TestNLWebRollback:
    """Test NLWeb rollback functionality."""

    def test_enable_rollback_success(self, client: TestClient, access_token):
        """Test successful rollback enablement."""
        with patch('app.api.nlweb.endpoints.get_nlweb_service') as mock_service:
            mock_nlweb_service = MagicMock()
            mock_nlweb_service.enable_rollback.return_value = {
                "success": True,
                "rollback_enabled": True,
                "reason": "Emergency rollback enabled",
                "timestamp": datetime.now()
            }
            mock_service.return_value = mock_nlweb_service
            
            request_data = {
                "enable": True,
                "reason": "Emergency rollback enabled"
            }
            
            response = client.post(
                "/api/nlweb/rollback",
                json=request_data,
                headers={"Authorization": f"Bearer {access_token}"}
            )
            
            assert response.status_code == 200
            data = response.json()
            assert data["success"] is True
            assert data["rollback_enabled"] is True
            assert data["reason"] == "Emergency rollback enabled"

    def test_disable_rollback_success(self, client: TestClient, access_token):
        """Test successful rollback disablement."""
        with patch('app.api.nlweb.endpoints.get_nlweb_service') as mock_service:
            mock_nlweb_service = MagicMock()
            mock_nlweb_service.disable_rollback.return_value = {
                "success": True,
                "rollback_enabled": False,
                "reason": "Rollback disabled",
                "timestamp": datetime.now()
            }
            mock_service.return_value = mock_nlweb_service
            
            request_data = {
                "enable": False,
                "reason": "Rollback disabled"
            }
            
            response = client.post(
                "/api/nlweb/rollback",
                json=request_data,
                headers={"Authorization": f"Bearer {access_token}"}
            )
            
            assert response.status_code == 200
            data = response.json()
            assert data["success"] is True
            assert data["rollback_enabled"] is False

    def test_rollback_unauthorized(self, client: TestClient):
        """Test rollback without authentication."""
        request_data = {"enable": True, "reason": "test"}
        
        response = client.post("/api/nlweb/rollback", json=request_data)
        assert response.status_code == 401

    def test_rollback_invalid_request(self, client: TestClient, access_token):
        """Test rollback with invalid request data."""
        request_data = {
            "enable": "invalid",  # Should be boolean
            "reason": ""  # Empty reason should fail validation
        }
        
        response = client.post(
            "/api/nlweb/rollback",
            json=request_data,
            headers={"Authorization": f"Bearer {access_token}"}
        )
        
        assert response.status_code == 422
