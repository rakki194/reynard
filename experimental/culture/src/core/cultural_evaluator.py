"""CULTURE: Cultural Understanding and Linguistic Translation for Universal Recognition and Evaluation

Core cultural evaluation framework for assessing LLM understanding of culturally specific
communication patterns, with initial focus on Persian taarof.

Author: Curious-Prime-55 (Lemur Specialist)
Date: 2025-01-15
Version: 1.0.0
"""

import asyncio
import json
import logging
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Any

import numpy as np

from ..benchmarks.taarof_bench import TaarofBenchmark
from ..utils.cultural_validator import CulturalValidator
from ..utils.model_interface import ModelInterface
from .cultural_metrics import CulturalMetrics
from .statistical_analyzer import StatisticalAnalyzer

logger = logging.getLogger(__name__)


@dataclass
class CulturalEvaluationResult:
    """Results from cultural evaluation of an LLM."""

    model_name: str
    cultural_context: str
    total_scenarios: int
    correct_responses: int
    cultural_accuracy: float
    confidence_interval: tuple[float, float]
    p_value: float
    effect_size: float
    cultural_bias_coefficient: float
    politeness_disconnect: float
    detailed_results: list[dict[str, Any]]
    statistical_significance: bool


class CulturalEvaluator:
    """Main orchestrator for cultural evaluation of Large Language Models.

    This class coordinates the evaluation process, statistical analysis,
    and result interpretation for cultural AI alignment assessment.
    """

    def __init__(self, config_path: Path | None = None):
        """Initialize the cultural evaluator with configuration."""
        self.config = self._load_config(config_path)
        self.model_interface = ModelInterface(self.config.get("model_config", {}))
        self.cultural_validator = CulturalValidator(
            self.config.get("validation_config", {}),
        )
        self.statistical_analyzer = StatisticalAnalyzer()
        self.cultural_metrics = CulturalMetrics()

        # Load available benchmarks
        self.benchmarks = {
            "taarof": TaarofBenchmark(),
            # Future: Add more cultural benchmarks
        }

        logger.info("Cultural evaluator initialized successfully")

    def _load_config(self, config_path: Path | None) -> dict[str, Any]:
        """Load configuration from file or use defaults."""
        if config_path and config_path.exists():
            with open(config_path) as f:
                return json.load(f)

        # Default configuration
        return {
            "model_config": {"temperature": 0.7, "max_tokens": 512, "top_p": 0.9},
            "validation_config": {"confidence_threshold": 0.95, "min_sample_size": 30},
            "statistical_config": {"alpha": 0.05, "effect_size_threshold": 0.2},
        }

    async def evaluate_model(
        self,
        model_name: str,
        benchmark_name: str = "taarof",
        cultural_context: str = "persian_taarof",
        sample_size: int | None = None,
    ) -> CulturalEvaluationResult:
        """Evaluate a model's cultural understanding using specified benchmark.

        Args:
            model_name: Name of the model to evaluate
            benchmark_name: Name of the cultural benchmark to use
            cultural_context: Specific cultural context for evaluation
            sample_size: Number of scenarios to evaluate (None for all)

        Returns:
            CulturalEvaluationResult with comprehensive evaluation metrics

        """
        logger.info(f"Starting cultural evaluation for {model_name}")

        # Get benchmark
        if benchmark_name not in self.benchmarks:
            raise ValueError(f"Unknown benchmark: {benchmark_name}")

        benchmark = self.benchmarks[benchmark_name]
        scenarios = benchmark.get_scenarios(cultural_context, sample_size)

        # Evaluate model responses
        model_responses = await self._evaluate_scenarios(model_name, scenarios)

        # Validate cultural appropriateness
        validation_results = await self._validate_responses(
            model_responses, scenarios, cultural_context,
        )

        # Calculate metrics
        metrics = self._calculate_metrics(validation_results, scenarios)

        # Perform statistical analysis
        statistical_analysis = self.statistical_analyzer.analyze_results(
            validation_results, scenarios, cultural_context,
        )

        # Create comprehensive result
        result = CulturalEvaluationResult(
            model_name=model_name,
            cultural_context=cultural_context,
            total_scenarios=len(scenarios),
            correct_responses=metrics["correct_responses"],
            cultural_accuracy=metrics["cultural_accuracy"],
            confidence_interval=statistical_analysis["confidence_interval"],
            p_value=statistical_analysis["p_value"],
            effect_size=statistical_analysis["effect_size"],
            cultural_bias_coefficient=metrics["cultural_bias_coefficient"],
            politeness_disconnect=metrics["politeness_disconnect"],
            detailed_results=validation_results,
            statistical_significance=statistical_analysis["significant"],
        )

        logger.info(f"Cultural evaluation completed for {model_name}")
        logger.info(f"Cultural accuracy: {result.cultural_accuracy:.2%}")

        return result

    async def _evaluate_scenarios(
        self, model_name: str, scenarios: list[dict[str, Any]],
    ) -> list[dict[str, Any]]:
        """Evaluate model responses for given scenarios."""
        responses = []

        for scenario in scenarios:
            try:
                response = await self.model_interface.generate_response(
                    model_name, scenario,
                )
                responses.append(
                    {
                        "scenario_id": scenario["id"],
                        "scenario": scenario,
                        "response": response,
                        "timestamp": asyncio.get_event_loop().time(),
                    },
                )
            except Exception as e:
                logger.error(f"Error evaluating scenario {scenario['id']}: {e}")
                responses.append(
                    {
                        "scenario_id": scenario["id"],
                        "scenario": scenario,
                        "response": None,
                        "error": str(e),
                    },
                )

        return responses

    async def _validate_responses(
        self,
        model_responses: list[dict[str, Any]],
        scenarios: list[dict[str, Any]],
        cultural_context: str,
    ) -> list[dict[str, Any]]:
        """Validate cultural appropriateness of model responses."""
        validation_results = []

        for response_data in model_responses:
            if response_data["response"] is None:
                continue

            validation = await self.cultural_validator.validate_response(
                response_data["response"], response_data["scenario"], cultural_context,
            )

            validation_results.append(
                {
                    "scenario_id": response_data["scenario_id"],
                    "response": response_data["response"],
                    "scenario": response_data["scenario"],
                    "culturally_appropriate": validation["culturally_appropriate"],
                    "politeness_score": validation["politeness_score"],
                    "cultural_score": validation["cultural_score"],
                    "explanation": validation["explanation"],
                },
            )

        return validation_results

    def _calculate_metrics(
        self, validation_results: list[dict[str, Any]], scenarios: list[dict[str, Any]],
    ) -> dict[str, float]:
        """Calculate comprehensive cultural metrics."""
        if not validation_results:
            return {
                "correct_responses": 0,
                "cultural_accuracy": 0.0,
                "cultural_bias_coefficient": 0.0,
                "politeness_disconnect": 0.0,
            }

        # Basic accuracy
        correct_responses = sum(
            1 for r in validation_results if r["culturally_appropriate"]
        )
        cultural_accuracy = correct_responses / len(validation_results)

        # Cultural bias coefficient
        taarof_expected = [
            r for r in validation_results if r["scenario"].get("taarof_expected", False)
        ]
        non_taarof = [
            r
            for r in validation_results
            if not r["scenario"].get("taarof_expected", False)
        ]

        taarof_accuracy = (
            (
                sum(1 for r in taarof_expected if r["culturally_appropriate"])
                / len(taarof_expected)
            )
            if taarof_expected
            else 0.0
        )
        non_taarof_accuracy = (
            (
                sum(1 for r in non_taarof if r["culturally_appropriate"])
                / len(non_taarof)
            )
            if non_taarof
            else 0.0
        )

        cultural_bias_coefficient = (
            (non_taarof_accuracy - taarof_accuracy) / non_taarof_accuracy
            if non_taarof_accuracy > 0
            else 0.0
        )

        # Politeness disconnect
        polite_responses = sum(
            1 for r in validation_results if r["politeness_score"] > 0.7
        )
        culturally_appropriate_polite = sum(
            1
            for r in validation_results
            if r["politeness_score"] > 0.7 and r["culturally_appropriate"]
        )

        politeness_rate = (
            polite_responses / len(validation_results) if validation_results else 0.0
        )
        cultural_appropriateness_rate = (
            culturally_appropriate_polite / len(validation_results)
            if validation_results
            else 0.0
        )

        politeness_disconnect = (
            abs(politeness_rate - cultural_appropriateness_rate) / politeness_rate
            if politeness_rate > 0
            else 0.0
        )

        return {
            "correct_responses": correct_responses,
            "cultural_accuracy": cultural_accuracy,
            "cultural_bias_coefficient": cultural_bias_coefficient,
            "politeness_disconnect": politeness_disconnect,
        }

    def compare_models(self, results: list[CulturalEvaluationResult]) -> dict[str, Any]:
        """Compare multiple model evaluation results."""
        if len(results) < 2:
            raise ValueError("Need at least 2 results for comparison")

        # Extract metrics for comparison
        model_names = [r.model_name for r in results]
        accuracies = [r.cultural_accuracy for r in results]
        bias_coefficients = [r.cultural_bias_coefficient for r in results]

        # Statistical comparison
        comparison_stats = self.statistical_analyzer.compare_groups(
            accuracies, model_names,
        )

        return {
            "model_comparison": {
                "model_names": model_names,
                "accuracies": accuracies,
                "bias_coefficients": bias_coefficients,
            },
            "statistical_comparison": comparison_stats,
            "best_model": model_names[np.argmax(accuracies)],
            "most_culturally_aligned": model_names[np.argmin(bias_coefficients)],
        }

    def export_results(
        self, result: CulturalEvaluationResult, output_path: Path,
    ) -> None:
        """Export evaluation results to file."""
        output_data = asdict(result)

        with open(output_path, "w") as f:
            json.dump(output_data, f, indent=2, default=str)

        logger.info(f"Results exported to {output_path}")

    def generate_report(self, result: CulturalEvaluationResult) -> str:
        """Generate a comprehensive evaluation report."""
        report = f"""
# Cultural Evaluation Report

## Model: {result.model_name}
## Cultural Context: {result.cultural_context}
## Evaluation Date: {asyncio.get_event_loop().time()}

## Summary Statistics
- **Total Scenarios**: {result.total_scenarios}
- **Correct Responses**: {result.correct_responses}
- **Cultural Accuracy**: {result.cultural_accuracy:.2%}
- **Confidence Interval**: {result.confidence_interval[0]:.3f} - {result.confidence_interval[1]:.3f}

## Cultural Analysis
- **Cultural Bias Coefficient**: {result.cultural_bias_coefficient:.3f}
- **Politeness Disconnect**: {result.politeness_disconnect:.3f}
- **Statistical Significance**: {"Yes" if result.statistical_significance else "No"}
- **Effect Size**: {result.effect_size:.3f}

## Interpretation
"""

        if result.cultural_accuracy < 0.5:
            report += "- **Poor Cultural Understanding**: Model shows significant gaps in cultural comprehension\n"
        elif result.cultural_accuracy < 0.7:
            report += "- **Moderate Cultural Understanding**: Model shows some cultural awareness but needs improvement\n"
        else:
            report += "- **Good Cultural Understanding**: Model demonstrates strong cultural comprehension\n"

        if result.cultural_bias_coefficient > 0.3:
            report += "- **High Cultural Bias**: Model shows strong preference for non-cultural responses\n"

        if result.politeness_disconnect > 0.4:
            report += "- **Politeness-Culture Disconnect**: Standard politeness metrics fail to capture cultural appropriateness\n"

        return report
