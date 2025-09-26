"""Service Load Balancing System

This module provides load balancing capabilities for services in the Reynard backend,
including round-robin, weighted, and health-based load balancing strategies.
"""

import asyncio
import logging
import random
import time
from dataclasses import dataclass, field
from enum import Enum
from typing import Any

from .service_registry import get_service_registry

logger = logging.getLogger(__name__)


class LoadBalancingStrategy(Enum):
    """Load balancing strategies."""

    ROUND_ROBIN = "round_robin"
    WEIGHTED_ROUND_ROBIN = "weighted_round_robin"
    LEAST_CONNECTIONS = "least_connections"
    HEALTH_BASED = "health_based"
    RANDOM = "random"
    IP_HASH = "ip_hash"


class ServiceInstanceStatus(Enum):
    """Service instance status."""

    HEALTHY = "healthy"
    DEGRADED = "degraded"
    UNHEALTHY = "unhealthy"
    MAINTENANCE = "maintenance"


@dataclass
class ServiceInstance:
    """Service instance information."""

    id: str
    endpoint: str
    weight: int = 1
    status: ServiceInstanceStatus = ServiceInstanceStatus.HEALTHY
    active_connections: int = 0
    total_requests: int = 0
    error_count: int = 0
    last_health_check: float = 0.0
    response_time_avg: float = 0.0
    metadata: dict[str, Any] = field(default_factory=dict)


@dataclass
class LoadBalancerConfig:
    """Load balancer configuration."""

    strategy: LoadBalancingStrategy = LoadBalancingStrategy.ROUND_ROBIN
    health_check_interval: float = 30.0
    health_check_timeout: float = 5.0
    max_retries: int = 3
    retry_delay: float = 1.0
    circuit_breaker_threshold: int = 5
    circuit_breaker_timeout: float = 60.0
    sticky_sessions: bool = False
    session_timeout: float = 3600.0


