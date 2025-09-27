"""Integration tests for end-to-end Fenrir profiling flow.

🦊 *whiskers twitch with strategic precision* Comprehensive integration tests
for the complete Fenrir profiling workflow from CLI to database storage.

This module tests:
- Complete profiling workflow from start to finish
- CLI integration with database storage
- Real profiling scenarios with actual backend analysis
- Performance and memory usage during profiling
- Error recovery and fallback mechanisms
- Data consistency across the entire pipeline

Author: Strategic-Prime-13 (Reynard Fox Specialist)
Version: 1.0.0
"""

import pytest
import asyncio
import subprocess
import tempfile
import os
import sys
from datetime import datetime, timezone
from pathlib import Path
from unittest.mock import patch, MagicMock
from typing import Dict, Any

# Add backend path for imports
backend_path = Path(__file__).parent.parent.parent / "backend"
if str(backend_path) not in sys.path:
    sys.path.insert(0, str(backend_path))

from fenrir.core.profiler import MemoryProfiler, FenrirProfiler
from fenrir.core.database_service import FenrirDatabaseService


class TestEndToEndProfilingFlow:
    """Test complete end-to-end profiling workflow."""

    def test_complete_memory_profiling_workflow(self, fenrir_database_service):
        """Test complete memory profiling workflow from start to finish."""
        session_id = f"integration_test_{int(datetime.now().timestamp())}"

        # Initialize profiler
        profiler = MemoryProfiler(session_id=session_id)

        # Start profiling
        profiler.start_tracemalloc()

        # Take initial snapshot
        profiler.take_memory_snapshot("analysis_start")
        initial_memory = profiler.get_memory_info()

        # Simulate backend startup analysis
        profiler.take_memory_snapshot("startup_begin")

        # Simulate some memory-intensive operations
        test_data = [f"test_string_{i}" for i in range(1000)]
        profiler.take_memory_snapshot("startup_complete")

        # Analyze memory usage
        final_memory = profiler.get_memory_info()
        memory_growth = final_memory["rss_mb"] - initial_memory["rss_mb"]

        # Add profiling results based on analysis
        if memory_growth > 100:
            profiler.add_profiling_result(
                category="memory",
                severity="high",
                issue=f"High memory growth during analysis: {memory_growth:.1f}MB",
                recommendation="Investigate memory leaks in service initialization",
                memory_impact_mb=memory_growth,
                performance_impact="significant"
            )

        # Add import analysis
        profiler.add_profiling_result(
            category="imports",
            severity="medium",
            issue="High memory modules detected: 5",
            recommendation="Consider lazy loading for high-memory modules",
            memory_impact_mb=50.0,
            performance_impact="moderate"
        )

        # Set analysis data
        profiler.session.backend_analysis = {
            "services_analyzed": ["rag", "ollama", "pytorch"],
            "startup_time": 2.5,
            "memory_peak": final_memory["rss_mb"]
        }

        profiler.session.database_analysis = {
            "connections_checked": 3,
            "queries_analyzed": 10,
            "connection_pool_size": 5
        }

        profiler.session.service_analysis = {
            "services_started": 5,
            "failed_services": 0,
            "average_startup_time": 1.2
        }

        # Complete profiling
        profiler.stop_tracemalloc()
        profiler.session.end_time = datetime.now(timezone.utc)

        # Save to database
        db_session_id = profiler.save_session()

        # Verify complete workflow
        assert db_session_id is not None
        assert profiler.session_id == session_id
        assert len(profiler.session.snapshots) >= 3
        assert len(profiler.session.results) >= 2

        # Verify database storage
        session_data = fenrir_database_service.get_profiling_session(session_id)
        assert session_data is not None
        assert session_data["status"] == "completed"
        assert session_data["total_snapshots"] >= 3
        assert session_data["issues_found"] >= 2
        assert session_data["backend_analysis"] is not None
        assert session_data["database_analysis"] is not None
        assert session_data["service_analysis"] is not None

        # Verify snapshots
        snapshots = fenrir_database_service.get_memory_snapshots(session_id)
        assert len(snapshots) >= 3
        assert any(s["context"] == "analysis_start" for s in snapshots)
        assert any(s["context"] == "startup_begin" for s in snapshots)
        assert any(s["context"] == "startup_complete" for s in snapshots)

        # Verify results
        results = fenrir_database_service.get_profiling_results(session_id)
        assert len(results) >= 2
        assert any(r["category"] == "memory" for r in results)
        assert any(r["category"] == "imports" for r in results)

    def test_fenrir_profiler_integration(self, fenrir_database_service):
        """Test FenrirProfiler integration with database storage."""
        session_id = f"fenrir_integration_{int(datetime.now().timestamp())}"

        # Initialize Fenrir profiler
        fenrir_profiler = FenrirProfiler()

        # Run memory analysis
        session = asyncio.run(fenrir_profiler.run_memory_analysis(session_id))

        # Verify session was created
        assert session is not None
        assert session.session_id == session_id
        assert len(session.snapshots) > 0
        assert len(session.results) > 0

        # Verify database storage
        session_data = fenrir_database_service.get_profiling_session(session_id)
        assert session_data is not None
        assert session_data["status"] == "completed"
        assert session_data["total_snapshots"] > 0
        assert session_data["issues_found"] > 0

    def test_profiling_with_backend_tools(self, fenrir_database_service):
        """Test profiling with backend analysis tools."""
        session_id = f"backend_tools_{int(datetime.now().timestamp())}"

        # Mock backend tools availability
        with patch('fenrir.core.profiler.BACKEND_TOOLS_AVAILABLE', True):
            profiler = MemoryProfiler(session_id=session_id)

            # Verify backend tools are initialized
            assert profiler.backend_analyzer is not None
            assert profiler.database_debugger is not None
            assert profiler.service_tracker is not None

            # Run profiling
            profiler.take_memory_snapshot("with_backend_tools")
            profiler.add_profiling_result(
                category="backend",
                severity="low",
                issue="Backend tools integration working",
                recommendation="Continue monitoring",
                memory_impact_mb=10.0,
                performance_impact="minimal"
            )

            # Save to database
            db_session_id = profiler.save_session()

            # Verify storage
            session_data = fenrir_database_service.get_profiling_session(session_id)
            assert session_data is not None
            assert session_data["total_snapshots"] == 1
            assert session_data["issues_found"] == 1

    def test_profiling_without_backend_tools(self, fenrir_database_service):
        """Test profiling without backend analysis tools."""
        session_id = f"no_backend_tools_{int(datetime.now().timestamp())}"

        # Mock backend tools unavailability
        with patch('fenrir.core.profiler.BACKEND_TOOLS_AVAILABLE', False):
            profiler = MemoryProfiler(session_id=session_id)

            # Verify backend tools are not initialized
            assert profiler.backend_analyzer is None
            assert profiler.database_debugger is None
            assert profiler.service_tracker is None

            # Run profiling
            profiler.take_memory_snapshot("without_backend_tools")
            profiler.add_profiling_result(
                category="system",
                severity="medium",
                issue="Backend tools not available",
                recommendation="Install backend tools for enhanced analysis",
                memory_impact_mb=0.0,
                performance_impact="none"
            )

            # Save to database
            db_session_id = profiler.save_session()

            # Verify storage
            session_data = fenrir_database_service.get_profiling_session(session_id)
            assert session_data is not None
            assert session_data["total_snapshots"] == 1
            assert session_data["issues_found"] == 1


