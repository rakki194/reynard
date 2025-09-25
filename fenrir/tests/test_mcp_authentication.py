"""🦊 Fenrir MCP Authentication Security Tests
============================================

Comprehensive security testing suite for MCP (Model Context Protocol) authentication
system, including MCP server security, FastAPI backend integration, and end-to-end
authentication flow validation.

This test suite ensures:
- MCP server is not publicly accessible without proper authentication
- JWT token validation and permission checking works correctly
- Rate limiting and abuse prevention mechanisms are effective
- End-to-end authentication flow between MCP and FastAPI backend is secure
- Token expiration and refresh mechanisms work properly
- Client type validation and permission-based access control functions correctly

Author: Odonata-Oracle-6 (Dragonfly Specialist)
Version: 1.0.0
"""

import asyncio
import json
import os
import time
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional
from unittest.mock import AsyncMock, MagicMock, patch

import jwt
import pytest
import requests
from fastapi import HTTPException, status
from fastapi.testclient import TestClient

# Import MCP authentication components
from backend.app.security.mcp_auth import (
    MCPAuthService,
    MCPClient,
    MCPTokenData,
    mcp_auth_service,
    mcp_security,
)
from backend.app.api.mcp.bootstrap_endpoints import bootstrap_mcp_authentication


class MCPAuthenticationTestSuite:
    """Comprehensive test suite for MCP authentication security."""

    def __init__(self):
        """Initialize the test suite with configuration."""
        self.mcp_server_url = os.getenv("MCP_SERVER_URL", "http://localhost:8001")
        self.fastapi_backend_url = os.getenv("FASTAPI_BACKEND_URL", "http://localhost:8000")
        self.test_client_id = "test-mcp-client"
        self.test_client_secret = "test-secret-key-2025"
        self.auth_service = MCPAuthService()

    async def setup_test_environment(self) -> None:
        """Set up test environment with test clients and tokens."""
        # Create test MCP client
        test_client = MCPClient(
            client_id=self.test_client_id,
            client_type="agent",
            permissions=["mcp:read", "mcp:write", "mcp:admin"],
            is_active=True,
            created_at=datetime.now(),
            name=f"test-client-{self.test_client_id}",  # Add required name field
        )
        self.auth_service.clients[self.test_client_id] = test_client

        # Generate test token
        self.test_token = self.auth_service.generate_mcp_token(
            self.test_client_id, ["mcp:read", "mcp:write"]
        )

    async def cleanup_test_environment(self) -> None:
        """Clean up test environment."""
        if self.test_client_id in self.auth_service.clients:
            del self.auth_service.clients[self.test_client_id]


