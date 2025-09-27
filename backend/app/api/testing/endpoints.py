"""Testing Ecosystem API Endpoints

🦊 *whiskers twitch with systematic precision* FastAPI endpoints for managing
all testing, benchmarking, and tracing data in the unified PostgreSQL database.

This module provides REST API endpoints for:
- Test run management and tracking
- Benchmark result storage and analysis
- Performance metrics collection
- Trace data management
- Coverage data storage
- Test artifact handling
- Report generation and storage

Author: Strategic-Fox-42 (Reynard Fox Specialist)
Version: 1.0.0
"""

import uuid
from datetime import datetime
from typing import Optional, List, Dict, Any
from pathlib import Path

from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field

from app.core.database_manager import get_e2e_session
from app.services.testing.testing_ecosystem_service import EcosystemService

router = APIRouter(prefix="/api/testing", tags=["testing"])


# Pydantic Models for API

class TestRunCreate(BaseModel):
    run_id: str
    test_type: str
    test_suite: str
    environment: str = "development"
    branch: Optional[str] = None
    commit_hash: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class TestRunUpdate(BaseModel):
    status: str
    total_tests: Optional[int] = None
    passed_tests: Optional[int] = None
    failed_tests: Optional[int] = None
    skipped_tests: Optional[int] = None


class TestResultCreate(BaseModel):
    test_run_id: uuid.UUID
    test_name: str
    status: str
    test_file: Optional[str] = None
    test_class: Optional[str] = None
    test_method: Optional[str] = None
    duration_ms: Optional[float] = None
    error_message: Optional[str] = None
    error_traceback: Optional[str] = None
    stdout: Optional[str] = None
    stderr: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class BenchmarkResultCreate(BaseModel):
    test_run_id: uuid.UUID
    benchmark_name: str
    benchmark_type: str
    total_requests: int
    successful_requests: int
    failed_requests: int
    endpoint: Optional[str] = None
    method: Optional[str] = None
    avg_response_time_ms: Optional[float] = None
    median_response_time_ms: Optional[float] = None
    p95_response_time_ms: Optional[float] = None
    p99_response_time_ms: Optional[float] = None
    min_response_time_ms: Optional[float] = None
    max_response_time_ms: Optional[float] = None
    requests_per_second: Optional[float] = None
    error_rate_percent: Optional[float] = None
    concurrent_users: Optional[int] = None
    duration_seconds: Optional[float] = None
    peak_memory_mb: Optional[float] = None
    peak_cpu_percent: Optional[float] = None
    status_codes: Optional[Dict[str, Any]] = None
    errors: Optional[Dict[str, Any]] = None
    metadata: Optional[Dict[str, Any]] = None


class PerformanceMetricCreate(BaseModel):
    test_run_id: uuid.UUID
    metric_name: str
    metric_type: str
    value: float
    unit: Optional[str] = None
    benchmark_result_id: Optional[uuid.UUID] = None
    timestamp: Optional[datetime] = None
    metadata: Optional[Dict[str, Any]] = None


class TraceDataCreate(BaseModel):
    test_run_id: uuid.UUID
    trace_id: str
    trace_type: str
    trace_name: str
    trace_data: Dict[str, Any]
    duration_ms: Optional[float] = None
    metadata: Optional[Dict[str, Any]] = None


class CoverageDataCreate(BaseModel):
    test_run_id: uuid.UUID
    file_path: str
    lines_total: int
    lines_covered: int
    lines_missing: int
    coverage_percent: float
    file_type: Optional[str] = None
    branches_total: Optional[int] = None
    branches_covered: Optional[int] = None
    branches_missing: Optional[int] = None
    functions_total: Optional[int] = None
    functions_covered: Optional[int] = None
    functions_missing: Optional[int] = None
    coverage_data: Optional[Dict[str, Any]] = None


class TestReportCreate(BaseModel):
    test_run_id: uuid.UUID
    report_type: str
    report_format: str
    report_title: str
    report_content: str
    metadata: Optional[Dict[str, Any]] = None


# Dependency injection
def get_testing_service(session: Session = Depends(get_e2e_session)) -> EcosystemService:
    return EcosystemService(session)


# Test Run Endpoints

