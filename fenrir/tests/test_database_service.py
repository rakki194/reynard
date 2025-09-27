"""Test suite for Fenrir Database Service PostgreSQL integration.

🦊 *whiskers twitch with strategic precision* Comprehensive tests for the
Fenrir database service that handles profiling session storage in PostgreSQL.

This module tests:
- Database connection and initialization
- Profiling session CRUD operations
- Memory snapshot storage and retrieval
- Profiling result management
- Error handling and edge cases
- Data integrity and relationships

Author: Strategic-Prime-13 (Reynard Fox Specialist)
Version: 1.0.0
"""

import pytest
import uuid
from datetime import datetime, timezone
from unittest.mock import patch, MagicMock
from typing import Dict, Any

# Add backend path for imports
import sys
from pathlib import Path
backend_path = Path(__file__).parent.parent.parent / "backend"
if str(backend_path) not in sys.path:
    sys.path.insert(0, str(backend_path))

from fenrir.core.database_service import FenrirDatabaseService, get_database_service


class TestFenrirDatabaseService:
    """Test the FenrirDatabaseService class functionality."""

    def test_database_service_initialization(self, fenrir_database_service):
        """Test database service initializes correctly."""
        assert fenrir_database_service is not None
        assert hasattr(fenrir_database_service, 'engine')
        assert hasattr(fenrir_database_service, 'SessionLocal')
        assert fenrir_database_service.engine is not None
        assert fenrir_database_service.SessionLocal is not None

    def test_database_connection_test(self, fenrir_database_service):
        """Test database connection test functionality."""
        result = fenrir_database_service.test_connection()
        assert result is True

    def test_get_database_service_singleton(self):
        """Test that get_database_service returns singleton instance."""
        service1 = get_database_service()
        service2 = get_database_service()
        assert service1 is service2

    def test_get_session_context_manager(self, fenrir_database_service):
        """Test database session context manager."""
        with fenrir_database_service.get_session() as session:
            assert session is not None
            # Session should be automatically committed and closed

    def test_get_session_rollback_on_error(self, fenrir_database_service):
        """Test that session rolls back on error."""
        with pytest.raises(Exception):
            with fenrir_database_service.get_session() as session:
                # Force an error
                raise Exception("Test error")
        # Session should be rolled back and closed


class TestProfilingSessionOperations:
    """Test profiling session CRUD operations."""

    def test_create_profiling_session(self, fenrir_database_service, test_session_id):
        """Test creating a new profiling session."""
        session_id = fenrir_database_service.create_profiling_session(
            session_id=test_session_id,
            session_type="memory",
            environment="test"
        )

        assert session_id is not None
        assert isinstance(session_id, str)
        # Should be a valid UUID
        uuid.UUID(session_id)

    def test_create_profiling_session_duplicate(self, fenrir_database_service, test_session_id):
        """Test creating duplicate profiling session fails."""
        # Create first session
        fenrir_database_service.create_profiling_session(
            session_id=test_session_id,
            session_type="memory",
            environment="test"
        )

        # Try to create duplicate
        with pytest.raises(Exception):  # Should raise UniqueViolation
            fenrir_database_service.create_profiling_session(
                session_id=test_session_id,
                session_type="memory",
                environment="test"
            )

    def test_get_profiling_session(self, fenrir_database_service, test_session_id):
        """Test retrieving a profiling session."""
        # Create session first
        db_session_id = fenrir_database_service.create_profiling_session(
            session_id=test_session_id,
            session_type="memory",
            environment="test"
        )

        # Retrieve session
        session = fenrir_database_service.get_profiling_session(test_session_id)

        assert session is not None
        assert session["session_id"] == test_session_id
        assert session["session_type"] == "memory"
        assert session["environment"] == "test"
        assert session["status"] == "running"
        assert session["id"] == db_session_id

    def test_get_profiling_session_not_found(self, fenrir_database_service):
        """Test retrieving non-existent profiling session."""
        session = fenrir_database_service.get_profiling_session("non-existent-session")
        assert session is None

    def test_update_profiling_session(self, fenrir_database_service, test_session_id):
        """Test updating a profiling session."""
        # Create session first
        fenrir_database_service.create_profiling_session(
            session_id=test_session_id,
            session_type="memory",
            environment="test"
        )

        # Update session
        result = fenrir_database_service.update_profiling_session(
            session_id=test_session_id,
            status="completed",
            duration_seconds=45.2,
            total_snapshots=4,
            issues_found=2,
            peak_memory_mb=800.0,
            final_memory_mb=750.0,
            memory_delta_mb=600.0,
            backend_analysis={"test": "data"},
            database_analysis={"test": "data"},
            service_analysis={"test": "data"}
        )

        assert result is True

        # Verify update
        session = fenrir_database_service.get_profiling_session(test_session_id)
        assert session["status"] == "completed"
        assert session["duration_seconds"] == 45.2
        assert session["total_snapshots"] == 4
        assert session["issues_found"] == 2
        assert session["peak_memory_mb"] == 800.0
        assert session["final_memory_mb"] == 750.0
        assert session["memory_delta_mb"] == 600.0
        assert session["backend_analysis"] == {"test": "data"}
        assert session["database_analysis"] == {"test": "data"}
        assert session["service_analysis"] == {"test": "data"}

    def test_update_profiling_session_not_found(self, fenrir_database_service):
        """Test updating non-existent profiling session."""
        result = fenrir_database_service.update_profiling_session(
            session_id="non-existent-session",
            status="completed"
        )
        assert result is False

    def test_get_recent_sessions(self, fenrir_database_service):
        """Test retrieving recent profiling sessions."""
        # Create multiple sessions
        for i in range(3):
            fenrir_database_service.create_profiling_session(
                session_id=f"test_recent_{i}_{int(datetime.now().timestamp())}",
                session_type="memory",
                environment="test"
            )

        sessions = fenrir_database_service.get_recent_sessions(limit=5)
        assert len(sessions) >= 3
        assert all("session_id" in session for session in sessions)
        assert all("status" in session for session in sessions)


