"""Enhanced Health Check System for Reynard Backend

This module provides comprehensive health check capabilities for all services
in the Reynard backend, including standardized formats, aggregation, dependency
tracking, caching, and predictive monitoring.
"""

import asyncio
import logging
import time
from dataclasses import dataclass, field
from enum import Enum
from typing import Any

from .service_registry import get_service_registry

logger = logging.getLogger(__name__)


class HealthStatus(Enum):
    """Standardized health status levels."""

    HEALTHY = "healthy"
    DEGRADED = "degraded"
    UNHEALTHY = "unhealthy"
    UNKNOWN = "unknown"
    MAINTENANCE = "maintenance"


class HealthCheckType(Enum):
    """Types of health checks."""

    BASIC = "basic"
    DEPENDENCY = "dependency"
    PERFORMANCE = "performance"
    SECURITY = "security"
    RESOURCE = "resource"


@dataclass
class HealthCheckResult:
    """Standardized health check result."""

    service_name: str
    status: HealthStatus
    timestamp: float
    check_type: HealthCheckType
    response_time: float
    details: dict[str, Any] = field(default_factory=dict)
    dependencies: list[str] = field(default_factory=list)
    errors: list[str] = field(default_factory=list)
    warnings: list[str] = field(default_factory=list)
    metrics: dict[str, Any] = field(default_factory=dict)


@dataclass
class HealthCheckConfig:
    """Health check configuration."""

    enabled: bool = True
    timeout: float = 5.0
    retry_attempts: int = 3
    retry_delay: float = 1.0
    cache_ttl: float = 30.0
    aggregation_interval: float = 60.0
    predictive_enabled: bool = False
    predictive_window: float = 300.0  # 5 minutes


