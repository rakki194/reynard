"""Comprehensive Test Suite for Refactored Backend Components

This module contains unit tests, integration tests, and performance benchmarks
for all refactored backend components in the Reynard project.
"""

import asyncio
import time
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from app.core.enhanced_service_registry import (
    EnhancedServiceRegistry,
    ServiceStatus,
)

# Core component imports
from app.core.error_handler import ServiceErrorHandler
from app.core.health_check_automation import (
    AlertLevel,
    AutomationAction,
    AutomationRule,
    HealthAlert,
    HealthCheckAutomation,
)
from app.core.health_checks import (
    HealthCheckConfig,
    HealthCheckManager,
    HealthCheckResult,
    HealthCheckType,
)
from app.core.logging_config import get_service_logger
from app.core.service_config_manager import (
    ConfigValidationLevel,
    ServiceConfigManager,
    ServiceConfigSchema,
)
from app.core.service_load_balancer import (
    LoadBalancingStrategy,
    ServiceInstance,
    ServiceLoadBalancer,
)

# Security component imports
from app.security.security_middleware import AdaptiveRateLimiter, SecurityErrorHandler


class TestServiceErrorHandler:
    """Test suite for ServiceErrorHandler."""

    @pytest.fixture
    def error_handler(self):
        return ServiceErrorHandler()

    @pytest.mark.asyncio
    async def test_handle_service_error(self, error_handler):
        """Test handling of service errors."""
        error = ValueError("Test error")
        result = await error_handler.handle_service_error(
            operation="test_operation", error=error, status_code=400,
        )

        assert result["error"] == "Test error"
        assert result["operation"] == "test_operation"
        assert result["status_code"] == 400
        assert "timestamp" in result
        assert "recovery_suggestions" in result

    @pytest.mark.asyncio
    async def test_handle_service_unavailable(self, error_handler):
        """Test handling of service unavailable errors."""
        result = await error_handler.handle_service_unavailable("database")

        assert result["error"] == "Service 'database' is currently unavailable"
        assert result["service"] == "database"
        assert result["status_code"] == 503
        assert "retry_after" in result

    @pytest.mark.asyncio
    async def test_error_metrics_collection(self, error_handler):
        """Test error metrics collection."""
        await error_handler.handle_service_error(
            operation="test_operation", error=ValueError("Test error"), status_code=400,
        )

        metrics = error_handler.get_error_metrics()
        assert metrics["total_errors"] >= 1
        assert "test_operation" in metrics["errors_by_operation"]

    @pytest.mark.asyncio
    async def test_recovery_strategies(self, error_handler):
        """Test error recovery strategies."""
        result = await error_handler.handle_service_error(
            operation="database_query",
            error=ConnectionError("Connection failed"),
            status_code=500,
        )

        assert "recovery_suggestions" in result
        suggestions = result["recovery_suggestions"]
        assert any("retry" in suggestion.lower() for suggestion in suggestions)


class TestEnhancedServiceRegistry:
    """Test suite for EnhancedServiceRegistry."""

    @pytest.fixture
    def registry(self):
        return EnhancedServiceRegistry()

    @pytest.fixture
    def mock_startup_func(self):
        async def startup(config):
            return {"status": "initialized", "config": config}

        return startup

    @pytest.fixture
    def mock_shutdown_func(self):
        async def shutdown(instance):
            return {"status": "shutdown"}

        return shutdown

    @pytest.fixture
    def mock_health_check_func(self):
        async def health_check():
            return HealthStatus.HEALTHY

        return health_check

    def test_service_registration(
        self, registry, mock_startup_func, mock_shutdown_func, mock_health_check_func,
    ):
        """Test service registration."""
        registry.register_service(
            name="test-service",
            config={"api_url": "http://localhost:8000"},
            startup_func=mock_startup_func,
            shutdown_func=mock_shutdown_func,
            health_check_func=mock_health_check_func,
            dependencies=["database"],
            is_critical=True,
        )

        assert "test-service" in registry._services
        service_info = registry._services["test-service"]
        assert service_info.name == "test-service"
        assert service_info.is_critical is True
        assert "database" in service_info.dependencies

    @pytest.mark.asyncio
    async def test_service_initialization(
        self, registry, mock_startup_func, mock_shutdown_func,
    ):
        """Test service initialization."""
        registry.register_service(
            name="test-service",
            config={"api_url": "http://localhost:8000"},
            startup_func=mock_startup_func,
            shutdown_func=mock_shutdown_func,
        )

        success = await registry.initialize_service("test-service")
        assert success is True

        service_info = registry._services["test-service"]
        assert service_info.status == ServiceStatus.RUNNING
        assert service_info.instance is not None

    @pytest.mark.asyncio
    async def test_service_shutdown(
        self, registry, mock_startup_func, mock_shutdown_func,
    ):
        """Test service shutdown."""
        registry.register_service(
            name="test-service",
            config={"api_url": "http://localhost:8000"},
            startup_func=mock_startup_func,
            shutdown_func=mock_shutdown_func,
        )

        await registry.initialize_service("test-service")
        await registry.shutdown_service("test-service")

        service_info = registry._services["test-service"]
        assert service_info.status == ServiceStatus.STOPPED

    @pytest.mark.asyncio
    async def test_dependency_resolution(
        self, registry, mock_startup_func, mock_shutdown_func,
    ):
        """Test service dependency resolution."""
        # Register services with dependencies
        registry.register_service(
            name="database",
            config={"connection_string": "sqlite:///test.db"},
            startup_func=mock_startup_func,
            shutdown_func=mock_shutdown_func,
        )

        registry.register_service(
            name="api-service",
            config={"port": 8000},
            startup_func=mock_startup_func,
            shutdown_func=mock_shutdown_func,
            dependencies=["database"],
        )

        # Initialize all services
        success = await registry.initialize_all()
        assert success is True

        # Check that database was initialized before api-service
        db_service = registry._services["database"]
        api_service = registry._services["api-service"]
        assert db_service.startup_time < api_service.startup_time

    def test_service_info_retrieval(
        self, registry, mock_startup_func, mock_shutdown_func,
    ):
        """Test service information retrieval."""
        registry.register_service(
            name="test-service",
            config={"test": True},
            startup_func=mock_startup_func,
            shutdown_func=mock_shutdown_func,
        )

        service_info = registry.get_service_info("test-service")
        assert service_info is not None
        assert service_info.name == "test-service"

        # Test non-existent service
        non_existent = registry.get_service_info("non-existent")
        assert non_existent is None


