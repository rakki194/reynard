"""🦊 Simple MCP Authentication Tests
==================================

Simplified pytest-compatible tests for MCP authentication system.

Author: Odonata-Oracle-6 (Dragonfly Specialist)
Version: 1.0.0
"""

import pytest
import requests
from datetime import datetime
from backend.app.security.mcp_auth import MCPAuthService, MCPClient


class TestMCPAuthentication:
    """Test MCP authentication functionality."""

    @pytest.fixture(autouse=True)
    def setup(self):
        """Set up test fixtures."""
        self.auth_service = MCPAuthService()
        self.test_client_id = "test-mcp-client"
        self.test_client_secret = "test-secret-key-2025"

        # Create test client
        test_client = MCPClient(
            client_id=self.test_client_id,
            client_type="agent",
            permissions=["mcp:read", "mcp:write", "mcp:admin"],
            is_active=True,
            created_at=datetime.now(),
            name=f"test-client-{self.test_client_id}",
        )
        self.auth_service.clients[self.test_client_id] = test_client

    def test_token_generation(self):
        """Test JWT token generation."""
        token = self.auth_service.generate_mcp_token(
            self.test_client_id, ["mcp:read", "mcp:write"]
        )

        assert token is not None
        assert isinstance(token, str)
        assert len(token) > 0

    def test_token_validation(self):
        """Test JWT token validation."""
        # Generate a valid token
        token = self.auth_service.generate_mcp_token(
            self.test_client_id, ["mcp:read", "mcp:write"]
        )

        # Validate the token
        token_data = self.auth_service.validate_mcp_token(token)

        assert token_data.client_id == self.test_client_id
        assert token_data.client_type == "agent"
        assert "mcp:read" in token_data.permissions
        assert "mcp:write" in token_data.permissions

    def test_invalid_token_rejection(self):
        """Test that invalid tokens are rejected."""
        with pytest.raises(Exception):  # Should raise HTTPException
            self.auth_service.validate_mcp_token("invalid-token")

    def test_expired_token_rejection(self):
        """Test that expired tokens are rejected."""
        # Generate an expired token
        expired_token = self.auth_service.generate_mcp_token(
            self.test_client_id, ["mcp:read"], expires_in_seconds=-3600
        )

        with pytest.raises(Exception):  # Should raise HTTPException
            self.auth_service.validate_mcp_token(expired_token)

    def test_permission_checking(self):
        """Test permission checking functionality."""
        # Test with valid permissions
        has_permission = self.auth_service.check_permission(
            self.test_client_id, "mcp:read"
        )
        assert has_permission is True

        # Test with invalid permissions
        has_permission = self.auth_service.check_permission(
            self.test_client_id, "mcp:admin"
        )
        assert has_permission is False

    def test_client_retrieval(self):
        """Test client retrieval functionality."""
        client = self.auth_service.get_mcp_client(self.test_client_id)

        assert client is not None
        assert client.client_id == self.test_client_id
        assert client.client_type == "agent"
        assert client.is_active is True

    def test_nonexistent_client(self):
        """Test handling of nonexistent clients."""
        client = self.auth_service.get_mcp_client("nonexistent-client")
        assert client is None


class TestBackendConnectivity:
    """Test backend connectivity and endpoints."""

    def test_backend_root_endpoint(self):
        """Test backend root endpoint."""
        response = requests.get("http://localhost:8000/", timeout=5)
        assert response.status_code == 200

        data = response.json()
        assert "message" in data
        assert "🦊 Reynard API is running" in data["message"]

    def test_mcp_bootstrap_health(self):
        """Test MCP bootstrap health endpoint."""
        response = requests.get("http://localhost:8000/api/mcp/bootstrap/health", timeout=5)
        assert response.status_code == 200

        data = response.json()
        assert data["status"] == "healthy"
        assert "clients_available" in data

    def test_mcp_bootstrap_authentication_invalid(self):
        """Test MCP bootstrap authentication with invalid credentials."""
        invalid_data = {
            "client_id": "invalid-client",
            "client_secret": "invalid-secret",
            "client_type": "agent",
            "permissions": ["mcp:read"]
        }

        response = requests.post(
            "http://localhost:8000/api/mcp/bootstrap/authenticate",
            json=invalid_data,
            timeout=5
        )

        assert response.status_code == 401

    def test_mcp_bootstrap_authentication_malformed(self):
        """Test MCP bootstrap authentication with malformed data."""
        malformed_data = {
            "client_id": "test-client"
            # Missing required fields
        }

        response = requests.post(
            "http://localhost:8000/api/mcp/bootstrap/authenticate",
            json=malformed_data,
            timeout=5
        )

        assert response.status_code in [400, 422]  # Bad Request or Validation Error

    def test_mcp_tools_health(self):
        """Test MCP tools health endpoint."""
        response = requests.get("http://localhost:8000/api/mcp/tools/health", timeout=5)
        # This might return 200 or 503 depending on MCP server status
        assert response.status_code in [200, 503]

    def test_security_headers(self):
        """Test that security headers are present."""
        response = requests.get("http://localhost:8000/", timeout=5)
        headers = response.headers

        # Check for common security headers
        security_headers = [
            'x-content-type-options',
            'x-frame-options',
            'x-xss-protection'
        ]

        for header in security_headers:
            assert header in headers, f"Missing security header: {header}"


class TestRateLimiting:
    """Test rate limiting functionality."""

    def test_rapid_requests(self):
        """Test that rapid requests are handled properly."""
        # Make multiple rapid requests to test rate limiting
        responses = []
        for i in range(5):
            response = requests.post(
                "http://localhost:8000/api/mcp/bootstrap/authenticate",
                json={
                    "client_id": f"test-client-{i}",
                    "client_secret": "invalid-secret",
                    "client_type": "agent",
                    "permissions": ["mcp:read"]
                },
                timeout=5
            )
            responses.append(response)

        # All should return 401 (invalid credentials) or 429 (rate limited)
        for response in responses:
            assert response.status_code in [401, 429]


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
