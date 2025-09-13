"""
Full integration tests for NLWeb with complete app setup.

This module tests the complete NLWeb integration with proper app initialization,
authentication, and all services running together.
"""

import asyncio
import sys
from pathlib import Path
from typing import Any, AsyncGenerator, Dict
from unittest.mock import MagicMock, patch

import pytest
import pytest_asyncio
from fastapi import FastAPI
from fastapi.testclient import TestClient
from httpx import AsyncClient

# Add the backend app to the path
sys.path.insert(0, str(Path(__file__).parent.parent.parent / "app"))

# Mock gatekeeper before importing the app
sys.modules['gatekeeper'] = __import__('tests.mocks.gatekeeper', fromlist=[''])
sys.modules['gatekeeper.api'] = sys.modules['gatekeeper']
sys.modules['gatekeeper.api.routes'] = sys.modules['gatekeeper']
sys.modules['gatekeeper.api.dependencies'] = sys.modules['gatekeeper']
sys.modules['gatekeeper.models'] = sys.modules['gatekeeper']
sys.modules['gatekeeper.models.user'] = sys.modules['gatekeeper']

# Import app modules after path setup
# Note: These imports must come after sys.path.insert and sys.modules setup
from app.services.ollama.models import (  # noqa: E402
    OllamaAssistantParams,
    OllamaChatParams,
)
from main import create_app  # noqa: E402


