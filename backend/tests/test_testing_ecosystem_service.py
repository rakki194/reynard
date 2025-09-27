"""Comprehensive pytest tests for the Testing Ecosystem Service

🦦 *splashes with testing enthusiasm* Thorough test coverage for all testing
ecosystem components including database access, service methods, and data integrity.

This test suite covers:
- Database connection and session management
- All service methods and edge cases
- Data validation and constraints
- Error handling and recovery
- Performance and scalability
- Integration with PostgreSQL

Author: Quality-Otter-15 (Reynard Otter Specialist)
Version: 1.0.0
"""

import asyncio
import os
import pytest
import uuid
from datetime import datetime, timezone, timedelta, UTC
from typing import Dict, Any, List
from unittest.mock import Mock, patch, MagicMock

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import SQLAlchemyError, IntegrityError

from app.services.testing.testing_ecosystem_service import EcosystemService
from app.models.testing_ecosystem import (
    Run, Result, BenchmarkResult, PerformanceMetric,
    TraceData, CoverageData, Artifact, Report
)
from app.core.database_manager import get_e2e_session


class TestEcosystemService:
    """Test suite for EcosystemService."""
    
    @pytest.fixture(autouse=True)
    def setup_method(self):
        """Setup for each test method."""
        # Load environment variables
        os.environ.setdefault("E2E_DATABASE_URL", "postgresql://postgres:password@localhost:5432/reynard_e2e")
        
        # Create test session
        with get_e2e_session() as session:
            self.session = session
            self.service = EcosystemService(session)
            yield
            # Cleanup after each test
            self._cleanup_test_data()
    
    def _cleanup_test_data(self):
        """Clean up test data after each test."""
        try:
            # Delete test runs and cascade to related data
            test_runs = self.session.query(Run).filter(
                Run.run_id.like("test_%")
            ).all()
            
            for test_run in test_runs:
                self.session.delete(test_run)
            
            self.session.commit()
        except Exception as e:
            self.session.rollback()
            print(f"Cleanup error: {e}")
    
    @pytest.mark.asyncio
    async def test_create_test_run_success(self):
        """Test successful test run creation."""
        run_id = f"test_run_{uuid.uuid4().hex[:8]}"
        
        test_run = await self.service.create_test_run(
            run_id=run_id,
            test_type="pytest",
            test_suite="unit_tests",
            environment="test",
            branch="main",
            commit_hash="abc123",
            total_tests=10,
            passed_tests=8,
            failed_tests=2,
            skipped_tests=0,
            meta_data={"test_framework": "pytest", "python_version": "3.9"}
        )
        
        assert test_run is not None
        assert test_run.run_id == run_id
        assert test_run.test_type == "pytest"
        assert test_run.test_suite == "unit_tests"
        assert test_run.environment == "test"
        assert test_run.branch == "main"
        assert test_run.commit_hash == "abc123"
        assert test_run.total_tests == 10
        assert test_run.passed_tests == 8
        assert test_run.failed_tests == 2
        assert test_run.skipped_tests == 0
        assert test_run.status == "running"
        assert test_run.started_at is not None
        assert test_run.meta_data["test_framework"] == "pytest"
    
    @pytest.mark.asyncio
    async def test_create_test_run_duplicate_run_id(self):
        """Test handling of duplicate run_id."""
        run_id = f"test_duplicate_{uuid.uuid4().hex[:8]}"
        
        # Create first test run
        await self.service.create_test_run(
            run_id=run_id,
            test_type="pytest",
            test_suite="unit_tests"
        )
        
        # Try to create second test run with same run_id
        with pytest.raises(IntegrityError):
            await self.service.create_test_run(
                run_id=run_id,
                test_type="pytest",
                test_suite="unit_tests"
            )
    
    @pytest.mark.asyncio
    async def test_update_test_run_status(self):
        """Test updating test run status."""
        run_id = f"test_status_{uuid.uuid4().hex[:8]}"
        
        # Create test run
        test_run = await self.service.create_test_run(
            run_id=run_id,
            test_type="pytest",
            test_suite="unit_tests"
        )
        
        # Update status to completed
        updated_run = await self.service.update_test_run_status(
            test_run_id=test_run.id,
            status="completed",
            total_tests=5,
            passed_tests=4,
            failed_tests=1
        )
        
        assert updated_run.status == "completed"
        assert updated_run.total_tests == 5
        assert updated_run.passed_tests == 4
        assert updated_run.failed_tests == 1
        assert updated_run.completed_at is not None
        assert updated_run.duration_seconds is not None
        assert updated_run.success_rate == 80.0  # 4/5 * 100
    
    @pytest.mark.asyncio
    async def test_get_test_run_by_id(self):
        """Test retrieving test run by ID."""
        run_id = f"test_get_{uuid.uuid4().hex[:8]}"
        
        # Create test run
        created_run = await self.service.create_test_run(
            run_id=run_id,
            test_type="pytest",
            test_suite="unit_tests"
        )
        
        # Retrieve test run
        retrieved_run = await self.service.get_test_run(created_run.id)
        
        assert retrieved_run is not None
        assert retrieved_run.id == created_run.id
        assert retrieved_run.run_id == run_id
    
    @pytest.mark.asyncio
    async def test_get_test_run_by_run_id(self):
        """Test retrieving test run by run_id."""
        run_id = f"test_get_run_id_{uuid.uuid4().hex[:8]}"
        
        # Create test run
        await self.service.create_test_run(
            run_id=run_id,
            test_type="pytest",
            test_suite="unit_tests"
        )
        
        # Retrieve test run
        retrieved_run = await self.service.get_test_run_by_run_id(run_id)
        
        assert retrieved_run is not None
        assert retrieved_run.run_id == run_id
    
    @pytest.mark.asyncio
    async def test_list_test_runs_with_filters(self):
        """Test listing test runs with various filters."""
        # Create multiple test runs with unique identifiers
        unique_suffix = uuid.uuid4().hex[:8]
        created_runs = []
        
        for i in range(3):
            run_id = f"test_list_{unique_suffix}_{i}"
            test_run = await self.service.create_test_run(
                run_id=run_id,
                test_type="pytest" if i < 2 else "e2e",
                test_suite="unit_tests",
                environment="test" if i < 2 else "staging"
            )
            created_runs.append(test_run)
        
        # Test filtering by test_type - get all pytest runs and verify our specific ones are included
        pytest_runs = await self.service.list_test_runs(test_type="pytest")
        our_pytest_runs = [run for run in pytest_runs if run.run_id.startswith(f"test_list_{unique_suffix}")]
        assert len(our_pytest_runs) == 2
        
        # Test filtering by environment - get all test environment runs and verify our specific ones are included
        test_env_runs = await self.service.list_test_runs(environment="test")
        our_test_env_runs = [run for run in test_env_runs if run.run_id.startswith(f"test_list_{unique_suffix}")]
        assert len(our_test_env_runs) == 2
        
        # Test filtering by status - get all running runs and verify our specific ones are included
        running_runs = await self.service.list_test_runs(status="running")
        our_running_runs = [run for run in running_runs if run.run_id.startswith(f"test_list_{unique_suffix}")]
        assert len(our_running_runs) == 3
    
    @pytest.mark.asyncio
    async def test_add_test_result(self):
        """Test adding test results."""
        run_id = f"test_result_{uuid.uuid4().hex[:8]}"
        
        # Create test run
        test_run = await self.service.create_test_run(
            run_id=run_id,
            test_type="pytest",
            test_suite="unit_tests"
        )
        
        # Add test result
        test_result = await self.service.add_test_result(
            test_run_id=test_run.id,
            test_name="test_example_function",
            status="passed",
            test_file="test_example.py",
            test_class="TestExample",
            test_method="test_function",
            duration_ms=150.5,
            stdout="Test output",
            meta_data={"assertions": 3}
        )
        
        assert test_result is not None
        assert test_result.test_name == "test_example_function"
        assert test_result.status == "passed"
        assert test_result.test_file == "test_example.py"
        assert test_result.duration_ms == 150.5
        assert test_result.meta_data["assertions"] == 3
    
    @pytest.mark.asyncio
    async def test_add_benchmark_result(self):
        """Test adding benchmark results."""
        run_id = f"test_benchmark_{uuid.uuid4().hex[:8]}"
        
        # Create test run
        test_run = await self.service.create_test_run(
            run_id=run_id,
            test_type="benchmark",
            test_suite="performance_tests"
        )
        
        # Add benchmark result
        benchmark = await self.service.add_benchmark_result(
            test_run_id=test_run.id,
            benchmark_name="api_load_test",
            benchmark_type="load_test",
            total_requests=1000,
            successful_requests=950,
            failed_requests=50,
            endpoint="/api/users",
            method="GET",
            avg_response_time_ms=120.5,
            p95_response_time_ms=250.0,
            requests_per_second=50.0,
            error_rate_percent=5.0,
            concurrent_users=10,
            duration_seconds=20.0,
            peak_memory_mb=512.0,
            peak_cpu_percent=75.0,
            status_codes={"200": 950, "500": 50},
            meta_data={"load_generator": "locust"}
        )
        
        assert benchmark is not None
        assert benchmark.benchmark_name == "api_load_test"
        assert benchmark.benchmark_type == "load_test"
        assert benchmark.total_requests == 1000
        assert benchmark.successful_requests == 950
        assert benchmark.avg_response_time_ms == 120.5
        assert benchmark.status_codes["200"] == 950
        assert benchmark.meta_data["load_generator"] == "locust"
    
    @pytest.mark.asyncio
    async def test_add_performance_metric(self):
        """Test adding performance metrics."""
        run_id = f"test_perf_{uuid.uuid4().hex[:8]}"
        
        # Create test run
        test_run = await self.service.create_test_run(
            run_id=run_id,
            test_type="performance",
            test_suite="memory_tests"
        )
        
        # Add performance metric
        metric = await self.service.add_performance_metric(
            test_run_id=test_run.id,
            metric_name="memory_usage",
            metric_type="memory",
            value=256.5,
            unit="mb",
            timestamp=datetime.now(UTC),
            meta_data={"process": "main"}
        )
        
        assert metric is not None
        assert metric.metric_name == "memory_usage"
        assert metric.metric_type == "memory"
        assert metric.value == 256.5
        assert metric.unit == "mb"
        assert metric.meta_data["process"] == "main"
    
    @pytest.mark.asyncio
    async def test_add_trace_data(self):
        """Test adding trace data."""
        run_id = f"test_trace_{uuid.uuid4().hex[:8]}"
        
        # Create test run
        test_run = await self.service.create_test_run(
            run_id=run_id,
            test_type="e2e",
            test_suite="playwright_tests"
        )
        
        # Add trace data
        trace = await self.service.add_trace_data(
            test_run_id=test_run.id,
            trace_id="trace_123",
            trace_type="playwright",
            trace_name="user_login_flow",
            trace_data={
                "steps": [
                    {"action": "click", "selector": "#login-btn"},
                    {"action": "fill", "selector": "#username", "value": "testuser"},
                    {"action": "click", "selector": "#submit"}
                ],
                "duration": 2500
            },
            duration_ms=2500.0,
            meta_data={"browser": "chromium"}
        )
        
        assert trace is not None
        assert trace.trace_id == "trace_123"
        assert trace.trace_type == "playwright"
        assert trace.trace_name == "user_login_flow"
        assert trace.trace_data["steps"][0]["action"] == "click"
        assert trace.duration_ms == 2500.0
        assert trace.meta_data["browser"] == "chromium"
    
    @pytest.mark.asyncio
    async def test_add_coverage_data(self):
        """Test adding coverage data."""
        run_id = f"test_coverage_{uuid.uuid4().hex[:8]}"
        
        # Create test run
        test_run = await self.service.create_test_run(
            run_id=run_id,
            test_type="coverage",
            test_suite="unit_tests"
        )
        
        # Add coverage data
        coverage = await self.service.add_coverage_data(
            test_run_id=test_run.id,
            file_path="app/services/user_service.py",
            lines_total=100,
            lines_covered=85,
            lines_missing=15,
            coverage_percent=85.0,
            file_type="py",
            branches_total=20,
            branches_covered=18,
            branches_missing=2,
            functions_total=10,
            functions_covered=9,
            functions_missing=1,
            coverage_data={"detailed_lines": [1, 2, 3]}
        )
        
        assert coverage is not None
        assert coverage.file_path == "app/services/user_service.py"
        assert coverage.lines_total == 100
        assert coverage.lines_covered == 85
        assert coverage.coverage_percent == 85.0
        assert coverage.file_type == "py"
        assert coverage.branches_total == 20
        assert coverage.functions_total == 10
    
    @pytest.mark.asyncio
    async def test_add_test_artifact(self):
        """Test adding test artifacts."""
        run_id = f"test_artifact_{uuid.uuid4().hex[:8]}"
        
        # Create test run
        test_run = await self.service.create_test_run(
            run_id=run_id,
            test_type="e2e",
            test_suite="screenshot_tests"
        )
        
        # Add test artifact
        artifact_data = b"fake_screenshot_data"
        artifact = await self.service.add_test_artifact(
            test_run_id=test_run.id,
            artifact_type="screenshot",
            artifact_name="login_page_screenshot.png",
            artifact_data=artifact_data,
            mime_type="image/png",
            meta_data={"resolution": "1920x1080"}
        )
        
        assert artifact is not None
        assert artifact.artifact_type == "screenshot"
        assert artifact.artifact_name == "login_page_screenshot.png"
        assert artifact.artifact_data == artifact_data
        assert artifact.mime_type == "image/png"
        assert artifact.file_size_bytes == len(artifact_data)
        assert artifact.meta_data["resolution"] == "1920x1080"
    
    @pytest.mark.asyncio
    async def test_add_test_report(self):
        """Test adding test reports."""
        run_id = f"test_report_{uuid.uuid4().hex[:8]}"
        
        # Create test run
        test_run = await self.service.create_test_run(
            run_id=run_id,
            test_type="pytest",
            test_suite="unit_tests"
        )
        
        # Add test report
        report_content = "Test Report\n==========\n\nAll tests passed!"
        report = await self.service.add_test_report(
            test_run_id=test_run.id,
            report_type="summary",
            report_format="text",
            report_title="Unit Test Summary",
            report_content=report_content,
            meta_data={"generated_by": "pytest"}
        )
        
        assert report is not None
        assert report.report_type == "summary"
        assert report.report_format == "text"
        assert report.report_title == "Unit Test Summary"
        assert report.report_content == report_content
        assert report.report_size_bytes == len(report_content)
        assert report.meta_data["generated_by"] == "pytest"
    
    @pytest.mark.asyncio
    async def test_get_test_run_summary(self):
        """Test getting comprehensive test run summary."""
        run_id = f"test_summary_{uuid.uuid4().hex[:8]}"
        
        # Create test run
        test_run = await self.service.create_test_run(
            run_id=run_id,
            test_type="pytest",
            test_suite="comprehensive_tests",
            total_tests=5,
            passed_tests=4,
            failed_tests=1
        )
        
        # Add test results
        await self.service.add_test_result(
            test_run_id=test_run.id,
            test_name="test_1",
            status="passed"
        )
        await self.service.add_test_result(
            test_run_id=test_run.id,
            test_name="test_2",
            status="failed"
        )
        
        # Add benchmark result
        await self.service.add_benchmark_result(
            test_run_id=test_run.id,
            benchmark_name="api_test",
            benchmark_type="load_test",
            total_requests=100,
            successful_requests=95,
            failed_requests=5
        )
        
        # Add coverage data
        await self.service.add_coverage_data(
            test_run_id=test_run.id,
            file_path="test_file.py",
            lines_total=50,
            lines_covered=45,
            lines_missing=5,
            coverage_percent=90.0
        )
        
        # Get summary
        summary = await self.service.get_test_run_summary(test_run.id)
        
        assert summary is not None
        assert summary["test_run"]["run_id"] == run_id
        assert summary["test_run"]["total_tests"] == 5
        assert summary["statistics"]["test_results_count"] == 2
        assert summary["statistics"]["benchmark_results_count"] == 1
        assert summary["statistics"]["coverage_files_count"] == 1
        assert summary["statistics"]["average_coverage_percent"] == 90.0
        assert "passed" in summary["statistics"]["status_counts"]
        assert "failed" in summary["statistics"]["status_counts"]
    
    @pytest.mark.asyncio
    async def test_cleanup_old_data(self):
        """Test cleanup of old test data."""
        run_id = f"test_cleanup_{uuid.uuid4().hex[:8]}"
        
        # Create test run with old timestamp
        test_run = await self.service.create_test_run(
            run_id=run_id,
            test_type="pytest",
            test_suite="old_tests"
        )
        
        # Manually set old created_at timestamp
        old_date = datetime.now(UTC) - timedelta(days=35)
        test_run.created_at = old_date
        self.session.commit()
        
        # Add some related data
        await self.service.add_test_result(
            test_run_id=test_run.id,
            test_name="old_test",
            status="passed"
        )
        
        # Cleanup old data (keep 30 days)
        deleted_counts = await self.service.cleanup_old_data(days_to_keep=30)
        
        assert deleted_counts["test_runs"] == 1
        assert deleted_counts["test_results"] == 1
        
        # Verify test run is deleted
        retrieved_run = await self.service.get_test_run(test_run.id)
        assert retrieved_run is None
    
    @pytest.mark.asyncio
    async def test_error_handling_invalid_test_run_id(self):
        """Test error handling for invalid test run ID."""
        invalid_id = uuid.uuid4()
        
        with pytest.raises(ValueError, match="Test run .* not found"):
            await self.service.update_test_run_status(
                test_run_id=invalid_id,
                status="completed"
            )
    
    @pytest.mark.asyncio
    async def test_database_connection_handling(self):
        """Test database connection and session handling."""
        # Test that service can handle database operations
        run_id = f"test_db_conn_{uuid.uuid4().hex[:8]}"
        
        test_run = await self.service.create_test_run(
            run_id=run_id,
            test_type="connection_test",
            test_suite="db_tests"
        )
        
        assert test_run is not None
        
        # Test that we can retrieve the data
        retrieved_run = await self.service.get_test_run(test_run.id)
        assert retrieved_run is not None
        assert retrieved_run.run_id == run_id
    
    @pytest.mark.asyncio
    async def test_metadata_handling(self):
        """Test metadata handling and JSON serialization."""
        run_id = f"test_metadata_{uuid.uuid4().hex[:8]}"
        
        complex_metadata = {
            "nested": {
                "value": 123,
                "list": [1, 2, 3],
                "boolean": True
            },
            "unicode": "测试数据",
            "special_chars": "!@#$%^&*()"
        }
        
        test_run = await self.service.create_test_run(
            run_id=run_id,
            test_type="metadata_test",
            test_suite="json_tests",
            meta_data=complex_metadata
        )
        
        assert test_run.meta_data == complex_metadata
        assert test_run.meta_data["nested"]["value"] == 123
        assert test_run.meta_data["unicode"] == "测试数据"
    
    @pytest.mark.asyncio
    async def test_concurrent_operations(self):
        """Test concurrent database operations."""
        run_ids = [f"test_concurrent_{i}_{uuid.uuid4().hex[:8]}" for i in range(5)]
        
        # Create multiple test runs concurrently
        tasks = []
        for run_id in run_ids:
            task = self.service.create_test_run(
                run_id=run_id,
                test_type="concurrent_test",
                test_suite="parallel_tests"
            )
            tasks.append(task)
        
        test_runs = await asyncio.gather(*tasks)
        
        assert len(test_runs) == 5
        for i, test_run in enumerate(test_runs):
            assert test_run.run_id == run_ids[i]
            assert test_run.test_type == "concurrent_test"
    
    def test_service_initialization_without_session(self):
        """Test service initialization without providing session."""
        service = EcosystemService()
        assert service.session is None
    
    @pytest.mark.asyncio
    async def test_timezone_aware_datetime_handling(self):
        """Test timezone-aware datetime handling in duration calculation."""
        run_id = f"test_timezone_{uuid.uuid4().hex[:8]}"
        
        # Create test run
        test_run = await self.service.create_test_run(
            run_id=run_id,
            test_type="timezone_test",
            test_suite="datetime_tests"
        )
        
        # Wait a moment to ensure different timestamps
        await asyncio.sleep(0.1)
        
        # Update status to completed
        updated_run = await self.service.update_test_run_status(
            test_run_id=test_run.id,
            status="completed"
        )
        
        assert updated_run.duration_seconds is not None
        assert updated_run.duration_seconds > 0
        assert updated_run.completed_at is not None
        assert updated_run.started_at is not None


