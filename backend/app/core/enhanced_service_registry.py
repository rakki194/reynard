"""Enhanced Service Registry for Reynard Backend

This module provides an enhanced service registry system with comprehensive
lifecycle management, health monitoring, dependency tracking, and graceful
shutdown handling. It extends the existing service registry with advanced
features for enterprise-grade service orchestration.
"""

import asyncio
import logging
import time
from collections import defaultdict
from dataclasses import dataclass, field
from enum import Enum
from typing import Any

from .service_registry import ServiceRegistry, ServiceStatus

logger = logging.getLogger(__name__)


class ServiceHealthStatus(Enum):
    """Enhanced health status for services."""

    HEALTHY = "healthy"
    DEGRADED = "degraded"
    UNHEALTHY = "unhealthy"
    UNKNOWN = "unknown"


class ServiceDependencyType(Enum):
    """Types of service dependencies."""

    REQUIRED = "required"  # Service cannot start without this dependency
    OPTIONAL = "optional"  # Service can start but may have reduced functionality
    SOFT = "soft"  # Service can start but will retry connection


@dataclass
class ServiceDependency:
    """Service dependency information."""

    name: str
    dependency_type: ServiceDependencyType
    health_check_required: bool = True
    retry_attempts: int = 3
    retry_delay: float = 1.0


@dataclass
class ServiceHealthInfo:
    """Enhanced health information for services."""

    status: ServiceHealthStatus
    last_check: float
    check_interval: float
    consecutive_failures: int = 0
    last_error: str | None = None
    metrics: dict[str, Any] = field(default_factory=dict)


@dataclass
class ServiceMetrics:
    """Service performance metrics."""

    startup_time: float = 0.0
    shutdown_time: float = 0.0
    total_requests: int = 0
    error_count: int = 0
    last_request_time: float = 0.0
    average_response_time: float = 0.0
    memory_usage: float = 0.0
    cpu_usage: float = 0.0


