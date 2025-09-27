"""
Database Integration Tests

🦦 *splashes with testing enthusiasm* Comprehensive tests to verify that all
testing framework integrations properly store their results in the reynard_e2e database.

This test suite validates:
- Vitest database integration
- Pytest database integration  
- Playwright E2E database integration
- Tracing database integration
- Performance metrics database integration
- Coverage data database integration
- Benchmark results database integration

Author: Quality-Otter-15 (Reynard Otter Specialist)
Version: 1.0.0
"""

import asyncio
import pytest
import os
import sys
import uuid
import json
import requests
from datetime import datetime, UTC
from typing import Dict, Any, List
from unittest.mock import Mock, patch, AsyncMock

import pytest
import pytest_asyncio

# Add the backend directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app.services.testing.testing_ecosystem_service import EcosystemService
from app.core.database_manager import get_e2e_session
from app.models.testing_ecosystem import (
    Run, Result, BenchmarkResult, PerformanceMetric,
    TraceData, CoverageData, Artifact, Report
)


@pytest_asyncio.fixture
async def vitest_test_run():
    """Create a test run for Vitest tests."""
    with get_e2e_session() as session:
        service = EcosystemService(session)
        test_run = await service.create_test_run(
            run_id=f"vitest_test_{uuid.uuid4().hex[:8]}",
            test_type="vitest",
            test_suite="vitest_integration_test",
            environment="test",
            branch="main",
            commit_hash="test-commit",
            total_tests=3,
            passed_tests=0,
            failed_tests=0,
            skipped_tests=0,
            meta_data={"test": "vitest_integration"}
        )
        yield test_run
        # Cleanup
        await service.update_test_run_status(test_run.id, "completed")


@pytest_asyncio.fixture
async def pytest_test_run():
    """Create a test run for Pytest tests."""
    with get_e2e_session() as session:
        service = EcosystemService(session)
        test_run = await service.create_test_run(
            run_id=f"pytest_test_{uuid.uuid4().hex[:8]}",
            test_type="pytest",
            test_suite="pytest_integration_test",
            environment="test",
            branch="main",
            commit_hash="test-commit",
            total_tests=5,
            passed_tests=0,
            failed_tests=0,
            skipped_tests=0,
            meta_data={"test": "pytest_integration"}
        )
        yield test_run
        # Cleanup
        await service.update_test_run_status(test_run.id, "completed")


@pytest_asyncio.fixture
async def playwright_test_run():
    """Create a test run for Playwright tests."""
    with get_e2e_session() as session:
        service = EcosystemService(session)
        test_run = await service.create_test_run(
            run_id=f"playwright_test_{uuid.uuid4().hex[:8]}",
            test_type="e2e",
            test_suite="playwright_integration_test",
            environment="test",
            branch="main",
            commit_hash="test-commit",
            total_tests=4,
            passed_tests=0,
            failed_tests=0,
            skipped_tests=0,
            meta_data={"test": "playwright_integration"}
        )
        yield test_run
        # Cleanup
        await service.update_test_run_status(test_run.id, "completed")


@pytest_asyncio.fixture
async def tracing_test_run():
    """Create a test run for tracing tests."""
    with get_e2e_session() as session:
        service = EcosystemService(session)
        test_run = await service.create_test_run(
            run_id=f"tracing_test_{uuid.uuid4().hex[:8]}",
            test_type="tracing",
            test_suite="tracing_integration_test",
            environment="test",
            branch="main",
            commit_hash="test-commit",
            total_tests=2,
            passed_tests=0,
            failed_tests=0,
            skipped_tests=0,
            meta_data={"test": "tracing_integration"}
        )
        yield test_run
        # Cleanup
        await service.update_test_run_status(test_run.id, "completed")


