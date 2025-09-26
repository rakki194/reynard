"""Tests for security headers middleware.

This module provides comprehensive tests for the security headers
middleware including CSP, HSTS, and other security headers.
"""

from unittest.mock import AsyncMock, Mock, patch

import pytest
from fastapi import FastAPI, Request, Response
from fastapi.testclient import TestClient

from app.middleware.security.headers import SecurityHeadersMiddleware


class TestSecurityHeadersMiddleware:
    """Test suite for SecurityHeadersMiddleware class."""

    def test_security_headers_middleware_initialization(self):
        """Test security headers middleware initialization."""
        app = Mock()
        middleware = SecurityHeadersMiddleware(app, environment="development")

        assert middleware.app == app
        assert middleware.environment == "development"
        assert middleware.enabled is True
        assert middleware.logger.name == "middleware.security_headers"

    def test_security_headers_middleware_initialization_disabled(self):
        """Test security headers middleware initialization when disabled."""
        app = Mock()
        middleware = SecurityHeadersMiddleware(app, enabled=False)

        assert middleware.enabled is False

    @pytest.mark.asyncio
    async def test_dispatch_when_disabled(self):
        """Test dispatch method when middleware is disabled."""
        app = Mock()
        middleware = SecurityHeadersMiddleware(app, enabled=False)

        request = Mock(spec=Request)
        call_next = AsyncMock(return_value=Mock(spec=Response))

        result = await middleware.dispatch(request, call_next)

        call_next.assert_called_once_with(request)
        assert result == call_next.return_value

    @pytest.mark.asyncio
    async def test_dispatch_when_enabled(self):
        """Test dispatch method when middleware is enabled."""
        app = Mock()
        middleware = SecurityHeadersMiddleware(app, enabled=True)

        # Mock request
        request = Mock(spec=Request)
        request.url.path = "/test"
        request.method = "GET"

        # Mock response
        response = Mock(spec=Response)
        response.headers = {}
        response.status_code = 200

        # Mock call_next
        call_next = AsyncMock(return_value=response)

        result = await middleware.dispatch(request, call_next)

        call_next.assert_called_once_with(request)
        assert result == response

        # Check that security headers were added
        assert "X-Content-Type-Options" in response.headers
        assert "X-Frame-Options" in response.headers
        assert "X-XSS-Protection" in response.headers
        assert "Referrer-Policy" in response.headers

    @pytest.mark.asyncio
    async def test_dispatch_skip_paths(self):
        """Test dispatch method with skip paths."""
        app = Mock()
        middleware = SecurityHeadersMiddleware(
            app, enabled=True, skip_paths=["/api/docs", "/health"]
        )

        # Mock request for skip path
        request = Mock(spec=Request)
        request.url.path = "/api/docs"
        request.method = "GET"

        # Mock response
        response = Mock(spec=Response)
        response.headers = {}
        response.status_code = 200

        # Mock call_next
        call_next = AsyncMock(return_value=response)

        result = await middleware.dispatch(request, call_next)

        call_next.assert_called_once_with(request)
        assert result == response

        # Check that security headers were NOT added
        assert "X-Content-Type-Options" not in response.headers
        assert "X-Frame-Options" not in response.headers

    def test_add_security_headers_development(self):
        """Test adding security headers in development environment."""
        app = Mock()
        middleware = SecurityHeadersMiddleware(app, environment="development")

        request = Mock(spec=Request)
        response = Mock(spec=Response)
        response.headers = {}

        middleware._add_security_headers(request, response)

        # Check basic security headers
        assert response.headers["X-Content-Type-Options"] == "nosniff"
        assert response.headers["X-Frame-Options"] == "DENY"
        assert response.headers["X-XSS-Protection"] == "1; mode=block"
        assert response.headers["Referrer-Policy"] == "strict-origin-when-cross-origin"

        # Check that CSP is less restrictive in development
        csp = response.headers.get("Content-Security-Policy", "")
        assert "unsafe-inline" in csp or "unsafe-eval" in csp

    def test_add_security_headers_production(self):
        """Test adding security headers in production environment."""
        app = Mock()
        middleware = SecurityHeadersMiddleware(app, environment="production")

        request = Mock(spec=Request)
        response = Mock(spec=Response)
        response.headers = {}

        middleware._add_security_headers(request, response)

        # Check basic security headers
        assert response.headers["X-Content-Type-Options"] == "nosniff"
        assert response.headers["X-Frame-Options"] == "DENY"
        assert response.headers["X-XSS-Protection"] == "1; mode=block"
        assert response.headers["Referrer-Policy"] == "strict-origin-when-cross-origin"

        # Check that CSP is more restrictive in production
        csp = response.headers.get("Content-Security-Policy", "")
        assert "unsafe-inline" not in csp
        assert "unsafe-eval" not in csp

        # Check HSTS header in production
        assert "Strict-Transport-Security" in response.headers

    def test_add_security_headers_custom_config(self):
        """Test adding security headers with custom configuration."""
        app = Mock()
        middleware = SecurityHeadersMiddleware(
            app,
            environment="production",
            csp_enabled=False,
            hsts_enabled=False,
            frame_options="SAMEORIGIN",
        )

        request = Mock(spec=Request)
        response = Mock(spec=Response)
        response.headers = {}

        middleware._add_security_headers(request, response)

        # Check custom frame options
        assert response.headers["X-Frame-Options"] == "SAMEORIGIN"

        # Check that CSP and HSTS are disabled
        assert "Content-Security-Policy" not in response.headers
        assert "Strict-Transport-Security" not in response.headers

    def test_get_csp_policy_development(self):
        """Test CSP policy generation for development."""
        app = Mock()
        middleware = SecurityHeadersMiddleware(app, environment="development")

        policy = middleware._get_csp_policy()

        assert "default-src 'self'" in policy
        assert "script-src 'self' 'unsafe-inline' 'unsafe-eval'" in policy
        assert "style-src 'self' 'unsafe-inline'" in policy

    def test_get_csp_policy_production(self):
        """Test CSP policy generation for production."""
        app = Mock()
        middleware = SecurityHeadersMiddleware(app, environment="production")

        policy = middleware._get_csp_policy()

        assert "default-src 'self'" in policy
        assert "script-src 'self'" in policy
        assert "style-src 'self'" in policy
        assert "unsafe-inline" not in policy
        assert "unsafe-eval" not in policy

    def test_get_csp_policy_custom(self):
        """Test CSP policy generation with custom policy."""
        app = Mock()
        middleware = SecurityHeadersMiddleware(
            app, csp_policy="default-src 'none'; script-src 'self'"
        )

        policy = middleware._get_csp_policy()

        assert policy == "default-src 'none'; script-src 'self'"

    def test_get_hsts_header(self):
        """Test HSTS header generation."""
        app = Mock()
        middleware = SecurityHeadersMiddleware(app, environment="production")

        hsts = middleware._get_hsts_header()

        assert "max-age=31536000" in hsts
        assert "includeSubDomains" in hsts
        assert "preload" in hsts

    def test_get_hsts_header_custom(self):
        """Test HSTS header generation with custom settings."""
        app = Mock()
        middleware = SecurityHeadersMiddleware(
            app, hsts_max_age=7200, hsts_include_subdomains=False, hsts_preload=False
        )

        hsts = middleware._get_hsts_header()

        assert "max-age=7200" in hsts
        assert "includeSubDomains" not in hsts
        assert "preload" not in hsts

    def test_should_skip_path(self):
        """Test path skipping logic."""
        app = Mock()
        middleware = SecurityHeadersMiddleware(
            app, skip_paths=["/api/docs", "/health", "/static"]
        )

        # Test paths that should be skipped
        assert middleware._should_skip_path("/api/docs") is True
        assert middleware._should_skip_path("/health") is True
        assert middleware._should_skip_path("/static/css/style.css") is True

        # Test paths that should not be skipped
        assert middleware._should_skip_path("/api/users") is False
        assert middleware._should_skip_path("/dashboard") is False
        assert middleware._should_skip_path("/") is False

    def test_get_config(self):
        """Test get_config method."""
        app = Mock()
        middleware = SecurityHeadersMiddleware(app, environment="production")

        config = middleware.get_config()

        assert config["environment"] == "production"
        assert config["enabled"] is True
        assert config["csp_enabled"] is True
        assert config["hsts_enabled"] is True

    def test_update_config(self):
        """Test update_config method."""
        app = Mock()
        middleware = SecurityHeadersMiddleware(app)

        new_config = {
            "environment": "production",
            "csp_enabled": False,
            "hsts_enabled": False,
        }

        middleware.update_config(new_config)

        assert middleware.environment == "production"
        assert middleware.csp_enabled is False
        assert middleware.hsts_enabled is False


