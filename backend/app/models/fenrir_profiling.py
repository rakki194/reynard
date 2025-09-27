"""Fenrir Profiling and Exploit Session Database Models

🦊 *whiskers twitch with strategic precision* Comprehensive SQLAlchemy models for
Fenrir profiling, debugging, and exploit testing session data storage in PostgreSQL.

This module provides models for:
- Profiling sessions and memory snapshots
- Exploit testing sessions and results
- Performance metrics and analysis data
- Database debugging and connection monitoring
- Service tracking and startup analysis

Author: Strategic-Fox-42 (Reynard Fox Specialist)
Version: 1.0.0
"""

import uuid
from datetime import datetime
from typing import Optional, List, Dict, Any

from sqlalchemy import (
    Column, String, Integer, Float, DateTime, Text, Boolean, ForeignKey,
    Index, UniqueConstraint, CheckConstraint
)
from sqlalchemy.dialects.postgresql import UUID, JSONB, BYTEA
from sqlalchemy.orm import relationship, Mapped, mapped_column
from sqlalchemy.sql import func

from app.models.base import Base


class ProfilingSession(Base):
    """Core table for Fenrir profiling sessions."""

    __tablename__ = 'fenrir_profiling_sessions'
    
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    session_type: Mapped[str] = mapped_column(String(50), nullable=False, index=True)  # memory, startup, database, all
    environment: Mapped[str] = mapped_column(String(50), nullable=False, index=True)  # development, staging, production
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    status: Mapped[str] = mapped_column(String(20), nullable=False, index=True)  # running, completed, failed, cancelled
    duration_seconds: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    total_snapshots: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    issues_found: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    peak_memory_mb: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    final_memory_mb: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    memory_delta_mb: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    backend_analysis: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSONB, nullable=True)
    database_analysis: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSONB, nullable=True)
    service_analysis: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSONB, nullable=True)
    meta_data: Mapped[Optional[Dict[str, Any]]] = mapped_column("metadata", JSONB, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    
    # Relationships
    memory_snapshots: Mapped[List["MemorySnapshot"]] = relationship("MemorySnapshot", back_populates="profiling_session", cascade="all, delete-orphan")
    profiling_results: Mapped[List["ProfilingResult"]] = relationship("ProfilingResult", back_populates="profiling_session", cascade="all, delete-orphan")
    exploit_sessions: Mapped[List["ExploitSession"]] = relationship("ExploitSession", back_populates="profiling_session", cascade="all, delete-orphan")
    
    __table_args__ = (
        Index('idx_profiling_sessions_type_status', 'session_type', 'status'),
        Index('idx_profiling_sessions_started_at', 'started_at'),
        Index('idx_profiling_sessions_environment', 'environment'),
        CheckConstraint("status IN ('running', 'completed', 'failed', 'cancelled')", name='ck_profiling_sessions_status'),
        CheckConstraint("session_type IN ('memory', 'startup', 'database', 'all')", name='ck_profiling_sessions_type'),
    )


class MemorySnapshot(Base):
    """Memory usage snapshots during profiling sessions."""

    __tablename__ = 'fenrir_memory_snapshots'
    
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    profiling_session_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey('fenrir_profiling_sessions.id', ondelete='CASCADE'), nullable=False, index=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)
    context: Mapped[str] = mapped_column(String(100), nullable=False, index=True)  # analysis_start, startup_begin, etc.
    rss_mb: Mapped[float] = mapped_column(Float, nullable=False)  # Resident Set Size
    vms_mb: Mapped[float] = mapped_column(Float, nullable=False)  # Virtual Memory Size
    percent: Mapped[float] = mapped_column(Float, nullable=False)  # Memory usage percentage
    available_mb: Mapped[float] = mapped_column(Float, nullable=False)  # Available memory
    tracemalloc_mb: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)  # Tracemalloc memory
    gc_objects: Mapped[int] = mapped_column(Integer, nullable=False, default=0)  # Garbage collection objects
    meta_data: Mapped[Optional[Dict[str, Any]]] = mapped_column("metadata", JSONB, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    
    # Relationships
    profiling_session: Mapped["ProfilingSession"] = relationship("ProfilingSession", back_populates="memory_snapshots")
    
    __table_args__ = (
        Index('idx_memory_snapshots_session_id', 'profiling_session_id'),
        Index('idx_memory_snapshots_timestamp', 'timestamp'),
        Index('idx_memory_snapshots_context', 'context'),
    )


class ProfilingResult(Base):
    """Profiling analysis results and recommendations."""

    __tablename__ = 'fenrir_profiling_results'
    
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    profiling_session_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey('fenrir_profiling_sessions.id', ondelete='CASCADE'), nullable=False, index=True)
    category: Mapped[str] = mapped_column(String(50), nullable=False, index=True)  # memory, performance, database, service
    severity: Mapped[str] = mapped_column(String(20), nullable=False, index=True)  # low, medium, high, critical
    issue: Mapped[str] = mapped_column(Text, nullable=False)
    recommendation: Mapped[str] = mapped_column(Text, nullable=False)
    memory_impact_mb: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    performance_impact: Mapped[str] = mapped_column(String(50), nullable=False, default="unknown")
    meta_data: Mapped[Optional[Dict[str, Any]]] = mapped_column("metadata", JSONB, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    
    # Relationships
    profiling_session: Mapped["ProfilingSession"] = relationship("ProfilingSession", back_populates="profiling_results")
    
    __table_args__ = (
        Index('idx_profiling_results_session_id', 'profiling_session_id'),
        Index('idx_profiling_results_category', 'category'),
        Index('idx_profiling_results_severity', 'severity'),
        CheckConstraint("severity IN ('low', 'medium', 'high', 'critical')", name='ck_profiling_results_severity'),
        CheckConstraint("category IN ('memory', 'performance', 'database', 'service', 'startup', 'connection')", name='ck_profiling_results_category'),
    )


class ExploitSession(Base):
    """Exploit testing sessions and results."""

    __tablename__ = 'fenrir_exploit_sessions'
    
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    profiling_session_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey('fenrir_profiling_sessions.id', ondelete='CASCADE'), nullable=True, index=True)
    session_id: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    exploit_type: Mapped[str] = mapped_column(String(50), nullable=False, index=True)  # auth, sql_injection, xss, etc.
    target_url: Mapped[str] = mapped_column(String(500), nullable=False)
    target_endpoint: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    status: Mapped[str] = mapped_column(String(20), nullable=False, index=True)  # running, completed, failed, cancelled
    duration_seconds: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    total_requests: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    successful_requests: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    failed_requests: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    vulnerabilities_found: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    exploit_results: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSONB, nullable=True)
    meta_data: Mapped[Optional[Dict[str, Any]]] = mapped_column("metadata", JSONB, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    
    # Relationships
    profiling_session: Mapped[Optional["ProfilingSession"]] = relationship("ProfilingSession", back_populates="exploit_sessions")
    exploit_attempts: Mapped[List["ExploitAttempt"]] = relationship("ExploitAttempt", back_populates="exploit_session", cascade="all, delete-orphan")
    
    __table_args__ = (
        Index('idx_exploit_sessions_type_status', 'exploit_type', 'status'),
        Index('idx_exploit_sessions_started_at', 'started_at'),
        Index('idx_exploit_sessions_target_url', 'target_url'),
        CheckConstraint("status IN ('running', 'completed', 'failed', 'cancelled')", name='ck_exploit_sessions_status'),
        CheckConstraint("exploit_type IN ('auth', 'sql_injection', 'xss', 'path_traversal', 'command_injection', 'csrf', 'rate_limiting')", name='ck_exploit_sessions_type'),
    )


class ExploitAttempt(Base):
    """Individual exploit attempts within a session."""

    __tablename__ = 'fenrir_exploit_attempts'
    
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    exploit_session_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey('fenrir_exploit_sessions.id', ondelete='CASCADE'), nullable=False, index=True)
    attempt_number: Mapped[int] = mapped_column(Integer, nullable=False)
    payload: Mapped[str] = mapped_column(Text, nullable=False)
    method: Mapped[str] = mapped_column(String(10), nullable=False)  # GET, POST, PUT, DELETE
    headers: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSONB, nullable=True)
    response_status: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    response_headers: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSONB, nullable=True)
    response_body: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    response_time_ms: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    vulnerability_detected: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    vulnerability_type: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    vulnerability_details: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSONB, nullable=True)
    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)
    meta_data: Mapped[Optional[Dict[str, Any]]] = mapped_column("metadata", JSONB, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    
    # Relationships
    exploit_session: Mapped["ExploitSession"] = relationship("ExploitSession", back_populates="exploit_attempts")
    
    __table_args__ = (
        Index('idx_exploit_attempts_session_id', 'exploit_session_id'),
        Index('idx_exploit_attempts_timestamp', 'timestamp'),
        Index('idx_exploit_attempts_vulnerability', 'vulnerability_detected'),
        CheckConstraint("method IN ('GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS')", name='ck_exploit_attempts_method'),
    )


class DatabaseConnectionLog(Base):
    """Database connection monitoring and debugging logs."""

    __tablename__ = 'fenrir_database_connection_logs'
    
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    profiling_session_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey('fenrir_profiling_sessions.id', ondelete='CASCADE'), nullable=True, index=True)
    database_name: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    connection_type: Mapped[str] = mapped_column(String(50), nullable=False, index=True)  # read, write, admin
    operation: Mapped[str] = mapped_column(String(100), nullable=False)  # connect, query, disconnect, etc.
    query_text: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    execution_time_ms: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    rows_affected: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    connection_pool_size: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    active_connections: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)
    meta_data: Mapped[Optional[Dict[str, Any]]] = mapped_column("metadata", JSONB, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    
    # Relationships
    profiling_session: Mapped[Optional["ProfilingSession"]] = relationship("ProfilingSession")
    
    __table_args__ = (
        Index('idx_db_connection_logs_session_id', 'profiling_session_id'),
        Index('idx_db_connection_logs_database', 'database_name'),
        Index('idx_db_connection_logs_timestamp', 'timestamp'),
        CheckConstraint("connection_type IN ('read', 'write', 'admin', 'pool')", name='ck_db_connection_logs_type'),
    )


class ServiceStartupLog(Base):
    """Service startup and initialization monitoring logs."""

    __tablename__ = 'fenrir_service_startup_logs'
    
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    profiling_session_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey('fenrir_profiling_sessions.id', ondelete='CASCADE'), nullable=True, index=True)
    service_name: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    service_type: Mapped[str] = mapped_column(String(50), nullable=False, index=True)  # rag, ai, database, etc.
    startup_phase: Mapped[str] = mapped_column(String(50), nullable=False, index=True)  # init, config, connect, ready
    duration_ms: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    memory_usage_mb: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    cpu_usage_percent: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    status: Mapped[str] = mapped_column(String(20), nullable=False, index=True)  # success, failed, warning
    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    dependencies: Mapped[Optional[List[str]]] = mapped_column(JSONB, nullable=True)
    configuration: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSONB, nullable=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)
    meta_data: Mapped[Optional[Dict[str, Any]]] = mapped_column("metadata", JSONB, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    
    # Relationships
    profiling_session: Mapped[Optional["ProfilingSession"]] = relationship("ProfilingSession")
    
    __table_args__ = (
        Index('idx_service_startup_logs_session_id', 'profiling_session_id'),
        Index('idx_service_startup_logs_service', 'service_name'),
        Index('idx_service_startup_logs_timestamp', 'timestamp'),
        CheckConstraint("status IN ('success', 'failed', 'warning', 'timeout')", name='ck_service_startup_logs_status'),
        CheckConstraint("startup_phase IN ('init', 'config', 'connect', 'ready', 'error')", name='ck_service_startup_logs_phase'),
    )
