"""Tests for development bypass middleware.

This module provides comprehensive tests for the development bypass
middleware including Fenrir testing suite integration and bypass logic.
"""

from unittest.mock import AsyncMock, Mock, patch

import pytest
from fastapi import FastAPI, Request, Response
from fastapi.testclient import TestClient

from app.middleware.development.bypass import DevelopmentBypassMiddleware


class TestDevelopmentBypassMiddleware:
    """Test suite for DevelopmentBypassMiddleware class."""

    def test_development_bypass_middleware_initialization(self):
        """Test development bypass middleware initialization."""
        app = Mock()
        middleware = DevelopmentBypassMiddleware(app)

        assert middleware.app == app
        assert middleware.enabled is True
        assert middleware.environment == "development"
        assert middleware.logger.name == "middleware.development_bypass"

    def test_development_bypass_middleware_initialization_custom(self):
        """Test development bypass middleware initialization with custom values."""
        app = Mock()
        middleware = DevelopmentBypassMiddleware(
            app, enabled=False, environment="production"
        )

        assert middleware.enabled is False
        assert middleware.environment == "production"

    @pytest.mark.asyncio
    async def test_dispatch_when_disabled(self):
        """Test dispatch method when middleware is disabled."""
        app = Mock()
        middleware = DevelopmentBypassMiddleware(app, enabled=False)

        request = Mock(spec=Request)
        call_next = AsyncMock(return_value=Mock(spec=Response))

        result = await middleware.dispatch(request, call_next)

        call_next.assert_called_once_with(request)
        assert result == call_next.return_value

    @pytest.mark.asyncio
    async def test_dispatch_when_not_development(self):
        """Test dispatch method when not in development environment."""
        app = Mock()
        middleware = DevelopmentBypassMiddleware(app, environment="production")

        request = Mock(spec=Request)
        call_next = AsyncMock(return_value=Mock(spec=Response))

        result = await middleware.dispatch(request, call_next)

        call_next.assert_called_once_with(request)
        assert result == call_next.return_value

    @pytest.mark.asyncio
    async def test_dispatch_with_bypass_request(self):
        """Test dispatch method with bypass request."""
        app = Mock()
        middleware = DevelopmentBypassMiddleware(app, environment="development")

        request = Mock(spec=Request)
        request.headers = {"User-Agent": "Fenrir Exploit Suite"}
        request.state = Mock()

        call_next = AsyncMock(return_value=Mock(spec=Response))

        result = await middleware.dispatch(request, call_next)

        call_next.assert_called_once_with(request)
        assert result == call_next.return_value
        assert request.state.bypass_rate_limiting is True
        assert request.state.bypass_input_validation is True
        assert request.state.bypass_security_headers is True

    @pytest.mark.asyncio
    async def test_dispatch_without_bypass_request(self):
        """Test dispatch method without bypass request."""
        app = Mock()
        middleware = DevelopmentBypassMiddleware(app, environment="development")

        request = Mock(spec=Request)
        request.headers = {"User-Agent": "Mozilla/5.0"}
        request.state = Mock()

        call_next = AsyncMock(return_value=Mock(spec=Response))

        result = await middleware.dispatch(request, call_next)

        call_next.assert_called_once_with(request)
        assert result == call_next.return_value
        assert not hasattr(request.state, "bypass_rate_limiting")
        assert not hasattr(request.state, "bypass_input_validation")
        assert not hasattr(request.state, "bypass_security_headers")

    def test_should_bypass_fenrir_agents(self):
        """Test bypass logic for Fenrir testing suite agents."""
        app = Mock()
        middleware = DevelopmentBypassMiddleware(app)

        # Test various Fenrir user agents
        fenrir_agents = [
            "Fenrir Exploit Suite",
            "Reynard Security Tester",
            "Fenrir Testing Framework",
            "Security Assessment Tool",
        ]

        for agent in fenrir_agents:
            request = Mock(spec=Request)
            request.headers = {"User-Agent": agent}

            assert middleware._should_bypass(request) is True

    def test_should_bypass_localhost(self):
        """Test bypass logic for localhost requests."""
        app = Mock()
        middleware = DevelopmentBypassMiddleware(app)

        # Test localhost IPs
        localhost_ips = ["127.0.0.1", "localhost", "::1", "0.0.0.0"]

        for ip in localhost_ips:
            request = Mock(spec=Request)
            request.headers = {"User-Agent": "Mozilla/5.0"}
            request.client.host = ip

            assert middleware._should_bypass(request) is True

    def test_should_not_bypass_external_requests(self):
        """Test that external requests are not bypassed."""
        app = Mock()
        middleware = DevelopmentBypassMiddleware(app)

        request = Mock(spec=Request)
        request.headers = {"User-Agent": "Mozilla/5.0"}
        request.client.host = "192.168.1.100"

        assert middleware._should_bypass(request) is False

    def test_get_client_ip_direct(self):
        """Test getting client IP directly."""
        app = Mock()
        middleware = DevelopmentBypassMiddleware(app)

        request = Mock(spec=Request)
        request.client.host = "127.0.0.1"
        request.headers = {}

        ip = middleware._get_client_ip(request)

        assert ip == "127.0.0.1"

    def test_get_client_ip_forwarded_for(self):
        """Test getting client IP from X-Forwarded-For header."""
        app = Mock()
        middleware = DevelopmentBypassMiddleware(app)

        request = Mock(spec=Request)
        request.client.host = "127.0.0.1"
        request.headers = {"X-Forwarded-For": "192.168.1.1, 10.0.0.1"}

        ip = middleware._get_client_ip(request)

        assert ip == "192.168.1.1"

    def test_get_client_ip_real_ip(self):
        """Test getting client IP from X-Real-IP header."""
        app = Mock()
        middleware = DevelopmentBypassMiddleware(app)

        request = Mock(spec=Request)
        request.client.host = "127.0.0.1"
        request.headers = {"X-Real-IP": "192.168.1.1"}

        ip = middleware._get_client_ip(request)

        assert ip == "192.168.1.1"

    def test_get_client_ip_unknown(self):
        """Test getting client IP when unknown."""
        app = Mock()
        middleware = DevelopmentBypassMiddleware(app)

        request = Mock(spec=Request)
        request.client = None
        request.headers = {}

        ip = middleware._get_client_ip(request)

        assert ip == "unknown"

    def test_is_development_environment(self):
        """Test development environment detection."""
        app = Mock()

        # Test development environments
        dev_environments = ["development", "dev", "testing", "test", "staging"]

        for env in dev_environments:
            middleware = DevelopmentBypassMiddleware(app, environment=env)
            assert middleware._is_development_environment() is True

        # Test production environment
        middleware = DevelopmentBypassMiddleware(app, environment="production")
        assert middleware._is_development_environment() is False

    def test_get_config(self):
        """Test get_config method."""
        app = Mock()
        middleware = DevelopmentBypassMiddleware(app, environment="testing")

        config = middleware.get_config()

        assert config["enabled"] is True
        assert config["environment"] == "testing"

    def test_update_config(self):
        """Test update_config method."""
        app = Mock()
        middleware = DevelopmentBypassMiddleware(app)

        new_config = {"enabled": False, "environment": "production"}

        middleware.update_config(new_config)

        assert middleware.enabled is False
        assert middleware.environment == "production"