class TestMCPServerSecurity:
    """Test MCP server security and public accessibility."""

    def __init__(self, test_suite: MCPAuthenticationTestSuite):
        """Initialize with test suite."""
        self.test_suite = test_suite

    async def test_mcp_server_not_publicly_accessible(self) -> bool:
        """Test that MCP server rejects requests without authentication."""
        try:
            # Test unauthenticated request to MCP server
            response = requests.get(
                f"{self.test_suite.mcp_server_url}/tools/list",
                timeout=5
            )

            # Should return 401 Unauthorized
            if response.status_code == 401:
                print("✅ MCP server correctly rejects unauthenticated requests")
                return True
            else:
                print(f"❌ MCP server allows unauthenticated access: {response.status_code}")
                return False

        except requests.exceptions.RequestException as e:
            print(f"⚠️  Could not connect to MCP server: {e}")
            return False

    async def test_mcp_server_invalid_token_rejection(self) -> bool:
        """Test that MCP server rejects requests with invalid tokens."""
        try:
            # Test with invalid token
            headers = {"Authorization": "Bearer invalid-token-12345"}
            response = requests.get(
                f"{self.test_suite.mcp_server_url}/tools/list",
                headers=headers,
                timeout=5
            )

            # Should return 401 Unauthorized
            if response.status_code == 401:
                print("✅ MCP server correctly rejects invalid tokens")
                return True
            else:
                print(f"❌ MCP server accepts invalid tokens: {response.status_code}")
                return False

        except requests.exceptions.RequestException as e:
            print(f"⚠️  Could not test invalid token rejection: {e}")
            return False

    async def test_mcp_server_expired_token_rejection(self) -> bool:
        """Test that MCP server rejects expired tokens."""
        try:
            # Create expired token
            expired_payload = {
                "client_id": self.test_suite.test_client_id,
                "client_type": "agent",
                "permissions": ["mcp:read"],
                "issued_at": time.time() - 86400,  # 24 hours ago
                "expires_at": time.time() - 3600,  # 1 hour ago
                "scope": "mcp"
            }

            expired_token = jwt.encode(
                expired_payload,
                "reynard-mcp-secret-key-2025",
                algorithm="HS256"
            )

            headers = {"Authorization": f"Bearer {expired_token}"}
            response = requests.get(
                f"{self.test_suite.mcp_server_url}/tools/list",
                headers=headers,
                timeout=5
            )

            # Should return 401 Unauthorized
            if response.status_code == 401:
                print("✅ MCP server correctly rejects expired tokens")
                return True
            else:
                print(f"❌ MCP server accepts expired tokens: {response.status_code}")
                return False

        except requests.exceptions.RequestException as e:
            print(f"⚠️  Could not test expired token rejection: {e}")
            return False

    async def test_mcp_server_permission_validation(self) -> bool:
        """Test that MCP server validates permissions correctly."""
        try:
            # Create token with limited permissions
            limited_payload = {
                "client_id": self.test_suite.test_client_id,
                "client_type": "agent",
                "permissions": ["mcp:read"],  # Only read permission
                "issued_at": time.time(),
                "expires_at": time.time() + 3600,
                "scope": "mcp"
            }

            limited_token = jwt.encode(
                limited_payload,
                "reynard-mcp-secret-key-2025",
                algorithm="HS256"
            )

            headers = {"Authorization": f"Bearer {limited_token}"}

            # Test read operation (should succeed)
            response = requests.get(
                f"{self.test_suite.mcp_server_url}/tools/list",
                headers=headers,
                timeout=5
            )

            if response.status_code == 200:
                print("✅ MCP server allows permitted read operations")

                # Test write operation (should fail)
                write_response = requests.post(
                    f"{self.test_suite.mcp_server_url}/tools/execute",
                    headers=headers,
                    json={"tool": "test_tool", "params": {}},
                    timeout=5
                )

                if write_response.status_code == 403:
                    print("✅ MCP server correctly blocks unauthorized write operations")
                    return True
                else:
                    print(f"❌ MCP server allows unauthorized write operations: {write_response.status_code}")
                    return False
            else:
                print(f"❌ MCP server blocks permitted read operations: {response.status_code}")
                return False

        except requests.exceptions.RequestException as e:
            print(f"⚠️  Could not test permission validation: {e}")
            return False