@pytest_asyncio.fixture
async def performance_test_run():
    """Create a test run for performance tests."""
    with get_e2e_session() as session:
        service = EcosystemService(session)
        test_run = await service.create_test_run(
            run_id=f"performance_test_{uuid.uuid4().hex[:8]}",
            test_type="performance",
            test_suite="performance_integration_test",
            environment="test",
            branch="main",
            commit_hash="test-commit",
            total_tests=1,
            passed_tests=0,
            failed_tests=0,
            skipped_tests=0,
            meta_data={"test": "performance_integration"}
        )
        yield test_run
        # Cleanup
        await service.update_test_run_status(test_run.id, "completed")


@pytest_asyncio.fixture
async def coverage_test_run():
    """Create a test run for coverage tests."""
    with get_e2e_session() as session:
        service = EcosystemService(session)
        test_run = await service.create_test_run(
            run_id=f"coverage_test_{uuid.uuid4().hex[:8]}",
            test_type="coverage",
            test_suite="coverage_integration_test",
            environment="test",
            branch="main",
            commit_hash="test-commit",
            total_tests=1,
            passed_tests=0,
            failed_tests=0,
            skipped_tests=0,
            meta_data={"test": "coverage_integration"}
        )
        yield test_run
        # Cleanup
        await service.update_test_run_status(test_run.id, "completed")


@pytest_asyncio.fixture
async def benchmark_test_run():
    """Create a test run for benchmark tests."""
    with get_e2e_session() as session:
        service = EcosystemService(session)
        test_run = await service.create_test_run(
            run_id=f"benchmark_test_{uuid.uuid4().hex[:8]}",
            test_type="benchmark",
            test_suite="benchmark_integration_test",
            environment="test",
            branch="main",
            commit_hash="test-commit",
            total_tests=1,
            passed_tests=0,
            failed_tests=0,
            skipped_tests=0,
            meta_data={"test": "benchmark_integration"}
        )
        yield test_run
        # Cleanup
        await service.update_test_run_status(test_run.id, "completed")


class TestVitestDatabaseIntegration:
    """Test Vitest database integration."""
    
    @pytest.mark.asyncio
    async def test_vitest_test_run_creation(self, vitest_test_run):
        """Test that Vitest test runs are created properly."""
        assert vitest_test_run is not None
        assert vitest_test_run.test_type == "vitest"
        assert vitest_test_run.test_suite == "vitest_integration_test"
        assert vitest_test_run.status == "running"
        assert vitest_test_run.total_tests == 3
    
    @pytest.mark.asyncio
    async def test_vitest_individual_test_results(self, vitest_test_run):
        """Test that individual Vitest test results are stored."""
        with get_e2e_session() as session:
            service = EcosystemService(session)
            
            # Simulate Vitest test results
            test_cases = [
                {
                    "test_name": "should render component correctly",
                    "test_file": "src/components/Button.test.tsx",
                    "test_class": "Button",
                    "test_method": "should render component correctly",
                    "status": "passed",
                    "duration_ms": 45.2,
                    "stdout": "Component rendered successfully",
                    "stderr": "",
                    "meta_data": {"test_type": "unit", "framework": "vitest"}
                },
                {
                    "test_name": "should handle click events",
                    "test_file": "src/components/Button.test.tsx", 
                    "test_class": "Button",
                    "test_method": "should handle click events",
                    "status": "passed",
                    "duration_ms": 32.1,
                    "stdout": "Click event handled",
                    "stderr": "",
                    "meta_data": {"test_type": "unit", "framework": "vitest"}
                },
                {
                    "test_name": "should handle error cases",
                    "test_file": "src/components/Button.test.tsx",
                    "test_class": "Button", 
                    "test_method": "should handle error cases",
                    "status": "failed",
                    "duration_ms": 15.8,
                    "stdout": "",
                    "stderr": "AssertionError: Expected error to be handled",
                    "meta_data": {"test_type": "unit", "framework": "vitest"}
                }
            ]
            
            # Add test results
            for test_case in test_cases:
                await service.add_test_result(
                    test_run_id=vitest_test_run.id,
                    **test_case
                )
            
            # Verify results were stored
            test_results = await service.get_test_results(vitest_test_run.id)
            assert len(test_results) == 3
            
            # Check individual test results
            passed_tests = [r for r in test_results if r.status == "passed"]
            failed_tests = [r for r in test_results if r.status == "failed"]
            
            assert len(passed_tests) == 2
            assert len(failed_tests) == 1
            
            # Verify test metadata
            for result in test_results:
                assert result.meta_data["framework"] == "vitest"
                assert result.meta_data["test_type"] == "unit"
    
    @pytest.mark.asyncio
    async def test_vitest_coverage_data(self, vitest_test_run):
        """Test that Vitest coverage data is stored."""
        with get_e2e_session() as session:
            service = EcosystemService(session)
            
            # Simulate Vitest coverage data
            coverage_data = {
                "lines": {"total": 100, "covered": 85, "percentage": 85.0},
                "functions": {"total": 20, "covered": 18, "percentage": 90.0},
                "branches": {"total": 30, "covered": 25, "percentage": 83.3},
                "statements": {"total": 95, "covered": 80, "percentage": 84.2}
            }
            
            await service.add_coverage_data(
                test_run_id=vitest_test_run.id,
                file_path="coverage/lcov.info",
                lines_total=100,
                lines_covered=85,
                lines_missing=15,
                coverage_percent=85.0,
                file_type="vitest",
                branches_total=30,
                branches_covered=25,
                coverage_data=coverage_data
            )
            
            # Verify coverage was stored
            coverage_results = await service.get_coverage_data(vitest_test_run.id)
            assert len(coverage_results) == 1
            
            coverage = coverage_results[0]
            assert coverage.file_type == "vitest"
            assert coverage.file_path == "coverage/lcov.info"
            assert coverage.coverage_data["lines"]["percentage"] == 85.0


