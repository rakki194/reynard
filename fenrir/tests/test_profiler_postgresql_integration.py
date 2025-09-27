"""Test suite for Fenrir Profiler PostgreSQL integration.

🦊 *whiskers twitch with strategic precision* Comprehensive tests for the
Fenrir profiler's integration with PostgreSQL database storage.

This module tests:
- Profiler initialization with database service
- Session creation and management
- Memory snapshot storage
- Profiling result persistence
- Error handling and fallback mechanisms
- End-to-end profiling workflows

Author: Strategic-Prime-13 (Reynard Fox Specialist)
Version: 1.0.0
"""

import pytest
import uuid
import tempfile
from datetime import datetime, timezone
from pathlib import Path
from unittest.mock import patch, MagicMock, Mock
from typing import Dict, Any

# Add backend path for imports
import sys
from pathlib import Path
backend_path = Path(__file__).parent.parent.parent / "backend"
if str(backend_path) not in sys.path:
    sys.path.insert(0, str(backend_path))

from fenrir.core.profiler import MemoryProfiler, ProfilingSession, MemorySnapshot, ProfilingResult
from fenrir.core.database_service import FenrirDatabaseService


class TestMemoryProfilerDatabaseIntegration:
    """Test MemoryProfiler integration with PostgreSQL database."""

    def test_memory_profiler_initialization_with_database(self, fenrir_database_service, test_session_id):
        """Test MemoryProfiler initializes with database service."""
        profiler = MemoryProfiler(session_id=test_session_id)

        assert profiler is not None
        assert profiler.session_id == test_session_id
        assert profiler.db_service is not None
        assert isinstance(profiler.db_service, FenrirDatabaseService)
        assert profiler.session is not None
        assert profiler.session.session_id == test_session_id

    def test_memory_profiler_auto_generated_session_id(self, fenrir_database_service):
        """Test MemoryProfiler generates session ID when none provided."""
        profiler = MemoryProfiler()

        assert profiler.session_id is not None
        assert profiler.session_id.startswith("profile_")
        assert profiler.session.session_id == profiler.session_id

    def test_take_memory_snapshot_stores_locally(self, fenrir_database_service, test_session_id):
        """Test taking memory snapshots stores data locally."""
        profiler = MemoryProfiler(session_id=test_session_id)
        initial_count = len(profiler.session.snapshots)

        snapshot = profiler.take_memory_snapshot("test_context")

        assert snapshot is not None
        assert len(profiler.session.snapshots) == initial_count + 1
        assert snapshot.context == "test_context"
        assert snapshot.rss_mb > 0
        assert snapshot.vms_mb > 0
        assert snapshot.percent > 0

    def test_add_profiling_result_stores_locally(self, fenrir_database_service, test_session_id):
        """Test adding profiling results stores data locally."""
        profiler = MemoryProfiler(session_id=test_session_id)
        initial_count = len(profiler.session.results)

        result = profiler.add_profiling_result(
            category="memory",
            severity="high",
            issue="Test issue",
            recommendation="Test recommendation",
            memory_impact_mb=100.0,
            performance_impact="significant"
        )

        assert result is not None
        assert len(profiler.session.results) == initial_count + 1
        assert result.category == "memory"
        assert result.severity == "high"
        assert result.issue == "Test issue"
        assert result.recommendation == "Test recommendation"
        assert result.memory_impact_mb == 100.0
        assert result.performance_impact == "significant"