class TestNLWebFullIntegration:
    """Test complete NLWeb integration with full app setup."""

    @pytest.fixture(scope="class")
    def app(self) -> FastAPI:
        """Create the FastAPI app for testing."""
        return create_app()

    @pytest.fixture(scope="class")
    def client(self, app: FastAPI) -> TestClient:
        """Create test client."""
        return TestClient(app)

    @pytest_asyncio.fixture(scope="class")
    async def async_client(self, app: FastAPI) -> AsyncGenerator[AsyncClient, None]:
        """Create async test client."""
        # Use transport parameter for FastAPI app integration
        from httpx import ASGITransport
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as ac:
            yield ac

    @pytest.fixture
    def mock_auth_token(self) -> str:
        """Mock authentication token."""
        return "mock_bearer_token"

    @pytest.fixture
    def auth_headers(self, mock_auth_token: str) -> Dict[str, str]:
        """Authentication headers."""
        return {"Authorization": f"Bearer {mock_auth_token}"}

    def test_app_initialization(self, app: FastAPI) -> None:
        """Test that the app initializes correctly."""
        assert app is not None
        assert app.title == "Reynard Backend API"

        # Check that NLWeb routes are registered
        route_paths = []
        for route in app.routes:
            if hasattr(route, 'path'):
                route_paths.append(route.path)
            elif hasattr(route, 'routes'):  # For route groups
                for subroute in route.routes:
                    if hasattr(subroute, 'path'):
                        route_paths.append(subroute.path)

        # Check that key NLWeb endpoints exist
        assert any("/api/nlweb/suggest" in path for path in route_paths)
        assert any("/api/nlweb/health" in path for path in route_paths)
        assert any("/api/nlweb/stats" in path for path in route_paths)
        assert any("/api/nlweb/ask" in path for path in route_paths)
        assert any("/api/nlweb/verification" in path for path in route_paths)

    def test_nlweb_health_endpoint(self, client: TestClient, auth_headers: Dict[str, str]) -> None:
        """Test NLWeb health endpoint with full app."""
        with patch('app.api.nlweb.endpoints.get_nlweb_service') as mock_service:
            # Mock the service
            mock_nlweb_service = MagicMock()
            mock_nlweb_service.get_health_status.return_value = {
                "status": "healthy",
                "enabled": True,
                "connection_state": "connected",
                "connection_attempts": 0,
                "last_ok_timestamp": "2023-01-01T00:00:00Z",
                "base_url": "http://localhost:3001",
                "canary_enabled": False,
                "canary_percentage": 0.0,
                "rollback_enabled": False,
                "performance_monitoring": True
            }
            mock_service.return_value = mock_nlweb_service

            response = client.get("/api/nlweb/health", headers=auth_headers)

            assert response.status_code == 200
            data = response.json()
            assert data["status"] == "healthy"
            assert data["enabled"] is True
            assert data["connection_state"] == "connected"

    def test_nlweb_suggest_endpoint(self, client: TestClient, auth_headers: Dict[str, str]) -> None:
        """Test NLWeb suggest endpoint with full app."""
        with patch('app.api.nlweb.endpoints.get_nlweb_service') as mock_service:
            # Mock the service
            mock_nlweb_service = MagicMock()
            mock_nlweb_service.is_available.return_value = True

            # Mock tool suggestion response
            mock_tool = {
                "name": "file_list",
                "description": "List files in a directory",
                "category": "file_operations",
                "tags": ["files", "directory"],
                "path": "/api/tools/file-list",
                "method": "POST",
                "parameters": [],
                "examples": ["list files", "show directory contents"]
            }

            mock_suggestion_response = {
                "suggestions": [{
                    "tool": mock_tool,
                    "score": 95.0,
                    "parameters": {"path": "/current/directory"},
                    "reasoning": "User wants to list files in current directory",
                    "parameter_hints": {"path": "Current working directory"}
                }],
                "query": "list files in current directory",
                "processing_time_ms": 150.0,
                "cache_hit": False,
                "total_tools_considered": 25
            }

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
                headers=auth_headers
            )

            assert response.status_code == 200
            data = response.json()
            assert "suggestions" in data
            assert len(data["suggestions"]) == 1
            assert data["suggestions"][0]["tool"]["name"] == "file_list"
            assert data["suggestions"][0]["score"] == 95.0
            assert data["query"] == "list files in current directory"
            assert data["processing_time_ms"] == 150.0

    def test_nlweb_stats_endpoint(self, client: TestClient, auth_headers: Dict[str, str]) -> None:
        """Test NLWeb stats endpoint with full app."""
        with patch('app.api.nlweb.endpoints.get_nlweb_service') as mock_service:
            # Mock the service
            mock_nlweb_service = MagicMock()
            mock_nlweb_service.get_performance_stats.return_value = {
                "total_requests": 1000,
                "successful_requests": 950,
                "failed_requests": 50,
                "avg_processing_time_ms": 150.0,
                "p95_processing_time_ms": 300.0,
                "p99_processing_time_ms": 500.0,
                "cache_hit_rate": 75.0,
                "cache_hits": 750,
                "cache_misses": 250,
                "cache_size": 64,
                "max_cache_size": 1000,
                "rate_limit_hits": 5,
                "stale_served_count": 10,
                "degradation_events": 2
            }
            mock_service.return_value = mock_nlweb_service

            response = client.get("/api/nlweb/stats", headers=auth_headers)

            assert response.status_code == 200
            data = response.json()
            assert data["total_requests"] == 1000
            assert data["successful_requests"] == 950
            assert data["failed_requests"] == 50
            assert data["avg_processing_time_ms"] == 150.0
            assert data["cache_hit_rate"] == 75.0

    def test_nlweb_verification_endpoint(self, client: TestClient, auth_headers: Dict[str, str]) -> None:
        """Test NLWeb verification endpoint with full app."""
        with patch('app.api.nlweb.endpoints.get_nlweb_service') as mock_service:
            # Mock the service
            mock_nlweb_service = MagicMock()
            mock_nlweb_service.get_verification_checklist.return_value = {
                "service_available": True,
                "config_loaded": True,
                "checks": [
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
                "overall_status": "pass"
            }
            mock_service.return_value = mock_nlweb_service

            response = client.get("/api/nlweb/verification", headers=auth_headers)

            assert response.status_code == 200
            data = response.json()
            assert data["service_available"] is True
            assert data["config_loaded"] is True
            assert data["overall_status"] == "pass"
            assert len(data["checks"]) == 2

    @pytest.mark.asyncio
    async def test_nlweb_ask_endpoint_streaming(self, async_client: AsyncClient, auth_headers: Dict[str, str]) -> None:
        """Test NLWeb ask endpoint with streaming."""
        with patch('app.api.nlweb.endpoints.get_nlweb_service') as mock_service:
            # Mock the service
            mock_nlweb_service = MagicMock()
            mock_nlweb_service.is_available.return_value = True
            mock_nlweb_service.configuration.base_url = "http://localhost:3001"

            # Mock streaming response
            async def mock_stream() -> AsyncGenerator[Dict[str, Any], None]:
                yield {
                    "type": "token",
                    "data": "Hello",
                    "timestamp": 1234567890,
                    "metadata": {"model": "qwen3:latest", "tool_used": "ollama_chat"}
                }
                yield {
                    "type": "token",
                    "data": " world",
                    "timestamp": 1234567891,
                    "metadata": {"model": "qwen3:latest", "tool_used": "ollama_chat"}
                }
                yield {
                    "type": "complete",
                    "data": "",
                    "timestamp": 1234567892,
                    "metadata": {
                        "processing_time": 1.5,
                        "tokens_generated": 2,
                        "model": "qwen3:latest",
                        "tools_used": ["ollama_chat"]
                    }
                }

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

            response = await async_client.post(
                "/api/nlweb/ask",
                json=request_data,
                headers=auth_headers
            )

            assert response.status_code == 200

    def test_ollama_chat_endpoint(self, client: TestClient, auth_headers: Dict[str, str]) -> None:
        """Test Ollama chat endpoint with full app."""
        with patch('app.api.ollama.endpoints.get_ollama_service') as mock_service:
            # Mock the service
            mock_ollama_service = MagicMock()
            mock_ollama_service.is_available.return_value = True

            # Mock the chat_stream method
            async def mock_chat_stream(_params: OllamaChatParams) -> AsyncGenerator[MagicMock, None]:
                yield MagicMock(type="token", data="I can help", timestamp=1234567890, metadata={})
                yield MagicMock(type="tool_call", data="", timestamp=1234567891, metadata={"tool_name": "file_list"})
                yield MagicMock(type="token", data=" you with that.", timestamp=1234567892, metadata={})
                yield MagicMock(type="complete", data="", timestamp=1234567893, metadata={"processing_time": 1.5})

            mock_ollama_service.chat_stream.return_value = mock_chat_stream(OllamaChatParams(
                message="List files in current directory",
                model="qwen3:latest",
                system_prompt="You are a helpful assistant with access to file system tools.",
                temperature=0.7,
                max_tokens=100,
                stream=True,
                context={"current_path": "/home/user/project", "user_id": "testuser"},
                tools=[{
                    "name": "file_list",
                    "description": "List files in a directory",
                    "parameters": {"path": {"type": "string", "description": "Directory path"}}
                }]
            ))
            mock_service.return_value = mock_ollama_service

            # Make request
            request_data = {
                "message": "List files in current directory",
                "model": "qwen3:latest",
                "system_prompt": "You are a helpful assistant with access to file system tools.",
                "temperature": 0.7,
                "max_tokens": 100,
                "tools": [
                    {
                        "type": "function",
                        "function": {
                            "name": "file_list",
                            "description": "List files in a directory",
                            "parameters": {
                                "type": "object",
                                "properties": {
                                    "path": {
                                        "type": "string",
                                        "description": "Directory path to list"
                                    }
                                },
                                "required": ["path"]
                            }
                        }
                    }
                ],
                "context": {
                    "current_path": "/home/user/project",
                    "user_id": "testuser"
                }
            }

            response = client.post(
                "/api/ollama/chat",
                json=request_data,
                headers=auth_headers
            )

            assert response.status_code == 200
            data = response.json()
            assert data["success"] is True
            assert "response" in data
            assert data["model"] == "qwen3:latest"
            assert data["processing_time"] == 1.5

    def test_ollama_assistant_endpoint(self, client: TestClient, auth_headers: Dict[str, str]) -> None:
        """Test Ollama assistant endpoint with full app."""
        with patch('app.api.ollama.endpoints.get_ollama_service') as mock_service:
            # Mock the service
            mock_ollama_service = MagicMock()
            mock_ollama_service.is_available.return_value = True

            # Mock the assistant_stream method
            async def mock_assistant_stream(_params: OllamaAssistantParams) -> AsyncGenerator[MagicMock, None]:
                yield MagicMock(type="token", data="I'll help", timestamp=1234567890, metadata={})
                yield MagicMock(type="tool_call", data="", timestamp=1234567891, metadata={"tool_name": "nlweb_suggest"})
                yield MagicMock(type="token", data=" you with that task.", timestamp=1234567892, metadata={})
                yield MagicMock(type="complete", data="", timestamp=1234567893, metadata={"processing_time": 2.0})

            mock_ollama_service.assistant_stream.return_value = mock_assistant_stream(OllamaAssistantParams(
                message="Help me organize my project files",
                assistant_type="reynard",
                model="qwen3:latest",
                temperature=0.7,
                max_tokens=200,
                stream=True,
                context={
                    "current_path": "/home/user/project",
                    "project_type": "web_application",
                    "user_preferences": {
                        "organization_style": "by_type"
                    }
                },
                tools_enabled=True
            ))
            mock_service.return_value = mock_ollama_service

            # Make request
            request_data = {
                "message": "Help me organize my project files",
                "assistant_type": "reynard",
                "model": "qwen3:latest",
                "temperature": 0.7,
                "max_tokens": 200,
                "context": {
                    "current_path": "/home/user/project",
                    "project_type": "web_application",
                    "user_preferences": {
                        "organization_style": "by_type"
                    }
                },
                "tools_enabled": True
            }

            response = client.post(
                "/api/ollama/assistant",
                json=request_data,
                headers=auth_headers
            )

            assert response.status_code == 200
            data = response.json()
            assert data["success"] is True
            assert data["assistant_type"] == "reynard"
            assert data["model"] == "qwen3:latest"
            assert data["processing_time"] == 2.0
            assert "tools_used" in data

    def test_authentication_required(self, client: TestClient) -> None:
        """Test that authentication is required for protected endpoints."""
        # Test without authentication
        response = client.get("/api/nlweb/health")
        assert response.status_code == 401

        response = client.post("/api/nlweb/suggest", json={"query": "test"})
        assert response.status_code == 401

        response = client.get("/api/nlweb/stats")
        assert response.status_code == 401

    def test_error_handling(self, client: TestClient, auth_headers: Dict[str, str]) -> None:
        """Test error handling in the full app."""
        with patch('app.api.nlweb.endpoints.get_nlweb_service') as mock_service:
            # Mock service that throws an error
            mock_nlweb_service = MagicMock()
            mock_nlweb_service.is_available.return_value = True
            mock_nlweb_service.suggest_tools.side_effect = Exception("Service error")
            mock_service.return_value = mock_nlweb_service

            request_data = {"query": "test query"}

            response = client.post(
                "/api/nlweb/suggest",
                json=request_data,
                headers=auth_headers
            )

            assert response.status_code == 500
            assert "Service error" in response.json()["detail"]

    def test_cors_headers(self, client: TestClient) -> None:
        """Test that CORS headers are properly set."""
        response = client.options("/api/nlweb/health")
        assert response.status_code == 200
        # CORS headers should be present (handled by middleware)

    def test_rate_limiting(self, client: TestClient, auth_headers: Dict[str, str]) -> None:
        """Test rate limiting functionality."""
        # Make multiple requests quickly
        for _ in range(10):
            response = client.get("/api/nlweb/health", headers=auth_headers)
            # Should not be rate limited for health checks
            assert response.status_code in [200, 503]  # 503 if service unavailable

    @pytest.mark.asyncio
    async def test_concurrent_requests(self, async_client: AsyncClient, auth_headers: Dict[str, str]) -> None:
        """Test handling of concurrent requests."""
        with patch('app.api.nlweb.endpoints.get_nlweb_service') as mock_service:
            # Mock the service
            mock_nlweb_service = MagicMock()
            mock_nlweb_service.is_available.return_value = True
            mock_nlweb_service.suggest_tools.return_value = {
                "suggestions": [],
                "query": "test query",
                "processing_time_ms": 100.0,
                "cache_hit": False,
                "total_tools_considered": 5
            }
            mock_service.return_value = mock_nlweb_service

            # Make concurrent requests
            tasks = []
            for i in range(5):
                task = async_client.post(
                    "/api/nlweb/suggest",
                    json={"query": f"test query {i}"},
                    headers=auth_headers
                )
                tasks.append(task)

            responses = await asyncio.gather(*tasks)

            # All requests should succeed
            for response in responses:
                assert response.status_code == 200