class TestCLIIntegration:
    """Test CLI integration with database storage."""

    def test_cli_profiling_with_database_storage(self, fenrir_database_service):
        """Test CLI profiling command with database storage."""
        session_id = f"cli_test_{int(datetime.now().timestamp())}"

        # Set environment variable
        env = os.environ.copy()
        env["E2E_DATABASE_URL"] = os.getenv("E2E_DATABASE_URL")

        # Run CLI command
        result = subprocess.run([
            sys.executable, "-m", "fenrir",
            "--mode", "profiling",
            "--profile-type", "memory",
            "--session-id", session_id
        ], env=env, capture_output=True, text=True, timeout=120)

        # Verify command succeeded
        assert result.returncode == 0
        assert "Session saved to database" in result.stdout or "Fallback: Session saved to JSON" in result.stdout

        # Verify database storage
        session_data = fenrir_database_service.get_profiling_session(session_id)
        assert session_data is not None
        assert session_data["status"] == "completed"
        assert session_data["total_snapshots"] > 0

    def test_cli_profiling_fallback_to_json(self, fenrir_database_service):
        """Test CLI profiling fallback to JSON when database fails."""
        session_id = f"cli_fallback_{int(datetime.now().timestamp())}"

        # Set invalid database URL
        env = os.environ.copy()
        env["E2E_DATABASE_URL"] = "postgresql://invalid:invalid@localhost:5432/invalid"

        # Run CLI command
        result = subprocess.run([
            sys.executable, "-m", "fenrir",
            "--mode", "profiling",
            "--profile-type", "memory",
            "--session-id", session_id
        ], env=env, capture_output=True, text=True, timeout=120)

        # Verify command succeeded with fallback
        assert result.returncode == 0
        assert "Fallback: Session saved to JSON" in result.stdout

        # Verify JSON file was created
        json_files = list(Path(".").glob(f"fenrir_profile_{session_id}.json"))
        assert len(json_files) == 1

        # Clean up
        for json_file in json_files:
            json_file.unlink()