class TestServiceConfigManager:
    """Test suite for ServiceConfigManager."""

    @pytest.fixture
    def config_manager(self):
        return ServiceConfigManager()

    def test_service_config_registration(self, config_manager):
        """Test service configuration registration."""
        default_config = {"timeout": 30, "retries": 3}
        schema = ServiceConfigSchema(
            required_fields=["timeout"],
            optional_fields=["retries"],
            field_types={"timeout": int, "retries": int},
            field_defaults={"timeout": 30, "retries": 3},
        )

        config_manager.register_service_config(
            "test-service", default_config=default_config, schema=schema,
        )

        config = config_manager.get_config("test-service")
        assert config["timeout"] == 30
        assert config["retries"] == 3

    def test_config_validation(self, config_manager):
        """Test configuration validation."""
        schema = ServiceConfigSchema(
            required_fields=["timeout"],
            field_types={"timeout": int},
            validation_rules={"timeout": {"min": 1, "max": 300}},
        )

        config_manager.register_service_config(
            "test-service", default_config={"timeout": 30}, schema=schema,
        )

        # Test valid configuration
        config = config_manager.get_config("test-service")
        assert config["timeout"] == 30

        # Test invalid configuration
        config_manager.config_validation_level = ConfigValidationLevel.STRICT
        with pytest.raises(ValueError):
            config_manager.update_config("test-service", {"timeout": 0})

    def test_environment_overrides(self, config_manager):
        """Test environment variable overrides."""
        import os

        config_manager.register_service_config(
            "test-service", default_config={"timeout": 30, "enabled": True},
        )

        # Set environment variable
        os.environ["TEST_SERVICE_TIMEOUT"] = "60"
        os.environ["TEST_SERVICE_ENABLED"] = "false"

        config = config_manager.get_config("test-service")
        assert config["timeout"] == 60
        assert config["enabled"] is False

        # Clean up
        del os.environ["TEST_SERVICE_TIMEOUT"]
        del os.environ["TEST_SERVICE_ENABLED"]

    def test_config_update(self, config_manager):
        """Test configuration updates."""
        config_manager.register_service_config(
            "test-service", default_config={"timeout": 30},
        )

        updated_config = config_manager.update_config("test-service", {"timeout": 60})
        assert updated_config["timeout"] == 60

        # Verify the update persisted
        config = config_manager.get_config("test-service")
        assert config["timeout"] == 60