class TestPytestDatabaseIntegration:
    """Test Pytest database integration."""
    
    @pytest.mark.asyncio
    async def test_pytest_test_run_creation(self, pytest_test_run):
        """Test that Pytest test runs are created properly."""
        assert pytest_test_run is not None
        assert pytest_test_run.test_type == "pytest"
        assert pytest_test_run.test_suite == "pytest_integration_test"
        assert pytest_test_run.status == "running"
        assert pytest_test_run.total_tests == 5
    
    @pytest.mark.asyncio
    async def test_pytest_individual_test_results(self, pytest_test_run):
        """Test that individual Pytest test results are stored."""
        with get_e2e_session() as session:
            service = EcosystemService(session)
            
            # Simulate Pytest test results
            test_cases = [
                {
                    "test_name": "test_user_creation",
                    "test_file": "tests/test_user_service.py",
                    "test_class": "TestUserService",
                    "test_method": "test_user_creation",
                    "status": "passed",
                    "duration_ms": 120.5,
                    "stdout": "User created successfully",
                    "stderr": "",
                    "meta_data": {"test_type": "unit", "framework": "pytest"}
                },
                {
                    "test_name": "test_user_validation",
                    "test_file": "tests/test_user_service.py",
                    "test_class": "TestUserService", 
                    "test_method": "test_user_validation",
                    "status": "passed",
                    "duration_ms": 89.3,
                    "stdout": "Validation passed",
                    "stderr": "",
                    "meta_data": {"test_type": "unit", "framework": "pytest"}
                },
                {
                    "test_name": "test_database_connection",
                    "test_file": "tests/test_database.py",
                    "test_class": "TestDatabase",
                    "test_method": "test_database_connection",
                    "status": "failed",
                    "duration_ms": 250.1,
                    "stdout": "",
                    "stderr": "ConnectionError: Database connection failed",
                    "meta_data": {"test_type": "integration", "framework": "pytest"}
                },
                {
                    "test_name": "test_api_endpoint",
                    "test_file": "tests/test_api.py",
                    "test_class": "TestAPI",
                    "test_method": "test_api_endpoint",
                    "status": "passed",
                    "duration_ms": 156.7,
                    "stdout": "API endpoint working",
                    "stderr": "",
                    "meta_data": {"test_type": "integration", "framework": "pytest"}
                },
                {
                    "test_name": "test_skipped_feature",
                    "test_file": "tests/test_features.py",
                    "test_class": "TestFeatures",
                    "test_method": "test_skipped_feature",
                    "status": "skipped",
                    "duration_ms": 0.0,
                    "stdout": "Feature not implemented yet",
                    "stderr": "",
                    "meta_data": {"test_type": "unit", "framework": "pytest", "skip_reason": "not_implemented"}
                }
            ]
            
            # Add test results
            for test_case in test_cases:
                await service.add_test_result(
                    test_run_id=pytest_test_run.id,
                    **test_case
                )
            
            # Verify results were stored
            test_results = await service.get_test_results(pytest_test_run.id)
            assert len(test_results) == 5
            
            # Check test result distribution
            passed_tests = [r for r in test_results if r.status == "passed"]
            failed_tests = [r for r in test_results if r.status == "failed"]
            skipped_tests = [r for r in test_results if r.status == "skipped"]
            
            assert len(passed_tests) == 3
            assert len(failed_tests) == 1
            assert len(skipped_tests) == 1
            
            # Verify test metadata
            for result in test_results:
                assert result.meta_data["framework"] == "pytest"