class TestSecurityHeadersMiddlewareIntegration:
    """Integration tests for SecurityHeadersMiddleware with FastAPI."""

    def test_security_headers_middleware_with_fastapi_app(self):
        """Test security headers middleware integration with FastAPI app."""
        app = FastAPI()

        # Add security headers middleware
        app.add_middleware(SecurityHeadersMiddleware, environment="production")

        @app.get("/test")
        async def test_endpoint():
            return {"message": "test"}

        # Test with client
        client = TestClient(app)
        response = client.get("/test")

        assert response.status_code == 200
        assert response.headers["X-Content-Type-Options"] == "nosniff"
        assert response.headers["X-Frame-Options"] == "DENY"
        assert response.headers["X-XSS-Protection"] == "1; mode=block"
        assert response.headers["Referrer-Policy"] == "strict-origin-when-cross-origin"
        assert "Content-Security-Policy" in response.headers
        assert "Strict-Transport-Security" in response.headers
        assert response.json() == {"message": "test"}

    def test_security_headers_middleware_skip_paths(self):
        """Test security headers middleware with skip paths."""
        app = FastAPI()

        # Add security headers middleware with skip paths
        app.add_middleware(
            SecurityHeadersMiddleware,
            environment="production",
            skip_paths=["/api/docs", "/health"],
        )

        @app.get("/test")
        async def test_endpoint():
            return {"message": "test"}

        @app.get("/api/docs")
        async def docs_endpoint():
            return {"message": "docs"}

        client = TestClient(app)

        # Test normal endpoint - should have security headers
        response = client.get("/test")
        assert response.status_code == 200
        assert "X-Content-Type-Options" in response.headers

        # Test skip path - should not have security headers
        response = client.get("/api/docs")
        assert response.status_code == 200
        assert "X-Content-Type-Options" not in response.headers

    def test_security_headers_middleware_disabled(self):
        """Test security headers middleware when disabled."""
        app = FastAPI()

        # Add disabled security headers middleware
        app.add_middleware(SecurityHeadersMiddleware, enabled=False)

        @app.get("/test")
        async def test_endpoint():
            return {"message": "test"}

        client = TestClient(app)
        response = client.get("/test")

        assert response.status_code == 200
        assert "X-Content-Type-Options" not in response.headers
        assert "X-Frame-Options" not in response.headers
        assert response.json() == {"message": "test"}

    def test_security_headers_middleware_development_vs_production(self):
        """Test security headers middleware differences between environments."""
        # Development app
        dev_app = FastAPI()
        dev_app.add_middleware(SecurityHeadersMiddleware, environment="development")

        @dev_app.get("/test")
        async def test_endpoint():
            return {"message": "test"}

        # Production app
        prod_app = FastAPI()
        prod_app.add_middleware(SecurityHeadersMiddleware, environment="production")

        @prod_app.get("/test")
        async def test_endpoint():
            return {"message": "test"}

        dev_client = TestClient(dev_app)
        prod_client = TestClient(prod_app)

        # Test development
        dev_response = dev_client.get("/test")
        dev_csp = dev_response.headers.get("Content-Security-Policy", "")

        # Test production
        prod_response = prod_client.get("/test")
        prod_csp = prod_response.headers.get("Content-Security-Policy", "")

        # Development should have more permissive CSP
        assert "unsafe-inline" in dev_csp or "unsafe-eval" in dev_csp

        # Production should have more restrictive CSP
        assert "unsafe-inline" not in prod_csp
        assert "unsafe-eval" not in prod_csp

        # Production should have HSTS
        assert "Strict-Transport-Security" in prod_response.headers
        assert "Strict-Transport-Security" not in dev_response.headers
