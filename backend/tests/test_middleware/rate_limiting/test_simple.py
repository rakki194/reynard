"""Tests for simple rate limiting middleware.

This module provides comprehensive tests for the simple rate limiting
middleware including rate limit enforcement and bypass functionality.
"""

import pytest
import time
from unittest.mock import Mock, AsyncMock, patch
from fastapi import FastAPI, Request, Response
from fastapi.testclient import TestClient

from app.middleware.rate_limiting.simple import SimpleRateLimiter


class TestSimpleRateLimiter:
    """Test suite for SimpleRateLimiter class."""
    
    def test_simple_rate_limiter_initialization(self):
        """Test simple rate limiter initialization."""
        app = Mock()
        middleware = SimpleRateLimiter(app)
        
        assert middleware.app == app
        assert middleware.enabled is True
        assert middleware.default_limit == 100
        assert middleware.window_seconds == 60
        assert middleware.logger.name == "middleware.simple_rate_limiter"
        assert middleware.requests == {}
    
    def test_simple_rate_limiter_initialization_custom(self):
        """Test simple rate limiter initialization with custom values."""
        app = Mock()
        middleware = SimpleRateLimiter(
            app,
            enabled=False,
            default_limit=50,
            window_seconds=30
        )
        
        assert middleware.enabled is False
        assert middleware.default_limit == 50
        assert middleware.window_seconds == 30
    
    @pytest.mark.asyncio
    async def test_dispatch_when_disabled(self):
        """Test dispatch method when rate limiting is disabled."""
        app = Mock()
        middleware = SimpleRateLimiter(app, enabled=False)
        
        request = Mock(spec=Request)
        call_next = AsyncMock(return_value=Mock(spec=Response))
        
        result = await middleware.dispatch(request, call_next)
        
        call_next.assert_called_once_with(request)
        assert result == call_next.return_value
    
    @pytest.mark.asyncio
    async def test_dispatch_with_bypass_flag(self):
        """Test dispatch method with bypass flag."""
        app = Mock()
        middleware = SimpleRateLimiter(app, enabled=True)
        
        request = Mock(spec=Request)
        request.state.bypass_rate_limiting = True
        call_next = AsyncMock(return_value=Mock(spec=Response))
        
        result = await middleware.dispatch(request, call_next)
        
        call_next.assert_called_once_with(request)
        assert result == call_next.return_value
    
    @pytest.mark.asyncio
    async def test_dispatch_within_rate_limit(self):
        """Test dispatch method when within rate limit."""
        app = Mock()
        middleware = SimpleRateLimiter(app, default_limit=2, window_seconds=60)
        
        request = Mock(spec=Request)
        request.client.host = "127.0.0.1"
        request.headers = {"User-Agent": "test-agent"}
        
        response = Mock(spec=Response)
        call_next = AsyncMock(return_value=response)
        
        # First request should pass
        result = await middleware.dispatch(request, call_next)
        assert result == response
        call_next.assert_called_once_with(request)
        
        # Second request should also pass
        call_next.reset_mock()
        result = await middleware.dispatch(request, call_next)
        assert result == response
        call_next.assert_called_once_with(request)
    
    @pytest.mark.asyncio
    async def test_dispatch_exceeds_rate_limit(self):
        """Test dispatch method when rate limit is exceeded."""
        app = Mock()
        middleware = SimpleRateLimiter(app, default_limit=1, window_seconds=60)
        
        request = Mock(spec=Request)
        request.client.host = "127.0.0.1"
        request.headers = {"User-Agent": "test-agent"}
        
        response = Mock(spec=Response)
        call_next = AsyncMock(return_value=response)
        
        # First request should pass
        result = await middleware.dispatch(request, call_next)
        assert result == response
        call_next.assert_called_once_with(request)
        
        # Second request should be rate limited
        call_next.reset_mock()
        result = await middleware.dispatch(request, call_next)
        
        assert result.status_code == 429
        assert "Rate limit exceeded" in result.body.decode()
        assert result.headers["Retry-After"] == "60"
        assert result.headers["X-RateLimit-Limit"] == "1"
        assert result.headers["X-RateLimit-Remaining"] == "0"
        call_next.assert_not_called()
    
    def test_get_client_identifier(self):
        """Test client identifier generation."""
        app = Mock()
        middleware = SimpleRateLimiter(app)
        
        request = Mock(spec=Request)
        request.client.host = "127.0.0.1"
        request.headers = {"User-Agent": "test-agent"}
        
        identifier = middleware._get_client_identifier(request)
        
        assert "127.0.0.1" in identifier
        assert "test-agent" in identifier
    
    def test_get_client_identifier_with_forwarded_for(self):
        """Test client identifier generation with X-Forwarded-For header."""
        app = Mock()
        middleware = SimpleRateLimiter(app)
        
        request = Mock(spec=Request)
        request.client.host = "127.0.0.1"
        request.headers = {
            "User-Agent": "test-agent",
            "X-Forwarded-For": "192.168.1.1, 10.0.0.1"
        }
        
        identifier = middleware._get_client_identifier(request)
        
        assert "192.168.1.1" in identifier
        assert "127.0.0.1" not in identifier
    
    def test_get_client_identifier_with_real_ip(self):
        """Test client identifier generation with X-Real-IP header."""
        app = Mock()
        middleware = SimpleRateLimiter(app)
        
        request = Mock(spec=Request)
        request.client.host = "127.0.0.1"
        request.headers = {
            "User-Agent": "test-agent",
            "X-Real-IP": "192.168.1.1"
        }
        
        identifier = middleware._get_client_identifier(request)
        
        assert "192.168.1.1" in identifier
        assert "127.0.0.1" not in identifier
    
    def test_check_rate_limit_new_client(self):
        """Test rate limit check for new client."""
        app = Mock()
        middleware = SimpleRateLimiter(app, default_limit=2)
        
        client_id = "test-client"
        
        # New client should be within limit
        assert middleware._check_rate_limit(client_id) is True
    
    def test_check_rate_limit_existing_client(self):
        """Test rate limit check for existing client."""
        app = Mock()
        middleware = SimpleRateLimiter(app, default_limit=2)
        
        client_id = "test-client"
        current_time = time.time()
        
        # Add some requests
        middleware.requests[client_id] = [current_time - 10, current_time - 5]
        
        # Should be within limit
        assert middleware._check_rate_limit(client_id) is True
        
        # Add one more request to exceed limit
        middleware.requests[client_id].append(current_time - 1)
        
        # Should exceed limit
        assert middleware._check_rate_limit(client_id) is False
    
    def test_check_rate_limit_old_requests_cleanup(self):
        """Test that old requests are cleaned up."""
        app = Mock()
        middleware = SimpleRateLimiter(app, default_limit=2, window_seconds=10)
        
        client_id = "test-client"
        current_time = time.time()
        
        # Add old requests (outside window)
        middleware.requests[client_id] = [
            current_time - 20,  # Old request
            current_time - 15,  # Old request
            current_time - 5    # Recent request
        ]
        
        # Should clean up old requests and be within limit
        assert middleware._check_rate_limit(client_id) is True
        assert len(middleware.requests[client_id]) == 1
    
    def test_update_rate_limit(self):
        """Test rate limit tracking update."""
        app = Mock()
        middleware = SimpleRateLimiter(app)
        
        client_id = "test-client"
        
        # Update rate limit
        middleware._update_rate_limit(client_id)
        
        assert client_id in middleware.requests
        assert len(middleware.requests[client_id]) == 1
        
        # Update again
        middleware._update_rate_limit(client_id)
        
        assert len(middleware.requests[client_id]) == 2
    
    def test_create_rate_limit_response(self):
        """Test rate limit exceeded response creation."""
        app = Mock()
        middleware = SimpleRateLimiter(app, window_seconds=30)
        
        response = middleware._create_rate_limit_response()
        
        assert response.status_code == 429
        assert "Rate limit exceeded" in response.body.decode()
        assert response.headers["Retry-After"] == "30"
        assert response.headers["X-RateLimit-Limit"] == "100"
        assert response.headers["X-RateLimit-Remaining"] == "0"
        assert response.headers["X-RateLimit-Reset"] == "30"
        assert response.headers["Content-Type"] == "application/json"


