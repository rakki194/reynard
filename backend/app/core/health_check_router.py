"""Health Check Router for Reynard Backend

This module provides standardized health check endpoints that integrate
with the enhanced health check system and existing service routers.
"""

import logging
from typing import Any

from fastapi import HTTPException, status

from .base_router import BaseServiceRouter
from .health_checks import (
    get_health_check_manager,
    get_service_health,
    get_system_health,
    start_health_monitoring,
    stop_health_monitoring,
)

logger = logging.getLogger(__name__)


class HealthCheckRouter(BaseServiceRouter):
    """Standardized health check router for all services.

    Provides comprehensive health check endpoints including:
    - Individual service health checks
    - System-wide health aggregation
    - Health check metrics and analytics
    - Predictive health monitoring
    """

    def __init__(self, prefix: str = "/health", tags: list[str] | None = None):
        super().__init__(prefix=prefix, tags=tags or ["health"])
        self.health_manager = get_health_check_manager()
        self._setup_health_endpoints()

    def _setup_health_endpoints(self) -> None:
        """Setup all health check endpoints."""

        @self.router.get("/", summary="System Health Check")
        async def system_health() -> dict[str, Any]:
            """Get comprehensive system health status."""
            return await self._standard_async_operation(
                "system_health_check",
                get_system_health,
                "Failed to get system health status",
            )

        @self.router.get("/service/{service_name}", summary="Service Health Check")
        async def service_health(service_name: str) -> dict[str, Any]:
            """Get health status for a specific service."""
            return await self._standard_async_operation(
                f"service_health_check_{service_name}",
                lambda: get_service_health(service_name),
                f"Failed to get health status for service {service_name}",
            )

        @self.router.get("/services", summary="All Services Health Check")
        async def all_services_health() -> dict[str, Any]:
            """Get health status for all services."""
            return await self._standard_async_operation(
                "all_services_health_check",
                self._get_all_services_health,
                "Failed to get health status for all services",
            )

        @self.router.get("/metrics", summary="Health Check Metrics")
        async def health_metrics() -> dict[str, Any]:
            """Get comprehensive health check metrics."""
            return await self._standard_async_operation(
                "health_metrics",
                self._get_health_metrics,
                "Failed to get health check metrics",
            )

        @self.router.get("/predictive", summary="Predictive Health Alerts")
        async def predictive_alerts() -> dict[str, Any]:
            """Get predictive health monitoring alerts."""
            return await self._standard_async_operation(
                "predictive_alerts",
                self._get_predictive_alerts,
                "Failed to get predictive health alerts",
            )

        @self.router.post("/monitoring/start", summary="Start Health Monitoring")
        async def start_monitoring() -> dict[str, str]:
            """Start comprehensive health monitoring."""
            return await self._standard_async_operation(
                "start_health_monitoring",
                self._start_health_monitoring,
                "Failed to start health monitoring",
            )

        @self.router.post("/monitoring/stop", summary="Stop Health Monitoring")
        async def stop_monitoring() -> dict[str, str]:
            """Stop health monitoring."""
            return await self._standard_async_operation(
                "stop_health_monitoring",
                self._stop_health_monitoring,
                "Failed to stop health monitoring",
            )

        @self.router.get("/cache/{service_name}", summary="Get Cached Health Status")
        async def get_cached_health(service_name: str) -> dict[str, Any]:
            """Get cached health status for a service."""
            return await self._standard_async_operation(
                f"cached_health_{service_name}",
                lambda: self._get_cached_health(service_name),
                f"Failed to get cached health status for service {service_name}",
            )

        @self.router.get(
            "/dependencies/{service_name}",
            summary="Service Dependencies Health",
        )
        async def service_dependencies_health(service_name: str) -> dict[str, Any]:
            """Get health status of service dependencies."""
            return await self._standard_async_operation(
                f"dependencies_health_{service_name}",
                lambda: self._get_dependencies_health(service_name),
                f"Failed to get dependencies health for service {service_name}",
            )

        @self.router.get("/status", summary="Health Check System Status")
        async def health_system_status() -> dict[str, Any]:
            """Get health check system status and configuration."""
            return await self._standard_async_operation(
                "health_system_status",
                self._get_health_system_status,
                "Failed to get health system status",
            )

    async def _get_all_services_health(self) -> dict[str, Any]:
        """Get health status for all services."""
        all_results = self.health_manager.get_all_health_status()

        services_health = {}
        for service_name, result in all_results.items():
            services_health[service_name] = {
                "status": result.status.value,
                "timestamp": result.timestamp,
                "response_time": result.response_time,
                "details": result.details,
                "dependencies": result.dependencies,
                "errors": result.errors,
                "warnings": result.warnings,
                "metrics": result.metrics,
            }

        return {
            "services": services_health,
            "total_services": len(services_health),
            "healthy_services": len(
                [s for s in services_health.values() if s["status"] == "healthy"],
            ),
            "degraded_services": len(
                [s for s in services_health.values() if s["status"] == "degraded"],
            ),
            "unhealthy_services": len(
                [s for s in services_health.values() if s["status"] == "unhealthy"],
            ),
        }

    async def _get_health_metrics(self) -> dict[str, Any]:
        """Get comprehensive health check metrics."""
        aggregated = self.health_manager.get_aggregated_health()
        all_results = self.health_manager.get_all_health_status()

        # Calculate additional metrics
        total_response_time = sum(r.response_time for r in all_results.values())
        avg_response_time = total_response_time / len(all_results) if all_results else 0

        total_errors = sum(len(r.errors) for r in all_results.values())
        total_warnings = sum(len(r.warnings) for r in all_results.values())

        return {
            "system_metrics": aggregated,
            "performance_metrics": {
                "total_response_time": total_response_time,
                "average_response_time": avg_response_time,
                "total_errors": total_errors,
                "total_warnings": total_warnings,
                "cache_hit_rate": (
                    len(self.health_manager.health_cache) / len(all_results)
                    if all_results
                    else 0
                ),
            },
            "service_metrics": {
                name: {
                    "response_time": result.response_time,
                    "error_count": len(result.errors),
                    "warning_count": len(result.warnings),
                    "last_check": result.timestamp,
                }
                for name, result in all_results.items()
            },
        }

    async def _get_predictive_alerts(self) -> dict[str, Any]:
        """Get predictive health monitoring alerts."""
        alerts = self.health_manager.get_predictive_alerts()

        return {
            "predictive_alerts": alerts,
            "total_alerts": sum(
                len(service_alerts) for service_alerts in alerts.values()
            ),
            "services_with_alerts": len([s for s in alerts.values() if s]),
            "alert_summary": {
                "degrading_trends": len(
                    [
                        a
                        for service_alerts in alerts.values()
                        for a in service_alerts
                        if "degrading trend" in a
                    ],
                ),
                "performance_issues": len(
                    [
                        a
                        for service_alerts in alerts.values()
                        for a in service_alerts
                        if "response time" in a
                    ],
                ),
            },
        }

    async def _start_health_monitoring(self) -> dict[str, str]:
        """Start health monitoring."""
        await start_health_monitoring()
        return {"status": "success", "message": "Health monitoring started"}

    async def _stop_health_monitoring(self) -> dict[str, str]:
        """Stop health monitoring."""
        await stop_health_monitoring()
        return {"status": "success", "message": "Health monitoring stopped"}

    async def _get_cached_health(self, service_name: str) -> dict[str, Any]:
        """Get cached health status for a service."""
        cached = self.health_manager.get_health_cache(service_name)
        if cached:
            return {"service_name": service_name, "cached": True, "data": cached}
        return {
            "service_name": service_name,
            "cached": False,
            "message": "No cached data available",
        }

    async def _get_dependencies_health(self, service_name: str) -> dict[str, Any]:
        """Get health status of service dependencies."""
        result = self.health_manager.get_health_status(service_name)
        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Service {service_name} not found",
            )

        dependencies_info = []
        for dep_name in result.dependencies:
            dep_result = self.health_manager.get_health_status(dep_name)
            dependencies_info.append(
                {
                    "name": dep_name,
                    "status": dep_result.status.value if dep_result else "unknown",
                    "response_time": dep_result.response_time if dep_result else 0,
                    "errors": dep_result.errors if dep_result else [],
                    "warnings": dep_result.warnings if dep_result else [],
                },
            )

        return {
            "service_name": service_name,
            "dependencies": dependencies_info,
            "total_dependencies": len(dependencies_info),
            "healthy_dependencies": len(
                [d for d in dependencies_info if d["status"] == "healthy"],
            ),
            "degraded_dependencies": len(
                [d for d in dependencies_info if d["status"] == "degraded"],
            ),
            "unhealthy_dependencies": len(
                [d for d in dependencies_info if d["status"] == "unhealthy"],
            ),
        }

    async def _get_health_system_status(self) -> dict[str, Any]:
        """Get health check system status and configuration."""
        config = self.health_manager.config

        return {
            "system_status": (
                "running" if self.health_manager.health_check_tasks else "stopped"
            ),
            "configuration": {
                "enabled": config.enabled,
                "timeout": config.timeout,
                "retry_attempts": config.retry_attempts,
                "retry_delay": config.retry_delay,
                "cache_ttl": config.cache_ttl,
                "aggregation_interval": config.aggregation_interval,
                "predictive_enabled": config.predictive_enabled,
                "predictive_window": config.predictive_window,
            },
            "monitoring_status": {
                "active_tasks": len(self.health_manager.health_check_tasks),
                "aggregation_running": self.health_manager.aggregation_task is not None,
                "predictive_running": self.health_manager.predictive_task is not None,
            },
            "cache_status": {
                "cached_services": len(self.health_manager.health_cache),
                "cache_timestamps": len(self.health_manager.cache_timestamps),
            },
            "history_status": {
                "services_with_history": len(self.health_manager.health_history),
                "total_history_entries": sum(
                    len(history)
                    for history in self.health_manager.health_history.values()
                ),
            },
        }


# Global health check router instance
_health_check_router: HealthCheckRouter | None = None


def get_health_check_router() -> HealthCheckRouter:
    """Get the global health check router instance."""
    global _health_check_router
    if _health_check_router is None:
        _health_check_router = HealthCheckRouter()
    return _health_check_router


def create_health_check_router(
    prefix: str = "/health",
    tags: list[str] | None = None,
) -> HealthCheckRouter:
    """Create a new health check router instance."""
    return HealthCheckRouter(prefix=prefix, tags=tags)
