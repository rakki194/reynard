"""🦊 Reynard RAG Query Analytics
=============================

Comprehensive query analytics system for RAG service with performance tracking,
usage insights, and intelligent optimization recommendations.

This module provides:
- Query performance tracking and metrics
- Usage pattern analysis and insights
- Search effectiveness measurement
- Performance optimization recommendations
- Real-time analytics dashboard data
- Historical trend analysis
- User behavior analytics

Author: Reynard Development Team
Version: 1.0.0
"""

import json
import time
from collections import defaultdict, deque
from dataclasses import dataclass, field
from typing import Any

from ...core.logging_config import get_service_logger

logger = get_service_logger("rag")


@dataclass
class QueryMetrics:
    """Individual query performance metrics."""

    query_id: str
    query_text: str
    timestamp: float
    processing_time: float
    embedding_time: float
    search_time: float
    total_time: float
    results_count: int
    top_score: float
    avg_score: float
    user_satisfaction: float | None = None
    click_through_rate: float | None = None
    session_id: str = ""
    user_id: str = ""


@dataclass
class PerformanceStats:
    """Aggregated performance statistics."""

    total_queries: int
    avg_processing_time: float
    avg_embedding_time: float
    avg_search_time: float
    avg_total_time: float
    avg_results_count: float
    avg_top_score: float
    avg_avg_score: float
    p95_processing_time: float
    p99_processing_time: float
    success_rate: float
    error_rate: float


@dataclass
class UsageInsights:
    """Usage pattern insights and analytics."""

    popular_queries: list[tuple[str, int]]
    query_trends: dict[str, list[tuple[float, int]]]
    peak_usage_hours: list[int]
    user_behavior_patterns: dict[str, Any]
    search_effectiveness: dict[str, float]
    optimization_opportunities: list[str]


@dataclass
class AnalyticsReport:
    """Comprehensive analytics report."""

    report_id: str
    generated_at: float
    time_period: str
    performance_stats: PerformanceStats
    usage_insights: UsageInsights
    recommendations: list[str]
    metadata: dict[str, Any] = field(default_factory=dict)