class TestPerformanceAndMemory:
    """Test performance and memory usage during profiling."""

    def test_profiling_memory_overhead(self, fenrir_database_service):
        """Test that profiling itself doesn't consume excessive memory."""
        session_id = f"memory_overhead_{int(datetime.now().timestamp())}"

        # Get initial memory
        initial_process = psutil.Process()
        initial_memory = initial_process.memory_info().rss / 1024 / 1024  # MB

        # Run profiling
        profiler = MemoryProfiler(session_id=session_id)
        profiler.start_tracemalloc()

        # Take multiple snapshots
        for i in range(10):
            profiler.take_memory_snapshot(f"snapshot_{i}")

        # Add multiple results
        for i in range(5):
            profiler.add_profiling_result(
                category="test",
                severity="low",
                issue=f"Test issue {i}",
                recommendation=f"Test recommendation {i}",
                memory_impact_mb=1.0,
                performance_impact="minimal"
            )

        profiler.stop_tracemalloc()
        profiler.save_session()

        # Get final memory
        final_memory = initial_process.memory_info().rss / 1024 / 1024  # MB
        memory_overhead = final_memory - initial_memory

        # Profiling overhead should be reasonable (< 50MB)
        assert memory_overhead < 50, f"Profiling overhead too high: {memory_overhead:.1f}MB"

        # Verify data was saved
        session_data = fenrir_database_service.get_profiling_session(session_id)
        assert session_data["total_snapshots"] == 10
        assert session_data["issues_found"] == 5

    def test_profiling_performance(self, fenrir_database_service):
        """Test profiling performance with large datasets."""
        session_id = f"performance_test_{int(datetime.now().timestamp())}"

        start_time = datetime.now()

        # Run profiling with many snapshots
        profiler = MemoryProfiler(session_id=session_id)

        # Take many snapshots quickly
        for i in range(100):
            profiler.take_memory_snapshot(f"perf_snapshot_{i}")

        # Add many results
        for i in range(50):
            profiler.add_profiling_result(
                category="performance",
                severity="low",
                issue=f"Performance test issue {i}",
                recommendation=f"Performance test recommendation {i}",
                memory_impact_mb=0.1,
                performance_impact="minimal"
            )

        # Save to database
        profiler.save_session()

        end_time = datetime.now()
        duration = (end_time - start_time).total_seconds()

        # Should complete within reasonable time (< 30 seconds)
        assert duration < 30, f"Profiling took too long: {duration:.1f} seconds"

        # Verify all data was saved
        session_data = fenrir_database_service.get_profiling_session(session_id)
        assert session_data["total_snapshots"] == 100
        assert session_data["issues_found"] == 50


class TestErrorRecovery:
    """Test error recovery and fallback mechanisms."""

    def test_database_connection_recovery(self, fenrir_database_service):
        """Test recovery from database connection errors."""
        session_id = f"recovery_test_{int(datetime.now().timestamp())}"

        profiler = MemoryProfiler(session_id=session_id)
        profiler.take_memory_snapshot("recovery_test")

        # Mock database connection failure
        with patch.object(profiler.db_service, 'get_profiling_session', side_effect=Exception("Connection failed")):
            result = profiler.save_session()

            # Should fallback to JSON
            assert isinstance(result, str)
            assert result.endswith('.json')

            # Verify JSON file exists and contains data
            json_path = Path(result)
            assert json_path.exists()

            import json
            with open(json_path) as f:
                data = json.load(f)
                assert data["session_id"] == session_id
                assert len(data["snapshots"]) == 1

            # Clean up
            json_path.unlink()

    def test_partial_data_recovery(self, fenrir_database_service):
        """Test recovery from partial data corruption."""
        session_id = f"partial_recovery_{int(datetime.now().timestamp())}"

        profiler = MemoryProfiler(session_id=session_id)

        # Add some valid data
        profiler.take_memory_snapshot("valid_snapshot")
        profiler.add_profiling_result(
            category="test",
            severity="low",
            issue="Valid issue",
            recommendation="Valid recommendation",
            memory_impact_mb=1.0,
            performance_impact="minimal"
        )

        # Corrupt some data
        profiler.session.snapshots.append(None)  # Invalid snapshot

        # Should handle gracefully
        try:
            result = profiler.save_session()
            # If it succeeds, verify valid data was saved
            session_data = fenrir_database_service.get_profiling_session(session_id)
            assert session_data["total_snapshots"] >= 1
            assert session_data["issues_found"] == 1
        except Exception:
            # If it fails, should fallback to JSON
            result = profiler.save_session()
            assert isinstance(result, str)
            assert result.endswith('.json')
            Path(result).unlink(missing_ok=True)

    def test_concurrent_access_recovery(self, fenrir_database_service):
        """Test recovery from concurrent access issues."""
        session_id = f"concurrent_recovery_{int(datetime.now().timestamp())}"

        # Create first profiler
        profiler1 = MemoryProfiler(session_id=session_id)
        profiler1.take_memory_snapshot("first_snapshot")

        # Create second profiler with same session ID
        profiler2 = MemoryProfiler(session_id=session_id)
        profiler2.take_memory_snapshot("second_snapshot")

        # First save should succeed
        result1 = profiler1.save_session()
        assert result1 is not None

        # Second save should use existing session
        result2 = profiler2.save_session()
        assert result2 is not None

        # Verify both snapshots were saved
        snapshots = fenrir_database_service.get_memory_snapshots(session_id)
        assert len(snapshots) == 2
        assert any(s["context"] == "first_snapshot" for s in snapshots)
        assert any(s["context"] == "second_snapshot" for s in snapshots)


