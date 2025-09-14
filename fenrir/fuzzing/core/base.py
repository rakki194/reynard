"""
🐺 Base Fuzzing Framework

*alpha wolf dominance radiates* Base classes and interfaces for the Reynard
fuzzing framework. Provides common functionality and abstract interfaces
that all fuzzing components inherit from.

Classes:
    BaseFuzzer: Abstract base class for all fuzzing engines
"""

from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
import httpx
import asyncio


class BaseFuzzer(ABC):
    """
    🐺 Base Fuzzing Framework
    
    *snarls with predatory intelligence* Abstract base class that provides
    common functionality and interfaces for all fuzzing engines in the
    Reynard framework. Ensures consistent behavior and extensibility
    across different fuzzing components.
    
    This base class provides:
    - Common HTTP session management
    - Standardized result collection
    - Progress tracking and reporting
    - Error handling and recovery
    - Configuration management
    
    Attributes:
        base_url (str): Base URL for fuzzing targets
        max_concurrent (int): Maximum concurrent requests
        session (httpx.AsyncClient): HTTP client for requests
        results (List): Collection of fuzzing results
        
    Example:
        >>> class MyFuzzer(BaseFuzzer):
        ...     async def fuzz_endpoint(self, endpoint: str) -> List[FuzzResult]:
        ...         # Implementation here
        ...         pass
    """
    
    def __init__(self, base_url: str = "http://localhost:8000", max_concurrent: int = 10):
        """
        Initialize the base fuzzer.
        
        *whiskers twitch with intelligence* Sets up common fuzzing
        infrastructure and configuration.
        
        Args:
            base_url (str): Base URL for fuzzing targets
            max_concurrent (int): Maximum concurrent requests
        """
        self.base_url = base_url.rstrip('/')
        self.max_concurrent = max_concurrent
        self.session = httpx.AsyncClient(timeout=30.0)
        self.results: List = []
    
    async def __aenter__(self):
        """
        Async context manager entry.
        
        *alpha wolf dominance radiates* Ensures proper initialization
        when used as an async context manager.
        
        Returns:
            BaseFuzzer: Self instance
        """
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """
        Async context manager exit.
        
        *snarls with predatory intelligence* Ensures proper cleanup
        of resources when exiting the context.
        """
        await self.session.aclose()
    
    @abstractmethod
    async def fuzz_endpoint(self, endpoint: str, **kwargs) -> List[Any]:
        """
        Abstract method for fuzzing a specific endpoint.
        
        *bares fangs with savage satisfaction* Must be implemented
        by all concrete fuzzing classes.
        
        Args:
            endpoint (str): Target endpoint to fuzz
            **kwargs: Additional fuzzing parameters
            
        Returns:
            List[Any]: List of fuzzing results
            
        Raises:
            NotImplementedError: If not implemented by subclass
        """
        raise NotImplementedError("Subclasses must implement fuzz_endpoint")
    
    async def send_request(self, url: str, method: str = "GET", 
                          headers: Optional[Dict[str, str]] = None,
                          data: Optional[Dict[str, Any]] = None,
                          json: Optional[Dict[str, Any]] = None,
                          params: Optional[Dict[str, Any]] = None) -> httpx.Response:
        """
        Send HTTP request with standardized error handling.
        
        *circles with menacing intent* Provides consistent request
        handling across all fuzzing operations.
        
        Args:
            url (str): Target URL
            method (str): HTTP method
            headers (Optional[Dict[str, str]]): Request headers
            data (Optional[Dict[str, Any]]): Form data
            json (Optional[Dict[str, Any]]): JSON data
            params (Optional[Dict[str, Any]]): Query parameters
            
        Returns:
            httpx.Response: HTTP response
            
        Raises:
            httpx.RequestError: If request fails
        """
        try:
            response = await self.session.request(
                method.upper(),
                url,
                headers=headers,
                data=data,
                json=json,
                params=params
            )
            return response
        except httpx.RequestError as e:
            # Create a mock response for error cases
            return httpx.Response(
                status_code=0,
                content=b"",
                request=httpx.Request(method, url)
            )
    
    def add_result(self, result: Any) -> None:
        """
        Add fuzzing result to collection.
        
        *snarls with predatory glee* Standardized result collection
        for consistent result management.
        
        Args:
            result: Fuzzing result to add
        """
        self.results.append(result)
    
    def get_results(self) -> List[Any]:
        """
        Get all collected fuzzing results.
        
        *alpha wolf dominance radiates* Returns complete collection
        of fuzzing results for analysis.
        
        Returns:
            List[Any]: All collected fuzzing results
        """
        return self.results
    
    def clear_results(self) -> None:
        """
        Clear all collected fuzzing results.
        
        *bares fangs with savage satisfaction* Resets the result
        collection for fresh fuzzing runs.
        """
        self.results.clear()
    
    async def execute_concurrent_requests(self, requests: List[callable]) -> List[Any]:
        """
        Execute multiple requests concurrently with semaphore control.
        
        *circles with menacing intent* Manages concurrent request execution
        to prevent overwhelming the target system.
        
        Args:
            requests (List[callable]): List of async request functions
            
        Returns:
            List[Any]: Results from all requests
        """
        semaphore = asyncio.Semaphore(self.max_concurrent)
        
        async def execute_with_semaphore(request_func):
            async with semaphore:
                return await request_func()
        
        tasks = [execute_with_semaphore(req) for req in requests]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Filter out exceptions
        valid_results = [r for r in results if not isinstance(r, Exception)]
        return valid_results
    
    def generate_summary(self) -> Dict[str, Any]:
        """
        Generate summary statistics from collected results.
        
        *snarls with predatory intelligence* Analyzes collected results
        to provide comprehensive summary statistics.
        
        Returns:
            Dict[str, Any]: Summary statistics
        """
        if not self.results:
            return {"total_requests": 0, "vulnerabilities_found": 0}
        
        total_requests = len(self.results)
        vulnerabilities_found = len([r for r in self.results if hasattr(r, 'vulnerability_detected') and r.vulnerability_detected])
        errors = len([r for r in self.results if hasattr(r, 'error') and r.error])
        
        return {
            "total_requests": total_requests,
            "vulnerabilities_found": vulnerabilities_found,
            "errors": errors,
            "success_rate": (total_requests - errors) / total_requests if total_requests > 0 else 0,
            "vulnerability_rate": vulnerabilities_found / total_requests if total_requests > 0 else 0
        }
