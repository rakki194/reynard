"""Model Evaluation Service: Model performance evaluation and A/B testing.

This service provides comprehensive model evaluation capabilities including
A/B testing, performance benchmarking, and model comparison for the RAG system.

Author: Reynard Development Team
Version: 1.0.0
"""

import logging
import time
from dataclasses import dataclass
from datetime import datetime
from typing import Any, Dict, List, Optional

from ...interfaces.base import BaseService, ServiceStatus

logger = logging.getLogger("uvicorn")


@dataclass
class EvaluationMetrics:
    """Metrics for model evaluation."""

    model_name: str
    retrieval_accuracy: float
    latency_ms: float
    memory_usage_mb: float
    code_specificity: float
    throughput_per_second: float
    error_rate: float
    timestamp: str


@dataclass
class TestQuery:
    """Test query for evaluation."""

    query: str
    expected_results: List[str]
    query_type: str  # 'function', 'class', 'concept', 'bug_fix'
    difficulty: str  # 'easy', 'medium', 'hard'


class ModelEvaluationService(BaseService):
    """Model evaluation service with A/B testing and benchmarking capabilities."""

    def __init__(self, config: Optional[Dict[str, Any]] = None):
        super().__init__("model-evaluation", config)

        # Evaluation configuration
        self.evaluation_enabled = self.config.get("evaluation_enabled", True)
        self.test_queries: List[TestQuery] = []
        self.evaluation_results: List[EvaluationMetrics] = []

        # Models to evaluate
        self.models_to_test = [
            "embeddinggemma:latest",
            "nomic-embed-text",
            "mxbai-embed-large",
            "bge-m3",
            "bge-large-en-v1.5",
        ]

        # Dependencies (will be injected)
        self.embedding_provider = None
        self.vector_store = None

        # Metrics
        self.metrics = {
            "evaluations_performed": 0,
            "models_tested": 0,
            "test_queries_executed": 0,
            "evaluation_errors": 0,
        }

    async def initialize(self) -> bool:
        """Initialize the model evaluation service."""
        try:
            self.update_status(
                ServiceStatus.INITIALIZING, "Initializing model evaluation service"
            )

            # Load test queries
            await self._load_code_search_benchmark()

            self.update_status(
                ServiceStatus.HEALTHY, "Model evaluation service initialized"
            )
            return True

        except Exception as e:
            self.logger.error(f"Failed to initialize model evaluation service: {e}")
            self.update_status(ServiceStatus.ERROR, f"Initialization failed: {e}")
            return False

    async def shutdown(self) -> None:
        """Shutdown the model evaluation service."""
        try:
            self.update_status(
                ServiceStatus.SHUTTING_DOWN, "Shutting down model evaluation service"
            )

            # Clear evaluation data
            self.test_queries.clear()
            self.evaluation_results.clear()

            self.update_status(
                ServiceStatus.SHUTDOWN, "Model evaluation service shutdown complete"
            )

        except Exception as e:
            self.logger.error(f"Error during shutdown: {e}")

    async def health_check(self) -> Dict[str, Any]:
        """Perform health check."""
        try:
            # Check dependencies
            dependencies_healthy = True
            if self.embedding_provider and not self.embedding_provider.is_healthy():
                dependencies_healthy = False
            if self.vector_store and not self.vector_store.is_healthy():
                dependencies_healthy = False

            if dependencies_healthy:
                self.update_status(ServiceStatus.HEALTHY, "Service is healthy")
            else:
                self.update_status(
                    ServiceStatus.DEGRADED, "Some dependencies are unhealthy"
                )

            return {
                "status": self.status.value,
                "message": self.health.message,
                "last_updated": self.health.last_updated.isoformat(),
                "evaluation_enabled": self.evaluation_enabled,
                "test_queries_count": len(self.test_queries),
                "models_to_test": len(self.models_to_test),
                "metrics": self.metrics,
                "dependencies": self.get_dependency_status(),
            }

        except Exception as e:
            self.logger.error(f"Health check failed: {e}")
            self.update_status(ServiceStatus.ERROR, f"Health check failed: {e}")
            return {
                "status": "error",
                "message": str(e),
                "last_updated": self.health.last_updated.isoformat(),
                "dependencies": self.get_dependency_status(),
            }

    def set_dependencies(self, embedding_provider, vector_store) -> None:
        """Set service dependencies."""
        self.embedding_provider = embedding_provider
        self.vector_store = vector_store

        if embedding_provider:
            self.add_dependency("embedding_provider", embedding_provider)
        if vector_store:
            self.add_dependency("vector_store", vector_store)

    async def _load_code_search_benchmark(self) -> None:
        """Load code search benchmark queries."""
        self.test_queries = [
            # Function queries
            TestQuery(
                query="function that calculates fibonacci numbers",
                expected_results=["fibonacci", "fib", "calculate_fibonacci"],
                query_type="function",
                difficulty="easy",
            ),
            TestQuery(
                query="authentication login function",
                expected_results=["login", "authenticate", "auth", "signin"],
                query_type="function",
                difficulty="medium",
            ),
            TestQuery(
                query="database connection pool management",
                expected_results=["connection_pool", "db_pool", "pool_manager"],
                query_type="concept",
                difficulty="hard",
            ),
            # Class queries
            TestQuery(
                query="HTTP client class for API requests",
                expected_results=["HttpClient", "ApiClient", "RequestClient"],
                query_type="class",
                difficulty="medium",
            ),
            TestQuery(
                query="user authentication service class",
                expected_results=["AuthService", "UserAuth", "AuthenticationService"],
                query_type="class",
                difficulty="medium",
            ),
            # Bug fix queries
            TestQuery(
                query="memory leak in image processing",
                expected_results=["memory_leak", "image_processing", "cleanup"],
                query_type="bug_fix",
                difficulty="hard",
            ),
            TestQuery(
                query="null pointer exception handling",
                expected_results=["null_check", "exception_handling", "null_pointer"],
                query_type="bug_fix",
                difficulty="medium",
            ),
            # Concept queries
            TestQuery(
                query="dependency injection container",
                expected_results=["di_container", "dependency_injection", "container"],
                query_type="concept",
                difficulty="hard",
            ),
            TestQuery(
                query="async await pattern implementation",
                expected_results=["async", "await", "promise", "async_await"],
                query_type="concept",
                difficulty="medium",
            ),
            # Code pattern queries
            TestQuery(
                query="singleton pattern implementation",
                expected_results=["singleton", "get_instance", "instance"],
                query_type="concept",
                difficulty="easy",
            ),
            TestQuery(
                query="observer pattern with event handling",
                expected_results=["observer", "event_handler", "subscribe", "notify"],
                query_type="concept",
                difficulty="hard",
            ),
        ]

    async def evaluate_models(self) -> Dict[str, EvaluationMetrics]:
        """Evaluate all models and return results."""
        if not self.evaluation_enabled:
            return {}

        if not self.embedding_provider or not self.vector_store:
            raise RuntimeError(
                "Embedding provider and vector store are required for model evaluation"
            )

        results = {}

        try:
            for model in self.models_to_test:
                self.logger.info(f"Evaluating model: {model}")
                try:
                    metrics = await self._evaluate_model(model)
                    results[model] = metrics
                    self.evaluation_results.append(metrics)
                    self.metrics["models_tested"] += 1

                except Exception as e:
                    self.logger.error(f"Failed to evaluate {model}: {e}")
                    self.metrics["evaluation_errors"] += 1

                    # Create error metrics
                    error_metrics = EvaluationMetrics(
                        model_name=model,
                        retrieval_accuracy=0.0,
                        latency_ms=0.0,
                        memory_usage_mb=0.0,
                        code_specificity=0.0,
                        throughput_per_second=0.0,
                        error_rate=1.0,
                        timestamp=datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                    )
                    results[model] = error_metrics

            self.metrics["evaluations_performed"] += 1
            return results

        except Exception as e:
            self.logger.error(f"Model evaluation failed: {e}")
            raise RuntimeError(f"Model evaluation failed: {e}")

    async def _evaluate_model(self, model: str) -> EvaluationMetrics:
        """Evaluate a single model."""
        start_time = time.time()

        # Initialize metrics
        total_accuracy = 0.0
        total_latency = 0.0
        total_queries = 0
        errors = 0

        # Test on code search benchmark
        for test_query in self.test_queries:
            try:
                query_start = time.time()

                # Generate embedding for query
                embedding_result = await self.embedding_provider.embed_text(
                    test_query.query, model
                )
                query_embedding = embedding_result.embedding

                # Perform similarity search
                results = await self.vector_store.similarity_search(
                    query_embedding, limit=10
                )

                query_latency = (time.time() - query_start) * 1000
                total_latency += query_latency

                # Calculate accuracy
                accuracy = self._calculate_retrieval_accuracy(
                    results, test_query.expected_results
                )
                total_accuracy += accuracy
                total_queries += 1
                self.metrics["test_queries_executed"] += 1

            except Exception as e:
                self.logger.warning(f"Query failed for {model}: {e}")
                errors += 1

        # Calculate final metrics
        evaluation_time = time.time() - start_time

        avg_accuracy = total_accuracy / total_queries if total_queries > 0 else 0.0
        avg_latency = total_latency / total_queries if total_queries > 0 else 0.0
        error_rate = errors / len(self.test_queries) if self.test_queries else 0.0
        throughput = total_queries / evaluation_time if evaluation_time > 0 else 0.0

        # Estimate memory usage
        memory_usage = self._estimate_memory_usage(model)

        # Calculate code specificity
        code_specificity = self._calculate_code_specificity(model, avg_accuracy)

        return EvaluationMetrics(
            model_name=model,
            retrieval_accuracy=avg_accuracy,
            latency_ms=avg_latency,
            memory_usage_mb=memory_usage,
            code_specificity=code_specificity,
            throughput_per_second=throughput,
            error_rate=error_rate,
            timestamp=datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        )

    def _calculate_retrieval_accuracy(
        self, results: List[Dict], expected: List[str]
    ) -> float:
        """Calculate retrieval accuracy based on expected results."""
        if not results or not expected:
            return 0.0

        # Extract content from results
        retrieved_content = []
        for result in results:
            content = result.get("text", "").lower()
            retrieved_content.append(content)

        # Check for matches with expected results
        matches = 0
        for expected_term in expected:
            expected_lower = expected_term.lower()
            for content in retrieved_content:
                if expected_lower in content:
                    matches += 1
                    break  # Count each expected term only once

        return matches / len(expected) if expected else 0.0

    def _estimate_memory_usage(self, model: str) -> float:
        """Estimate memory usage for a model."""
        # Rough estimates based on model sizes
        memory_estimates = {
            "embeddinggemma:latest": 2.0,  # 300M parameters
            "nomic-embed-text": 1.5,  # Smaller model
            "mxbai-embed-large": 2.5,  # Larger model
            "bge-m3": 2.2,  # Medium model
            "bge-large-en-v1.5": 2.8,  # Large model
        }
        return memory_estimates.get(model, 2.0)

    def _calculate_code_specificity(self, model: str, accuracy: float) -> float:
        """Calculate how well a model handles code-specific queries."""
        # This would be more sophisticated in practice
        # For now, use a simple heuristic based on model name and accuracy
        code_models = ["embeddinggemma", "mxbai-embed-large"]
        is_code_model = any(code_model in model for code_model in code_models)

        base_specificity = 0.7 if is_code_model else 0.5
        accuracy_bonus = accuracy * 0.3

        return min(1.0, base_specificity + accuracy_bonus)

    def rank_models(
        self, results: Dict[str, EvaluationMetrics]
    ) -> List[tuple[str, float]]:
        """Rank models by overall performance score."""
        model_scores = []

        for model, metrics in results.items():
            # Weighted score combining multiple factors
            score = (
                metrics.retrieval_accuracy * 0.4  # 40% accuracy
                + (1.0 - metrics.error_rate) * 0.2  # 20% reliability
                + metrics.code_specificity * 0.2  # 20% code specificity
                + (1.0 / (1.0 + metrics.latency_ms / 100)) * 0.1  # 10% speed
                + (1.0 / (1.0 + metrics.memory_usage_mb / 10))
                * 0.1  # 10% memory efficiency
            )
            model_scores.append((model, score))

        # Sort by score (descending)
        return sorted(model_scores, key=lambda x: x[1], reverse=True)

    async def generate_evaluation_report(
        self, results: Dict[str, EvaluationMetrics]
    ) -> str:
        """Generate a comprehensive evaluation report."""
        report = []
        report.append("# Embedding Model Evaluation Report")
        report.append(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        report.append("")

        # Overall ranking
        rankings = self.rank_models(results)
        report.append("## Model Rankings")
        report.append("")
        for i, (model, score) in enumerate(rankings, 1):
            report.append(f"{i}. **{model}** - Score: {score:.3f}")
        report.append("")

        # Detailed metrics
        report.append("## Detailed Metrics")
        report.append("")
        report.append(
            "| Model | Accuracy | Latency (ms) | Memory (MB) | Code Specificity | Throughput | Error Rate |"
        )
        report.append(
            "|-------|----------|--------------|-------------|------------------|------------|------------|"
        )

        for model, metrics in results.items():
            report.append(
                f"| {model} | {metrics.retrieval_accuracy:.3f} | "
                f"{metrics.latency_ms:.1f} | {metrics.memory_usage_mb:.1f} | "
                f"{metrics.code_specificity:.3f} | {metrics.throughput_per_second:.1f} | "
                f"{metrics.error_rate:.3f} |"
            )

        report.append("")

        # Recommendations
        report.append("## Recommendations")
        report.append("")

        best_model = rankings[0][0] if rankings else "None"
        report.append(f"**Best Overall Model**: {best_model}")
        report.append("")

        # Find best model for specific use cases
        best_accuracy = max(results.items(), key=lambda x: x[1].retrieval_accuracy)
        best_speed = min(results.items(), key=lambda x: x[1].latency_ms)
        best_memory = min(results.items(), key=lambda x: x[1].memory_usage_mb)

        report.append(
            f"**Best Accuracy**: {best_accuracy[0]} ({best_accuracy[1].retrieval_accuracy:.3f})"
        )
        report.append(
            f"**Best Speed**: {best_speed[0]} ({best_speed[1].latency_ms:.1f}ms)"
        )
        report.append(
            f"**Best Memory Efficiency**: {best_memory[0]} ({best_memory[1].memory_usage_mb:.1f}MB)"
        )
        report.append("")

        # Performance analysis
        report.append("## Performance Analysis")
        report.append("")

        avg_accuracy = sum(m.retrieval_accuracy for m in results.values()) / len(
            results
        )
        avg_latency = sum(m.latency_ms for m in results.values()) / len(results)

        report.append(f"- **Average Accuracy**: {avg_accuracy:.3f}")
        report.append(f"- **Average Latency**: {avg_latency:.1f}ms")
        report.append(f"- **Models Evaluated**: {len(results)}")
        report.append(f"- **Test Queries**: {len(self.test_queries)}")

        return "\n".join(report)

    async def get_evaluation_stats(self) -> Dict[str, Any]:
        """Get evaluation statistics."""
        return {
            "service_name": self.name,
            "status": self.status.value,
            "evaluation_enabled": self.evaluation_enabled,
            "models_to_test": len(self.models_to_test),
            "test_queries": len(self.test_queries),
            "evaluations_completed": len(self.evaluation_results),
            "models_available": self.models_to_test,
            "query_types": list(set(q.query_type for q in self.test_queries)),
            "difficulty_levels": list(set(q.difficulty for q in self.test_queries)),
            "metrics": self.metrics,
        }

    async def get_stats(self) -> Dict[str, Any]:
        """Get service statistics."""
        try:
            # Get evaluation stats
            evaluation_stats = await self.get_evaluation_stats()

            # Add additional service-level stats
            stats = {
                **evaluation_stats,
                "uptime_seconds": time.time() - (self.startup_time or time.time()),
                "last_updated": self.health.last_updated.isoformat() if self.health else None,
                "memory_usage_mb": self.metrics.get("memory_usage_mb", 0),
                "cpu_usage_percent": self.metrics.get("cpu_usage_percent", 0),
                "total_evaluations": self.metrics.get("evaluations_performed", 0),
                "total_models_tested": self.metrics.get("models_tested", 0),
                "total_queries_executed": self.metrics.get("test_queries_executed", 0),
                "evaluation_errors": self.metrics.get("evaluation_errors", 0),
            }

            return stats
        except Exception as e:
            self.logger.error(f"Failed to get stats: {e}")
            return {"error": str(e), "status": self.status.value}
