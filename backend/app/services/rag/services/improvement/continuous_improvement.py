"""Continuous Improvement Service: A/B testing and optimization.

This service provides continuous improvement capabilities including A/B testing,
feedback collection, and optimization recommendations for the RAG system.

Author: Reynard Development Team
Version: 1.0.0
"""

import logging
import random
import time
from dataclasses import dataclass
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional

from ...interfaces.base import BaseService, ServiceStatus

logger = logging.getLogger("uvicorn")


@dataclass
class Experiment:
    """A/B testing experiment configuration."""

    experiment_id: str
    name: str
    description: str
    variants: Dict[str, Dict[str, Any]]
    traffic_split: Dict[str, float]  # variant_name -> percentage
    start_date: datetime
    end_date: Optional[datetime]
    status: str  # 'draft', 'running', 'paused', 'completed'
    metrics: List[str]  # metrics to track
    success_criteria: Dict[str, float]  # metric -> threshold


@dataclass
class ExperimentResult:
    """Result of an A/B test experiment."""

    experiment_id: str
    variant: str
    user_id: str
    session_id: str
    metrics: Dict[str, float]
    timestamp: datetime


@dataclass
class Feedback:
    """User feedback for continuous improvement."""

    feedback_id: str
    user_id: str
    query: str
    results: List[Dict[str, Any]]
    rating: int  # 1-5 scale
    comments: Optional[str]
    timestamp: datetime
    metadata: Dict[str, Any]


@dataclass
class OptimizationRecommendation:
    """Optimization recommendation based on analysis."""

    recommendation_id: str
    type: str  # 'embedding_model', 'chunk_size', 'search_algorithm', 'cache_strategy'
    title: str
    description: str
    expected_improvement: float  # percentage improvement
    confidence: float  # 0.0-1.0
    implementation_effort: str  # 'low', 'medium', 'high'
    data_requirements: List[str]
    timestamp: datetime


