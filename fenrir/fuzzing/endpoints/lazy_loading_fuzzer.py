"""
🦊 Lazy Loading Fuzzer - Modular

*whiskers twitch with cunning intelligence* Specialized fuzzing for lazy loading endpoints
with package management exploits and dependency confusion attacks using modular architecture!
"""

import asyncio
from typing import List, Dict, Any, Optional, Tuple
from rich.console import Console
from rich.panel import Panel

from ..core.base_fuzzer import BaseFuzzer
from ..core.payload_composables import PayloadComposables
from ..core.results import FuzzResult

console = Console()

class LazyLoadingFuzzer(BaseFuzzer):
    """
    🦊 Lazy Loading Fuzzer - Modular & Efficient
    
    *red fur gleams with intelligence* Modular fuzzer that leverages
    the strategic architecture. Eliminates code duplication while
    maintaining specialized package management attack vectors.
    """
    
    def __init__(self, base_url: str = "http://localhost:8000", max_concurrent: int = 10):
        """
        Initialize the modular lazy loading fuzzer.
        
        *fox efficiency at work* Uses the base fuzzer for all common
        functionality while maintaining specialized package management capabilities.
        """
        super().__init__(base_url, max_concurrent)
        self.payload_composables = PayloadComposables()
    
    def _analyze_response(self, response, request_kwargs: dict) -> Tuple[bool, Optional[str]]:
        """
        Analyze response for package management vulnerabilities.
        
        *fox package hunting instincts* Provides specialized analysis for
        package management vulnerabilities and lazy loading attack vectors.
        """
        response_text = response.text.lower()
        
        # Use common vulnerability detection first
        vuln_detected, vuln_type = self._detect_common_vulnerabilities(response_text)
        if vuln_detected:
            return vuln_detected, vuln_type
        
        # Package management specific vulnerability detection
        if response.status_code == 200:
            # Check for package information disclosure
            if any(indicator in response_text for indicator in [
                "package_path", "internal_error", "stack_trace", "registry_path",
                "package_source", "installation_path", "module_path"
            ]):
                return True, "Package Information Disclosure"
            
            # Check for successful package manipulation
            if "json" in request_kwargs:
                payload = request_kwargs["json"]
                if isinstance(payload, dict):
                    # Check if malicious package parameters were processed
                    if any(key in payload for key in ["package_name", "package_path", "registry"]):
                        if any(malicious in str(payload).lower() for malicious in [
                            "'; drop table", "<script>", "../../../", "; ls"
                        ]):
                            if any(success in response_text for success in [
                                "processed", "accepted", "success", "loaded", "installed"
                            ]):
                                return True, "Package Parameter Injection"
        
        # Check for package management resource exhaustion
        if response.status_code == 500:
            if any(indicator in response_text for indicator in [
                "memory", "timeout", "resource", "exhausted", "out of memory",
                "package", "loading", "registry", "dependency"
            ]):
                return True, "Package Resource Exhaustion"
        
        return False, None
    
    async def fuzz_lazy_loading_endpoints(self) -> List[FuzzResult]:
        """Fuzz all lazy loading endpoints with specialized attacks"""
        self.print_fuzzing_header(
            "FUZZING LAZY LOADING ENDPOINTS",
            "Time to break your package management security with modular efficiency!"
        )
        
        results = []
        
        # Fuzz each endpoint with specialized attacks
        endpoints = [
            ("/api/lazy-loading/exports", "POST", self._fuzz_create_export_endpoint),
            ("/api/lazy-loading/exports/test-package", "GET", self._fuzz_get_export_endpoint),
            ("/api/lazy-loading/packages/load", "POST", self._fuzz_load_package_endpoint),
            ("/api/lazy-loading/packages/test-package", "DELETE", self._fuzz_unload_package_endpoint),
            ("/api/lazy-loading/status", "GET", self._fuzz_status_endpoint),
            ("/api/lazy-loading/packages/test-package", "GET", self._fuzz_package_info_endpoint),
            ("/api/lazy-loading/packages", "GET", self._fuzz_all_packages_endpoint),
            ("/api/lazy-loading/config", "GET", self._fuzz_config_get_endpoint),
            ("/api/lazy-loading/config", "PUT", self._fuzz_config_put_endpoint),
            ("/api/lazy-loading/registry", "DELETE", self._fuzz_clear_registry_endpoint),
            ("/api/lazy-loading/cleanup", "POST", self._fuzz_cleanup_endpoint),
        ]
        
        for endpoint, method, fuzz_func in endpoints:
            self.print_endpoint_progress(method, endpoint)
            endpoint_results = await fuzz_func(endpoint)
            results.extend(endpoint_results)
        
        return results
    
    async def _fuzz_create_export_endpoint(self, endpoint: str) -> List[FuzzResult]:
        """Fuzz create lazy export endpoint"""
        results = []
        url = f"{self.base_url}{endpoint}"
        
        # Package export payloads with malicious package names
        export_payloads = [
            # Valid export request
            {
                "package_name": "test-package",
                "version": "1.0.0",
                "dependencies": ["lodash", "express"]
            },
            # Malicious package names
            {
                "package_name": "../../../etc/passwd",
                "version": "1.0.0",
                "dependencies": ["lodash"]
            },
            {
                "package_name": "'; DROP TABLE packages; --",
                "version": "1.0.0",
                "dependencies": ["lodash"]
            },
            {
                "package_name": "<script>alert('XSS')</script>",
                "version": "1.0.0",
                "dependencies": ["lodash"]
            },
            {
                "package_name": "; ls -la",
                "version": "1.0.0",
                "dependencies": ["lodash"]
            },
            # Malicious versions
            {
                "package_name": "test-package",
                "version": "../../../etc/passwd",
                "dependencies": ["lodash"]
            },
            {
                "package_name": "test-package",
                "version": "'; DROP TABLE packages; --",
                "dependencies": ["lodash"]
            },
            {
                "package_name": "test-package",
                "version": "<script>alert('XSS')</script>",
                "dependencies": ["lodash"]
            },
            # Malicious dependencies
            {
                "package_name": "test-package",
                "version": "1.0.0",
                "dependencies": ["../../../etc/passwd"]
            },
            {
                "package_name": "test-package",
                "version": "1.0.0",
                "dependencies": ["'; DROP TABLE packages; --"]
            },
            {
                "package_name": "test-package",
                "version": "1.0.0",
                "dependencies": ["<script>alert('XSS')</script>"]
            },
            {
                "package_name": "test-package",
                "version": "1.0.0",
                "dependencies": ["; ls -la"]
            },
            # Dependency confusion attacks
            {
                "package_name": "test-package",
                "version": "1.0.0",
                "dependencies": ["@evil/package", "malicious-package"]
            },
            {
                "package_name": "test-package",
                "version": "1.0.0",
                "dependencies": ["package-with-backdoor"]
            },
            # Malformed inputs
            {
                "package_name": None,
                "version": "1.0.0",
                "dependencies": ["lodash"]
            },
            {
                "package_name": "",
                "version": "1.0.0",
                "dependencies": ["lodash"]
            },
            {
                "package_name": "test-package",
                "version": None,
                "dependencies": ["lodash"]
            },
            {
                "package_name": "test-package",
                "version": "",
                "dependencies": ["lodash"]
            },
            {
                "package_name": "test-package",
                "version": "1.0.0",
                "dependencies": None
            },
            {
                "package_name": "test-package",
                "version": "1.0.0",
                "dependencies": []
            },
            # Missing required fields
            {
                "version": "1.0.0",
                "dependencies": ["lodash"]
            },
            {
                "package_name": "test-package",
                "dependencies": ["lodash"]
            },
            {
                "package_name": "test-package",
                "version": "1.0.0"
            },
        ]
        
        for payload in export_payloads:
            result = await self._send_request(url, "POST", json=payload)
            results.append(result)
        
        return results
    
    async def _fuzz_get_export_endpoint(self, endpoint: str) -> List[FuzzResult]:
        """Fuzz get lazy export endpoint"""
        results = []
        url = f"{self.base_url}{endpoint}"
        
        # Package retrieval attacks
        get_attacks = [
            {},  # No parameters
            {"format": "json"},
            {"format": "xml"},
            {"format": "' OR 1=1 --"},
            {"format": "<script>alert('XSS')</script>"},
            {"include_metadata": "true"},
            {"include_metadata": "false"},
            {"include_metadata": "1"},
            {"include_metadata": "0"},
            {"include_metadata": "null"},
            {"include_metadata": "undefined"},
            {"include_metadata": "'; DROP TABLE exports; --"},
            {"include_dependencies": "true"},
            {"include_dependencies": "false"},
            {"include_dependencies": "1"},
            {"include_dependencies": "0"},
            {"include_dependencies": "null"},
            {"include_dependencies": "undefined"},
            {"include_dependencies": "'; DROP TABLE dependencies; --"},
        ]
        
        for params in get_attacks:
            result = await self._send_request(url, "GET", params=params)
            results.append(result)
        
        return results
    
    async def _fuzz_load_package_endpoint(self, endpoint: str) -> List[FuzzResult]:
        """Fuzz load package endpoint"""
        results = []
        url = f"{self.base_url}{endpoint}"
        
        # Package loading payloads
        load_payloads = [
            # Valid load request
            {
                "package_name": "test-package",
                "version": "1.0.0"
            },
            # Malicious package names
            {
                "package_name": "../../../etc/passwd",
                "version": "1.0.0"
            },
            {
                "package_name": "'; DROP TABLE packages; --",
                "version": "1.0.0"
            },
            {
                "package_name": "<script>alert('XSS')</script>",
                "version": "1.0.0"
            },
            {
                "package_name": "; ls -la",
                "version": "1.0.0"
            },
            # Malicious versions
            {
                "package_name": "test-package",
                "version": "../../../etc/passwd"
            },
            {
                "package_name": "test-package",
                "version": "'; DROP TABLE packages; --"
            },
            {
                "package_name": "test-package",
                "version": "<script>alert('XSS')</script>"
            },
            # Malformed inputs
            {
                "package_name": None,
                "version": "1.0.0"
            },
            {
                "package_name": "",
                "version": "1.0.0"
            },
            {
                "package_name": "test-package",
                "version": None
            },
            {
                "package_name": "test-package",
                "version": ""
            },
            # Missing required fields
            {
                "version": "1.0.0"
            },
            {
                "package_name": "test-package"
            },
            # Force loading options
            {
                "package_name": "test-package",
                "version": "1.0.0",
                "force": True
            },
            {
                "package_name": "test-package",
                "version": "1.0.0",
                "force": False
            },
            {
                "package_name": "test-package",
                "version": "1.0.0",
                "force": "true"
            },
            {
                "package_name": "test-package",
                "version": "1.0.0",
                "force": "false"
            },
            {
                "package_name": "test-package",
                "version": "1.0.0",
                "force": "' OR 1=1 --"
            },
        ]
        
        for payload in load_payloads:
            result = await self._send_request(url, "POST", json=payload)
            results.append(result)
        
        return results
    
    async def _fuzz_unload_package_endpoint(self, endpoint: str) -> List[FuzzResult]:
        """Fuzz unload package endpoint"""
        results = []
        url = f"{self.base_url}{endpoint}"
        
        # Package unloading attacks
        unload_attacks = [
            {},  # No parameters
            {"force": "true"},
            {"force": "false"},
            {"force": "1"},
            {"force": "0"},
            {"force": "null"},
            {"force": "undefined"},
            {"force": "' OR 1=1 --"},
            {"force": "<script>alert('XSS')</script>"},
            {"cleanup": "true"},
            {"cleanup": "false"},
            {"cleanup": "1"},
            {"cleanup": "0"},
            {"cleanup": "null"},
            {"cleanup": "undefined"},
            {"cleanup": "'; DROP TABLE packages; --"},
        ]
        
        for params in unload_attacks:
            result = await self._send_request(url, "DELETE", params=params)
            results.append(result)
        
        return results
    
    async def _fuzz_status_endpoint(self, endpoint: str) -> List[FuzzResult]:
        """Fuzz system status endpoint"""
        results = []
        url = f"{self.base_url}{endpoint}"
        
        # Status retrieval attacks
        status_attacks = [
            {},  # No parameters
            {"format": "json"},
            {"format": "xml"},
            {"format": "' OR 1=1 --"},
            {"format": "<script>alert('XSS')</script>"},
            {"include_metrics": "true"},
            {"include_metrics": "false"},
            {"include_metrics": "1"},
            {"include_metrics": "0"},
            {"include_metrics": "null"},
            {"include_metrics": "undefined"},
            {"include_metrics": "'; DROP TABLE status; --"},
            {"include_packages": "true"},
            {"include_packages": "false"},
            {"include_packages": "1"},
            {"include_packages": "0"},
            {"include_packages": "null"},
            {"include_packages": "undefined"},
            {"include_packages": "'; DROP TABLE packages; --"},
        ]
        
        for params in status_attacks:
            result = await self._send_request(url, "GET", params=params)
            results.append(result)
        
        return results
    
    async def _fuzz_package_info_endpoint(self, endpoint: str) -> List[FuzzResult]:
        """Fuzz package info endpoint"""
        results = []
        url = f"{self.base_url}{endpoint}"
        
        # Package info attacks
        info_attacks = [
            {},  # No parameters
            {"format": "json"},
            {"format": "xml"},
            {"format": "' OR 1=1 --"},
            {"format": "<script>alert('XSS')</script>"},
            {"include_dependencies": "true"},
            {"include_dependencies": "false"},
            {"include_dependencies": "1"},
            {"include_dependencies": "0"},
            {"include_dependencies": "null"},
            {"include_dependencies": "undefined"},
            {"include_dependencies": "'; DROP TABLE dependencies; --"},
            {"include_metadata": "true"},
            {"include_metadata": "false"},
            {"include_metadata": "1"},
            {"include_metadata": "0"},
            {"include_metadata": "null"},
            {"include_metadata": "undefined"},
            {"include_metadata": "'; DROP TABLE metadata; --"},
        ]
        
        for params in info_attacks:
            result = await self._send_request(url, "GET", params=params)
            results.append(result)
        
        return results
    
    async def _fuzz_all_packages_endpoint(self, endpoint: str) -> List[FuzzResult]:
        """Fuzz all packages endpoint"""
        results = []
        url = f"{self.base_url}{endpoint}"
        
        # All packages attacks
        packages_attacks = [
            {},  # No parameters
            {"format": "json"},
            {"format": "xml"},
            {"format": "' OR 1=1 --"},
            {"format": "<script>alert('XSS')</script>"},
            {"include_loaded": "true"},
            {"include_loaded": "false"},
            {"include_loaded": "1"},
            {"include_loaded": "0"},
            {"include_loaded": "null"},
            {"include_loaded": "undefined"},
            {"include_loaded": "'; DROP TABLE packages; --"},
            {"include_unloaded": "true"},
            {"include_unloaded": "false"},
            {"include_unloaded": "1"},
            {"include_unloaded": "0"},
            {"include_unloaded": "null"},
            {"include_unloaded": "undefined"},
            {"include_unloaded": "'; DROP TABLE packages; --"},
            {"filter": "loaded"},
            {"filter": "unloaded"},
            {"filter": "' OR 1=1 --"},
            {"filter": "<script>alert('XSS')</script>"},
        ]
        
        for params in packages_attacks:
            result = await self._send_request(url, "GET", params=params)
            results.append(result)
        
        return results
    
    async def _fuzz_config_get_endpoint(self, endpoint: str) -> List[FuzzResult]:
        """Fuzz configuration GET endpoint"""
        results = []
        url = f"{self.base_url}{endpoint}"
        
        # Configuration retrieval attacks
        config_attacks = [
            {},  # No parameters
            {"format": "json"},
            {"format": "xml"},
            {"format": "' OR 1=1 --"},
            {"format": "<script>alert('XSS')</script>"},
            {"include_secrets": "true"},
            {"include_secrets": "false"},
            {"include_secrets": "1"},
            {"include_secrets": "0"},
            {"include_secrets": "null"},
            {"include_secrets": "undefined"},
            {"include_secrets": "'; DROP TABLE config; --"},
            {"section": "general"},
            {"section": "packages"},
            {"section": "' OR 1=1 --"},
            {"section": "<script>alert('XSS')</script>"},
        ]
        
        for params in config_attacks:
            result = await self._send_request(url, "GET", params=params)
            results.append(result)
        
        return results
    
    async def _fuzz_config_put_endpoint(self, endpoint: str) -> List[FuzzResult]:
        """Fuzz configuration PUT endpoint"""
        results = []
        url = f"{self.base_url}{endpoint}"
        
        # Configuration manipulation payloads
        config_payloads = [
            # Valid configuration update
            {
                "max_packages": 100,
                "cache_size": 1000
            },
            # Malicious configuration values
            {
                "max_packages": "' OR 1=1 --",
                "cache_size": 1000
            },
            {
                "max_packages": 100,
                "cache_size": "<script>alert('XSS')</script>"
            },
            # Invalid configuration values
            {
                "max_packages": -1,  # Invalid negative value
                "cache_size": 1000
            },
            {
                "max_packages": 1000000,  # Excessive value
                "cache_size": 1000
            },
            {
                "max_packages": 100,
                "cache_size": -1  # Invalid negative value
            },
            {
                "max_packages": 100,
                "cache_size": 1000000  # Excessive value
            },
            # Malformed configuration
            {
                "max_packages": None,
                "cache_size": 1000
            },
            {
                "max_packages": 100,
                "cache_size": None
            },
            {
                "max_packages": "invalid",
                "cache_size": 1000
            },
            {
                "max_packages": 100,
                "cache_size": "invalid"
            },
            # Command injection in configuration
            {
                "max_packages": 100,
                "cache_size": 1000,
                "package_path": "; ls -la"
            },
            {
                "max_packages": 100,
                "cache_size": 1000,
                "package_path": "| whoami"
            },
            # Path traversal in configuration
            {
                "max_packages": 100,
                "cache_size": 1000,
                "package_path": "../../../etc/passwd"
            },
        ]
        
        for payload in config_payloads:
            result = await self._send_request(url, "PUT", json=payload)
            results.append(result)
        
        return results
    
    async def _fuzz_clear_registry_endpoint(self, endpoint: str) -> List[FuzzResult]:
        """Fuzz clear registry endpoint"""
        results = []
        url = f"{self.base_url}{endpoint}"
        
        # Registry clearing attacks
        clear_attacks = [
            {},  # No parameters
            {"confirm": "true"},
            {"confirm": "false"},
            {"confirm": "1"},
            {"confirm": "0"},
            {"confirm": "null"},
            {"confirm": "undefined"},
            {"confirm": "' OR 1=1 --"},
            {"confirm": "<script>alert('XSS')</script>"},
            {"force": "true"},
            {"force": "false"},
            {"force": "1"},
            {"force": "0"},
            {"force": "null"},
            {"force": "undefined"},
            {"force": "'; DROP TABLE registry; --"},
        ]
        
        for params in clear_attacks:
            result = await self._send_request(url, "DELETE", params=params)
            results.append(result)
        
        return results
    
    async def _fuzz_cleanup_endpoint(self, endpoint: str) -> List[FuzzResult]:
        """Fuzz cleanup endpoint"""
        results = []
        url = f"{self.base_url}{endpoint}"
        
        # Cleanup payloads
        cleanup_payloads = [
            {},  # No parameters
            {"force": True},
            {"force": False},
            {"force": "true"},
            {"force": "false"},
            {"force": "1"},
            {"force": "0"},
            {"force": "null"},
            {"force": "undefined"},
            {"force": "' OR 1=1 --"},
            {"force": "<script>alert('XSS')</script>"},
            {"cleanup_cache": True},
            {"cleanup_cache": False},
            {"cleanup_cache": "true"},
            {"cleanup_cache": "false"},
            {"cleanup_cache": "1"},
            {"cleanup_cache": "0"},
            {"cleanup_cache": "null"},
            {"cleanup_cache": "undefined"},
            {"cleanup_cache": "'; DROP TABLE cache; --"},
            {"cleanup_temp": True},
            {"cleanup_temp": False},
            {"cleanup_temp": "true"},
            {"cleanup_temp": "false"},
            {"cleanup_temp": "1"},
            {"cleanup_temp": "0"},
            {"cleanup_temp": "null"},
            {"cleanup_temp": "undefined"},
            {"cleanup_temp": "'; DROP TABLE temp; --"},
        ]
        
        for payload in cleanup_payloads:
            result = await self._send_request(url, "POST", json=payload)
            results.append(result)
        
        return results
    
async def main():
    """Main execution function for testing"""
    async with LazyLoadingFuzzer() as fuzzer:
        results = await fuzzer.fuzz_lazy_loading_endpoints()
        console.print(f"🐺 Lazy Loading fuzzing completed: {len(results)} requests made")

if __name__ == "__main__":
    asyncio.run(main())