class ServiceLoadBalancer:
    """Service load balancer with multiple strategies and health monitoring.

    Provides:
    - Multiple load balancing strategies
    - Health monitoring and automatic failover
    - Circuit breaker pattern implementation
    - Session affinity and sticky sessions
    - Performance metrics and monitoring
    """

    def __init__(self, config: LoadBalancerConfig | None = None):
        self.config = config or LoadBalancerConfig()
        self.registry = get_service_registry()

        # Service instances
        self.service_instances: dict[str, list[ServiceInstance]] = {}
        self.current_index: dict[str, int] = {}
        self.instance_weights: dict[str, list[int]] = {}

        # Health monitoring
        self.health_check_tasks: dict[str, asyncio.Task] = {}
        self.circuit_breakers: dict[str, dict[str, Any]] = {}

        # Session management
        self.sticky_sessions: dict[str, str] = {}  # session_id -> instance_id
        self.session_timestamps: dict[str, float] = {}

        # Performance metrics
        self.metrics: dict[str, dict[str, Any]] = {}

        logger.info(
            f"ServiceLoadBalancer initialized with strategy: {self.config.strategy.value}",
        )

    def add_service_instance(
        self,
        service_name: str,
        instance_id: str,
        endpoint: str,
        weight: int = 1,
        metadata: dict[str, Any] | None = None,
    ) -> None:
        """Add a service instance to the load balancer."""
        if service_name not in self.service_instances:
            self.service_instances[service_name] = []
            self.current_index[service_name] = 0
            self.instance_weights[service_name] = []
            self.metrics[service_name] = {
                "total_requests": 0,
                "successful_requests": 0,
                "failed_requests": 0,
                "average_response_time": 0.0,
            }

        instance = ServiceInstance(
            id=instance_id,
            endpoint=endpoint,
            weight=weight,
            metadata=metadata or {},
        )

        self.service_instances[service_name].append(instance)
        self.instance_weights[service_name].append(weight)

        # Start health monitoring for this service
        if service_name not in self.health_check_tasks:
            self.health_check_tasks[service_name] = asyncio.create_task(
                self._health_check_loop(service_name),
            )

        logger.info(
            f"Added instance {instance_id} for service {service_name} at {endpoint}",
        )

    def remove_service_instance(self, service_name: str, instance_id: str) -> None:
        """Remove a service instance from the load balancer."""
        if service_name not in self.service_instances:
            return

        instances = self.service_instances[service_name]
        for i, instance in enumerate(instances):
            if instance.id == instance_id:
                instances.pop(i)
                self.instance_weights[service_name].pop(i)

                # Adjust current index if needed
                if self.current_index[service_name] >= len(instances):
                    self.current_index[service_name] = 0

                logger.info(
                    f"Removed instance {instance_id} for service {service_name}",
                )
                break

    def get_service_instance(
        self,
        service_name: str,
        session_id: str | None = None,
    ) -> ServiceInstance | None:
        """Get a service instance using the configured load balancing strategy."""
        if service_name not in self.service_instances:
            logger.warning(f"No instances found for service {service_name}")
            return None

        instances = self.service_instances[service_name]
        if not instances:
            logger.warning(f"No available instances for service {service_name}")
            return None

        # Filter healthy instances
        healthy_instances = [
            instance
            for instance in instances
            if instance.status
            in [ServiceInstanceStatus.HEALTHY, ServiceInstanceStatus.DEGRADED]
        ]

        if not healthy_instances:
            logger.error(f"No healthy instances available for service {service_name}")
            return None

        # Check for sticky sessions
        if self.config.sticky_sessions and session_id:
            if session_id in self.sticky_sessions:
                instance_id = self.sticky_sessions[session_id]
                for instance in healthy_instances:
                    if instance.id == instance_id:
                        return instance
                # Session instance is no longer healthy, remove from sticky sessions
                del self.sticky_sessions[session_id]

        # Select instance based on strategy
        selected_instance = self._select_instance(
            service_name,
            healthy_instances,
            session_id,
        )

        if selected_instance:
            # Update metrics
            selected_instance.active_connections += 1
            selected_instance.total_requests += 1
            self.metrics[service_name]["total_requests"] += 1

            # Set sticky session if enabled
            if self.config.sticky_sessions and session_id:
                self.sticky_sessions[session_id] = selected_instance.id
                self.session_timestamps[session_id] = time.time()

        return selected_instance

    def _select_instance(
        self,
        service_name: str,
        instances: list[ServiceInstance],
        session_id: str | None = None,
    ) -> ServiceInstance | None:
        """Select an instance based on the load balancing strategy."""
        if not instances:
            return None

        if self.config.strategy == LoadBalancingStrategy.ROUND_ROBIN:
            return self._round_robin_selection(service_name, instances)
        if self.config.strategy == LoadBalancingStrategy.WEIGHTED_ROUND_ROBIN:
            return self._weighted_round_robin_selection(service_name, instances)
        if self.config.strategy == LoadBalancingStrategy.LEAST_CONNECTIONS:
            return self._least_connections_selection(instances)
        if self.config.strategy == LoadBalancingStrategy.HEALTH_BASED:
            return self._health_based_selection(instances)
        if self.config.strategy == LoadBalancingStrategy.RANDOM:
            return self._random_selection(instances)
        if self.config.strategy == LoadBalancingStrategy.IP_HASH:
            return self._ip_hash_selection(instances, session_id)
        return self._round_robin_selection(service_name, instances)

    def _round_robin_selection(
        self,
        service_name: str,
        instances: list[ServiceInstance],
    ) -> ServiceInstance:
        """Round-robin selection strategy."""
        current_idx = self.current_index[service_name]
        selected_instance = instances[current_idx]
        self.current_index[service_name] = (current_idx + 1) % len(instances)
        return selected_instance

    def _weighted_round_robin_selection(
        self,
        service_name: str,
        instances: list[ServiceInstance],
    ) -> ServiceInstance:
        """Weighted round-robin selection strategy."""
        # This is a simplified implementation
        # A full implementation would track weighted rounds
        weights = self.instance_weights[service_name]
        total_weight = sum(weights)

        if total_weight == 0:
            return self._round_robin_selection(service_name, instances)

        # Select based on weights
        current_idx = self.current_index[service_name]
        selected_instance = instances[current_idx]
        self.current_index[service_name] = (current_idx + 1) % len(instances)
        return selected_instance

    def _least_connections_selection(
        self,
        instances: list[ServiceInstance],
    ) -> ServiceInstance:
        """Least connections selection strategy."""
        return min(instances, key=lambda x: x.active_connections)

    def _health_based_selection(
        self,
        instances: list[ServiceInstance],
    ) -> ServiceInstance:
        """Health-based selection strategy."""
        # Prefer healthy instances over degraded ones
        healthy_instances = [
            i for i in instances if i.status == ServiceInstanceStatus.HEALTHY
        ]
        if healthy_instances:
            return min(healthy_instances, key=lambda x: x.active_connections)
        # Fall back to degraded instances
        return min(instances, key=lambda x: x.active_connections)

    def _random_selection(self, instances: list[ServiceInstance]) -> ServiceInstance:
        """Random selection strategy."""
        return random.choice(instances)

    def _ip_hash_selection(
        self,
        instances: list[ServiceInstance],
        session_id: str | None = None,
    ) -> ServiceInstance:
        """IP hash selection strategy."""
        if not session_id:
            return self._random_selection(instances)

        # Use session_id as hash key
        hash_value = hash(session_id)
        index = hash_value % len(instances)
        return instances[index]

    async def _health_check_loop(self, service_name: str) -> None:
        """Health check loop for a service."""
        while True:
            try:
                await self._perform_health_checks(service_name)
                await asyncio.sleep(self.config.health_check_interval)
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Health check error for service {service_name}: {e}")
                await asyncio.sleep(self.config.health_check_interval)

    async def _perform_health_checks(self, service_name: str) -> None:
        """Perform health checks for all instances of a service."""
        if service_name not in self.service_instances:
            return

        instances = self.service_instances[service_name]
        for instance in instances:
            try:
                is_healthy = await self._check_instance_health(instance)

                if is_healthy:
                    if instance.status != ServiceInstanceStatus.HEALTHY:
                        logger.info(f"Instance {instance.id} is now healthy")
                    instance.status = ServiceInstanceStatus.HEALTHY
                    instance.error_count = 0
                else:
                    instance.error_count += 1
                    if instance.error_count >= self.config.circuit_breaker_threshold:
                        instance.status = ServiceInstanceStatus.UNHEALTHY
                        logger.warning(f"Instance {instance.id} marked as unhealthy")
                    else:
                        instance.status = ServiceInstanceStatus.DEGRADED

                instance.last_health_check = time.time()

            except Exception as e:
                logger.error(f"Health check failed for instance {instance.id}: {e}")
                instance.status = ServiceInstanceStatus.UNHEALTHY

    async def _check_instance_health(self, instance: ServiceInstance) -> bool:
        """Check the health of a specific instance."""
        try:
            import aiohttp

            # Perform health check
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    f"{instance.endpoint}/health",
                    timeout=aiohttp.ClientTimeout(
                        total=self.config.health_check_timeout,
                    ),
                ) as response:
                    return response.status == 200

        except Exception:
            return False

    def release_instance(self, service_name: str, instance_id: str) -> None:
        """Release a service instance (decrease active connections)."""
        if service_name not in self.service_instances:
            return

        for instance in self.service_instances[service_name]:
            if instance.id == instance_id:
                instance.active_connections = max(0, instance.active_connections - 1)
                break

    def record_request_result(
        self,
        service_name: str,
        instance_id: str,
        success: bool,
        response_time: float,
    ) -> None:
        """Record the result of a request."""
        if service_name not in self.service_instances:
            return

        for instance in self.service_instances[service_name]:
            if instance.id == instance_id:
                if success:
                    self.metrics[service_name]["successful_requests"] += 1
                else:
                    self.metrics[service_name]["failed_requests"] += 1
                    instance.error_count += 1

                # Update average response time
                total_requests = instance.total_requests
                if total_requests > 0:
                    instance.response_time_avg = (
                        instance.response_time_avg * (total_requests - 1)
                        + response_time
                    ) / total_requests

                break

    def get_service_metrics(self, service_name: str) -> dict[str, Any] | None:
        """Get metrics for a service."""
        if service_name not in self.metrics:
            return None

        metrics = self.metrics[service_name].copy()

        # Add instance-specific metrics
        if service_name in self.service_instances:
            instances = self.service_instances[service_name]
            metrics["total_instances"] = len(instances)
            metrics["healthy_instances"] = len(
                [i for i in instances if i.status == ServiceInstanceStatus.HEALTHY],
            )
            metrics["degraded_instances"] = len(
                [i for i in instances if i.status == ServiceInstanceStatus.DEGRADED],
            )
            metrics["unhealthy_instances"] = len(
                [i for i in instances if i.status == ServiceInstanceStatus.UNHEALTHY],
            )
            metrics["total_active_connections"] = sum(
                i.active_connections for i in instances
            )

        return metrics

    def get_all_metrics(self) -> dict[str, dict[str, Any]]:
        """Get metrics for all services."""
        return {name: self.get_service_metrics(name) for name in self.metrics}

    def cleanup_sticky_sessions(self) -> None:
        """Cleanup expired sticky sessions."""
        current_time = time.time()
        expired_sessions = [
            session_id
            for session_id, timestamp in self.session_timestamps.items()
            if current_time - timestamp > self.config.session_timeout
        ]

        for session_id in expired_sessions:
            del self.sticky_sessions[session_id]
            del self.session_timestamps[session_id]

        if expired_sessions:
            logger.info(f"Cleaned up {len(expired_sessions)} expired sticky sessions")

    async def shutdown(self) -> None:
        """Shutdown the load balancer."""
        # Cancel health check tasks
        for task in self.health_check_tasks.values():
            task.cancel()

        # Wait for tasks to complete
        if self.health_check_tasks:
            await asyncio.gather(
                *self.health_check_tasks.values(),
                return_exceptions=True,
            )

        self.health_check_tasks.clear()
        logger.info("ServiceLoadBalancer shutdown completed")


# Global load balancer instance
_load_balancer: ServiceLoadBalancer | None = None


def get_load_balancer() -> ServiceLoadBalancer:
    """Get the global load balancer instance."""
    global _load_balancer
    if _load_balancer is None:
        _load_balancer = ServiceLoadBalancer()
    return _load_balancer


def configure_load_balancer(config: LoadBalancerConfig) -> None:
    """Configure the global load balancer."""
    global _load_balancer
    _load_balancer = ServiceLoadBalancer(config)
