"""Prometheus Monitoring Service: Performance monitoring with Prometheus integration.

This service provides comprehensive performance monitoring capabilities with
Prometheus metrics integration for the RAG system.

Author: Reynard Development Team
Version: 1.0.0
"""

import logging
import time
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional

from ...interfaces.base import BaseService, ServiceStatus
from ...interfaces.monitoring import Alert, AlertSeverity, Metric, MonitoringProvider

logger = logging.getLogger("uvicorn")

# Optional Prometheus imports
try:
    from prometheus_client import CollectorRegistry, Counter, Gauge, Histogram

    PROMETHEUS_AVAILABLE = True
except ImportError:
    PROMETHEUS_AVAILABLE = False
    Counter = None
    Histogram = None
    Gauge = None
    CollectorRegistry = None


class PrometheusMonitoringService(BaseService, MonitoringProvider):
    """Prometheus-based monitoring service with comprehensive metrics collection."""

    def __init__(self, config: Optional[Dict[str, Any]] = None):
        super().__init__("prometheus-monitoring", config)

        # Monitoring configuration
        self.metrics_retention_hours = self.config.get("metrics_retention_hours", 24)
        self.alert_cooldown_seconds = self.config.get("alert_cooldown_seconds", 300)
        self.enable_prometheus = self.config.get("enable_prometheus", True)

        # Prometheus components
        self.prometheus_registry = None
        self.prometheus_metrics = {}

        # Local metrics storage
        self.metrics_history: Dict[str, List[Metric]] = {}
        self.active_alerts: Dict[str, Alert] = {}
        self.alert_history: List[Alert] = []

        # Performance baselines
        self.performance_baselines = {
            "embedding_latency_ms": 500.0,
            "search_latency_ms": 50.0,
            "cache_hit_rate": 0.8,
            "error_rate": 0.05,
        }

    async def initialize(self) -> bool:
        """Initialize the monitoring service."""
        try:
            self.update_status(
                ServiceStatus.INITIALIZING, "Initializing Prometheus monitoring service"
            )

            # Initialize Prometheus metrics if available
            if self.enable_prometheus and PROMETHEUS_AVAILABLE:
                await self._initialize_prometheus_metrics()

            # Initialize default alerts
            await self._initialize_default_alerts()

            self.update_status(
                ServiceStatus.HEALTHY, "Prometheus monitoring service initialized"
            )
            return True

        except Exception as e:
            self.logger.error(
                f"Failed to initialize Prometheus monitoring service: {e}"
            )
            self.update_status(ServiceStatus.ERROR, f"Initialization failed: {e}")
            return False

    async def shutdown(self) -> None:
        """Shutdown the monitoring service."""
        try:
            self.update_status(
                ServiceStatus.SHUTTING_DOWN,
                "Shutting down Prometheus monitoring service",
            )

            # Clear metrics history
            self.metrics_history.clear()
            self.active_alerts.clear()
            self.alert_history.clear()

            # Clear Prometheus registry
            if self.prometheus_registry:
                self.prometheus_registry = None
                self.prometheus_metrics.clear()

            self.update_status(
                ServiceStatus.SHUTDOWN,
                "Prometheus monitoring service shutdown complete",
            )

        except Exception as e:
            self.logger.error(f"Error during shutdown: {e}")

    async def health_check(self) -> Dict[str, Any]:
        """Perform health check."""
        try:
            # Check Prometheus availability
            prometheus_healthy = not self.enable_prometheus or PROMETHEUS_AVAILABLE

            if prometheus_healthy:
                self.update_status(ServiceStatus.HEALTHY, "Service is healthy")
            else:
                self.update_status(ServiceStatus.DEGRADED, "Prometheus not available")

            return {
                "status": self.status.value,
                "message": self.health.message,
                "last_updated": self.health.last_updated.isoformat(),
                "prometheus_available": PROMETHEUS_AVAILABLE,
                "metrics_tracked": len(self.metrics_history),
                "active_alerts": len(self.active_alerts),
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

    async def _initialize_prometheus_metrics(self) -> None:
        """Initialize Prometheus metrics."""
        if not PROMETHEUS_AVAILABLE:
            self.logger.warning("Prometheus client not available")
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
                "active_connections": Gauge(
                    "rag_active_connections",
                    "Number of active connections",
                    registry=self.prometheus_registry,
                ),
            }

            self.logger.info("Prometheus metrics initialized successfully")

        except Exception as e:
            self.logger.error(f"Failed to initialize Prometheus metrics: {e}")
            self.prometheus_registry = None

    async def _initialize_default_alerts(self) -> None:
        """Initialize default performance alerts."""
        default_alerts = [
            {
                "name": "high_embedding_latency",
                "metric_name": "embedding_latency_ms",
                "threshold_value": 2000.0,
                "comparison_operator": ">",
                "severity": AlertSeverity.WARNING,
                "description": "Embedding generation latency is high",
            },
            {
                "name": "high_search_latency",
                "metric_name": "search_latency_ms",
                "threshold_value": 1000.0,
                "comparison_operator": ">",
                "severity": AlertSeverity.WARNING,
                "description": "Search latency is high",
            },
            {
                "name": "low_cache_hit_rate",
                "metric_name": "cache_hit_rate",
                "threshold_value": 0.5,
                "comparison_operator": "<",
                "severity": AlertSeverity.WARNING,
                "description": "Cache hit rate is low",
            },
            {
                "name": "high_error_rate",
                "metric_name": "error_rate",
                "threshold_value": 0.1,
                "comparison_operator": ">",
                "severity": AlertSeverity.CRITICAL,
                "description": "Error rate is high",
            },
        ]

        for alert_config in default_alerts:
            await self.create_alert(**alert_config)

    async def record_metric(
        self,
        name: str,
        value: float,
        tags: Optional[Dict[str, str]] = None,
        metadata: Optional[Dict[str, Any]] = None,
        **kwargs,
    ) -> None:
        """Record a performance metric."""
        if not self.is_healthy():
            return

        try:
            # Create metric
            metric = Metric(
                name=name,
                value=value,
                timestamp=datetime.now(),
                tags=tags or {},
                metadata=metadata or {},
            )

            # Store in history
            if name not in self.metrics_history:
                self.metrics_history[name] = []

            self.metrics_history[name].append(metric)

            # Clean up old metrics
            await self._cleanup_old_metrics()

            # Update Prometheus metrics
            await self._update_prometheus_metrics(metric)

            # Check for alerts
            await self._check_alerts(metric)

        except Exception as e:
            self.logger.error(f"Failed to record metric {name}: {e}")

    async def record_metrics(self, metrics: List[Metric], **kwargs) -> None:
        """Record multiple metrics in batch."""
        for metric in metrics:
            await self.record_metric(
                metric.name, metric.value, metric.tags, metric.metadata
            )

    async def get_metrics(
        self,
        name: Optional[str] = None,
        tags: Optional[Dict[str, str]] = None,
        start_time: Optional[datetime] = None,
        end_time: Optional[datetime] = None,
        **kwargs,
    ) -> List[Metric]:
        """Retrieve metrics with optional filtering."""
        try:
            all_metrics = []

            # Get metrics by name or all metrics
            if name:
                metrics = self.metrics_history.get(name, [])
            else:
                metrics = []
                for metric_list in self.metrics_history.values():
                    metrics.extend(metric_list)

            # Apply time filters
            if start_time:
                metrics = [m for m in metrics if m.timestamp >= start_time]
            if end_time:
                metrics = [m for m in metrics if m.timestamp <= end_time]

            # Apply tag filters
            if tags:
                filtered_metrics = []
                for metric in metrics:
                    match = True
                    for key, value in tags.items():
                        if metric.tags.get(key) != value:
                            match = False
                            break
                    if match:
                        filtered_metrics.append(metric)
                metrics = filtered_metrics

            return metrics

        except Exception as e:
            self.logger.error(f"Failed to get metrics: {e}")
            return []

    async def create_alert(
        self,
        name: str,
        metric_name: str,
        threshold_value: float,
        comparison_operator: str,
        severity: AlertSeverity,
        description: str,
        **kwargs,
    ) -> str:
        """Create a new alert rule."""
        try:
            alert_id = f"alert_{name}_{int(time.time())}"

            alert = Alert(
                id=alert_id,
                name=name,
                severity=severity,
                message=description,
                timestamp=datetime.now(),
                metric_name=metric_name,
                threshold_value=threshold_value,
                actual_value=0.0,
                metadata={
                    "comparison_operator": comparison_operator,
                    "description": description,
                    "enabled": True,
                    "cooldown_seconds": self.alert_cooldown_seconds,
                },
            )

            self.active_alerts[alert_id] = alert
            self.logger.info(f"Created alert: {name}")

            return alert_id

        except Exception as e:
            self.logger.error(f"Failed to create alert {name}: {e}")
            raise RuntimeError(f"Failed to create alert {name}: {e}")

    async def update_alert(self, alert_id: str, **kwargs) -> bool:
        """Update an existing alert rule."""
        try:
            if alert_id not in self.active_alerts:
                return False

            alert = self.active_alerts[alert_id]

            # Update alert properties
            for key, value in kwargs.items():
                if hasattr(alert, key):
                    setattr(alert, key, value)
                elif key in alert.metadata:
                    alert.metadata[key] = value

            alert.timestamp = datetime.now()
            return True

        except Exception as e:
            self.logger.error(f"Failed to update alert {alert_id}: {e}")
            return False

    async def delete_alert(self, alert_id: str) -> bool:
        """Delete an alert rule."""
        try:
            if alert_id in self.active_alerts:
                del self.active_alerts[alert_id]
                self.logger.info(f"Deleted alert: {alert_id}")
                return True
            return False

        except Exception as e:
            self.logger.error(f"Failed to delete alert {alert_id}: {e}")
            return False

    async def get_alerts(
        self,
        severity: Optional[AlertSeverity] = None,
        active_only: bool = True,
        **kwargs,
    ) -> List[Alert]:
        """Get alerts with optional filtering."""
        try:
            alerts = []

            if active_only:
                alerts = list(self.active_alerts.values())
            else:
                alerts = self.alert_history.copy()

            # Apply severity filter
            if severity:
                alerts = [a for a in alerts if a.severity == severity]

            return alerts

        except Exception as e:
            self.logger.error(f"Failed to get alerts: {e}")
            return []

    async def get_health_status(self) -> Dict[str, Any]:
        """Get overall system health status."""
        try:
            # Calculate health based on recent alerts
            recent_cutoff = datetime.now() - timedelta(minutes=5)
            recent_alerts = [
                a for a in self.alert_history if a.timestamp > recent_cutoff
            ]

            critical_alerts = [
                a for a in recent_alerts if a.severity == AlertSeverity.CRITICAL
            ]
            warning_alerts = [
                a for a in recent_alerts if a.severity == AlertSeverity.WARNING
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

            return {
                "overall_status": overall_status,
                "performance_score": performance_score,
                "critical_alerts": len(critical_alerts),
                "warning_alerts": len(warning_alerts),
                "total_alerts": len(recent_alerts),
                "last_updated": datetime.now().isoformat(),
            }

        except Exception as e:
            self.logger.error(f"Failed to get health status: {e}")
            return {
                "overall_status": "unknown",
                "performance_score": 0.0,
                "error": str(e),
            }

    async def get_performance_summary(
        self, time_period_hours: int = 24
    ) -> Dict[str, Any]:
        """Get performance summary for specified time period."""
        try:
            cutoff_time = datetime.now() - timedelta(hours=time_period_hours)

            summary = {
                "time_period_hours": time_period_hours,
                "metrics_summary": {},
                "alerts_summary": {},
                "health_status": await self.get_health_status(),
            }

            # Calculate metrics summary
            for metric_name, metrics in self.metrics_history.items():
                recent_metrics = [m for m in metrics if m.timestamp > cutoff_time]

                if recent_metrics:
                    values = [m.value for m in recent_metrics]
                    summary["metrics_summary"][metric_name] = {
                        "count": len(values),
                        "average": sum(values) / len(values),
                        "min": min(values),
                        "max": max(values),
                        "latest": values[-1] if values else 0,
                    }

            # Calculate alerts summary
            recent_alerts = [a for a in self.alert_history if a.timestamp > cutoff_time]
            summary["alerts_summary"] = {
                "total_alerts": len(recent_alerts),
                "critical_alerts": len(
                    [a for a in recent_alerts if a.severity == AlertSeverity.CRITICAL]
                ),
                "warning_alerts": len(
                    [a for a in recent_alerts if a.severity == AlertSeverity.WARNING]
                ),
                "info_alerts": len(
                    [a for a in recent_alerts if a.severity == AlertSeverity.INFO]
                ),
            }

            return summary

        except Exception as e:
            self.logger.error(f"Failed to get performance summary: {e}")
            return {"error": str(e)}

    async def generate_report(self, report_type: str, **kwargs) -> str:
        """Generate a monitoring report."""
        try:
            if report_type == "performance":
                summary = await self.get_performance_summary()

                report = []
                report.append("# RAG System Performance Report")
                report.append(
                    f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
                )
                report.append("")

                # Health status
                health = summary["health_status"]
                report.append("## System Health")
                report.append(f"- **Status**: {health['overall_status'].upper()}")
                report.append(
                    f"- **Performance Score**: {health['performance_score']:.2f}"
                )
                report.append(f"- **Critical Alerts**: {health['critical_alerts']}")
                report.append(f"- **Warning Alerts**: {health['warning_alerts']}")
                report.append("")

                # Metrics summary
                report.append("## Performance Metrics")
                for metric_name, metric_data in summary["metrics_summary"].items():
                    report.append(f"### {metric_name.replace('_', ' ').title()}")
                    report.append(f"- **Count**: {metric_data['count']}")
                    report.append(f"- **Average**: {metric_data['average']:.2f}")
                    report.append(f"- **Min**: {metric_data['min']:.2f}")
                    report.append(f"- **Max**: {metric_data['max']:.2f}")
                    report.append(f"- **Latest**: {metric_data['latest']:.2f}")
                    report.append("")

                return "\n".join(report)

            else:
                return f"Unknown report type: {report_type}"

        except Exception as e:
            self.logger.error(f"Failed to generate report: {e}")
            return f"Error generating report: {e}"

    async def get_monitoring_stats(self) -> Dict[str, Any]:
        """Get monitoring system statistics."""
        return {
            "service_name": self.name,
            "status": self.status.value,
            "prometheus_available": PROMETHEUS_AVAILABLE,
            "prometheus_enabled": self.enable_prometheus,
            "metrics_tracked": len(self.metrics_history),
            "active_alerts": len(self.active_alerts),
            "total_alerts_triggered": len(self.alert_history),
            "metrics_retention_hours": self.metrics_retention_hours,
            "alert_cooldown_seconds": self.alert_cooldown_seconds,
        }

    async def _cleanup_old_metrics(self) -> None:
        """Clean up old metrics based on retention policy."""
        cutoff_time = datetime.now() - timedelta(hours=self.metrics_retention_hours)

        for metric_name in list(self.metrics_history.keys()):
            self.metrics_history[metric_name] = [
                m
                for m in self.metrics_history[metric_name]
                if m.timestamp > cutoff_time
            ]

            # Remove empty metric lists
            if not self.metrics_history[metric_name]:
                del self.metrics_history[metric_name]

    async def _update_prometheus_metrics(self, metric: Metric) -> None:
        """Update Prometheus metrics."""
        if not self.prometheus_registry or not self.prometheus_metrics:
            return

        try:
            metric_name = metric.name
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
                ).observe(
                    value / 1000.0
                )  # Convert ms to seconds

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
                ).observe(
                    value / 1000.0
                )  # Convert ms to seconds

            elif metric_name == "cache_hit_rate":
                cache_type = tags.get("cache_type", "unknown")
                self.prometheus_metrics["cache_hit_rate"].labels(
                    cache_type=cache_type
                ).set(value)

            elif metric_name == "active_connections":
                self.prometheus_metrics["active_connections"].set(value)

        except Exception as e:
            self.logger.warning(f"Failed to update Prometheus metrics: {e}")

    async def _check_alerts(self, metric: Metric) -> None:
        """Check if metric triggers any alerts."""
        metric_name = metric.name
        value = metric.value

        for alert_id, alert in self.active_alerts.items():
            if not alert.metadata.get("enabled", True):
                continue

            if alert.metric_name != metric_name:
                continue

            # Check cooldown period
            cooldown_seconds = alert.metadata.get(
                "cooldown_seconds", self.alert_cooldown_seconds
            )
            if alert.timestamp > datetime.now() - timedelta(seconds=cooldown_seconds):
                continue

            # Check alert condition
            comparison_operator = alert.metadata.get("comparison_operator", ">")
            condition_met = False

            if comparison_operator == ">":
                condition_met = value > alert.threshold_value
            elif comparison_operator == ">=":
                condition_met = value >= alert.threshold_value
            elif comparison_operator == "<":
                condition_met = value < alert.threshold_value
            elif comparison_operator == "<=":
                condition_met = value <= alert.threshold_value
            elif comparison_operator == "==":
                condition_met = value == alert.threshold_value
            elif comparison_operator == "!=":
                condition_met = value != alert.threshold_value

            if condition_met:
                await self._trigger_alert(alert, metric)

    async def _trigger_alert(self, alert: Alert, metric: Metric) -> None:
        """Trigger a performance alert."""
        try:
            # Update alert with current values
            alert.actual_value = metric.value
            alert.timestamp = datetime.now()
            alert.message = f"{alert.metadata.get('description', 'Alert triggered')} - Value: {metric.value}, Threshold: {alert.threshold_value}"

            # Add to alert history
            self.alert_history.append(alert)

            # Log alert
            self.logger.warning(f"ALERT TRIGGERED: {alert.name} - {alert.message}")

        except Exception as e:
            self.logger.error(f"Failed to trigger alert {alert.id}: {e}")

    def get_prometheus_metrics(self) -> str:
        """Get Prometheus metrics in text format."""
        if not self.prometheus_registry:
            return "# Prometheus metrics not available\n"

        try:
            from prometheus_client import generate_latest

            return generate_latest(self.prometheus_registry).decode("utf-8")
        except Exception as e:
            self.logger.error(f"Failed to generate Prometheus metrics: {e}")
            return f"# Error generating metrics: {e}\n"

    async def get_stats(self) -> Dict[str, Any]:
        """Get service statistics (required by BaseService)."""
        try:
            stats = await self.get_monitoring_stats()
            return {
                "total_metrics_recorded": stats.get("total_metrics", 0),
                "total_alerts_created": stats.get("total_alerts", 0),
                "active_alerts": stats.get("active_alerts", 0),
                "uptime_seconds": time.time() - (self.startup_time or time.time()),
                "status": self.status.value,
                "prometheus_enabled": self.enable_prometheus,
                "last_updated": (
                    self.health.last_updated.isoformat() if self.health else None
                ),
            }
        except Exception as e:
            self.logger.error(f"Failed to get stats: {e}")
            return {"error": str(e), "status": self.status.value}
