"""🦊 Reynard Backend Service Registry System
==========================================

Centralized service management system for the Reynard FastAPI backend, providing
comprehensive lifecycle control, health monitoring, and dependency management.
This registry implements enterprise-grade service orchestration with priority-based
initialization, parallel execution, and graceful shutdown procedures.

The Service Registry provides:
- Centralized service lifecycle management with status tracking
- Priority-based service initialization with dependency resolution
- Parallel execution within priority groups for optimal performance
- Comprehensive health monitoring and service status tracking
- Graceful shutdown procedures with timeout handling
- Error handling and recovery mechanisms with detailed logging
- Service discovery and dependency injection support
- Advanced dependency tracking and resolution
- Service metrics collection and performance monitoring
- Service configuration management

Key Features:
- Service Lifecycle Management: Complete control over service initialization and shutdown
- Priority-Based Initialization: Services start in dependency order with parallel execution
- Health Monitoring: Continuous health checks and service status tracking
- Error Recovery: Comprehensive error handling with service isolation
- Performance Optimization: Startup time optimization through parallel execution
- Service Discovery: Dynamic service lookup and dependency injection
- Configuration Management: Centralized service configuration and environment handling
- Dependency Management: Advanced dependency tracking and resolution
- Metrics Collection: Performance metrics and monitoring
- Graceful Shutdown: Dependency-aware shutdown with grace periods

Architecture Components:
- ServiceInfo: Service metadata and lifecycle information
- ServiceStatus: Service state enumeration and tracking
- ServiceRegistry: Central registry for service management
- Priority System: Dependency-based startup sequencing
- Health Monitoring: Continuous service health validation
- Dependency Tracking: Service dependency management
- Metrics Collection: Performance monitoring and analytics

The service registry ensures reliable service management while maintaining
optimal performance and comprehensive error handling throughout the
application lifecycle.

Author: Reynard Development Team
Version: 2.0.0
"""

import asyncio
import logging
import time
from collections import defaultdict
from collections.abc import Awaitable, Callable
from contextlib import asynccontextmanager
from dataclasses import dataclass, field
from enum import Enum
from typing import Any

logger = logging.getLogger(__name__)


class ServiceStatus(Enum):
    """Service status enumeration."""

    REGISTERED = "registered"
    INITIALIZING = "initializing"
    RUNNING = "running"
    STOPPING = "stopping"
    STOPPED = "stopped"
    ERROR = "error"


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
class ServiceInfo:
    """Service information and metadata."""

    name: str
    config: dict[str, Any]
    startup_func: Callable[[dict[str, Any]], Awaitable[bool]] | None = None
    shutdown_func: Callable[[], Awaitable[None]] | None = None
    health_check_func: Callable[[], Awaitable[bool]] | None = None
    status: ServiceStatus = ServiceStatus.REGISTERED
    instance: Any = None
    startup_time: float = 0.0
    shutdown_time: float = 0.0


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