class TestFastAPIBackendIntegration:
    """Test FastAPI backend authentication integration."""

    def __init__(self, test_suite: MCPAuthenticationTestSuite):
        """Initialize with test suite."""
        self.test_suite = test_suite

    async def test_bootstrap_authentication_flow(self) -> bool:
        """Test the MCP bootstrap authentication flow."""
        try:
            # Test bootstrap request
            bootstrap_data = {
                "client_id": self.test_suite.test_client_id,
                "client_secret": self.test_suite.test_client_secret,
                "client_type": "agent",
                "permissions": ["mcp:read", "mcp:write"]
            }

            response = requests.post(
                f"{self.test_suite.fastapi_backend_url}/api/mcp/bootstrap",
                json=bootstrap_data,
                timeout=10
            )

            if response.status_code == 200:
                bootstrap_response = response.json()
                if "access_token" in bootstrap_response:
                    print("✅ FastAPI backend bootstrap authentication successful")

                    # Test using the returned token
                    token = bootstrap_response["access_token"]
                    headers = {"Authorization": f"Bearer {token}"}

                    # Test authenticated request
                    auth_response = requests.get(
                        f"{self.test_suite.fastapi_backend_url}/api/mcp/status",
                        headers=headers,
                        timeout=5
                    )

                    if auth_response.status_code == 200:
                        print("✅ FastAPI backend accepts bootstrap-generated tokens")
                        return True
                    else:
                        print(f"❌ FastAPI backend rejects bootstrap-generated tokens: {auth_response.status_code}")
                        return False
                else:
                    print("❌ FastAPI backend bootstrap response missing access_token")
                    return False
            else:
                print(f"❌ FastAPI backend bootstrap authentication failed: {response.status_code}")
                return False

        except requests.exceptions.RequestException as e:
            print(f"⚠️  Could not test bootstrap authentication: {e}")
            return False

    async def test_invalid_bootstrap_credentials(self) -> bool:
        """Test that FastAPI backend rejects invalid bootstrap credentials."""
        try:
            # Test with invalid credentials
            invalid_data = {
                "client_id": "invalid-client",
                "client_secret": "invalid-secret",
                "client_type": "agent",
                "permissions": ["mcp:read"]
            }

            response = requests.post(
                f"{self.test_suite.fastapi_backend_url}/api/mcp/bootstrap",
                json=invalid_data,
                timeout=5
            )

            # Should return 401 Unauthorized
            if response.status_code == 401:
                print("✅ FastAPI backend correctly rejects invalid bootstrap credentials")
                return True
            else:
                print(f"❌ FastAPI backend accepts invalid bootstrap credentials: {response.status_code}")
                return False

        except requests.exceptions.RequestException as e:
            print(f"⚠️  Could not test invalid bootstrap credentials: {e}")
            return False

    async def test_token_refresh_mechanism(self) -> bool:
        """Test token refresh mechanism."""
        try:
            # First, get a valid token
            bootstrap_data = {
                "client_id": self.test_suite.test_client_id,
                "client_secret": self.test_suite.test_client_secret,
                "client_type": "agent",
                "permissions": ["mcp:read"]
            }

            response = requests.post(
                f"{self.test_suite.fastapi_backend_url}/api/mcp/bootstrap",
                json=bootstrap_data,
                timeout=5
            )

            if response.status_code == 200:
                bootstrap_response = response.json()
                refresh_token = bootstrap_response.get("refresh_token")

                if refresh_token:
                    # Test refresh request
                    refresh_data = {"refresh_token": refresh_token}
                    refresh_response = requests.post(
                        f"{self.test_suite.fastapi_backend_url}/api/mcp/refresh",
                        json=refresh_data,
                        timeout=5
                    )

                    if refresh_response.status_code == 200:
                        print("✅ FastAPI backend token refresh mechanism works")
                        return True
                    else:
                        print(f"❌ FastAPI backend token refresh failed: {refresh_response.status_code}")
                        return False
                else:
                    print("❌ FastAPI backend bootstrap response missing refresh_token")
                    return False
            else:
                print(f"❌ Could not get initial token for refresh test: {response.status_code}")
                return False

        except requests.exceptions.RequestException as e:
            print(f"⚠️  Could not test token refresh: {e}")
            return False


class TestRateLimitingAndAbusePrevention:
    """Test rate limiting and abuse prevention mechanisms."""

    def __init__(self, test_suite: MCPAuthenticationTestSuite):
        """Initialize with test suite."""
        self.test_suite = test_suite

    async def test_authentication_rate_limiting(self) -> bool:
        """Test that authentication endpoints have rate limiting."""
        try:
            # Make multiple rapid authentication requests
            failed_attempts = 0
            for i in range(10):  # Try 10 rapid requests
                invalid_data = {
                    "client_id": f"test-client-{i}",
                    "client_secret": "invalid-secret",
                    "client_type": "agent",
                    "permissions": ["mcp:read"]
                }

                response = requests.post(
                    f"{self.test_suite.fastapi_backend_url}/api/mcp/bootstrap",
                    json=invalid_data,
                    timeout=2
                )

                if response.status_code == 429:  # Too Many Requests
                    failed_attempts += 1

                # Small delay to avoid overwhelming the server
                await asyncio.sleep(0.1)

            if failed_attempts > 0:
                print(f"✅ Rate limiting active: {failed_attempts}/10 requests blocked")
                return True
            else:
                print("⚠️  No rate limiting detected on authentication endpoints")
                return False

        except requests.exceptions.RequestException as e:
            print(f"⚠️  Could not test rate limiting: {e}")
            return False

    async def test_brute_force_protection(self) -> bool:
        """Test brute force protection mechanisms."""
        try:
            # Try multiple authentication attempts with same credentials
            blocked_attempts = 0
            for i in range(5):
                invalid_data = {
                    "client_id": self.test_suite.test_client_id,
                    "client_secret": "wrong-password",
                    "client_type": "agent",
                    "permissions": ["mcp:read"]
                }

                response = requests.post(
                    f"{self.test_suite.fastapi_backend_url}/api/mcp/bootstrap",
                    json=invalid_data,
                    timeout=5
                )

                if response.status_code in [429, 423]:  # Rate limited or locked
                    blocked_attempts += 1

                await asyncio.sleep(0.5)

            if blocked_attempts > 0:
                print(f"✅ Brute force protection active: {blocked_attempts}/5 attempts blocked")
                return True
            else:
                print("⚠️  No brute force protection detected")
                return False

        except requests.exceptions.RequestException as e:
            print(f"⚠️  Could not test brute force protection: {e}")
            return False


