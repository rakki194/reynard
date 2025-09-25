#!/usr/bin/env python3
"""🦊 Backend Authentication Test
==============================

Quick test script to verify FastAPI backend MCP authentication endpoints.
This script tests the authentication system without requiring the MCP server.

Usage:
    python test_backend_auth.py

Author: Odonata-Oracle-6 (Dragonfly Specialist)
Version: 1.0.0
"""

import json
import requests
import sys
from typing import Dict, Any


class BackendAuthTester:
    """Test FastAPI backend MCP authentication endpoints."""

    def __init__(self):
        """Initialize the tester."""
        self.backend_url = "http://localhost:8000"
        self.test_results = []

    def log(self, message: str, status: str = "INFO") -> None:
        """Log a message with status."""
        status_icons = {
            "INFO": "ℹ️",
            "OK": "✅",
            "FAIL": "❌",
            "WARN": "⚠️"
        }
        icon = status_icons.get(status, "ℹ️")
        print(f"{icon} {message}")

    def test_backend_connectivity(self) -> bool:
        """Test if the backend is accessible."""
        try:
            response = requests.get(f"{self.backend_url}/", timeout=5)
            if response.status_code == 200:
                data = response.json()
                self.log(f"Backend is running: {data.get('message', 'Unknown')}", "OK")
                return True
            else:
                self.log(f"Backend responded with status {response.status_code}", "FAIL")
                return False
        except Exception as e:
            self.log(f"Backend is not accessible: {e}", "FAIL")
            return False

    def test_mcp_bootstrap_health(self) -> bool:
        """Test MCP bootstrap health endpoint."""
        try:
            response = requests.get(f"{self.backend_url}/api/mcp/bootstrap/health", timeout=5)
            if response.status_code == 200:
                data = response.json()
                self.log(f"MCP bootstrap health: {data.get('status', 'Unknown')}", "OK")
                self.log(f"Available clients: {data.get('clients_available', 0)}", "INFO")
                return True
            else:
                self.log(f"MCP bootstrap health failed: {response.status_code}", "FAIL")
                return False
        except Exception as e:
            self.log(f"MCP bootstrap health error: {e}", "FAIL")
            return False

    def test_mcp_bootstrap_authentication_invalid(self) -> bool:
        """Test MCP bootstrap authentication with invalid credentials."""
        try:
            invalid_data = {
                "client_id": "invalid-client",
                "client_secret": "invalid-secret",
                "client_type": "agent",
                "permissions": ["mcp:read"]
            }

            response = requests.post(
                f"{self.backend_url}/api/mcp/bootstrap/authenticate",
                json=invalid_data,
                timeout=5
            )

            if response.status_code == 401:
                self.log("MCP bootstrap correctly rejects invalid credentials", "OK")
                return True
            else:
                self.log(f"MCP bootstrap accepts invalid credentials: {response.status_code}", "FAIL")
                return False
        except Exception as e:
            self.log(f"MCP bootstrap authentication error: {e}", "FAIL")
            return False

    def test_mcp_bootstrap_authentication_malformed(self) -> bool:
        """Test MCP bootstrap authentication with malformed data."""
        try:
            # Test with missing required fields
            malformed_data = {
                "client_id": "test-client"
                # Missing client_secret, client_type, permissions
            }

            response = requests.post(
                f"{self.backend_url}/api/mcp/bootstrap/authenticate",
                json=malformed_data,
                timeout=5
            )

            if response.status_code in [400, 422]:  # Bad Request or Validation Error
                self.log("MCP bootstrap correctly rejects malformed data", "OK")
                return True
            else:
                self.log(f"MCP bootstrap accepts malformed data: {response.status_code}", "FAIL")
                return False
        except Exception as e:
            self.log(f"MCP bootstrap malformed data error: {e}", "FAIL")
            return False

    def test_mcp_tools_health(self) -> bool:
        """Test MCP tools health endpoint."""
        try:
            response = requests.get(f"{self.backend_url}/api/mcp/tools/health", timeout=5)
            if response.status_code == 200:
                data = response.json()
                self.log(f"MCP tools health: {data.get('status', 'Unknown')}", "OK")
                return True
            else:
                # This might be expected if MCP server is not running
                data = response.json() if response.content else {}
                if "MCP server is not running" in str(data):
                    self.log("MCP tools health correctly reports server not running", "OK")
                    return True
                else:
                    self.log(f"MCP tools health failed: {response.status_code}", "WARN")
                    return False
        except Exception as e:
            self.log(f"MCP tools health error: {e}", "FAIL")
            return False

    def test_mcp_clients_endpoint(self) -> bool:
        """Test MCP clients endpoint."""
        try:
            response = requests.get(f"{self.backend_url}/api/mcp/clients", timeout=5)
            if response.status_code == 200:
                data = response.json()
                self.log(f"MCP clients endpoint accessible", "OK")
                self.log(f"Number of clients: {len(data) if isinstance(data, list) else 'Unknown'}", "INFO")
                return True
            else:
                self.log(f"MCP clients endpoint failed: {response.status_code}", "WARN")
                return False
        except Exception as e:
            self.log(f"MCP clients endpoint error: {e}", "FAIL")
            return False

    def test_mcp_stats_endpoint(self) -> bool:
        """Test MCP stats endpoint."""
        try:
            response = requests.get(f"{self.backend_url}/api/mcp/stats", timeout=5)
            if response.status_code == 200:
                data = response.json()
                self.log(f"MCP stats endpoint accessible", "OK")
                return True
            else:
                self.log(f"MCP stats endpoint failed: {response.status_code}", "WARN")
                return False
        except Exception as e:
            self.log(f"MCP stats endpoint error: {e}", "FAIL")
            return False

    def test_security_headers(self) -> bool:
        """Test that security headers are present."""
        try:
            response = requests.get(f"{self.backend_url}/", timeout=5)
            headers = response.headers

            security_headers = [
                'x-content-type-options',
                'x-frame-options',
                'x-xss-protection'
            ]

            missing_headers = []
            for header in security_headers:
                if header not in headers:
                    missing_headers.append(header)

            if not missing_headers:
                self.log("All required security headers are present", "OK")
                return True
            else:
                self.log(f"Missing security headers: {missing_headers}", "WARN")
                return False
        except Exception as e:
            self.log(f"Security headers test error: {e}", "FAIL")
            return False

    def run_all_tests(self) -> Dict[str, Any]:
        """Run all authentication tests."""
        self.log("🦊 Starting Backend MCP Authentication Tests")
        self.log("=" * 50)

        tests = [
            ("Backend Connectivity", self.test_backend_connectivity),
            ("MCP Bootstrap Health", self.test_mcp_bootstrap_health),
            ("MCP Bootstrap Auth (Invalid)", self.test_mcp_bootstrap_authentication_invalid),
            ("MCP Bootstrap Auth (Malformed)", self.test_mcp_bootstrap_authentication_malformed),
            ("MCP Tools Health", self.test_mcp_tools_health),
            ("MCP Clients Endpoint", self.test_mcp_clients_endpoint),
            ("MCP Stats Endpoint", self.test_mcp_stats_endpoint),
            ("Security Headers", self.test_security_headers),
        ]

        results = {}
        passed = 0
        total = len(tests)

        for test_name, test_func in tests:
            self.log(f"\n🔍 Testing: {test_name}")
            try:
                result = test_func()
                results[test_name] = result
                if result:
                    passed += 1
            except Exception as e:
                self.log(f"Test {test_name} failed with exception: {e}", "FAIL")
                results[test_name] = False

        # Summary
        self.log("\n" + "=" * 50)
        self.log("🦊 Backend MCP Authentication Test Results")
        self.log("=" * 50)
        self.log(f"Total Tests: {total}")
        self.log(f"Passed: {passed}")
        self.log(f"Failed: {total - passed}")
        self.log(f"Success Rate: {(passed / total) * 100:.1f}%")

        if passed == total:
            self.log("🎉 All backend authentication tests passed!", "OK")
        else:
            self.log("⚠️  Some backend authentication tests failed. Review the results above.", "WARN")

        return {
            "total_tests": total,
            "passed_tests": passed,
            "failed_tests": total - passed,
            "success_rate": (passed / total) * 100,
            "results": results
        }


def main():
    """Main entry point."""
    tester = BackendAuthTester()
    results = tester.run_all_tests()

    # Exit with appropriate code
    sys.exit(0 if results["passed_tests"] == results["total_tests"] else 1)


if __name__ == "__main__":
    main()