class TestMemorySnapshotOperations:
    """Test memory snapshot operations."""

    def test_create_memory_snapshot(self, fenrir_database_service, test_session_id):
        """Test creating a memory snapshot."""
        # Create session first
        db_session_id = fenrir_database_service.create_profiling_session(
            session_id=test_session_id,
            session_type="memory",
            environment="test"
        )

        # Create snapshot
        snapshot_id = fenrir_database_service.create_memory_snapshot(
            profiling_session_id=db_session_id,
            timestamp=datetime.now(timezone.utc),
            context="test_snapshot",
            rss_mb=150.0,
            vms_mb=200.0,
            percent=25.5,
            available_mb=1000.0,
            tracemalloc_mb=10.0,
            gc_objects=1000
        )

        assert snapshot_id is not None
        assert isinstance(snapshot_id, str)
        uuid.UUID(snapshot_id)

    def test_create_memory_snapshot_invalid_session(self, fenrir_database_service):
        """Test creating memory snapshot with invalid session ID."""
        with pytest.raises(Exception):
            fenrir_database_service.create_memory_snapshot(
                profiling_session_id="invalid-session-id",
                timestamp=datetime.now(timezone.utc),
                context="test_snapshot",
                rss_mb=150.0,
                vms_mb=200.0,
                percent=25.5,
                available_mb=1000.0
            )

    def test_save_memory_snapshot(self, fenrir_database_service, test_session_id):
        """Test saving memory snapshot with session ID lookup."""
        # Create session first
        fenrir_database_service.create_profiling_session(
            session_id=test_session_id,
            session_type="memory",
            environment="test"
        )

        # Save snapshot
        snapshot_id = fenrir_database_service.save_memory_snapshot(
            profiling_session_id=test_session_id,
            context="test_snapshot",
            rss_mb=150.0,
            vms_mb=200.0,
            percent=25.5,
            available_mb=1000.0,
            tracemalloc_mb=10.0,
            gc_objects=1000
        )

        assert snapshot_id is not None
        assert isinstance(snapshot_id, str)
        uuid.UUID(snapshot_id)

    def test_get_memory_snapshots(self, fenrir_database_service, test_session_id):
        """Test retrieving memory snapshots for a session."""
        # Create session first
        db_session_id = fenrir_database_service.create_profiling_session(
            session_id=test_session_id,
            session_type="memory",
            environment="test"
        )

        # Create multiple snapshots
        for i in range(3):
            fenrir_database_service.create_memory_snapshot(
                profiling_session_id=db_session_id,
                timestamp=datetime.now(timezone.utc),
                context=f"snapshot_{i}",
                rss_mb=150.0 + i * 10,
                vms_mb=200.0 + i * 10,
                percent=25.5 + i,
                available_mb=1000.0
            )

        snapshots = fenrir_database_service.get_memory_snapshots(test_session_id)
        assert len(snapshots) == 3
        assert all("context" in snapshot for snapshot in snapshots)
        assert all("rss_mb" in snapshot for snapshot in snapshots)


