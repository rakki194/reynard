"""
Statistical Analysis Framework for Cultural AI Evaluation

Comprehensive statistical analysis tools for evaluating cultural AI alignment,
including significance testing, effect size calculation, and confidence intervals.

Implements the rigorous statistical methodology from TaarofBench research.
"""

import logging
from typing import Any

import numpy as np
from scipy import stats

logger = logging.getLogger(__name__)


class StatisticalAnalyzer:
    """
    Comprehensive statistical analysis framework for cultural AI evaluation.

    Provides rigorous statistical testing, effect size calculation, and
    confidence interval estimation for cultural alignment assessment.
    """

    def __init__(self, alpha: float = 0.05):
        """Initialize statistical analyzer with significance level."""
        self.alpha = alpha
        self.effect_size_thresholds = {"small": 0.2, "medium": 0.5, "large": 0.8}

    def analyze_results(
        self,
        validation_results: list[dict[str, Any]],
        scenarios: list[dict[str, Any]],
        cultural_context: str,
    ) -> dict[str, Any]:
        """
        Perform comprehensive statistical analysis of evaluation results.

        Args:
            validation_results: Model validation results
            scenarios: Original scenarios used
            cultural_context: Cultural context for analysis

        Returns:
            Comprehensive statistical analysis results
        """
        logger.info(f"Performing statistical analysis for {cultural_context}")

        # Basic descriptive statistics
        descriptive_stats = self._calculate_descriptive_statistics(validation_results)

        # Confidence interval for accuracy
        confidence_interval = self._calculate_confidence_interval(
            validation_results, cultural_context
        )

        # Effect size calculation
        effect_size = self._calculate_effect_size(validation_results, scenarios)

        # Statistical significance testing
        significance_test = self._test_statistical_significance(
            validation_results, scenarios
        )

        # Cultural bias analysis
        bias_analysis = self._analyze_cultural_bias(validation_results, scenarios)

        # Politeness disconnect analysis
        politeness_analysis = self._analyze_politeness_disconnect(validation_results)

        return {
            "descriptive_statistics": descriptive_stats,
            "confidence_interval": confidence_interval,
            "effect_size": effect_size,
            "significance_test": significance_test,
            "bias_analysis": bias_analysis,
            "politeness_analysis": politeness_analysis,
            "significant": significance_test["p_value"] < self.alpha,
            "p_value": significance_test["p_value"],
        }

    def _calculate_descriptive_statistics(
        self, validation_results: list[dict[str, Any]]
    ) -> dict[str, Any]:
        """Calculate descriptive statistics for validation results."""
        if not validation_results:
            return {}

        # Extract metrics
        cultural_scores = [r["cultural_score"] for r in validation_results]
        politeness_scores = [r["politeness_score"] for r in validation_results]
        culturally_appropriate = [
            r["culturally_appropriate"] for r in validation_results
        ]

        return {
            "total_responses": len(validation_results),
            "culturally_appropriate_count": sum(culturally_appropriate),
            "cultural_accuracy": np.mean(culturally_appropriate),
            "cultural_score_mean": np.mean(cultural_scores),
            "cultural_score_std": np.std(cultural_scores),
            "politeness_score_mean": np.mean(politeness_scores),
            "politeness_score_std": np.std(politeness_scores),
            "cultural_score_median": np.median(cultural_scores),
            "politeness_score_median": np.median(politeness_scores),
        }

    def _calculate_confidence_interval(
        self,
        validation_results: list[dict[str, Any]],
        cultural_context: str,
        confidence_level: float = 0.95,
    ) -> tuple[float, float]:
        """Calculate confidence interval for cultural accuracy."""
        if not validation_results:
            return (0.0, 0.0)

        culturally_appropriate = [
            r["culturally_appropriate"] for r in validation_results
        ]
        n = len(culturally_appropriate)
        p = np.mean(culturally_appropriate)

        # Use Wilson score interval for better small sample performance
        alpha = 1 - confidence_level
        z = stats.norm.ppf(1 - alpha / 2)

        # Wilson score interval
        denominator = 1 + z**2 / n
        centre_adjusted_probability = (p + z**2 / (2 * n)) / denominator
        adjusted_standard_deviation = (
            np.sqrt((p * (1 - p) + z**2 / (4 * n)) / n) / denominator
        )

        lower_bound = centre_adjusted_probability - z * adjusted_standard_deviation
        upper_bound = centre_adjusted_probability + z * adjusted_standard_deviation

        return (max(0, lower_bound), min(1, upper_bound))

    def _calculate_effect_size(
        self, validation_results: list[dict[str, Any]], scenarios: list[dict[str, Any]]
    ) -> dict[str, float]:
        """Calculate effect sizes for cultural performance."""
        if not validation_results:
            return {"cohens_d": 0.0, "effect_size_category": "none"}

        # Separate taarof-expected and non-taarof scenarios
        taarof_results = []
        non_taarof_results = []

        for i, result in enumerate(validation_results):
            scenario = scenarios[i] if i < len(scenarios) else {}
            if scenario.get("taarof_expected", False):
                taarof_results.append(result["cultural_score"])
            else:
                non_taarof_results.append(result["cultural_score"])

        if not taarof_results or not non_taarof_results:
            return {"cohens_d": 0.0, "effect_size_category": "none"}

        # Calculate Cohen's d
        mean_taarof = np.mean(taarof_results)
        mean_non_taarof = np.mean(non_taarof_results)
        std_taarof = np.std(taarof_results, ddof=1)
        std_non_taarof = np.std(non_taarof_results, ddof=1)

        # Pooled standard deviation
        n_taarof = len(taarof_results)
        n_non_taarof = len(non_taarof_results)
        pooled_std = np.sqrt(
            ((n_taarof - 1) * std_taarof**2 + (n_non_taarof - 1) * std_non_taarof**2)
            / (n_taarof + n_non_taarof - 2)
        )

        cohens_d = (
            (mean_taarof - mean_non_taarof) / pooled_std if pooled_std > 0 else 0.0
        )

        # Categorize effect size
        abs_d = abs(cohens_d)
        if abs_d < self.effect_size_thresholds["small"]:
            category = "none"
        elif abs_d < self.effect_size_thresholds["medium"]:
            category = "small"
        elif abs_d < self.effect_size_thresholds["large"]:
            category = "medium"
        else:
            category = "large"

        return {
            "cohens_d": cohens_d,
            "effect_size_category": category,
            "taarof_mean": mean_taarof,
            "non_taarof_mean": mean_non_taarof,
            "taarof_std": std_taarof,
            "non_taarof_std": std_non_taarof,
        }

    def _test_statistical_significance(
        self, validation_results: list[dict[str, Any]], scenarios: list[dict[str, Any]]
    ) -> dict[str, Any]:
        """Test statistical significance of cultural performance differences."""
        if not validation_results:
            return {"test_type": "none", "p_value": 1.0, "significant": False}

        # Separate taarof-expected and non-taarof scenarios
        taarof_scores = []
        non_taarof_scores = []

        for i, result in enumerate(validation_results):
            scenario = scenarios[i] if i < len(scenarios) else {}
            if scenario.get("taarof_expected", False):
                taarof_scores.append(result["cultural_score"])
            else:
                non_taarof_scores.append(result["cultural_score"])

        if not taarof_scores or not non_taarof_scores:
            return {"test_type": "none", "p_value": 1.0, "significant": False}

        # Perform appropriate statistical test
        if len(taarof_scores) >= 30 and len(non_taarof_scores) >= 30:
            # Use t-test for large samples
            statistic, p_value = stats.ttest_ind(taarof_scores, non_taarof_scores)
            test_type = "independent_t_test"
        else:
            # Use Mann-Whitney U test for small samples or non-normal data
            statistic, p_value = stats.mannwhitneyu(
                taarof_scores, non_taarof_scores, alternative="two-sided"
            )
            test_type = "mann_whitney_u"

        return {
            "test_type": test_type,
            "statistic": statistic,
            "p_value": p_value,
            "significant": p_value < self.alpha,
            "taarof_n": len(taarof_scores),
            "non_taarof_n": len(non_taarof_scores),
        }

    def _analyze_cultural_bias(
        self, validation_results: list[dict[str, Any]], scenarios: list[dict[str, Any]]
    ) -> dict[str, Any]:
        """Analyze cultural bias in model responses."""
        if not validation_results:
            return {"bias_coefficient": 0.0, "bias_category": "none"}

        # Calculate accuracy for taarof-expected vs non-taarof scenarios
        taarof_appropriate = 0
        taarof_total = 0
        non_taarof_appropriate = 0
        non_taarof_total = 0

        for i, result in enumerate(validation_results):
            scenario = scenarios[i] if i < len(scenarios) else {}
            if scenario.get("taarof_expected", False):
                taarof_total += 1
                if result["culturally_appropriate"]:
                    taarof_appropriate += 1
            else:
                non_taarof_total += 1
                if result["culturally_appropriate"]:
                    non_taarof_appropriate += 1

        if taarof_total == 0 or non_taarof_total == 0:
            return {"bias_coefficient": 0.0, "bias_category": "none"}

        taarof_accuracy = taarof_appropriate / taarof_total
        non_taarof_accuracy = non_taarof_appropriate / non_taarof_total

        # Calculate bias coefficient
        bias_coefficient = (
            (non_taarof_accuracy - taarof_accuracy) / non_taarof_accuracy
            if non_taarof_accuracy > 0
            else 0.0
        )

        # Categorize bias
        if bias_coefficient < 0.1:
            bias_category = "minimal"
        elif bias_coefficient < 0.3:
            bias_category = "moderate"
        elif bias_coefficient < 0.5:
            bias_category = "significant"
        else:
            bias_category = "severe"

        return {
            "bias_coefficient": bias_coefficient,
            "bias_category": bias_category,
            "taarof_accuracy": taarof_accuracy,
            "non_taarof_accuracy": non_taarof_accuracy,
            "taarof_count": taarof_total,
            "non_taarof_count": non_taarof_total,
        }

    def _analyze_politeness_disconnect(
        self, validation_results: list[dict[str, Any]]
    ) -> dict[str, Any]:
        """Analyze disconnect between politeness and cultural appropriateness."""
        if not validation_results:
            return {"disconnect_coefficient": 0.0, "disconnect_category": "none"}

        # Count responses by politeness and cultural appropriateness
        polite_culturally_appropriate = 0
        polite_total = 0
        culturally_appropriate_total = 0
        total_responses = len(validation_results)

        for result in validation_results:
            is_polite = result["politeness_score"] > 0.7
            is_culturally_appropriate = result["culturally_appropriate"]

            if is_polite:
                polite_total += 1
                if is_culturally_appropriate:
                    polite_culturally_appropriate += 1

            if is_culturally_appropriate:
                culturally_appropriate_total += 1

        if polite_total == 0 or total_responses == 0:
            return {"disconnect_coefficient": 0.0, "disconnect_category": "none"}

        politeness_rate = polite_total / total_responses
        cultural_appropriateness_rate = culturally_appropriate_total / total_responses
        polite_cultural_rate = (
            polite_culturally_appropriate / polite_total if polite_total > 0 else 0.0
        )

        # Calculate disconnect coefficient
        disconnect_coefficient = (
            abs(politeness_rate - polite_cultural_rate) / politeness_rate
            if politeness_rate > 0
            else 0.0
        )

        # Categorize disconnect
        if disconnect_coefficient < 0.2:
            disconnect_category = "minimal"
        elif disconnect_coefficient < 0.4:
            disconnect_category = "moderate"
        elif disconnect_coefficient < 0.6:
            disconnect_category = "significant"
        else:
            disconnect_category = "severe"

        return {
            "disconnect_coefficient": disconnect_coefficient,
            "disconnect_category": disconnect_category,
            "politeness_rate": politeness_rate,
            "cultural_appropriateness_rate": cultural_appropriateness_rate,
            "polite_cultural_rate": polite_cultural_rate,
            "polite_count": polite_total,
            "culturally_appropriate_count": culturally_appropriate_total,
        }

    def compare_groups(
        self, accuracies: list[float], group_names: list[str]
    ) -> dict[str, Any]:
        """Compare performance across multiple groups/models."""
        if len(accuracies) < 2:
            return {"test_type": "none", "p_value": 1.0, "significant": False}

        # Perform ANOVA for multiple groups
        if len(accuracies) >= 3:
            # One-way ANOVA
            statistic, p_value = stats.f_oneway(*accuracies)
            test_type = "one_way_anova"
        else:
            # Independent t-test for two groups
            statistic, p_value = stats.ttest_ind(accuracies[0], accuracies[1])
            test_type = "independent_t_test"

        # Calculate effect size (eta-squared for ANOVA)
        if test_type == "one_way_anova":
            # Simplified eta-squared calculation
            total_variance = np.var(accuracies)
            effect_size = total_variance / (
                total_variance + np.mean([np.var(group) for group in accuracies])
            )
        else:
            # Cohen's d for t-test
            pooled_std = np.sqrt((np.var(accuracies[0]) + np.var(accuracies[1])) / 2)
            effect_size = (
                abs(np.mean(accuracies[0]) - np.mean(accuracies[1])) / pooled_std
                if pooled_std > 0
                else 0.0
            )

        return {
            "test_type": test_type,
            "statistic": statistic,
            "p_value": p_value,
            "significant": p_value < self.alpha,
            "effect_size": effect_size,
            "group_means": {
                name: np.mean(acc)
                for name, acc in zip(group_names, accuracies, strict=False)
            },
            "group_stds": {
                name: np.std(acc)
                for name, acc in zip(group_names, accuracies, strict=False)
            },
        }

    def power_analysis(
        self, effect_size: float, sample_size: int, alpha: float | None = None
    ) -> dict[str, float]:
        """Perform statistical power analysis."""
        if alpha is None:
            alpha = self.alpha

        # Calculate power for t-test
        # This is a simplified calculation
        z_alpha = stats.norm.ppf(1 - alpha / 2)
        z_beta = effect_size * np.sqrt(sample_size / 2) - z_alpha
        power = stats.norm.cdf(z_beta)

        return {
            "power": power,
            "effect_size": effect_size,
            "sample_size": sample_size,
            "alpha": alpha,
            "beta": 1 - power,
        }

    def generate_statistical_report(self, analysis_results: dict[str, Any]) -> str:
        """Generate comprehensive statistical report."""
        report = f"""
# Statistical Analysis Report

## Descriptive Statistics
- **Total Responses**: {analysis_results["descriptive_statistics"].get("total_responses", 0)}
- **Cultural Accuracy**: {analysis_results["descriptive_statistics"].get("cultural_accuracy", 0):.3f}
- **Cultural Score Mean**: {analysis_results["descriptive_statistics"].get("cultural_score_mean", 0):.3f} ± {analysis_results["descriptive_statistics"].get("cultural_score_std", 0):.3f}
- **Politeness Score Mean**: {analysis_results["descriptive_statistics"].get("politeness_score_mean", 0):.3f} ± {analysis_results["descriptive_statistics"].get("politeness_score_std", 0):.3f}

## Confidence Interval
- **95% CI for Cultural Accuracy**: [{analysis_results["confidence_interval"][0]:.3f}, {analysis_results["confidence_interval"][1]:.3f}]

## Effect Size Analysis
- **Cohen's d**: {analysis_results["effect_size"]["cohens_d"]:.3f}
- **Effect Size Category**: {analysis_results["effect_size"]["effect_size_category"]}

## Statistical Significance
- **Test Type**: {analysis_results["significance_test"]["test_type"]}
- **P-value**: {analysis_results["significance_test"]["p_value"]:.6f}
- **Significant**: {"Yes" if analysis_results["significant"] else "No"}

## Cultural Bias Analysis
- **Bias Coefficient**: {analysis_results["bias_analysis"]["bias_coefficient"]:.3f}
- **Bias Category**: {analysis_results["bias_analysis"]["bias_category"]}
- **Taarof Accuracy**: {analysis_results["bias_analysis"]["taarof_accuracy"]:.3f}
- **Non-Taarof Accuracy**: {analysis_results["bias_analysis"]["non_taarof_accuracy"]:.3f}

## Politeness Disconnect Analysis
- **Disconnect Coefficient**: {analysis_results["politeness_analysis"]["disconnect_coefficient"]:.3f}
- **Disconnect Category**: {analysis_results["politeness_analysis"]["disconnect_category"]}
- **Politeness Rate**: {analysis_results["politeness_analysis"]["politeness_rate"]:.3f}
- **Cultural Appropriateness Rate**: {analysis_results["politeness_analysis"]["cultural_appropriateness_rate"]:.3f}
"""

        return report