class TestPlaywrightDatabaseIntegration:
    """Test Playwright E2E database integration."""
    
    @pytest.mark.asyncio
    async def test_playwright_test_run_creation(self, playwright_test_run):
        """Test that Playwright test runs are created properly."""
        assert playwright_test_run is not None
        assert playwright_test_run.test_type == "e2e"
        assert playwright_test_run.test_suite == "playwright_integration_test"
        assert playwright_test_run.status == "running"
        assert playwright_test_run.total_tests == 4
    
    @pytest.mark.asyncio
    async def test_playwright_individual_test_results(self, playwright_test_run):
        """Test that individual Playwright test results are stored."""
        with get_e2e_session() as session:
            service = EcosystemService(session)
            
            # Simulate Playwright test results
            test_cases = [
                {
                    "test_name": "should load homepage",
                    "test_file": "tests/e2e/homepage.spec.ts",
                    "test_class": "HomepageTests",
                    "test_method": "should load homepage",
                    "status": "passed",
                    "duration_ms": 1200.5,
                    "stdout": "Homepage loaded successfully",
                    "stderr": "",
                    "meta_data": {"test_type": "e2e", "framework": "playwright", "browser": "chromium"}
                },
                {
                    "test_name": "should handle user login",
                    "test_file": "tests/e2e/auth.spec.ts",
                    "test_class": "AuthTests",
                    "test_method": "should handle user login",
                    "status": "passed",
                    "duration_ms": 2100.3,
                    "stdout": "Login successful",
                    "stderr": "",
                    "meta_data": {"test_type": "e2e", "framework": "playwright", "browser": "chromium"}
                },
                {
                    "test_name": "should handle form submission",
                    "test_file": "tests/e2e/forms.spec.ts",
                    "test_class": "FormTests",
                    "test_method": "should handle form submission",
                    "status": "failed",
                    "duration_ms": 1800.7,
                    "stdout": "",
                    "stderr": "TimeoutError: Element not found",
                    "meta_data": {"test_type": "e2e", "framework": "playwright", "browser": "chromium"}
                },
                {
                    "test_name": "should handle navigation",
                    "test_file": "tests/e2e/navigation.spec.ts",
                    "test_class": "NavigationTests",
                    "test_method": "should handle navigation",
                    "status": "passed",
                    "duration_ms": 950.2,
                    "stdout": "Navigation working",
                    "stderr": "",
                    "meta_data": {"test_type": "e2e", "framework": "playwright", "browser": "chromium"}
                }
            ]
            
            # Add test results
            for test_case in test_cases:
                await service.add_test_result(
                    test_run_id=playwright_test_run.id,
                    **test_case
                )
            
            # Verify results were stored
            test_results = await service.get_test_results(playwright_test_run.id)
            assert len(test_results) == 4
            
            # Check test result distribution
            passed_tests = [r for r in test_results if r.status == "passed"]
            failed_tests = [r for r in test_results if r.status == "failed"]
            
            assert len(passed_tests) == 3
            assert len(failed_tests) == 1
            
            # Verify test metadata
            for result in test_results:
                assert result.meta_data["framework"] == "playwright"
                assert result.meta_data["browser"] == "chromium"
    
    @pytest.mark.asyncio
    async def test_playwright_trace_data(self, playwright_test_run):
        """Test that Playwright trace data is stored."""
        with get_e2e_session() as session:
            service = EcosystemService(session)
            
            # Simulate Playwright trace data
            trace_data = {
                "trace_id": f"trace_{uuid.uuid4().hex[:8]}",
                "trace_type": "playwright",
                "trace_data": {
                    "actions": [
                        {"type": "navigate", "url": "https://example.com", "timestamp": "2025-01-15T10:00:00Z"},
                        {"type": "click", "selector": "#login-button", "timestamp": "2025-01-15T10:00:05Z"},
                        {"type": "fill", "selector": "#username", "value": "testuser", "timestamp": "2025-01-15T10:00:10Z"},
                        {"type": "fill", "selector": "#password", "value": "password", "timestamp": "2025-01-15T10:00:15Z"},
                        {"type": "click", "selector": "#submit", "timestamp": "2025-01-15T10:00:20Z"}
                    ],
                    "screenshots": ["screenshot1.png", "screenshot2.png"],
                    "network_requests": [
                        {"url": "https://api.example.com/login", "method": "POST", "status": 200},
                        {"url": "https://api.example.com/user", "method": "GET", "status": 200}
                    ]
                },
                "duration_ms": 2500.0,
                "meta_data": {"browser": "chromium", "viewport": "1920x1080"}
            }
            
            await service.add_trace_data(
                test_run_id=playwright_test_run.id,
                trace_id=trace_data["trace_id"],
                trace_type=trace_data["trace_type"],
                trace_name="playwright_user_flow",
                trace_data=trace_data["trace_data"],
                duration_ms=trace_data["duration_ms"],
                meta_data=trace_data["meta_data"]
            )
            
            # Verify trace was stored
            trace_results = await service.get_trace_data(playwright_test_run.id)
            assert len(trace_results) == 1
            
            trace = trace_results[0]
            assert trace.trace_type == "playwright"
            assert trace.duration_ms == 2500.0
            assert len(trace.trace_data["actions"]) == 5