class TestSimpleRateLimiterIntegration:
    """Integration tests for SimpleRateLimiter with FastAPI."""
    
    def test_simple_rate_limiter_with_fastapi_app(self):
        """Test simple rate limiter integration with FastAPI app."""
        app = FastAPI()
        
        # Add rate limiting middleware
        app.add_middleware(
            SimpleRateLimiter,
            default_limit=2,
            window_seconds=60
        )
        
        @app.get("/test")
        async def test_endpoint():
            return {"message": "test"}
        
        client = TestClient(app)
        
        # First request should pass
        response = client.get("/test")
        assert response.status_code == 200
        assert response.json() == {"message": "test"}
        
        # Second request should pass
        response = client.get("/test")
        assert response.status_code == 200
        assert response.json() == {"message": "test"}
        
        # Third request should be rate limited
        response = client.get("/test")
        assert response.status_code == 429
        assert "Rate limit exceeded" in response.text
    
    def test_simple_rate_limiter_different_clients(self):
        """Test rate limiting with different clients."""
        app = FastAPI()
        
        # Add rate limiting middleware
        app.add_middleware(
            SimpleRateLimiter,
            default_limit=1,
            window_seconds=60
        )
        
        @app.get("/test")
        async def test_endpoint():
            return {"message": "test"}
        
        client = TestClient(app)
        
        # First client - should pass
        response = client.get("/test")
        assert response.status_code == 200
        
        # Second client - should also pass (different client)
        response = client.get("/test", headers={"X-Forwarded-For": "192.168.1.1"})
        assert response.status_code == 200
        
        # First client again - should be rate limited
        response = client.get("/test")
        assert response.status_code == 429
    
    def test_simple_rate_limiter_disabled(self):
        """Test rate limiting when disabled."""
        app = FastAPI()
        
        # Add disabled rate limiting middleware
        app.add_middleware(
            SimpleRateLimiter,
            enabled=False
        )
        
        @app.get("/test")
        async def test_endpoint():
            return {"message": "test"}
        
        client = TestClient(app)
        
        # Multiple requests should all pass
        for _ in range(5):
            response = client.get("/test")
            assert response.status_code == 200
            assert response.json() == {"message": "test"}
    
    def test_simple_rate_limiter_with_bypass_middleware(self):
        """Test rate limiting with bypass middleware."""
        app = FastAPI()
        
        # Add rate limiting middleware
        app.add_middleware(
            SimpleRateLimiter,
            default_limit=1,
            window_seconds=60
        )
        
        @app.get("/test")
        async def test_endpoint():
            return {"message": "test"}
        
        client = TestClient(app)
        
        # First request should pass
        response = client.get("/test")
        assert response.status_code == 200
        
        # Second request should be rate limited
        response = client.get("/test")
        assert response.status_code == 429
        
        # Request with bypass header should pass
        response = client.get("/test", headers={"X-Bypass-Rate-Limit": "true"})
        assert response.status_code == 200
    
    def test_simple_rate_limiter_rate_limit_headers(self):
        """Test rate limit headers in responses."""
        app = FastAPI()
        
        # Add rate limiting middleware
        app.add_middleware(
            SimpleRateLimiter,
            default_limit=2,
            window_seconds=60
        )
        
        @app.get("/test")
        async def test_endpoint():
            return {"message": "test"}
        
        client = TestClient(app)
        
        # First request
        response = client.get("/test")
        assert response.status_code == 200
        assert response.headers["X-RateLimit-Limit"] == "2"
        assert response.headers["X-RateLimit-Remaining"] == "1"
        
        # Second request
        response = client.get("/test")
        assert response.status_code == 200
        assert response.headers["X-RateLimit-Limit"] == "2"
        assert response.headers["X-RateLimit-Remaining"] == "0"
        
        # Third request (rate limited)
        response = client.get("/test")
        assert response.status_code == 429
        assert response.headers["X-RateLimit-Limit"] == "2"
        assert response.headers["X-RateLimit-Remaining"] == "0"
        assert response.headers["Retry-After"] == "60"