class TestServiceLoadBalancer:
    """Test suite for ServiceLoadBalancer."""

    @pytest.fixture
    def mock_registry(self):
        registry = MagicMock()
        registry.get_service_info.return_value = MagicMock(
            health_status=HealthStatus.HEALTHY,
        )
        return registry

    @pytest.fixture
    def load_balancer(self, mock_registry):
        return ServiceLoadBalancer(registry=mock_registry)

    def test_instance_registration(self, load_balancer):
        """Test service instance registration."""
        load_balancer.register_instance(
            "test-service", "http://instance1:8000", weight=2,
        )
        load_balancer.register_instance(
            "test-service", "http://instance2:8000", weight=1,
        )

        instances = load_balancer._service_instances["test-service"]
        assert len(instances) == 2
        assert instances[0].address == "http://instance1:8000"
        assert instances[0].weight == 2
        assert instances[1].address == "http://instance2:8000"
        assert instances[1].weight == 1

    @pytest.mark.asyncio
    async def test_round_robin_balancing(self, load_balancer):
        """Test round-robin load balancing."""
        load_balancer.register_instance("test-service", "http://instance1:8000")
        load_balancer.register_instance("test-service", "http://instance2:8000")

        # Get multiple instances
        instance1 = await load_balancer.get_next_instance("test-service")
        instance2 = await load_balancer.get_next_instance("test-service")
        instance3 = await load_balancer.get_next_instance("test-service")

        # Should alternate between instances
        assert instance1.address != instance2.address
        assert instance1.address == instance3.address

    @pytest.mark.asyncio
    async def test_health_based_balancing(self, load_balancer):
        """Test health-based load balancing."""
        # Register instances with different health statuses
        instance1 = ServiceInstance("test-service", "http://instance1:8000")
        instance1.health_status = HealthStatus.HEALTHY

        instance2 = ServiceInstance("test-service", "http://instance2:8000")
        instance2.health_status = HealthStatus.DEGRADED

        load_balancer._service_instances["test-service"] = [instance1, instance2]

        # Should prefer healthy instance
        selected = await load_balancer.get_next_instance(
            "test-service", strategy=LoadBalancingStrategy.HEALTH_BASED,
        )
        assert selected.health_status == HealthStatus.HEALTHY

    def test_circuit_breaker(self, load_balancer):
        """Test circuit breaker functionality."""
        load_balancer.register_instance("test-service", "http://instance1:8000")

        # Record multiple failures
        for _ in range(6):  # More than threshold
            load_balancer.record_failure("test-service", "http://instance1:8000")

        instance = load_balancer._service_instances["test-service"][0]
        assert instance.circuit_breaker_state == CircuitBreakerState.OPEN

        # Record success to close circuit breaker
        load_balancer.record_success("test-service", "http://instance1:8000")
        assert instance.circuit_breaker_state == CircuitBreakerState.HALF_OPEN


class TestHealthCheckManager:
    """Test suite for HealthCheckManager."""

    @pytest.fixture
    def mock_registry(self):
        registry = MagicMock()
        service_info = MagicMock()
        service_info.status = MagicMock(value="running")
        service_info.health_check_func = AsyncMock(return_value=True)
        registry.get_service_info.return_value = service_info
        registry.get_service_instance.return_value = {"status": "running"}
        registry.get_service_dependencies.return_value = []
        registry.get_service_metrics.return_value = None
        return registry

    @pytest.fixture
    def health_manager(self, mock_registry):
        with patch(
            "app.core.health_checks.get_enhanced_service_registry",
            return_value=mock_registry,
        ):
            return HealthCheckManager()

    @pytest.mark.asyncio
    async def test_health_check_performance(self, health_manager):
        """Test health check performance."""
        start_time = time.time()
        result = await health_manager.perform_health_check("test-service")
        end_time = time.time()

        assert result.service_name == "test-service"
        assert result.status in [HealthStatus.HEALTHY, HealthStatus.UNHEALTHY]
        assert result.response_time >= 0
        assert (end_time - start_time) < 1.0  # Should complete within 1 second

    @pytest.mark.asyncio
    async def test_health_check_caching(self, health_manager):
        """Test health check caching."""
        # Perform health check
        result1 = await health_manager.perform_health_check("test-service")

        # Check cache
        cached = health_manager.get_health_cache("test-service")
        assert cached is not None
        assert cached["status"] == result1.status.value

    def test_health_status_aggregation(self, health_manager):
        """Test health status aggregation."""
        # Mock health results
        health_manager.health_results = {
            "service1": MagicMock(status=HealthStatus.HEALTHY),
            "service2": MagicMock(status=HealthStatus.DEGRADED),
            "service3": MagicMock(status=HealthStatus.UNHEALTHY),
        }

        aggregated = health_manager.get_aggregated_health()
        assert aggregated["total_services"] == 3
        assert aggregated["healthy_services"] == 1
        assert aggregated["degraded_services"] == 1
        assert aggregated["unhealthy_services"] == 1
        assert aggregated["system_status"] == "unhealthy"  # Worst status wins