class TestTracingDatabaseIntegration:
    """Test tracing database integration."""
    
    @pytest.mark.asyncio
    async def test_tracing_performance_traces(self, tracing_test_run):
        """Test that performance traces are stored."""
        with get_e2e_session() as session:
            service = EcosystemService(session)
            
            # Simulate performance trace data
            trace_data = {
                "trace_id": f"perf_trace_{uuid.uuid4().hex[:8]}",
                "trace_type": "performance",
                "trace_data": {
                    "cpu_usage": [10.5, 15.2, 12.8, 18.1, 14.3],
                    "memory_usage": [1024, 1156, 1089, 1234, 1198],
                    "network_requests": [
                        {"url": "/api/users", "duration": 150.5, "size": 2048},
                        {"url": "/api/posts", "duration": 89.2, "size": 1536}
                    ],
                    "database_queries": [
                        {"query": "SELECT * FROM users", "duration": 25.3, "rows": 100},
                        {"query": "INSERT INTO posts", "duration": 45.7, "rows": 1}
                    ]
                },
                "duration_ms": 5000.0,
                "meta_data": {"component": "user_service", "operation": "get_user_posts"}
            }
            
            await service.add_trace_data(
                test_run_id=tracing_test_run.id,
                trace_id=trace_data["trace_id"],
                trace_type=trace_data["trace_type"],
                trace_name="performance_monitoring",
                trace_data=trace_data["trace_data"],
                duration_ms=trace_data["duration_ms"],
                meta_data=trace_data["meta_data"]
            )
            
            # Verify trace was stored
            trace_results = await service.get_trace_data(tracing_test_run.id)
            assert len(trace_results) == 1
            
            trace = trace_results[0]
            assert trace.trace_type == "performance"
            assert trace.duration_ms == 5000.0
            assert len(trace.trace_data["cpu_usage"]) == 5
    
    @pytest.mark.asyncio
    async def test_tracing_network_traces(self, tracing_test_run):
        """Test that network traces are stored."""
        with get_e2e_session() as session:
            service = EcosystemService(session)
            
            # Simulate network trace data
            trace_data = {
                "trace_id": f"network_trace_{uuid.uuid4().hex[:8]}",
                "trace_type": "network",
                "trace_data": {
                    "requests": [
                        {
                            "method": "GET",
                            "url": "https://api.example.com/users",
                            "status": 200,
                            "duration": 120.5,
                            "size": 2048,
                            "headers": {"Content-Type": "application/json"}
                        },
                        {
                            "method": "POST",
                            "url": "https://api.example.com/posts",
                            "status": 201,
                            "duration": 89.3,
                            "size": 512,
                            "headers": {"Content-Type": "application/json"}
                        }
                    ],
                    "errors": [
                        {
                            "url": "https://api.example.com/invalid",
                            "error": "404 Not Found",
                            "timestamp": "2025-01-15T10:00:30Z"
                        }
                    ]
                },
                "duration_ms": 3000.0,
                "meta_data": {"service": "api_gateway", "version": "1.2.3"}
            }
            
            await service.add_trace_data(
                test_run_id=tracing_test_run.id,
                trace_id=trace_data["trace_id"],
                trace_type=trace_data["trace_type"],
                trace_name="network_monitoring",
                trace_data=trace_data["trace_data"],
                duration_ms=trace_data["duration_ms"],
                meta_data=trace_data["meta_data"]
            )
            
            # Verify trace was stored
            trace_results = await service.get_trace_data(tracing_test_run.id)
            assert len(trace_results) == 1  # Only the network trace (fixtures are isolated)
            
            network_traces = [t for t in trace_results if t.trace_type == "network"]
            assert len(network_traces) == 1
            
            trace = network_traces[0]
            assert trace.trace_type == "network"
            assert len(trace.trace_data["requests"]) == 2
            assert len(trace.trace_data["errors"]) == 1