class TestProfilerDatabasePersistence:
    """Test profiler data persistence to PostgreSQL."""

    def test_save_session_to_database_success(self, fenrir_database_service, test_session_id):
        """Test successful session save to database."""
        profiler = MemoryProfiler(session_id=test_session_id)

        # Add some test data
        profiler.take_memory_snapshot("test_snapshot_1")
        profiler.take_memory_snapshot("test_snapshot_2")
        profiler.add_profiling_result(
            category="memory",
            severity="high",
            issue="Test issue",
            recommendation="Test recommendation",
            memory_impact_mb=100.0,
            performance_impact="significant"
        )

        # Save to database
        db_session_id = profiler.save_session()

        assert db_session_id is not None
        assert isinstance(db_session_id, str)
        uuid.UUID(db_session_id)

        # Verify data was saved
        session_data = fenrir_database_service.get_profiling_session(test_session_id)
        assert session_data is not None
        assert session_data["session_id"] == test_session_id
        assert session_data["status"] == "completed"
        assert session_data["total_snapshots"] == 2
        assert session_data["issues_found"] == 1

    def test_save_session_uses_existing_session(self, fenrir_database_service, test_session_id):
        """Test that save_session uses existing database session."""
        profiler = MemoryProfiler(session_id=test_session_id)

        # Create session in database first
        db_session_id = fenrir_database_service.create_profiling_session(
            session_id=test_session_id,
            session_type="memory",
            environment="development"
        )

        # Add test data
        profiler.take_memory_snapshot("test_snapshot")
        profiler.add_profiling_result(
            category="memory",
            severity="high",
            issue="Test issue",
            recommendation="Test recommendation"
        )

        # Save should use existing session
        result_id = profiler.save_session()

        assert result_id == db_session_id

        # Verify data was added to existing session
        session_data = fenrir_database_service.get_profiling_session(test_session_id)
        assert session_data["total_snapshots"] == 1
        assert session_data["issues_found"] == 1

    def test_save_session_fallback_to_json(self, fenrir_database_service, test_session_id):
        """Test fallback to JSON when database save fails."""
        profiler = MemoryProfiler(session_id=test_session_id)

        # Add test data
        profiler.take_memory_snapshot("test_snapshot")
        profiler.add_profiling_result(
            category="memory",
            severity="high",
            issue="Test issue",
            recommendation="Test recommendation"
        )

        # Mock database service to raise exception
        with patch.object(profiler.db_service, 'get_profiling_session', side_effect=Exception("Database error")):
            result = profiler.save_session()

            # Should fallback to JSON file
            assert isinstance(result, str)
            assert result.endswith('.json')

            # Verify JSON file was created
            json_path = Path(result)
            assert json_path.exists()

            # Clean up
            json_path.unlink()

    def test_save_session_calculates_duration(self, fenrir_database_service, test_session_id):
        """Test that save_session calculates duration correctly."""
        profiler = MemoryProfiler(session_id=test_session_id)

        # Set end time
        profiler.session.end_time = datetime.now(timezone.utc)

        # Add test data
        profiler.take_memory_snapshot("test_snapshot")

        # Save to database
        profiler.save_session()

        # Verify duration was calculated
        session_data = fenrir_database_service.get_profiling_session(test_session_id)
        assert session_data["duration_seconds"] is not None
        assert session_data["duration_seconds"] > 0

    def test_save_session_calculates_memory_metrics(self, fenrir_database_service, test_session_id):
        """Test that save_session calculates memory metrics correctly."""
        profiler = MemoryProfiler(session_id=test_session_id)

        # Add snapshots with different memory values
        profiler.take_memory_snapshot("snapshot_1")
        # Mock different memory values for testing
        profiler.session.snapshots[0].rss_mb = 100.0

        profiler.take_memory_snapshot("snapshot_2")
        profiler.session.snapshots[1].rss_mb = 200.0

        profiler.take_memory_snapshot("snapshot_3")
        profiler.session.snapshots[2].rss_mb = 150.0

        # Save to database
        profiler.save_session()

        # Verify memory metrics
        session_data = fenrir_database_service.get_profiling_session(test_session_id)
        assert session_data["peak_memory_mb"] == 200.0  # Highest value
        assert session_data["final_memory_mb"] == 150.0  # Last value
        assert session_data["memory_delta_mb"] == 50.0  # Last - first

    def test_save_session_with_analysis_data(self, fenrir_database_service, test_session_id):
        """Test saving session with analysis data."""
        profiler = MemoryProfiler(session_id=test_session_id)

        # Set analysis data
        profiler.session.backend_analysis = {"backend": "test_data"}
        profiler.session.database_analysis = {"database": "test_data"}
        profiler.session.service_analysis = {"service": "test_data"}

        # Save to database
        profiler.save_session()

        # Verify analysis data was saved
        session_data = fenrir_database_service.get_profiling_session(test_session_id)
        assert session_data["backend_analysis"] == {"backend": "test_data"}
        assert session_data["database_analysis"] == {"database": "test_data"}
        assert session_data["service_analysis"] == {"service": "test_data"}


