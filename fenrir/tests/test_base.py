"""
🦦 BASE TEST CLASSES

*splashes with enthusiasm* Base classes and utilities for testing our fenrir security framework!
"""

import asyncio
import pytest
import httpx
import time
from typing import Dict, Any, Optional, List
from dataclasses import dataclass
from unittest.mock import Mock, patch
import sys
import os

# Add the fenrir directory to the path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

@dataclass
class SecurityTestResult:
    """Result of a security test"""
    test_name: str
    success: bool
    vulnerability_found: bool
    expected_vulnerability: bool
    details: str
    response_time: float
    status_code: Optional[int] = None
    error: Optional[str] = None

class FenrirTestBase:
    """
    *otter enthusiasm bubbles* Base class for all fenrir security tests
    
    Provides common functionality for testing security exploits and ensuring
    they work correctly against both vulnerable and secure targets.
    """
    
    def __init__(self, base_url: str = "http://localhost:8000"):
        self.base_url = base_url.rstrip('/')
        self.session = httpx.AsyncClient(timeout=30.0)
        self.test_results: List[SecurityTestResult] = []
    
    async def __aenter__(self):
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.session.aclose()
    
    async def make_request(self, method: str, endpoint: str, **kwargs) -> httpx.Response:
        """Make an HTTP request and return the response"""
        url = f"{self.base_url}{endpoint}"
        return await self.session.request(method, url, **kwargs)
    
    def assert_vulnerability_detected(self, result: SecurityTestResult, should_be_vulnerable: bool = True):
        """Assert that a vulnerability was or wasn't detected as expected"""
        if should_be_vulnerable:
            assert result.vulnerability_found, f"Expected vulnerability in {result.test_name}: {result.details}"
        else:
            assert not result.vulnerability_found, f"Unexpected vulnerability in {result.test_name}: {result.details}"
    
    def assert_response_time(self, result: SecurityTestResult, max_time: float = 5.0):
        """Assert that the response time is within acceptable limits"""
        assert result.response_time <= max_time, f"Response time too slow: {result.response_time:.2f}s > {max_time}s"
    
    def assert_status_code(self, result: SecurityTestResult, expected_codes: List[int]):
        """Assert that the status code is one of the expected values"""
        assert result.status_code in expected_codes, f"Unexpected status code {result.status_code}, expected one of {expected_codes}"
    
    def log_test_result(self, result: SecurityTestResult):
        """Log a test result"""
        status = "✅ PASS" if result.success else "❌ FAIL"
        vuln_status = "🚨 VULNERABLE" if result.vulnerability_found else "🛡️ SECURE"
        print(f"{status} {result.test_name}: {vuln_status} ({result.response_time:.3f}s)")
        if result.details:
            print(f"    Details: {result.details}")
        if result.error:
            print(f"    Error: {result.error}")
        
        self.test_results.append(result)
    
    def get_test_summary(self) -> Dict[str, Any]:
        """Get a summary of all test results"""
        total_tests = len(self.test_results)
        passed_tests = sum(1 for r in self.test_results if r.success)
        vulnerabilities_found = sum(1 for r in self.test_results if r.vulnerability_found)
        
        return {
            "total_tests": total_tests,
            "passed_tests": passed_tests,
            "failed_tests": total_tests - passed_tests,
            "vulnerabilities_found": vulnerabilities_found,
            "success_rate": (passed_tests / total_tests * 100) if total_tests > 0 else 0,
            "results": self.test_results
        }

class MockVulnerableServer:
    """
    *otter mischief* Mock server that simulates vulnerable endpoints
    for testing our exploit scripts
    """
    
    def __init__(self):
        self.responses = {}
        self.setup_vulnerable_responses()
    
    def setup_vulnerable_responses(self):
        """Setup responses that simulate various vulnerabilities"""
        # SQL Injection vulnerable endpoint
        self.responses["/api/vulnerable/search"] = {
            "status": 200,
            "body": "SELECT * FROM users WHERE name = 'admin' OR 1=1 --'",
            "headers": {"Content-Type": "text/html"}
        }
        
        # XSS vulnerable endpoint
        self.responses["/api/vulnerable/comment"] = {
            "status": 200,
            "body": "<script>alert('XSS')</script>",
            "headers": {"Content-Type": "text/html"}
        }
        
        # Path traversal vulnerable endpoint
        self.responses["/api/vulnerable/file"] = {
            "status": 200,
            "body": "root:x:0:0:root:/root:/bin/bash",
            "headers": {"Content-Type": "text/plain"}
        }
    
    def get_response(self, endpoint: str) -> Dict[str, Any]:
        """Get a mock response for an endpoint"""
        return self.responses.get(endpoint, {
            "status": 404,
            "body": "Not Found",
            "headers": {"Content-Type": "text/plain"}
        })

class MockSecureServer:
    """
    *otter pride* Mock server that simulates secure endpoints
    for testing that our scripts don't produce false positives
    """
    
    def __init__(self):
        self.responses = {}
        self.setup_secure_responses()
    
    def setup_secure_responses(self):
        """Setup responses that simulate secure endpoints"""
        # Secure endpoint that properly validates input
        self.responses["/api/secure/search"] = {
            "status": 422,
            "body": '{"detail": [{"type": "string_pattern_mismatch", "msg": "Invalid input"}]}',
            "headers": {"Content-Type": "application/json"}
        }
        
        # Secure endpoint that blocks malicious requests
        self.responses["/api/secure/comment"] = {
            "status": 400,
            "body": '{"error": "Invalid input detected"}',
            "headers": {"Content-Type": "application/json"}
        }
        
        # Secure endpoint that prevents path traversal
        self.responses["/api/secure/file"] = {
            "status": 403,
            "body": '{"error": "Access denied"}',
            "headers": {"Content-Type": "application/json"}
        }
    
    def get_response(self, endpoint: str) -> Dict[str, Any]:
        """Get a mock response for an endpoint"""
        return self.responses.get(endpoint, {
            "status": 404,
            "body": "Not Found",
            "headers": {"Content-Type": "text/plain"}
        })