class HealthCheckManager:
    """Comprehensive health check management system.

    Provides:
    - Standardized health check format
    - Health check aggregation and caching
    - Service dependency health tracking
    - Predictive health monitoring
    - Health check metrics and analytics
    """

    def __init__(self, config: HealthCheckConfig | None = None):
        self.config = config or HealthCheckConfig()
        self.registry = get_service_registry()

        # Health check storage
        self.health_results: dict[str, HealthCheckResult] = {}
        self.health_cache: dict[str, dict[str, Any]] = {}
        self.cache_timestamps: dict[str, float] = {}

        # Aggregation and metrics
        self.aggregated_results: dict[str, dict[str, Any]] = {}
        self.health_metrics: dict[str, dict[str, Any]] = {}
        self.dependency_graph: dict[str, set[str]] = {}

        # Predictive monitoring
        self.health_history: dict[str, list[HealthCheckResult]] = {}
        self.predictive_alerts: dict[str, list[str]] = {}

        # Health check tasks
        self.health_check_tasks: dict[str, asyncio.Task] = {}
        self.aggregation_task: asyncio.Task | None = None
        self.predictive_task: asyncio.Task | None = None

        logger.info("HealthCheckManager initialized with comprehensive monitoring")

    async def start_health_monitoring(self) -> None:
        """Start comprehensive health monitoring."""
        logger.info("🏥 Starting comprehensive health monitoring...")

        # Start individual service health checks
        for service_name in self.registry._services:
            self.health_check_tasks[service_name] = asyncio.create_task(
                self._health_check_loop(service_name),
            )

        # Start aggregation task
        self.aggregation_task = asyncio.create_task(self._aggregation_loop())

        # Start predictive monitoring if enabled
        if self.config.predictive_enabled:
            self.predictive_task = asyncio.create_task(
                self._predictive_monitoring_loop(),
            )

        logger.info("✅ Health monitoring started for all services")

    async def stop_health_monitoring(self) -> None:
        """Stop health monitoring."""
        logger.info("🛑 Stopping health monitoring...")

        # Cancel all health check tasks
        for task in self.health_check_tasks.values():
            task.cancel()

        # Cancel aggregation and predictive tasks
        if self.aggregation_task:
            self.aggregation_task.cancel()
        if self.predictive_task:
            self.predictive_task.cancel()

        # Wait for tasks to complete
        all_tasks = list(self.health_check_tasks.values())
        if self.aggregation_task:
            all_tasks.append(self.aggregation_task)
        if self.predictive_task:
            all_tasks.append(self.predictive_task)

        if all_tasks:
            await asyncio.gather(*all_tasks, return_exceptions=True)

        self.health_check_tasks.clear()
        self.aggregation_task = None
        self.predictive_task = None

        logger.info("✅ Health monitoring stopped")

    async def perform_health_check(self, service_name: str) -> HealthCheckResult:
        """Perform comprehensive health check for a service."""
        start_time = time.time()

        try:
            # Get service info
            service_info = self.registry.get_service_info(service_name)
            if not service_info:
                return HealthCheckResult(
                    service_name=service_name,
                    status=HealthStatus.UNKNOWN,
                    timestamp=time.time(),
                    check_type=HealthCheckType.BASIC,
                    response_time=0.0,
                    errors=[f"Service {service_name} not found in registry"],
                )

            # Perform basic health check
            basic_result = await self._perform_basic_health_check(
                service_name, service_info,
            )

            # Perform dependency health check
            dependency_result = await self._perform_dependency_health_check(
                service_name,
            )

            # Perform performance health check
            performance_result = await self._perform_performance_health_check(
                service_name,
            )

            # Aggregate results
            final_status = self._aggregate_health_status(
                [basic_result, dependency_result, performance_result],
            )

            response_time = time.time() - start_time

            return HealthCheckResult(
                service_name=service_name,
                status=final_status,
                timestamp=time.time(),
                check_type=HealthCheckType.BASIC,
                response_time=response_time,
                details={
                    "basic": basic_result,
                    "dependency": dependency_result,
                    "performance": performance_result,
                },
                dependencies=dependency_result.get("dependencies", []),
                errors=self._collect_errors(
                    [basic_result, dependency_result, performance_result],
                ),
                warnings=self._collect_warnings(
                    [basic_result, dependency_result, performance_result],
                ),
                metrics=performance_result.get("metrics", {}),
            )

        except Exception as e:
            logger.error(f"Health check failed for service {service_name}: {e}")
            return HealthCheckResult(
                service_name=service_name,
                status=HealthStatus.UNHEALTHY,
                timestamp=time.time(),
                check_type=HealthCheckType.BASIC,
                response_time=time.time() - start_time,
                errors=[str(e)],
            )

    def get_health_status(self, service_name: str) -> HealthCheckResult | None:
        """Get health status for a specific service."""
        return self.health_results.get(service_name)

    def get_all_health_status(self) -> dict[str, HealthCheckResult]:
        """Get health status for all services."""
        return self.health_results.copy()

    def get_aggregated_health(self) -> dict[str, Any]:
        """Get aggregated health status."""
        return self.aggregated_results.copy()

    async def _health_check_loop(self, service_name: str) -> None:
        """Health check loop for a specific service."""
        while True:
            try:
                # Perform health check
                result = await self.perform_health_check(service_name)

                # Store result
                self.health_results[service_name] = result

                # Update cache
                self._update_health_cache(service_name, result)

                # Update history for predictive monitoring
                if self.config.predictive_enabled:
                    self._update_health_history(service_name, result)

                # Wait for next check
                await asyncio.sleep(self.config.cache_ttl)

            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Health check error for service {service_name}: {e}")
                await asyncio.sleep(self.config.cache_ttl)

    async def _perform_basic_health_check(
        self, service_name: str, service_info: Any,
    ) -> dict[str, Any]:
        """Perform basic health check."""
        result = {"status": HealthStatus.UNKNOWN, "details": {}}

        try:
            # Check service status
            if service_info.status.value == "running":
                result["status"] = HealthStatus.HEALTHY
                result["details"]["service_status"] = "running"
            else:
                result["status"] = HealthStatus.UNHEALTHY
                result["details"]["service_status"] = service_info.status.value
                return result

            # Check if service has health check function
            if service_info.health_check_func:
                is_healthy = await service_info.health_check_func()
                if is_healthy:
                    result["status"] = HealthStatus.HEALTHY
                    result["details"]["health_check"] = "passed"
                else:
                    result["status"] = HealthStatus.UNHEALTHY
                    result["details"]["health_check"] = "failed"
            else:
                result["status"] = HealthStatus.HEALTHY
                result["details"]["health_check"] = "not_implemented"

            # Check service instance
            service_instance = self.registry.get_service_instance(service_name)
            if service_instance:
                result["details"]["instance_available"] = True
            else:
                result["details"]["instance_available"] = False
                if result["status"] == HealthStatus.HEALTHY:
                    result["status"] = HealthStatus.DEGRADED

        except Exception as e:
            result["status"] = HealthStatus.UNHEALTHY
            result["details"]["error"] = str(e)

        return result

    async def _perform_dependency_health_check(
        self, service_name: str,
    ) -> dict[str, Any]:
        """Perform dependency health check."""
        result = {"status": HealthStatus.HEALTHY, "dependencies": [], "details": {}}

        try:
            # Get service dependencies
            dependencies = self.registry.get_service_dependencies(service_name)

            if not dependencies:
                result["details"]["no_dependencies"] = True
                return result

            # Analyze dependency health
            unhealthy_deps, degraded_deps = self._analyze_dependency_health(
                dependencies,
            )

            # Build dependency results
            self._build_dependency_results(
                result, dependencies, unhealthy_deps, degraded_deps,
            )

            # Determine overall dependency status
            result["status"] = self._determine_dependency_status(
                dependencies, unhealthy_deps, degraded_deps,
            )

        except Exception as e:
            result["status"] = HealthStatus.UNHEALTHY
            result["details"]["error"] = str(e)

        return result

    def _analyze_dependency_health(
        self, dependencies: list,
    ) -> tuple[list[str], list[str]]:
        """Analyze health of service dependencies."""
        unhealthy_deps = []
        degraded_deps = []

        for dependency in dependencies:
            dep_name = dependency.name
            dep_result = self.health_results.get(dep_name)

            if dep_result:
                if dep_result.status == HealthStatus.UNHEALTHY:
                    unhealthy_deps.append(dep_name)
                elif dep_result.status == HealthStatus.DEGRADED:
                    degraded_deps.append(dep_name)

        return unhealthy_deps, degraded_deps

    def _build_dependency_results(
        self,
        result: dict,
        dependencies: list,
        unhealthy_deps: list[str],
        degraded_deps: list[str],
    ) -> None:
        """Build dependency result information."""
        for dependency in dependencies:
            dep_name = dependency.name
            dep_result = self.health_results.get(dep_name)

            result["dependencies"].append(
                {
                    "name": dep_name,
                    "type": dependency.dependency_type.value,
                    "status": dep_result.status.value if dep_result else "unknown",
                },
            )

        result["details"]["unhealthy_dependencies"] = unhealthy_deps
        result["details"]["degraded_dependencies"] = degraded_deps

    def _determine_dependency_status(
        self, dependencies: list, unhealthy_deps: list[str], degraded_deps: list[str],
    ) -> HealthStatus:
        """Determine overall dependency health status."""
        if unhealthy_deps:
            if any(
                dep.dependency_type.value == "required"
                for dep in dependencies
                if dep.name in unhealthy_deps
            ):
                return HealthStatus.UNHEALTHY
            return HealthStatus.DEGRADED
        if degraded_deps:
            return HealthStatus.DEGRADED
        return HealthStatus.HEALTHY

    async def _perform_performance_health_check(
        self, service_name: str,
    ) -> dict[str, Any]:
        """Perform performance health check."""
        result = {"status": HealthStatus.HEALTHY, "metrics": {}, "details": {}}

        try:
            # Get service metrics
            metrics = self.registry.get_service_metrics(service_name)
            if metrics:
                result["metrics"] = {
                    "startup_time": metrics.startup_time,
                    "total_requests": metrics.total_requests,
                    "error_count": metrics.error_count,
                    "average_response_time": metrics.average_response_time,
                    "memory_usage": metrics.memory_usage,
                    "cpu_usage": metrics.cpu_usage,
                }

                # Check performance thresholds
                if metrics.error_count > 10:
                    result["status"] = HealthStatus.DEGRADED
                    result["details"]["high_error_count"] = metrics.error_count

                if metrics.average_response_time > 5.0:
                    result["status"] = HealthStatus.DEGRADED
                    result["details"][
                        "slow_response_time"
                    ] = metrics.average_response_time

                if metrics.memory_usage > 0.8:  # 80% memory usage
                    result["status"] = HealthStatus.DEGRADED
                    result["details"]["high_memory_usage"] = metrics.memory_usage

                if metrics.cpu_usage > 0.9:  # 90% CPU usage
                    result["status"] = HealthStatus.DEGRADED
                    result["details"]["high_cpu_usage"] = metrics.cpu_usage

        except Exception as e:
            result["status"] = HealthStatus.UNHEALTHY
            result["details"]["error"] = str(e)

        return result

    def _aggregate_health_status(self, results: list[dict[str, Any]]) -> HealthStatus:
        """Aggregate health status from multiple check results."""
        statuses = [result.get("status", HealthStatus.UNKNOWN) for result in results]

        # Priority: UNHEALTHY > DEGRADED > UNKNOWN > HEALTHY
        if HealthStatus.UNHEALTHY in statuses:
            return HealthStatus.UNHEALTHY
        if HealthStatus.DEGRADED in statuses:
            return HealthStatus.DEGRADED
        if HealthStatus.UNKNOWN in statuses:
            return HealthStatus.UNKNOWN
        return HealthStatus.HEALTHY

    def _collect_errors(self, results: list[dict[str, Any]]) -> list[str]:
        """Collect all errors from health check results."""
        errors = []
        for result in results:
            if "error" in result.get("details", {}):
                errors.append(result["details"]["error"])
        return errors

    def _collect_warnings(self, results: list[dict[str, Any]]) -> list[str]:
        """Collect all warnings from health check results."""
        warnings = []
        for result in results:
            details = result.get("details", {})
            for key, value in details.items():
                if key.startswith("high_") or key.startswith("slow_"):
                    warnings.append(f"{key}: {value}")
        return warnings

    def _update_health_cache(
        self, service_name: str, result: HealthCheckResult,
    ) -> None:
        """Update health check cache."""
        self.health_cache[service_name] = {
            "status": result.status.value,
            "timestamp": result.timestamp,
            "response_time": result.response_time,
            "details": result.details,
            "errors": result.errors,
            "warnings": result.warnings,
        }
        self.cache_timestamps[service_name] = result.timestamp

    def _update_health_history(
        self, service_name: str, result: HealthCheckResult,
    ) -> None:
        """Update health history for predictive monitoring."""
        if service_name not in self.health_history:
            self.health_history[service_name] = []

        self.health_history[service_name].append(result)

        # Keep only recent history
        cutoff_time = time.time() - self.config.predictive_window
        self.health_history[service_name] = [
            r for r in self.health_history[service_name] if r.timestamp > cutoff_time
        ]

    async def _aggregation_loop(self) -> None:
        """Aggregate health check results periodically."""
        while True:
            try:
                await self._aggregate_health_results()
                await asyncio.sleep(self.config.aggregation_interval)
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Health aggregation error: {e}")
                await asyncio.sleep(self.config.aggregation_interval)

    async def _aggregate_health_results(self) -> None:
        """Aggregate health check results."""
        current_time = time.time()

        # Calculate overall system health
        total_services = len(self.health_results)
        healthy_services = len(
            [
                r
                for r in self.health_results.values()
                if r.status == HealthStatus.HEALTHY
            ],
        )
        degraded_services = len(
            [
                r
                for r in self.health_results.values()
                if r.status == HealthStatus.DEGRADED
            ],
        )
        unhealthy_services = len(
            [
                r
                for r in self.health_results.values()
                if r.status == HealthStatus.UNHEALTHY
            ],
        )

        # Calculate average response time
        avg_response_time = (
            sum(r.response_time for r in self.health_results.values()) / total_services
            if total_services > 0
            else 0
        )

        # Determine overall system status
        if unhealthy_services > 0:
            system_status = HealthStatus.UNHEALTHY
        elif degraded_services > 0:
            system_status = HealthStatus.DEGRADED
        else:
            system_status = HealthStatus.HEALTHY

        self.aggregated_results = {
            "system_status": system_status.value,
            "timestamp": current_time,
            "total_services": total_services,
            "healthy_services": healthy_services,
            "degraded_services": degraded_services,
            "unhealthy_services": unhealthy_services,
            "average_response_time": avg_response_time,
            "services": {
                name: {
                    "status": result.status.value,
                    "response_time": result.response_time,
                    "errors": result.errors,
                    "warnings": result.warnings,
                }
                for name, result in self.health_results.items()
            },
        }

        logger.debug(
            f"Health aggregation completed: {system_status.value} ({healthy_services}/{total_services} healthy)",
        )

    async def _predictive_monitoring_loop(self) -> None:
        """Predictive health monitoring loop."""
        while True:
            try:
                await self._perform_predictive_analysis()
                await asyncio.sleep(self.config.aggregation_interval)
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Predictive monitoring error: {e}")
                await asyncio.sleep(self.config.aggregation_interval)

    async def _perform_predictive_analysis(self) -> None:
        """Perform predictive health analysis."""
        for service_name, history in self.health_history.items():
            if len(history) < 5:  # Need at least 5 data points
                continue

            # Analyze trends
            recent_statuses = [r.status for r in history[-5:]]
            recent_response_times = [r.response_time for r in history[-5:]]

            # Check for degrading trends
            if recent_statuses.count(HealthStatus.DEGRADED) >= 3:
                alert = f"Service {service_name} showing degrading trend"
                self._add_predictive_alert(service_name, alert)

            # Check for increasing response times
            if len(recent_response_times) >= 3:
                if recent_response_times[-1] > recent_response_times[0] * 1.5:
                    alert = f"Service {service_name} response time increasing"
                    self._add_predictive_alert(service_name, alert)

    def _add_predictive_alert(self, service_name: str, alert: str) -> None:
        """Add predictive alert."""
        if service_name not in self.predictive_alerts:
            self.predictive_alerts[service_name] = []

        if alert not in self.predictive_alerts[service_name]:
            self.predictive_alerts[service_name].append(alert)
            logger.warning(f"🔮 Predictive alert: {alert}")