class TestPerformanceMetricsDatabaseIntegration:
    """Test performance metrics database integration."""
    
    @pytest.mark.asyncio
    async def test_performance_metrics_storage(self, performance_test_run):
        """Test that performance metrics are stored."""
        with get_e2e_session() as session:
            service = EcosystemService(session)
            
            # Simulate performance metrics
            metrics = [
                {
                    "metric_name": "response_time",
                    "metric_value": 150.5,
                    "metric_unit": "ms",
                    "metric_type": "latency",
                    "meta_data": {"endpoint": "/api/users", "method": "GET"}
                },
                {
                    "metric_name": "throughput",
                    "metric_value": 1000.0,
                    "metric_unit": "requests/sec",
                    "metric_type": "throughput",
                    "meta_data": {"endpoint": "/api/users", "method": "GET"}
                },
                {
                    "metric_name": "cpu_usage",
                    "metric_value": 45.2,
                    "metric_unit": "percent",
                    "metric_type": "resource",
                    "meta_data": {"component": "api_server"}
                },
                {
                    "metric_name": "memory_usage",
                    "metric_value": 1024.0,
                    "metric_unit": "MB",
                    "metric_type": "resource",
                    "meta_data": {"component": "api_server"}
                }
            ]
            
            # Add performance metrics
            for metric in metrics:
                await service.add_performance_metric(
                    test_run_id=performance_test_run.id,
                    metric_name=metric["metric_name"],
                    metric_type=metric["metric_type"],
                    value=metric["metric_value"],
                    unit=metric["metric_unit"],
                    meta_data=metric["meta_data"]
                )
            
            # Verify metrics were stored
            performance_results = await service.get_performance_metrics(performance_test_run.id)
            assert len(performance_results) == 4
            
            # Check metric types
            latency_metrics = [m for m in performance_results if m.metric_type == "latency"]
            throughput_metrics = [m for m in performance_results if m.metric_type == "throughput"]
            resource_metrics = [m for m in performance_results if m.metric_type == "resource"]
            
            assert len(latency_metrics) == 1
            assert len(throughput_metrics) == 1
            assert len(resource_metrics) == 2
            
            # Verify specific metrics
            response_time = next(m for m in performance_results if m.metric_name == "response_time")
            assert response_time.value == 150.5
            assert response_time.unit == "ms"