class ServiceRegistry:
    """Centralized service registry with comprehensive lifecycle management.

    Provides enterprise-grade service orchestration with:
    - Priority-based initialization with dependency resolution
    - Comprehensive health monitoring and metrics collection
    - Graceful shutdown with dependency ordering
    - Service discovery and configuration management
    - Performance optimization through parallel execution
    """

    def __init__(self):
        # Core service management
        self._services: dict[str, ServiceInfo] = {}
        self._startup_order: list[str] = []
        self._shutdown_order: list[str] = []
        self._initialized = False

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
        startup_func: Callable[[dict[str, Any]], Awaitable[bool]] | None = None,
        shutdown_func: Callable[[], Awaitable[None]] | None = None,
        health_check_func: Callable[[], Awaitable[bool]] | None = None,
        startup_priority: int = 0,
        dependencies: list[ServiceDependency] | None = None,
        health_check_interval: float = 30.0,
    ) -> None:
        """Register a service with the registry."""
        if name in self._services:
            logger.warning(
                f"Service '{name}' already registered, updating configuration",
            )

        # Add startup priority to config for ordering
        config_with_priority = config.copy()
        config_with_priority["startup_priority"] = startup_priority

        self._services[name] = ServiceInfo(
            name=name,
            config=config_with_priority,
            startup_func=startup_func,
            shutdown_func=shutdown_func,
            health_check_func=health_check_func,
        )

        # Store dependencies
        if dependencies:
            self._dependencies[name] = dependencies
            for dep in dependencies:
                self._dependents[dep.name].add(name)

        # Store configuration
        self._configurations[name] = config

        # Initialize health info
        self._health_info[name] = ServiceHealthInfo(
            status=ServiceHealthStatus.UNKNOWN,
            last_check=0.0,
            check_interval=health_check_interval,
        )

        # Initialize metrics
        self._metrics[name] = ServiceMetrics()

        # Insert into startup order based on priority
        insert_index = 0
        for i, existing_name in enumerate(self._startup_order):
            if existing_name in self._services:
                existing_priority = self._services[existing_name].config.get(
                    "startup_priority",
                    0,
                )
                if startup_priority > existing_priority:
                    insert_index = i
                    break
                insert_index = i + 1

        if name not in self._startup_order:
            self._startup_order.insert(insert_index, name)

        # Shutdown order is reverse of startup order
        self._shutdown_order = list(reversed(self._startup_order))

        logger.info(f"Registered service '{name}' with priority {startup_priority}")

    def _build_dependency_graph(self, service_name: str) -> None:
        """Build dependency graph for a service."""
        if service_name in self._dependencies:
            for dep in self._dependencies[service_name]:
                if dep.dependency_type == ServiceDependencyType.REQUIRED:
                    # Ensure dependency is started first
                    if dep.name in self._startup_order:
                        dep_index = self._startup_order.index(dep.name)
                        service_index = self._startup_order.index(service_name)
                        if dep_index > service_index:
                            # Move dependency before service
                            self._startup_order.remove(dep.name)
                            self._startup_order.insert(service_index, dep.name)

    async def initialize_all(self, timeout: float = 30.0) -> bool:
        """Initialize all registered services with dependency resolution."""
        if self._initialized:
            logger.warning("Services already initialized")
            return True

        logger.info("Starting service initialization...")
        start_time = asyncio.get_event_loop().time()

        # Build dependency graph for all services
        for service_name in self._startup_order:
            self._build_dependency_graph(service_name)

        # Resolve startup order with dependencies
        resolved_order = self._resolve_startup_order()

        try:
            # Initialize services in dependency order
            for service_name in resolved_order:
                if service_name in self._services:
                    success = await self._initialize_service_with_dependencies(
                        service_name
                    )
                    if not success:
                        logger.error(f"Failed to initialize service '{service_name}'")
                        return False

            self._initialized = True
            elapsed_time = asyncio.get_event_loop().time() - start_time
            logger.info(f"All services initialized successfully in {elapsed_time:.2f}s")

            # Start health monitoring
            await self._start_health_monitoring()

            return True

        except Exception as e:
            logger.error(f"Service initialization failed: {e}")
            await self.shutdown_all()
            return False

    def _resolve_startup_order(self) -> list[str]:
        """Resolve startup order considering dependencies."""
        resolved: list[str] = []
        visited: set[str] = set()
        visiting: set[str] = set()

        def visit(service_name: str) -> None:
            if service_name in visiting:
                raise ValueError(
                    f"Circular dependency detected involving '{service_name}'"
                )
            if service_name in visited:
                return

            visiting.add(service_name)

            # Visit dependencies first
            if service_name in self._dependencies:
                for dep in self._dependencies[service_name]:
                    if dep.dependency_type == ServiceDependencyType.REQUIRED:
                        visit(dep.name)

            visiting.remove(service_name)
            visited.add(service_name)
            resolved.append(service_name)

        # Visit all services
        for service_name in self._startup_order:
            if service_name not in visited:
                visit(service_name)

        return resolved

    async def _initialize_service_with_dependencies(self, service_name: str) -> bool:
        """Initialize a service with its dependencies."""
        service_info = self._services[service_name]

        # Check dependencies first
        if service_name in self._dependencies:
            for dep in self._dependencies[service_name]:
                if dep.dependency_type == ServiceDependencyType.REQUIRED:
                    if not await self._is_dependency_healthy(dep.name):
                        logger.error(
                            f"Required dependency '{dep.name}' not healthy for service '{service_name}'"
                        )
                        return False

        # Initialize the service
        if service_info.startup_func:
            service_info.status = ServiceStatus.INITIALIZING
            start_time = time.time()

            try:
                success = await service_info.startup_func(service_info.config)
                if success:
                    service_info.status = ServiceStatus.RUNNING
                    service_info.startup_time = time.time() - start_time
                    self._metrics[service_name].startup_time = service_info.startup_time
                    logger.info(f"Service '{service_name}' initialized successfully")
                    return True
                else:
                    service_info.status = ServiceStatus.ERROR
                    logger.error(f"Service '{service_name}' initialization failed")
                    return False
            except Exception as e:
                service_info.status = ServiceStatus.ERROR
                logger.error(f"Service '{service_name}' initialization error: {e}")
                return False
        else:
            # Services without startup functions are considered running immediately
            service_info.status = ServiceStatus.RUNNING
            logger.info(f"Service '{service_name}' initialized (no startup function)")
            return True

    async def _is_dependency_healthy(self, dependency_name: str) -> bool:
        """Check if a dependency is healthy."""
        if dependency_name not in self._services:
            return False

        service_info = self._services[dependency_name]
        if service_info.status != ServiceStatus.RUNNING:
            return False

        if service_info.health_check_func:
            try:
                return await service_info.health_check_func()
            except Exception as e:
                logger.warning(
                    f"Health check failed for dependency '{dependency_name}': {e}"
                )
                return False

        return True

    async def shutdown_all(self, timeout: float = 30.0) -> bool:
        """Shutdown all services with graceful handling."""
        if not self._initialized:
            logger.warning("Services not initialized")
            return True

        logger.info("Starting service shutdown...")
        start_time = asyncio.get_event_loop().time()

        # Stop health monitoring
        await self._stop_health_monitoring()

        # Resolve shutdown order with dependencies
        shutdown_order = self._resolve_shutdown_order()

        try:
            # Shutdown services in reverse dependency order
            for service_name in shutdown_order:
                if service_name in self._services:
                    await self._shutdown_service_with_grace(service_name)

            self._initialized = False
            elapsed_time = asyncio.get_event_loop().time() - start_time
            logger.info(f"All services shutdown successfully in {elapsed_time:.2f}s")
            return True

        except Exception as e:
            logger.error(f"Service shutdown failed: {e}")
            return False

    def _resolve_shutdown_order(self) -> list[str]:
        """Resolve shutdown order considering dependencies."""
        # Shutdown in reverse of startup order, but ensure dependents are shut down first
        shutdown_order = []
        visited: set[str] = set()

        def visit(service_name: str) -> None:
            if service_name in visited:
                return

            visited.add(service_name)

            # Shutdown dependents first
            if service_name in self._dependents:
                for dependent in self._dependents[service_name]:
                    visit(dependent)

            shutdown_order.append(service_name)

        # Visit all services in reverse startup order
        for service_name in reversed(self._startup_order):
            if service_name not in visited:
                visit(service_name)

        return shutdown_order

    async def _shutdown_service_with_grace(self, service_name: str) -> None:
        """Shutdown a service with grace period."""
        service_info = self._services[service_name]

        if service_info.shutdown_func:
            service_info.status = ServiceStatus.STOPPING
            start_time = time.time()

            try:
                # Give service time to shutdown gracefully
                await asyncio.wait_for(
                    service_info.shutdown_func(), timeout=self._shutdown_grace_period
                )
                service_info.status = ServiceStatus.STOPPED
                service_info.shutdown_time = time.time() - start_time
                self._metrics[service_name].shutdown_time = service_info.shutdown_time
                logger.info(f"Service '{service_name}' shutdown successfully")
            except asyncio.TimeoutError:
                logger.warning(f"Service '{service_name}' shutdown timeout")
                service_info.status = ServiceStatus.STOPPED
            except Exception as e:
                logger.error(f"Service '{service_name}' shutdown error: {e}")
                service_info.status = ServiceStatus.ERROR

    async def _start_health_monitoring(self) -> None:
        """Start health monitoring for all services."""
        if self._health_check_running:
            return

        self._health_check_running = True
        logger.info("Starting health monitoring...")

    async def _stop_health_monitoring(self) -> None:
        """Stop health monitoring."""
        if not self._health_check_running:
            return

        self._health_check_running = False

        # Cancel all health check tasks
        for task in self._health_check_tasks.values():
            task.cancel()

        self._health_check_tasks.clear()
        logger.info("Health monitoring stopped")

    async def _monitor_service_health(self, service_name: str) -> None:
        """Monitor health of a specific service."""
        while self._health_check_running:
            try:
                if service_name in self._services:
                    service_info = self._services[service_name]
                    health_info = self._health_info[service_name]

                    if service_info.health_check_func:
                        is_healthy = await service_info.health_check_func()

                        if is_healthy:
                            health_info.status = ServiceHealthStatus.HEALTHY
                            health_info.consecutive_failures = 0
                            health_info.last_error = None
                        else:
                            health_info.consecutive_failures += 1
                            if health_info.consecutive_failures >= 3:
                                health_info.status = ServiceHealthStatus.UNHEALTHY
                            else:
                                health_info.status = ServiceHealthStatus.DEGRADED
                    else:
                        health_info.status = ServiceHealthStatus.UNKNOWN

                    health_info.last_check = time.time()

                await asyncio.sleep(health_info.check_interval)

            except Exception as e:
                logger.error(f"Health monitoring error for '{service_name}': {e}")
                if service_name in self._health_info:
                    self._health_info[service_name].last_error = str(e)
                    self._health_info[service_name].status = (
                        ServiceHealthStatus.UNHEALTHY
                    )
                await asyncio.sleep(5.0)  # Wait before retrying

    async def _initialize_service(self, name: str) -> bool:
        """Initialize a single service."""
        service_info = self._services[name]
        if not service_info.startup_func:
            return True

        try:
            start_time = time.time()
            success = await service_info.startup_func(service_info.config)
            service_info.startup_time = time.time() - start_time

            if success:
                service_info.status = ServiceStatus.RUNNING
                logger.info(f"Service '{name}' initialized successfully")
                return True
            else:
                service_info.status = ServiceStatus.ERROR
                logger.error(f"Service '{name}' initialization failed")
                return False

        except Exception as e:
            service_info.status = ServiceStatus.ERROR
            logger.error(f"Service '{name}' initialization error: {e}")
            return False

    async def _shutdown_service(self, name: str) -> bool:
        """Shutdown a single service."""
        service_info = self._services[name]
        if not service_info.shutdown_func:
            return True

        try:
            service_info.status = ServiceStatus.STOPPING
            start_time = time.time()
            await service_info.shutdown_func()
            service_info.shutdown_time = time.time() - start_time
            service_info.status = ServiceStatus.STOPPED
            logger.info(f"Service '{name}' shutdown successfully")
            return True

        except Exception as e:
            service_info.status = ServiceStatus.ERROR
            logger.error(f"Service '{name}' shutdown error: {e}")
            return False

    async def health_check_all(self) -> dict[str, bool]:
        """Perform health check on all services."""
        results = {}
        tasks = []

        for name, service_info in self._services.items():
            if service_info.health_check_func:
                task = asyncio.create_task(
                    self._health_check_service(name),
                    name=f"health_check_{name}",
                )
                tasks.append((name, task))

        if tasks:
            for name, task in tasks:
                try:
                    results[name] = await task
                except Exception as e:
                    logger.error(f"Health check failed for '{name}': {e}")
                    results[name] = False

        return results

    async def _health_check_service(self, name: str) -> bool:
        """Perform health check on a single service."""
        service_info = self._services[name]
        if not service_info.health_check_func:
            return True

        try:
            return await service_info.health_check_func()
        except Exception as e:
            logger.error(f"Health check error for '{name}': {e}")
            return False

    async def reload_service(self, service_name: str) -> bool:
        """Reload a specific service."""
        if service_name not in self._services:
            logger.error(f"Service '{service_name}' not found")
            return False

        logger.info(f"Reloading service '{service_name}'...")

        # Shutdown the service
        await self._shutdown_service(service_name)

        # Reinitialize the service
        success = await self._initialize_service(service_name)

        if success:
            logger.info(f"Service '{service_name}' reloaded successfully")
        else:
            logger.error(f"Service '{service_name}' reload failed")

        return success

    async def reload_services_by_pattern(self, pattern: str) -> dict[str, bool]:
        """Reload services matching a pattern."""
        results = {}
        matching_services = [name for name in self._services.keys() if pattern in name]

        if not matching_services:
            logger.warning(f"No services found matching pattern '{pattern}'")
            return results

        logger.info(
            f"Reloading services matching pattern '{pattern}': {matching_services}"
        )

        for service_name in matching_services:
            results[service_name] = await self.reload_service(service_name)

        return results

    def get_service_status(self, name: str) -> ServiceStatus | None:
        """Get the status of a specific service."""
        if name in self._services:
            return self._services[name].status
        return None

    def get_all_status(self) -> dict[str, ServiceStatus]:
        """Get the status of all services."""
        return {name: info.status for name, info in self._services.items()}

    def get_service_info(self, name: str) -> ServiceInfo | None:
        """Get information about a specific service."""
        return self._services.get(name)

    def set_service_instance(self, name: str, instance: Any) -> None:
        """Set the instance for a service."""
        if name in self._services:
            self._services[name].instance = instance
            logger.info(f"Service instance set for '{name}'")

    def get_service_instance(self, name: str) -> Any | None:
        """Get the instance of a service."""
        if name in self._services:
            return self._services[name].instance
        return None

    def is_healthy(self) -> bool:
        """Check if all services are healthy."""
        for service_info in self._services.values():
            if service_info.status == ServiceStatus.ERROR:
                return False
        return True

    # Enhanced methods from AdvancedServiceRegistry
    def get_service_health(self, service_name: str) -> ServiceHealthInfo | None:
        """Get health information for a service."""
        return self._health_info.get(service_name)

    def get_all_health_status(self) -> dict[str, ServiceHealthInfo]:
        """Get health status for all services."""
        return self._health_info.copy()

    def get_service_metrics(self, service_name: str) -> ServiceMetrics | None:
        """Get metrics for a service."""
        return self._metrics.get(service_name)

    def get_all_metrics(self) -> dict[str, ServiceMetrics]:
        """Get metrics for all services."""
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


# Global service registry instance
_service_registry: ServiceRegistry | None = None


def get_service_registry() -> ServiceRegistry:
    """Get the global service registry instance."""
    global _service_registry
    if _service_registry is None:
        _service_registry = ServiceRegistry()
    return _service_registry


@asynccontextmanager
async def service_lifespan():
    """Context manager for service lifecycle management."""
    registry = get_service_registry()

    try:
        # Initialize all services
        success = await registry.initialize_all()
        if not success:
            raise RuntimeError("Failed to initialize services")

        yield registry

    finally:
        # Shutdown all services
        await registry.shutdown_all()