# Global health check manager instance
_health_check_manager: HealthCheckManager | None = None


def get_health_check_manager() -> HealthCheckManager:
    """Get the global health check manager instance."""
    global _health_check_manager
    if _health_check_manager is None:
        _health_check_manager = HealthCheckManager()
    return _health_check_manager


# Legacy health check functions for backward compatibility
async def health_check_gatekeeper() -> bool:
    """Legacy health check for Gatekeeper service."""
    manager = get_health_check_manager()
    result = manager.get_health_status("gatekeeper")
    return result.status == HealthStatus.HEALTHY if result else False


async def health_check_comfy() -> bool:
    """Legacy health check for ComfyUI service."""
    manager = get_health_check_manager()
    result = manager.get_health_status("comfy")
    return result.status == HealthStatus.HEALTHY if result else False


async def health_check_nlweb() -> bool:
    """Legacy health check for NLWeb service."""
    manager = get_health_check_manager()
    result = manager.get_health_status("nlweb")
    return result.status == HealthStatus.HEALTHY if result else False


async def health_check_rag() -> bool:
    """Health check for RAG service."""
    manager = get_health_check_manager()
    result = manager.get_health_status("rag")
    return result.status == HealthStatus.HEALTHY if result else False


async def health_check_search() -> bool:
    """Health check for Search service."""
    manager = get_health_check_manager()
    result = manager.get_health_status("search")
    return result.status == HealthStatus.HEALTHY if result else False