class TestProfilerErrorHandling:
    """Test profiler error handling and edge cases."""

    def test_save_session_handles_empty_snapshots(self, fenrir_database_service, test_session_id):
        """Test save_session handles empty snapshots gracefully."""
        profiler = MemoryProfiler(session_id=test_session_id)

        # Don't add any snapshots
        result = profiler.save_session()

        assert result is not None

        # Verify session was saved with empty data
        session_data = fenrir_database_service.get_profiling_session(test_session_id)
        assert session_data["total_snapshots"] == 0
        assert session_data["issues_found"] == 0
        assert session_data["peak_memory_mb"] is None
        assert session_data["final_memory_mb"] is None
        assert session_data["memory_delta_mb"] is None

    def test_save_session_handles_empty_results(self, fenrir_database_service, test_session_id):
        """Test save_session handles empty results gracefully."""
        profiler = MemoryProfiler(session_id=test_session_id)

        # Add snapshots but no results
        profiler.take_memory_snapshot("test_snapshot")

        result = profiler.save_session()

        assert result is not None

        # Verify session was saved
        session_data = fenrir_database_service.get_profiling_session(test_session_id)
        assert session_data["total_snapshots"] == 1
        assert session_data["issues_found"] == 0

    def test_save_session_handles_database_connection_error(self, fenrir_database_service, test_session_id):
        """Test save_session handles database connection errors."""
        profiler = MemoryProfiler(session_id=test_session_id)

        # Add test data
        profiler.take_memory_snapshot("test_snapshot")

        # Mock database service to simulate connection error
        with patch.object(profiler.db_service, 'get_profiling_session', side_effect=Exception("Connection error")):
            result = profiler.save_session()

            # Should fallback to JSON
            assert isinstance(result, str)
            assert result.endswith('.json')

            # Clean up
            Path(result).unlink(missing_ok=True)

    def test_save_session_handles_invalid_session_data(self, fenrir_database_service, test_session_id):
        """Test save_session handles invalid session data gracefully."""
        profiler = MemoryProfiler(session_id=test_session_id)

        # Corrupt session data
        profiler.session.snapshots = None

        # Should handle gracefully
        with pytest.raises(Exception):
            profiler.save_session()