@router.post("/test-runs", response_model=Dict[str, Any])
async def create_test_run(
    test_run_data: TestRunCreate,
    testing_service: EcosystemService = Depends(get_testing_service)
):
    """Create a new test run."""
    try:
        test_run = await testing_service.create_test_run(
            run_id=test_run_data.run_id,
            test_type=test_run_data.test_type,
            test_suite=test_run_data.test_suite,
            environment=test_run_data.environment,
            branch=test_run_data.branch,
            commit_hash=test_run_data.commit_hash,
            metadata=test_run_data.metadata
        )
        return {
            "id": str(test_run.id),
            "run_id": test_run.run_id,
            "test_type": test_run.test_type,
            "test_suite": test_run.test_suite,
            "status": test_run.status,
            "started_at": test_run.started_at.isoformat(),
            "created_at": test_run.created_at.isoformat(),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create test run: {str(e)}")


@router.get("/test-runs/{test_run_id}", response_model=Dict[str, Any])
async def get_test_run(
    test_run_id: uuid.UUID,
    testing_service: EcosystemService = Depends(get_testing_service)
):
    """Get a test run by ID."""
    test_run = await testing_service.get_test_run(test_run_id)
    if not test_run:
        raise HTTPException(status_code=404, detail="Test run not found")
    
    return {
        "id": str(test_run.id),
        "run_id": test_run.run_id,
        "test_type": test_run.test_type,
        "test_suite": test_run.test_suite,
        "environment": test_run.environment,
        "branch": test_run.branch,
        "commit_hash": test_run.commit_hash,
        "started_at": test_run.started_at.isoformat(),
        "completed_at": test_run.completed_at.isoformat() if test_run.completed_at else None,
        "status": test_run.status,
        "total_tests": test_run.total_tests,
        "passed_tests": test_run.passed_tests,
        "failed_tests": test_run.failed_tests,
        "skipped_tests": test_run.skipped_tests,
        "success_rate": test_run.success_rate,
        "duration_seconds": test_run.duration_seconds,
        "metadata": test_run.metadata,
        "created_at": test_run.created_at.isoformat(),
        "updated_at": test_run.updated_at.isoformat(),
    }


@router.patch("/test-runs/{test_run_id}/status", response_model=Dict[str, Any])
async def update_test_run_status(
    test_run_id: uuid.UUID,
    status_data: TestRunUpdate,
    testing_service: EcosystemService = Depends(get_testing_service)
):
    """Update test run status and statistics."""
    try:
        test_run = await testing_service.update_test_run_status(
            test_run_id=test_run_id,
            status=status_data.status,
            total_tests=status_data.total_tests,
            passed_tests=status_data.passed_tests,
            failed_tests=status_data.failed_tests,
            skipped_tests=status_data.skipped_tests
        )
        return {
            "id": str(test_run.id),
            "run_id": test_run.run_id,
            "status": test_run.status,
            "total_tests": test_run.total_tests,
            "passed_tests": test_run.passed_tests,
            "failed_tests": test_run.failed_tests,
            "skipped_tests": test_run.skipped_tests,
            "success_rate": test_run.success_rate,
            "duration_seconds": test_run.duration_seconds,
            "updated_at": test_run.updated_at.isoformat(),
        }
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update test run: {str(e)}")


@router.get("/test-runs", response_model=List[Dict[str, Any]])
async def list_test_runs(
    test_type: Optional[str] = None,
    environment: Optional[str] = None,
    status: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
    testing_service: EcosystemService = Depends(get_testing_service)
):
    """List test runs with optional filtering."""
    test_runs = await testing_service.list_test_runs(
        test_type=test_type,
        environment=environment,
        status=status,
        limit=limit,
        offset=offset
    )
    
    return [
        {
            "id": str(tr.id),
            "run_id": tr.run_id,
            "test_type": tr.test_type,
            "test_suite": tr.test_suite,
            "environment": tr.environment,
            "status": tr.status,
            "started_at": tr.started_at.isoformat(),
            "completed_at": tr.completed_at.isoformat() if tr.completed_at else None,
            "success_rate": tr.success_rate,
            "total_tests": tr.total_tests,
            "passed_tests": tr.passed_tests,
            "failed_tests": tr.failed_tests,
            "skipped_tests": tr.skipped_tests,
        }
        for tr in test_runs
    ]


@router.get("/test-runs/{test_run_id}/summary", response_model=Dict[str, Any])
async def get_test_run_summary(
    test_run_id: uuid.UUID,
    testing_service: EcosystemService = Depends(get_testing_service)
):
    """Get comprehensive summary of a test run."""
    try:
        summary = await testing_service.get_test_run_summary(test_run_id)
        return summary
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get test run summary: {str(e)}")


# Test Result Endpoints

@router.post("/test-results", response_model=Dict[str, Any])
async def add_test_result(
    test_result_data: TestResultCreate,
    testing_service: EcosystemService = Depends(get_testing_service)
):
    """Add a test result to a test run."""
    try:
        test_result = await testing_service.add_test_result(
            test_run_id=test_result_data.test_run_id,
            test_name=test_result_data.test_name,
            status=test_result_data.status,
            test_file=test_result_data.test_file,
            test_class=test_result_data.test_class,
            test_method=test_result_data.test_method,
            duration_ms=test_result_data.duration_ms,
            error_message=test_result_data.error_message,
            error_traceback=test_result_data.error_traceback,
            stdout=test_result_data.stdout,
            stderr=test_result_data.stderr,
            metadata=test_result_data.metadata
        )
        return {
            "id": str(test_result.id),
            "test_run_id": str(test_result.test_run_id),
            "test_name": test_result.test_name,
            "status": test_result.status,
            "duration_ms": test_result.duration_ms,
            "created_at": test_result.created_at.isoformat(),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to add test result: {str(e)}")


@router.get("/test-runs/{test_run_id}/test-results", response_model=List[Dict[str, Any]])
async def get_test_results(
    test_run_id: uuid.UUID,
    status: Optional[str] = None,
    limit: int = 100,
    offset: int = 0,
    testing_service: EcosystemService = Depends(get_testing_service)
):
    """Get test results for a test run."""
    test_results = await testing_service.get_test_results(
        test_run_id=test_run_id,
        status=status,
        limit=limit,
        offset=offset
    )
    
    return [
        {
            "id": str(tr.id),
            "test_name": tr.test_name,
            "test_file": tr.test_file,
            "test_class": tr.test_class,
            "test_method": tr.test_method,
            "status": tr.status,
            "duration_ms": tr.duration_ms,
            "started_at": tr.started_at.isoformat() if tr.started_at else None,
            "completed_at": tr.completed_at.isoformat() if tr.completed_at else None,
            "error_message": tr.error_message,
            "metadata": tr.metadata,
        }
        for tr in test_results
    ]


# Benchmark Result Endpoints

@router.post("/benchmark-results", response_model=Dict[str, Any])
async def add_benchmark_result(
    benchmark_data: BenchmarkResultCreate,
    testing_service: EcosystemService = Depends(get_testing_service)
):
    """Add a benchmark result."""
    try:
        benchmark_result = await testing_service.add_benchmark_result(
            test_run_id=benchmark_data.test_run_id,
            benchmark_name=benchmark_data.benchmark_name,
            benchmark_type=benchmark_data.benchmark_type,
            total_requests=benchmark_data.total_requests,
            successful_requests=benchmark_data.successful_requests,
            failed_requests=benchmark_data.failed_requests,
            endpoint=benchmark_data.endpoint,
            method=benchmark_data.method,
            avg_response_time_ms=benchmark_data.avg_response_time_ms,
            median_response_time_ms=benchmark_data.median_response_time_ms,
            p95_response_time_ms=benchmark_data.p95_response_time_ms,
            p99_response_time_ms=benchmark_data.p99_response_time_ms,
            min_response_time_ms=benchmark_data.min_response_time_ms,
            max_response_time_ms=benchmark_data.max_response_time_ms,
            requests_per_second=benchmark_data.requests_per_second,
            error_rate_percent=benchmark_data.error_rate_percent,
            concurrent_users=benchmark_data.concurrent_users,
            duration_seconds=benchmark_data.duration_seconds,
            peak_memory_mb=benchmark_data.peak_memory_mb,
            peak_cpu_percent=benchmark_data.peak_cpu_percent,
            status_codes=benchmark_data.status_codes,
            errors=benchmark_data.errors,
            metadata=benchmark_data.metadata
        )
        return {
            "id": str(benchmark_result.id),
            "test_run_id": str(benchmark_result.test_run_id),
            "benchmark_name": benchmark_result.benchmark_name,
            "benchmark_type": benchmark_result.benchmark_type,
            "total_requests": benchmark_result.total_requests,
            "successful_requests": benchmark_result.successful_requests,
            "failed_requests": benchmark_result.failed_requests,
            "avg_response_time_ms": benchmark_result.avg_response_time_ms,
            "requests_per_second": benchmark_result.requests_per_second,
            "error_rate_percent": benchmark_result.error_rate_percent,
            "created_at": benchmark_result.created_at.isoformat(),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to add benchmark result: {str(e)}")


@router.get("/test-runs/{test_run_id}/benchmark-results", response_model=List[Dict[str, Any]])
async def get_benchmark_results(
    test_run_id: uuid.UUID,
    benchmark_type: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
    testing_service: EcosystemService = Depends(get_testing_service)
):
    """Get benchmark results for a test run."""
    benchmark_results = await testing_service.get_benchmark_results(
        test_run_id=test_run_id,
        benchmark_type=benchmark_type,
        limit=limit,
        offset=offset
    )
    
    return [
        {
            "id": str(br.id),
            "benchmark_name": br.benchmark_name,
            "benchmark_type": br.benchmark_type,
            "endpoint": br.endpoint,
            "method": br.method,
            "total_requests": br.total_requests,
            "successful_requests": br.successful_requests,
            "failed_requests": br.failed_requests,
            "avg_response_time_ms": br.avg_response_time_ms,
            "median_response_time_ms": br.median_response_time_ms,
            "p95_response_time_ms": br.p95_response_time_ms,
            "p99_response_time_ms": br.p99_response_time_ms,
            "requests_per_second": br.requests_per_second,
            "error_rate_percent": br.error_rate_percent,
            "concurrent_users": br.concurrent_users,
            "duration_seconds": br.duration_seconds,
            "peak_memory_mb": br.peak_memory_mb,
            "peak_cpu_percent": br.peak_cpu_percent,
            "created_at": br.created_at.isoformat(),
        }
        for br in benchmark_results
    ]


# Performance Metrics Endpoints

@router.post("/performance-metrics", response_model=Dict[str, Any])
async def add_performance_metric(
    metric_data: PerformanceMetricCreate,
    testing_service: EcosystemService = Depends(get_testing_service)
):
    """Add a performance metric."""
    try:
        performance_metric = await testing_service.add_performance_metric(
            test_run_id=metric_data.test_run_id,
            metric_name=metric_data.metric_name,
            metric_type=metric_data.metric_type,
            value=metric_data.value,
            unit=metric_data.unit,
            benchmark_result_id=metric_data.benchmark_result_id,
            timestamp=metric_data.timestamp,
            metadata=metric_data.metadata
        )
        return {
            "id": str(performance_metric.id),
            "test_run_id": str(performance_metric.test_run_id),
            "metric_name": performance_metric.metric_name,
            "metric_type": performance_metric.metric_type,
            "value": performance_metric.value,
            "unit": performance_metric.unit,
            "timestamp": performance_metric.timestamp.isoformat(),
            "created_at": performance_metric.created_at.isoformat(),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to add performance metric: {str(e)}")


@router.get("/test-runs/{test_run_id}/performance-metrics", response_model=List[Dict[str, Any]])
async def get_performance_metrics(
    test_run_id: uuid.UUID,
    metric_type: Optional[str] = None,
    start_time: Optional[datetime] = None,
    end_time: Optional[datetime] = None,
    limit: int = 1000,
    offset: int = 0,
    testing_service: EcosystemService = Depends(get_testing_service)
):
    """Get performance metrics for a test run."""
    performance_metrics = await testing_service.get_performance_metrics(
        test_run_id=test_run_id,
        metric_type=metric_type,
        start_time=start_time,
        end_time=end_time,
        limit=limit,
        offset=offset
    )
    
    return [
        {
            "id": str(pm.id),
            "metric_name": pm.metric_name,
            "metric_type": pm.metric_type,
            "value": pm.value,
            "unit": pm.unit,
            "timestamp": pm.timestamp.isoformat(),
            "metadata": pm.metadata,
        }
        for pm in performance_metrics
    ]


# Trace Data Endpoints

@router.post("/trace-data", response_model=Dict[str, Any])
async def add_trace_data(
    trace_data: TraceDataCreate,
    testing_service: EcosystemService = Depends(get_testing_service)
):
    """Add trace data."""
    try:
        trace = await testing_service.add_trace_data(
            test_run_id=trace_data.test_run_id,
            trace_id=trace_data.trace_id,
            trace_type=trace_data.trace_type,
            trace_name=trace_data.trace_name,
            trace_data=trace_data.trace_data,
            duration_ms=trace_data.duration_ms,
            metadata=trace_data.metadata
        )
        return {
            "id": str(trace.id),
            "test_run_id": str(trace.test_run_id),
            "trace_id": trace.trace_id,
            "trace_type": trace.trace_type,
            "trace_name": trace.trace_name,
            "trace_size_bytes": trace.trace_size_bytes,
            "duration_ms": trace.duration_ms,
            "created_at": trace.created_at.isoformat(),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to add trace data: {str(e)}")


@router.get("/test-runs/{test_run_id}/trace-data", response_model=List[Dict[str, Any]])
async def get_trace_data(
    test_run_id: uuid.UUID,
    trace_type: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
    testing_service: EcosystemService = Depends(get_testing_service)
):
    """Get trace data for a test run."""
    trace_data = await testing_service.get_trace_data(
        test_run_id=test_run_id,
        trace_type=trace_type,
        limit=limit,
        offset=offset
    )
    
    return [
        {
            "id": str(td.id),
            "trace_id": td.trace_id,
            "trace_type": td.trace_type,
            "trace_name": td.trace_name,
            "trace_size_bytes": td.trace_size_bytes,
            "duration_ms": td.duration_ms,
            "created_at": td.created_at.isoformat(),
        }
        for td in trace_data
    ]


# Coverage Data Endpoints

@router.post("/coverage-data", response_model=Dict[str, Any])
async def add_coverage_data(
    coverage_data: CoverageDataCreate,
    testing_service: EcosystemService = Depends(get_testing_service)
):
    """Add coverage data for a file."""
    try:
        coverage = await testing_service.add_coverage_data(
            test_run_id=coverage_data.test_run_id,
            file_path=coverage_data.file_path,
            lines_total=coverage_data.lines_total,
            lines_covered=coverage_data.lines_covered,
            lines_missing=coverage_data.lines_missing,
            coverage_percent=coverage_data.coverage_percent,
            file_type=coverage_data.file_type,
            branches_total=coverage_data.branches_total,
            branches_covered=coverage_data.branches_covered,
            branches_missing=coverage_data.branches_missing,
            functions_total=coverage_data.functions_total,
            functions_covered=coverage_data.functions_covered,
            functions_missing=coverage_data.functions_missing,
            coverage_data=coverage_data.coverage_data
        )
        return {
            "id": str(coverage.id),
            "test_run_id": str(coverage.test_run_id),
            "file_path": coverage.file_path,
            "file_type": coverage.file_type,
            "lines_total": coverage.lines_total,
            "lines_covered": coverage.lines_covered,
            "lines_missing": coverage.lines_missing,
            "coverage_percent": coverage.coverage_percent,
            "branches_total": coverage.branches_total,
            "branches_covered": coverage.branches_covered,
            "branches_missing": coverage.branches_missing,
            "functions_total": coverage.functions_total,
            "functions_covered": coverage.functions_covered,
            "functions_missing": coverage.functions_missing,
            "created_at": coverage.created_at.isoformat(),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to add coverage data: {str(e)}")


@router.get("/test-runs/{test_run_id}/coverage-data", response_model=List[Dict[str, Any]])
async def get_coverage_data(
    test_run_id: uuid.UUID,
    file_path: Optional[str] = None,
    min_coverage: Optional[float] = None,
    limit: int = 1000,
    offset: int = 0,
    testing_service: EcosystemService = Depends(get_testing_service)
):
    """Get coverage data for a test run."""
    coverage_data = await testing_service.get_coverage_data(
        test_run_id=test_run_id,
        file_path=file_path,
        min_coverage=min_coverage,
        limit=limit,
        offset=offset
    )
    
    return [
        {
            "id": str(cd.id),
            "file_path": cd.file_path,
            "file_type": cd.file_type,
            "lines_total": cd.lines_total,
            "lines_covered": cd.lines_covered,
            "lines_missing": cd.lines_missing,
            "coverage_percent": cd.coverage_percent,
            "branches_total": cd.branches_total,
            "branches_covered": cd.branches_covered,
            "branches_missing": cd.branches_missing,
            "functions_total": cd.functions_total,
            "functions_covered": cd.functions_covered,
            "functions_missing": cd.functions_missing,
            "created_at": cd.created_at.isoformat(),
        }
        for cd in coverage_data
    ]


# Test Artifact Endpoints

@router.post("/test-artifacts", response_model=Dict[str, Any])
async def add_test_artifact(
    test_run_id: str = Form(...),
    artifact_type: str = Form(...),
    artifact_name: str = Form(...),
    mime_type: Optional[str] = Form(None),
    file_path: Optional[str] = Form(None),
    metadata: Optional[str] = Form(None),
    artifact_data: Optional[UploadFile] = File(None),
    testing_service: EcosystemService = Depends(get_testing_service)
):
    """Add a test artifact."""
    try:
        # Parse metadata if provided
        parsed_metadata = None
        if metadata:
            import json
            parsed_metadata = json.loads(metadata)
        
        # Read artifact data if provided
        artifact_bytes = None
        if artifact_data:
            artifact_bytes = await artifact_data.read()
        
        artifact = await testing_service.add_test_artifact(
            test_run_id=uuid.UUID(test_run_id),
            artifact_type=artifact_type,
            artifact_name=artifact_name,
            file_path=file_path,
            artifact_data=artifact_bytes,
            mime_type=mime_type,
            metadata=parsed_metadata
        )
        return {
            "id": str(artifact.id),
            "test_run_id": str(artifact.test_run_id),
            "artifact_type": artifact.artifact_type,
            "artifact_name": artifact.artifact_name,
            "file_path": artifact.file_path,
            "file_size_bytes": artifact.file_size_bytes,
            "mime_type": artifact.mime_type,
            "created_at": artifact.created_at.isoformat(),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to add test artifact: {str(e)}")


@router.get("/test-runs/{test_run_id}/test-artifacts", response_model=List[Dict[str, Any]])
async def get_test_artifacts(
    test_run_id: uuid.UUID,
    artifact_type: Optional[str] = None,
    limit: int = 100,
    offset: int = 0,
    testing_service: EcosystemService = Depends(get_testing_service)
):
    """Get test artifacts for a test run."""
    test_artifacts = await testing_service.get_test_artifacts(
        test_run_id=test_run_id,
        artifact_type=artifact_type,
        limit=limit,
        offset=offset
    )
    
    return [
        {
            "id": str(ta.id),
            "artifact_type": ta.artifact_type,
            "artifact_name": ta.artifact_name,
            "file_path": ta.file_path,
            "file_size_bytes": ta.file_size_bytes,
            "mime_type": ta.mime_type,
            "created_at": ta.created_at.isoformat(),
        }
        for ta in test_artifacts
    ]


# Test Report Endpoints

@router.post("/test-reports", response_model=Dict[str, Any])
async def add_test_report(
    report_data: TestReportCreate,
    testing_service: EcosystemService = Depends(get_testing_service)
):
    """Add a test report."""
    try:
        report = await testing_service.add_test_report(
            test_run_id=report_data.test_run_id,
            report_type=report_data.report_type,
            report_format=report_data.report_format,
            report_title=report_data.report_title,
            report_content=report_data.report_content,
            metadata=report_data.metadata
        )
        return {
            "id": str(report.id),
            "test_run_id": str(report.test_run_id),
            "report_type": report.report_type,
            "report_format": report.report_format,
            "report_title": report.report_title,
            "report_size_bytes": report.report_size_bytes,
            "generated_at": report.generated_at.isoformat(),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to add test report: {str(e)}")


@router.get("/test-runs/{test_run_id}/test-reports", response_model=List[Dict[str, Any]])
async def get_test_reports(
    test_run_id: uuid.UUID,
    report_type: Optional[str] = None,
    report_format: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
    testing_service: EcosystemService = Depends(get_testing_service)
):
    """Get test reports for a test run."""
    test_reports = await testing_service.get_test_reports(
        test_run_id=test_run_id,
        report_type=report_type,
        report_format=report_format,
        limit=limit,
        offset=offset
    )
    
    return [
        {
            "id": str(tr.id),
            "report_type": tr.report_type,
            "report_format": tr.report_format,
            "report_title": tr.report_title,
            "report_size_bytes": tr.report_size_bytes,
            "generated_at": tr.generated_at.isoformat(),
        }
        for tr in test_reports
    ]


# Utility Endpoints

@router.delete("/cleanup", response_model=Dict[str, Any])
async def cleanup_old_data(
    days_to_keep: int = 30,
    testing_service: EcosystemService = Depends(get_testing_service)
):
    """Clean up old test data."""
    try:
        deleted_counts = await testing_service.cleanup_old_data(days_to_keep)
        return {
            "message": f"Cleaned up data older than {days_to_keep} days",
            "deleted_counts": deleted_counts,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to cleanup old data: {str(e)}")


@router.get("/health", response_model=Dict[str, Any])
async def health_check():
    """Health check endpoint for the testing API."""
    return {
        "status": "healthy",
        "service": "testing-ecosystem-api",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat(),
    }
