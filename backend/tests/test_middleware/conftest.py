"""Configuration and fixtures for middleware tests.

This module provides common fixtures and configuration for all middleware tests.
"""

import pytest
from unittest.mock import Mock
from fastapi import FastAPI, Request, Response
from fastapi.testclient import TestClient

from app.middleware.cors.config import CORSConfig
from app.middleware.security.headers import SecurityHeadersMiddleware
from app.middleware.rate_limiting.simple import SimpleRateLimiter
from app.middleware.development.bypass import DevelopmentBypassMiddleware


@pytest.fixture
def mock_app():
    """Create a mock ASGI application."""
    return Mock()


@pytest.fixture
def fastapi_app():
    """Create a FastAPI application for testing."""
    return FastAPI()


@pytest.fixture
def test_client(fastapi_app):
    """Create a test client for FastAPI app."""
    return TestClient(fastapi_app)


@pytest.fixture
def mock_request():
    """Create a mock FastAPI request."""
    request = Mock(spec=Request)
    request.method = "GET"
    request.url.path = "/test"
    request.headers = {}
    request.client.host = "127.0.0.1"
    request.state = Mock()
    return request


@pytest.fixture
def mock_response():
    """Create a mock FastAPI response."""
    response = Mock(spec=Response)
    response.headers = {}
    response.status_code = 200
    response.body = b'{"message": "test"}'
    return response


@pytest.fixture
def mock_call_next(mock_response):
    """Create a mock call_next function."""
    async def call_next(request):
        return mock_response
    return call_next


@pytest.fixture
def cors_config():
    """Create a CORS configuration for testing."""
    return CORSConfig(
        allowed_origins=["http://localhost:3000"],
        allow_credentials=True,
        allowed_methods=["GET", "POST"],
        allowed_headers=["Content-Type", "Authorization"]
    )


@pytest.fixture
def cors_config_development():
    """Create a development CORS configuration for testing."""
    return CORSConfig(
        environment="development",
        allowed_origins=["*"],
        allow_credentials=False,
        allowed_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowed_headers=["*"]
    )


@pytest.fixture
def cors_config_production():
    """Create a production CORS configuration for testing."""
    return CORSConfig(
        environment="production",
        allowed_origins=["https://example.com"],
        allow_credentials=True,
        allowed_methods=["GET", "POST"],
        allowed_headers=["Content-Type", "Authorization"]
    )


@pytest.fixture
def security_headers_middleware(mock_app):
    """Create a security headers middleware for testing."""
    return SecurityHeadersMiddleware(mock_app, environment="development")


@pytest.fixture
def rate_limiter_middleware(mock_app):
    """Create a rate limiter middleware for testing."""
    return SimpleRateLimiter(mock_app, default_limit=10, window_seconds=60)


@pytest.fixture
def development_bypass_middleware(mock_app):
    """Create a development bypass middleware for testing."""
    return DevelopmentBypassMiddleware(mock_app, environment="development")


@pytest.fixture
def fenrir_request(mock_request):
    """Create a request with Fenrir user agent."""
    mock_request.headers = {"User-Agent": "Fenrir Exploit Suite"}
    return mock_request


@pytest.fixture
def localhost_request(mock_request):
    """Create a request from localhost."""
    mock_request.client.host = "127.0.0.1"
    return mock_request


@pytest.fixture
def external_request(mock_request):
    """Create a request from external IP."""
    mock_request.client.host = "192.168.1.100"
    mock_request.headers = {"User-Agent": "Mozilla/5.0"}
    return mock_request


@pytest.fixture
def preflight_request(mock_request):
    """Create a preflight request."""
    mock_request.method = "OPTIONS"
    mock_request.headers = {
        "Origin": "http://localhost:3000",
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "Content-Type"
    }
    return mock_request


@pytest.fixture
def actual_request(mock_request):
    """Create an actual request."""
    mock_request.method = "GET"
    mock_request.headers = {"Origin": "http://localhost:3000"}
    return mock_request


