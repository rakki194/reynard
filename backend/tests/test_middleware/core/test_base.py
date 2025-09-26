"""Tests for the base middleware classes.

This module provides comprehensive tests for the base middleware
functionality including error handling, logging, and configuration.
"""

from unittest.mock import AsyncMock, Mock, patch

import pytest
from fastapi import FastAPI, Request, Response
from fastapi.testclient import TestClient

from app.middleware.core.base import BaseMiddleware


class ConcreteMiddleware(BaseMiddleware):
    """Concrete implementation of BaseMiddleware for testing."""

    async def process_request(self, request, call_next):
        """Process the request."""
        return await call_next(request)


class TestBaseMiddleware:
    """Test suite for BaseMiddleware class."""

    def test_base_middleware_initialization(self):
        """Test base middleware initialization."""
        app = Mock()
        middleware = ConcreteMiddleware(app, "test_middleware")

        assert middleware.app == app
        assert middleware.name == "test_middleware"
        assert middleware.enabled is True
        assert middleware.config == {}
        assert middleware.logger.name == "middleware.test_middleware"

    def test_base_middleware_with_config(self):
        """Test base middleware initialization with configuration."""
        app = Mock()
        config = {"test_key": "test_value"}
        middleware = ConcreteMiddleware(app, "test_middleware", config=config)

        assert middleware.config == config

    def test_base_middleware_disabled(self):
        """Test base middleware initialization when disabled."""
        app = Mock()
        middleware = ConcreteMiddleware(app, "test_middleware", enabled=False)

        assert middleware.enabled is False

    @pytest.mark.asyncio
    async def test_dispatch_when_disabled(self):
        """Test dispatch method when middleware is disabled."""
        app = Mock()
        middleware = ConcreteMiddleware(app, "test_middleware", enabled=False)

        request = Mock(spec=Request)
        call_next = AsyncMock(return_value=Mock(spec=Response))

        result = await middleware.dispatch(request, call_next)

        call_next.assert_called_once_with(request)
        assert result == call_next.return_value

    @pytest.mark.asyncio
    async def test_dispatch_when_enabled(self):
        """Test dispatch method when middleware is enabled."""
        app = Mock()
        middleware = ConcreteMiddleware(app, "test_middleware", enabled=True)

        request = Mock(spec=Request)
        request.method = "GET"
        request.url.path = "/test"

        response = Mock(spec=Response)
        response.headers = {}
        response.status_code = 200

        call_next = AsyncMock(return_value=response)

        result = await middleware.dispatch(request, call_next)

        call_next.assert_called_once_with(request)
        assert result == response

    @pytest.mark.asyncio
    async def test_dispatch_exception_handling(self):
        """Test dispatch method exception handling."""
        app = Mock()
        middleware = ConcreteMiddleware(app, "test_middleware", enabled=True)

        request = Mock(spec=Request)
        request.method = "GET"
        request.url.path = "/test"

        # Mock call_next to raise an exception
        call_next = AsyncMock(side_effect=Exception("Test error"))

        # The base middleware should catch and log the exception
        # The handle_error method will call call_next again, which will raise the exception again
        # This is the current behavior - the middleware doesn't provide error response handling
        with pytest.raises(Exception, match="Test error"):
            await middleware.dispatch(request, call_next)

    def test_get_config(self):
        """Test get_config method."""
        app = Mock()
        config = {"test_key": "test_value"}
        middleware = ConcreteMiddleware(app, "test_middleware", config=config)

        assert middleware.get_config("test_key") == "test_value"
        assert middleware.get_config("nonexistent", "default") == "default"

    def test_set_config(self):
        """Test set_config method."""
        app = Mock()
        middleware = ConcreteMiddleware(app, "test_middleware")

        middleware.set_config("new_key", "new_value")

        assert middleware.get_config("new_key") == "new_value"

    def test_is_enabled(self):
        """Test is_enabled method."""
        app = Mock()

        # Test enabled middleware
        middleware_enabled = ConcreteMiddleware(app, "test_middleware", enabled=True)
        assert middleware_enabled.is_enabled() is True

        # Test disabled middleware
        middleware_disabled = ConcreteMiddleware(app, "test_middleware", enabled=False)
        assert middleware_disabled.is_enabled() is False

    def test_name_property(self):
        """Test name property."""
        app = Mock()
        middleware = ConcreteMiddleware(app, "test_middleware")

        assert middleware.name == "test_middleware"

    def test_logger_initialization(self):
        """Test logger initialization."""
        app = Mock()
        middleware = ConcreteMiddleware(app, "test_middleware")

        assert middleware.logger.name == "middleware.test_middleware"
        assert middleware.logger.level == 0  # Default level

    def test_kwargs_storage(self):
        """Test that additional kwargs are stored."""
        app = Mock()
        middleware = ConcreteMiddleware(
            app, "test_middleware", extra_param="extra_value", another_param=123
        )

        assert middleware.kwargs["extra_param"] == "extra_value"
        assert middleware.kwargs["another_param"] == 123


class TestBaseMiddlewareIntegration:
    """Integration tests for BaseMiddleware with FastAPI."""

    def test_middleware_with_fastapi_app(self):
        """Test middleware integration with FastAPI app."""
        app = FastAPI()

        class TestMiddleware(ConcreteMiddleware):
            async def process_request(self, request, call_next):
                response = await call_next(request)
                response.headers["X-Test-Middleware"] = "test"
                return response

        # Add middleware to app
        app.add_middleware(TestMiddleware, name="test_middleware")

        @app.get("/test")
        async def test_endpoint():
            return {"message": "test"}

        # Test with client
        client = TestClient(app)
        response = client.get("/test")

        assert response.status_code == 200
        assert response.headers["X-Test-Middleware"] == "test"
        assert response.json() == {"message": "test"}

    def test_middleware_order(self):
        """Test middleware execution order."""
        app = FastAPI()

        class FirstMiddleware(ConcreteMiddleware):
            async def process_request(self, request, call_next):
                response = await call_next(request)
                response.headers["X-First"] = "1"
                return response

        class SecondMiddleware(ConcreteMiddleware):
            async def process_request(self, request, call_next):
                response = await call_next(request)
                response.headers["X-Second"] = "2"
                return response

        # Add middlewares in order
        app.add_middleware(FirstMiddleware, name="first")
        app.add_middleware(SecondMiddleware, name="second")

        @app.get("/test")
        async def test_endpoint():
            return {"message": "test"}

        client = TestClient(app)
        response = client.get("/test")

        assert response.status_code == 200
        assert response.headers["X-First"] == "1"
        assert response.headers["X-Second"] == "2"

    def test_middleware_disabled_integration(self):
        """Test disabled middleware in FastAPI app."""
        app = FastAPI()

        class TestMiddleware(ConcreteMiddleware):
            async def process_request(self, request, call_next):
                response = await call_next(request)
                response.headers["X-Test-Middleware"] = "test"
                return response

        # Add disabled middleware
        app.add_middleware(TestMiddleware, name="test_middleware", enabled=False)

        @app.get("/test")
        async def test_endpoint():
            return {"message": "test"}

        client = TestClient(app)
        response = client.get("/test")

        assert response.status_code == 200
        assert "X-Test-Middleware" not in response.headers
        assert response.json() == {"message": "test"}