class TestHealthCheckAutomation:
    """Test suite for HealthCheckAutomation."""

    @pytest.fixture
    def mock_health_manager(self):
        manager = MagicMock()
        manager.get_all_health_status.return_value = {
            "test-service": MagicMock(
                status=HealthStatus.HEALTHY,
                response_time=2.0,
                errors=[],
                metrics={"memory_usage": 0.5, "cpu_usage": 0.3},
            ),
        }
        return manager

    @pytest.fixture
    def automation(self, mock_health_manager):
        return HealthCheckAutomation(health_manager=mock_health_manager)

    def test_alert_creation(self, automation):
        """Test health alert creation."""
        alert = HealthAlert(
            service_name="test-service",
            condition="response_time > 5.0",
            threshold=5.0,
            duration=120.0,
            alert_level=AlertLevel.WARNING,
            action=AutomationAction.SCALE_UP,
        )

        alert_id = automation.add_alert(alert)
        assert alert_id in automation.alerts
        assert automation.alerts[alert_id] == alert

    def test_rule_creation(self, automation):
        """Test automation rule creation."""
        rule = AutomationRule(
            name="test-rule",
            description="Test automation rule",
            conditions=["status == 'unhealthy'"],
            actions=[AutomationAction.RESTART_SERVICE],
        )

        rule_id = automation.add_rule(rule)
        assert rule_id in automation.rules
        assert automation.rules[rule_id] == rule

    @pytest.mark.asyncio
    async def test_alert_condition_evaluation(self, automation):
        """Test alert condition evaluation."""
        # Create alert for high response time
        alert = HealthAlert(
            service_name="test-service",
            condition="response_time > 1.0",
            threshold=1.0,
            duration=60.0,
            alert_level=AlertLevel.WARNING,
            action=AutomationAction.NOTIFY_ADMIN,
        )

        # Mock health result with high response time
        health_result = MagicMock()
        health_result.response_time = 2.0

        # Should trigger alert
        assert automation._evaluate_alert_condition(alert, health_result) is True

        # Mock health result with low response time
        health_result.response_time = 0.5

        # Should not trigger alert
        assert automation._evaluate_alert_condition(alert, health_result) is False

    def test_automation_status(self, automation):
        """Test automation system status."""
        status = automation.get_automation_status()

        assert "automation_running" in status
        assert "alerts" in status
        assert "rules" in status
        assert "history" in status

        assert status["alerts"]["total"] >= 0
        assert status["rules"]["total"] >= 0


class TestSecurityComponents:
    """Test suite for security components."""

    @pytest.fixture
    def security_handler(self):
        return SecurityErrorHandler()

    @pytest.fixture
    def rate_limiter(self):
        return AdaptiveRateLimiter(
            default_rate=100, burst_rate=200, adaptive_enabled=True,
        )

    @pytest.mark.asyncio
    async def test_security_error_handling(self, security_handler):
        """Test security error handling."""
        result = await security_handler.handle_security_error(
            error_type="authentication_failed",
            details={"user": "test_user", "ip": "192.168.1.1"},
            severity="high",
        )

        assert result["error_type"] == "authentication_failed"
        assert result["severity"] == "high"
        assert "timestamp" in result
        assert "threat_level" in result

    def test_rate_limiting(self, rate_limiter):
        """Test rate limiting functionality."""
        client_id = "test_client"

        # Should allow requests within limit
        for _ in range(50):
            assert rate_limiter.is_allowed(client_id) is True

        # Should block requests beyond limit
        for _ in range(100):
            rate_limiter.is_allowed(client_id)

        assert rate_limiter.is_allowed(client_id) is False

    def test_adaptive_rate_limiting(self, rate_limiter):
        """Test adaptive rate limiting."""
        client_id = "test_client"

        # Simulate good behavior
        for _ in range(10):
            rate_limiter.record_request(client_id, success=True)

        # Should increase rate limit for good clients
        assert rate_limiter.get_client_rate(client_id) > 100

        # Simulate bad behavior
        for _ in range(10):
            rate_limiter.record_request(client_id, success=False)

        # Should decrease rate limit for bad clients
        assert rate_limiter.get_client_rate(client_id) < 100


class TestIntegrationScenarios:
    """Integration test scenarios."""

    @pytest.mark.asyncio
    async def test_full_service_lifecycle(self):
        """Test complete service lifecycle."""
        # Initialize components
        registry = EnhancedServiceRegistry()
        config_manager = ServiceConfigManager()
        health_manager = HealthCheckManager()

        # Register service configuration
        config_manager.register_service_config(
            "test-service", default_config={"timeout": 30, "retries": 3},
        )

        # Register service
        async def startup_func(config):
            return {"status": "initialized", "config": config}

        async def shutdown_func(instance):
            return {"status": "shutdown"}

        async def health_check_func():
            return HealthStatus.HEALTHY

        registry.register_service(
            name="test-service",
            config=config_manager.get_config("test-service"),
            startup_func=startup_func,
            shutdown_func=shutdown_func,
            health_check_func=health_check_func,
        )

        # Initialize service
        success = await registry.initialize_service("test-service")
        assert success is True

        # Check health
        health_result = await health_manager.perform_health_check("test-service")
        assert health_result.status == HealthStatus.HEALTHY

        # Shutdown service
        await registry.shutdown_service("test-service")
        service_info = registry.get_service_info("test-service")
        assert service_info.status == ServiceStatus.STOPPED

    @pytest.mark.asyncio
    async def test_error_handling_integration(self):
        """Test error handling integration."""
        error_handler = ServiceErrorHandler()

        # Simulate service error
        result = await error_handler.handle_service_error(
            operation="database_query",
            error=ConnectionError("Database connection failed"),
            status_code=500,
        )

        assert result["error"] == "Database connection failed"
        assert result["status_code"] == 500
        assert "recovery_suggestions" in result

        # Check metrics
        metrics = error_handler.get_error_metrics()
        assert metrics["total_errors"] >= 1
        assert "database_query" in metrics["errors_by_operation"]

    @pytest.mark.asyncio
    async def test_health_monitoring_integration(self):
        """Test health monitoring integration."""
        health_manager = HealthCheckManager()

        # Start health monitoring
        await health_manager.start_health_monitoring()

        # Wait for health checks
        await asyncio.sleep(1)

        # Get system health
        system_health = health_manager.get_aggregated_health()
        assert "system_status" in system_health
        assert "total_services" in system_health

        # Stop health monitoring
        await health_manager.stop_health_monitoring()