class TestDataConsistency:
    """Test data consistency across the profiling pipeline."""

    def test_data_consistency_across_operations(self, fenrir_database_service):
        """Test data consistency across all profiling operations."""
        session_id = f"consistency_test_{int(datetime.now().timestamp())}"

        profiler = MemoryProfiler(session_id=session_id)

        # Add data in specific order
        profiler.take_memory_snapshot("snapshot_1")
        profiler.add_profiling_result(
            category="memory",
            severity="high",
            issue="Issue 1",
            recommendation="Recommendation 1",
            memory_impact_mb=100.0,
            performance_impact="significant"
        )

        profiler.take_memory_snapshot("snapshot_2")
        profiler.add_profiling_result(
            category="performance",
            severity="medium",
            issue="Issue 2",
            recommendation="Recommendation 2",
            memory_impact_mb=50.0,
            performance_impact="moderate"
        )

        profiler.take_memory_snapshot("snapshot_3")

        # Save to database
        profiler.save_session()

        # Verify data consistency
        session_data = fenrir_database_service.get_profiling_session(session_id)
        assert session_data["total_snapshots"] == 3
        assert session_data["issues_found"] == 2

        # Verify snapshot order and data
        snapshots = fenrir_database_service.get_memory_snapshots(session_id)
        assert len(snapshots) == 3
        assert snapshots[0]["context"] == "snapshot_1"
        assert snapshots[1]["context"] == "snapshot_2"
        assert snapshots[2]["context"] == "snapshot_3"

        # Verify result data
        results = fenrir_database_service.get_profiling_results(session_id)
        assert len(results) == 2
        memory_results = [r for r in results if r["category"] == "memory"]
        performance_results = [r for r in results if r["category"] == "performance"]
        assert len(memory_results) == 1
        assert len(performance_results) == 1
        assert memory_results[0]["severity"] == "high"
        assert performance_results[0]["severity"] == "medium"

    def test_timestamp_consistency(self, fenrir_database_service):
        """Test timestamp consistency across snapshots and results."""
        session_id = f"timestamp_test_{int(datetime.now().timestamp())}"

        profiler = MemoryProfiler(session_id=session_id)

        # Take snapshots with known timestamps
        start_time = datetime.now(timezone.utc)
        profiler.take_memory_snapshot("timestamp_test")
        end_time = datetime.now(timezone.utc)

        # Save to database
        profiler.save_session()

        # Verify timestamps
        session_data = fenrir_database_service.get_profiling_session(session_id)
        session_start = datetime.fromisoformat(session_data["started_at"].replace('Z', '+00:00'))
        session_end = datetime.fromisoformat(session_data["completed_at"].replace('Z', '+00:00'))

        assert session_start >= start_time
        assert session_end <= end_time
        assert session_end > session_start

        # Verify snapshot timestamp
        snapshots = fenrir_database_service.get_memory_snapshots(session_id)
        assert len(snapshots) == 1
        snapshot_time = datetime.fromisoformat(snapshots[0]["timestamp"].replace('Z', '+00:00'))
        assert start_time <= snapshot_time <= end_time


if __name__ == "__main__":
    pytest.main([__file__])
