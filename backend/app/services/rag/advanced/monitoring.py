"""
Performance Monitor: Comprehensive performance monitoring and optimization.

This service provides:
- Real-time performance metrics collection
- Performance alerts and thresholds
- System health monitoring
- Performance regression detection
- Optimization recommendations
- Prometheus metrics integration
"""

import asyncio
import logging
import time
from dataclasses import dataclass
from datetime import datetime, timedelta
from enum import Enum
from typing import Any, Dict, List, Optional, Tuple

logger = logging.getLogger("uvicorn")

# Optional imports for advanced monitoring
try:
    import psutil

    PSUTIL_AVAILABLE = True
except ImportError:
    PSUTIL_AVAILABLE = False
    psutil = None

try:
    from prometheus_client import CollectorRegistry, Counter, Gauge, Histogram

    PROMETHEUS_AVAILABLE = True
except ImportError:
    PROMETHEUS_AVAILABLE = False
    Counter = None
    Histogram = None
    Gauge = None
    CollectorRegistry = None


class AlertSeverity(Enum):
    """Alert severity levels."""

    INFO = "info"
    WARNING = "warning"
    CRITICAL = "critical"


@dataclass
class PerformanceAlert:
    """Performance alert configuration."""

    alert_id: str
    metric_name: str
    threshold_value: float
    comparison_operator: str  # '>', '<', '>=', '<=', '==', '!='
    severity: AlertSeverity
    description: str
    enabled: bool = True
    cooldown_seconds: int = 300  # 5 minutes


@dataclass
class PerformanceMetric:
    """Performance metric data point."""

    metric_name: str
    value: float
    timestamp: datetime
    metadata: Dict[str, Any]
    tags: Dict[str, str]


@dataclass
class SystemHealth:
    """System health status."""

    overall_status: str  # 'healthy', 'degraded', 'critical'
    services: Dict[str, str]
    performance_score: float
    last_updated: datetime
    alerts: List[str]