class EnhancedServiceRegistry(ServiceRegistry):
    """Enhanced service registry with advanced lifecycle management.

    Extends the base ServiceRegistry with:
    - Comprehensive health monitoring
    - Service dependency tracking and resolution
    - Graceful shutdown with dependency ordering
    - Service configuration management
    - Performance metrics collection
    - Service discovery and auto-recovery
    """

    def __init__(self):
        super().__init__()

        # Enhanced tracking
        self._dependencies: dict[str, list[ServiceDependency]] = defaultdict(list)
        self._dependents: dict[str, set[str]] = defaultdict(set)
        self._health_info: dict[str, ServiceHealthInfo] = {}
        self._metrics: dict[str, ServiceMetrics] = {}
        self._configurations: dict[str, dict[str, Any]] = {}

        # Health monitoring
        self._health_check_tasks: dict[str, asyncio.Task] = {}
        self._health_check_interval: float = 30.0
        self._health_check_running: bool = False

        # Graceful shutdown
        self._shutdown_timeout: float = 30.0
        self._shutdown_grace_period: float = 5.0

        # Service discovery
        self._service_endpoints: dict[str, str] = {}
        self._service_versions: dict[str, str] = {}

    def register_service(
        self,
        name: str,
        config: dict[str, Any],
        startup_func: callable | None = None,
        shutdown_func: callable | None = None,
        health_check_func: callable | None = None,
        startup_priority: int = 0,
        dependencies: list[ServiceDependency] | None = None,
        health_check_interval: float = 30.0,
        endpoint: str | None = None,
        version: str | None = None,
    ) -> None:
        """Register a service with enhanced metadata."""
        # Register with base registry
        super().register_service(
            name=name,
            config=config,
            startup_func=startup_func,
            shutdown_func=shutdown_func,
            health_check_func=health_check_func,
            startup_priority=startup_priority,
        )

        # Enhanced registration
        self._dependencies[name] = dependencies or []
        self._configurations[name] = config.copy()

        # Initialize health info
        self._health_info[name] = ServiceHealthInfo(
            status=ServiceHealthStatus.UNKNOWN,
            last_check=0.0,
            check_interval=health_check_interval,
        )

        # Initialize metrics
        self._metrics[name] = ServiceMetrics()

        # Service discovery
        if endpoint:
            self._service_endpoints[name] = endpoint
        if version:
            self._service_versions[name] = version

        # Build dependency graph
        self._build_dependency_graph(name)

        logger.info(
            f"Enhanced registration of service '{name}' with {len(dependencies or [])} dependencies",
        )

    def _build_dependency_graph(self, service_name: str) -> None:
        """Build the dependency graph for service orchestration."""
        for dependency in self._dependencies[service_name]:
            self._dependents[dependency.name].add(service_name)

    async def initialize_all(self, timeout: float = 30.0) -> bool:
        """Initialize all services with dependency resolution."""
        if self._initialized:
            logger.warning("Services already initialized")
            return True

        logger.info(
            "Starting enhanced service initialization with dependency resolution...",
        )
        start_time = time.time()

        try:
            # Resolve startup order based on dependencies
            startup_order = self._resolve_startup_order()

            # Initialize services in dependency order
            for service_name in startup_order:
                if service_name in self._services:
                    success = await self._initialize_service_with_dependencies(
                        service_name,
                    )
                    if not success:
                        logger.error(
                            f"Failed to initialize service '{service_name}', stopping initialization",
                        )
                        return False

            # Start health monitoring
            await self._start_health_monitoring()

            self._initialized = True
            total_time = time.time() - start_time
            logger.info(f"All services initialized successfully in {total_time:.2f}s")
            return True

        except Exception as e:
            logger.error(f"Enhanced service initialization failed: {e}")
            return False

    def _resolve_startup_order(self) -> list[str]:
        """Resolve startup order based on dependencies using topological sort."""
        # Create a copy of dependencies for processing
        remaining_deps = {
            name: deps.copy() for name, deps in self._dependencies.items()
        }
        startup_order = []

        while remaining_deps:
            # Find services with no remaining dependencies
            ready_services = [
                name
                for name, deps in remaining_deps.items()
                if not deps or all(dep.name in startup_order for dep in deps)
            ]

            if not ready_services:
                # Circular dependency detected
                logger.error(
                    f"Circular dependency detected in services: {list(remaining_deps.keys())}",
                )
                break

            # Add ready services to startup order
            for service_name in ready_services:
                startup_order.append(service_name)
                del remaining_deps[service_name]

        return startup_order

    async def _initialize_service_with_dependencies(self, service_name: str) -> bool:
        """Initialize a service with dependency validation."""
        service_info = self._services[service_name]
        dependencies = self._dependencies[service_name]

        # Check required dependencies
        for dependency in dependencies:
            if dependency.dependency_type == ServiceDependencyType.REQUIRED:
                if not await self._is_dependency_healthy(dependency.name):
                    logger.error(
                        f"Required dependency '{dependency.name}' is not healthy for service '{service_name}'",
                    )
                    return False

        # Initialize the service
        success = await self._initialize_service(service_name)

        if success:
            # Start health monitoring for this service
            if service_info.health_check_func:
                self._health_check_tasks[service_name] = asyncio.create_task(
                    self._monitor_service_health(service_name),
                )

        return success

    async def _is_dependency_healthy(self, dependency_name: str) -> bool:
        """Check if a dependency is healthy."""
        if dependency_name not in self._services:
            return False

        service_info = self._services[dependency_name]
        if service_info.status != ServiceStatus.RUNNING:
            return False

        # Check health if available
        if service_info.health_check_func:
            try:
                return await service_info.health_check_func()
            except Exception:
                return False

        return True

    async def shutdown_all(self, timeout: float = 30.0) -> bool:
        """Enhanced graceful shutdown with dependency ordering."""
        if not self._initialized:
            logger.info("No services to shutdown")
            return True

        logger.info("Starting enhanced graceful shutdown...")
        start_time = time.time()

        try:
            # Stop health monitoring
            await self._stop_health_monitoring()

            # Resolve shutdown order (reverse of startup with dependency consideration)
            shutdown_order = self._resolve_shutdown_order()

            # Shutdown services in dependency order
            for service_name in shutdown_order:
                if service_name in self._services:
                    await self._shutdown_service_with_grace(service_name)

            self._initialized = False
            total_time = time.time() - start_time
            logger.info(f"All services shutdown gracefully in {total_time:.2f}s")
            return True

        except Exception as e:
            logger.error(f"Enhanced service shutdown failed: {e}")
            return False

    def _resolve_shutdown_order(self) -> list[str]:
        """Resolve shutdown order based on dependencies."""
        # Shutdown dependents first, then dependencies
        shutdown_order = []
        remaining_services = set(self._services.keys())

        while remaining_services:
            # Find services with no remaining dependents
            ready_services = [
                name
                for name in remaining_services
                if not self._dependents[name]
                or all(dep in shutdown_order for dep in self._dependents[name])
            ]

            if not ready_services:
                # Add remaining services
                shutdown_order.extend(remaining_services)
                break

            for service_name in ready_services:
                shutdown_order.append(service_name)
                remaining_services.remove(service_name)

        return shutdown_order

    async def _shutdown_service_with_grace(self, service_name: str) -> None:
        """Shutdown a service with grace period."""
        service_info = self._services[service_name]

        if service_info.status != ServiceStatus.RUNNING:
            return

        logger.info(f"Gracefully shutting down service '{service_name}'...")
        service_info.status = ServiceStatus.STOPPING

        try:
            if service_info.shutdown_func:
                # Give service time to finish current operations
                await asyncio.wait_for(
                    service_info.shutdown_func(), timeout=self._shutdown_grace_period,
                )

            service_info.status = ServiceStatus.STOPPED
            logger.info(f"Service '{service_name}' shutdown successfully")

        except TimeoutError:
            logger.warning(f"Service '{service_name}' shutdown timeout, forcing stop")
            service_info.status = ServiceStatus.STOPPED
        except Exception as e:
            logger.error(f"Service '{service_name}' shutdown failed: {e}")
            service_info.status = ServiceStatus.ERROR

    async def _start_health_monitoring(self) -> None:
        """Start health monitoring for all services."""
        if self._health_check_running:
            return

        self._health_check_running = True
        logger.info("Starting service health monitoring...")

    async def _stop_health_monitoring(self) -> None:
        """Stop health monitoring for all services."""
        if not self._health_check_running:
            return

        self._health_check_running = False

        # Cancel all health check tasks
        for task in self._health_check_tasks.values():
            task.cancel()

        # Wait for tasks to complete
        if self._health_check_tasks:
            await asyncio.gather(
                *self._health_check_tasks.values(), return_exceptions=True,
            )

        self._health_check_tasks.clear()
        logger.info("Service health monitoring stopped")

    async def _monitor_service_health(self, service_name: str) -> None:
        """Monitor health of a specific service."""
        service_info = self._services[service_name]
        health_info = self._health_info[service_name]

        while (
            self._health_check_running and service_info.status == ServiceStatus.RUNNING
        ):
            try:
                # Perform health check
                if service_info.health_check_func:
                    is_healthy = await service_info.health_check_func()

                    if is_healthy:
                        health_info.status = ServiceHealthStatus.HEALTHY
                        health_info.consecutive_failures = 0
                        health_info.last_error = None
                    else:
                        health_info.status = ServiceHealthStatus.UNHEALTHY
                        health_info.consecutive_failures += 1
                        health_info.last_error = "Health check failed"
                else:
                    health_info.status = ServiceHealthStatus.UNKNOWN

                health_info.last_check = time.time()

                # Log health status changes
                if health_info.consecutive_failures > 0:
                    logger.warning(
                        f"Service '{service_name}' health check failed {health_info.consecutive_failures} times",
                    )

                # Wait for next check
                await asyncio.sleep(health_info.check_interval)

            except asyncio.CancelledError:
                break
            except Exception as e:
                health_info.status = ServiceHealthStatus.UNHEALTHY
                health_info.consecutive_failures += 1
                health_info.last_error = str(e)
                logger.error(f"Health check error for service '{service_name}': {e}")
                await asyncio.sleep(health_info.check_interval)

    def get_service_health(self, service_name: str) -> ServiceHealthInfo | None:
        """Get health information for a service."""
        return self._health_info.get(service_name)

    def get_all_health_status(self) -> dict[str, ServiceHealthInfo]:
        """Get health status for all services."""
        return self._health_info.copy()

    def get_service_metrics(self, service_name: str) -> ServiceMetrics | None:
        """Get performance metrics for a service."""
        return self._metrics.get(service_name)

    def get_all_metrics(self) -> dict[str, ServiceMetrics]:
        """Get performance metrics for all services."""
        return self._metrics.copy()

    def get_service_dependencies(self, service_name: str) -> list[ServiceDependency]:
        """Get dependencies for a service."""
        return self._dependencies.get(service_name, [])

    def get_service_dependents(self, service_name: str) -> set[str]:
        """Get services that depend on this service."""
        return self._dependents.get(service_name, set())

    def get_service_configuration(self, service_name: str) -> dict[str, Any] | None:
        """Get configuration for a service."""
        return self._configurations.get(service_name)

    def update_service_configuration(
        self, service_name: str, config: dict[str, Any],
    ) -> bool:
        """Update configuration for a service."""
        if service_name not in self._services:
            return False

        self._configurations[service_name].update(config)
        self._services[service_name].config.update(config)
        logger.info(f"Updated configuration for service '{service_name}'")
        return True

    def get_service_endpoint(self, service_name: str) -> str | None:
        """Get endpoint for a service."""
        return self._service_endpoints.get(service_name)

    def get_service_version(self, service_name: str) -> str | None:
        """Get version for a service."""
        return self._service_versions.get(service_name)

    def discover_services(self) -> dict[str, dict[str, Any]]:
        """Discover all registered services with metadata."""
        services = {}
        for name in self._services:
            services[name] = {
                "name": name,
                "status": self._services[name].status.value,
                "health": self._health_info.get(name, {})
                .get("status", ServiceHealthStatus.UNKNOWN)
                .value,
                "endpoint": self._service_endpoints.get(name),
                "version": self._service_versions.get(name),
                "dependencies": [dep.name for dep in self._dependencies.get(name, [])],
                "dependents": list(self._dependents.get(name, [])),
            }
        return services

    async def restart_service(self, service_name: str) -> bool:
        """Restart a specific service."""
        if service_name not in self._services:
            logger.error(f"Service '{service_name}' not found")
            return False

        logger.info(f"Restarting service '{service_name}'...")

        try:
            # Shutdown the service
            await self._shutdown_service_with_grace(service_name)

            # Wait a moment
            await asyncio.sleep(1.0)

            # Reinitialize the service
            success = await self._initialize_service_with_dependencies(service_name)

            if success:
                logger.info(f"Service '{service_name}' restarted successfully")
            else:
                logger.error(f"Failed to restart service '{service_name}'")

            return success

        except Exception as e:
            logger.error(f"Error restarting service '{service_name}': {e}")
            return False

    def get_registry_status(self) -> dict[str, Any]:
        """Get comprehensive registry status."""
        return {
            "initialized": self._initialized,
            "total_services": len(self._services),
            "running_services": len(
                [
                    s
                    for s in self._services.values()
                    if s.status == ServiceStatus.RUNNING
                ],
            ),
            "healthy_services": len(
                [
                    h
                    for h in self._health_info.values()
                    if h.status == ServiceHealthStatus.HEALTHY
                ],
            ),
            "health_monitoring_active": self._health_check_running,
            "active_health_checks": len(self._health_check_tasks),
            "services": self.discover_services(),
        }


# Global enhanced service registry instance
_enhanced_service_registry: EnhancedServiceRegistry | None = None


def get_enhanced_service_registry() -> EnhancedServiceRegistry:
    """Get the global enhanced service registry instance."""
    global _enhanced_service_registry
    if _enhanced_service_registry is None:
        _enhanced_service_registry = EnhancedServiceRegistry()
    return _enhanced_service_registry


def get_service_registry() -> EnhancedServiceRegistry:
    """Get the enhanced service registry (replaces base registry)."""
    return get_enhanced_service_registry()