@pytest.fixture
def malicious_request(mock_request):
    """Create a request with malicious origin."""
    mock_request.method = "GET"
    mock_request.headers = {"Origin": "http://malicious.com"}
    return mock_request


@pytest.fixture
def test_endpoint():
    """Create a test endpoint function."""
    async def endpoint():
        return {"message": "test"}
    return endpoint


@pytest.fixture
def error_endpoint():
    """Create an error endpoint function."""
    async def endpoint():
        raise Exception("Test error")
    return endpoint


@pytest.fixture
def rate_limit_exceeded_request(mock_request):
    """Create a request that would exceed rate limits."""
    mock_request.client.host = "127.0.0.1"
    mock_request.headers = {"User-Agent": "test-agent"}
    return mock_request


@pytest.fixture
def bypass_request(mock_request):
    """Create a request that should be bypassed."""
    mock_request.client.host = "127.0.0.1"
    mock_request.headers = {"User-Agent": "Fenrir Exploit Suite"}
    mock_request.state = Mock()
    return mock_request


@pytest.fixture
def security_headers_response(mock_response):
    """Create a response with security headers."""
    mock_response.headers = {
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
        "X-XSS-Protection": "1; mode=block",
        "Referrer-Policy": "strict-origin-when-cross-origin"
    }
    return mock_response


@pytest.fixture
def cors_response(mock_response):
    """Create a response with CORS headers."""
    mock_response.headers = {
        "Access-Control-Allow-Origin": "http://localhost:3000",
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Allow-Methods": "GET, POST",
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
    }
    return mock_response


@pytest.fixture
def rate_limit_response(mock_response):
    """Create a rate limit exceeded response."""
    mock_response.status_code = 429
    mock_response.headers = {
        "Retry-After": "60",
        "X-RateLimit-Limit": "100",
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": "60"
    }
    mock_response.body = b'{"error": "Rate limit exceeded", "type": "rate_limit_error"}'
    return mock_response


@pytest.fixture
def development_environment():
    """Development environment configuration."""
    return {
        "environment": "development",
        "cors_origins": ["*"],
        "allow_credentials": False,
        "rate_limit": 1000,
        "rate_window": 60,
        "security_headers_enabled": True,
        "csp_enabled": True,
        "hsts_enabled": False
    }


@pytest.fixture
def production_environment():
    """Production environment configuration."""
    return {
        "environment": "production",
        "cors_origins": ["https://example.com"],
        "allow_credentials": True,
        "rate_limit": 100,
        "rate_window": 60,
        "security_headers_enabled": True,
        "csp_enabled": True,
        "hsts_enabled": True
    }


@pytest.fixture
def testing_environment():
    """Testing environment configuration."""
    return {
        "environment": "testing",
        "cors_origins": ["http://localhost:3000"],
        "allow_credentials": True,
        "rate_limit": 10000,
        "rate_window": 60,
        "security_headers_enabled": True,
        "csp_enabled": False,
        "hsts_enabled": False
    }


@pytest.fixture
def middleware_test_app():
    """Create a FastAPI app with all middleware for testing."""
    app = FastAPI()
    
    # Add all middleware
    app.add_middleware(DevelopmentBypassMiddleware, environment="development")
    app.add_middleware(SecurityHeadersMiddleware, environment="development")
    app.add_middleware(SimpleRateLimiter, default_limit=100, window_seconds=60)
    
    @app.get("/test")
    async def test_endpoint():
        return {"message": "test"}
    
    @app.get("/error")
    async def error_endpoint():
        raise Exception("Test error")
    
    @app.post("/test")
    async def test_post_endpoint():
        return {"message": "test post"}
    
    return app


@pytest.fixture
def middleware_test_client(middleware_test_app):
    """Create a test client for the middleware test app."""
    return TestClient(middleware_test_app)