class TestProfilerIntegrationWorkflow:
    """Test complete profiling workflow integration."""

    def test_complete_profiling_workflow(self, fenrir_database_service, test_session_id):
        """Test complete profiling workflow from start to finish."""
        # Initialize profiler
        profiler = MemoryProfiler(session_id=test_session_id)

        # Take initial snapshot
        profiler.take_memory_snapshot("analysis_start")

        # Simulate some work
        profiler.take_memory_snapshot("startup_begin")
        profiler.take_memory_snapshot("startup_complete")

        # Add some results
        profiler.add_profiling_result(
            category="memory",
            severity="high",
            issue="High memory growth during analysis",
            recommendation="Investigate memory leaks",
            memory_impact_mb=100.0,
            performance_impact="significant"
        )

        profiler.add_profiling_result(
            category="imports",
            severity="medium",
            issue="High memory modules detected",
            recommendation="Consider lazy loading",
            memory_impact_mb=50.0,
            performance_impact="moderate"
        )

        # Set analysis data
        profiler.session.backend_analysis = {"services": ["rag", "ollama"]}
        profiler.session.database_analysis = {"connections": 5}
        profiler.session.service_analysis = {"startup_time": 2.5}

        # Complete session
        profiler.session.end_time = datetime.now(timezone.utc)

        # Save to database
        db_session_id = profiler.save_session()

        # Verify complete data was saved
        session_data = fenrir_database_service.get_profiling_session(test_session_id)
        assert session_data is not None
        assert session_data["status"] == "completed"
        assert session_data["total_snapshots"] == 3
        assert session_data["issues_found"] == 2
        assert session_data["backend_analysis"] == {"services": ["rag", "ollama"]}
        assert session_data["database_analysis"] == {"connections": 5}
        assert session_data["service_analysis"] == {"startup_time": 2.5}

        # Verify snapshots were saved
        snapshots = fenrir_database_service.get_memory_snapshots(test_session_id)
        assert len(snapshots) == 3
        assert any(s["context"] == "analysis_start" for s in snapshots)
        assert any(s["context"] == "startup_begin" for s in snapshots)
        assert any(s["context"] == "startup_complete" for s in snapshots)

        # Verify results were saved
        results = fenrir_database_service.get_profiling_results(test_session_id)
        assert len(results) == 2
        assert any(r["category"] == "memory" and r["severity"] == "high" for r in results)
        assert any(r["category"] == "imports" and r["severity"] == "medium" for r in results)

    def test_profiler_with_tracemalloc(self, fenrir_database_service, test_session_id):
        """Test profiler with tracemalloc enabled."""
        profiler = MemoryProfiler(session_id=test_session_id)

        # Start tracemalloc
        profiler.start_tracemalloc()
        assert profiler.tracemalloc_enabled is True

        # Take snapshot with tracemalloc data
        snapshot = profiler.take_memory_snapshot("with_tracemalloc")
        assert snapshot.tracemalloc_mb >= 0

        # Stop tracemalloc
        profiler.stop_tracemalloc()
        assert profiler.tracemalloc_enabled is False

        # Save to database
        profiler.save_session()

        # Verify tracemalloc data was saved
        snapshots = fenrir_database_service.get_memory_snapshots(test_session_id)
        assert len(snapshots) == 1
        assert snapshots[0]["tracemalloc_mb"] >= 0

    def test_profiler_memory_analysis_methods(self, fenrir_database_service, test_session_id):
        """Test profiler memory analysis methods."""
        profiler = MemoryProfiler(session_id=test_session_id)

        # Test memory analysis methods
        memory_info = profiler.get_memory_info()
        assert "rss_mb" in memory_info
        assert "vms_mb" in memory_info
        assert "percent" in memory_info
        assert "available_mb" in memory_info

        # Test garbage collection info
        gc_info = profiler.get_gc_info()
        assert "objects" in gc_info

        # Test process info
        process_info = profiler.get_process_info()
        assert "pid" in process_info
        assert "name" in process_info


class TestProfilerConcurrency:
    """Test profiler behavior under concurrent access."""

    def test_concurrent_session_creation(self, fenrir_database_service):
        """Test creating multiple profilers with different session IDs."""
        session_ids = [f"concurrent_test_{i}_{int(datetime.now().timestamp())}" for i in range(3)]
        profilers = []

        # Create multiple profilers
        for session_id in session_ids:
            profiler = MemoryProfiler(session_id=session_id)
            profiler.take_memory_snapshot("test_snapshot")
            profiler.save_session()
            profilers.append(profiler)

        # Verify all sessions were created
        for session_id in session_ids:
            session_data = fenrir_database_service.get_profiling_session(session_id)
            assert session_data is not None
            assert session_data["session_id"] == session_id

    def test_session_id_uniqueness(self, fenrir_database_service):
        """Test that session IDs are unique."""
        profiler1 = MemoryProfiler()
        profiler2 = MemoryProfiler()

        assert profiler1.session_id != profiler2.session_id

        # Both should be able to save without conflicts
        profiler1.take_memory_snapshot("test1")
        profiler2.take_memory_snapshot("test2")

        db_id1 = profiler1.save_session()
        db_id2 = profiler2.save_session()

        assert db_id1 != db_id2


if __name__ == "__main__":
    pytest.main([__file__])