class TestDevelopmentBypassMiddlewareIntegration:
    """Integration tests for DevelopmentBypassMiddleware with FastAPI."""

    def test_development_bypass_middleware_with_fastapi_app(self):
        """Test development bypass middleware integration with FastAPI app."""
        app = FastAPI()

        # Add development bypass middleware
        app.add_middleware(DevelopmentBypassMiddleware, environment="development")

        @app.get("/test")
        async def test_endpoint():
            return {"message": "test"}

        client = TestClient(app)

        # Test with Fenrir user agent
        response = client.get("/test", headers={"User-Agent": "Fenrir Exploit Suite"})

        assert response.status_code == 200
        assert response.json() == {"message": "test"}

    def test_development_bypass_middleware_localhost(self):
        """Test development bypass middleware with localhost requests."""
        app = FastAPI()

        # Add development bypass middleware
        app.add_middleware(DevelopmentBypassMiddleware, environment="development")

        @app.get("/test")
        async def test_endpoint():
            return {"message": "test"}

        client = TestClient(app)

        # Test with localhost (should be bypassed)
        response = client.get("/test")

        assert response.status_code == 200
        assert response.json() == {"message": "test"}

    def test_development_bypass_middleware_production(self):
        """Test development bypass middleware in production environment."""
        app = FastAPI()

        # Add development bypass middleware in production
        app.add_middleware(DevelopmentBypassMiddleware, environment="production")

        @app.get("/test")
        async def test_endpoint():
            return {"message": "test"}

        client = TestClient(app)

        # Test with Fenrir user agent (should not be bypassed in production)
        response = client.get("/test", headers={"User-Agent": "Fenrir Exploit Suite"})

        assert response.status_code == 200
        assert response.json() == {"message": "test"}

    def test_development_bypass_middleware_disabled(self):
        """Test development bypass middleware when disabled."""
        app = FastAPI()

        # Add disabled development bypass middleware
        app.add_middleware(DevelopmentBypassMiddleware, enabled=False)

        @app.get("/test")
        async def test_endpoint():
            return {"message": "test"}

        client = TestClient(app)

        # Test with Fenrir user agent (should not be bypassed when disabled)
        response = client.get("/test", headers={"User-Agent": "Fenrir Exploit Suite"})

        assert response.status_code == 200
        assert response.json() == {"message": "test"}

    def test_development_bypass_middleware_with_other_middleware(self):
        """Test development bypass middleware with other middleware."""
        app = FastAPI()

        # Add development bypass middleware
        app.add_middleware(DevelopmentBypassMiddleware, environment="development")

        # Add a simple middleware that checks bypass flags
        class TestMiddleware:
            def __init__(self, app):
                self.app = app

            async def __call__(self, scope, receive, send):
                if scope["type"] == "http":
                    request = Request(scope, receive)
                    if hasattr(request.state, "bypass_rate_limiting"):
                        # Add bypass header to response
                        async def send_wrapper(message):
                            if message["type"] == "http.response.start":
                                message["headers"].append(
                                    [b"x-bypass-applied", b"true"]
                                )
                            await send(message)

                        await self.app(scope, receive, send_wrapper)
                        return
                await self.app(scope, receive, send)

        app.add_middleware(TestMiddleware)

        @app.get("/test")
        async def test_endpoint():
            return {"message": "test"}

        client = TestClient(app)

        # Test with Fenrir user agent
        response = client.get("/test", headers={"User-Agent": "Fenrir Exploit Suite"})

        assert response.status_code == 200
        assert response.headers["x-bypass-applied"] == "true"
        assert response.json() == {"message": "test"}

    def test_development_bypass_middleware_multiple_agents(self):
        """Test development bypass middleware with multiple Fenrir agents."""
        app = FastAPI()

        # Add development bypass middleware
        app.add_middleware(DevelopmentBypassMiddleware, environment="development")

        @app.get("/test")
        async def test_endpoint():
            return {"message": "test"}

        client = TestClient(app)

        # Test with different Fenrir agents
        fenrir_agents = [
            "Fenrir Exploit Suite",
            "Reynard Security Tester",
            "Fenrir Testing Framework",
            "Security Assessment Tool",
        ]

        for agent in fenrir_agents:
            response = client.get("/test", headers={"User-Agent": agent})

            assert response.status_code == 200
            assert response.json() == {"message": "test"}
