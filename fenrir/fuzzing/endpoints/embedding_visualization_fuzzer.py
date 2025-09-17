"""
🦊 Embedding Visualization Fuzzer V2 - Modular Approach

*whiskers twitch with cunning intelligence* Refactored embedding visualization
fuzzer using the new modular architecture. This demonstrates how the new
base classes and composables eliminate code duplication while maintaining
specialized attack vectors.
"""

import asyncio

from rich.console import Console

from ..core.base_fuzzer import BaseFuzzer
from ..core.payload_composables import PayloadComposables
from ..core.results import FuzzResult

console = Console()


class EmbeddingVisualizationFuzzer(BaseFuzzer):
    """
    🦊 Embedding Visualization Fuzzer - Modular & Efficient

    *red fur gleams with intelligence* Modular fuzzer that leverages
    the strategic architecture. Eliminates code duplication while
    maintaining specialized ML-specific attack vectors.

    This fuzzer demonstrates the power of the base classes and
    composables in creating clean, maintainable, and effective fuzzing code.
    """

    def __init__(
        self, base_url: str = "http://localhost:8000", max_concurrent: int = 10
    ):
        """
        Initialize the modular embedding visualization fuzzer.

        *fox efficiency at work* Uses the base fuzzer for all common
        functionality while maintaining specialized ML attack capabilities.
        """
        super().__init__(base_url, max_concurrent)
        self.payload_composables = PayloadComposables()

    def _analyze_response(
        self, response, request_kwargs: dict
    ) -> tuple[bool, str | None]:
        """
        Analyze response for ML-specific vulnerabilities.

        *fox ML hunting instincts* Provides specialized analysis for
        ML model vulnerabilities and embedding-specific attack vectors.
        """
        response_text = response.text.lower()

        # Use common vulnerability detection first
        vuln_detected, vuln_type = self._detect_common_vulnerabilities(response_text)
        if vuln_detected:
            return vuln_detected, vuln_type

        # ML-specific vulnerability detection
        if response.status_code == 200:
            # Check for ML information disclosure
            if any(
                indicator in response_text
                for indicator in [
                    "model_path",
                    "internal_error",
                    "stack_trace",
                    "embedding_dimension",
                    "model_weights",
                    "training_data",
                    "hyperparameters",
                ]
            ):
                return True, "ML Information Disclosure"

            # Check for successful parameter manipulation
            if "json" in request_kwargs:
                payload = request_kwargs["json"]
                if isinstance(payload, dict):
                    # Check if malicious parameters were processed
                    if any(
                        key in payload for key in ["method", "n_components", "metrics"]
                    ):
                        if any(
                            malicious in str(payload).lower()
                            for malicious in [
                                "'; drop table",
                                "<script>",
                                "../../../",
                                "; ls",
                            ]
                        ):
                            if any(
                                success in response_text
                                for success in [
                                    "processed",
                                    "accepted",
                                    "success",
                                    "completed",
                                ]
                            ):
                                return True, "ML Parameter Injection"

        # Check for ML resource exhaustion
        if response.status_code == 500:
            if any(
                indicator in response_text
                for indicator in [
                    "memory",
                    "timeout",
                    "resource",
                    "exhausted",
                    "out of memory",
                    "computation",
                    "dimensionality",
                    "embedding",
                ]
            ):
                return True, "ML Resource Exhaustion"

        return False, None

    async def fuzz_embedding_visualization_endpoints(self) -> list[FuzzResult]:
        """
        Fuzz all embedding visualization endpoints with specialized attacks.

        *fox pack coordination* Uses the modular approach to efficiently
        fuzz all embedding visualization endpoints with minimal code duplication.
        """
        self.print_fuzzing_header(
            "FUZZING EMBEDDING VISUALIZATION ENDPOINTS",
            "Time to break your ML model security with modular efficiency!",
        )

        results = []

        # Define endpoints with their specialized fuzzing methods
        endpoints = [
            ("/api/embedding-visualization/stats", "GET", self._fuzz_stats_endpoint),
            (
                "/api/embedding-visualization/methods",
                "GET",
                self._fuzz_methods_endpoint,
            ),
            ("/api/embedding-visualization/reduce", "POST", self._fuzz_reduce_endpoint),
            (
                "/api/embedding-visualization/quality",
                "POST",
                self._fuzz_quality_endpoint,
            ),
            (
                "/api/embedding-visualization/cache/stats",
                "GET",
                self._fuzz_cache_stats_endpoint,
            ),
            (
                "/api/embedding-visualization/cache",
                "DELETE",
                self._fuzz_cache_clear_endpoint,
            ),
            ("/api/embedding-visualization/health", "GET", self._fuzz_health_endpoint),
        ]

        for endpoint, method, fuzz_func in endpoints:
            self.print_endpoint_progress(method, endpoint)
            endpoint_results = await fuzz_func(endpoint)
            results.extend(endpoint_results)

        return results

    async def _fuzz_stats_endpoint(self, endpoint: str) -> list[FuzzResult]:
        """Fuzz embedding statistics endpoint using composables."""
        url = f"{self.base_url}{endpoint}"
        results = []

        # Use composables for common parameter attacks
        format_payloads = self.payload_composables.get_format_parameter_variations()
        boolean_payloads = self.payload_composables.get_boolean_parameter_variations()

        # Combine common attacks with ML-specific parameters
        param_attacks = []

        # Format-based attacks
        for format_payload in format_payloads.payloads:
            param_attacks.append(format_payload)

        # Boolean parameter attacks with ML-specific field names
        for boolean_payload in boolean_payloads.payloads:
            param_attacks.append({"include_metadata": boolean_payload["value"]})

        # ML-specific parameter attacks
        ml_specific_attacks = [
            {"include_embeddings": "true"},
            {"include_embeddings": "false"},
            {"include_dimensions": "true"},
            {"include_dimensions": "false"},
            {"include_quality_metrics": "true"},
            {"include_quality_metrics": "false"},
        ]
        param_attacks.extend(ml_specific_attacks)

        for params in param_attacks:
            result = await self._send_request(url, "GET", params=params)
            results.append(result)

        return results

    async def _fuzz_methods_endpoint(self, endpoint: str) -> list[FuzzResult]:
        """Fuzz available reduction methods endpoint using composables."""
        url = f"{self.base_url}{endpoint}"
        results = []

        # Use composables for common attacks
        format_payloads = self.payload_composables.get_format_parameter_variations()
        boolean_payloads = self.payload_composables.get_boolean_parameter_variations()

        param_attacks = []

        # Format-based attacks
        for format_payload in format_payloads.payloads:
            param_attacks.append(format_payload)

        # Boolean parameter attacks with ML-specific field names
        for boolean_payload in boolean_payloads.payloads:
            param_attacks.append({"supported": boolean_payload["value"]})

        # ML-specific parameter attacks
        ml_specific_attacks = [
            {"type": "all"},
            {"type": "linear"},
            {"type": "nonlinear"},
            {"category": "dimensionality"},
            {"category": "manifold"},
            {"include_parameters": "true"},
            {"include_parameters": "false"},
        ]
        param_attacks.extend(ml_specific_attacks)

        for params in param_attacks:
            result = await self._send_request(url, "GET", params=params)
            results.append(result)

        return results

    async def _fuzz_reduce_endpoint(self, endpoint: str) -> list[FuzzResult]:
        """Fuzz dimensionality reduction endpoint with ML-specific attacks."""
        url = f"{self.base_url}{endpoint}"
        results = []

        # ML-specific payloads for dimensionality reduction
        ml_payloads = [
            # Valid but malicious embeddings
            {
                "embeddings": [[1.0, 2.0, 3.0], [4.0, 5.0, 6.0]],
                "method": "pca",
                "n_components": 2,
            },
            # Parameter manipulation attacks
            {
                "embeddings": [[1.0, 2.0, 3.0], [4.0, 5.0, 6.0]],
                "method": "pca",
                "n_components": -1,  # Invalid negative components
            },
            {
                "embeddings": [[1.0, 2.0, 3.0], [4.0, 5.0, 6.0]],
                "method": "pca",
                "n_components": 1000,  # Excessive components
            },
            # Use composables for injection attacks
            {
                "embeddings": [[1.0, 2.0, 3.0], [4.0, 5.0, 6.0]],
                "method": self.payload_composables.get_sql_injection_payloads().payloads[
                    0
                ],
                "n_components": 2,
            },
            {
                "embeddings": [[1.0, 2.0, 3.0], [4.0, 5.0, 6.0]],
                "method": self.payload_composables.get_xss_payloads().payloads[0],
                "n_components": 2,
            },
            # Malformed embeddings
            {"embeddings": "not_an_array", "method": "pca", "n_components": 2},
            {"embeddings": None, "method": "pca", "n_components": 2},
            {"embeddings": [], "method": "pca", "n_components": 2},
            # Oversized embeddings for resource exhaustion
            {
                "embeddings": [[1.0] * 10000 for _ in range(1000)],  # Large embeddings
                "method": "pca",
                "n_components": 2,
            },
            # Use composables for path traversal and command injection
            {
                "embeddings": [[1.0, 2.0, 3.0], [4.0, 5.0, 6.0]],
                "method": self.payload_composables.get_path_traversal_payloads().payloads[
                    0
                ],
                "n_components": 2,
            },
            {
                "embeddings": [[1.0, 2.0, 3.0], [4.0, 5.0, 6.0]],
                "method": self.payload_composables.get_command_injection_payloads().payloads[
                    0
                ],
                "n_components": 2,
            },
            # Missing required fields
            {"method": "pca", "n_components": 2},
            {"embeddings": [[1.0, 2.0, 3.0], [4.0, 5.0, 6.0]], "n_components": 2},
            {"embeddings": [[1.0, 2.0, 3.0], [4.0, 5.0, 6.0]], "method": "pca"},
        ]

        for payload in ml_payloads:
            result = await self._send_request(url, "POST", json=payload)
            results.append(result)

        return results

    async def _fuzz_quality_endpoint(self, endpoint: str) -> list[FuzzResult]:
        """Fuzz embedding quality analysis endpoint using composables."""
        url = f"{self.base_url}{endpoint}"
        results = []

        # Quality analysis payloads with composable integration
        quality_payloads = [
            # Valid quality analysis
            {
                "embeddings": [[1.0, 2.0, 3.0], [4.0, 5.0, 6.0]],
                "metrics": ["silhouette", "calinski_harabasz"],
            },
            # Use composables for injection attacks
            {
                "embeddings": [[1.0, 2.0, 3.0], [4.0, 5.0, 6.0]],
                "metrics": [
                    "silhouette",
                    "calinski_harabasz",
                    self.payload_composables.get_sql_injection_payloads().payloads[0],
                ],
            },
            {
                "embeddings": [[1.0, 2.0, 3.0], [4.0, 5.0, 6.0]],
                "metrics": [self.payload_composables.get_xss_payloads().payloads[0]],
            },
            # Malformed embeddings
            {"embeddings": "invalid", "metrics": ["silhouette"]},
            {"embeddings": None, "metrics": ["silhouette"]},
            # Oversized embeddings
            {
                "embeddings": [[1.0] * 10000 for _ in range(1000)],
                "metrics": ["silhouette"],
            },
            # Use composables for path traversal and command injection
            {
                "embeddings": [[1.0, 2.0, 3.0], [4.0, 5.0, 6.0]],
                "metrics": [
                    self.payload_composables.get_path_traversal_payloads().payloads[0]
                ],
            },
            {
                "embeddings": [[1.0, 2.0, 3.0], [4.0, 5.0, 6.0]],
                "metrics": [
                    self.payload_composables.get_command_injection_payloads().payloads[
                        0
                    ]
                ],
            },
            # Missing fields
            {"metrics": ["silhouette"]},
            {"embeddings": [[1.0, 2.0, 3.0], [4.0, 5.0, 6.0]]},
        ]

        for payload in quality_payloads:
            result = await self._send_request(url, "POST", json=payload)
            results.append(result)

        return results

    async def _fuzz_cache_stats_endpoint(self, endpoint: str) -> list[FuzzResult]:
        """Fuzz cache statistics endpoint using composables."""
        url = f"{self.base_url}{endpoint}"
        results = []

        # Use composables for common parameter attacks
        format_payloads = self.payload_composables.get_format_parameter_variations()
        boolean_payloads = self.payload_composables.get_boolean_parameter_variations()

        param_attacks = []

        # Format-based attacks
        for format_payload in format_payloads.payloads:
            param_attacks.append(format_payload)

        # Boolean parameter attacks with cache-specific field names
        for boolean_payload in boolean_payloads.payloads:
            param_attacks.append({"include_details": boolean_payload["value"]})

        for params in param_attacks:
            result = await self._send_request(url, "GET", params=params)
            results.append(result)

        return results

    async def _fuzz_cache_clear_endpoint(self, endpoint: str) -> list[FuzzResult]:
        """Fuzz cache clear endpoint using composables."""
        url = f"{self.base_url}{endpoint}"
        results = []

        # Use composables for boolean parameter attacks
        boolean_payloads = self.payload_composables.get_boolean_parameter_variations()

        param_attacks = [{}]  # No parameters

        # Boolean parameter attacks with cache-specific field names
        for boolean_payload in boolean_payloads.payloads:
            param_attacks.append({"confirm": boolean_payload["value"]})
            param_attacks.append({"force": boolean_payload["value"]})

        for params in param_attacks:
            result = await self._send_request(url, "DELETE", params=params)
            results.append(result)

        return results

    async def _fuzz_health_endpoint(self, endpoint: str) -> list[FuzzResult]:
        """Fuzz health check endpoint using composables."""
        url = f"{self.base_url}{endpoint}"
        results = []

        # Use composables for boolean parameter attacks
        boolean_payloads = self.payload_composables.get_boolean_parameter_variations()

        param_attacks = [{}]  # No parameters

        # Boolean parameter attacks with health-specific field names
        for boolean_payload in boolean_payloads.payloads:
            param_attacks.append({"detailed": boolean_payload["value"]})
            param_attacks.append({"include_metrics": boolean_payload["value"]})

        for params in param_attacks:
            result = await self._send_request(url, "GET", params=params)
            results.append(result)

        return results


async def main():
    """Main execution function for testing the modular approach."""
    async with EmbeddingVisualizationFuzzer() as fuzzer:
        results = await fuzzer.fuzz_embedding_visualization_endpoints()

        # Get summary using base class functionality
        summary = fuzzer.get_results_summary()

        console.print("🐺 Embedding Visualization V2 fuzzing completed:")
        console.print(f"   Total requests: {summary['total_requests']}")
        console.print(f"   Vulnerabilities found: {summary['vulnerabilities_found']}")
        console.print(f"   Success rate: {summary['success_rate']:.1f}%")
        console.print(f"   Vulnerability rate: {summary['vulnerability_rate']:.1f}%")

        if summary["vulnerability_types"]:
            console.print(
                f"   Vulnerability types: {list(summary['vulnerability_types'].keys())}"
            )


if __name__ == "__main__":
    asyncio.run(main())
