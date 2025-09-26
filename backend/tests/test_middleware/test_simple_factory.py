"""Tests for the simple middleware factory.

This module provides comprehensive tests for the simple middleware factory
including middleware setup, configuration, and integration.
"""

from unittest.mock import Mock, patch

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.middleware.factory import (
    create_custom_middleware_stack,
    setup_middleware,
)


class TestSetupReynardMiddleware:
    """Test suite for setup_reynard_middleware function."""

    def test_setup_reynard_middleware_default(self):
        """Test setup_reynard_middleware with default configuration."""
        app = FastAPI()

        setup_middleware(app, environment="development")

        # Check that middleware was added
        assert len(app.user_middleware) > 0

        # Check that we have the expected middleware types
        middleware_names = [mw.cls.__name__ for mw in app.user_middleware]
        assert "DevelopmentBypassMiddleware" in middleware_names
        assert "InputValidationMiddleware" in middleware_names
        assert "CORSMiddleware" in middleware_names
        assert "SimpleRateLimiter" in middleware_names
        assert "SecurityHeadersMiddleware" in middleware_names

    def test_setup_reynard_middleware_production(self):
        """Test setup_reynard_middleware in production environment."""
        app = FastAPI()

        setup_middleware(app, environment="production")

        # Check that middleware was added
        assert len(app.user_middleware) > 0

        # In production, development bypass should not be added
        middleware_names = [mw.cls.__name__ for mw in app.user_middleware]
        assert "DevelopmentBypassMiddleware" not in middleware_names
        assert "InputValidationMiddleware" in middleware_names
        assert "CORSMiddleware" in middleware_names
        assert "SimpleRateLimiter" in middleware_names
        assert "SecurityHeadersMiddleware" in middleware_names

    def test_setup_reynard_middleware_testing(self):
        """Test setup_reynard_middleware in testing environment."""
        app = FastAPI()

        setup_middleware(app, environment="testing")

        # Check that middleware was added
        assert len(app.user_middleware) > 0

        # In testing, development bypass should be added
        middleware_names = [mw.cls.__name__ for mw in app.user_middleware]
        assert "DevelopmentBypassMiddleware" in middleware_names
        assert "InputValidationMiddleware" in middleware_names
        assert "CORSMiddleware" in middleware_names
        assert "SimpleRateLimiter" in middleware_names
        assert "SecurityHeadersMiddleware" in middleware_names

    def test_setup_reynard_middleware_with_config(self):
        """Test setup_reynard_middleware with custom configuration."""
        app = FastAPI()

        config_kwargs = {
            "rate_limit": 50,
            "rate_window": 30,
            "cors_origins": ["http://localhost:3000"],
            "security_headers_enabled": False,
        }

        setup_middleware(app, environment="development", **config_kwargs)

        # Check that middleware was added
        assert len(app.user_middleware) > 0

    @patch('app.middleware.factory.logger')
    def test_setup_reynard_middleware_logging(self, mock_logger):
        """Test setup_reynard_middleware logging."""
        app = FastAPI()

        setup_middleware(app, environment="development")

        # Check that logging was called
        assert mock_logger.info.called
        assert any(
            "Setting up Reynard middleware" in str(call)
            for call in mock_logger.info.call_args_list
        )
        assert any(
            "Reynard middleware setup complete" in str(call)
            for call in mock_logger.info.call_args_list
        )


class TestCreateMiddlewareStack:
    """Test suite for create_middleware_stack function."""

    def test_create_middleware_stack_default(self):
        """Test create_middleware_stack with default configuration."""
        app = FastAPI()

        create_custom_middleware_stack(app, environment="development")

        # Check that middleware was added
        assert len(app.user_middleware) > 0

        # Check that we have the expected middleware types
        middleware_names = [mw.cls.__name__ for mw in app.user_middleware]
        assert "DevelopmentBypassMiddleware" in middleware_names
        assert "InputValidationMiddleware" in middleware_names
        assert "CORSMiddleware" in middleware_names
        assert "SimpleRateLimiter" in middleware_names
        assert "SecurityHeadersMiddleware" in middleware_names

    def test_create_middleware_stack_custom_order(self):
        """Test create_middleware_stack with custom middleware order."""
        app = FastAPI()

        custom_order = ["cors", "rate_limiting", "security_headers"]

        create_custom_middleware_stack(
            app, environment="development", middleware_order=custom_order
        )

        # Check that middleware was added
        assert len(app.user_middleware) > 0

        # Check that we have the expected middleware types
        middleware_names = [mw.cls.__name__ for mw in app.user_middleware]
        assert "CORSMiddleware" in middleware_names
        assert "SimpleRateLimiter" in middleware_names
        assert "SecurityHeadersMiddleware" in middleware_names

    def test_create_middleware_stack_custom_enabled(self):
        """Test create_middleware_stack with custom enabled middleware."""
        app = FastAPI()

        enabled_middleware = ["cors", "security_headers"]

        create_custom_middleware_stack(
            app, environment="development", enabled_middleware=enabled_middleware
        )

        # Check that middleware was added
        assert len(app.user_middleware) > 0

        # Check that we have only the enabled middleware types
        middleware_names = [mw.cls.__name__ for mw in app.user_middleware]
        assert "CORSMiddleware" in middleware_names
        assert "SecurityHeadersMiddleware" in middleware_names
        assert "DevelopmentBypassMiddleware" not in middleware_names
        assert "InputValidationMiddleware" not in middleware_names
        assert "SimpleRateLimiter" not in middleware_names

    def test_create_middleware_stack_production(self):
        """Test create_middleware_stack in production environment."""
        app = FastAPI()

        create_custom_middleware_stack(app, environment="production")

        # Check that middleware was added
        assert len(app.user_middleware) > 0

        # In production, development bypass should not be added
        middleware_names = [mw.cls.__name__ for mw in app.user_middleware]
        assert "DevelopmentBypassMiddleware" not in middleware_names
        assert "InputValidationMiddleware" in middleware_names
        assert "CORSMiddleware" in middleware_names
        assert "SimpleRateLimiter" in middleware_names
        assert "SecurityHeadersMiddleware" in middleware_names

    def test_create_middleware_stack_with_config(self):
        """Test create_middleware_stack with custom configuration."""
        app = FastAPI()

        config_kwargs = {
            "rate_limit": 200,
            "rate_window": 120,
            "cors_origins": ["https://example.com"],
            "security_headers_enabled": True,
        }

        create_custom_middleware_stack(app, environment="development", **config_kwargs)

        # Check that middleware was added
        assert len(app.user_middleware) > 0

    @patch('app.middleware.factory.logger')
    def test_create_middleware_stack_logging(self, mock_logger):
        """Test create_middleware_stack logging."""
        app = FastAPI()

        create_custom_middleware_stack(app, environment="development")

        # Check that logging was called
        assert mock_logger.info.called
        assert any(
            "Creating custom middleware stack" in str(call)
            for call in mock_logger.info.call_args_list
        )
        assert any(
            "Custom middleware stack creation complete" in str(call)
            for call in mock_logger.info.call_args_list
        )


