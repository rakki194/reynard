"""Fenrir Database Service

🦊 *whiskers twitch with strategic precision* Database integration service for
Fenrir profiling and exploit session data storage using the reynard_e2e database.

This module provides:
- Database connection management using E2E_DATABASE_URL
- Profiling session persistence
- Memory snapshot storage
- Exploit session tracking
- Database debugging and connection monitoring

Author: Strategic-Fox-42 (Reynard Fox Specialist)
Version: 1.0.0
"""

import os
import logging
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from contextlib import contextmanager

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.exc import SQLAlchemyError

# Add backend path for imports
import sys
from pathlib import Path
backend_path = Path(__file__).parent.parent.parent / "backend"
if str(backend_path) not in sys.path:
    sys.path.insert(0, str(backend_path))

from app.models.fenrir_profiling import (
    ProfilingSession as DBProfilingSession,
    MemorySnapshot as DBMemorySnapshot,
    ProfilingResult as DBProfilingResult,
    ExploitSession as DBExploitSession,
    ExploitAttempt as DBExploitAttempt,
    DatabaseConnectionLog as DBDatabaseConnectionLog,
    ServiceStartupLog as DBServiceStartupLog
)

logger = logging.getLogger(__name__)


class FenrirDatabaseService:
    """Database service for Fenrir profiling and exploit session data."""

    def __init__(self):
        """Initialize the database service."""
        self.engine = None
        self.SessionLocal = None
        self._initialize_database()

    def _initialize_database(self):
        """Initialize database connection using E2E_DATABASE_URL."""
        try:
            # Use E2E_DATABASE_URL from environment
            database_url = os.getenv("E2E_DATABASE_URL")
            if not database_url:
                raise ValueError("E2E_DATABASE_URL environment variable is required")

            # Create engine with connection pooling
            self.engine = create_engine(
                database_url,
                echo=False,  # Set to True for SQL debugging
                pool_size=5,
                max_overflow=10,
                pool_timeout=30,
                pool_recycle=3600,
                pool_pre_ping=True,
                future=True,
            )

            # Create session factory
            self.SessionLocal = sessionmaker(
                autocommit=False,
                autoflush=False,
                bind=self.engine
            )

            logger.info("Fenrir database service initialized successfully")

        except Exception as e:
            logger.error(f"Failed to initialize Fenrir database service: {e}")
            raise

    @contextmanager
    def get_session(self) -> Session:
        """Get a database session with automatic cleanup."""
        session = self.SessionLocal()
        try:
            yield session
            session.commit()
        except Exception as e:
            session.rollback()
            logger.error(f"Database session error: {e}")
            raise
        finally:
            session.close()

    def test_connection(self) -> bool:
        """Test database connection."""
        try:
            with self.engine.connect() as connection:
                connection.execute(text("SELECT 1"))
            logger.info("Database connection test successful")
            return True
        except Exception as e:
            logger.error(f"Database connection test failed: {e}")
            return False

    # Profiling Session Methods

    def create_profiling_session(
        self,
        session_id: str,
        session_type: str,
        environment: str = "development"
    ) -> str:
        """Create a new profiling session."""
        try:
            with self.get_session() as session:
                db_session = DBProfilingSession(
                    session_id=session_id,
                    session_type=session_type,
                    environment=environment,
                    started_at=datetime.now(timezone.utc),
                    status="running"
                )
                session.add(db_session)
                session.flush()
                return str(db_session.id)
        except SQLAlchemyError as e:
            logger.error(f"Failed to create profiling session: {e}")
            raise

    def update_profiling_session(
        self,
        session_id: str,
        status: str = "completed",
        completed_at: Optional[datetime] = None,
        duration_seconds: Optional[float] = None,
        total_snapshots: int = 0,
        issues_found: int = 0,
        peak_memory_mb: Optional[float] = None,
        final_memory_mb: Optional[float] = None,
        memory_delta_mb: Optional[float] = None,
        backend_analysis: Optional[Dict[str, Any]] = None,
        database_analysis: Optional[Dict[str, Any]] = None,
        service_analysis: Optional[Dict[str, Any]] = None
    ) -> bool:
        """Update a profiling session with results."""
        try:
            with self.get_session() as session:
                db_session = session.query(DBProfilingSession).filter_by(
                    session_id=session_id
                ).first()

                if not db_session:
                    logger.warning(f"Profiling session {session_id} not found")
                    return False

                db_session.status = status
                db_session.completed_at = completed_at or datetime.now(timezone.utc)
                db_session.duration_seconds = duration_seconds
                db_session.total_snapshots = total_snapshots
                db_session.issues_found = issues_found
                db_session.peak_memory_mb = peak_memory_mb
                db_session.final_memory_mb = final_memory_mb
                db_session.memory_delta_mb = memory_delta_mb
                db_session.backend_analysis = backend_analysis
                db_session.database_analysis = database_analysis
                db_session.service_analysis = service_analysis
                db_session.updated_at = datetime.now(timezone.utc)

                return True
        except SQLAlchemyError as e:
            logger.error(f"Failed to update profiling session: {e}")
            raise

    def get_profiling_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Get a profiling session by ID."""
        try:
            with self.get_session() as session:
                db_session = session.query(DBProfilingSession).filter_by(
                    session_id=session_id
                ).first()

                if not db_session:
                    return None

                return {
                    "id": str(db_session.id),
                    "session_id": db_session.session_id,
                    "session_type": db_session.session_type,
                    "environment": db_session.environment,
                    "started_at": db_session.started_at.isoformat(),
                    "completed_at": db_session.completed_at.isoformat() if db_session.completed_at else None,
                    "status": db_session.status,
                    "duration_seconds": db_session.duration_seconds,
                    "total_snapshots": db_session.total_snapshots,
                    "issues_found": db_session.issues_found,
                    "peak_memory_mb": db_session.peak_memory_mb,
                    "final_memory_mb": db_session.final_memory_mb,
                    "memory_delta_mb": db_session.memory_delta_mb,
                    "backend_analysis": db_session.backend_analysis,
                    "database_analysis": db_session.database_analysis,
                    "service_analysis": db_session.service_analysis,
                    "metadata": db_session.meta_data,
                    "created_at": db_session.created_at.isoformat(),
                    "updated_at": db_session.updated_at.isoformat()
                }
        except SQLAlchemyError as e:
            logger.error(f"Failed to get profiling session: {e}")
            raise

    # Memory Snapshot Methods

    def create_memory_snapshot(
        self,
        profiling_session_id: str,
        timestamp: datetime,
        context: str,
        rss_mb: float,
        vms_mb: float,
        percent: float,
        available_mb: float,
        tracemalloc_mb: float = 0.0,
        gc_objects: int = 0,
        metadata: Optional[Dict[str, Any]] = None
    ) -> str:
        """Create a memory snapshot with specific timestamp."""
        try:
            with self.get_session() as session:
                snapshot = DBMemorySnapshot(
                    profiling_session_id=profiling_session_id,
                    timestamp=timestamp,
                    context=context,
                    rss_mb=rss_mb,
                    vms_mb=vms_mb,
                    percent=percent,
                    available_mb=available_mb,
                    tracemalloc_mb=tracemalloc_mb,
                    gc_objects=gc_objects,
                    meta_data=metadata
                )
                session.add(snapshot)
                session.flush()
                return str(snapshot.id)
        except SQLAlchemyError as e:
            logger.error(f"Failed to create memory snapshot: {e}")
            raise

    def save_memory_snapshot(
        self,
        profiling_session_id: str,
        context: str,
        rss_mb: float,
        vms_mb: float,
        percent: float,
        available_mb: float,
        tracemalloc_mb: float = 0.0,
        gc_objects: int = 0,
        metadata: Optional[Dict[str, Any]] = None
    ) -> str:
        """Save a memory snapshot."""
        try:
            with self.get_session() as session:
                # Get the profiling session ID
                db_profiling_session = session.query(DBProfilingSession).filter_by(
                    session_id=profiling_session_id
                ).first()

                if not db_profiling_session:
                    raise ValueError(f"Profiling session {profiling_session_id} not found")

                snapshot = DBMemorySnapshot(
                    profiling_session_id=db_profiling_session.id,
                    timestamp=datetime.now(timezone.utc),
                    context=context,
                    rss_mb=rss_mb,
                    vms_mb=vms_mb,
                    percent=percent,
                    available_mb=available_mb,
                    tracemalloc_mb=tracemalloc_mb,
                    gc_objects=gc_objects,
                    meta_data=metadata
                )
                session.add(snapshot)
                session.flush()
                return str(snapshot.id)
        except SQLAlchemyError as e:
            logger.error(f"Failed to save memory snapshot: {e}")
            raise

    def get_memory_snapshots(self, profiling_session_id: str) -> List[Dict[str, Any]]:
        """Get all memory snapshots for a profiling session."""
        try:
            with self.get_session() as session:
                db_profiling_session = session.query(DBProfilingSession).filter_by(
                    session_id=profiling_session_id
                ).first()

                if not db_profiling_session:
                    return []

                snapshots = session.query(DBMemorySnapshot).filter_by(
                    profiling_session_id=db_profiling_session.id
                ).order_by(DBMemorySnapshot.timestamp).all()

                return [
                    {
                        "id": str(snapshot.id),
                        "timestamp": snapshot.timestamp.isoformat(),
                        "context": snapshot.context,
                        "rss_mb": snapshot.rss_mb,
                        "vms_mb": snapshot.vms_mb,
                        "percent": snapshot.percent,
                        "available_mb": snapshot.available_mb,
                        "tracemalloc_mb": snapshot.tracemalloc_mb,
                        "gc_objects": snapshot.gc_objects,
                        "metadata": snapshot.meta_data,
                        "created_at": snapshot.created_at.isoformat()
                    }
                    for snapshot in snapshots
                ]
        except SQLAlchemyError as e:
            logger.error(f"Failed to get memory snapshots: {e}")
            raise

    # Profiling Result Methods

    def create_profiling_result(
        self,
        profiling_session_id: str,
        category: str,
        severity: str,
        issue: str,
        recommendation: str,
        memory_impact_mb: float = 0.0,
        performance_impact: str = "unknown",
        metadata: Optional[Dict[str, Any]] = None
    ) -> str:
        """Create a profiling result with direct session ID."""
        try:
            with self.get_session() as session:
                result = DBProfilingResult(
                    profiling_session_id=profiling_session_id,
                    category=category,
                    severity=severity,
                    issue=issue,
                    recommendation=recommendation,
                    memory_impact_mb=memory_impact_mb,
                    performance_impact=performance_impact,
                    meta_data=metadata
                )
                session.add(result)
                session.flush()
                return str(result.id)
        except SQLAlchemyError as e:
            logger.error(f"Failed to create profiling result: {e}")
            raise

    def save_profiling_result(
        self,
        profiling_session_id: str,
        category: str,
        severity: str,
        issue: str,
        recommendation: str,
        memory_impact_mb: float = 0.0,
        performance_impact: str = "unknown",
        metadata: Optional[Dict[str, Any]] = None
    ) -> str:
        """Save a profiling result."""
        try:
            with self.get_session() as session:
                db_profiling_session = session.query(DBProfilingSession).filter_by(
                    session_id=profiling_session_id
                ).first()

                if not db_profiling_session:
                    raise ValueError(f"Profiling session {profiling_session_id} not found")

                result = DBProfilingResult(
                    profiling_session_id=db_profiling_session.id,
                    category=category,
                    severity=severity,
                    issue=issue,
                    recommendation=recommendation,
                    memory_impact_mb=memory_impact_mb,
                    performance_impact=performance_impact,
                    meta_data=metadata
                )
                session.add(result)
                session.flush()
                return str(result.id)
        except SQLAlchemyError as e:
            logger.error(f"Failed to save profiling result: {e}")
            raise

    def get_profiling_results(self, profiling_session_id: str) -> List[Dict[str, Any]]:
        """Get all profiling results for a session."""
        try:
            with self.get_session() as session:
                db_profiling_session = session.query(DBProfilingSession).filter_by(
                    session_id=profiling_session_id
                ).first()

                if not db_profiling_session:
                    return []

                results = session.query(DBProfilingResult).filter_by(
                    profiling_session_id=db_profiling_session.id
                ).all()

                return [
                    {
                        "id": str(result.id),
                        "category": result.category,
                        "severity": result.severity,
                        "issue": result.issue,
                        "recommendation": result.recommendation,
                        "memory_impact_mb": result.memory_impact_mb,
                        "performance_impact": result.performance_impact,
                        "metadata": result.meta_data,
                        "created_at": result.created_at.isoformat()
                    }
                    for result in results
                ]
        except SQLAlchemyError as e:
            logger.error(f"Failed to get profiling results: {e}")
            raise

    # Database Connection Logging

    def log_database_connection(
        self,
        profiling_session_id: Optional[str],
        database_name: str,
        connection_type: str,
        operation: str,
        query_text: Optional[str] = None,
        execution_time_ms: Optional[float] = None,
        rows_affected: Optional[int] = None,
        connection_pool_size: Optional[int] = None,
        active_connections: Optional[int] = None,
        error_message: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> str:
        """Log a database connection event."""
        try:
            with self.get_session() as session:
                # Get profiling session ID if provided
                db_profiling_session_id = None
                if profiling_session_id:
                    db_profiling_session = session.query(DBProfilingSession).filter_by(
                        session_id=profiling_session_id
                    ).first()
                    if db_profiling_session:
                        db_profiling_session_id = db_profiling_session.id

                log_entry = DBDatabaseConnectionLog(
                    profiling_session_id=db_profiling_session_id,
                    database_name=database_name,
                    connection_type=connection_type,
                    operation=operation,
                    query_text=query_text,
                    execution_time_ms=execution_time_ms,
                    rows_affected=rows_affected,
                    connection_pool_size=connection_pool_size,
                    active_connections=active_connections,
                    error_message=error_message,
                    timestamp=datetime.now(timezone.utc),
                    meta_data=metadata
                )
                session.add(log_entry)
                session.flush()
                return str(log_entry.id)
        except SQLAlchemyError as e:
            logger.error(f"Failed to log database connection: {e}")
            raise

    # Service Startup Logging

    def log_service_startup(
        self,
        profiling_session_id: Optional[str],
        service_name: str,
        service_type: str,
        startup_phase: str,
        duration_ms: Optional[float] = None,
        memory_usage_mb: Optional[float] = None,
        cpu_usage_percent: Optional[float] = None,
        status: str = "success",
        error_message: Optional[str] = None,
        dependencies: Optional[List[str]] = None,
        configuration: Optional[Dict[str, Any]] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> str:
        """Log a service startup event."""
        try:
            with self.get_session() as session:
                # Get profiling session ID if provided
                db_profiling_session_id = None
                if profiling_session_id:
                    db_profiling_session = session.query(DBProfilingSession).filter_by(
                        session_id=profiling_session_id
                    ).first()
                    if db_profiling_session:
                        db_profiling_session_id = db_profiling_session.id

                log_entry = DBServiceStartupLog(
                    profiling_session_id=db_profiling_session_id,
                    service_name=service_name,
                    service_type=service_type,
                    startup_phase=startup_phase,
                    duration_ms=duration_ms,
                    memory_usage_mb=memory_usage_mb,
                    cpu_usage_percent=cpu_usage_percent,
                    status=status,
                    error_message=error_message,
                    dependencies=dependencies,
                    configuration=configuration,
                    timestamp=datetime.now(timezone.utc),
                    meta_data=metadata
                )
                session.add(log_entry)
                session.flush()
                return str(log_entry.id)
        except SQLAlchemyError as e:
            logger.error(f"Failed to log service startup: {e}")
            raise

    # Utility Methods

    def get_recent_sessions(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Get recent profiling sessions."""
        try:
            with self.get_session() as session:
                sessions = session.query(DBProfilingSession).order_by(
                    DBProfilingSession.started_at.desc()
                ).limit(limit).all()

                return [
                    {
                        "id": str(session.id),
                        "session_id": session.session_id,
                        "session_type": session.session_type,
                        "environment": session.environment,
                        "started_at": session.started_at.isoformat(),
                        "completed_at": session.completed_at.isoformat() if session.completed_at else None,
                        "status": session.status,
                        "duration_seconds": session.duration_seconds,
                        "total_snapshots": session.total_snapshots,
                        "issues_found": session.issues_found
                    }
                    for session in sessions
                ]
        except SQLAlchemyError as e:
            logger.error(f"Failed to get recent sessions: {e}")
            raise

    def cleanup_old_sessions(self, days_old: int = 30) -> int:
        """Clean up old profiling sessions."""
        try:
            cutoff_date = datetime.now(timezone.utc) - timedelta(days=days_old)

            with self.get_session() as session:
                # Count sessions to be deleted
                count = session.query(DBProfilingSession).filter(
                    DBProfilingSession.started_at < cutoff_date
                ).count()

                # Delete old sessions (cascade will handle related records)
                session.query(DBProfilingSession).filter(
                    DBProfilingSession.started_at < cutoff_date
                ).delete()

                logger.info(f"Cleaned up {count} old profiling sessions")
                return count
        except SQLAlchemyError as e:
            logger.error(f"Failed to cleanup old sessions: {e}")
            raise


# Global database service instance
_db_service: Optional[FenrirDatabaseService] = None


def get_database_service() -> FenrirDatabaseService:
    """Get the global database service instance."""
    global _db_service
    if _db_service is None:
        _db_service = FenrirDatabaseService()
    return _db_service