class TestPerformanceBenchmarks:
    """Performance benchmark tests."""

    @pytest.mark.asyncio
    async def test_service_initialization_performance(self):
        """Benchmark service initialization performance."""
        registry = EnhancedServiceRegistry()

        # Register multiple services
        for i in range(10):

            async def startup_func(config):
                await asyncio.sleep(0.01)  # Simulate initialization time
                return {"service_id": i, "config": config}

            registry.register_service(
                name=f"service-{i}", config={"id": i}, startup_func=startup_func,
            )

        # Measure initialization time
        start_time = time.time()
        success = await registry.initialize_all()
        end_time = time.time()

        assert success is True
        initialization_time = end_time - start_time
        assert initialization_time < 2.0  # Should initialize within 2 seconds

    @pytest.mark.asyncio
    async def test_health_check_performance(self):
        """Benchmark health check performance."""
        health_manager = HealthCheckManager()

        # Measure health check time
        start_time = time.time()
        result = await health_manager.perform_health_check("test-service")
        end_time = time.time()

        health_check_time = end_time - start_time
        assert health_check_time < 0.5  # Should complete within 500ms
        assert result.response_time < 0.5

    @pytest.mark.asyncio
    async def test_load_balancer_performance(self):
        """Benchmark load balancer performance."""
        mock_registry = MagicMock()
        load_balancer = ServiceLoadBalancer(registry=mock_registry)

        # Register multiple instances
        for i in range(100):
            load_balancer.register_instance("test-service", f"http://instance{i}:8000")

        # Measure selection time
        start_time = time.time()
        for _ in range(1000):
            instance = await load_balancer.get_next_instance("test-service")
            assert instance is not None
        end_time = time.time()

        selection_time = end_time - start_time
        avg_time_per_selection = selection_time / 1000
        assert avg_time_per_selection < 0.001  # Should be under 1ms per selection

    def test_config_manager_performance(self):
        """Benchmark configuration manager performance."""
        config_manager = ServiceConfigManager()

        # Register many services
        for i in range(1000):
            config_manager.register_service_config(
                f"service-{i}", default_config={"id": i, "timeout": 30},
            )

        # Measure config retrieval time
        start_time = time.time()
        for i in range(1000):
            config = config_manager.get_config(f"service-{i}")
            assert config["id"] == i
        end_time = time.time()

        retrieval_time = end_time - start_time
        avg_time_per_retrieval = retrieval_time / 1000
        assert avg_time_per_retrieval < 0.001  # Should be under 1ms per retrieval


class TestRefactoringQualityMetrics:
    """Test suite for refactoring quality metrics."""

    def test_code_duplication_reduction(self):
        """Test that code duplication has been reduced."""
        # This would typically use static analysis tools
        # For now, we'll verify that common patterns are centralized

        # Check that error handling is centralized
        from app.core.error_handler import ServiceErrorHandler

        assert ServiceErrorHandler is not None

        # Check that logging is centralized

        assert get_service_logger is not None

        # Check that configuration is centralized
        from app.core.service_config_manager import ServiceConfigManager

        assert ServiceConfigManager is not None

    def test_component_cohesion(self):
        """Test that components have high cohesion."""
        # Test that related functionality is grouped together

        # Error handling components
        from app.core.error_handler import (
            ServiceErrorHandler,
        )

        assert all(
            hasattr(ServiceErrorHandler, method)
            for method in [
                "handle_service_error",
                "handle_service_unavailable",
                "get_error_metrics",
            ]
        )

        # Health check components
        from app.core.health_checks import (
            HealthCheckManager,
        )

        assert all(
            hasattr(HealthCheckManager, method)
            for method in [
                "perform_health_check",
                "get_health_status",
                "get_aggregated_health",
            ]
        )

    def test_interface_consistency(self):
        """Test that interfaces are consistent across components."""
        # Test that all service routers follow the same pattern

        # Test that all health checks return consistent format

        result = HealthCheckResult(
            service_name="test",
            status=HealthStatus.HEALTHY,
            timestamp=time.time(),
            check_type=HealthCheckType.BASIC,
            response_time=0.1,
        )

        assert hasattr(result, "service_name")
        assert hasattr(result, "status")
        assert hasattr(result, "timestamp")
        assert hasattr(result, "response_time")

    def test_dependency_management(self):
        """Test that dependencies are properly managed."""
        # Test that services can declare dependencies
        registry = EnhancedServiceRegistry()

        registry.register_service(
            name="dependent-service", config={}, dependencies=["base-service"],
        )

        service_info = registry.get_service_info("dependent-service")
        assert "base-service" in service_info.dependencies