class PerformanceMonitor:
    """Comprehensive performance monitoring system."""

    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.enabled = config.get("rag_monitoring_enabled", True)

        # Metrics storage
        self.metrics_history: Dict[str, List[PerformanceMetric]] = {}
        self.active_alerts: Dict[str, PerformanceAlert] = {}
        self.alert_history: List[Dict[str, Any]] = []

        # Performance baselines
        self.performance_baselines: Dict[str, float] = {}

        # System monitoring
        self.system_metrics = {
            "cpu_usage": 0.0,
            "memory_usage": 0.0,
            "disk_usage": 0.0,
            "network_io": {"bytes_sent": 0, "bytes_recv": 0},
        }

        # Prometheus metrics
        self.prometheus_registry = None
        self.prometheus_metrics = {}

        # Initialize components
        self._initialize_prometheus_metrics()
        self._initialize_default_alerts()
        self._initialize_performance_baselines()

    def _initialize_prometheus_metrics(self) -> None:
        """Initialize Prometheus metrics if available."""
        if not PROMETHEUS_AVAILABLE:
            logger.warning(
                "Prometheus client not available, metrics will be stored locally only"
            )
            return

        try:
            self.prometheus_registry = CollectorRegistry()

            # Define metrics
            self.prometheus_metrics = {
                "embedding_requests_total": Counter(
                    "rag_embedding_requests_total",
                    "Total number of embedding requests",
                    ["model", "status"],
                    registry=self.prometheus_registry,
                ),
                "embedding_duration_seconds": Histogram(
                    "rag_embedding_duration_seconds",
                    "Time spent generating embeddings",
                    ["model"],
                    registry=self.prometheus_registry,
                ),
                "search_requests_total": Counter(
                    "rag_search_requests_total",
                    "Total number of search requests",
                    ["search_type", "status"],
                    registry=self.prometheus_registry,
                ),
                "search_duration_seconds": Histogram(
                    "rag_search_duration_seconds",
                    "Time spent performing searches",
                    ["search_type"],
                    registry=self.prometheus_registry,
                ),
                "cache_hit_rate": Gauge(
                    "rag_cache_hit_rate",
                    "Cache hit rate",
                    ["cache_type"],
                    registry=self.prometheus_registry,
                ),
                "system_cpu_usage": Gauge(
                    "rag_system_cpu_usage_percent",
                    "System CPU usage percentage",
                    registry=self.prometheus_registry,
                ),
                "system_memory_usage": Gauge(
                    "rag_system_memory_usage_percent",
                    "System memory usage percentage",
                    registry=self.prometheus_registry,
                ),
                "active_connections": Gauge(
                    "rag_active_connections",
                    "Number of active connections",
                    registry=self.prometheus_registry,
                ),
            }

            logger.info("Prometheus metrics initialized successfully")

        except Exception as e:
            logger.error(f"Failed to initialize Prometheus metrics: {e}")
            self.prometheus_registry = None

    def _initialize_default_alerts(self) -> None:
        """Initialize default performance alerts."""
        default_alerts = [
            PerformanceAlert(
                alert_id="high_embedding_latency",
                metric_name="embedding_latency_ms",
                threshold_value=2000.0,
                comparison_operator=">",
                severity=AlertSeverity.WARNING,
                description="Embedding generation latency is high",
            ),
            PerformanceAlert(
                alert_id="high_search_latency",
                metric_name="search_latency_ms",
                threshold_value=1000.0,
                comparison_operator=">",
                severity=AlertSeverity.WARNING,
                description="Search latency is high",
            ),
            PerformanceAlert(
                alert_id="low_cache_hit_rate",
                metric_name="cache_hit_rate",
                threshold_value=0.5,
                comparison_operator="<",
                severity=AlertSeverity.WARNING,
                description="Cache hit rate is low",
            ),
            PerformanceAlert(
                alert_id="high_error_rate",
                metric_name="error_rate",
                threshold_value=0.1,
                comparison_operator=">",
                severity=AlertSeverity.CRITICAL,
                description="Error rate is high",
            ),
            PerformanceAlert(
                alert_id="high_cpu_usage",
                metric_name="cpu_usage_percent",
                threshold_value=80.0,
                comparison_operator=">",
                severity=AlertSeverity.WARNING,
                description="CPU usage is high",
            ),
            PerformanceAlert(
                alert_id="high_memory_usage",
                metric_name="memory_usage_percent",
                threshold_value=85.0,
                comparison_operator=">",
                severity=AlertSeverity.CRITICAL,
                description="Memory usage is high",
            ),
        ]

        for alert in default_alerts:
            self.active_alerts[alert.alert_id] = alert

    def _initialize_performance_baselines(self) -> None:
        """Initialize performance baselines."""
        self.performance_baselines = {
            "embedding_latency_ms": 500.0,
            "search_latency_ms": 50.0,
            "cache_hit_rate": 0.8,
            "search_recall_at_10": 0.85,
            "user_satisfaction_score": 4.0,
            "throughput_per_second": 10.0,
        }

    async def record_metric(
        self,
        metric_name: str,
        value: float,
        metadata: Optional[Dict[str, Any]] = None,
        tags: Optional[Dict[str, str]] = None,
    ) -> None:
        """Record a performance metric."""
        if not self.enabled:
            return

        try:
            # Create metric data point
            metric = PerformanceMetric(
                metric_name=metric_name,
                value=value,
                timestamp=datetime.now(),
                metadata=metadata or {},
                tags=tags or {},
            )

            # Store in history
            if metric_name not in self.metrics_history:
                self.metrics_history[metric_name] = []

            self.metrics_history[metric_name].append(metric)

            # Keep only recent metrics (last 24 hours)
            cutoff_time = datetime.now() - timedelta(hours=24)
            self.metrics_history[metric_name] = [
                m
                for m in self.metrics_history[metric_name]
                if m.timestamp > cutoff_time
            ]

            # Update Prometheus metrics
            await self._update_prometheus_metrics(metric)

            # Update performance trends
            self._update_performance_trends(metric)

            # Check for alerts
            await self._check_alerts(metric)

        except Exception as e:
            logger.error(f"Failed to record metric {metric_name}: {e}")

    async def _update_prometheus_metrics(self, metric: PerformanceMetric) -> None:
        """Update Prometheus metrics."""
        if not self.prometheus_registry:
            return

        try:
            metric_name = metric.metric_name
            value = metric.value
            tags = metric.tags

            if metric_name == "embedding_requests_total":
                model = tags.get("model", "unknown")
                status = tags.get("status", "success")
                self.prometheus_metrics["embedding_requests_total"].labels(
                    model=model, status=status
                ).inc()

            elif metric_name == "embedding_duration_seconds":
                model = tags.get("model", "unknown")
                self.prometheus_metrics["embedding_duration_seconds"].labels(
                    model=model
                ).observe(value)

            elif metric_name == "search_requests_total":
                search_type = tags.get("search_type", "unknown")
                status = tags.get("status", "success")
                self.prometheus_metrics["search_requests_total"].labels(
                    search_type=search_type, status=status
                ).inc()

            elif metric_name == "search_duration_seconds":
                search_type = tags.get("search_type", "unknown")
                self.prometheus_metrics["search_duration_seconds"].labels(
                    search_type=search_type
                ).observe(value)

            elif metric_name == "cache_hit_rate":
                cache_type = tags.get("cache_type", "unknown")
                self.prometheus_metrics["cache_hit_rate"].labels(
                    cache_type=cache_type
                ).set(value)

            elif metric_name == "cpu_usage_percent":
                self.prometheus_metrics["system_cpu_usage"].set(value)

            elif metric_name == "memory_usage_percent":
                self.prometheus_metrics["system_memory_usage"].set(value)

            elif metric_name == "active_connections":
                self.prometheus_metrics["active_connections"].set(value)

        except Exception as e:
            logger.warning(f"Failed to update Prometheus metrics: {e}")

    def _update_performance_trends(self, metric: PerformanceMetric) -> None:
        """Update performance trend analysis."""
        # This would implement trend analysis logic
        # For now, just store the metric
        pass

    async def _check_alerts(self, metric: PerformanceMetric) -> None:
        """Check if metric triggers any alerts."""
        metric_name = metric.metric_name
        value = metric.value

        for alert_id, alert in self.active_alerts.items():
            if not alert.enabled or alert.metric_name != metric_name:
                continue

            # Check if alert condition is met
            condition_met = False
            if alert.comparison_operator == ">":
                condition_met = value > alert.threshold_value
            elif alert.comparison_operator == ">=":
                condition_met = value >= alert.threshold_value
            elif alert.comparison_operator == "<":
                condition_met = value < alert.threshold_value
            elif alert.comparison_operator == "<=":
                condition_met = value <= alert.threshold_value
            elif alert.comparison_operator == "==":
                condition_met = value == alert.threshold_value
            elif alert.comparison_operator == "!=":
                condition_met = value != alert.threshold_value

            if condition_met:
                await self._trigger_alert(alert, metric)

    async def _trigger_alert(
        self, alert: PerformanceAlert, metric: PerformanceMetric
    ) -> None:
        """Trigger a performance alert."""
        try:
            # Check cooldown period
            recent_alerts = [
                a
                for a in self.alert_history
                if (
                    a["alert_id"] == alert.alert_id
                    and datetime.now() - a["timestamp"]
                    < timedelta(seconds=alert.cooldown_seconds)
                )
            ]

            if recent_alerts:
                return  # Still in cooldown period

            # Create alert record
            alert_data = {
                "alert_id": alert.alert_id,
                "metric_name": alert.metric_name,
                "threshold_value": alert.threshold_value,
                "actual_value": metric.value,
                "severity": alert.severity.value,
                "description": alert.description,
                "timestamp": datetime.now(),
                "metadata": metric.metadata,
                "tags": metric.tags,
            }

            self.alert_history.append(alert_data)

            # Send alert notification
            await self._send_alert_notification(alert_data)

            logger.warning(
                f"Performance alert triggered: {alert.alert_id} - {alert.description}"
            )

        except Exception as e:
            logger.error(f"Failed to trigger alert {alert.alert_id}: {e}")

    async def _send_alert_notification(self, alert_data: Dict[str, Any]) -> None:
        """Send alert notification."""
        # This would integrate with notification systems (email, Slack, etc.)
        # For now, just log the alert
        logger.warning(
            f"ALERT: {alert_data['description']} - "
            f"Value: {alert_data['actual_value']}, "
            f"Threshold: {alert_data['threshold_value']}"
        )

    async def get_system_health(self) -> SystemHealth:
        """Get current system health status."""
        try:
            # Collect system metrics
            if PSUTIL_AVAILABLE:
                self.system_metrics["cpu_usage"] = psutil.cpu_percent(interval=1)
                self.system_metrics["memory_usage"] = psutil.virtual_memory().percent
                self.system_metrics["disk_usage"] = psutil.disk_usage("/").percent

                # Record system metrics
                await self.record_metric(
                    "cpu_usage_percent", self.system_metrics["cpu_usage"]
                )
                await self.record_metric(
                    "memory_usage_percent", self.system_metrics["memory_usage"]
                )
                await self.record_metric(
                    "disk_usage_percent", self.system_metrics["disk_usage"]
                )

            # Determine overall health status
            critical_alerts = [
                a
                for a in self.alert_history
                if a["severity"] == "critical"
                and datetime.now() - a["timestamp"] < timedelta(minutes=5)
            ]

            warning_alerts = [
                a
                for a in self.alert_history
                if a["severity"] == "warning"
                and datetime.now() - a["timestamp"] < timedelta(minutes=5)
            ]

            if critical_alerts:
                overall_status = "critical"
                performance_score = 0.0
            elif warning_alerts:
                overall_status = "degraded"
                performance_score = 0.5
            else:
                overall_status = "healthy"
                performance_score = 1.0

            # Get service statuses
            services = {
                "embedding_service": "healthy",  # This would be checked against actual services
                "vector_store": "healthy",
                "search_engine": "healthy",
            }

            return SystemHealth(
                overall_status=overall_status,
                services=services,
                performance_score=performance_score,
                last_updated=datetime.now(),
                alerts=[a["alert_id"] for a in critical_alerts + warning_alerts],
            )

        except Exception as e:
            logger.error(f"Failed to get system health: {e}")
            return SystemHealth(
                overall_status="unknown",
                services={},
                performance_score=0.0,
                last_updated=datetime.now(),
                alerts=[],
            )

    def _get_recent_metrics(
        self, minutes: int = 5
    ) -> Dict[str, List[PerformanceMetric]]:
        """Get recent metrics within specified time window."""
        cutoff_time = datetime.now() - timedelta(minutes=minutes)
        recent_metrics = {}

        for metric_name, metrics in self.metrics_history.items():
            recent_metrics[metric_name] = [
                m for m in metrics if m.timestamp > cutoff_time
            ]

        return recent_metrics

    def _get_service_status(self) -> Dict[str, str]:
        """Get status of various services."""
        # This would check actual service health
        return {
            "embedding_service": "healthy",
            "vector_store": "healthy",
            "search_engine": "healthy",
            "monitoring": "healthy",
        }

    async def get_performance_summary(self, hours: int = 24) -> Dict[str, Any]:
        """Get performance summary for specified time period."""
        try:
            cutoff_time = datetime.now() - timedelta(hours=hours)

            summary = {
                "time_period_hours": hours,
                "metrics": {},
                "alerts": [],
                "system_health": await self.get_system_health(),
                "performance_score": 0.0,
            }

            # Calculate metrics summary
            for metric_name, metrics in self.metrics_history.items():
                recent_metrics = [m for m in metrics if m.timestamp > cutoff_time]

                if recent_metrics:
                    values = [m.value for m in recent_metrics]
                    summary["metrics"][metric_name] = {
                        "count": len(values),
                        "average": sum(values) / len(values),
                        "min": min(values),
                        "max": max(values),
                        "latest": values[-1] if values else 0,
                    }

            # Get recent alerts
            recent_alerts = [
                a for a in self.alert_history if a["timestamp"] > cutoff_time
            ]
            summary["alerts"] = recent_alerts

            # Calculate overall performance score
            summary["performance_score"] = self._calculate_performance_score(
                summary["metrics"]
            )

            return summary

        except Exception as e:
            logger.error(f"Failed to get performance summary: {e}")
            return {"error": str(e)}

    def _calculate_performance_score(self, metrics: Dict[str, Any]) -> float:
        """Calculate overall performance score based on metrics."""
        try:
            # Weight different metrics
            weights = {
                "embedding_latency_ms": 0.3,
                "search_latency_ms": 0.3,
                "cache_hit_rate": 0.2,
                "error_rate": 0.2,
            }

            score = 0.0
            total_weight = 0.0

            for metric_name, weight in weights.items():
                if metric_name in metrics:
                    metric_data = metrics[metric_name]

                    if metric_name in ["embedding_latency_ms", "search_latency_ms"]:
                        # Lower is better
                        baseline = self.performance_baselines.get(metric_name, 1000.0)
                        metric_score = max(0, 1.0 - (metric_data["average"] / baseline))
                    elif metric_name == "cache_hit_rate":
                        # Higher is better
                        metric_score = metric_data["average"]
                    elif metric_name == "error_rate":
                        # Lower is better
                        metric_score = max(0, 1.0 - metric_data["average"])
                    else:
                        metric_score = 0.5  # Default neutral score

                    score += metric_score * weight
                    total_weight += weight

            return score / total_weight if total_weight > 0 else 0.5

        except Exception as e:
            logger.error(f"Failed to calculate performance score: {e}")
            return 0.5

    async def generate_performance_report(self, hours: int = 24) -> str:
        """Generate a comprehensive performance report."""
        try:
            summary = await self.get_performance_summary(hours)

            report = []
            report.append("# RAG System Performance Report")
            report.append(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
            report.append(f"Time Period: Last {hours} hours")
            report.append("")

            # System Health
            health = summary["system_health"]
            report.append("## System Health")
            report.append(f"- **Overall Status**: {health.overall_status.upper()}")
            report.append(f"- **Performance Score**: {health.performance_score:.2f}")
            report.append(
                f"- **Last Updated**: {health.last_updated.strftime('%Y-%m-%d %H:%M:%S')}"
            )
            report.append("")

            # Service Status
            report.append("## Service Status")
            for service, status in health.services.items():
                report.append(f"- **{service.replace('_', ' ').title()}**: {status}")
            report.append("")

            # Metrics Summary
            report.append("## Performance Metrics")
            for metric_name, metric_data in summary["metrics"].items():
                report.append(f"### {metric_name.replace('_', ' ').title()}")
                report.append(f"- **Count**: {metric_data['count']}")
                report.append(f"- **Average**: {metric_data['average']:.2f}")
                report.append(f"- **Min**: {metric_data['min']:.2f}")
                report.append(f"- **Max**: {metric_data['max']:.2f}")
                report.append(f"- **Latest**: {metric_data['latest']:.2f}")
                report.append("")

            # Alerts
            if summary["alerts"]:
                report.append("## Recent Alerts")
                for alert in summary["alerts"][-10:]:  # Last 10 alerts
                    report.append(
                        f"- **{alert['severity'].upper()}**: {alert['description']}"
                    )
                    report.append(
                        f"  - Value: {alert['actual_value']:.2f}, Threshold: {alert['threshold_value']:.2f}"
                    )
                    report.append(
                        f"  - Time: {alert['timestamp'].strftime('%Y-%m-%d %H:%M:%S')}"
                    )
                report.append("")

            # Recommendations
            report.append("## Recommendations")
            if health.performance_score < 0.7:
                report.append("- Performance is below optimal levels")
                report.append("- Consider investigating recent alerts")
                report.append("- Review system resource usage")
            else:
                report.append("- System performance is within acceptable ranges")
                report.append("- Continue monitoring for any degradation")

            return "\n".join(report)

        except Exception as e:
            logger.error(f"Failed to generate performance report: {e}")
            return f"Error generating report: {e}"

    def get_prometheus_metrics(self) -> str:
        """Get Prometheus metrics in text format."""
        if not self.prometheus_registry:
            return "# Prometheus metrics not available\n"

        try:
            from prometheus_client import CONTENT_TYPE_LATEST, generate_latest

            return generate_latest(self.prometheus_registry).decode("utf-8")
        except Exception as e:
            logger.error(f"Failed to generate Prometheus metrics: {e}")
            return f"# Error generating metrics: {e}\n"

    def get_monitor_stats(self) -> Dict[str, Any]:
        """Get monitoring system statistics."""
        return {
            "enabled": self.enabled,
            "metrics_tracked": len(self.metrics_history),
            "active_alerts": len(self.active_alerts),
            "total_alerts_triggered": len(self.alert_history),
            "prometheus_available": PROMETHEUS_AVAILABLE,
            "psutil_available": PSUTIL_AVAILABLE,
            "system_metrics": self.system_metrics.copy(),
            "performance_baselines": self.performance_baselines.copy(),
        }