class ContinuousImprovementService(BaseService):
    """Continuous improvement service with A/B testing and optimization."""

    def __init__(self, config: Optional[Dict[str, Any]] = None):
        super().__init__("continuous-improvement", config)

        # Service configuration
        self.ab_testing_enabled = self.config.get("ab_testing_enabled", True)
        self.feedback_enabled = self.config.get("feedback_enabled", True)
        self.auto_optimization = self.config.get("auto_optimization", False)

        # Data storage
        self.experiments: Dict[str, Experiment] = {}
        self.experiment_results: List[ExperimentResult] = []
        self.feedback_data: List[Feedback] = []
        self.recommendations: List[OptimizationRecommendation] = []

        # Metrics
        self.metrics = {
            "experiments_created": 0,
            "experiments_completed": 0,
            "feedback_collected": 0,
            "recommendations_generated": 0,
            "optimizations_applied": 0,
        }

    async def initialize(self) -> bool:
        """Initialize the continuous improvement service."""
        try:
            self.update_status(
                ServiceStatus.INITIALIZING,
                "Initializing continuous improvement service",
            )

            # Initialize default experiments
            await self._initialize_default_experiments()

            self.update_status(
                ServiceStatus.HEALTHY, "Continuous improvement service initialized"
            )
            return True

        except Exception as e:
            self.logger.error(
                f"Failed to initialize continuous improvement service: {e}"
            )
            self.update_status(ServiceStatus.ERROR, f"Initialization failed: {e}")
            return False

    async def shutdown(self) -> None:
        """Shutdown the continuous improvement service."""
        try:
            self.update_status(
                ServiceStatus.SHUTTING_DOWN,
                "Shutting down continuous improvement service",
            )

            # Clear data
            self.experiments.clear()
            self.experiment_results.clear()
            self.feedback_data.clear()
            self.recommendations.clear()

            self.update_status(
                ServiceStatus.SHUTDOWN,
                "Continuous improvement service shutdown complete",
            )

        except Exception as e:
            self.logger.error(f"Error during shutdown: {e}")

    async def health_check(self) -> Dict[str, Any]:
        """Perform health check."""
        try:
            self.update_status(ServiceStatus.HEALTHY, "Service is healthy")

            return {
                "status": self.status.value,
                "message": self.health.message,
                "last_updated": self.health.last_updated.isoformat(),
                "ab_testing_enabled": self.ab_testing_enabled,
                "feedback_enabled": self.feedback_enabled,
                "auto_optimization": self.auto_optimization,
                "active_experiments": len(
                    [e for e in self.experiments.values() if e.status == "running"]
                ),
                "total_feedback": len(self.feedback_data),
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

    async def _initialize_default_experiments(self) -> None:
        """Initialize default A/B testing experiments."""
        default_experiments = [
            Experiment(
                experiment_id="embedding_model_comparison",
                name="Embedding Model Comparison",
                description="Compare different embedding models for retrieval accuracy",
                variants={
                    "control": {"embedding_model": "embeddinggemma:latest"},
                    "variant_a": {"embedding_model": "nomic-embed-text"},
                    "variant_b": {"embedding_model": "mxbai-embed-large"},
                },
                traffic_split={"control": 0.5, "variant_a": 0.25, "variant_b": 0.25},
                start_date=datetime.now(),
                end_date=None,
                status="draft",
                metrics=["retrieval_accuracy", "response_time", "user_satisfaction"],
                success_criteria={"retrieval_accuracy": 0.8, "user_satisfaction": 4.0},
            ),
            Experiment(
                experiment_id="chunk_size_optimization",
                name="Chunk Size Optimization",
                description="Test different chunk sizes for better retrieval",
                variants={
                    "control": {"chunk_size": 512, "chunk_overlap": 50},
                    "variant_a": {"chunk_size": 256, "chunk_overlap": 25},
                    "variant_b": {"chunk_size": 1024, "chunk_overlap": 100},
                },
                traffic_split={"control": 0.6, "variant_a": 0.2, "variant_b": 0.2},
                start_date=datetime.now(),
                end_date=None,
                status="draft",
                metrics=["retrieval_accuracy", "context_relevance", "response_time"],
                success_criteria={"retrieval_accuracy": 0.75, "context_relevance": 0.8},
            ),
        ]

        for experiment in default_experiments:
            self.experiments[experiment.experiment_id] = experiment

        self.logger.info(f"Initialized {len(default_experiments)} default experiments")

    async def create_experiment(self, experiment: Experiment, **kwargs) -> str:
        """Create a new A/B testing experiment."""
        try:
            self.experiments[experiment.experiment_id] = experiment
            self.metrics["experiments_created"] += 1
            self.logger.info(f"Created experiment: {experiment.experiment_id}")
            return experiment.experiment_id

        except Exception as e:
            self.logger.error(f"Failed to create experiment: {e}")
            raise RuntimeError(f"Failed to create experiment: {e}")

    async def start_experiment(self, experiment_id: str) -> bool:
        """Start an A/B testing experiment."""
        try:
            if experiment_id not in self.experiments:
                return False

            experiment = self.experiments[experiment_id]
            experiment.status = "running"
            experiment.start_date = datetime.now()

            self.logger.info(f"Started experiment: {experiment_id}")
            return True

        except Exception as e:
            self.logger.error(f"Failed to start experiment {experiment_id}: {e}")
            return False

    async def stop_experiment(self, experiment_id: str) -> bool:
        """Stop an A/B testing experiment."""
        try:
            if experiment_id not in self.experiments:
                return False

            experiment = self.experiments[experiment_id]
            experiment.status = "completed"
            experiment.end_date = datetime.now()

            self.metrics["experiments_completed"] += 1
            self.logger.info(f"Stopped experiment: {experiment_id}")
            return True

        except Exception as e:
            self.logger.error(f"Failed to stop experiment {experiment_id}: {e}")
            return False

    async def get_experiment_variant(
        self, experiment_id: str, user_id: str, **kwargs
    ) -> Optional[Dict[str, Any]]:
        """Get the variant assignment for a user in an experiment."""
        try:
            if experiment_id not in self.experiments:
                return None

            experiment = self.experiments[experiment_id]
            if experiment.status != "running":
                return None

            # Use user_id for consistent assignment
            random.seed(hash(f"{experiment_id}_{user_id}"))
            rand_value = random.random()

            # Assign variant based on traffic split
            cumulative = 0.0
            for variant_name, percentage in experiment.traffic_split.items():
                cumulative += percentage
                if rand_value <= cumulative:
                    return experiment.variants[variant_name]

            # Fallback to control
            return experiment.variants.get("control")

        except Exception as e:
            self.logger.error(f"Failed to get experiment variant: {e}")
            return None

    async def record_experiment_result(
        self,
        experiment_id: str,
        variant: str,
        user_id: str,
        session_id: str,
        metrics: Dict[str, float],
        **kwargs,
    ) -> str:
        """Record a result for an A/B test experiment."""
        try:
            result = ExperimentResult(
                experiment_id=experiment_id,
                variant=variant,
                user_id=user_id,
                session_id=session_id,
                metrics=metrics,
                timestamp=datetime.now(),
            )

            self.experiment_results.append(result)
            return result.experiment_id

        except Exception as e:
            self.logger.error(f"Failed to record experiment result: {e}")
            return ""

    async def get_experiment_results(
        self, experiment_id: str, **kwargs
    ) -> Dict[str, Any]:
        """Get results for an A/B test experiment."""
        try:
            # Filter results for the experiment
            experiment_results = [
                r for r in self.experiment_results if r.experiment_id == experiment_id
            ]

            if not experiment_results:
                return {"error": "No results found for experiment"}

            # Calculate statistics by variant
            variant_stats = {}
            for result in experiment_results:
                variant = result.variant
                if variant not in variant_stats:
                    variant_stats[variant] = {
                        "count": 0,
                        "metrics": {},
                    }

                variant_stats[variant]["count"] += 1

                for metric_name, value in result.metrics.items():
                    if metric_name not in variant_stats[variant]["metrics"]:
                        variant_stats[variant]["metrics"][metric_name] = []
                    variant_stats[variant]["metrics"][metric_name].append(value)

            # Calculate averages
            for variant, stats in variant_stats.items():
                for metric_name, values in stats["metrics"].items():
                    stats["metrics"][metric_name] = {
                        "average": sum(values) / len(values),
                        "count": len(values),
                        "min": min(values),
                        "max": max(values),
                    }

            return {
                "experiment_id": experiment_id,
                "total_results": len(experiment_results),
                "variant_stats": variant_stats,
                "experiment": self.experiments.get(experiment_id),
            }

        except Exception as e:
            self.logger.error(f"Failed to get experiment results: {e}")
            return {"error": str(e)}

    async def collect_feedback(
        self,
        user_id: str,
        query: str,
        results: List[Dict[str, Any]],
        rating: int,
        comments: Optional[str] = None,
        **kwargs,
    ) -> str:
        """Collect user feedback for continuous improvement."""
        try:
            feedback = Feedback(
                feedback_id=f"feedback_{int(time.time() * 1000)}_{user_id}",
                user_id=user_id,
                query=query,
                results=results,
                rating=rating,
                comments=comments,
                timestamp=datetime.now(),
                metadata=kwargs.get("metadata", {}),
            )

            self.feedback_data.append(feedback)
            self.metrics["feedback_collected"] += 1

            # Analyze feedback for optimization opportunities
            if self.auto_optimization:
                await self._analyze_feedback_for_optimization(feedback)

            return feedback.feedback_id

        except Exception as e:
            self.logger.error(f"Failed to collect feedback: {e}")
            return ""

    async def get_feedback_analytics(self, days: int = 30, **kwargs) -> Dict[str, Any]:
        """Get feedback analytics and insights."""
        try:
            cutoff_date = datetime.now() - timedelta(days=days)
            recent_feedback = [
                f for f in self.feedback_data if f.timestamp > cutoff_date
            ]

            if not recent_feedback:
                return {"error": "No feedback data available"}

            # Calculate statistics
            total_feedback = len(recent_feedback)
            avg_rating = sum(f.rating for f in recent_feedback) / total_feedback

            # Rating distribution
            rating_distribution = {}
            for i in range(1, 6):
                rating_distribution[i] = len(
                    [f for f in recent_feedback if f.rating == i]
                )

            # Common issues (low ratings with comments)
            low_rating_feedback = [
                f for f in recent_feedback if f.rating <= 2 and f.comments
            ]
            common_issues = {}
            for feedback in low_rating_feedback:
                # Simple keyword extraction (in production, use NLP)
                words = feedback.comments.lower().split()
                for word in words:
                    if len(word) > 3:  # Skip short words
                        common_issues[word] = common_issues.get(word, 0) + 1

            # Sort by frequency
            common_issues = dict(
                sorted(common_issues.items(), key=lambda x: x[1], reverse=True)[:10]
            )

            return {
                "period_days": days,
                "total_feedback": total_feedback,
                "average_rating": avg_rating,
                "rating_distribution": rating_distribution,
                "low_rating_count": len(low_rating_feedback),
                "common_issues": common_issues,
                "feedback_with_comments": len(
                    [f for f in recent_feedback if f.comments]
                ),
                "feedback_percentage": (
                    (len(recent_feedback) / len(self.feedback_data)) * 100
                    if self.feedback_data
                    else 0
                ),
            }

        except Exception as e:
            self.logger.error(f"Failed to get feedback analytics: {e}")
            return {"error": str(e)}

    async def generate_optimization_recommendations(
        self, **kwargs
    ) -> List[OptimizationRecommendation]:
        """Generate optimization recommendations based on data analysis."""
        try:
            recommendations = []

            # Analyze experiment results
            for experiment_id, experiment in self.experiments.items():
                if experiment.status == "completed":
                    results = await self.get_experiment_results(experiment_id)
                    if "variant_stats" in results:
                        recommendations.extend(
                            await self._analyze_experiment_for_recommendations(
                                experiment, results
                            )
                        )

            # Analyze feedback data
            recommendations.extend(await self._analyze_feedback_for_recommendations())

            # Store recommendations
            self.recommendations.extend(recommendations)
            self.metrics["recommendations_generated"] += len(recommendations)

            return recommendations

        except Exception as e:
            self.logger.error(f"Failed to generate optimization recommendations: {e}")
            return []

    async def _analyze_experiment_for_recommendations(
        self, experiment: Experiment, results: Dict[str, Any]
    ) -> List[OptimizationRecommendation]:
        """Analyze experiment results for optimization recommendations."""
        recommendations = []

        try:
            variant_stats = results.get("variant_stats", {})
            if len(variant_stats) < 2:
                return recommendations

            # Find best performing variant
            best_variant = None
            best_score = 0.0

            for variant, stats in variant_stats.items():
                if variant == "control":
                    continue

                # Calculate composite score
                score = 0.0
                for metric in experiment.metrics:
                    if metric in stats["metrics"]:
                        avg_value = stats["metrics"][metric]["average"]
                        # Normalize and weight metrics
                        if metric == "retrieval_accuracy":
                            score += avg_value * 0.4
                        elif metric == "user_satisfaction":
                            score += (avg_value / 5.0) * 0.3
                        elif metric == "response_time":
                            # Lower is better for response time
                            score += (1.0 / (1.0 + avg_value / 1000)) * 0.3

                if score > best_score:
                    best_score = score
                    best_variant = variant

            if best_variant and best_score > 0.1:  # Significant improvement
                recommendation = OptimizationRecommendation(
                    recommendation_id=f"exp_{experiment.experiment_id}_{best_variant}",
                    type="experiment_result",
                    title=f"Apply {experiment.name} - {best_variant}",
                    description=f"Experiment {experiment.experiment_id} showed {best_variant} variant performs {best_score:.1%} better than control",
                    expected_improvement=best_score * 100,
                    confidence=0.8,
                    implementation_effort="low",
                    data_requirements=["experiment_results"],
                    timestamp=datetime.now(),
                )
                recommendations.append(recommendation)

        except Exception as e:
            self.logger.error(f"Failed to analyze experiment for recommendations: {e}")

        return recommendations

    async def _analyze_feedback_for_recommendations(
        self,
    ) -> List[OptimizationRecommendation]:
        """Analyze feedback data for optimization recommendations."""
        recommendations = []

        try:
            # Analyze recent feedback
            recent_feedback = [
                f
                for f in self.feedback_data
                if f.timestamp > datetime.now() - timedelta(days=30)
            ]

            if not recent_feedback:
                return recommendations

            # Check for low ratings
            low_ratings = [f for f in recent_feedback if f.rating <= 2]
            low_rating_percentage = len(low_ratings) / len(recent_feedback)

            if low_rating_percentage > 0.2:  # More than 20% low ratings
                recommendation = OptimizationRecommendation(
                    recommendation_id="feedback_low_ratings",
                    type="user_satisfaction",
                    title="Address Low User Satisfaction",
                    description=f"{low_rating_percentage:.1%} of recent feedback has low ratings (≤2). Consider improving search relevance and response quality.",
                    expected_improvement=15.0,  # Expected 15% improvement
                    confidence=0.7,
                    implementation_effort="medium",
                    data_requirements=["user_feedback", "search_logs"],
                    timestamp=datetime.now(),
                )
                recommendations.append(recommendation)

            # Check for common query patterns in low ratings
            low_rating_queries = [f.query for f in low_ratings]
            if len(low_rating_queries) > 5:
                # Simple analysis - in production, use more sophisticated NLP
                common_words = {}
                for query in low_rating_queries:
                    words = query.lower().split()
                    for word in words:
                        if len(word) > 3:
                            common_words[word] = common_words.get(word, 0) + 1

                if common_words:
                    most_common = max(common_words.items(), key=lambda x: x[1])
                    if most_common[1] >= 3:  # Appears in at least 3 low-rated queries
                        recommendation = OptimizationRecommendation(
                            recommendation_id=f"query_optimization_{most_common[0]}",
                            type="search_algorithm",
                            title=f"Optimize Search for '{most_common[0]}'",
                            description=f"Queries containing '{most_common[0]}' frequently receive low ratings. Consider improving search algorithms for this term.",
                            expected_improvement=10.0,
                            confidence=0.6,
                            implementation_effort="medium",
                            data_requirements=["query_logs", "user_feedback"],
                            timestamp=datetime.now(),
                        )
                        recommendations.append(recommendation)

        except Exception as e:
            self.logger.error(f"Failed to analyze feedback for recommendations: {e}")

        return recommendations

    async def _analyze_feedback_for_optimization(self, feedback: Feedback) -> None:
        """Analyze individual feedback for immediate optimization opportunities."""
        try:
            # Check for critical issues (rating 1 with comments)
            if feedback.rating == 1 and feedback.comments:
                self.logger.warning(f"Critical feedback received: {feedback.comments}")
                # In production, this could trigger immediate alerts or actions

            # Check for patterns in negative feedback
            if feedback.rating <= 2:
                # Log for pattern analysis
                self.logger.info(
                    f"Negative feedback pattern: query='{feedback.query}', rating={feedback.rating}"
                )

        except Exception as e:
            self.logger.error(f"Failed to analyze feedback for optimization: {e}")

    async def get_improvement_stats(self) -> Dict[str, Any]:
        """Get continuous improvement statistics."""
        return {
            "service_name": self.name,
            "status": self.status.value,
            "ab_testing_enabled": self.ab_testing_enabled,
            "feedback_enabled": self.feedback_enabled,
            "auto_optimization": self.auto_optimization,
            "total_experiments": len(self.experiments),
            "active_experiments": len(
                [e for e in self.experiments.values() if e.status == "running"]
            ),
            "completed_experiments": len(
                [e for e in self.experiments.values() if e.status == "completed"]
            ),
            "total_feedback": len(self.feedback_data),
            "total_recommendations": len(self.recommendations),
            "recent_feedback_30d": len(
                [
                    f
                    for f in self.feedback_data
                    if f.timestamp > datetime.now() - timedelta(days=30)
                ]
            ),
            "metrics": self.metrics,
        }

    async def get_stats(self) -> Dict[str, Any]:
        """Get service statistics."""
        try:
            # Get improvement stats
            improvement_stats = await self.get_improvement_stats()

            # Add additional service-level stats
            stats = {
                **improvement_stats,
                "uptime_seconds": time.time() - (self.startup_time or time.time()),
                "last_updated": (
                    self.health.last_updated.isoformat() if self.health else None
                ),
                "cache_size": len(self.experiments) + len(self.feedback_data),
                "memory_usage_mb": self.metrics.get("memory_usage_mb", 0),
                "cpu_usage_percent": self.metrics.get("cpu_usage_percent", 0),
            }

            return stats
        except Exception as e:
            self.logger.error(f"Failed to get stats: {e}")
            return {"error": str(e), "status": self.status.value}