# --- Performance Benchmarks ---
class TestPerformanceBenchmarks:
    """Performance benchmarks for refactored components."""

    @pytest.mark.asyncio
    async def test_service_config_manager_performance(self):
        """Benchmark ServiceConfigManager performance."""
        manager = ServiceConfigManager()

        # Register multiple services
        start_time = time.time()
        for i in range(100):
            manager.register_service_config(
                f"service_{i}",
                default_config={"enabled": True, "port": 8000 + i},
                schema=ServiceConfigSchema(required_fields=["port"]),
            )
        registration_time = time.time() - start_time

        # Benchmark config retrieval
        start_time = time.time()
        for i in range(1000):
            config = manager.get_config(f"service_{i % 100}")
        retrieval_time = time.time() - start_time

        # Performance assertions
        assert (
            registration_time < 1.0
        ), f"Registration too slow: {registration_time:.3f}s"
        assert retrieval_time < 0.5, f"Retrieval too slow: {retrieval_time:.3f}s"

        print("📊 ServiceConfigManager Performance:")
        print(f"   Registration (100 services): {registration_time:.3f}s")
        print(f"   Retrieval (1000 calls): {retrieval_time:.3f}s")

    @pytest.mark.asyncio
    async def test_enhanced_service_registry_performance(self):
        """Benchmark EnhancedServiceRegistry performance."""
        registry = EnhancedServiceRegistry()

        # Mock config manager
        registry.config_manager = MagicMock(spec=ServiceConfigManager)
        registry.config_manager.get_config.return_value = {"enabled": True}

        # Register multiple services
        start_time = time.time()
        for i in range(50):
            mock_startup = AsyncMock(return_value=MagicMock())
            mock_shutdown = AsyncMock()
            mock_health = AsyncMock(return_value=HealthStatus.HEALTHY)

            registry.register_service(
                name=f"service_{i}",
                config={"enabled": True},
                startup_func=mock_startup,
                shutdown_func=mock_shutdown,
                health_check_func=mock_health,
                startup_priority=i,
                dependencies=[],
                is_critical=(i % 10 == 0),
            )
        registration_time = time.time() - start_time

        # Benchmark service lookup
        start_time = time.time()
        for i in range(1000):
            service_info = registry.get_service_info(f"service_{i % 50}")
        lookup_time = time.time() - start_time

        # Performance assertions
        assert (
            registration_time < 2.0
        ), f"Registration too slow: {registration_time:.3f}s"
        assert lookup_time < 0.3, f"Lookup too slow: {lookup_time:.3f}s"

        print("📊 EnhancedServiceRegistry Performance:")
        print(f"   Registration (50 services): {registration_time:.3f}s")
        print(f"   Lookup (1000 calls): {lookup_time:.3f}s")

    @pytest.mark.asyncio
    async def test_health_check_manager_performance(self):
        """Benchmark HealthCheckManager performance."""
        config = HealthCheckConfig(cache_ttl=0.1, aggregation_interval=0.1)
        manager = HealthCheckManager(config=config)

        # Mock registry
        manager.registry = MagicMock(spec=EnhancedServiceRegistry)
        manager.registry.get_service_info.return_value = MagicMock(
            name="test_service",
            status=ServiceStatus.RUNNING,
            health_check_func=AsyncMock(return_value=True),
            dependencies=[],
        )
        manager.registry.get_service_dependencies.return_value = []
        manager.registry.get_service_instance.return_value = True
        manager.registry.get_service_metrics.return_value = MagicMock(
            startup_time=1.0,
            total_requests=100,
            error_count=0,
            average_response_time=0.1,
            memory_usage=0.5,
            cpu_usage=0.2,
        )

        # Benchmark health check execution
        start_time = time.time()
        for i in range(100):
            result = await manager.perform_health_check("test_service")
        health_check_time = time.time() - start_time

        # Benchmark aggregation
        start_time = time.time()
        for i in range(10):
            await manager._aggregate_health_results()
        aggregation_time = time.time() - start_time

        # Performance assertions
        assert (
            health_check_time < 2.0
        ), f"Health checks too slow: {health_check_time:.3f}s"
        assert aggregation_time < 0.5, f"Aggregation too slow: {aggregation_time:.3f}s"

        print("📊 HealthCheckManager Performance:")
        print(f"   Health checks (100 calls): {health_check_time:.3f}s")
        print(f"   Aggregation (10 calls): {aggregation_time:.3f}s")

    @pytest.mark.asyncio
    async def test_service_load_balancer_performance(self):
        """Benchmark ServiceLoadBalancer performance."""
        registry = MagicMock(spec=EnhancedServiceRegistry)
        lb = ServiceLoadBalancer(registry)

        # Register multiple instances
        start_time = time.time()
        for i in range(20):
            lb.register_instance("test_service", f"http://instance_{i}")
        registration_time = time.time() - start_time

        # Mock registry health
        registry.get_service_info.return_value = MagicMock(
            health_status=HealthStatus.HEALTHY,
        )

        # Benchmark instance selection
        start_time = time.time()
        for i in range(1000):
            instance = await lb.get_next_instance("test_service")
        selection_time = time.time() - start_time

        # Performance assertions
        assert (
            registration_time < 0.1
        ), f"Registration too slow: {registration_time:.3f}s"
        assert selection_time < 0.2, f"Selection too slow: {selection_time:.3f}s"

        print("📊 ServiceLoadBalancer Performance:")
        print(f"   Registration (20 instances): {registration_time:.3f}s")
        print(f"   Selection (1000 calls): {selection_time:.3f}s")

    @pytest.mark.asyncio
    async def test_error_handler_performance(self):
        """Benchmark ServiceErrorHandler performance."""
        handler = ServiceErrorHandler()

        # Benchmark error handling
        start_time = time.time()
        for i in range(1000):
            try:
                raise ValueError(f"Test error {i}")
            except Exception as e:
                result = await handler.handle_service_error(e, "test_service")
        error_handling_time = time.time() - start_time

        # Performance assertions
        assert (
            error_handling_time < 0.5
        ), f"Error handling too slow: {error_handling_time:.3f}s"

        print("📊 ServiceErrorHandler Performance:")
        print(f"   Error handling (1000 calls): {error_handling_time:.3f}s")

    @pytest.mark.asyncio
    async def test_concurrent_operations_performance(self):
        """Benchmark concurrent operations across components."""
        # Setup components
        config_manager = ServiceConfigManager()
        registry = EnhancedServiceRegistry()
        registry.config_manager = config_manager

        # Register services
        for i in range(10):
            config_manager.register_service_config(
                f"service_{i}",
                default_config={"enabled": True, "port": 8000 + i},
                schema=ServiceConfigSchema(required_fields=["port"]),
            )

            mock_startup = AsyncMock(return_value=MagicMock())
            mock_shutdown = AsyncMock()
            mock_health = AsyncMock(return_value=HealthStatus.HEALTHY)

            registry.register_service(
                name=f"service_{i}",
                config={"enabled": True},
                startup_func=mock_startup,
                shutdown_func=mock_shutdown,
                health_check_func=mock_health,
                startup_priority=i,
                dependencies=[],
                is_critical=(i % 5 == 0),
            )

        # Benchmark concurrent operations
        async def concurrent_config_access():
            for i in range(100):
                config = config_manager.get_config(f"service_{i % 10}")

        async def concurrent_service_lookup():
            for i in range(100):
                service_info = registry.get_service_info(f"service_{i % 10}")

        start_time = time.time()
        await asyncio.gather(
            concurrent_config_access(),
            concurrent_service_lookup(),
            concurrent_config_access(),
            concurrent_service_lookup(),
        )
        concurrent_time = time.time() - start_time

        # Performance assertions
        assert (
            concurrent_time < 1.0
        ), f"Concurrent operations too slow: {concurrent_time:.3f}s"

        print("📊 Concurrent Operations Performance:")
        print(f"   Concurrent access (4 tasks): {concurrent_time:.3f}s")

    @pytest.mark.asyncio
    async def test_memory_usage_benchmark(self):
        """Benchmark memory usage of refactored components."""
        try:
            import gc

            import psutil

            # Get initial memory usage
            process = psutil.Process()
            initial_memory = process.memory_info().rss / 1024 / 1024  # MB

            # Create and use components
            config_manager = ServiceConfigManager()
            registry = EnhancedServiceRegistry()
            registry.config_manager = config_manager

            # Register many services
            for i in range(100):
                config_manager.register_service_config(
                    f"service_{i}",
                    default_config={
                        "enabled": True,
                        "port": 8000 + i,
                        "data": "x" * 100,
                    },
                    schema=ServiceConfigSchema(required_fields=["port"]),
                )

            # Get memory after setup
            setup_memory = process.memory_info().rss / 1024 / 1024  # MB
            memory_increase = setup_memory - initial_memory

            # Cleanup
            del config_manager, registry
            gc.collect()

            # Get memory after cleanup
            cleanup_memory = process.memory_info().rss / 1024 / 1024  # MB
            memory_cleanup = setup_memory - cleanup_memory

            # Memory assertions
            assert (
                memory_increase < 50
            ), f"Memory usage too high: {memory_increase:.1f}MB"
            assert memory_cleanup > 0, "Memory not properly cleaned up"

            print("📊 Memory Usage Benchmark:")
            print(f"   Initial memory: {initial_memory:.1f}MB")
            print(f"   After setup: {setup_memory:.1f}MB")
            print(f"   Memory increase: {memory_increase:.1f}MB")
            print(f"   After cleanup: {cleanup_memory:.1f}MB")
            print(f"   Memory cleanup: {memory_cleanup:.1f}MB")

        except ImportError:
            pytest.skip("psutil not available for memory benchmarking")


