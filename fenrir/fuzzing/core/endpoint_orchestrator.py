"""
🦊 Endpoint Orchestrator - Strategic Coordination

*whiskers twitch with cunning intelligence* The orchestrator that coordinates
all specialized endpoint fuzzers into a unified attack strategy. This is the
fox's command center where all the specialized hunters are coordinated.
"""

from typing import Any

from rich.console import Console
from rich.panel import Panel

from .base_fuzzer import BaseFuzzer
from .results import FuzzResult

console = Console()


class EndpointOrchestrator:
    """
    🦊 Endpoint Orchestrator - Strategic Coordination Hub

    *red fur gleams with intelligence* This orchestrator coordinates all
    specialized endpoint fuzzers into a unified attack strategy. Like a
    fox pack leader, it coordinates multiple specialized hunters to
    achieve maximum coverage and effectiveness.

    Attributes:
        base_url (str): Base URL for fuzzing targets
        max_concurrent (int): Maximum concurrent requests
        fuzzer_registry (Dict[str, Type[BaseFuzzer]]): Registry of available fuzzers

    Example:
        >>> orchestrator = EndpointOrchestrator()
        >>> await orchestrator.register_fuzzer("embedding", EmbeddingVisualizationFuzzer)
        >>> results = await orchestrator.fuzz_endpoint_category("embedding")
    """

    def __init__(
        self, base_url: str = "http://localhost:8000", max_concurrent: int = 10
    ):
        """
        Initialize the endpoint orchestrator.

        *fox leadership emerges* Sets up the coordination hub for
        all specialized fuzzing operations.

        Args:
            base_url (str): Base URL for fuzzing targets
            max_concurrent (int): Maximum concurrent requests
        """
        self.base_url = base_url
        self.max_concurrent = max_concurrent
        self.fuzzer_registry: dict[str, type[BaseFuzzer]] = {}
        self.results: dict[str, list[FuzzResult]] = {}

    def register_fuzzer(self, category: str, fuzzer_class: type[BaseFuzzer]):
        """
        Register a specialized fuzzer for a specific category.

        *fox pack coordination* Registers a specialized fuzzer that
        can be used for fuzzing specific endpoint categories.

        Args:
            category (str): Category name for the fuzzer
            fuzzer_class (Type[BaseFuzzer]): Fuzzer class to register
        """
        self.fuzzer_registry[category] = fuzzer_class
        console.print(f"🦊 Registered {category} fuzzer: {fuzzer_class.__name__}")

    async def fuzz_endpoint_category(self, category: str, **kwargs) -> list[FuzzResult]:
        """
        Fuzz all endpoints in a specific category.

        *fox pack hunting* Coordinates fuzzing of all endpoints in
        a specific category using the registered specialized fuzzer.

        Args:
            category (str): Category to fuzz
            **kwargs: Additional parameters for the fuzzer

        Returns:
            List[FuzzResult]: Results from fuzzing the category
        """
        if category not in self.fuzzer_registry:
            console.print(
                f"[red]❌ No fuzzer registered for category: {category}[/red]"
            )
            return []

        fuzzer_class = self.fuzzer_registry[category]
        console.print(f"🔍 Fuzzing {category} endpoints with {fuzzer_class.__name__}")

        async with fuzzer_class(self.base_url, self.max_concurrent) as fuzzer:
            # Get the main fuzzing method from the fuzzer
            fuzz_method = getattr(fuzzer, f"fuzz_{category}_endpoints", None)
            if not fuzz_method:
                console.print(
                    f"[red]❌ No fuzz_{category}_endpoints method found in {fuzzer_class.__name__}[/red]"
                )
                return []

            results = await fuzz_method(**kwargs)
            self.results[category] = results
            return results

    async def fuzz_all_categories(
        self, categories: list[str] | None = None, **kwargs
    ) -> dict[str, list[FuzzResult]]:
        """
        Fuzz all registered endpoint categories.

        *fox pack coordination* Coordinates fuzzing of all registered
        endpoint categories in a systematic manner.

        Args:
            categories (Optional[List[str]]): Specific categories to fuzz, or None for all
            **kwargs: Additional parameters for the fuzzers

        Returns:
            Dict[str, List[FuzzResult]]: Results organized by category
        """
        if categories is None:
            categories = list(self.fuzzer_registry.keys())

        console.print(
            Panel.fit(
                "[bold red]🐺 COORDINATED ENDPOINT FUZZING[/bold red]\n"
                "*alpha wolf dominance radiates* Coordinating all specialized fuzzers!",
                border_style="red",
            )
        )

        all_results = {}

        for category in categories:
            if category in self.fuzzer_registry:
                console.print(f"🔍 Fuzzing {category} category...")
                results = await self.fuzz_endpoint_category(category, **kwargs)
                all_results[category] = results

                vulnerabilities = [r for r in results if r.vulnerability_detected]
                console.print(
                    f"   ✅ {category}: {len(vulnerabilities)} vulnerabilities found"
                )
            else:
                console.print(
                    f"[yellow]⚠️  No fuzzer registered for category: {category}[/yellow]"
                )

        return all_results

    def get_results_summary(self) -> dict[str, Any]:
        """
        Get a comprehensive summary of all fuzzing results.

        *fox analytical mind* Provides comprehensive analysis of
        all collected fuzzing results across all categories.

        Returns:
            Dict[str, Any]: Comprehensive summary statistics
        """
        if not self.results:
            return {
                "total_categories": 0,
                "total_requests": 0,
                "total_vulnerabilities": 0,
            }

        total_categories = len(self.results)
        total_requests = sum(len(results) for results in self.results.values())
        total_vulnerabilities = sum(
            len([r for r in results if r.vulnerability_detected])
            for results in self.results.values()
        )

        # Category breakdown
        category_breakdown = {}
        for category, results in self.results.items():
            vulnerabilities = [r for r in results if r.vulnerability_detected]
            category_breakdown[category] = {
                "total_requests": len(results),
                "vulnerabilities_found": len(vulnerabilities),
                "vulnerability_rate": (
                    (len(vulnerabilities) / len(results)) * 100 if results else 0
                ),
            }

        # Vulnerability type breakdown
        vuln_types = {}
        for results in self.results.values():
            for result in results:
                if result.vulnerability_detected and result.vulnerability_type:
                    if result.vulnerability_type not in vuln_types:
                        vuln_types[result.vulnerability_type] = 0
                    vuln_types[result.vulnerability_type] += 1

        return {
            "total_categories": total_categories,
            "total_requests": total_requests,
            "total_vulnerabilities": total_vulnerabilities,
            "overall_vulnerability_rate": (
                (total_vulnerabilities / total_requests) * 100
                if total_requests > 0
                else 0
            ),
            "category_breakdown": category_breakdown,
            "vulnerability_types": vuln_types,
        }

    def print_comprehensive_report(self):
        """
        Print a comprehensive fuzzing report.

        *fox presentation skills* Provides a detailed, professional
        report of all fuzzing results across all categories.
        """
        summary = self.get_results_summary()

        console.print("\n[bold red]🎯 COMPREHENSIVE ENDPOINT FUZZING REPORT[/bold red]")

        if summary["total_requests"] == 0:
            console.print("[yellow]No fuzzing results to report.[/yellow]")
            return

        # Overall summary
        console.print("\n[bold cyan]Overall Summary:[/bold cyan]")
        console.print(f"  Categories Fuzzed: {summary['total_categories']}")
        console.print(f"  Total Requests: {summary['total_requests']}")
        console.print(f"  Vulnerabilities Found: {summary['total_vulnerabilities']}")
        console.print(
            f"  Overall Vulnerability Rate: {summary['overall_vulnerability_rate']:.1f}%"
        )

        # Category breakdown
        if summary["category_breakdown"]:
            console.print("\n[bold cyan]Category Breakdown:[/bold cyan]")
            for category, data in summary["category_breakdown"].items():
                console.print(f"  {category}:")
                console.print(f"    Requests: {data['total_requests']}")
                console.print(f"    Vulnerabilities: {data['vulnerabilities_found']}")
                console.print(f"    Rate: {data['vulnerability_rate']:.1f}%")

        # Vulnerability types
        if summary["vulnerability_types"]:
            console.print("\n[bold cyan]Vulnerability Types:[/bold cyan]")
            for vuln_type, count in summary["vulnerability_types"].items():
                console.print(f"  {vuln_type}: {count}")

        # Recommendations
        console.print(
            Panel.fit(
                "[bold red]🛡️ SECURITY RECOMMENDATIONS[/bold red]\n"
                "Based on comprehensive fuzzing results:\n\n"
                "• Implement comprehensive input validation across all endpoints\n"
                "• Use parameterized queries for all database operations\n"
                "• Sanitize all user inputs before processing\n"
                "• Implement proper error handling without information disclosure\n"
                "• Add rate limiting to prevent abuse\n"
                "• Use Content Security Policy (CSP) headers\n"
                "• Implement proper file upload validation\n"
                "• Add request size limits\n"
                "• Use HTTPS in production\n"
                "• Implement proper authentication and authorization\n"
                "• Regular security testing and code reviews\n"
                "• Monitor for unusual patterns and behaviors",
                border_style="red",
            )
        )


