"""
Performance tests for NLWeb endpoints.

This module tests the performance characteristics of NLWeb endpoints
including response times, throughput, and resource usage.
"""

import asyncio
import time
from concurrent.futures import ThreadPoolExecutor
from unittest.mock import MagicMock, patch

import pytest
from fastapi.testclient import TestClient
from httpx import AsyncClient


class TestNLWebPerformance:
    """Test NLWeb performance characteristics."""

    def test_suggest_tools_response_time(self, client: TestClient, access_token):
        """Test tool suggestion response time under normal load."""
        with patch("app.api.nlweb.endpoints.get_nlweb_service") as mock_service:
            # Mock fast response
            mock_nlweb_service = MagicMock()
            mock_nlweb_service.is_available.return_value = True
            mock_nlweb_service.suggest_tools.return_value = {
                "suggestions": [
                    {
                        "tool": {
                            "name": "test_tool",
                            "description": "A test tool",
                            "category": "testing",
                            "tags": ["test"],
                            "path": "/api/test",
                            "method": "POST",
                            "parameters": [],
                            "examples": ["test example"],
                        },
                        "score": 85.0,
                        "parameters": {"param1": "value1"},
                        "reasoning": "Test reasoning",
                        "parameter_hints": {"param1": "Test hint"},
                    }
                ],
                "query": "test query",
                "processing_time_ms": 50.0,  # Fast response
                "cache_hit": False,
                "total_tools_considered": 10,
            }
            mock_service.return_value = mock_nlweb_service

            request_data = {
                "query": "list files in current directory",
                "context": {"current_path": "/home/user/project"},
                "max_suggestions": 5,
            }

            start_time = time.time()
            response = client.post(
                "/api/nlweb/suggest",
                json=request_data,
                headers={"Authorization": f"Bearer {access_token}"},
            )
            end_time = time.time()

            response_time = (end_time - start_time) * 1000  # Convert to milliseconds

            assert response.status_code == 200
            assert response_time < 1000  # Should respond within 1 second
            assert response_time > 0  # Should take some time

    def test_suggest_tools_concurrent_requests(self, client: TestClient, access_token):
        """Test tool suggestion with concurrent requests."""
        with patch("app.api.nlweb.endpoints.get_nlweb_service") as mock_service:
            # Mock service
            mock_nlweb_service = MagicMock()
            mock_nlweb_service.is_available.return_value = True
            mock_nlweb_service.suggest_tools.return_value = {
                "suggestions": [],
                "query": "test query",
                "processing_time_ms": 100.0,
                "cache_hit": False,
                "total_tools_considered": 5,
            }
            mock_service.return_value = mock_nlweb_service

            def make_request():
                request_data = {
                    "query": f"test query {time.time()}",
                    "max_suggestions": 3,
                }
                return client.post(
                    "/api/nlweb/suggest",
                    json=request_data,
                    headers={"Authorization": f"Bearer {access_token}"},
                )

            # Make 10 concurrent requests
            with ThreadPoolExecutor(max_workers=10) as executor:
                start_time = time.time()
                futures = [executor.submit(make_request) for _ in range(10)]
                responses = [future.result() for future in futures]
                end_time = time.time()

            total_time = end_time - start_time

            # All requests should succeed
            for response in responses:
                assert response.status_code == 200

            # Should handle concurrent requests efficiently
            assert total_time < 5.0  # All 10 requests within 5 seconds
            assert total_time > 0.1  # Should take some time

    @pytest.mark.asyncio
    async def test_ask_endpoint_streaming_performance(
        self, async_client: AsyncClient, access_token
    ):
        """Test ask endpoint streaming performance."""
        with patch("app.api.nlweb.endpoints.get_nlweb_service") as mock_service:
            # Mock streaming response
            mock_nlweb_service = MagicMock()
            mock_nlweb_service.is_available.return_value = True
            mock_nlweb_service.configuration.base_url = "http://localhost:3001"

            async def mock_stream():
                # Simulate streaming with multiple tokens
                for i in range(10):
                    yield {
                        "type": "token",
                        "data": f"token{i}",
                        "timestamp": time.time(),
                        "metadata": {"model": "llama3.1"},
                    }
                    await asyncio.sleep(0.01)  # Small delay to simulate processing

                yield {
                    "type": "complete",
                    "data": "",
                    "timestamp": time.time(),
                    "metadata": {"processing_time": 0.1},
                }

            mock_nlweb_service.proxy_ask_request.return_value = mock_stream()
            mock_service.return_value = mock_nlweb_service

            request_data = {
                "query": "Generate a response with multiple tokens",
                "stream": True,
                "max_tokens": 50,
            }

            start_time = time.time()
            response = await async_client.post(
                "/api/nlweb/ask",
                json=request_data,
                headers={"Authorization": f"Bearer {access_token}"},
            )
            end_time = time.time()

            response_time = end_time - start_time

            assert response.status_code == 200
            assert response_time < 2.0  # Should complete within 2 seconds
            assert response_time > 0.1  # Should take some time for streaming

    def test_health_endpoint_performance(self, client: TestClient, access_token):
        """Test health endpoint performance."""
        with patch("app.api.nlweb.endpoints.get_nlweb_service") as mock_service:
            # Mock health response
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
                "performance_monitoring": True,
            }
            mock_service.return_value = mock_nlweb_service

            # Test multiple health checks
            start_time = time.time()
            for _ in range(20):
                response = client.get(
                    "/api/nlweb/health",
                    headers={"Authorization": f"Bearer {access_token}"},
                )
                assert response.status_code == 200
            end_time = time.time()

            total_time = end_time - start_time
            avg_time = total_time / 20

            # Health checks should be very fast
            assert avg_time < 0.1  # Average response time under 100ms
            assert total_time < 2.0  # All 20 requests within 2 seconds

    def test_stats_endpoint_performance(self, client: TestClient, access_token):
        """Test stats endpoint performance."""
        with patch("app.api.nlweb.endpoints.get_nlweb_service") as mock_service:
            # Mock stats response
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
                "degradation_events": 2,
            }
            mock_service.return_value = mock_nlweb_service

            start_time = time.time()
            response = client.get(
                "/api/nlweb/stats", headers={"Authorization": f"Bearer {access_token}"}
            )
            end_time = time.time()

            response_time = (end_time - start_time) * 1000  # Convert to milliseconds

            assert response.status_code == 200
            assert response_time < 500  # Should respond within 500ms

    def test_verification_endpoint_performance(self, client: TestClient, access_token):
        """Test verification endpoint performance."""
        with patch("app.api.nlweb.endpoints.get_nlweb_service") as mock_service:
            # Mock verification response
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
                        "threshold": "must be connected",
                    },
                    {
                        "name": "ollama_integration",
                        "description": "Check Ollama integration",
                        "status": "pass",
                        "value": "available",
                        "threshold": "must be available",
                    },
                ],
                "overall_status": "pass",
            }
            mock_service.return_value = mock_nlweb_service

            start_time = time.time()
            response = client.get(
                "/api/nlweb/verification",
                headers={"Authorization": f"Bearer {access_token}"},
            )
            end_time = time.time()

            response_time = (end_time - start_time) * 1000  # Convert to milliseconds

            assert response.status_code == 200
            assert response_time < 1000  # Should respond within 1 second

    def test_memory_usage_under_load(self, client: TestClient, access_token):
        """Test memory usage under sustained load."""
        with patch("app.api.nlweb.endpoints.get_nlweb_service") as mock_service:
            # Mock service
            mock_nlweb_service = MagicMock()
            mock_nlweb_service.is_available.return_value = True
            mock_nlweb_service.suggest_tools.return_value = {
                "suggestions": [
                    {
                        "tool": {
                            "name": "test_tool",
                            "description": "A test tool",
                            "category": "testing",
                            "tags": ["test"],
                            "path": "/api/test",
                            "method": "POST",
                            "parameters": [],
                            "examples": ["test example"],
                        },
                        "score": 85.0,
                        "parameters": {"param1": "value1"},
                        "reasoning": "Test reasoning",
                        "parameter_hints": {"param1": "Test hint"},
                    }
                ],
                "query": "test query",
                "processing_time_ms": 100.0,
                "cache_hit": False,
                "total_tools_considered": 10,
            }
            mock_service.return_value = mock_nlweb_service

            # Make many requests to test memory usage
            request_data = {"query": "test query", "max_suggestions": 5}

            start_time = time.time()
            for i in range(100):
                response = client.post(
                    "/api/nlweb/suggest",
                    json=request_data,
                    headers={"Authorization": f"Bearer {access_token}"},
                )
                assert response.status_code == 200

                # Every 10 requests, check that we're still performing well
                if i % 10 == 0 and i > 0:
                    current_time = time.time()
                    elapsed = current_time - start_time
                    avg_time = elapsed / (i + 1)
                    assert (
                        avg_time < 0.5
                    )  # Average response time should stay under 500ms

            end_time = time.time()
            total_time = end_time - start_time

            # Should handle 100 requests efficiently
            assert total_time < 60.0  # All 100 requests within 60 seconds
            assert total_time > 1.0  # Should take some time

    def test_error_handling_performance(self, client: TestClient, access_token):
        """Test error handling performance."""
        with patch("app.api.nlweb.endpoints.get_nlweb_service") as mock_service:
            # Mock service that throws errors
            mock_nlweb_service = MagicMock()
            mock_nlweb_service.is_available.return_value = True
            mock_nlweb_service.suggest_tools.side_effect = Exception("Service error")
            mock_service.return_value = mock_nlweb_service

            request_data = {"query": "test query", "max_suggestions": 5}

            start_time = time.time()
            response = client.post(
                "/api/nlweb/suggest",
                json=request_data,
                headers={"Authorization": f"Bearer {access_token}"},
            )
            end_time = time.time()

            response_time = (end_time - start_time) * 1000  # Convert to milliseconds

            assert response.status_code == 500
            assert response_time < 1000  # Error responses should still be fast

    def test_authentication_performance(self, client: TestClient):
        """Test authentication performance impact."""
        # Test without authentication (should be fast to reject)
        start_time = time.time()
        response = client.post("/api/nlweb/suggest", json={"query": "test"})
        end_time = time.time()

        response_time = (end_time - start_time) * 1000  # Convert to milliseconds

        assert response.status_code == 401
        assert response_time < 100  # Authentication rejection should be very fast

    def test_large_request_handling(self, client: TestClient, access_token):
        """Test handling of large requests."""
        with patch("app.api.nlweb.endpoints.get_nlweb_service") as mock_service:
            # Mock service
            mock_nlweb_service = MagicMock()
            mock_nlweb_service.is_available.return_value = True
            mock_nlweb_service.suggest_tools.return_value = {
                "suggestions": [],
                "query": "large query",
                "processing_time_ms": 200.0,
                "cache_hit": False,
                "total_tools_considered": 5,
            }
            mock_service.return_value = mock_nlweb_service

            # Create a large request with lots of context
            large_context = {
                "current_path": "/home/user/project",
                "selected_items": [f"file{i}.txt" for i in range(100)],
                "git_status": {
                    "is_repository": True,
                    "branch": "main",
                    "is_dirty": True,
                    "modified_files": [f"modified{i}.txt" for i in range(50)],
                    "untracked_files": [f"untracked{i}.txt" for i in range(25)],
                },
                "user_preferences": {
                    "theme": "dark",
                    "language": "en",
                    "notifications": True,
                    "auto_save": True,
                    "preferred_tools": [f"tool{i}" for i in range(20)],
                },
                "application_state": {
                    "open_files": [f"open{i}.txt" for i in range(10)],
                    "recent_commands": [f"command{i}" for i in range(30)],
                    "workspace_settings": {
                        "indent_size": 4,
                        "tab_size": 4,
                        "insert_spaces": True,
                        "trim_auto_whitespace": True,
                        "detect_indentation": True,
                    },
                },
            }

            request_data = {
                "query": "Process all these files and provide suggestions",
                "context": large_context,
                "max_suggestions": 10,
            }

            start_time = time.time()
            response = client.post(
                "/api/nlweb/suggest",
                json=request_data,
                headers={"Authorization": f"Bearer {access_token}"},
            )
            end_time = time.time()

            response_time = (end_time - start_time) * 1000  # Convert to milliseconds

            assert response.status_code == 200
            assert response_time < 2000  # Should handle large requests within 2 seconds