class TestDatabaseIntegration:
    """Integration tests for database connectivity and permissions."""
    
    def test_database_connection(self):
        """Test basic database connection."""
        with get_e2e_session() as session:
            # Test basic query
            result = session.execute(text("SELECT 1 as test_value")).fetchone()
            assert result[0] == 1
    
    def test_database_permissions(self):
        """Test database permissions for all required operations."""
        with get_e2e_session() as session:
            # Test table access
            result = session.execute(text("SELECT COUNT(*) FROM test_runs")).fetchone()
            assert result[0] >= 0
            
            # Test insert permission
            test_run = Run(
                run_id=f"permission_test_{uuid.uuid4().hex[:8]}",
                test_type="permission_test",
                test_suite="db_permissions",
                environment="test",
                started_at=datetime.now(UTC),
                status="running"
            )
            session.add(test_run)
            session.commit()
            
            # Test update permission
            test_run.status = "completed"
            session.commit()
            
            # Test delete permission
            session.delete(test_run)
            session.commit()
    
    def test_database_constraints(self):
        """Test database constraints and validations."""
        with get_e2e_session() as session:
            # Test unique constraint on run_id
            run_id = f"constraint_test_{uuid.uuid4().hex[:8]}"
            
            test_run1 = Run(
                run_id=run_id,
                test_type="constraint_test",
                test_suite="db_constraints",
                environment="test",
                started_at=datetime.now(UTC),
                status="running"
            )
            session.add(test_run1)
            session.commit()
            
            # Try to create duplicate run_id
            test_run2 = Run(
                run_id=run_id,
                test_type="constraint_test",
                test_suite="db_constraints",
                environment="test",
                started_at=datetime.now(UTC),
                status="running"
            )
            session.add(test_run2)
            
            with pytest.raises(IntegrityError):
                session.commit()
            
            # Cleanup
            session.rollback()
            session.delete(test_run1)
            session.commit()
    
    def test_database_indexes(self):
        """Test database indexes for performance."""
        with get_e2e_session() as session:
            # Test that indexes exist and are being used
            # This is a basic test - in production you'd use EXPLAIN ANALYZE
            result = session.execute(text("""
                SELECT indexname, tablename 
                FROM pg_indexes 
                WHERE tablename IN ('test_runs', 'test_results', 'benchmark_results')
                ORDER BY tablename, indexname
            """)).fetchall()
            
            # Should have indexes on key columns
            index_names = [row[0] for row in result]
            assert any('run_id' in idx for idx in index_names)
            # Note: Some indexes might have different naming conventions
            assert len(index_names) > 0  # At least some indexes should exist


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
