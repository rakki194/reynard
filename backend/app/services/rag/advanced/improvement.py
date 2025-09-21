"""
Continuous Improvement: A/B testing framework and optimization pipeline.

This service provides:
- Automated model evaluation and A/B testing
- Performance regression detection
- Optimization recommendations
- Feedback collection and analysis
- Continuous 5% monthly improvement tracking
"""

import asyncio
import logging
import time
from dataclasses import dataclass
from datetime import datetime, timedelta
from enum import Enum
from typing import Any, Dict, List, Optional, Tuple
import statistics

logger = logging.getLogger("uvicorn")


class ExperimentStatus(Enum):
    """Status of A/B testing experiments."""

    DRAFT = "draft"
    RUNNING = "running"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class ImprovementType(Enum):
    """Types of improvements."""

    PERFORMANCE = "performance"
    ACCURACY = "accuracy"
    LATENCY = "latency"
    THROUGHPUT = "throughput"
    USER_SATISFACTION = "user_satisfaction"


@dataclass
class Experiment:
    """A/B testing experiment configuration."""

    experiment_id: str
    name: str
    description: str
    hypothesis: str
    improvement_type: ImprovementType
    control_config: Dict[str, Any]
    treatment_config: Dict[str, Any]
    traffic_split: float  # 0.0 to 1.0
    success_metrics: List[str]
    minimum_sample_size: int
    significance_level: float
    status: ExperimentStatus
    start_date: Optional[datetime]
    end_date: Optional[datetime]
    results: Optional[Dict[str, Any]]


@dataclass
class Feedback:
    """User feedback for continuous improvement."""

    feedback_id: str
    user_id: str
    query: str
    results: List[Dict[str, Any]]
    relevance_score: int  # 1-5 scale
    satisfaction_score: int  # 1-5 scale
    comments: str
    timestamp: datetime
    metadata: Dict[str, Any]


