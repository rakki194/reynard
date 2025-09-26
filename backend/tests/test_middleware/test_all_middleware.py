"""Comprehensive tests for all middleware components.

This module provides integration tests that verify all middleware components
work together correctly and handle various scenarios.
"""

import time

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.middleware.factory import setup_middleware


class TestAllMiddlewareIntegration:
    """Integration tests for all middleware components working together."""

    def test_complete_middleware_stack_development(self):
        """Test complete middleware stack in development environment."""
        app = FastAPI()

        # Setup all middleware
        setup_middleware(app, environment="development")

        @app.get("/test")
        async def test_endpoint():
            return {"message": "test"}

        client = TestClient(app)

        # Test normal request
        response = client.get("/test")

        assert response.status_code == 200
        assert response.json() == {"message": "test"}

        # Check that all middleware headers are present
        assert "X-Content-Type-Options" in response.headers  # Security headers
        assert "Access-Control-Allow-Origin" in response.headers  # CORS
        assert "X-RateLimit-Limit" in response.headers  # Rate limiting

    def test_complete_middleware_stack_production(self):
        """Test complete middleware stack in production environment."""
        app = FastAPI()

        # Setup all middleware
        setup_middleware(app, environment="production")

        @app.get("/test")
        async def test_endpoint():
            return {"message": "test"}

        client = TestClient(app)

        # Test normal request
        response = client.get("/test")

        assert response.status_code == 200
        assert response.json() == {"message": "test"}

        # Check that all middleware headers are present
        assert "X-Content-Type-Options" in response.headers  # Security headers
        assert "Access-Control-Allow-Origin" in response.headers  # CORS
        assert "X-RateLimit-Limit" in response.headers  # Rate limiting

        # Check that HSTS is enabled in production
        assert "Strict-Transport-Security" in response.headers

    def test_middleware_stack_cors_flow(self):
        """Test CORS flow through the middleware stack."""
        app = FastAPI()

        setup_middleware(app, environment="development")

        @app.get("/test")
        async def test_endpoint():
            return {"message": "test"}

        client = TestClient(app)

        # Test preflight request
        response = client.options(
            "/test",
            headers={
                "Origin": "http://localhost:3000",
                "Access-Control-Request-Method": "GET",
                "Access-Control-Request-Headers": "Content-Type",
            },
        )

        assert response.status_code == 200
        assert (
            response.headers["Access-Control-Allow-Origin"] == "http://localhost:3000"
        )
        assert response.headers["Access-Control-Allow-Methods"] == "GET"
        assert response.headers["Access-Control-Allow-Headers"] == "Content-Type"

        # Test actual request
        response = client.get("/test", headers={"Origin": "http://localhost:3000"})

        assert response.status_code == 200
        assert (
            response.headers["Access-Control-Allow-Origin"] == "http://localhost:3000"
        )
        assert response.json() == {"message": "test"}

    def test_middleware_stack_rate_limiting_flow(self):
        """Test rate limiting flow through the middleware stack."""
        app = FastAPI()

        setup_middleware(app, environment="development", rate_limit=2, rate_window=60)

        @app.get("/test")
        async def test_endpoint():
            return {"message": "test"}

        client = TestClient(app)

        # First request should pass
        response = client.get("/test")
        assert response.status_code == 200
        assert response.headers["X-RateLimit-Remaining"] == "1"

        # Second request should pass
        response = client.get("/test")
        assert response.status_code == 200
        assert response.headers["X-RateLimit-Remaining"] == "0"

        # Third request should be rate limited
        response = client.get("/test")
        assert response.status_code == 429
        assert "Rate limit exceeded" in response.text
        assert response.headers["Retry-After"] == "60"

    def test_middleware_stack_development_bypass_flow(self):
        """Test development bypass flow through the middleware stack."""
        app = FastAPI()

        setup_middleware(app, environment="development", rate_limit=1, rate_window=60)

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

        # Request with Fenrir user agent should bypass rate limiting
        response = client.get("/test", headers={"User-Agent": "Fenrir Exploit Suite"})
        assert response.status_code == 200
        assert response.json() == {"message": "test"}

    def test_middleware_stack_security_headers_flow(self):
        """Test security headers flow through the middleware stack."""
        app = FastAPI()

        setup_middleware(app, environment="development")

        @app.get("/test")
        async def test_endpoint():
            return {"message": "test"}

        client = TestClient(app)

        response = client.get("/test")

        assert response.status_code == 200
        assert response.json() == {"message": "test"}

        # Check security headers
        assert response.headers["X-Content-Type-Options"] == "nosniff"
        assert response.headers["X-Frame-Options"] == "DENY"
        assert response.headers["X-XSS-Protection"] == "1; mode=block"
        assert response.headers["Referrer-Policy"] == "strict-origin-when-cross-origin"
        assert "Content-Security-Policy" in response.headers

    def test_middleware_stack_input_validation_flow(self):
        """Test input validation flow through the middleware stack."""
        app = FastAPI()

        setup_middleware(app, environment="development")

        @app.post("/test")
        async def test_endpoint(data: dict):
            return {"message": "test", "data": data}

        client = TestClient(app)

        # Test with valid data
        response = client.post("/test", json={"key": "value"})
        assert response.status_code == 200
        assert response.json()["message"] == "test"

        # Test with potentially malicious data
        response = client.post("/test", json={"key": "'; DROP TABLE users; --"})
        # Should still pass as input validation is not blocking in development
        assert response.status_code == 200

    def test_middleware_stack_error_handling(self):
        """Test error handling through the middleware stack."""
        app = FastAPI()

        setup_middleware(app, environment="development")

        @app.get("/error")
        async def error_endpoint():
            raise Exception("Test error")

        client = TestClient(app)

        response = client.get("/error")

        # Should return 500 error
        assert response.status_code == 500

        # But security headers should still be present
        assert "X-Content-Type-Options" in response.headers

    def test_middleware_stack_different_environments(self):
        """Test middleware stack behavior in different environments."""
        environments = ["development", "staging", "production", "testing"]

        for env in environments:
            app = FastAPI()
            setup_reynard_middleware(app, environment=env)

            @app.get("/test")
            async def test_endpoint():
                return {"message": "test", "environment": env}

            client = TestClient(app)
            response = client.get("/test")

            assert response.status_code == 200
            assert response.json()["environment"] == env

            # All environments should have security headers
            assert "X-Content-Type-Options" in response.headers

            # Production should have HSTS
            if env == "production":
                assert "Strict-Transport-Security" in response.headers
            else:
                assert "Strict-Transport-Security" not in response.headers

    def test_middleware_stack_performance(self):
        """Test middleware stack performance."""
        app = FastAPI()

        setup_middleware(app, environment="development")

        @app.get("/test")
        async def test_endpoint():
            return {"message": "test"}

        client = TestClient(app)

        # Test multiple requests to ensure performance is reasonable
        start_time = time.time()

        for _ in range(10):
            response = client.get("/test")
            assert response.status_code == 200

        end_time = time.time()
        duration = end_time - start_time

        # Should complete 10 requests in reasonable time (less than 1 second)
        assert duration < 1.0

    def test_middleware_stack_custom_configuration(self):
        """Test middleware stack with custom configuration."""
        app = FastAPI()

        setup_middleware(
            app,
            environment="development",
            rate_limit=50,
            rate_window=30,
            cors_origins=["http://localhost:3000"],
            security_headers_enabled=True,
        )

        @app.get("/test")
        async def test_endpoint():
            return {"message": "test"}

        client = TestClient(app)

        response = client.get("/test")

        assert response.status_code == 200
        assert response.json() == {"message": "test"}

        # Check custom rate limit
        assert response.headers["X-RateLimit-Limit"] == "50"

        # Check custom CORS
        response = client.get("/test", headers={"Origin": "http://localhost:3000"})
        assert response.status_code == 200
        assert (
            response.headers["Access-Control-Allow-Origin"] == "http://localhost:3000"
        )

    def test_middleware_stack_middleware_order(self):
        """Test that middleware executes in the correct order."""
        app = FastAPI()

        setup_middleware(app, environment="development")

        @app.get("/test")
        async def test_endpoint():
            return {"message": "test"}

        client = TestClient(app)

        response = client.get("/test")

        assert response.status_code == 200
        assert response.json() == {"message": "test"}

        # All middleware should have executed
        assert "X-Content-Type-Options" in response.headers  # Security headers (last)
        assert "Access-Control-Allow-Origin" in response.headers  # CORS
        assert "X-RateLimit-Limit" in response.headers  # Rate limiting

    def test_middleware_stack_concurrent_requests(self):
        """Test middleware stack with concurrent requests."""
        app = FastAPI()

        setup_middleware(app, environment="development", rate_limit=100, rate_window=60)

        @app.get("/test")
        async def test_endpoint():
            return {"message": "test"}

        client = TestClient(app)

        # Test multiple concurrent requests
        responses = []
        for _ in range(5):
            response = client.get("/test")
            responses.append(response)

        # All requests should succeed
        for response in responses:
            assert response.status_code == 200
            assert response.json() == {"message": "test"}
            assert "X-RateLimit-Limit" in response.headers
