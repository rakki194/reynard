"""Tests for CORS middleware implementation.

This module provides comprehensive tests for the CORS middleware
including origin validation, preflight handling, and security features.
"""

from unittest.mock import AsyncMock, Mock, patch

import pytest
from fastapi import FastAPI, Request, Response
from fastapi.testclient import TestClient

from app.middleware.cors.config import CORSConfig
from app.middleware.cors.middleware import CORSMiddleware
from app.middleware.cors.validator import CORSValidator


class TestCORSMiddleware:
    """Test suite for CORSMiddleware class."""

    def test_cors_middleware_initialization(self):
        """Test CORS middleware initialization."""
        app = Mock()
        config = CORSConfig()
        middleware = CORSMiddleware(app, config=config)

        assert middleware.app == app
        assert middleware.config == config
        assert isinstance(middleware.validator, CORSValidator)
        assert middleware.logger.name == "cors.middleware"

    def test_cors_middleware_initialization_with_kwargs(self):
        """Test CORS middleware initialization with kwargs."""
        app = Mock()
        middleware = CORSMiddleware(
            app, allowed_origins=["http://localhost:3000"], allow_credentials=True
        )

        assert middleware.config.allowed_origins == ["http://localhost:3000"]
        assert middleware.config.allow_credentials is True

    @pytest.mark.asyncio
    async def test_dispatch_preflight_request(self):
        """Test handling of preflight requests."""
        app = Mock()
        config = CORSConfig(allowed_origins=["http://localhost:3000"])
        middleware = CORSMiddleware(app, config=config)

        # Mock request
        request = Mock(spec=Request)
        request.method = "OPTIONS"
        request.headers = {"origin": "http://localhost:3000"}
        request.url.path = "/api/test"

        # Mock call_next
        call_next = AsyncMock()

        # Mock validator
        middleware.validator.validate_preflight_request = AsyncMock(
            return_value=(True, None)
        )

        result = await middleware.dispatch(request, call_next)

        assert result.status_code == 200
        assert "Access-Control-Allow-Origin" in result.headers
        call_next.assert_not_called()

    @pytest.mark.asyncio
    async def test_dispatch_preflight_request_invalid(self):
        """Test handling of invalid preflight requests."""
        app = Mock()
        config = CORSConfig(allowed_origins=["http://localhost:3000"])
        middleware = CORSMiddleware(app, config=config)

        # Mock request
        request = Mock(spec=Request)
        request.method = "OPTIONS"
        request.headers = {"origin": "http://malicious.com"}
        request.url.path = "/api/test"

        # Mock call_next
        call_next = AsyncMock()

        # Mock validator to return invalid
        middleware.validator.validate_preflight_request = AsyncMock(
            return_value=(False, "Origin not allowed")
        )

        result = await middleware.dispatch(request, call_next)

        assert result.status_code == 403
        assert "CORS preflight failed" in result.body.decode()
        call_next.assert_not_called()

    @pytest.mark.asyncio
    async def test_dispatch_actual_request(self):
        """Test handling of actual requests."""
        app = Mock()
        config = CORSConfig(allowed_origins=["http://localhost:3000"])
        middleware = CORSMiddleware(app, config=config)

        # Mock request
        request = Mock(spec=Request)
        request.method = "GET"
        request.headers = {"origin": "http://localhost:3000"}
        request.url.path = "/api/test"

        # Mock response
        response = Mock(spec=Response)
        response.headers = {}
        response.status_code = 200

        # Mock call_next
        call_next = AsyncMock(return_value=response)

        # Mock validator
        middleware.validator.validate_actual_request = AsyncMock(
            return_value=(True, None)
        )

        result = await middleware.dispatch(request, call_next)

        assert result == response
        assert "Access-Control-Allow-Origin" in response.headers
        call_next.assert_called_once_with(request)

    @pytest.mark.asyncio
    async def test_dispatch_actual_request_invalid(self):
        """Test handling of invalid actual requests."""
        app = Mock()
        config = CORSConfig(allowed_origins=["http://localhost:3000"])
        middleware = CORSMiddleware(app, config=config)

        # Mock request
        request = Mock(spec=Request)
        request.method = "GET"
        request.headers = {"origin": "http://malicious.com"}
        request.url.path = "/api/test"

        # Mock call_next
        call_next = AsyncMock()

        # Mock validator to return invalid
        middleware.validator.validate_actual_request = AsyncMock(
            return_value=(False, "Origin not allowed")
        )

        result = await middleware.dispatch(request, call_next)

        assert result.status_code == 403
        assert "CORS validation failed" in result.body.decode()
        call_next.assert_not_called()

    def test_get_config(self):
        """Test get_config method."""
        app = Mock()
        config = CORSConfig(allowed_origins=["http://localhost:3000"])
        middleware = CORSMiddleware(app, config=config)

        assert middleware.get_config() == config

    def test_update_config(self):
        """Test update_config method."""
        app = Mock()
        config = CORSConfig(allowed_origins=["http://localhost:3000"])
        middleware = CORSMiddleware(app, config=config)

        new_config = CORSConfig(allowed_origins=["http://localhost:3001"])
        middleware.update_config(new_config)

        assert middleware.config == new_config
        assert middleware.validator.config == new_config

    def test_is_origin_allowed(self):
        """Test is_origin_allowed method."""
        app = Mock()
        config = CORSConfig(allowed_origins=["http://localhost:3000"])
        middleware = CORSMiddleware(app, config=config)

        # Mock validator
        middleware.validator.validate_origin = Mock(return_value=True)

        assert middleware.is_origin_allowed("http://localhost:3000") is True
        middleware.validator.validate_origin.assert_called_once_with(
            "http://localhost:3000"
        )

    def test_get_allowed_origins(self):
        """Test get_allowed_origins method."""
        app = Mock()
        config = CORSConfig(allowed_origins=["http://localhost:3000"])
        middleware = CORSMiddleware(app, config=config)

        # Mock config method
        middleware.config.get_effective_origins = Mock(
            return_value=["http://localhost:3000"]
        )

        assert middleware.get_allowed_origins() == ["http://localhost:3000"]

    def test_get_allowed_methods(self):
        """Test get_allowed_methods method."""
        app = Mock()
        config = CORSConfig(allowed_methods=["GET", "POST"])
        middleware = CORSMiddleware(app, config=config)

        assert middleware.get_allowed_methods() == ["GET", "POST"]

    def test_get_allowed_headers(self):
        """Test get_allowed_headers method."""
        app = Mock()
        config = CORSConfig(allowed_headers=["Content-Type", "Authorization"])
        middleware = CORSMiddleware(app, config=config)

        assert middleware.get_allowed_headers() == ["Content-Type", "Authorization"]

    def test_get_validation_summary(self):
        """Test get_validation_summary method."""
        app = Mock()
        config = CORSConfig()
        middleware = CORSMiddleware(app, config=config)

        request = Mock(spec=Request)
        middleware.validator.get_validation_summary = Mock(
            return_value={"test": "summary"}
        )

        result = middleware.get_validation_summary(request)

        assert result == {"test": "summary"}
        middleware.validator.get_validation_summary.assert_called_once_with(request)


