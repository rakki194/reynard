"""Testing Ecosystem Database Models

🦊 *whiskers twitch with systematic precision* Comprehensive SQLAlchemy models for
unified testing, benchmarking, and tracing data storage in PostgreSQL.

This module provides models for:
- Test runs and individual test results
- Benchmark and performance data
- Trace and coverage information
- Test artifacts and generated reports

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
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import relationship, Mapped, mapped_column
from sqlalchemy.sql import func

Base = declarative_base()


class Run(Base):
    """Core table for all test executions across the ecosystem."""

    __tablename__ = 'test_runs'
    
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    run_id: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    test_type: Mapped[str] = mapped_column(String(50), nullable=False, index=True)  # e2e, benchmark, performance, etc.
    test_suite: Mapped[str] = mapped_column(String(100), nullable=False)  # specific test suite name
    environment: Mapped[str] = mapped_column(String(50), nullable=False, index=True)  # development, staging, production
    branch: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    commit_hash: Mapped[Optional[str]] = mapped_column(String(40), nullable=True)
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    status: Mapped[str] = mapped_column(String(20), nullable=False, index=True)  # running, completed, failed, cancelled
    total_tests: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    passed_tests: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    failed_tests: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    skipped_tests: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    success_rate: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    duration_seconds: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    meta_data: Mapped[Optional[Dict[str, Any]]] = mapped_column("metadata", JSONB, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    
    # Relationships
    test_results: Mapped[List["Result"]] = relationship("Result", back_populates="test_run", cascade="all, delete-orphan")
    benchmark_results: Mapped[List["BenchmarkResult"]] = relationship("BenchmarkResult", back_populates="test_run", cascade="all, delete-orphan")
    performance_metrics: Mapped[List["PerformanceMetric"]] = relationship("PerformanceMetric", back_populates="test_run", cascade="all, delete-orphan")
    trace_data: Mapped[List["TraceData"]] = relationship("TraceData", back_populates="test_run", cascade="all, delete-orphan")
    coverage_data: Mapped[List["CoverageData"]] = relationship("CoverageData", back_populates="test_run", cascade="all, delete-orphan")
    test_artifacts: Mapped[List["Artifact"]] = relationship("Artifact", back_populates="test_run", cascade="all, delete-orphan")
    test_reports: Mapped[List["Report"]] = relationship("Report", back_populates="test_run", cascade="all, delete-orphan")
    
    __table_args__ = (
        Index('idx_test_runs_type_status', 'test_type', 'status'),
        Index('idx_test_runs_started_at', 'started_at'),
        Index('idx_test_runs_environment', 'environment'),
        CheckConstraint("status IN ('running', 'completed', 'failed', 'cancelled')", name='ck_test_runs_status'),
        CheckConstraint("success_rate >= 0 AND success_rate <= 100", name='ck_test_runs_success_rate'),
    )


class Result(Base):
    """Individual test results within a test run."""

    __tablename__ = 'test_results'
    
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    test_run_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey('test_runs.id', ondelete='CASCADE'), nullable=False, index=True)
    test_name: Mapped[str] = mapped_column(String(200), nullable=False, index=True)
    test_file: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    test_class: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    test_method: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    status: Mapped[str] = mapped_column(String(20), nullable=False, index=True)  # passed, failed, skipped, error
    duration_ms: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    started_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    error_traceback: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    stdout: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    stderr: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    meta_data: Mapped[Optional[Dict[str, Any]]] = mapped_column("metadata", JSONB, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    
    # Relationships
    test_run: Mapped["Run"] = relationship("Run", back_populates="test_results")
    test_artifacts: Mapped[List["Artifact"]] = relationship("Artifact", back_populates="test_result", cascade="all, delete-orphan")
    
    __table_args__ = (
        Index('idx_test_results_run_id', 'test_run_id'),
        Index('idx_test_results_status', 'status'),
        Index('idx_test_results_name', 'test_name'),
        CheckConstraint("status IN ('passed', 'failed', 'skipped', 'error')", name='ck_test_results_status'),
    )


class BenchmarkResult(Base):
    """Benchmark and performance testing results."""
    
    __tablename__ = 'benchmark_results'
    
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    test_run_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey('test_runs.id', ondelete='CASCADE'), nullable=False, index=True)
    benchmark_name: Mapped[str] = mapped_column(String(200), nullable=False, index=True)
    benchmark_type: Mapped[str] = mapped_column(String(50), nullable=False, index=True)  # load_test, performance, stress
    endpoint: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    method: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)
    total_requests: Mapped[int] = mapped_column(Integer, nullable=False)
    successful_requests: Mapped[int] = mapped_column(Integer, nullable=False)
    failed_requests: Mapped[int] = mapped_column(Integer, nullable=False)
    avg_response_time_ms: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    median_response_time_ms: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    p95_response_time_ms: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    p99_response_time_ms: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    min_response_time_ms: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    max_response_time_ms: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    requests_per_second: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    error_rate_percent: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    concurrent_users: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    duration_seconds: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    peak_memory_mb: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    peak_cpu_percent: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    status_codes: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSONB, nullable=True)
    errors: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSONB, nullable=True)
    meta_data: Mapped[Optional[Dict[str, Any]]] = mapped_column("metadata", JSONB, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    
    # Relationships
    test_run: Mapped["Run"] = relationship("Run", back_populates="benchmark_results")
    performance_metrics: Mapped[List["PerformanceMetric"]] = relationship("PerformanceMetric", back_populates="benchmark_result", cascade="all, delete-orphan")
    
    __table_args__ = (
        Index('idx_benchmark_results_run_id', 'test_run_id'),
        Index('idx_benchmark_results_type', 'benchmark_type'),
        Index('idx_benchmark_results_name', 'benchmark_name'),
        CheckConstraint("benchmark_type IN ('load_test', 'performance', 'stress', 'endurance')", name='ck_benchmark_results_type'),
        CheckConstraint("error_rate_percent >= 0 AND error_rate_percent <= 100", name='ck_benchmark_results_error_rate'),
    )


class PerformanceMetric(Base):
    """Detailed performance metrics and measurements."""
    
    __tablename__ = 'performance_metrics'
    
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    test_run_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey('test_runs.id', ondelete='CASCADE'), nullable=False, index=True)
    benchmark_result_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey('benchmark_results.id', ondelete='CASCADE'), nullable=True)
    metric_name: Mapped[str] = mapped_column(String(100), nullable=False)
    metric_type: Mapped[str] = mapped_column(String(50), nullable=False, index=True)  # response_time, memory, cpu, throughput
    value: Mapped[float] = mapped_column(Float, nullable=False)
    unit: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)  # ms, mb, percent, req/s
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)
    meta_data: Mapped[Optional[Dict[str, Any]]] = mapped_column("metadata", JSONB, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    
    # Relationships
    test_run: Mapped["Run"] = relationship("Run", back_populates="performance_metrics")
    benchmark_result: Mapped[Optional["BenchmarkResult"]] = relationship("BenchmarkResult", back_populates="performance_metrics")
    
    __table_args__ = (
        Index('idx_performance_metrics_run_id', 'test_run_id'),
        Index('idx_performance_metrics_type', 'metric_type'),
        Index('idx_performance_metrics_timestamp', 'timestamp'),
        CheckConstraint("metric_type IN ('response_time', 'memory', 'cpu', 'throughput', 'latency', 'bandwidth')", name='ck_performance_metrics_type'),
    )


class TraceData(Base):
    """Execution traces and detailed debugging information."""
    
    __tablename__ = 'trace_data'
    
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    test_run_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey('test_runs.id', ondelete='CASCADE'), nullable=False, index=True)
    trace_id: Mapped[str] = mapped_column(String(100), nullable=False)
    trace_type: Mapped[str] = mapped_column(String(50), nullable=False, index=True)  # playwright, performance, custom
    trace_name: Mapped[str] = mapped_column(String(200), nullable=False)
    trace_data: Mapped[Dict[str, Any]] = mapped_column(JSONB, nullable=False)
    trace_size_bytes: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    duration_ms: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    meta_data: Mapped[Optional[Dict[str, Any]]] = mapped_column("metadata", JSONB, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    
    # Relationships
    test_run: Mapped["Run"] = relationship("Run", back_populates="trace_data")
    
    __table_args__ = (
        Index('idx_trace_data_run_id', 'test_run_id'),
        Index('idx_trace_data_type', 'trace_type'),
        CheckConstraint("trace_type IN ('playwright', 'performance', 'custom', 'network', 'browser')", name='ck_trace_data_type'),
    )


class CoverageData(Base):
    """Code coverage information and metrics."""
    
    __tablename__ = 'coverage_data'
    
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    test_run_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey('test_runs.id', ondelete='CASCADE'), nullable=False, index=True)
    file_path: Mapped[str] = mapped_column(String(1000), nullable=False, index=True)
    file_type: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)  # py, ts, js, etc.
    lines_total: Mapped[int] = mapped_column(Integer, nullable=False)
    lines_covered: Mapped[int] = mapped_column(Integer, nullable=False)
    lines_missing: Mapped[int] = mapped_column(Integer, nullable=False)
    branches_total: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    branches_covered: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    branches_missing: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    functions_total: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    functions_covered: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    functions_missing: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    coverage_percent: Mapped[float] = mapped_column(Float, nullable=False)
    coverage_data: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSONB, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    
    # Relationships
    test_run: Mapped["Run"] = relationship("Run", back_populates="coverage_data")
    
    __table_args__ = (
        Index('idx_coverage_data_run_id', 'test_run_id'),
        Index('idx_coverage_data_file_path', 'file_path'),
        CheckConstraint("coverage_percent >= 0 AND coverage_percent <= 100", name='ck_coverage_data_percent'),
        CheckConstraint("lines_total >= 0", name='ck_coverage_data_lines_total'),
        CheckConstraint("lines_covered >= 0", name='ck_coverage_data_lines_covered'),
    )


class Artifact(Base):
    """Test artifacts like screenshots, videos, logs, and reports."""
    
    __tablename__ = 'test_artifacts'
    
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    test_run_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey('test_runs.id', ondelete='CASCADE'), nullable=False, index=True)
    test_result_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey('test_results.id', ondelete='CASCADE'), nullable=True)
    artifact_type: Mapped[str] = mapped_column(String(50), nullable=False, index=True)  # screenshot, video, log, report
    artifact_name: Mapped[str] = mapped_column(String(200), nullable=False)
    file_path: Mapped[Optional[str]] = mapped_column(String(1000), nullable=True)
    file_size_bytes: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    mime_type: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    artifact_data: Mapped[Optional[bytes]] = mapped_column(BYTEA, nullable=True)  # Store binary data
    meta_data: Mapped[Optional[Dict[str, Any]]] = mapped_column("metadata", JSONB, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    
    # Relationships
    test_run: Mapped["Run"] = relationship("Run", back_populates="test_artifacts")
    test_result: Mapped[Optional["Result"]] = relationship("Result", back_populates="test_artifacts")
    
    __table_args__ = (
        Index('idx_test_artifacts_run_id', 'test_run_id'),
        Index('idx_test_artifacts_type', 'artifact_type'),
        CheckConstraint("artifact_type IN ('screenshot', 'video', 'log', 'report', 'trace', 'coverage', 'performance')", name='ck_test_artifacts_type'),
    )


class Report(Base):
    """Generated test reports and summaries."""
    
    __tablename__ = 'test_reports'
    
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    test_run_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey('test_runs.id', ondelete='CASCADE'), nullable=False, index=True)
    report_type: Mapped[str] = mapped_column(String(50), nullable=False, index=True)  # summary, detailed, performance, coverage
    report_format: Mapped[str] = mapped_column(String(20), nullable=False)  # json, html, markdown, text
    report_title: Mapped[str] = mapped_column(String(200), nullable=False)
    report_content: Mapped[str] = mapped_column(Text, nullable=False)
    report_size_bytes: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    generated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    meta_data: Mapped[Optional[Dict[str, Any]]] = mapped_column("metadata", JSONB, nullable=True)
    
    # Relationships
    test_run: Mapped["Run"] = relationship("Run", back_populates="test_reports")
    
    __table_args__ = (
        Index('idx_test_reports_run_id', 'test_run_id'),
        Index('idx_test_reports_type', 'report_type'),
        CheckConstraint("report_type IN ('summary', 'detailed', 'performance', 'coverage', 'benchmark', 'trace')", name='ck_test_reports_type'),
        CheckConstraint("report_format IN ('json', 'html', 'markdown', 'text', 'xml', 'csv')", name='ck_test_reports_format'),
    )
