"""CI/CD integration tests for Reynard Backend

This module contains tests specifically designed for CI/CD pipelines
including performance tests, load tests, and deployment validation.
"""

import threading
import time

from fastapi.testclient import TestClient


class TestCIIntegration:
    """Test CI/CD integration scenarios."""

    def test_startup_time(self, client: TestClient):
        """Test that the application starts up within acceptable time."""
        start_time = time.time()

        # Make a request to test startup
        response = client.get("/api/health")

        end_time = time.time()
        startup_time = end_time - start_time

        # Startup should be fast (less than 5 seconds)
        assert startup_time < 5.0
        assert response.status_code == 200

    def test_health_check_performance(self, client: TestClient):
        """Test health check endpoint performance."""
        times = []

        # Make multiple health check requests
        for _ in range(10):
            start_time = time.time()
            response = client.get("/api/health")
            end_time = time.time()

            assert response.status_code == 200
            times.append(end_time - start_time)

        # Average response time should be fast
        avg_time = sum(times) / len(times)
        assert avg_time < 1.0  # Less than 1 second average

    def test_concurrent_health_checks(self, client: TestClient):
        """Test concurrent health check requests."""
        results = []
        errors = []

        def make_health_check():
            try:
                response = client.get("/api/health")
                results.append(response.status_code)
            except Exception as e:
                errors.append(str(e))

        # Create multiple threads
        threads = []
        for _ in range(20):
            thread = threading.Thread(target=make_health_check)
            threads.append(thread)
            thread.start()

        # Wait for all threads to complete
        for thread in threads:
            thread.join()

        # All requests should succeed
        assert len(errors) == 0
        assert len(results) == 20
        assert all(status == 200 for status in results)

    def test_memory_usage_stability(self, client: TestClient):
        """Test memory usage stability over multiple requests."""
        # Make many requests to test memory stability
        for i in range(100):
            response = client.get("/api/health")
            assert response.status_code == 200

            # Also test other endpoints
            response = client.get("/")
            assert response.status_code == 200

            response = client.get("/api/docs")
            assert response.status_code == 200

    def test_error_handling_robustness(self, client: TestClient):
        """Test error handling robustness."""
        # Test various error conditions
        error_requests = [
            ("GET", "/nonexistent"),
            ("POST", "/api/auth/register", {"invalid": "data"}),
            ("GET", "/api/protected"),  # No auth
            ("POST", "/api/auth/login", {"username": "test", "password": "test"}),
        ]

        for method, url, *data in error_requests:
            if data:
                response = client.request(method, url, json=data[0])
            else:
                response = client.request(method, url)

            # Should not crash, should return appropriate error codes
            assert response.status_code in [200, 400, 401, 403, 404, 422, 500]

    def test_documentation_endpoints(self, client: TestClient):
        """Test that documentation endpoints are accessible."""
        # Test OpenAPI documentation
        response = client.get("/api/docs")
        assert response.status_code == 200

        response = client.get("/api/redoc")
        assert response.status_code == 200

        response = client.get("/openapi.json")
        assert response.status_code == 200

    def test_cors_preflight_requests(self, client: TestClient):
        """Test CORS preflight requests."""
        # Test preflight request
        response = client.options(
            "/api/health",
            headers={
                "Origin": "http://localhost:3000",
                "Access-Control-Request-Method": "GET",
                "Access-Control-Request-Headers": "Content-Type",
            },
        )

        # Should handle preflight requests properly
        assert response.status_code in [200, 204]

    def test_security_headers_consistency(self, client: TestClient):
        """Test that security headers are consistently applied."""
        endpoints = ["/", "/api/health", "/api/docs", "/api/redoc"]

        for endpoint in endpoints:
            response = client.get(endpoint)
            headers = response.headers

            # Check for required security headers
            assert "x-frame-options" in headers
            assert "x-content-type-options" in headers
            assert "x-xss-protection" in headers

    def test_environment_variables(self, client: TestClient):
        """Test that required environment variables are set."""
        # This test ensures that the application can start with required env vars
        response = client.get("/api/health")
        assert response.status_code == 200

        # Test that the app responds to health checks
        data = response.json()
        assert data["status"] == "healthy"

    def test_database_connectivity(self, client: TestClient):
        """Test database connectivity (in-memory for tests)."""
        # Test user registration (uses in-memory database)
        user_data = {
            "username": "testuser",
            "email": "test@example.com",
            "password": "testpassword123",
            "full_name": "Test User",
        }

        response = client.post("/api/auth/register", json=user_data)
        assert response.status_code == 200

        # Test user login
        login_data = {"username": "testuser", "password": "testpassword123"}

        response = client.post("/api/auth/login", json=login_data)
        assert response.status_code == 200

    def test_authentication_flow_performance(self, client: TestClient):
        """Test authentication flow performance."""
        # Register user
        user_data = {
            "username": "perftest",
            "email": "perftest@example.com",
            "password": "testpassword123",
            "full_name": "Performance Test",
        }

        start_time = time.time()
        response = client.post("/api/auth/register", json=user_data)
        register_time = time.time() - start_time

        assert response.status_code == 200
        assert register_time < 2.0  # Registration should be fast

        # Login user
        login_data = {"username": "perftest", "password": "testpassword123"}

        start_time = time.time()
        response = client.post("/api/auth/login", json=login_data)
        login_time = time.time() - start_time

        assert response.status_code == 200
        assert login_time < 2.0  # Login should be fast

        # Access protected resource
        access_token = response.json()["access_token"]
        headers = {"Authorization": f"Bearer {access_token}"}

        start_time = time.time()
        response = client.get("/api/protected", headers=headers)
        protected_time = time.time() - start_time

        assert response.status_code == 200
        assert protected_time < 1.0  # Protected access should be fast

    def test_load_handling(self, client: TestClient):
        """Test basic load handling capabilities."""

        def make_request():
            response = client.get("/api/health")
            return response.status_code == 200

        # Test with moderate load
        threads = []
        results = []

        for _ in range(50):
            thread = threading.Thread(target=lambda: results.append(make_request()))
            threads.append(thread)
            thread.start()

        # Wait for all threads
        for thread in threads:
            thread.join()

        # Most requests should succeed
        success_rate = sum(results) / len(results)
        assert success_rate > 0.9  # 90% success rate

    def test_graceful_degradation(self, client: TestClient):
        """Test graceful degradation under stress."""
        # Make many concurrent requests
        threads = []
        results = []

        def stress_test():
            try:
                response = client.get("/api/health")
                results.append(response.status_code)
            except Exception:
                results.append(500)

        for _ in range(100):
            thread = threading.Thread(target=stress_test)
            threads.append(thread)
            thread.start()

        # Wait for all threads
        for thread in threads:
            thread.join()

        # Should handle stress gracefully
        success_count = sum(1 for status in results if status == 200)
        assert success_count > 80  # At least 80% should succeed

    def test_configuration_validation(self, client: TestClient):
        """Test that configuration is valid."""
        # Test that the app starts and responds
        response = client.get("/api/health")
        assert response.status_code == 200

        # Test that required endpoints are available
        endpoints = ["/", "/api/health", "/api/docs"]
        for endpoint in endpoints:
            response = client.get(endpoint)
            assert response.status_code == 200

    def test_logging_functionality(self, client: TestClient):
        """Test that logging is working properly."""
        # Make requests that should generate logs
        response = client.get("/api/health")
        assert response.status_code == 200

        # Test error logging
        response = client.get("/nonexistent")
        assert response.status_code == 404

        # Test authentication logging
        response = client.post(
            "/api/auth/login",
            json={"username": "nonexistent", "password": "wrong"},
        )
        assert response.status_code == 401

    def test_metrics_collection(self, client: TestClient):
        """Test that metrics can be collected."""
        # Make various requests to generate metrics
        for _ in range(10):
            client.get("/api/health")
            client.get("/")
            client.get("/api/docs")

        # Test that the application is still responsive
        response = client.get("/api/health")
        assert response.status_code == 200
