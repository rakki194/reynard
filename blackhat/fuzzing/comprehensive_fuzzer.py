"""
🐺 COMPREHENSIVE FUZZING FRAMEWORK

*snarls with predatory glee* The most advanced fuzzing engine for tearing apart
your precious Reynard codebase with thousands of malicious payloads!
"""

import asyncio
import httpx
import random
import time
from typing import List, Dict, Any, Optional, Tuple
from dataclasses import dataclass
from rich.console import Console
from rich.panel import Panel
from rich.table import Table
from rich.progress import Progress, SpinnerColumn, TextColumn, BarColumn, TaskProgressColumn

from .payload_generator import PayloadGenerator

console = Console()

@dataclass
class FuzzResult:
    """Result of a fuzzing attempt"""
    url: str
    method: str
    payload: str
    status_code: int
    response_time: float
    response_size: int
    error: Optional[str] = None
    vulnerability_detected: bool = False
    vulnerability_type: Optional[str] = None

class ComprehensiveFuzzer:
    """
    *alpha wolf stance* The ultimate fuzzing engine
    
    *packs hunting formation* Coordinates thousands of attack vectors
    against your precious endpoints!
    """
    
    def __init__(self, base_url: str = "http://localhost:8000", max_concurrent: int = 10):
        self.base_url = base_url.rstrip('/')
        self.max_concurrent = max_concurrent
        self.payload_generator = PayloadGenerator()
        self.results: List[FuzzResult] = []
        self.session = httpx.AsyncClient(timeout=30.0)
        
    async def __aenter__(self):
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.session.aclose()
    
    async def fuzz_endpoint(self, endpoint: str, method: str = "GET", 
                          headers: Optional[Dict[str, str]] = None,
                          payload_count: int = 100) -> List[FuzzResult]:
        """
        *snarls with predatory glee* Fuzz a specific endpoint with malicious payloads
        """
        console.print(Panel.fit(
            f"[bold red]🐺 FUZZING ENDPOINT: {method} {endpoint}[/bold red]\n"
            f"*bares fangs with savage satisfaction*\n"
            f"Preparing {payload_count} malicious payloads to tear apart your validation!",
            border_style="red"
        ))
        
        url = f"{self.base_url}{endpoint}"
        payloads = self.payload_generator.generate_comprehensive_fuzz_set(payload_count)
        results = []
        
        # Create semaphore to limit concurrent requests
        semaphore = asyncio.Semaphore(self.max_concurrent)
        
        async def fuzz_single_payload(payload: str) -> FuzzResult:
            async with semaphore:
                return await self._send_fuzzed_request(url, method, payload, headers)
        
        # Execute fuzzing with progress bar
        with Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            BarColumn(),
            TaskProgressColumn(),
            console=console
        ) as progress:
            task = progress.add_task(f"[red]🐺 Fuzzing {endpoint}...", total=len(payloads))
            
            # Execute all fuzzing requests
            tasks = [fuzz_single_payload(payload) for payload in payloads]
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            # Filter out exceptions and update progress
            valid_results = []
            for result in results:
                if isinstance(result, FuzzResult):
                    valid_results.append(result)
                progress.advance(task)
            
            self.results.extend(valid_results)
            return valid_results
    
    async def _send_fuzzed_request(self, url: str, method: str, payload: str, 
                                 headers: Optional[Dict[str, str]] = None) -> FuzzResult:
        """Send a single fuzzed request"""
        start_time = time.time()
        
        try:
            # Prepare request based on method
            if method.upper() == "GET":
                # Add payload as query parameter
                params = {"q": payload, "search": payload, "input": payload}
                response = await self.session.get(url, params=params, headers=headers)
            elif method.upper() == "POST":
                # Check if this is an authentication endpoint
                if "/auth/login" in url or "/auth/register" in url:
                    # Use form data for authentication endpoints (OAuth2 format)
                    if "/auth/login" in url:
                        data = {
                            "username": payload,
                            "password": payload,
                        }
                    else:  # register endpoint
                        data = {
                            "username": payload,
                            "email": f"{payload}@example.com",
                            "password": payload,
                            "full_name": payload,
                        }
                    response = await self.session.post(url, data=data, headers=headers)
                else:
                    # Use JSON for other endpoints
                    data = {
                        "input": payload,
                        "query": payload,
                        "search": payload,
                        "username": payload,
                        "password": payload,
                        "message": payload,
                        "content": payload,
                    }
                    response = await self.session.post(url, json=data, headers=headers)
            else:
                # Default to GET
                params = {"q": payload}
                response = await self.session.get(url, params=params, headers=headers)
            
            end_time = time.time()
            response_time = end_time - start_time
            
            # Analyze response for potential vulnerabilities
            vulnerability_detected, vulnerability_type = self._analyze_response(
                response, payload
            )
            
            return FuzzResult(
                url=url,
                method=method,
                payload=payload,
                status_code=response.status_code,
                response_time=response_time,
                response_size=len(response.content),
                vulnerability_detected=vulnerability_detected,
                vulnerability_type=vulnerability_type
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
                error=str(e)
            )
    
    def _analyze_response(self, response: httpx.Response, payload: str) -> Tuple[bool, Optional[str]]:
        """Analyze response for potential vulnerabilities"""
        response_text = response.text.lower()
        payload_lower = payload.lower()
        
        # Skip analysis for proper validation rejections (422 status codes)
        if response.status_code == 422:
            # Check if this is a proper validation error (not a vulnerability)
            validation_indicators = [
                "string should match pattern", "invalid email format", 
                "value error", "validation error", "field required"
            ]
            if any(indicator in response_text for indicator in validation_indicators):
                return False, None  # This is proper validation, not a vulnerability
        
        # Check for SQL injection indicators (only in successful responses)
        sql_indicators = [
            "sql syntax", "mysql", "postgresql", "sqlite", "oracle",
            "syntax error", "database error", "table", "column"
        ]
        
        if any(indicator in response_text for indicator in sql_indicators):
            return True, "SQL Injection"
        
        # Check for XSS indicators
        if payload_lower in response_text and any(tag in payload_lower for tag in ["<script>", "<img", "<svg", "javascript:"]):
            return True, "XSS"
        
        # Check for path traversal indicators (only in successful responses)
        path_indicators = [
            "root:", "bin:", "usr:", "var:", "proc:",
            "windows", "system32", "drivers"
        ]
        
        # Only flag as path traversal if the payload contains path traversal AND we get a successful response
        if (any(indicator in response_text for indicator in path_indicators) and 
            response.status_code == 200 and 
            any(traversal in payload_lower for traversal in ["../", "..\\", "/etc/", "\\windows\\"])):
            return True, "Path Traversal"
        
        # Check for command injection indicators
        cmd_indicators = [
            "command not found", "permission denied", "access denied",
            "no such file", "directory", "ls:", "dir:", "whoami:"
        ]
        
        if any(indicator in response_text for indicator in cmd_indicators):
            return True, "Command Injection"
        
        # Check for information disclosure
        info_indicators = [
            "stack trace", "exception", "error in", "warning:",
            "notice:", "fatal error", "internal server error"
        ]
        
        if any(indicator in response_text for indicator in info_indicators):
            return True, "Information Disclosure"
        
        return False, None
    
    async def fuzz_authentication_endpoints(self) -> List[FuzzResult]:
        """Fuzz authentication-related endpoints"""
        console.print(Panel.fit(
            "[bold red]🐺 FUZZING AUTHENTICATION ENDPOINTS[/bold red]\n"
            "*snarls with predatory glee* Time to break your login security!",
            border_style="red"
        ))
        
        auth_endpoints = [
            "/api/auth/login",
            "/api/auth/register", 
            "/api/auth/refresh",
            "/api/login",
            "/api/register",
            "/api/refresh-token"
        ]
        
        all_results = []
        for endpoint in auth_endpoints:
            # Fuzz with POST method for auth endpoints
            results = await self.fuzz_endpoint(endpoint, "POST", payload_count=50)
            all_results.extend(results)
            
            # Also try GET method
            results = await self.fuzz_endpoint(endpoint, "GET", payload_count=25)
            all_results.extend(results)
        
        return all_results
    
    async def fuzz_file_endpoints(self) -> List[FuzzResult]:
        """Fuzz file-related endpoints"""
        console.print(Panel.fit(
            "[bold red]🐺 FUZZING FILE ENDPOINTS[/bold red]\n"
            "*bares fangs with savage satisfaction* Let's break your file security!",
            border_style="red"
        ))
        
        file_endpoints = [
            "/api/files/upload",
            "/api/files/download",
            "/api/files/browse",
            "/api/upload",
            "/api/download",
            "/api/browse"
        ]
        
        all_results = []
        for endpoint in file_endpoints:
            results = await self.fuzz_endpoint(endpoint, "GET", payload_count=75)
            all_results.extend(results)
            
            if "upload" in endpoint:
                results = await self.fuzz_endpoint(endpoint, "POST", payload_count=50)
                all_results.extend(results)
        
        return all_results
    
    async def fuzz_api_endpoints(self, endpoints: List[str]) -> List[FuzzResult]:
        """Fuzz a list of API endpoints"""
        console.print(Panel.fit(
            "[bold red]🐺 FUZZING API ENDPOINTS[/bold red]\n"
            "*packs hunting formation* Coordinating attacks on multiple targets!",
            border_style="red"
        ))
        
        all_results = []
        for endpoint in endpoints:
            # Try both GET and POST methods
            for method in ["GET", "POST"]:
                results = await self.fuzz_endpoint(endpoint, method, payload_count=30)
                all_results.extend(results)
        
        return all_results
    
    def generate_fuzz_report(self) -> None:
        """Generate a comprehensive fuzzing report"""
        console.print("\n[bold red]🎯 COMPREHENSIVE FUZZING REPORT[/bold red]")
        
        if not self.results:
            console.print("[yellow]No fuzzing results to report.[/yellow]")
            return
        
        # Summary statistics
        total_requests = len(self.results)
        successful_requests = len([r for r in self.results if r.status_code > 0])
        vulnerabilities_found = len([r for r in self.results if r.vulnerability_detected])
        errors = len([r for r in self.results if r.error])
        
        # Summary table
        table = Table(title="🐺 Fuzzing Summary")
        table.add_column("Metric", style="cyan")
        table.add_column("Count", style="green")
        table.add_column("Percentage", style="yellow")
        
        table.add_row("Total Requests", str(total_requests), "100%")
        table.add_row("Successful Requests", str(successful_requests), f"{(successful_requests/total_requests)*100:.1f}%")
        table.add_row("Vulnerabilities Found", str(vulnerabilities_found), f"{(vulnerabilities_found/total_requests)*100:.1f}%")
        table.add_row("Errors", str(errors), f"{(errors/total_requests)*100:.1f}%")
        
        console.print(table)
        
        # Vulnerability breakdown
        if vulnerabilities_found > 0:
            vuln_table = Table(title="🚨 Vulnerabilities Found")
            vuln_table.add_column("Type", style="red")
            vuln_table.add_column("Count", style="yellow")
            vuln_table.add_column("Endpoints", style="cyan")
            
            vuln_types = {}
            for result in self.results:
                if result.vulnerability_detected and result.vulnerability_type:
                    if result.vulnerability_type not in vuln_types:
                        vuln_types[result.vulnerability_type] = {"count": 0, "endpoints": set()}
                    vuln_types[result.vulnerability_type]["count"] += 1
                    vuln_types[result.vulnerability_type]["endpoints"].add(result.url)
            
            for vuln_type, data in vuln_types.items():
                endpoints_str = ", ".join(list(data["endpoints"])[:3])
                if len(data["endpoints"]) > 3:
                    endpoints_str += f" (+{len(data['endpoints'])-3} more)"
                vuln_table.add_row(vuln_type, str(data["count"]), endpoints_str)
            
            console.print(vuln_table)
        
        # Top vulnerable endpoints
        endpoint_vulns = {}
        for result in self.results:
            if result.vulnerability_detected:
                if result.url not in endpoint_vulns:
                    endpoint_vulns[result.url] = 0
                endpoint_vulns[result.url] += 1
        
        if endpoint_vulns:
            top_vuln_table = Table(title="🎯 Most Vulnerable Endpoints")
            top_vuln_table.add_column("Endpoint", style="red")
            top_vuln_table.add_column("Vulnerabilities", style="yellow")
            
            sorted_endpoints = sorted(endpoint_vulns.items(), key=lambda x: x[1], reverse=True)
            for endpoint, count in sorted_endpoints[:10]:
                top_vuln_table.add_row(endpoint, str(count))
            
            console.print(top_vuln_table)
        
        # Recommendations
        console.print(Panel.fit(
            "[bold red]🛡️ SECURITY RECOMMENDATIONS[/bold red]\n"
            "Based on fuzzing results:\n\n"
            "• Implement comprehensive input validation\n"
            "• Use parameterized queries for database operations\n"
            "• Sanitize all user inputs before processing\n"
            "• Implement proper error handling without information disclosure\n"
            "• Add rate limiting to prevent abuse\n"
            "• Use Content Security Policy (CSP) headers\n"
            "• Implement proper file upload validation\n"
            "• Add request size limits\n"
            "• Use HTTPS in production\n"
            "• Implement proper authentication and authorization",
            border_style="red"
        ))

async def main():
    """Main execution function for testing"""
    async with ComprehensiveFuzzer() as fuzzer:
        # Fuzz common endpoints
        await fuzzer.fuzz_authentication_endpoints()
        await fuzzer.fuzz_file_endpoints()
        
        # Generate report
        fuzzer.generate_fuzz_report()

if __name__ == "__main__":
    asyncio.run(main())