# Pre-configured endpoint categories for easy setup
ENDPOINT_CATEGORIES = {
    "embedding_visualization": "Embedding Visualization endpoints",
    "diffusion": "Diffusion model endpoints",
    "lazy_loading": "Lazy loading endpoints",
    "hf_cache": "HuggingFace cache endpoints",
    "secure_auth": "Secure authentication endpoints",
    "secure_ollama": "Secure Ollama endpoints",
    "secure_summarization": "Secure summarization endpoints",
    "websocket": "WebSocket endpoints",
}


def create_endpoint_orchestrator(
    base_url: str = "http://localhost:8000", max_concurrent: int = 10
) -> EndpointOrchestrator:
    """
    Create a pre-configured endpoint orchestrator.

    *fox factory method* Creates an endpoint orchestrator with
    all the standard endpoint categories pre-registered.

    Args:
        base_url (str): Base URL for fuzzing targets
        max_concurrent (int): Maximum concurrent requests

    Returns:
        EndpointOrchestrator: Pre-configured orchestrator
    """
    orchestrator = EndpointOrchestrator(base_url, max_concurrent)

    # Register all specialized fuzzers
    try:
        from ..endpoints.embedding_visualization_fuzzer import (
            EmbeddingVisualizationFuzzer,
        )

        orchestrator.register_fuzzer(
            "embedding_visualization", EmbeddingVisualizationFuzzer
        )
    except ImportError:
        console.print("[yellow]⚠️  EmbeddingVisualizationFuzzer not available[/yellow]")

    try:
        from ..endpoints.diffusion_fuzzer import DiffusionFuzzer

        orchestrator.register_fuzzer("diffusion", DiffusionFuzzer)
    except ImportError:
        console.print("[yellow]⚠️  DiffusionFuzzer not available[/yellow]")

    try:
        from ..endpoints.lazy_loading_fuzzer import LazyLoadingFuzzer

        orchestrator.register_fuzzer("lazy_loading", LazyLoadingFuzzer)
    except ImportError:
        console.print("[yellow]⚠️  LazyLoadingFuzzer not available[/yellow]")

    try:
        from ..endpoints.hf_cache_fuzzer import HFCacheFuzzer

        orchestrator.register_fuzzer("hf_cache", HFCacheFuzzer)
    except ImportError:
        console.print("[yellow]⚠️  HFCacheFuzzer not available[/yellow]")

    try:
        from ..endpoints.secure_auth_fuzzer import SecureAuthFuzzer

        orchestrator.register_fuzzer("secure_auth", SecureAuthFuzzer)
    except ImportError:
        console.print("[yellow]⚠️  SecureAuthFuzzer not available[/yellow]")

    try:
        from ..endpoints.secure_ollama_fuzzer import SecureOllamaFuzzer

        orchestrator.register_fuzzer("secure_ollama", SecureOllamaFuzzer)
    except ImportError:
        console.print("[yellow]⚠️  SecureOllamaFuzzer not available[/yellow]")

    try:
        from ..endpoints.secure_summarization_fuzzer import SecureSummarizationFuzzer

        orchestrator.register_fuzzer("secure_summarization", SecureSummarizationFuzzer)
    except ImportError:
        console.print("[yellow]⚠️  SecureSummarizationFuzzer not available[/yellow]")

    try:
        from ..endpoints.websocket_fuzzer import WebSocketFuzzer

        orchestrator.register_fuzzer("websocket", WebSocketFuzzer)
    except ImportError:
        console.print("[yellow]⚠️  WebSocketFuzzer not available[/yellow]")

    return orchestrator