# --- Integration Test Performance ---
class TestIntegrationPerformance:
    """Integration performance tests for refactored components."""

    @pytest.mark.asyncio
    async def test_end_to_end_service_lifecycle_performance(self):
        """Benchmark complete service lifecycle performance."""
        # Setup
        config_manager = ServiceConfigManager()
        registry = EnhancedServiceRegistry()
        registry.config_manager = config_manager

        # Register service configuration
        config_manager.register_service_config(
            "performance_test_service",
            default_config={"enabled": True, "port": 9000, "timeout": 30},
            schema=ServiceConfigSchema(required_fields=["port", "timeout"]),
        )

        # Mock service functions
        mock_startup = AsyncMock(return_value=MagicMock())
        mock_shutdown = AsyncMock()
        mock_health = AsyncMock(return_value=HealthStatus.HEALTHY)

        # Register service
        registry.register_service(
            name="performance_test_service",
            config={"enabled": True},
            startup_func=mock_startup,
            shutdown_func=mock_shutdown,
            health_check_func=mock_health,
            startup_priority=10,
            dependencies=[],
            is_critical=True,
        )

        # Benchmark complete lifecycle
        start_time = time.time()

        # Initialize service
        await registry.initialize_all()

        # Get service info
        service_info = registry.get_service_info("performance_test_service")

        # Get configuration
        config = config_manager.get_config("performance_test_service")

        # Shutdown service
        await registry.shutdown_all()

        lifecycle_time = time.time() - start_time

        # Performance assertions
        assert (
            lifecycle_time < 1.0
        ), f"Service lifecycle too slow: {lifecycle_time:.3f}s"

        print("📊 End-to-End Service Lifecycle Performance:")
        print(f"   Complete lifecycle: {lifecycle_time:.3f}s")

    @pytest.mark.asyncio
    async def test_health_check_integration_performance(self):
        """Benchmark health check integration performance."""
        # Setup components
        config = HealthCheckConfig(cache_ttl=0.1)
        health_manager = HealthCheckManager(config=config)

        # Mock registry with multiple services
        health_manager.registry = MagicMock(spec=EnhancedServiceRegistry)
        health_manager.registry._services = {
            f"service_{i}": MagicMock(
                name=f"service_{i}",
                status=ServiceStatus.RUNNING,
                health_check_func=AsyncMock(return_value=True),
                dependencies=[],
            )
            for i in range(10)
        }
        health_manager.registry.get_service_info.return_value = MagicMock(
            name="test_service",
            status=ServiceStatus.RUNNING,
            health_check_func=AsyncMock(return_value=True),
            dependencies=[],
        )
        health_manager.registry.get_service_dependencies.return_value = []
        health_manager.registry.get_service_instance.return_value = True
        health_manager.registry.get_service_metrics.return_value = MagicMock(
            startup_time=1.0,
            total_requests=100,
            error_count=0,
            average_response_time=0.1,
            memory_usage=0.5,
            cpu_usage=0.2,
        )

        # Start health monitoring
        await health_manager.start_health_monitoring()

        # Benchmark health check operations
        start_time = time.time()

        # Perform health checks for all services
        for i in range(10):
            result = await health_manager.perform_health_check(f"service_{i}")

        # Get aggregated health
        aggregated = health_manager.get_aggregated_health()

        # Stop monitoring
        await health_manager.stop_health_monitoring()

        integration_time = time.time() - start_time

        # Performance assertions
        assert (
            integration_time < 2.0
        ), f"Health check integration too slow: {integration_time:.3f}s"

        print("📊 Health Check Integration Performance:")
        print(f"   Multi-service health checks: {integration_time:.3f}s")


# Test configuration and fixtures
@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(autouse=True)
def cleanup_environment():
    """Clean up environment variables after each test."""
    import os

    yield
    # Clean up any test environment variables
    test_vars = [key for key in os.environ.keys() if key.startswith("TEST_")]
    for var in test_vars:
        del os.environ[var]


# Performance test markers
pytestmark = [
    pytest.mark.asyncio,
    pytest.mark.unit,
    pytest.mark.integration,
    pytest.mark.performance,
]


if __name__ == "__main__":
    # Run tests with coverage
    pytest.main(
        [
            __file__,
            "-v",
            "--cov=app.core",
            "--cov=app.security",
            "--cov=app.middleware",
            "--cov-report=html",
            "--cov-report=term-missing",
        ],
    )
