"""Performance analysis tools for identifying bottlenecks and optimization opportunities.

This module provides comprehensive analysis of performance data including:
- Bottleneck identification
- Performance trend analysis
- Resource usage optimization recommendations
- Database query optimization suggestions
- Memory leak detection
"""

import logging
from collections import Counter
from dataclasses import dataclass
from datetime import datetime
from typing import Any

logger = logging.getLogger(__name__)


@dataclass
class BottleneckAnalysis:
    """Analysis of performance bottlenecks."""

    bottleneck_type: str
    severity: str  # 'low', 'medium', 'high', 'critical'
    description: str
    impact: str
    recommendations: list[str]
    affected_endpoints: list[str]
    metrics: dict[str, Any]


@dataclass
class PerformanceTrend:
    """Performance trend analysis."""

    metric_name: str
    trend_direction: str  # 'improving', 'degrading', 'stable'
    change_percentage: float
    time_period: str
    confidence: float


class PerformanceAnalyzer:
    """Comprehensive performance analysis engine."""

    def __init__(self, performance_tracker, memory_profiler):
        self.performance_tracker = performance_tracker
        self.memory_profiler = memory_profiler

    def analyze_bottlenecks(self) -> list[BottleneckAnalysis]:
        """Identify performance bottlenecks."""
        bottlenecks = []

        # Analyze endpoint performance
        endpoint_bottlenecks = self._analyze_endpoint_bottlenecks()
        bottlenecks.extend(endpoint_bottlenecks)

        # Analyze database performance
        db_bottlenecks = self._analyze_database_bottlenecks()
        bottlenecks.extend(db_bottlenecks)

        # Analyze memory usage
        memory_bottlenecks = self._analyze_memory_bottlenecks()
        bottlenecks.extend(memory_bottlenecks)

        # Analyze async task performance
        async_bottlenecks = self._analyze_async_bottlenecks()
        bottlenecks.extend(async_bottlenecks)

        return sorted(
            bottlenecks, key=lambda x: self._severity_score(x.severity), reverse=True,
        )

    def _analyze_endpoint_bottlenecks(self) -> list[BottleneckAnalysis]:
        """Analyze endpoint performance bottlenecks."""
        bottlenecks = []

        for endpoint, stats in self.performance_tracker.endpoint_stats.items():
            if stats["total_requests"] < 5:  # Skip endpoints with too few requests
                continue

            # Check for slow response times
            if (
                stats["avg_duration"] > 0.1
            ):  # > 100ms average (more realistic threshold)
                severity = "critical" if stats["avg_duration"] > 1.0 else "high"
                bottlenecks.append(
                    BottleneckAnalysis(
                        bottleneck_type="slow_endpoint",
                        severity=severity,
                        description=f"Endpoint {endpoint} has slow average response time",
                        impact=f"Average response time: {stats['avg_duration']:.2f}s",
                        recommendations=[
                            "Profile the endpoint code for performance issues",
                            "Check for inefficient database queries",
                            "Consider caching frequently accessed data",
                            "Optimize data serialization",
                            "Review external API calls",
                        ],
                        affected_endpoints=[endpoint],
                        metrics={
                            "avg_duration": stats["avg_duration"],
                            "max_duration": stats["max_duration"],
                            "request_count": stats["total_requests"],
                        },
                    ),
                )

            # Check for high error rates
            error_rate = (stats["error_count"] / stats["total_requests"]) * 100
            if error_rate > 10:  # > 10% error rate
                severity = "critical" if error_rate > 25 else "high"
                bottlenecks.append(
                    BottleneckAnalysis(
                        bottleneck_type="high_error_rate",
                        severity=severity,
                        description=f"Endpoint {endpoint} has high error rate",
                        impact=f"Error rate: {error_rate:.1f}%",
                        recommendations=[
                            "Review error logs for common failure patterns",
                            "Add input validation and error handling",
                            "Check database connection stability",
                            "Implement retry mechanisms for external services",
                            "Add monitoring and alerting for this endpoint",
                        ],
                        affected_endpoints=[endpoint],
                        metrics={
                            "error_rate": error_rate,
                            "error_count": stats["error_count"],
                            "total_requests": stats["total_requests"],
                        },
                    ),
                )

            # Check for memory usage spikes
            if stats["memory_usage"]:
                memory_values = list(stats["memory_usage"])
                avg_memory = sum(memory_values) / len(memory_values)
                max_memory = max(memory_values)

                if max_memory > avg_memory * 2:  # Memory spike detected
                    bottlenecks.append(
                        BottleneckAnalysis(
                            bottleneck_type="memory_spike",
                            severity="medium",
                            description=f"Endpoint {endpoint} shows memory usage spikes",
                            impact=f"Max memory: {max_memory/1024/1024:.1f}MB, Avg: {avg_memory/1024/1024:.1f}MB",
                            recommendations=[
                                "Check for memory leaks in the endpoint code",
                                "Review data structures for excessive memory usage",
                                "Consider implementing data pagination",
                                "Profile memory allocation patterns",
                            ],
                            affected_endpoints=[endpoint],
                            metrics={
                                "max_memory_mb": max_memory / 1024 / 1024,
                                "avg_memory_mb": avg_memory / 1024 / 1024,
                                "memory_spike_ratio": max_memory / avg_memory,
                            },
                        ),
                    )

        return bottlenecks

    def _analyze_database_bottlenecks(self) -> list[BottleneckAnalysis]:
        """Analyze database performance bottlenecks."""
        bottlenecks = []

        if not self.performance_tracker.db_queries:
            return bottlenecks

        # Analyze slow queries
        slow_queries = [
            q for q in self.performance_tracker.db_queries if q.duration > 0.05
        ]  # 50ms threshold
        if slow_queries:
            avg_slow_duration = sum(q.duration for q in slow_queries) / len(
                slow_queries,
            )
            severity = "critical" if avg_slow_duration > 1.0 else "high"

            bottlenecks.append(
                BottleneckAnalysis(
                    bottleneck_type="slow_database_queries",
                    severity=severity,
                    description=f"Found {len(slow_queries)} slow database queries",
                    impact=f"Average slow query duration: {avg_slow_duration:.2f}s",
                    recommendations=[
                        "Add database indexes for frequently queried columns",
                        "Optimize query structure and joins",
                        "Consider query result caching",
                        "Review database connection pool settings",
                        "Use database query profiling tools",
                    ],
                    affected_endpoints=[],
                    metrics={
                        "slow_query_count": len(slow_queries),
                        "avg_slow_duration": avg_slow_duration,
                        "total_queries": len(self.performance_tracker.db_queries),
                    },
                ),
            )

        # Analyze query frequency
        query_counts = Counter(q.query for q in self.performance_tracker.db_queries)
        frequent_queries = [
            (query, count) for query, count in query_counts.items() if count > 10
        ]

        if frequent_queries:
            bottlenecks.append(
                BottleneckAnalysis(
                    bottleneck_type="frequent_database_queries",
                    severity="medium",
                    description="High frequency database queries detected",
                    impact=f"Most frequent query executed {max(count for _, count in frequent_queries)} times",
                    recommendations=[
                        "Implement query result caching",
                        "Consider database connection pooling",
                        "Review query optimization opportunities",
                        "Use prepared statements for repeated queries",
                    ],
                    affected_endpoints=[],
                    metrics={
                        "frequent_queries": frequent_queries[:5],  # Top 5
                        "total_unique_queries": len(query_counts),
                    },
                ),
            )

        return bottlenecks

    def _analyze_memory_bottlenecks(self) -> list[BottleneckAnalysis]:
        """Analyze memory usage bottlenecks."""
        bottlenecks = []

        memory_summary = self.memory_profiler.get_memory_summary()
        if "message" in memory_summary:
            return bottlenecks

        current_memory = memory_summary.get("current_memory_mb", 0)
        avg_memory = memory_summary.get("avg_memory_mb", 0)
        max_memory = memory_summary.get("max_memory_mb", 0)
        memory_trend = memory_summary.get("memory_trend", "stable")

        # Check for high memory usage
        if current_memory > 500:  # > 500MB
            severity = "critical" if current_memory > 1000 else "high"
            bottlenecks.append(
                BottleneckAnalysis(
                    bottleneck_type="high_memory_usage",
                    severity=severity,
                    description="High memory usage detected",
                    impact=f"Current memory usage: {current_memory:.1f}MB",
                    recommendations=[
                        "Profile memory allocation patterns",
                        "Check for memory leaks",
                        "Review data structures for memory efficiency",
                        "Consider implementing memory limits",
                        "Use memory profiling tools",
                    ],
                    affected_endpoints=[],
                    metrics={
                        "current_memory_mb": current_memory,
                        "avg_memory_mb": avg_memory,
                        "max_memory_mb": max_memory,
                    },
                ),
            )

        # Check for memory leaks
        if memory_trend == "increasing" and current_memory > avg_memory * 1.5:
            bottlenecks.append(
                BottleneckAnalysis(
                    bottleneck_type="potential_memory_leak",
                    severity="high",
                    description="Potential memory leak detected",
                    impact=f"Memory trend: {memory_trend}, Current: {current_memory:.1f}MB, Avg: {avg_memory:.1f}MB",
                    recommendations=[
                        "Run memory profiling to identify leak sources",
                        "Check for circular references",
                        "Review object lifecycle management",
                        "Implement memory monitoring and alerts",
                        "Consider garbage collection tuning",
                    ],
                    affected_endpoints=[],
                    metrics={
                        "memory_trend": memory_trend,
                        "current_memory_mb": current_memory,
                        "avg_memory_mb": avg_memory,
                        "memory_growth_ratio": current_memory / avg_memory,
                    },
                ),
            )

        return bottlenecks

    def _analyze_async_bottlenecks(self) -> list[BottleneckAnalysis]:
        """Analyze async task performance bottlenecks."""
        bottlenecks = []

        if not self.performance_tracker.async_tasks:
            return bottlenecks

        # Analyze slow async tasks
        slow_tasks = [
            t for t in self.performance_tracker.async_tasks if t.duration > 0.1
        ]  # 100ms threshold
        if slow_tasks:
            task_counts = Counter(t.task_name for t in slow_tasks)
            avg_slow_duration = sum(t.duration for t in slow_tasks) / len(slow_tasks)
            severity = "critical" if avg_slow_duration > 2.0 else "high"

            bottlenecks.append(
                BottleneckAnalysis(
                    bottleneck_type="slow_async_tasks",
                    severity=severity,
                    description=f"Found {len(slow_tasks)} slow async tasks",
                    impact=f"Average slow task duration: {avg_slow_duration:.2f}s",
                    recommendations=[
                        "Profile async task execution",
                        "Check for blocking operations in async code",
                        "Consider task parallelization",
                        "Review external service response times",
                        "Implement task timeout mechanisms",
                    ],
                    affected_endpoints=[],
                    metrics={
                        "slow_task_count": len(slow_tasks),
                        "avg_slow_duration": avg_slow_duration,
                        "slow_tasks_by_name": dict(task_counts.most_common(5)),
                    },
                ),
            )

        # Analyze task failure rates
        failed_tasks = [
            t for t in self.performance_tracker.async_tasks if not t.success
        ]
        if failed_tasks:
            failure_rate = (
                len(failed_tasks) / len(self.performance_tracker.async_tasks)
            ) * 100
            if failure_rate > 5:  # > 5% failure rate
                severity = "critical" if failure_rate > 20 else "high"
                bottlenecks.append(
                    BottleneckAnalysis(
                        bottleneck_type="high_async_task_failure_rate",
                        severity=severity,
                        description="High async task failure rate detected",
                        impact=f"Task failure rate: {failure_rate:.1f}%",
                        recommendations=[
                            "Review error logs for failed tasks",
                            "Implement better error handling and retry logic",
                            "Check external service availability",
                            "Add task monitoring and alerting",
                            "Consider circuit breaker patterns",
                        ],
                        affected_endpoints=[],
                        metrics={
                            "failure_rate": failure_rate,
                            "failed_task_count": len(failed_tasks),
                            "total_task_count": len(
                                self.performance_tracker.async_tasks,
                            ),
                        },
                    ),
                )

        return bottlenecks

    def analyze_performance_trends(
        self, time_period_hours: int = 24,
    ) -> list[PerformanceTrend]:
        """Analyze performance trends over time."""
        trends = []

        # Get recent metrics
        recent_metrics = list(self.performance_tracker.metrics_history)
        if len(recent_metrics) < 10:
            return trends

        # Analyze response time trend
        response_times = [m.duration for m in recent_metrics]
        if len(response_times) > 1:
            trend_direction = self._calculate_trend_direction(response_times)
            change_percentage = self._calculate_change_percentage(response_times)

            trends.append(
                PerformanceTrend(
                    metric_name="response_time",
                    trend_direction=trend_direction,
                    change_percentage=change_percentage,
                    time_period=f"{time_period_hours}h",
                    confidence=self._calculate_confidence(response_times),
                ),
            )

        # Analyze error rate trend
        error_rates = []
        for i in range(0, len(recent_metrics), 10):  # Sample every 10 requests
            batch = recent_metrics[i : i + 10]
            error_rate = (
                sum(1 for m in batch if m.status_code >= 400) / len(batch) * 100
            )
            error_rates.append(error_rate)

        if len(error_rates) > 1:
            trend_direction = self._calculate_trend_direction(error_rates)
            change_percentage = self._calculate_change_percentage(error_rates)

            trends.append(
                PerformanceTrend(
                    metric_name="error_rate",
                    trend_direction=trend_direction,
                    change_percentage=change_percentage,
                    time_period=f"{time_period_hours}h",
                    confidence=self._calculate_confidence(error_rates),
                ),
            )

        return trends

    def _calculate_trend_direction(self, values: list[float]) -> str:
        """Calculate trend direction from a list of values."""
        if len(values) < 2:
            return "stable"

        # Simple linear regression slope
        n = len(values)
        x_mean = (n - 1) / 2
        y_mean = sum(values) / n

        numerator = sum((i - x_mean) * (values[i] - y_mean) for i in range(n))
        denominator = sum((i - x_mean) ** 2 for i in range(n))

        if denominator == 0:
            return "stable"

        slope = numerator / denominator

        if slope > 0.01:  # More sensitive threshold
            return "degrading"
        if slope < -0.01:
            return "improving"
        return "stable"

    def _calculate_change_percentage(self, values: list[float]) -> float:
        """Calculate percentage change from first to last value."""
        if len(values) < 2:
            return 0.0

        first_value = values[0]
        last_value = values[-1]

        if first_value == 0:
            return 0.0

        return ((last_value - first_value) / first_value) * 100

    def _calculate_confidence(self, values: list[float]) -> float:
        """Calculate confidence in trend analysis."""
        if len(values) < 3:
            return 0.0

        # Simple confidence based on variance
        mean_value = sum(values) / len(values)
        variance = sum((v - mean_value) ** 2 for v in values) / len(values)
        std_dev = variance**0.5

        # Lower variance = higher confidence
        if mean_value == 0:
            return 0.0

        coefficient_of_variation = std_dev / mean_value
        confidence = max(0.0, 1.0 - coefficient_of_variation)

        return min(1.0, confidence)

    def _severity_score(self, severity: str) -> int:
        """Convert severity to numeric score for sorting."""
        severity_scores = {"low": 1, "medium": 2, "high": 3, "critical": 4}
        return severity_scores.get(severity, 0)

    def generate_optimization_report(self) -> dict[str, Any]:
        """Generate comprehensive optimization report."""
        bottlenecks = self.analyze_bottlenecks()
        trends = self.analyze_performance_trends()
        performance_summary = self.performance_tracker.get_performance_summary()
        memory_summary = self.memory_profiler.get_memory_summary()

        # Categorize bottlenecks by severity
        critical_bottlenecks = [b for b in bottlenecks if b.severity == "critical"]
        high_bottlenecks = [b for b in bottlenecks if b.severity == "high"]
        medium_bottlenecks = [b for b in bottlenecks if b.severity == "medium"]
        low_bottlenecks = [b for b in bottlenecks if b.severity == "low"]

        # Generate priority recommendations
        priority_recommendations = []
        for bottleneck in critical_bottlenecks + high_bottlenecks:
            priority_recommendations.extend(
                bottleneck.recommendations[:2],
            )  # Top 2 recommendations

        return {
            "report_timestamp": datetime.now().isoformat(),
            "performance_summary": performance_summary,
            "memory_summary": memory_summary,
            "bottlenecks": {
                "critical": len(critical_bottlenecks),
                "high": len(high_bottlenecks),
                "medium": len(medium_bottlenecks),
                "low": len(low_bottlenecks),
                "total": len(bottlenecks),
            },
            "bottleneck_details": [
                {
                    "type": b.bottleneck_type,
                    "severity": b.severity,
                    "description": b.description,
                    "impact": b.impact,
                    "recommendations": b.recommendations,
                    "affected_endpoints": b.affected_endpoints,
                    "metrics": b.metrics,
                }
                for b in bottlenecks
            ],
            "performance_trends": [
                {
                    "metric": t.metric_name,
                    "trend": t.trend_direction,
                    "change_percent": t.change_percentage,
                    "confidence": t.confidence,
                }
                for t in trends
            ],
            "priority_recommendations": list(
                set(priority_recommendations),
            ),  # Remove duplicates
            "optimization_score": self._calculate_optimization_score(
                bottlenecks, trends,
            ),
        }

    def _calculate_optimization_score(
        self, bottlenecks: list[BottleneckAnalysis], trends: list[PerformanceTrend],
    ) -> dict[str, Any]:
        """Calculate overall optimization score."""
        if not bottlenecks:
            return {
                "score": 100,
                "grade": "A",
                "description": "No performance issues detected",
            }

        # Calculate score based on bottleneck severity
        severity_weights = {"critical": 25, "high": 15, "medium": 8, "low": 3}
        total_penalty = sum(severity_weights.get(b.severity, 0) for b in bottlenecks)

        # Adjust for trends
        trend_adjustment = 0
        for trend in trends:
            if trend.trend_direction == "degrading":
                trend_adjustment += 5
            elif trend.trend_direction == "improving":
                trend_adjustment -= 2

        score = max(0, 100 - total_penalty - trend_adjustment)

        # Determine grade
        if score >= 90:
            grade = "A"
        elif score >= 80:
            grade = "B"
        elif score >= 70:
            grade = "C"
        elif score >= 60:
            grade = "D"
        else:
            grade = "F"

        return {
            "score": score,
            "grade": grade,
            "description": f"Performance score: {score}/100 (Grade: {grade})",
            "penalty_breakdown": {
                "bottleneck_penalty": total_penalty,
                "trend_adjustment": trend_adjustment,
            },
        }