class TestCORSMiddlewareIntegration:
    """Integration tests for CORSMiddleware with FastAPI."""

    def test_cors_middleware_with_fastapi_app(self):
        """Test CORS middleware integration with FastAPI app."""
        app = FastAPI()

        # Add CORS middleware
        app.add_middleware(
            CORSMiddleware,
            allowed_origins=["http://localhost:3000"],
            allow_credentials=True,
            allowed_methods=["GET", "POST"],
            allowed_headers=["Content-Type", "Authorization"],
        )

        @app.get("/test")
        async def test_endpoint():
            return {"message": "test"}

        # Test with client
        client = TestClient(app)

        # Test actual request
        response = client.get("/test", headers={"Origin": "http://localhost:3000"})

        assert response.status_code == 200
        assert (
            response.headers["Access-Control-Allow-Origin"] == "http://localhost:3000"
        )
        assert response.headers["Access-Control-Allow-Credentials"] == "true"
        assert response.json() == {"message": "test"}

    def test_cors_preflight_request(self):
        """Test CORS preflight request handling."""
        app = FastAPI()

        # Add CORS middleware
        app.add_middleware(
            CORSMiddleware,
            allowed_origins=["http://localhost:3000"],
            allowed_methods=["GET", "POST"],
            allowed_headers=["Content-Type", "Authorization"],
        )

        @app.post("/test")
        async def test_endpoint():
            return {"message": "test"}

        client = TestClient(app)

        # Test preflight request
        response = client.options(
            "/test",
            headers={
                "Origin": "http://localhost:3000",
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "Content-Type",
            },
        )

        assert response.status_code == 200
        assert (
            response.headers["Access-Control-Allow-Origin"] == "http://localhost:3000"
        )
        assert response.headers["Access-Control-Allow-Methods"] == "POST"
        assert response.headers["Access-Control-Allow-Headers"] == "Content-Type"

    def test_cors_invalid_origin(self):
        """Test CORS with invalid origin."""
        app = FastAPI()

        # Add CORS middleware
        app.add_middleware(CORSMiddleware, allowed_origins=["http://localhost:3000"])

        @app.get("/test")
        async def test_endpoint():
            return {"message": "test"}

        client = TestClient(app)

        # Test with invalid origin
        response = client.get("/test", headers={"Origin": "http://malicious.com"})

        assert response.status_code == 403
        assert "CORS validation failed" in response.text

    def test_cors_wildcard_origins(self):
        """Test CORS with wildcard origins."""
        app = FastAPI()

        # Add CORS middleware with wildcard
        app.add_middleware(
            CORSMiddleware,
            allowed_origins=["*"],
            allow_credentials=False,  # Cannot use credentials with wildcard
        )

        @app.get("/test")
        async def test_endpoint():
            return {"message": "test"}

        client = TestClient(app)

        # Test with any origin
        response = client.get("/test", headers={"Origin": "http://any-origin.com"})

        assert response.status_code == 200
        assert response.headers["Access-Control-Allow-Origin"] == "*"
        assert "Access-Control-Allow-Credentials" not in response.headers

    def test_cors_multiple_origins(self):
        """Test CORS with multiple allowed origins."""
        app = FastAPI()

        # Add CORS middleware with multiple origins
        app.add_middleware(
            CORSMiddleware,
            allowed_origins=[
                "http://localhost:3000",
                "https://app.example.com",
                "https://staging.example.com",
            ],
        )

        @app.get("/test")
        async def test_endpoint():
            return {"message": "test"}

        client = TestClient(app)

        # Test with first origin
        response = client.get("/test", headers={"Origin": "http://localhost:3000"})
        assert response.status_code == 200
        assert (
            response.headers["Access-Control-Allow-Origin"] == "http://localhost:3000"
        )

        # Test with second origin
        response = client.get("/test", headers={"Origin": "https://app.example.com"})
        assert response.status_code == 200
        assert (
            response.headers["Access-Control-Allow-Origin"] == "https://app.example.com"
        )

        # Test with third origin
        response = client.get(
            "/test", headers={"Origin": "https://staging.example.com"}
        )
        assert response.status_code == 200
        assert (
            response.headers["Access-Control-Allow-Origin"]
            == "https://staging.example.com"
        )
