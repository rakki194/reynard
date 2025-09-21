"""
Statistical Analyzer

Statistical analysis for experiment results.

Author: Recognition-Grandmaster-27 (Tiger Specialist)
Version: 1.0.0
"""

from typing import Dict, Any, List, Tuple
import numpy as np
from scipy import stats
import json
from dataclasses import asdict

from .config import ExperimentConfig
from .metrics import ReconstructionMetrics


class StatisticalAnalyzer:
    """Statistical analyzer for experiment results."""

    def __init__(self, config: ExperimentConfig):
        """Initialize statistical analyzer."""
        self.config = config
        self.significance_threshold = config.significance_threshold
        self.confidence_level = config.confidence_level

    async def analyze_results(
        self, trial_results: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Analyze experiment results."""

        analysis = {
            "descriptive_statistics": {},
            "comparative_analysis": {},
            "significance_testing": {},
            "effect_sizes": {},
            "confidence_intervals": {},
            "recommendations": [],
        }

        # Extract metrics by method
        method_metrics = self._extract_method_metrics(trial_results)

        # Calculate descriptive statistics
        analysis["descriptive_statistics"] = self._calculate_descriptive_statistics(
            method_metrics
        )

        # Perform comparative analysis
        analysis["comparative_analysis"] = self._perform_comparative_analysis(
            method_metrics
        )

        # Perform significance testing
        analysis["significance_testing"] = self._perform_significance_testing(
            method_metrics
        )

        # Calculate effect sizes
        analysis["effect_sizes"] = self._calculate_effect_sizes(method_metrics)

        # Calculate confidence intervals
        analysis["confidence_intervals"] = self._calculate_confidence_intervals(
            method_metrics
        )

        # Generate recommendations
        analysis["recommendations"] = self._generate_recommendations(analysis)

        return analysis

    def _extract_method_metrics(
        self, trial_results: List[Dict[str, Any]]
    ) -> Dict[str, List[Dict[str, float]]]:
        """Extract metrics by method from trial results."""

        method_metrics = {}

        for trial in trial_results:
            methods = trial.get("methods", {})

            # Extract baseline metrics
            if "baseline" in methods:
                baseline_methods = methods["baseline"]
                for method_name, method_data in baseline_methods.items():
                    key = f"baseline_{method_name}"
                    if key not in method_metrics:
                        method_metrics[key] = []
                    method_metrics[key].append(method_data["metrics"])

            # Extract PHOENIX metrics
            if "phoenix" in methods:
                phoenix_methods = methods["phoenix"]
                for method_name, method_data in phoenix_methods.items():
                    key = f"phoenix_{method_name}"
                    if key not in method_metrics:
                        method_metrics[key] = []
                    method_metrics[key].append(method_data["metrics"])

        return method_metrics

    def _calculate_descriptive_statistics(
        self, method_metrics: Dict[str, List[Dict[str, float]]]
    ) -> Dict[str, Any]:
        """Calculate descriptive statistics for each method."""

        descriptive_stats = {}

        for method_name, metrics_list in method_metrics.items():
            if not metrics_list:
                continue

            # Extract metric values
            metric_values = {}
            for metric_name in metrics_list[0].keys():
                values = [metrics[metric_name] for metrics in metrics_list]
                metric_values[metric_name] = values

            # Calculate statistics for each metric
            method_stats = {}
            for metric_name, values in metric_values.items():
                if values:
                    method_stats[metric_name] = {
                        "mean": np.mean(values),
                        "median": np.median(values),
                        "std": np.std(values),
                        "min": np.min(values),
                        "max": np.max(values),
                        "q25": np.percentile(values, 25),
                        "q75": np.percentile(values, 75),
                        "count": len(values),
                    }

            descriptive_stats[method_name] = method_stats

        return descriptive_stats

    def _perform_comparative_analysis(
        self, method_metrics: Dict[str, List[Dict[str, float]]]
    ) -> Dict[str, Any]:
        """Perform comparative analysis between methods."""

        comparative_analysis = {}

        # Compare baseline vs PHOENIX methods
        baseline_methods = [
            k for k in method_metrics.keys() if k.startswith("baseline_")
        ]
        phoenix_methods = [k for k in method_metrics.keys() if k.startswith("phoenix_")]

        if baseline_methods and phoenix_methods:
            # Compare best baseline vs best PHOENIX
            best_baseline = self._find_best_method(method_metrics, baseline_methods)
            best_phoenix = self._find_best_method(method_metrics, phoenix_methods)

            if best_baseline and best_phoenix:
                comparative_analysis["baseline_vs_phoenix"] = self._compare_methods(
                    method_metrics[best_baseline],
                    method_metrics[best_phoenix],
                    best_baseline,
                    best_phoenix,
                )

        # Compare within PHOENIX methods
        if len(phoenix_methods) > 1:
            for i, method1 in enumerate(phoenix_methods):
                for method2 in phoenix_methods[i + 1 :]:
                    comparison_key = f"{method1}_vs_{method2}"
                    comparative_analysis[comparison_key] = self._compare_methods(
                        method_metrics[method1],
                        method_metrics[method2],
                        method1,
                        method2,
                    )

        return comparative_analysis

    def _find_best_method(
        self, method_metrics: Dict[str, List[Dict[str, float]]], method_names: List[str]
    ) -> str:
        """Find the best method based on overall success."""

        best_method = None
        best_score = -1

        for method_name in method_names:
            if method_name in method_metrics and method_metrics[method_name]:
                # Calculate average overall success
                overall_success_values = [
                    metrics.get("overall_success", 0)
                    for metrics in method_metrics[method_name]
                ]
                if overall_success_values:
                    avg_score = np.mean(overall_success_values)
                    if avg_score > best_score:
                        best_score = avg_score
                        best_method = method_name

        return best_method

    def _compare_methods(
        self,
        method1_metrics: List[Dict[str, float]],
        method2_metrics: List[Dict[str, float]],
        method1_name: str,
        method2_name: str,
    ) -> Dict[str, Any]:
        """Compare two methods."""

        comparison = {
            "method1": method1_name,
            "method2": method2_name,
            "metric_comparisons": {},
        }

        # Compare each metric
        if method1_metrics and method2_metrics:
            common_metrics = set(method1_metrics[0].keys()) & set(
                method2_metrics[0].keys()
            )

            for metric_name in common_metrics:
                values1 = [metrics[metric_name] for metrics in method1_metrics]
                values2 = [metrics[metric_name] for metrics in method2_metrics]

                if values1 and values2:
                    comparison["metric_comparisons"][metric_name] = {
                        "method1_mean": np.mean(values1),
                        "method2_mean": np.mean(values2),
                        "difference": np.mean(values2) - np.mean(values1),
                        "percent_improvement": (
                            ((np.mean(values2) - np.mean(values1)) / np.mean(values1))
                            * 100
                            if np.mean(values1) != 0
                            else 0
                        ),
                    }

        return comparison

    def _perform_significance_testing(
        self, method_metrics: Dict[str, List[Dict[str, float]]]
    ) -> Dict[str, Any]:
        """Perform significance testing between methods."""

        significance_results = {}

        # Test baseline vs PHOENIX
        baseline_methods = [
            k for k in method_metrics.keys() if k.startswith("baseline_")
        ]
        phoenix_methods = [k for k in method_metrics.keys() if k.startswith("phoenix_")]

        if baseline_methods and phoenix_methods:
            best_baseline = self._find_best_method(method_metrics, baseline_methods)
            best_phoenix = self._find_best_method(method_metrics, phoenix_methods)

            if best_baseline and best_phoenix:
                significance_results["baseline_vs_phoenix"] = self._test_significance(
                    method_metrics[best_baseline],
                    method_metrics[best_phoenix],
                    best_baseline,
                    best_phoenix,
                )

        return significance_results

    def _test_significance(
        self,
        method1_metrics: List[Dict[str, float]],
        method2_metrics: List[Dict[str, float]],
        method1_name: str,
        method2_name: str,
    ) -> Dict[str, Any]:
        """Test significance between two methods."""

        significance_results = {
            "method1": method1_name,
            "method2": method2_name,
            "metric_tests": {},
        }

        if method1_metrics and method2_metrics:
            common_metrics = set(method1_metrics[0].keys()) & set(
                method2_metrics[0].keys()
            )

            for metric_name in common_metrics:
                values1 = [metrics[metric_name] for metrics in method1_metrics]
                values2 = [metrics[metric_name] for metrics in method2_metrics]

                if len(values1) >= 2 and len(values2) >= 2:
                    # Perform t-test
                    t_stat, p_value = stats.ttest_ind(values2, values1)

                    # Determine significance
                    is_significant = p_value < self.significance_threshold

                    significance_results["metric_tests"][metric_name] = {
                        "t_statistic": t_stat,
                        "p_value": p_value,
                        "is_significant": is_significant,
                        "effect_direction": (
                            "method2_better" if t_stat > 0 else "method1_better"
                        ),
                    }

        return significance_results

    def _calculate_effect_sizes(
        self, method_metrics: Dict[str, List[Dict[str, float]]]
    ) -> Dict[str, Any]:
        """Calculate effect sizes for method comparisons."""

        effect_sizes = {}

        # Calculate Cohen's d for baseline vs PHOENIX
        baseline_methods = [
            k for k in method_metrics.keys() if k.startswith("baseline_")
        ]
        phoenix_methods = [k for k in method_metrics.keys() if k.startswith("phoenix_")]

        if baseline_methods and phoenix_methods:
            best_baseline = self._find_best_method(method_metrics, baseline_methods)
            best_phoenix = self._find_best_method(method_metrics, phoenix_methods)

            if best_baseline and best_phoenix:
                effect_sizes["baseline_vs_phoenix"] = self._calculate_cohens_d(
                    method_metrics[best_baseline], method_metrics[best_phoenix]
                )

        return effect_sizes

    def _calculate_cohens_d(
        self,
        method1_metrics: List[Dict[str, float]],
        method2_metrics: List[Dict[str, float]],
    ) -> Dict[str, float]:
        """Calculate Cohen's d effect size."""

        cohens_d = {}

        if method1_metrics and method2_metrics:
            common_metrics = set(method1_metrics[0].keys()) & set(
                method2_metrics[0].keys()
            )

            for metric_name in common_metrics:
                values1 = [metrics[metric_name] for metrics in method1_metrics]
                values2 = [metrics[metric_name] for metrics in method2_metrics]

                if len(values1) >= 2 and len(values2) >= 2:
                    # Calculate Cohen's d
                    mean1, mean2 = np.mean(values1), np.mean(values2)
                    std1, std2 = np.std(values1, ddof=1), np.std(values2, ddof=1)

                    # Pooled standard deviation
                    pooled_std = np.sqrt(
                        ((len(values1) - 1) * std1**2 + (len(values2) - 1) * std2**2)
                        / (len(values1) + len(values2) - 2)
                    )

                    if pooled_std != 0:
                        d = (mean2 - mean1) / pooled_std
                        cohens_d[metric_name] = d

        return cohens_d

    def _calculate_confidence_intervals(
        self, method_metrics: Dict[str, List[Dict[str, float]]]
    ) -> Dict[str, Any]:
        """Calculate confidence intervals for method metrics."""

        confidence_intervals = {}

        for method_name, metrics_list in method_metrics.items():
            if not metrics_list:
                continue

            method_ci = {}
            for metric_name in metrics_list[0].keys():
                values = [metrics[metric_name] for metrics in metrics_list]
                if len(values) >= 2:
                    mean_val = np.mean(values)
                    std_val = np.std(values, ddof=1)
                    n = len(values)

                    # Calculate confidence interval
                    alpha = 1 - self.confidence_level
                    t_critical = stats.t.ppf(1 - alpha / 2, n - 1)
                    margin_error = t_critical * (std_val / np.sqrt(n))

                    method_ci[metric_name] = {
                        "mean": mean_val,
                        "lower_bound": mean_val - margin_error,
                        "upper_bound": mean_val + margin_error,
                        "margin_error": margin_error,
                    }

            confidence_intervals[method_name] = method_ci

        return confidence_intervals

    def _generate_recommendations(self, analysis: Dict[str, Any]) -> List[str]:
        """Generate recommendations based on analysis."""

        recommendations = []

        # Check significance results
        significance_results = analysis.get("significance_testing", {})
        if "baseline_vs_phoenix" in significance_results:
            baseline_vs_phoenix = significance_results["baseline_vs_phoenix"]
            metric_tests = baseline_vs_phoenix.get("metric_tests", {})

            significant_improvements = []
            for metric_name, test_result in metric_tests.items():
                if (
                    test_result.get("is_significant", False)
                    and test_result.get("effect_direction") == "method2_better"
                ):
                    significant_improvements.append(metric_name)

            if significant_improvements:
                recommendations.append(
                    f"PHOENIX methods show significant improvements over baseline in: {', '.join(significant_improvements)}"
                )
            else:
                recommendations.append(
                    "No significant improvements found between PHOENIX and baseline methods"
                )

        # Check effect sizes
        effect_sizes = analysis.get("effect_sizes", {})
        if "baseline_vs_phoenix" in effect_sizes:
            cohens_d = effect_sizes["baseline_vs_phoenix"]
            large_effects = [metric for metric, d in cohens_d.items() if abs(d) > 0.8]
            if large_effects:
                recommendations.append(
                    f"Large effect sizes observed for: {', '.join(large_effects)}"
                )

        # Check descriptive statistics
        descriptive_stats = analysis.get("descriptive_statistics", {})
        if descriptive_stats:
            best_method = max(
                descriptive_stats.keys(),
                key=lambda k: descriptive_stats[k]
                .get("overall_success", {})
                .get("mean", 0),
            )
            best_score = (
                descriptive_stats[best_method].get("overall_success", {}).get("mean", 0)
            )
            recommendations.append(
                f"Best performing method: {best_method} (overall success: {best_score:.3f})"
            )

        return recommendations