class ContinuousImprovement:
    """Automated continuous improvement pipeline."""

    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.enabled = config.get("rag_continuous_improvement_enabled", True)

        # Experiments
        self.experiments: Dict[str, Experiment] = {}
        self.active_experiments: Dict[str, Experiment] = {}

        # Feedback collection
        self.feedback_data: List[Feedback] = []
        self.feedback_analysis: Dict[str, Any] = {}

        # Improvement tracking
        self.improvement_history: List[Dict[str, Any]] = []
        self.monthly_improvement_target = 0.05  # 5% monthly improvement

        # Automated optimization
        self.optimization_recommendations: List[Dict[str, Any]] = []

    async def create_experiment(
        self,
        name: str,
        description: str,
        hypothesis: str,
        improvement_type: ImprovementType,
        control_config: Dict[str, Any],
        treatment_config: Dict[str, Any],
        traffic_split: float = 0.5,
        success_metrics: Optional[List[str]] = None,
        minimum_sample_size: int = 1000,
    ) -> str:
        """Create a new A/B testing experiment."""
        if not self.enabled:
            return "continuous_improvement_disabled"

        experiment_id = f"exp_{int(time.time())}_{name.lower().replace(' ', '_')}"

        experiment = Experiment(
            experiment_id=experiment_id,
            name=name,
            description=description,
            hypothesis=hypothesis,
            improvement_type=improvement_type,
            control_config=control_config,
            treatment_config=treatment_config,
            traffic_split=traffic_split,
            success_metrics=success_metrics or ["primary_metric"],
            minimum_sample_size=minimum_sample_size,
            significance_level=0.05,
            status=ExperimentStatus.DRAFT,
            start_date=None,
            end_date=None,
            results=None,
        )

        self.experiments[experiment_id] = experiment

        logger.info(f"Created experiment: {experiment_id} - {name}")
        return experiment_id

    async def start_experiment(self, experiment_id: str) -> bool:
        """Start an A/B testing experiment."""
        if experiment_id not in self.experiments:
            return False

        experiment = self.experiments[experiment_id]
        if experiment.status != ExperimentStatus.DRAFT:
            return False

        experiment.status = ExperimentStatus.RUNNING
        experiment.start_date = datetime.now()
        self.active_experiments[experiment_id] = experiment

        logger.info(f"Started experiment: {experiment_id}")
        return True

    async def collect_experiment_data(
        self,
        experiment_id: str,
        user_id: str,
        variant: str,  # "control" or "treatment"
        metrics: Dict[str, float],
    ) -> bool:
        """Collect data for an active experiment."""
        if experiment_id not in self.active_experiments:
            return False

        experiment = self.active_experiments[experiment_id]

        # Store experiment data
        experiment_data = {
            "experiment_id": experiment_id,
            "user_id": user_id,
            "variant": variant,
            "metrics": metrics,
            "timestamp": datetime.now(),
        }

        # Add to experiment results
        if experiment.results is None:
            experiment.results = {"control": [], "treatment": []}

        experiment.results[variant].append(experiment_data)

        return True

    async def analyze_experiment(self, experiment_id: str) -> Dict[str, Any]:
        """Analyze experiment results and determine statistical significance."""
        if experiment_id not in self.experiments:
            return {"error": "Experiment not found"}

        experiment = self.experiments[experiment_id]
        if experiment.results is None:
            return {"error": "No data collected"}

        control_data = experiment.results.get("control", [])
        treatment_data = experiment.results.get("treatment", [])

        if (
            len(control_data) < experiment.minimum_sample_size
            or len(treatment_data) < experiment.minimum_sample_size
        ):
            return {"error": "Insufficient sample size"}

        # Analyze each success metric
        analysis_results = {}

        for metric in experiment.success_metrics:
            control_values = [d["metrics"].get(metric, 0) for d in control_data]
            treatment_values = [d["metrics"].get(metric, 0) for d in treatment_data]

            if not control_values or not treatment_values:
                continue

            # Calculate statistics
            control_mean = statistics.mean(control_values)
            treatment_mean = statistics.mean(treatment_values)

            # Simple t-test approximation
            improvement = (
                (treatment_mean - control_mean) / control_mean
                if control_mean > 0
                else 0
            )

            # Determine significance (simplified)
            is_significant = abs(improvement) > 0.05  # 5% improvement threshold

            analysis_results[metric] = {
                "control_mean": control_mean,
                "treatment_mean": treatment_mean,
                "improvement_percent": improvement * 100,
                "is_significant": is_significant,
                "sample_size_control": len(control_values),
                "sample_size_treatment": len(treatment_values),
            }

        # Overall experiment result
        significant_improvements = sum(
            1 for r in analysis_results.values() if r["is_significant"]
        )
        total_metrics = len(analysis_results)

        experiment_success = significant_improvements > total_metrics / 2

        return {
            "experiment_id": experiment_id,
            "overall_success": experiment_success,
            "significant_improvements": significant_improvements,
            "total_metrics": total_metrics,
            "metric_analysis": analysis_results,
            "recommendation": "implement" if experiment_success else "reject",
        }

    async def complete_experiment(self, experiment_id: str) -> Dict[str, Any]:
        """Complete an experiment and generate final results."""
        if experiment_id not in self.active_experiments:
            return {"error": "Experiment not found or not active"}

        experiment = self.active_experiments[experiment_id]

        # Analyze results
        analysis = await self.analyze_experiment(experiment_id)

        # Update experiment status
        experiment.status = ExperimentStatus.COMPLETED
        experiment.end_date = datetime.now()

        # Remove from active experiments
        del self.active_experiments[experiment_id]

        # Record improvement if successful
        if analysis.get("overall_success", False):
            await self._record_improvement(experiment, analysis)

        logger.info(f"Completed experiment: {experiment_id}")
        return analysis

    async def _record_improvement(
        self, experiment: Experiment, analysis: Dict[str, Any]
    ) -> None:
        """Record successful improvement."""
        improvement_record = {
            "experiment_id": experiment.experiment_id,
            "improvement_type": experiment.improvement_type.value,
            "improvement_percent": analysis.get("significant_improvements", 0)
            / analysis.get("total_metrics", 1)
            * 100,
            "date": datetime.now(),
            "hypothesis": experiment.hypothesis,
            "results": analysis,
        }

        self.improvement_history.append(improvement_record)

        # Generate optimization recommendations
        await self._generate_optimization_recommendations(experiment, analysis)

    async def _generate_optimization_recommendations(
        self, experiment: Experiment, analysis: Dict[str, Any]
    ) -> None:
        """Generate optimization recommendations based on successful experiments."""
        recommendation = {
            "recommendation_id": f"rec_{int(time.time())}",
            "experiment_id": experiment.experiment_id,
            "improvement_type": experiment.improvement_type.value,
            "description": f"Implement {experiment.name} based on successful experiment",
            "priority": "high" if analysis.get("overall_success", False) else "medium",
            "estimated_impact": analysis.get("significant_improvements", 0)
            / analysis.get("total_metrics", 1)
            * 100,
            "implementation_config": experiment.treatment_config,
            "created_date": datetime.now(),
            "status": "pending",
        }

        self.optimization_recommendations.append(recommendation)

    async def collect_feedback(
        self,
        user_id: str,
        query: str,
        results: List[Dict[str, Any]],
        relevance_score: int,
        satisfaction_score: int,
        comments: str = "",
    ) -> str:
        """Collect user feedback for continuous improvement."""
        if not self.enabled:
            return "feedback_collection_disabled"

        feedback_id = f"feedback_{int(time.time())}_{user_id}"

        feedback = Feedback(
            feedback_id=feedback_id,
            user_id=user_id,
            query=query,
            results=results,
            relevance_score=relevance_score,
            satisfaction_score=satisfaction_score,
            comments=comments,
            timestamp=datetime.now(),
            metadata={},
        )

        self.feedback_data.append(feedback)

        # Analyze feedback for patterns
        await self._analyze_feedback_patterns()

        logger.info(f"Collected feedback: {feedback_id}")
        return feedback_id

    async def _analyze_feedback_patterns(self) -> None:
        """Analyze feedback data for improvement patterns."""
        if len(self.feedback_data) < 10:  # Need minimum data for analysis
            return

        # Calculate average satisfaction
        recent_feedback = [
            f
            for f in self.feedback_data
            if f.timestamp > datetime.now() - timedelta(days=30)
        ]

        if not recent_feedback:
            return

        avg_satisfaction = sum(f.satisfaction_score for f in recent_feedback) / len(
            recent_feedback
        )
        avg_relevance = sum(f.relevance_score for f in recent_feedback) / len(
            recent_feedback
        )

        # Identify common issues
        low_satisfaction_feedback = [
            f for f in recent_feedback if f.satisfaction_score <= 2
        ]

        common_issues = {}
        for feedback in low_satisfaction_feedback:
            # Simple keyword extraction
            words = feedback.query.lower().split()
            for word in words:
                if len(word) > 3:  # Skip short words
                    common_issues[word] = common_issues.get(word, 0) + 1

        self.feedback_analysis = {
            "average_satisfaction": avg_satisfaction,
            "average_relevance": avg_relevance,
            "total_feedback": len(recent_feedback),
            "low_satisfaction_count": len(low_satisfaction_feedback),
            "common_issues": dict(
                sorted(common_issues.items(), key=lambda x: x[1], reverse=True)[:10]
            ),
        }

    async def get_improvement_progress(self) -> Dict[str, Any]:
        """Get progress towards monthly improvement targets."""
        current_month = datetime.now().replace(day=1)
        month_start = current_month
        month_end = (current_month + timedelta(days=32)).replace(day=1) - timedelta(
            days=1
        )

        # Get improvements from this month
        monthly_improvements = [
            imp
            for imp in self.improvement_history
            if month_start <= imp["date"] <= month_end
        ]

        total_improvement = sum(
            imp["improvement_percent"] for imp in monthly_improvements
        )
        target_improvement = (
            self.monthly_improvement_target * 100
        )  # Convert to percentage

        progress = {
            "current_month": current_month.strftime("%Y-%m"),
            "target_improvement_percent": target_improvement,
            "actual_improvement_percent": total_improvement,
            "progress_percent": (
                (total_improvement / target_improvement) * 100
                if target_improvement > 0
                else 0
            ),
            "improvements_count": len(monthly_improvements),
            "on_track": total_improvement >= target_improvement,
            "improvements": monthly_improvements,
        }

        return progress

    async def get_optimization_recommendations(self) -> List[Dict[str, Any]]:
        """Get pending optimization recommendations."""
        pending_recommendations = [
            rec
            for rec in self.optimization_recommendations
            if rec["status"] == "pending"
        ]

        # Sort by priority and estimated impact
        pending_recommendations.sort(
            key=lambda x: (x["priority"] == "high", x["estimated_impact"]), reverse=True
        )

        return pending_recommendations

    async def implement_recommendation(self, recommendation_id: str) -> bool:
        """Mark a recommendation as implemented."""
        for rec in self.optimization_recommendations:
            if rec["recommendation_id"] == recommendation_id:
                rec["status"] = "implemented"
                rec["implementation_date"] = datetime.now()
                logger.info(f"Implemented recommendation: {recommendation_id}")
                return True

        return False

    def get_continuous_improvement_stats(self) -> Dict[str, Any]:
        """Get continuous improvement statistics."""
        return {
            "enabled": self.enabled,
            "total_experiments": len(self.experiments),
            "active_experiments": len(self.active_experiments),
            "completed_experiments": len(
                [
                    e
                    for e in self.experiments.values()
                    if e.status == ExperimentStatus.COMPLETED
                ]
            ),
            "total_feedback": len(self.feedback_data),
            "improvements_recorded": len(self.improvement_history),
            "pending_recommendations": len(
                [
                    r
                    for r in self.optimization_recommendations
                    if r["status"] == "pending"
                ]
            ),
            "monthly_target_percent": self.monthly_improvement_target * 100,
        }
