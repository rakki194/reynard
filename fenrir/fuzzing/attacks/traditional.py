"""
🐺 Traditional HTTP Fuzzing Engine

*snarls with predatory glee* Traditional HTTP fuzzing engine for standard
web application endpoints. Provides comprehensive coverage of common
vulnerability types with proven attack vectors.

Classes:
    TraditionalFuzzer: Traditional HTTP fuzzing with standard attack vectors
"""

import asyncio
import time
from typing import List, Dict, Any, Optional
from faker import Faker

from ..core.base import BaseFuzzer
from ..core.results import FuzzResult
from ..core.analysis import VulnerabilityAnalyzer
from ..generators.payload_generator import PayloadGenerator


class TraditionalFuzzer(BaseFuzzer):
    """
    🐺 Traditional HTTP Fuzzing Engine
    
    *alpha wolf dominance radiates* Comprehensive traditional HTTP fuzzing
    engine for standard web application endpoints. Provides proven attack
    vectors for common vulnerability types with extensive payload coverage.
    
    This fuzzer specializes in:
    - Standard HTTP endpoint fuzzing
    - Comprehensive payload generation
    - Traditional vulnerability detection
    - Authentication endpoint testing
    - File upload endpoint testing
    - API endpoint coverage
    
    Attack Coverage:
    - SQL Injection: Database query manipulation
    - XSS: Cross-site scripting attacks
    - Path Traversal: File system access
    - Command Injection: Command execution
    - File Upload: Malicious file uploads
    - Authentication: Login bypass attempts
    
    Attributes:
        payload_generator (PayloadGenerator): Comprehensive payload generator
        analyzer (VulnerabilityAnalyzer): Vulnerability detection engine
        faker (Faker): Fake data generator for realistic payloads
        
    Example:
        >>> fuzzer = TraditionalFuzzer()
        >>> results = await fuzzer.fuzz_endpoint("/api/auth/login", "POST", 100)
        >>> # Tests endpoint with 100 traditional fuzzing payloads
    """
    
    def __init__(self, base_url: str = "http://localhost:8000", max_concurrent: int = 10):
        """
        Initialize the traditional fuzzer.
        
        *whiskers twitch with intelligence* Sets up payload generator
        and vulnerability analyzer for comprehensive HTTP fuzzing.
        
        Args:
            base_url (str): Base URL for HTTP endpoints
            max_concurrent (int): Maximum concurrent requests
        """
        super().__init__(base_url, max_concurrent)
        self.payload_generator = PayloadGenerator()
        self.analyzer = VulnerabilityAnalyzer()
        self.faker = Faker()
    
    async def fuzz_endpoint(self, endpoint: str, method: str = "GET", 
                           payload_count: int = 100, headers: Optional[Dict[str, str]] = None,
                           **kwargs) -> List[FuzzResult]:
        """
        Fuzz endpoint with traditional attack vectors.
        
        *snarls with predatory glee* Generates and sends traditional
        fuzzing payloads to the target endpoint with comprehensive coverage.
        
        Args:
            endpoint (str): Target endpoint to fuzz
            method (str): HTTP method to use
            payload_count (int): Number of payloads to generate
            headers (Optional[Dict[str, str]]): Additional headers to send
            **kwargs: Additional fuzzing parameters
            
        Returns:
            List[FuzzResult]: Results from traditional fuzzing
        """
        url = f"{self.base_url}{endpoint}"
        payloads = self.payload_generator.generate_comprehensive_fuzz_set(payload_count)
        results = []
        
        # Create semaphore to limit concurrent requests
        semaphore = asyncio.Semaphore(self.max_concurrent)
        
        async def fuzz_single_payload(payload: str) -> FuzzResult:
            async with semaphore:
                return await self._send_fuzzed_request(url, method, payload, headers)
        
        # Execute fuzzing with concurrent requests
        tasks = [fuzz_single_payload(payload) for payload in payloads]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Filter out exceptions and update results
        valid_results = []
        for result in results:
            if isinstance(result, FuzzResult):
                valid_results.append(result)
        
        # Add results to collection
        self.results.extend(valid_results)
        return valid_results
    
    async def _send_fuzzed_request(self, url: str, method: str, payload: str, 
                                 headers: Optional[Dict[str, str]] = None) -> FuzzResult:
        """
        Send a single fuzzed request.
        
        *bares fangs with savage satisfaction* Sends malicious payload
        to target endpoint with comprehensive response analysis.
        
        Args:
            url (str): Target URL
            method (str): HTTP method
            payload (str): Malicious payload
            headers (Optional[Dict[str, str]]): Request headers
            
        Returns:
            FuzzResult: Result of the fuzzing attempt
        """
        start_time = time.time()
        
        try:
            # Prepare request based on method
            if method.upper() == "GET":
                # Add payload as query parameter
                params = {"q": payload, "search": payload, "input": payload}
                response = await self.send_request(url, method="GET", params=params, headers=headers)
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
                    response = await self.send_request(url, method="POST", data=data, headers=headers)
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
                    response = await self.send_request(url, method="POST", json=data, headers=headers)
            else:
                # Default to GET
                params = {"q": payload}
                response = await self.send_request(url, method="GET", params=params, headers=headers)
            
            end_time = time.time()
            response_time = end_time - start_time
            
            # Analyze response for potential vulnerabilities
            vulnerability_detected, vulnerability_type = self.analyzer.analyze_response(
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
                vulnerability_type=vulnerability_type,
                # Capture full response details
                response_body=response.text,
                response_text=response.text,
                response_headers=dict(response.headers),
                request_headers=dict(headers) if headers else None
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
                # Capture any available response data even on error
                response_body=None,
                response_text=None,
                response_headers=None,
                request_headers=dict(headers) if headers else None
            )
    
    async def fuzz_authentication_endpoints(self) -> List[FuzzResult]:
        """
        Fuzz authentication-related endpoints.
        
        *snarls with predatory intelligence* Targets authentication
        endpoints with specialized login bypass attempts.
        
        Returns:
            List[FuzzResult]: Results from authentication endpoint fuzzing
        """
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
        """
        Fuzz file-related endpoints.
        
        *bares fangs with savage satisfaction* Targets file upload
        and download endpoints with malicious file payloads.
        
        Returns:
            List[FuzzResult]: Results from file endpoint fuzzing
        """
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
        """
        Fuzz a list of API endpoints.
        
        *alpha wolf dominance radiates* Performs comprehensive
        fuzzing across multiple API endpoints with coordinated attacks.
        
        Args:
            endpoints (List[str]): List of endpoints to fuzz
            
        Returns:
            List[FuzzResult]: Results from API endpoint fuzzing
        """
        all_results = []
        for endpoint in endpoints:
            # Try both GET and POST methods
            for method in ["GET", "POST"]:
                results = await self.fuzz_endpoint(endpoint, method, payload_count=30)
                all_results.extend(results)
        
        return all_results
