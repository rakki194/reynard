"""
🐺 Fuzzy V2 - The Modular Reynard Fuzzing Framework

*alpha wolf dominance radiates* The refactored fuzzing engine that leverages
the new modular architecture for maximum efficiency and maintainability.
This version eliminates code duplication while maintaining all the
specialized attack capabilities.
"""

import asyncio
from typing import List, Dict, Any, Optional
from rich.console import Console
from rich.panel import Panel
from rich.table import Table

from .core import (
    FuzzResult,
    WebSocketResult,
    MLFuzzResult,
    AuthBypassResult,
    BaseFuzzer,
    EndpointOrchestrator,
    create_endpoint_orchestrator
)
from .attacks import (
    GrammarFuzzer,
    WebSocketFuzzer,
    MLFuzzer,
    AuthBypassFuzzer,
    TraditionalFuzzer
)

console = Console()


class Fuzzy(BaseFuzzer):
    """
    🦊 Fuzzy - The Modular Reynard Fuzzing Framework
    
    *snarls with predatory intelligence* The modular fuzzing engine that
    leverages strategic architecture for maximum efficiency and
    maintainability. This version eliminates code duplication while
    maintaining all the specialized attack capabilities.
    
    Enhanced with:
    - Modular architecture with reusable composables
    - Endpoint orchestrator for coordinated attacks
    - Eliminated code duplication across fuzzers
    - Improved maintainability and extensibility
    - Strategic base classes with escape hatches
    
    The framework operates in multiple phases:
    1. **Traditional Fuzzing**: Standard HTTP endpoint coverage
    2. **Grammar-Based Fuzzing**: Syntactically valid malicious payloads
    3. **WebSocket Fuzzing**: Real-time communication attacks
    4. **ML Model Fuzzing**: AI/ML specific vulnerabilities
    5. **Authentication Bypass**: Advanced security bypass techniques
    6. **Endpoint Orchestration**: Coordinated specialized endpoint attacks
    
    Attributes:
        grammar_fuzzer (GrammarFuzzer): Grammar-based fuzzing engine
        websocket_fuzzer (WebSocketFuzzer): WebSocket fuzzing engine
        ml_fuzzer (MLFuzzer): ML model fuzzing engine
        auth_fuzzer (AuthBypassFuzzer): Authentication bypass fuzzer
        traditional_fuzzer (TraditionalFuzzer): Traditional HTTP fuzzer
        endpoint_orchestrator (EndpointOrchestrator): Endpoint coordination hub
        
    Example:
        >>> async with FuzzyV2() as fuzzer:
        ...     await fuzzer.fuzz_authentication_endpoints()
        ...     await fuzzer.fuzz_all_specialized_endpoints()
        ...     fuzzer.generate_fuzz_report()
    """
    
    def __init__(self, base_url: str = "http://localhost:8000", max_concurrent: int = 10):
        """
        Initialize the modular fuzzing framework.
        
        *whiskers twitch with intelligence* Sets up all specialized
        fuzzing engines and the endpoint orchestrator for coordinated attacks.
        
        Args:
            base_url (str): Base URL for fuzzing targets
            max_concurrent (int): Maximum concurrent requests
        """
        super().__init__(base_url, max_concurrent)
        
        # Initialize specialized fuzzing engines
        self.grammar_fuzzer = GrammarFuzzer(base_url, max_concurrent)
        self.websocket_fuzzer = WebSocketFuzzer(base_url.replace("http://", "ws://"), max_concurrent)
        self.ml_fuzzer = MLFuzzer(base_url, max_concurrent)
        self.auth_fuzzer = AuthBypassFuzzer(base_url, max_concurrent)
        self.traditional_fuzzer = TraditionalFuzzer(base_url, max_concurrent)
        
        # Initialize endpoint orchestrator for specialized endpoints
        self.endpoint_orchestrator = create_endpoint_orchestrator(base_url, max_concurrent)
        
        # Enhanced result tracking
        self.websocket_results: List[WebSocketResult] = []
        self.ml_results: List[MLFuzzResult] = []
        self.auth_bypass_results: List[AuthBypassResult] = []
        self.specialized_endpoint_results: Dict[str, List[FuzzResult]] = {}
    
    async def __aenter__(self):
        """Async context manager entry."""
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit with cleanup."""
        await super().__aexit__(exc_type, exc_val, exc_tb)
        # Cleanup specialized fuzzers
        await self.grammar_fuzzer.__aexit__(exc_type, exc_val, exc_tb)
        await self.websocket_fuzzer.__aexit__(exc_type, exc_val, exc_tb)
        await self.ml_fuzzer.__aexit__(exc_type, exc_val, exc_tb)
        await self.auth_fuzzer.__aexit__(exc_type, exc_val, exc_tb)
        await self.traditional_fuzzer.__aexit__(exc_type, exc_val, exc_tb)
    
    def _analyze_response(self, response, request_kwargs: dict):
        """
        Analyze response for vulnerabilities - delegates to specialized fuzzers.
        
        *fox intelligence coordination* This method coordinates vulnerability
        analysis across all specialized fuzzer types.
        """
        # Use common vulnerability detection from base class
        return self._detect_common_vulnerabilities(response.text)
    
    async def fuzz_endpoint(self, endpoint: str, method: str = "GET", 
                          payload_count: int = 100, **kwargs) -> List[FuzzResult]:
        """
        Fuzz endpoint using traditional fuzzing techniques.
        
        *snarls with predatory glee* Delegates to traditional fuzzer
        for comprehensive HTTP endpoint coverage.
        """
        return await self.traditional_fuzzer.fuzz_endpoint(endpoint, method, payload_count, **kwargs)
    
    async def fuzz_with_grammar(self, endpoint: str, method: str = "POST", 
                               payload_count: int = 50) -> List[FuzzResult]:
        """
        Fuzz endpoint using grammar-based techniques.
        
        *bares fangs with savage satisfaction* Uses grammar-based
        fuzzing with learning mutations for advanced payload generation.
        """
        self.print_fuzzing_header(
            f"GRAMMAR-BASED FUZZING: {method} {endpoint}",
            f"Generating {payload_count} syntactically valid but malicious payloads!"
        )
        
        results = await self.grammar_fuzzer.fuzz_endpoint(endpoint, method, payload_count)
        self.results.extend(results)
        return results
    
    async def fuzz_websocket_endpoint(self, endpoint: str, attack_types: Optional[List[str]] = None) -> List[WebSocketResult]:
        """
        Fuzz WebSocket endpoint with specialized attacks.
        
        *snarls with predatory glee* Performs WebSocket fuzzing
        with real-time communication attacks.
        """
        if attack_types is None:
            attack_types = ["message_injection", "frame_manipulation"]
        
        self.print_fuzzing_header(
            f"WEBSOCKET FUZZING: {endpoint}",
            f"Attacking with {len(attack_types)} specialized attack types!"
        )
        
        results = await self.websocket_fuzzer.fuzz_endpoint(endpoint, attack_types)
        self.websocket_results.extend(results)
        return results
    
    async def fuzz_ml_endpoint(self, endpoint: str, method: str = "POST", 
                             attack_types: Optional[List[str]] = None) -> List[MLFuzzResult]:
        """
        Fuzz ML model endpoint with specialized attacks.
        
        *snarls with predatory intelligence* Performs ML model
        fuzzing with AI-specific attack vectors.
        """
        if attack_types is None:
            attack_types = list(self.ml_fuzzer.ml_attack_vectors.keys())
        
        self.print_fuzzing_header(
            f"ML MODEL FUZZING: {method} {endpoint}",
            f"Attacking with {len(attack_types)} ML-specific attack types!"
        )
        
        results = await self.ml_fuzzer.fuzz_endpoint(endpoint, method, attack_types)
        self.ml_results.extend(results)
        return results
    
    async def fuzz_auth_bypass(self, endpoint: str, method: str = "POST", 
                             attack_types: Optional[List[str]] = None) -> List[AuthBypassResult]:
        """
        Fuzz authentication endpoint with bypass attacks.
        
        *snarls with predatory glee* Performs authentication
        bypass fuzzing with advanced security attack vectors.
        """
        if attack_types is None:
            attack_types = list(self.auth_fuzzer.auth_attack_vectors.keys())
        
        self.print_fuzzing_header(
            f"AUTH BYPASS FUZZING: {method} {endpoint}",
            f"Attacking with {len(attack_types)} advanced bypass techniques!"
        )
        
        results = await self.auth_fuzzer.fuzz_endpoint(endpoint, method, attack_types)
        self.auth_bypass_results.extend(results)
        return results
    
    async def fuzz_authentication_endpoints(self) -> List[FuzzResult]:
        """
        Fuzz authentication-related endpoints.
        
        *snarls with predatory intelligence* Targets authentication
        endpoints with comprehensive attack coverage.
        """
        self.print_fuzzing_header(
            "FUZZING AUTHENTICATION ENDPOINTS",
            "Time to break your login security!"
        )
        
        return await self.traditional_fuzzer.fuzz_authentication_endpoints()
    
    async def fuzz_file_endpoints(self) -> List[FuzzResult]:
        """
        Fuzz file-related endpoints.
        
        *bares fangs with savage satisfaction* Targets file
        endpoints with malicious file upload attempts.
        """
        self.print_fuzzing_header(
            "FUZZING FILE ENDPOINTS",
            "Let's break your file security!"
        )
        
        return await self.traditional_fuzzer.fuzz_file_endpoints()
    
    async def fuzz_all_specialized_endpoints(self) -> Dict[str, List[FuzzResult]]:
        """
        Fuzz all specialized endpoints using the endpoint orchestrator.
        
        *alpha wolf dominance radiates* Comprehensive fuzzing of
        all specialized endpoints with coordinated attacks using
        the new modular architecture.
        
        Returns:
            Dict[str, List[FuzzResult]]: Results organized by endpoint category
        """
        self.print_fuzzing_header(
            "FUZZING ALL SPECIALIZED ENDPOINTS",
            "Time to attack all the specialized surfaces with modular efficiency!"
        )
        
        # Use the endpoint orchestrator to coordinate all specialized fuzzing
        results = await self.endpoint_orchestrator.fuzz_all_categories()
        self.specialized_endpoint_results = results
        
        return results
    
    async def fuzz_specific_endpoint_category(self, category: str) -> List[FuzzResult]:
        """
        Fuzz a specific endpoint category.
        
        *fox precision hunting* Targets a specific endpoint category
        with specialized attacks.
        
        Args:
            category (str): Endpoint category to fuzz
            
        Returns:
            List[FuzzResult]: Results from fuzzing the category
        """
        self.print_fuzzing_header(
            f"FUZZING {category.upper()} ENDPOINTS",
            f"Targeted attack on {category} endpoints!"
        )
        
        results = await self.endpoint_orchestrator.fuzz_endpoint_category(category)
        self.specialized_endpoint_results[category] = results
        
        return results
    
    def generate_fuzz_report(self) -> None:
        """
        Generate a comprehensive fuzzing report.
        
        *alpha wolf dominance radiates* Creates detailed report
        with vulnerability analysis and security recommendations.
        """
        console.print("\n[bold red]🎯 COMPREHENSIVE FUZZING REPORT V2[/bold red]")
        
        # Get base fuzzer results summary
        base_summary = self.get_results_summary()
        
        if base_summary["total_requests"] == 0:
            console.print("[yellow]No fuzzing results to report.[/yellow]")
            return
        
        # Summary statistics
        total_requests = base_summary["total_requests"]
        successful_requests = base_summary["successful_requests"]
        vulnerabilities_found = base_summary["vulnerabilities_found"]
        errors = base_summary["errors"]
        
        # Summary table
        table = Table(title="🐺 Fuzzing Summary V2")
        table.add_column("Metric", style="cyan")
        table.add_column("Count", style="green")
        table.add_column("Percentage", style="yellow")
        
        table.add_row("Total Requests", str(total_requests), "100%")
        table.add_row("Successful Requests", str(successful_requests), f"{(successful_requests/total_requests)*100:.1f}%")
        table.add_row("Vulnerabilities Found", str(vulnerabilities_found), f"{(vulnerabilities_found/total_requests)*100:.1f}%")
        table.add_row("Errors", str(errors), f"{(errors/total_requests)*100:.1f}%")
        
        console.print(table)
        
        # Specialized endpoint results
        if self.specialized_endpoint_results:
            console.print("\n[bold cyan]Specialized Endpoint Results:[/bold cyan]")
            for category, results in self.specialized_endpoint_results.items():
                if results:
                    vulnerabilities = [r for r in results if r.vulnerability_detected]
                    console.print(f"  {category}: {len(vulnerabilities)} vulnerabilities found in {len(results)} requests")
        
        # Vulnerability breakdown
        if base_summary["vulnerability_types"]:
            vuln_table = Table(title="🚨 Vulnerabilities Found")
            vuln_table.add_column("Type", style="red")
            vuln_table.add_column("Count", style="yellow")
            
            for vuln_type, count in base_summary["vulnerability_types"].items():
                vuln_table.add_row(vuln_type, str(count))
            
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
            "[bold red]🛡️ SECURITY RECOMMENDATIONS V2[/bold red]\n"
            "Based on comprehensive fuzzing results with modular architecture:\n\n"
            "• Implement comprehensive input validation across all endpoints\n"
            "• Use parameterized queries for database operations\n"
            "• Sanitize all user inputs before processing\n"
            "• Implement proper error handling without information disclosure\n"
            "• Add rate limiting to prevent abuse\n"
            "• Use Content Security Policy (CSP) headers\n"
            "• Implement proper file upload validation\n"
            "• Add request size limits\n"
            "• Use HTTPS in production\n"
            "• Implement proper authentication and authorization\n"
            "• Regular security testing with modular fuzzing frameworks\n"
            "• Monitor for unusual patterns and behaviors\n"
            "• Leverage composable security testing approaches",
            border_style="red"
        ))


async def main():
    """
    Main execution function for the modular fuzzing framework.
    
    *snarls with predatory intelligence* Orchestrates all fuzzing
    engines in a coordinated attack against the target system using
    the new modular architecture.
    
    This function demonstrates the complete modular fuzzing workflow:
    1. Traditional HTTP fuzzing for standard endpoints
    2. Grammar-based fuzzing with learning mutations
    3. WebSocket fuzzing for real-time communication
    4. ML model fuzzing for AI-specific vulnerabilities
    5. Authentication bypass fuzzing for security testing
    6. Specialized endpoint fuzzing with orchestrator
    7. Comprehensive vulnerability reporting
    """
    async with Fuzzy() as fuzzer:
        console.print(Panel.fit(
            "[bold red]🐺 COMPREHENSIVE FUZZING FRAMEWORK V2[/bold red]\n"
            "*alpha wolf dominance radiates*\n"
            "The modular fuzzing engine with advanced attack vectors!",
            border_style="red"
        ))
        
        # 1. Traditional fuzzing
        console.print("\n[bold blue]Phase 1: Traditional Fuzzing[/bold blue]")
        await fuzzer.fuzz_authentication_endpoints()
        await fuzzer.fuzz_file_endpoints()
        
        # 2. Grammar-based fuzzing
        console.print("\n[bold blue]Phase 2: Grammar-Based Fuzzing[/bold blue]")
        await fuzzer.fuzz_with_grammar("/api/auth/login", "POST", 25)
        await fuzzer.fuzz_with_grammar("/api/rag/query", "POST", 25)
        
        # 3. WebSocket fuzzing
        console.print("\n[bold blue]Phase 3: WebSocket Fuzzing[/bold blue]")
        await fuzzer.fuzz_websocket_endpoint("/api/embedding-visualization/progress", ["message_injection", "frame_manipulation"])
        
        # 4. ML model fuzzing
        console.print("\n[bold blue]Phase 4: ML Model Fuzzing[/bold blue]")
        await fuzzer.fuzz_ml_endpoint("/api/embedding-visualization/reduce", "POST", ["parameter_manipulation", "adversarial_inputs"])
        await fuzzer.fuzz_ml_endpoint("/api/diffusion/generate", "POST", ["parameter_manipulation", "resource_exhaustion"])
        
        # 5. Authentication bypass fuzzing
        console.print("\n[bold blue]Phase 5: Authentication Bypass Fuzzing[/bold blue]")
        await fuzzer.fuzz_auth_bypass("/api/auth/login", "POST", ["jwt_algorithm_confusion", "jwt_payload_manipulation"])
        await fuzzer.fuzz_auth_bypass("/api/secure/auth/login", "POST", ["session_hijacking"])
        
        # 6. Specialized endpoint fuzzing with orchestrator
        console.print("\n[bold blue]Phase 6: Specialized Endpoint Fuzzing (Modular)[/bold blue]")
        specialized_results = await fuzzer.fuzz_all_specialized_endpoints()
        
        # Generate comprehensive report
        fuzzer.generate_fuzz_report()
        
        # Show specialized endpoint results
        console.print("\n[bold red]🎯 SPECIALIZED ENDPOINT RESULTS[/bold red]")
        for category, results in specialized_results.items():
            if results:
                vulnerabilities = [r for r in results if r.vulnerability_detected]
                console.print(f"[yellow]{category}: {len(vulnerabilities)} vulnerabilities found in {len(results)} requests[/yellow]")
        
        console.print(Panel.fit(
            "[bold green]🐺 MODULAR FUZZING COMPLETE![/bold green]\n"
            "*howls with predatory satisfaction*\n"
            "All attack vectors deployed with modular efficiency!",
            border_style="green"
        ))


# Export the main fuzzing components for external use
__all__ = [
    "Fuzzy",
    "main"
]

if __name__ == "__main__":
    asyncio.run(main())