class TestEndToEndAuthenticationFlow:
    """Test complete end-to-end authentication flow."""

    def __init__(self, test_suite: MCPAuthenticationTestSuite):
        """Initialize with test suite."""
        self.test_suite = test_suite

    async def test_complete_mcp_to_backend_flow(self) -> bool:
        """Test complete authentication flow from MCP to FastAPI backend."""
        try:
            # Step 1: Bootstrap authentication with FastAPI backend
            bootstrap_data = {
                "client_id": self.test_suite.test_client_id,
                "client_secret": self.test_suite.test_client_secret,
                "client_type": "agent",
                "permissions": ["mcp:read", "mcp:write", "mcp:admin"]
            }

            bootstrap_response = requests.post(
                f"{self.test_suite.fastapi_backend_url}/api/mcp/bootstrap",
                json=bootstrap_data,
                timeout=10
            )

            if bootstrap_response.status_code != 200:
                print(f"❌ Bootstrap authentication failed: {bootstrap_response.status_code}")
                return False

            bootstrap_result = bootstrap_response.json()
            access_token = bootstrap_result["access_token"]

            print("✅ Step 1: Bootstrap authentication successful")

            # Step 2: Use token to access MCP server
            mcp_headers = {"Authorization": f"Bearer {access_token}"}
            mcp_response = requests.get(
                f"{self.test_suite.mcp_server_url}/tools/list",
                headers=mcp_headers,
                timeout=5
            )

            if mcp_response.status_code != 200:
                print(f"❌ MCP server access failed: {mcp_response.status_code}")
                return False

            print("✅ Step 2: MCP server access successful")

            # Step 3: Use token to access FastAPI backend endpoints
            backend_headers = {"Authorization": f"Bearer {access_token}"}
            backend_response = requests.get(
                f"{self.test_suite.fastapi_backend_url}/api/mcp/status",
                headers=backend_headers,
                timeout=5
            )

            if backend_response.status_code != 200:
                print(f"❌ FastAPI backend access failed: {backend_response.status_code}")
                return False

            print("✅ Step 3: FastAPI backend access successful")

            # Step 4: Test token expiration handling
            # Create a token that expires in 1 second
            expiring_payload = {
                "client_id": self.test_suite.test_client_id,
                "client_type": "agent",
                "permissions": ["mcp:read"],
                "issued_at": time.time(),
                "expires_at": time.time() + 1,  # Expires in 1 second
                "scope": "mcp"
            }

            expiring_token = jwt.encode(
                expiring_payload,
                "reynard-mcp-secret-key-2025",
                algorithm="HS256"
            )

            # Wait for token to expire
            await asyncio.sleep(2)

            # Try to use expired token
            expired_headers = {"Authorization": f"Bearer {expiring_token}"}
            expired_response = requests.get(
                f"{self.test_suite.mcp_server_url}/tools/list",
                headers=expired_headers,
                timeout=5
            )

            if expired_response.status_code == 401:
                print("✅ Step 4: Token expiration handling works correctly")
                return True
            else:
                print(f"❌ Expired token still works: {expired_response.status_code}")
                return False

        except requests.exceptions.RequestException as e:
            print(f"⚠️  Could not test complete authentication flow: {e}")
            return False

    async def test_cross_service_token_validation(self) -> bool:
        """Test that tokens work across MCP server and FastAPI backend."""
        try:
            # Get token from FastAPI backend
            bootstrap_data = {
                "client_id": self.test_suite.test_client_id,
                "client_secret": self.test_suite.test_client_secret,
                "client_type": "agent",
                "permissions": ["mcp:read", "mcp:write"]
            }

            response = requests.post(
                f"{self.test_suite.fastapi_backend_url}/api/mcp/bootstrap",
                json=bootstrap_data,
                timeout=5
            )

            if response.status_code != 200:
                print(f"❌ Could not get token for cross-service test: {response.status_code}")
                return False

            token = response.json()["access_token"]
            headers = {"Authorization": f"Bearer {token}"}

            # Test token on both services
            mcp_result = requests.get(
                f"{self.test_suite.mcp_server_url}/tools/list",
                headers=headers,
                timeout=5
            )

            backend_result = requests.get(
                f"{self.test_suite.fastapi_backend_url}/api/mcp/status",
                headers=headers,
                timeout=5
            )

            if mcp_result.status_code == 200 and backend_result.status_code == 200:
                print("✅ Cross-service token validation successful")
                return True
            else:
                print(f"❌ Cross-service token validation failed: MCP={mcp_result.status_code}, Backend={backend_result.status_code}")
                return False

        except requests.exceptions.RequestException as e:
            print(f"⚠️  Could not test cross-service token validation: {e}")
            return False


