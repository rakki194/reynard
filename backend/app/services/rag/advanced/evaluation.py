"""
Model Evaluator: A/B testing framework for embedding models with retrieval accuracy benchmarks.

This service provides:
- Evaluate different embedding models on code search benchmarks
- Measure retrieval accuracy, latency, and memory usage
- Generate performance reports and recommendations
- Support for code-specific evaluation metrics
- Automated model comparison and ranking
"""

import asyncio
import logging
import time
from dataclasses import dataclass
from typing import Any, Dict, List, Optional, Tuple

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


class ModelEvaluator:
    """A/B testing framework for embedding models."""

    def __init__(self, embedding_service, vector_store_service):
        self.embedding_service = embedding_service
        self.vector_store_service = vector_store_service
        self.test_queries: List[TestQuery] = []
        self.evaluation_results: List[EvaluationMetrics] = []

        # Models to evaluate
        self.models_to_test = [
            "embeddinggemma:latest",  # Current baseline
            "nomic-embed-text",  # Long context (2048 tokens)
            "mxbai-embed-large",  # Multilingual performance
            "bge-m3",  # General purpose
            "bge-large-en-v1.5",  # English optimized
        ]

        # Load test queries
        self._load_code_search_benchmark()

    def _load_code_search_benchmark(self) -> None:
        """Load code search benchmark queries."""
        # Code search benchmark queries for evaluation
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
        results = {}

        for model in self.models_to_test:
            logger.info(f"Evaluating model: {model}")
            try:
                metrics = await self._evaluate_model(model)
                results[model] = metrics
                self.evaluation_results.append(metrics)
            except Exception as e:
                logger.error(f"Failed to evaluate {model}: {e}")
                # Create error metrics
                error_metrics = EvaluationMetrics(
                    model_name=model,
                    retrieval_accuracy=0.0,
                    latency_ms=0.0,
                    memory_usage_mb=0.0,
                    code_specificity=0.0,
                    throughput_per_second=0.0,
                    error_rate=1.0,
                    timestamp=time.strftime("%Y-%m-%d %H:%M:%S"),
                )
                results[model] = error_metrics

        return results

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
                query_embedding = await self.embedding_service.embed_text(
                    test_query.query, model
                )

                # Perform similarity search
                results = await self.vector_store_service.similarity_search(
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

            except Exception as e:
                logger.warning(f"Query failed for {model}: {e}")
                errors += 1

        # Calculate final metrics
        evaluation_time = time.time() - start_time

        avg_accuracy = total_accuracy / total_queries if total_queries > 0 else 0.0
        avg_latency = total_latency / total_queries if total_queries > 0 else 0.0
        error_rate = errors / len(self.test_queries) if self.test_queries else 0.0
        throughput = total_queries / evaluation_time if evaluation_time > 0 else 0.0

        # Estimate memory usage (placeholder)
        memory_usage = self._estimate_memory_usage(model)

        # Calculate code specificity (how well it handles code vs text)
        code_specificity = self._calculate_code_specificity(model, avg_accuracy)

        return EvaluationMetrics(
            model_name=model,
            retrieval_accuracy=avg_accuracy,
            latency_ms=avg_latency,
            memory_usage_mb=memory_usage,
            code_specificity=code_specificity,
            throughput_per_second=throughput,
            error_rate=error_rate,
            timestamp=time.strftime("%Y-%m-%d %H:%M:%S"),
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
    ) -> List[Tuple[str, float]]:
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

    def generate_evaluation_report(self, results: Dict[str, EvaluationMetrics]) -> str:
        """Generate a comprehensive evaluation report."""
        report = []
        report.append("# Embedding Model Evaluation Report")
        report.append(f"Generated: {time.strftime('%Y-%m-%d %H:%M:%S')}")
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

    def get_evaluation_stats(self) -> Dict[str, Any]:
        """Get evaluation statistics."""
        return {
            "models_to_test": len(self.models_to_test),
            "test_queries": len(self.test_queries),
            "evaluations_completed": len(self.evaluation_results),
            "models_available": self.models_to_test,
            "query_types": list(set(q.query_type for q in self.test_queries)),
            "difficulty_levels": list(set(q.difficulty for q in self.test_queries)),
        }