class TestCoverageDataDatabaseIntegration:
    """Test coverage data database integration."""
    
    @pytest.mark.asyncio
    async def test_coverage_data_storage(self, coverage_test_run):
        """Test that coverage data is stored."""
        with get_e2e_session() as session:
            service = EcosystemService(session)
            
            # Simulate coverage data
            coverage_data = {
                "lines": {"total": 500, "covered": 425, "percentage": 85.0},
                "functions": {"total": 50, "covered": 45, "percentage": 90.0},
                "branches": {"total": 100, "covered": 80, "percentage": 80.0},
                "statements": {"total": 480, "covered": 408, "percentage": 85.0}
            }
            
            await service.add_coverage_data(
                test_run_id=coverage_test_run.id,
                file_path="coverage/lcov.info",
                lines_total=500,
                lines_covered=425,
                lines_missing=75,
                coverage_percent=85.0,
                file_type="jest",
                branches_total=100,
                branches_covered=80,
                coverage_data=coverage_data
            )
            
            # Verify coverage was stored
            coverage_results = await service.get_coverage_data(coverage_test_run.id)
            assert len(coverage_results) == 1
            
            coverage = coverage_results[0]
            assert coverage.file_type == "jest"
            assert coverage.file_path == "coverage/lcov.info"
            assert coverage.coverage_data["lines"]["percentage"] == 85.0
            assert coverage.coverage_data["functions"]["percentage"] == 90.0


class TestBenchmarkResultsDatabaseIntegration:
    """Test benchmark results database integration."""
    
    @pytest.mark.asyncio
    async def test_benchmark_results_storage(self, benchmark_test_run):
        """Test that benchmark results are stored."""
        with get_e2e_session() as session:
            service = EcosystemService(session)
            
            # Simulate benchmark results
            benchmark_data = {
                "benchmark_name": "api_response_time",
                "benchmark_type": "latency",
                "benchmark_value": 120.5,
                "benchmark_unit": "ms",
                "benchmark_config": {
                    "concurrent_users": 100,
                    "duration": 300,
                    "ramp_up": 60
                },
                "benchmark_results": {
                    "min": 95.2,
                    "max": 180.3,
                    "mean": 120.5,
                    "median": 118.7,
                    "p95": 155.8,
                    "p99": 170.2
                },
                "meta_data": {
                    "tool": "locust",
                    "endpoint": "/api/users",
                    "method": "GET"
                }
            }
            
            await service.add_benchmark_result(
                test_run_id=benchmark_test_run.id,
                benchmark_name=benchmark_data["benchmark_name"],
                benchmark_type=benchmark_data["benchmark_type"],
                total_requests=1000,
                successful_requests=950,
                failed_requests=50,
                endpoint="/api/users",
                method="GET",
                avg_response_time_ms=benchmark_data["benchmark_value"],
                median_response_time_ms=118.7,
                p95_response_time_ms=155.8,
                p99_response_time_ms=170.2,
                min_response_time_ms=95.2,
                max_response_time_ms=180.3,
                meta_data=benchmark_data["meta_data"]
            )
            
            # Verify benchmark was stored
            benchmark_results = await service.get_benchmark_results(benchmark_test_run.id)
            assert len(benchmark_results) == 1
            
            benchmark = benchmark_results[0]
            assert benchmark.benchmark_name == "api_response_time"
            assert benchmark.benchmark_type == "latency"
            assert benchmark.avg_response_time_ms == 120.5