async def run_fenrir_authentication_tests() -> Dict[str, Any]:
    """Run comprehensive Fenrir authentication security tests."""
    print("🦊 Starting Fenrir MCP Authentication Security Tests")
    print("=" * 60)

    # Initialize test suite
    test_suite = MCPAuthenticationTestSuite()
    await test_suite.setup_test_environment()

    # Initialize test classes
    mcp_security_tests = TestMCPServerSecurity(test_suite)
    backend_integration_tests = TestFastAPIBackendIntegration(test_suite)
    rate_limiting_tests = TestRateLimitingAndAbusePrevention(test_suite)
    e2e_tests = TestEndToEndAuthenticationFlow(test_suite)

    # Run all test suites
    results = {
        "timestamp": datetime.now().isoformat(),
        "test_suite": "Fenrir MCP Authentication Security",
        "tests": {}
    }

    # MCP Server Security Tests
    print("\n🔒 Testing MCP Server Security...")
    results["tests"]["mcp_server_security"] = {
        "public_accessibility": await mcp_security_tests.test_mcp_server_not_publicly_accessible(),
        "invalid_token_rejection": await mcp_security_tests.test_mcp_server_invalid_token_rejection(),
        "expired_token_rejection": await mcp_security_tests.test_mcp_server_expired_token_rejection(),
        "permission_validation": await mcp_security_tests.test_mcp_server_permission_validation(),
    }

    # FastAPI Backend Integration Tests
    print("\n🔗 Testing FastAPI Backend Integration...")
    results["tests"]["backend_integration"] = {
        "bootstrap_authentication": await backend_integration_tests.test_bootstrap_authentication_flow(),
        "invalid_credentials": await backend_integration_tests.test_invalid_bootstrap_credentials(),
        "token_refresh": await backend_integration_tests.test_token_refresh_mechanism(),
    }

    # Rate Limiting and Abuse Prevention Tests
    print("\n🛡️  Testing Rate Limiting and Abuse Prevention...")
    results["tests"]["rate_limiting"] = {
        "authentication_rate_limiting": await rate_limiting_tests.test_authentication_rate_limiting(),
        "brute_force_protection": await rate_limiting_tests.test_brute_force_protection(),
    }

    # End-to-End Authentication Flow Tests
    print("\n🔄 Testing End-to-End Authentication Flow...")
    results["tests"]["e2e_flow"] = {
        "complete_flow": await e2e_tests.test_complete_mcp_to_backend_flow(),
        "cross_service_validation": await e2e_tests.test_cross_service_token_validation(),
    }

    # Calculate overall results
    all_tests = []
    for category, tests in results["tests"].items():
        all_tests.extend(tests.values())

    passed_tests = sum(1 for test in all_tests if test)
    total_tests = len(all_tests)

    results["summary"] = {
        "total_tests": total_tests,
        "passed_tests": passed_tests,
        "failed_tests": total_tests - passed_tests,
        "success_rate": (passed_tests / total_tests) * 100 if total_tests > 0 else 0,
        "overall_status": "PASS" if passed_tests == total_tests else "FAIL"
    }

    # Cleanup
    await test_suite.cleanup_test_environment()

    # Print summary
    print("\n" + "=" * 60)
    print("🦊 Fenrir MCP Authentication Security Test Results")
    print("=" * 60)
    print(f"Total Tests: {total_tests}")
    print(f"Passed: {passed_tests}")
    print(f"Failed: {total_tests - passed_tests}")
    print(f"Success Rate: {results['summary']['success_rate']:.1f}%")
    print(f"Overall Status: {results['summary']['overall_status']}")

    if results['summary']['overall_status'] == "PASS":
        print("🎉 All authentication security tests passed!")
    else:
        print("⚠️  Some authentication security tests failed. Review the results above.")

    return results


if __name__ == "__main__":
    """Run the Fenrir authentication tests."""
    asyncio.run(run_fenrir_authentication_tests())