class QueryAnalyticsCollector:
    """Advanced query analytics collection and analysis system.

    Tracks query performance, usage patterns, and provides
    intelligent insights for RAG service optimization.
    """

    def __init__(self, max_history_size: int = 10000, retention_days: int = 30):
        self.max_history_size = max_history_size
        self.retention_days = retention_days
        self.query_history: deque = deque(maxlen=max_history_size)
        self.performance_metrics: deque = deque(maxlen=max_history_size)
        self.user_sessions: dict[str, list[str]] = defaultdict(list)
        self.query_feedback: dict[str, list[dict[str, Any]]] = defaultdict(list)
        self.analytics_cache: dict[str, Any] = {}
        self.cache_ttl = 300  # 5 minutes

    async def record_query_metrics(
        self,
        query_id: str,
        query_text: str,
        processing_time: float,
        embedding_time: float,
        search_time: float,
        results_count: int,
        top_score: float,
        avg_score: float,
        session_id: str = "",
        user_id: str = "",
    ) -> None:
        """Record comprehensive query metrics.

        Args:
            query_id: Unique identifier for the query
            query_text: The search query text
            processing_time: Time spent processing the query
            embedding_time: Time spent generating embeddings
            search_time: Time spent searching the index
            results_count: Number of results returned
            top_score: Score of the top result
            avg_score: Average score of all results
            session_id: Optional session identifier
            user_id: Optional user identifier

        """
        try:
            total_time = processing_time + embedding_time + search_time

            metrics = QueryMetrics(
                query_id=query_id,
                query_text=query_text,
                timestamp=time.time(),
                processing_time=processing_time,
                embedding_time=embedding_time,
                search_time=search_time,
                total_time=total_time,
                results_count=results_count,
                top_score=top_score,
                avg_score=avg_score,
                session_id=session_id,
                user_id=user_id,
            )

            self.performance_metrics.append(metrics)

            # Track user sessions
            if session_id:
                self.user_sessions[session_id].append(query_id)

            # Invalidate analytics cache
            self._invalidate_cache()

            logger.debug(
                f"Recorded metrics for query {query_id}: {total_time:.3f}s total",
            )

        except Exception as e:
            logger.error(f"Failed to record query metrics: {e}")

    async def record_user_feedback(
        self,
        query_id: str,
        feedback_type: str,
        rating: float | None = None,
        comments: str | None = None,
        clicked_results: list[str] | None = None,
    ) -> None:
        """Record user feedback for a query.

        Args:
            query_id: Query identifier
            feedback_type: Type of feedback (satisfaction, click, rating, etc.)
            rating: Optional rating score (0.0 to 1.0)
            comments: Optional user comments
            clicked_results: Optional list of clicked result IDs

        """
        try:
            feedback = {
                "timestamp": time.time(),
                "feedback_type": feedback_type,
                "rating": rating,
                "comments": comments,
                "clicked_results": clicked_results or [],
            }

            self.query_feedback[query_id].append(feedback)

            # Update metrics if we have the query
            for metrics in self.performance_metrics:
                if metrics.query_id == query_id:
                    if feedback_type == "satisfaction" and rating is not None:
                        metrics.user_satisfaction = rating
                    elif feedback_type == "click" and clicked_results:
                        metrics.click_through_rate = len(clicked_results) / max(
                            metrics.results_count, 1,
                        )
                    break

            logger.debug(f"Recorded {feedback_type} feedback for query {query_id}")

        except Exception as e:
            logger.error(f"Failed to record user feedback: {e}")

    async def get_performance_stats(
        self, time_window_hours: int = 24,
    ) -> PerformanceStats:
        """Get aggregated performance statistics.

        Args:
            time_window_hours: Time window for analysis in hours

        Returns:
            Performance statistics for the specified time window

        """
        try:
            cache_key = f"performance_stats_{time_window_hours}"
            cached_result = self._get_cached_result(cache_key)
            if cached_result:
                return cached_result

            cutoff_time = time.time() - (time_window_hours * 3600)
            recent_metrics = [
                m for m in self.performance_metrics if m.timestamp >= cutoff_time
            ]

            if not recent_metrics:
                return PerformanceStats(
                    total_queries=0,
                    avg_processing_time=0.0,
                    avg_embedding_time=0.0,
                    avg_search_time=0.0,
                    avg_total_time=0.0,
                    avg_results_count=0.0,
                    avg_top_score=0.0,
                    avg_avg_score=0.0,
                    p95_processing_time=0.0,
                    p99_processing_time=0.0,
                    success_rate=1.0,
                    error_rate=0.0,
                )

            # Calculate basic statistics
            total_queries = len(recent_metrics)
            processing_times = [m.processing_time for m in recent_metrics]
            embedding_times = [m.embedding_time for m in recent_metrics]
            search_times = [m.search_time for m in recent_metrics]
            total_times = [m.total_time for m in recent_metrics]
            results_counts = [m.results_count for m in recent_metrics]
            top_scores = [m.top_score for m in recent_metrics]
            avg_scores = [m.avg_score for m in recent_metrics]

            # Calculate averages
            avg_processing_time = sum(processing_times) / len(processing_times)
            avg_embedding_time = sum(embedding_times) / len(embedding_times)
            avg_search_time = sum(search_times) / len(search_times)
            avg_total_time = sum(total_times) / len(total_times)
            avg_results_count = sum(results_counts) / len(results_counts)
            avg_top_score = sum(top_scores) / len(top_scores)
            avg_avg_score = sum(avg_scores) / len(avg_scores)

            # Calculate percentiles
            processing_times_sorted = sorted(processing_times)
            p95_processing_time = processing_times_sorted[
                int(len(processing_times_sorted) * 0.95)
            ]
            p99_processing_time = processing_times_sorted[
                int(len(processing_times_sorted) * 0.99)
            ]

            # Calculate success/error rates (assuming no errors for now)
            success_rate = 1.0
            error_rate = 0.0

            stats = PerformanceStats(
                total_queries=total_queries,
                avg_processing_time=avg_processing_time,
                avg_embedding_time=avg_embedding_time,
                avg_search_time=avg_search_time,
                avg_total_time=avg_total_time,
                avg_results_count=avg_results_count,
                avg_top_score=avg_top_score,
                avg_avg_score=avg_avg_score,
                p95_processing_time=p95_processing_time,
                p99_processing_time=p99_processing_time,
                success_rate=success_rate,
                error_rate=error_rate,
            )

            self._cache_result(cache_key, stats)
            return stats

        except Exception as e:
            logger.error(f"Failed to calculate performance stats: {e}")
            return PerformanceStats(
                total_queries=0,
                avg_processing_time=0.0,
                avg_embedding_time=0.0,
                avg_search_time=0.0,
                avg_total_time=0.0,
                avg_results_count=0.0,
                avg_top_score=0.0,
                avg_avg_score=0.0,
                p95_processing_time=0.0,
                p99_processing_time=0.0,
                success_rate=1.0,
                error_rate=0.0,
            )

    async def get_usage_insights(self, time_window_hours: int = 24) -> UsageInsights:
        """Get usage pattern insights and analytics.

        Args:
            time_window_hours: Time window for analysis in hours

        Returns:
            Usage insights for the specified time window

        """
        try:
            cache_key = f"usage_insights_{time_window_hours}"
            cached_result = self._get_cached_result(cache_key)
            if cached_result:
                return cached_result

            cutoff_time = time.time() - (time_window_hours * 3600)
            recent_metrics = [
                m for m in self.performance_metrics if m.timestamp >= cutoff_time
            ]

            if not recent_metrics:
                return UsageInsights(
                    popular_queries=[],
                    query_trends={},
                    peak_usage_hours=[],
                    user_behavior_patterns={},
                    search_effectiveness={},
                    optimization_opportunities=[],
                )

            # Analyze popular queries
            query_counts = defaultdict(int)
            for metrics in recent_metrics:
                query_counts[metrics.query_text] += 1

            popular_queries = sorted(
                query_counts.items(), key=lambda x: x[1], reverse=True,
            )[:10]

            # Analyze query trends (simplified - would need more sophisticated time series analysis)
            query_trends = {}
            for query_text, count in popular_queries[:5]:
                # Simple trend: compare first half vs second half of time window
                mid_time = cutoff_time + (time_window_hours * 3600 / 2)
                first_half = sum(
                    1
                    for m in recent_metrics
                    if m.query_text == query_text and m.timestamp < mid_time
                )
                second_half = sum(
                    1
                    for m in recent_metrics
                    if m.query_text == query_text and m.timestamp >= mid_time
                )
                trend = (
                    "increasing"
                    if second_half > first_half
                    else "decreasing" if first_half > second_half else "stable"
                )
                query_trends[query_text] = [
                    (mid_time, first_half),
                    (time.time(), second_half),
                ]

            # Analyze peak usage hours
            hour_counts = defaultdict(int)
            for metrics in recent_metrics:
                hour = time.localtime(metrics.timestamp).tm_hour
                hour_counts[hour] += 1

            peak_usage_hours = sorted(
                hour_counts.items(), key=lambda x: x[1], reverse=True,
            )[:3]
            peak_usage_hours = [hour for hour, count in peak_usage_hours]

            # Analyze user behavior patterns
            user_behavior_patterns = {
                "avg_queries_per_session": self._calculate_avg_queries_per_session(),
                "session_duration_patterns": self._analyze_session_durations(),
                "query_complexity_distribution": self._analyze_query_complexity(
                    recent_metrics,
                ),
            }

            # Calculate search effectiveness
            search_effectiveness = {
                "avg_result_quality": sum(m.avg_score for m in recent_metrics)
                / len(recent_metrics),
                "top_result_quality": sum(m.top_score for m in recent_metrics)
                / len(recent_metrics),
                "result_count_adequacy": self._calculate_result_adequacy(
                    recent_metrics,
                ),
                "user_satisfaction": self._calculate_user_satisfaction(recent_metrics),
            }

            # Generate optimization opportunities
            optimization_opportunities = self._generate_optimization_opportunities(
                recent_metrics,
            )

            insights = UsageInsights(
                popular_queries=popular_queries,
                query_trends=query_trends,
                peak_usage_hours=peak_usage_hours,
                user_behavior_patterns=user_behavior_patterns,
                search_effectiveness=search_effectiveness,
                optimization_opportunities=optimization_opportunities,
            )

            self._cache_result(cache_key, insights)
            return insights

        except Exception as e:
            logger.error(f"Failed to calculate usage insights: {e}")
            return UsageInsights(
                popular_queries=[],
                query_trends={},
                peak_usage_hours=[],
                user_behavior_patterns={},
                search_effectiveness={},
                optimization_opportunities=[],
            )

    def _calculate_avg_queries_per_session(self) -> float:
        """Calculate average queries per session."""
        if not self.user_sessions:
            return 0.0

        total_queries = sum(len(queries) for queries in self.user_sessions.values())
        return total_queries / len(self.user_sessions)

    def _analyze_session_durations(self) -> dict[str, Any]:
        """Analyze session duration patterns."""
        # This would require more sophisticated session tracking
        # For now, return basic statistics
        return {
            "avg_session_length": 0.0,
            "session_length_distribution": {},
        }

    def _analyze_query_complexity(self, metrics: list[QueryMetrics]) -> dict[str, Any]:
        """Analyze query complexity distribution."""
        complexity_distribution = {
            "simple": 0,  # < 3 words
            "medium": 0,  # 3-7 words
            "complex": 0,  # > 7 words
        }

        for m in metrics:
            word_count = len(m.query_text.split())
            if word_count < 3:
                complexity_distribution["simple"] += 1
            elif word_count <= 7:
                complexity_distribution["medium"] += 1
            else:
                complexity_distribution["complex"] += 1

        return complexity_distribution

    def _calculate_result_adequacy(self, metrics: list[QueryMetrics]) -> float:
        """Calculate how adequate the result counts are."""
        # Assume 5-15 results is adequate
        adequate_count = sum(1 for m in metrics if 5 <= m.results_count <= 15)
        return adequate_count / len(metrics) if metrics else 0.0

    def _calculate_user_satisfaction(self, metrics: list[QueryMetrics]) -> float:
        """Calculate average user satisfaction."""
        satisfaction_scores = [
            m.user_satisfaction for m in metrics if m.user_satisfaction is not None
        ]
        return (
            sum(satisfaction_scores) / len(satisfaction_scores)
            if satisfaction_scores
            else 0.0
        )

    def _generate_optimization_opportunities(
        self, metrics: list[QueryMetrics],
    ) -> list[str]:
        """Generate optimization opportunities based on metrics analysis."""
        opportunities = []

        # Check for slow queries
        slow_queries = [m for m in metrics if m.total_time > 2.0]
        if len(slow_queries) > len(metrics) * 0.1:  # More than 10% are slow
            opportunities.append("Consider optimizing slow queries (>2s)")

        # Check for low-quality results
        low_quality = [m for m in metrics if m.avg_score < 0.3]
        if len(low_quality) > len(metrics) * 0.2:  # More than 20% have low quality
            opportunities.append("Improve result quality for low-scoring queries")

        # Check for too few results
        few_results = [m for m in metrics if m.results_count < 3]
        if len(few_results) > len(metrics) * 0.15:  # More than 15% have few results
            opportunities.append("Increase result count for queries with few matches")

        # Check for too many results
        many_results = [m for m in metrics if m.results_count > 20]
        if len(many_results) > len(metrics) * 0.1:  # More than 10% have many results
            opportunities.append("Consider result filtering for high-volume queries")

        return opportunities

    async def generate_analytics_report(
        self, time_period: str = "24h",
    ) -> AnalyticsReport:
        """Generate a comprehensive analytics report.

        Args:
            time_period: Time period for the report (e.g., "24h", "7d", "30d")

        Returns:
            Comprehensive analytics report

        """
        try:
            # Parse time period
            time_window_hours = self._parse_time_period(time_period)

            # Generate report components
            performance_stats = await self.get_performance_stats(time_window_hours)
            usage_insights = await self.get_usage_insights(time_window_hours)

            # Generate recommendations
            recommendations = self._generate_recommendations(
                performance_stats, usage_insights,
            )

            # Create report
            report = AnalyticsReport(
                report_id=f"analytics_report_{int(time.time())}",
                generated_at=time.time(),
                time_period=time_period,
                performance_stats=performance_stats,
                usage_insights=usage_insights,
                recommendations=recommendations,
                metadata={
                    "total_metrics_analyzed": len(self.performance_metrics),
                    "report_generation_time": time.time(),
                    "cache_hits": len(self.analytics_cache),
                },
            )

            logger.info(f"Generated analytics report for {time_period} period")

            return report

        except Exception as e:
            logger.error(f"Failed to generate analytics report: {e}")
            # Return minimal report
            return AnalyticsReport(
                report_id=f"error_report_{int(time.time())}",
                generated_at=time.time(),
                time_period=time_period,
                performance_stats=PerformanceStats(
                    total_queries=0,
                    avg_processing_time=0.0,
                    avg_embedding_time=0.0,
                    avg_search_time=0.0,
                    avg_total_time=0.0,
                    avg_results_count=0.0,
                    avg_top_score=0.0,
                    avg_avg_score=0.0,
                    p95_processing_time=0.0,
                    p99_processing_time=0.0,
                    success_rate=1.0,
                    error_rate=0.0,
                ),
                usage_insights=UsageInsights(
                    popular_queries=[],
                    query_trends={},
                    peak_usage_hours=[],
                    user_behavior_patterns={},
                    search_effectiveness={},
                    optimization_opportunities=[],
                ),
                recommendations=["Analytics system encountered an error"],
            )

    def _parse_time_period(self, time_period: str) -> int:
        """Parse time period string to hours."""
        if time_period.endswith("h"):
            return int(time_period[:-1])
        if time_period.endswith("d"):
            return int(time_period[:-1]) * 24
        if time_period.endswith("w"):
            return int(time_period[:-1]) * 24 * 7
        return 24  # Default to 24 hours

    def _generate_recommendations(
        self, performance_stats: PerformanceStats, usage_insights: UsageInsights,
    ) -> list[str]:
        """Generate optimization recommendations based on analytics."""
        recommendations = []

        # Performance-based recommendations
        if performance_stats.avg_total_time > 1.0:
            recommendations.append("Consider optimizing query processing time")

        if performance_stats.avg_embedding_time > 0.5:
            recommendations.append("Investigate embedding generation performance")

        if performance_stats.avg_search_time > 0.3:
            recommendations.append("Optimize search index performance")

        # Usage-based recommendations
        if usage_insights.search_effectiveness.get("avg_result_quality", 0) < 0.5:
            recommendations.append("Improve search result quality")

        if usage_insights.search_effectiveness.get("result_count_adequacy", 0) < 0.7:
            recommendations.append("Adjust result count thresholds")

        # Add optimization opportunities
        recommendations.extend(usage_insights.optimization_opportunities)

        return recommendations

    def _get_cached_result(self, cache_key: str) -> Any | None:
        """Get cached result if still valid."""
        if cache_key in self.analytics_cache:
            cached_data = self.analytics_cache[cache_key]
            if time.time() - cached_data["timestamp"] < self.cache_ttl:
                return cached_data["data"]
            del self.analytics_cache[cache_key]
        return None

    def _cache_result(self, cache_key: str, data: Any) -> None:
        """Cache result with timestamp."""
        self.analytics_cache[cache_key] = {
            "data": data,
            "timestamp": time.time(),
        }

    def _invalidate_cache(self) -> None:
        """Invalidate analytics cache."""
        self.analytics_cache.clear()

    async def get_real_time_metrics(self) -> dict[str, Any]:
        """Get real-time metrics for dashboard."""
        try:
            # Get recent metrics (last 5 minutes)
            recent_cutoff = time.time() - 300
            recent_metrics = [
                m for m in self.performance_metrics if m.timestamp >= recent_cutoff
            ]

            if not recent_metrics:
                return {
                    "queries_per_minute": 0,
                    "avg_response_time": 0.0,
                    "active_sessions": 0,
                    "error_rate": 0.0,
                    "timestamp": time.time(),
                }

            # Calculate real-time metrics
            queries_per_minute = len(recent_metrics) / 5  # 5-minute window
            avg_response_time = sum(m.total_time for m in recent_metrics) / len(
                recent_metrics,
            )
            active_sessions = len(
                set(m.session_id for m in recent_metrics if m.session_id),
            )

            return {
                "queries_per_minute": queries_per_minute,
                "avg_response_time": avg_response_time,
                "active_sessions": active_sessions,
                "error_rate": 0.0,  # Would need error tracking
                "timestamp": time.time(),
            }

        except Exception as e:
            logger.error(f"Failed to get real-time metrics: {e}")
            return {
                "queries_per_minute": 0,
                "avg_response_time": 0.0,
                "active_sessions": 0,
                "error_rate": 0.0,
                "timestamp": time.time(),
            }

    async def export_analytics_data(
        self, format: str = "json",
    ) -> str | dict[str, Any]:
        """Export analytics data in specified format."""
        try:
            export_data = {
                "export_timestamp": time.time(),
                "performance_metrics": [
                    {
                        "query_id": m.query_id,
                        "query_text": m.query_text,
                        "timestamp": m.timestamp,
                        "processing_time": m.processing_time,
                        "embedding_time": m.embedding_time,
                        "search_time": m.search_time,
                        "total_time": m.total_time,
                        "results_count": m.results_count,
                        "top_score": m.top_score,
                        "avg_score": m.avg_score,
                        "user_satisfaction": m.user_satisfaction,
                        "click_through_rate": m.click_through_rate,
                        "session_id": m.session_id,
                        "user_id": m.user_id,
                    }
                    for m in self.performance_metrics
                ],
                "user_sessions": dict(self.user_sessions),
                "query_feedback": dict(self.query_feedback),
            }

            if format.lower() == "json":
                return json.dumps(export_data, indent=2)
            return export_data

        except Exception as e:
            logger.error(f"Failed to export analytics data: {e}")
            return {"error": str(e)}


# Global analytics collector instance
_analytics_collector: QueryAnalyticsCollector | None = None


def get_analytics_collector() -> QueryAnalyticsCollector:
    """Get the global analytics collector instance."""
    global _analytics_collector
    if _analytics_collector is None:
        _analytics_collector = QueryAnalyticsCollector()
    return _analytics_collector