class TestProfilingResultOperations:
    """Test profiling result operations."""

    def test_create_profiling_result(self, fenrir_database_service, test_session_id):
        """Test creating a profiling result."""
        # Create session first
        db_session_id = fenrir_database_service.create_profiling_session(
            session_id=test_session_id,
            session_type="memory",
            environment="test"
        )

        # Create result
        result_id = fenrir_database_service.create_profiling_result(
            profiling_session_id=db_session_id,
            category="memory",
            severity="high",
            issue="High memory usage detected",
            recommendation="Implement memory optimization",
            memory_impact_mb=100.0,
            performance_impact="significant"
        )

        assert result_id is not None
        assert isinstance(result_id, str)
        uuid.UUID(result_id)

    def test_save_profiling_result(self, fenrir_database_service, test_session_id):
        """Test saving profiling result with session ID lookup."""
        # Create session first
        fenrir_database_service.create_profiling_session(
            session_id=test_session_id,
            session_type="memory",
            environment="test"
        )

        # Save result
        result_id = fenrir_database_service.save_profiling_result(
            profiling_session_id=test_session_id,
            category="memory",
            severity="high",
            issue="High memory usage detected",
            recommendation="Implement memory optimization",
            memory_impact_mb=100.0,
            performance_impact="significant"
        )

        assert result_id is not None
        assert isinstance(result_id, str)
        uuid.UUID(result_id)

    def test_get_profiling_results(self, fenrir_database_service, test_session_id):
        """Test retrieving profiling results for a session."""
        # Create session first
        db_session_id = fenrir_database_service.create_profiling_session(
            session_id=test_session_id,
            session_type="memory",
            environment="test"
        )

        # Create multiple results
        for i in range(2):
            fenrir_database_service.create_profiling_result(
                profiling_session_id=db_session_id,
                category="memory",
                severity="high",
                issue=f"Issue {i}",
                recommendation=f"Recommendation {i}",
                memory_impact_mb=100.0 + i * 10,
                performance_impact="significant"
            )

        results = fenrir_database_service.get_profiling_results(test_session_id)
        assert len(results) == 2
        assert all("category" in result for result in results)
        assert all("severity" in result for result in results)
        assert all("issue" in result for result in results)


class TestDatabaseConnectionLogging:
    """Test database connection logging functionality."""

    def test_log_database_connection(self, fenrir_database_service, test_session_id):
        """Test logging database connection."""
        # Create session first
        db_session_id = fenrir_database_service.create_profiling_session(
            session_id=test_session_id,
            session_type="memory",
            environment="test"
        )

        # Log connection
        log_id = fenrir_database_service.log_database_connection(
            profiling_session_id=db_session_id,
            database_name="test_db",
            connection_type="read",
            operation="query",
            query_text="SELECT * FROM test",
            execution_time_ms=50.0,
            rows_affected=10
        )

        assert log_id is not None
        assert isinstance(log_id, str)
        uuid.UUID(log_id)

    def test_log_database_connection_with_session_id(self, fenrir_database_service, test_session_id):
        """Test logging database connection with session ID lookup."""
        # Create session first
        fenrir_database_service.create_profiling_session(
            session_id=test_session_id,
            session_type="memory",
            environment="test"
        )

        # Log connection
        log_id = fenrir_database_service.log_database_connection(
            profiling_session_id=test_session_id,
            database_name="test_db",
            connection_type="read",
            operation="query",
            query_text="SELECT * FROM test",
            execution_time_ms=50.0,
            rows_affected=10
        )

        assert log_id is not None
        assert isinstance(log_id, str)
        uuid.UUID(log_id)