class TestMiddlewareFactoryIntegration:
    """Integration tests for the middleware factory with FastAPI."""

    def test_middleware_factory_integration(self):
        """Test complete middleware factory integration."""
        app = FastAPI()

        # Setup middleware
        setup_middleware(app, environment="development")

        @app.get("/test")
        async def test_endpoint():
            return {"message": "test"}

        client = TestClient(app)

        # Test the endpoint
        response = client.get("/test")

        assert response.status_code == 200
        assert response.json() == {"message": "test"}

        # Check that security headers were added
        assert "X-Content-Type-Options" in response.headers
        assert "X-Frame-Options" in response.headers

    def test_middleware_factory_cors_integration(self):
        """Test CORS middleware integration."""
        app = FastAPI()

        # Setup middleware
        setup_middleware(app, environment="development")

        @app.get("/test")
        async def test_endpoint():
            return {"message": "test"}

        client = TestClient(app)

        # Test with CORS headers
        response = client.get("/test", headers={"Origin": "http://localhost:3000"})

        assert response.status_code == 200
        assert response.json() == {"message": "test"}
        assert "Access-Control-Allow-Origin" in response.headers

    def test_middleware_factory_rate_limiting_integration(self):
        """Test rate limiting middleware integration."""
        app = FastAPI()

        # Setup middleware with low rate limit
        setup_reynard_middleware(
            app, environment="development", rate_limit=1, rate_window=60
        )

        @app.get("/test")
        async def test_endpoint():
            return {"message": "test"}

        client = TestClient(app)

        # First request should pass
        response = client.get("/test")
        assert response.status_code == 200
        assert response.json() == {"message": "test"}

        # Second request should be rate limited
        response = client.get("/test")
        assert response.status_code == 429
        assert "Rate limit exceeded" in response.text

    def test_middleware_factory_development_bypass_integration(self):
        """Test development bypass middleware integration."""
        app = FastAPI()

        # Setup middleware
        setup_middleware(app, environment="development")

        @app.get("/test")
        async def test_endpoint():
            return {"message": "test"}

        client = TestClient(app)

        # Test with Fenrir user agent (should bypass rate limiting)
        response = client.get("/test", headers={"User-Agent": "Fenrir Exploit Suite"})

        assert response.status_code == 200
        assert response.json() == {"message": "test"}

    def test_middleware_factory_custom_stack_integration(self):
        """Test custom middleware stack integration."""
        app = FastAPI()

        # Create custom middleware stack
        create_middleware_stack(
            app,
            environment="development",
            enabled_middleware=["cors", "security_headers"],
        )

        @app.get("/test")
        async def test_endpoint():
            return {"message": "test"}

        client = TestClient(app)

        # Test the endpoint
        response = client.get("/test")

        assert response.status_code == 200
        assert response.json() == {"message": "test"}

        # Check that security headers were added
        assert "X-Content-Type-Options" in response.headers

        # Check that CORS headers were added
        assert "Access-Control-Allow-Origin" in response.headers

    def test_middleware_factory_error_handling(self):
        """Test middleware factory error handling."""
        app = FastAPI()

        # Setup middleware
        setup_middleware(app, environment="development")

        @app.get("/error")
        async def error_endpoint():
            raise Exception("Test error")

        client = TestClient(app)

        # Test error endpoint
        response = client.get("/error")

        # Should still return 500 (not handled by middleware)
        assert response.status_code == 500

    def test_middleware_factory_middleware_order(self):
        """Test middleware execution order."""
        app = FastAPI()

        # Setup middleware
        setup_middleware(app, environment="development")

        @app.get("/test")
        async def test_endpoint():
            return {"message": "test"}

        client = TestClient(app)

        # Test the endpoint
        response = client.get("/test")

        assert response.status_code == 200
        assert response.json() == {"message": "test"}

        # Check that all expected headers are present
        assert "X-Content-Type-Options" in response.headers
        assert "Access-Control-Allow-Origin" in response.headers
        assert "X-RateLimit-Limit" in response.headers