class TestDatabaseIntegrationEndToEnd:
    """End-to-end tests for all database integrations."""
    
    @pytest.mark.asyncio
    async def test_all_integrations_work_together(self):
        """Test that all integrations work together in a comprehensive scenario."""
        with get_e2e_session() as session:
            service = EcosystemService(session)
            
            # Create a comprehensive test run
            test_run = await service.create_test_run(
                run_id=f"comprehensive_test_{uuid.uuid4().hex[:8]}",
                test_type="comprehensive",
                test_suite="all_integrations_test",
                environment="test",
                branch="main",
                commit_hash="test-commit",
                total_tests=3,
                passed_tests=0,
                failed_tests=0,
                skipped_tests=0,
                meta_data={"test": "comprehensive_integration"}
            )
            
            try:
                # Add test results from different frameworks
                await service.add_test_result(
                    test_run_id=test_run.id,
                    test_name="vitest_component_test",
                    test_file="src/components/Button.test.tsx",
                    test_class="Button",
                    test_method="should render",
                    status="passed",
                    duration_ms=45.2,
                    stdout="Component rendered",
                    stderr="",
                    meta_data={"framework": "vitest", "type": "unit"}
                )
                
                await service.add_test_result(
                    test_run_id=test_run.id,
                    test_name="pytest_service_test",
                    test_file="tests/test_user_service.py",
                    test_class="TestUserService",
                    test_method="test_create_user",
                    status="passed",
                    duration_ms=120.5,
                    stdout="User created",
                    stderr="",
                    meta_data={"framework": "pytest", "type": "unit"}
                )
                
                await service.add_test_result(
                    test_run_id=test_run.id,
                    test_name="playwright_e2e_test",
                    test_file="tests/e2e/login.spec.ts",
                    test_class="LoginTests",
                    test_method="should login user",
                    status="passed",
                    duration_ms=2100.3,
                    stdout="Login successful",
                    stderr="",
                    meta_data={"framework": "playwright", "type": "e2e"}
                )
                
                # Add performance metrics
                await service.add_performance_metric(
                    test_run_id=test_run.id,
                    metric_name="response_time",
                    metric_type="latency",
                    value=150.5,
                    unit="ms",
                    meta_data={"endpoint": "/api/users"}
                )
                
                # Add coverage data
                await service.add_coverage_data(
                    test_run_id=test_run.id,
                    file_path="coverage/lcov.info",
                    lines_total=100,
                    lines_covered=85,
                    lines_missing=15,
                    coverage_percent=85.0,
                    file_type="jest"
                )
                
                # Add benchmark results
                await service.add_benchmark_result(
                    test_run_id=test_run.id,
                    benchmark_name="api_benchmark",
                    benchmark_type="latency",
                    total_requests=100,
                    successful_requests=95,
                    failed_requests=5,
                    endpoint="/api/users",
                    method="GET",
                    avg_response_time_ms=120.5,
                    meta_data={"tool": "locust"}
                )
                
                # Add trace data
                await service.add_trace_data(
                    test_run_id=test_run.id,
                    trace_id=f"trace_{uuid.uuid4().hex[:8]}",
                    trace_type="performance",
                    trace_name="api_performance",
                    trace_data={"cpu_usage": [10.5, 15.2]},
                    duration_ms=1000.0,
                    meta_data={"component": "api"}
                )
                
                # Verify all data was stored
                test_results = await service.get_test_results(test_run.id)
                performance_metrics = await service.get_performance_metrics(test_run.id)
                coverage_data = await service.get_coverage_data(test_run.id)
                benchmark_results = await service.get_benchmark_results(test_run.id)
                trace_data = await service.get_trace_data(test_run.id)
                
                assert len(test_results) == 3
                assert len(performance_metrics) == 1
                assert len(coverage_data) == 1
                assert len(benchmark_results) == 1
                assert len(trace_data) == 1
                
                # Verify test run summary
                summary = await service.get_test_run_summary(test_run.id)
                assert summary["test_run"]["total_tests"] == 3
                assert summary["statistics"]["test_results_count"] == 3
                assert summary["statistics"]["status_counts"]["passed"] == 3
                
                print("✅ All database integrations working together successfully!")
                
            finally:
                # Cleanup
                await service.update_test_run_status(test_run.id, "completed")