async def health_check_ollama() -> bool:
    """Health check for Ollama service."""
    manager = get_health_check_manager()
    result = manager.get_health_status("ollama")
    return result.status == HealthStatus.HEALTHY if result else False


async def health_check_tts() -> bool:
    """Health check for TTS service."""
    manager = get_health_check_manager()
    result = manager.get_health_status("tts")
    return result.status == HealthStatus.HEALTHY if result else False


async def health_check_rag() -> bool:
    """Health check for RAG service."""
    try:
        from app.core.service_registry import get_service_registry

        registry = get_service_registry()
        rag_service = registry.get_service_instance("rag")

        if not rag_service:
            return False

        # Use the RAG service's built-in health check
        if hasattr(rag_service, "get_system_health"):
            health_status = await rag_service.get_system_health()
            return health_status.get("healthy", False)
        
        # Fallback to basic initialization check
        return rag_service.is_initialized()

    except Exception as e:
        logger.error(f"❌ RAG service health check error: {e}")
        return False


async def health_check_ai_service() -> bool:
    """Health check for AI service."""
    try:
        from app.core.ai_service_initializer import health_check_ai_service as ai_health_check

        return await ai_health_check()

    except Exception as e:
        logger.error(f"❌ AI service health check error: {e}")
        return False


async def health_check_tts_service() -> bool:
    """Health check for TTS service."""
    try:
        from app.core.service_registry import get_service_registry

        registry = get_service_registry()
        tts_service = registry.get_service_instance("tts")

        if not tts_service:
            return False

        # Use the TTS service's built-in health check
        if hasattr(tts_service, "health_check"):
            return await tts_service.health_check()
        
        # Fallback to basic enabled check
        return getattr(tts_service, "_enabled", False)

    except Exception as e:
        logger.error(f"❌ TTS service health check error: {e}")
        return False


# Health check automation functions
async def start_health_monitoring() -> None:
    """Start comprehensive health monitoring."""
    manager = get_health_check_manager()
    await manager.start_health_monitoring()


async def stop_health_monitoring() -> None:
    """Stop health monitoring."""
    manager = get_health_check_manager()
    await manager.stop_health_monitoring()


async def get_system_health() -> dict[str, Any]:
    """Get comprehensive system health status."""
    manager = get_health_check_manager()
    return manager.get_aggregated_health()


async def get_service_health(service_name: str) -> dict[str, Any] | None:
    """Get health status for a specific service."""
    manager = get_health_check_manager()
    result = manager.get_health_status(service_name)
    if result:
        return {
            "service_name": result.service_name,
            "status": result.status.value,
            "timestamp": result.timestamp,
            "response_time": result.response_time,
            "details": result.details,
            "dependencies": result.dependencies,
            "errors": result.errors,
            "warnings": result.warnings,
            "metrics": result.metrics,
        }
    return None