class TestServiceStartupLogging:
    """Test service startup logging functionality."""

    def test_log_service_startup(self, fenrir_database_service, test_session_id):
        """Test logging service startup."""
        # Create session first
        db_session_id = fenrir_database_service.create_profiling_session(
            session_id=test_session_id,
            session_type="memory",
            environment="test"
        )

        # Log startup
        log_id = fenrir_database_service.log_service_startup(
            profiling_session_id=db_session_id,
            service_name="test_service",
            service_type="ai",
            startup_phase="init",
            duration_ms=100.0,
            memory_usage_mb=50.0,
            cpu_usage_percent=25.0,
            status="success"
        )

        assert log_id is not None
        assert isinstance(log_id, str)
        uuid.UUID(log_id)

    def test_log_service_startup_with_session_id(self, fenrir_database_service, test_session_id):
        """Test logging service startup with session ID lookup."""
        # Create session first
        fenrir_database_service.create_profiling_session(
            session_id=test_session_id,
            session_type="memory",
            environment="test"
        )

        # Log startup
        log_id = fenrir_database_service.log_service_startup(
            profiling_session_id=test_session_id,
            service_name="test_service",
            service_type="ai",
            startup_phase="init",
            duration_ms=100.0,
            memory_usage_mb=50.0,
            cpu_usage_percent=25.0,
            status="success"
        )

        assert log_id is not None
        assert isinstance(log_id, str)
        uuid.UUID(log_id)


class TestErrorHandling:
    """Test error handling and edge cases."""

    def test_database_service_without_env_var(self):
        """Test database service initialization without E2E_DATABASE_URL."""
        with patch.dict('os.environ', {}, clear=True):
            with pytest.raises(ValueError, match="E2E_DATABASE_URL environment variable is required"):
                FenrirDatabaseService()

    def test_invalid_database_url(self):
        """Test database service with invalid database URL."""
        with patch.dict('os.environ', {'E2E_DATABASE_URL': 'invalid://url'}):
            with pytest.raises(Exception):
                FenrirDatabaseService()

    def test_session_cleanup_on_error(self, fenrir_database_service, test_session_id):
        """Test that sessions are properly cleaned up on error."""
        # Create session
        db_session_id = fenrir_database_service.create_profiling_session(
            session_id=test_session_id,
            session_type="memory",
            environment="test"
        )

        # Verify session exists
        session = fenrir_database_service.get_profiling_session(test_session_id)
        assert session is not None

        # Simulate error in session context
        with pytest.raises(Exception):
            with fenrir_database_service.get_session() as session:
                # Force an error
                raise Exception("Test error")

        # Session should still exist (error was in different context)
        session = fenrir_database_service.get_profiling_session(test_session_id)
        assert session is not None


class TestDataIntegrity:
    """Test data integrity and relationships."""

    def test_cascade_delete_snapshots(self, fenrir_database_service, test_session_id):
        """Test that memory snapshots are deleted when session is deleted."""
        # Create session
        db_session_id = fenrir_database_service.create_profiling_session(
            session_id=test_session_id,
            session_type="memory",
            environment="test"
        )

        # Create snapshot
        fenrir_database_service.create_memory_snapshot(
            profiling_session_id=db_session_id,
            timestamp=datetime.now(timezone.utc),
            context="test_snapshot",
            rss_mb=150.0,
            vms_mb=200.0,
            percent=25.5,
            available_mb=1000.0
        )

        # Verify snapshot exists
        snapshots = fenrir_database_service.get_memory_snapshots(test_session_id)
        assert len(snapshots) == 1

        # Delete session (this should cascade delete snapshots)
        with fenrir_database_service.get_session() as session:
            from app.models.fenrir_profiling import ProfilingSession
            db_session = session.query(ProfilingSession).filter_by(session_id=test_session_id).first()
            if db_session:
                session.delete(db_session)

        # Verify snapshots are gone
        snapshots = fenrir_database_service.get_memory_snapshots(test_session_id)
        assert len(snapshots) == 0

    def test_cascade_delete_results(self, fenrir_database_service, test_session_id):
        """Test that profiling results are deleted when session is deleted."""
        # Create session
        db_session_id = fenrir_database_service.create_profiling_session(
            session_id=test_session_id,
            session_type="memory",
            environment="test"
        )

        # Create result
        fenrir_database_service.create_profiling_result(
            profiling_session_id=db_session_id,
            category="memory",
            severity="high",
            issue="Test issue",
            recommendation="Test recommendation",
            memory_impact_mb=100.0,
            performance_impact="significant"
        )

        # Verify result exists
        results = fenrir_database_service.get_profiling_results(test_session_id)
        assert len(results) == 1

        # Delete session (this should cascade delete results)
        with fenrir_database_service.get_session() as session:
            from app.models.fenrir_profiling import ProfilingSession
            db_session = session.query(ProfilingSession).filter_by(session_id=test_session_id).first()
            if db_session:
                session.delete(db_session)

        # Verify results are gone
        results = fenrir_database_service.get_profiling_results(test_session_id)
        assert len(results) == 0


if __name__ == "__main__":
    pytest.main([__file__])
