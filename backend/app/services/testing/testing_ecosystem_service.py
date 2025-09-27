"""Testing Ecosystem Service

Service for managing all testing, benchmarking, and tracing data in PostgreSQL.

This service provides:
- Test run management and tracking
- Benchmark result storage and analysis
- Performance metrics collection
- Trace data management
- Coverage data storage
- Test artifact handling
- Report generation and storage
"""

import uuid
from datetime import datetime, timedelta, timezone, UTC
from typing import Optional, List, Dict, Any, Union
from pathlib import Path

from sqlalchemy import and_, or_, desc, asc, func, text
from sqlalchemy.orm import Session, joinedload
from sqlalchemy.exc import SQLAlchemyError

from app.models.testing_ecosystem import (
    Run, Result, BenchmarkResult, PerformanceMetric,
    TraceData, CoverageData, Artifact, Report
)
from app.core.database_manager import get_e2e_session


class EcosystemService:
    """Service for managing all testing ecosystem data."""
    
    def __init__(self, session: Optional[Session] = None):
        self.session = session
    
    # Test Run Management
    
    async def create_test_run(
        self,
        run_id: str,
        test_type: str,
        test_suite: str,
        environment: str = "development",
        branch: Optional[str] = None,
        commit_hash: Optional[str] = None,
        total_tests: int = 0,
        passed_tests: int = 0,
        failed_tests: int = 0,
        skipped_tests: int = 0,
        meta_data: Optional[Dict[str, Any]] = None
    ) -> Run:
        """Create a new test run."""
        test_run = Run(
            run_id=run_id,
            test_type=test_type,
            test_suite=test_suite,
            environment=environment,
            branch=branch,
            commit_hash=commit_hash,
            started_at=datetime.now(UTC),
            status="running",
            total_tests=total_tests,
            passed_tests=passed_tests,
            failed_tests=failed_tests,
            skipped_tests=skipped_tests,
            meta_data=meta_data or {}
        )
        
        self.session.add(test_run)
        self.session.commit()
        self.session.refresh(test_run)
        return test_run
    
    async def update_test_run_status(
        self,
        test_run_id: uuid.UUID,
        status: str,
        total_tests: Optional[int] = None,
        passed_tests: Optional[int] = None,
        failed_tests: Optional[int] = None,
        skipped_tests: Optional[int] = None
    ) -> Run:
        """Update test run status and statistics."""
        test_run = await self.get_test_run(test_run_id)
        if not test_run:
            raise ValueError(f"Test run {test_run_id} not found")
        
        test_run.status = status
        test_run.updated_at = datetime.now(UTC)
        
        if status == "completed":
            test_run.completed_at = datetime.now(UTC)
            if test_run.started_at:
                # Ensure both datetimes are timezone-aware for calculation
                started_at = test_run.started_at
                completed_at = test_run.completed_at
                
                # If started_at is naive, assume UTC
                if started_at.tzinfo is None:
                    started_at = started_at.replace(tzinfo=timezone.utc)
                
                # If completed_at is naive, assume UTC
                if completed_at.tzinfo is None:
                    completed_at = completed_at.replace(tzinfo=timezone.utc)
                
                test_run.duration_seconds = (completed_at - started_at).total_seconds()
        
        if total_tests is not None:
            test_run.total_tests = total_tests
        if passed_tests is not None:
            test_run.passed_tests = passed_tests
        if failed_tests is not None:
            test_run.failed_tests = failed_tests
        if skipped_tests is not None:
            test_run.skipped_tests = skipped_tests
        
        if test_run.total_tests > 0:
            test_run.success_rate = (test_run.passed_tests / test_run.total_tests) * 100
        
        self.session.commit()
        self.session.refresh(test_run)
        return test_run
    
    async def get_test_run(self, test_run_id: uuid.UUID) -> Optional[Run]:
        """Get a test run by ID."""
        return self.session.query(Run).filter(Run.id == test_run_id).first()
    
    async def get_test_run_by_run_id(self, run_id: str) -> Optional[Run]:
        """Get a test run by run_id."""
        return self.session.query(Run).filter(Run.run_id == run_id).first()
    
    async def list_test_runs(
        self,
        test_type: Optional[str] = None,
        environment: Optional[str] = None,
        status: Optional[str] = None,
        limit: int = 50,
        offset: int = 0
    ) -> List[Run]:
        """List test runs with optional filtering."""
        query = self.session.query(Run)
        
        if test_type:
            query = query.filter(Run.test_type == test_type)
        if environment:
            query = query.filter(Run.environment == environment)
        if status:
            query = query.filter(Run.status == status)
        
        return query.order_by(desc(Run.started_at)).offset(offset).limit(limit).all()
    
    # Test Result Management
    
    async def add_test_result(
        self,
        test_run_id: uuid.UUID,
        test_name: str,
        status: str,
        test_file: Optional[str] = None,
        test_class: Optional[str] = None,
        test_method: Optional[str] = None,
        duration_ms: Optional[float] = None,
        error_message: Optional[str] = None,
        error_traceback: Optional[str] = None,
        stdout: Optional[str] = None,
        stderr: Optional[str] = None,
        meta_data: Optional[Dict[str, Any]] = None
    ) -> Result:
        """Add a test result to a test run."""
        test_result = Result(
            test_run_id=test_run_id,
            test_name=test_name,
            test_file=test_file,
            test_class=test_class,
            test_method=test_method,
            status=status,
            duration_ms=duration_ms,
            started_at=datetime.now(UTC) if status in ["running", "passed", "failed", "error"] else None,
            completed_at=datetime.now(UTC) if status in ["passed", "failed", "skipped", "error"] else None,
            error_message=error_message,
            error_traceback=error_traceback,
            stdout=stdout,
            stderr=stderr,
            meta_data=meta_data or {}
        )
        
        self.session.add(test_result)
        self.session.commit()
        self.session.refresh(test_result)
        return test_result
    
    async def get_test_results(
        self,
        test_run_id: uuid.UUID,
        status: Optional[str] = None,
        limit: int = 100,
        offset: int = 0
    ) -> List[Result]:
        """Get test results for a test run."""
        query = self.session.query(Result).filter(Result.test_run_id == test_run_id)
        
        if status:
            query = query.filter(Result.status == status)
        
        return query.order_by(desc(Result.created_at)).offset(offset).limit(limit).all()
    
    # Benchmark Result Management
    
    async def add_benchmark_result(
        self,
        test_run_id: uuid.UUID,
        benchmark_name: str,
        benchmark_type: str,
        total_requests: int,
        successful_requests: int,
        failed_requests: int,
        endpoint: Optional[str] = None,
        method: Optional[str] = None,
        avg_response_time_ms: Optional[float] = None,
        median_response_time_ms: Optional[float] = None,
        p95_response_time_ms: Optional[float] = None,
        p99_response_time_ms: Optional[float] = None,
        min_response_time_ms: Optional[float] = None,
        max_response_time_ms: Optional[float] = None,
        requests_per_second: Optional[float] = None,
        error_rate_percent: Optional[float] = None,
        concurrent_users: Optional[int] = None,
        duration_seconds: Optional[float] = None,
        peak_memory_mb: Optional[float] = None,
        peak_cpu_percent: Optional[float] = None,
        status_codes: Optional[Dict[str, Any]] = None,
        errors: Optional[Dict[str, Any]] = None,
        meta_data: Optional[Dict[str, Any]] = None
    ) -> BenchmarkResult:
        """Add a benchmark result."""
        benchmark_result = BenchmarkResult(
            test_run_id=test_run_id,
            benchmark_name=benchmark_name,
            benchmark_type=benchmark_type,
            endpoint=endpoint,
            method=method,
            total_requests=total_requests,
            successful_requests=successful_requests,
            failed_requests=failed_requests,
            avg_response_time_ms=avg_response_time_ms,
            median_response_time_ms=median_response_time_ms,
            p95_response_time_ms=p95_response_time_ms,
            p99_response_time_ms=p99_response_time_ms,
            min_response_time_ms=min_response_time_ms,
            max_response_time_ms=max_response_time_ms,
            requests_per_second=requests_per_second,
            error_rate_percent=error_rate_percent,
            concurrent_users=concurrent_users,
            duration_seconds=duration_seconds,
            peak_memory_mb=peak_memory_mb,
            peak_cpu_percent=peak_cpu_percent,
            status_codes=status_codes,
            errors=errors,
            meta_data=meta_data or {}
        )
        
        self.session.add(benchmark_result)
        self.session.commit()
        self.session.refresh(benchmark_result)
        return benchmark_result
    
    async def get_benchmark_results(
        self,
        test_run_id: uuid.UUID,
        benchmark_type: Optional[str] = None,
        limit: int = 50,
        offset: int = 0
    ) -> List[BenchmarkResult]:
        """Get benchmark results for a test run."""
        query = self.session.query(BenchmarkResult).filter(BenchmarkResult.test_run_id == test_run_id)
        
        if benchmark_type:
            query = query.filter(BenchmarkResult.benchmark_type == benchmark_type)
        
        return query.order_by(desc(BenchmarkResult.created_at)).offset(offset).limit(limit).all()
    
    # Performance Metrics Management
    
    async def add_performance_metric(
        self,
        test_run_id: uuid.UUID,
        metric_name: str,
        metric_type: str,
        value: float,
        unit: Optional[str] = None,
        benchmark_result_id: Optional[uuid.UUID] = None,
        timestamp: Optional[datetime] = None,
        meta_data: Optional[Dict[str, Any]] = None
    ) -> PerformanceMetric:
        """Add a performance metric."""
        performance_metric = PerformanceMetric(
            test_run_id=test_run_id,
            benchmark_result_id=benchmark_result_id,
            metric_name=metric_name,
            metric_type=metric_type,
            value=value,
            unit=unit,
            timestamp=timestamp or datetime.now(UTC),
            meta_data=meta_data or {}
        )
        
        self.session.add(performance_metric)
        self.session.commit()
        self.session.refresh(performance_metric)
        return performance_metric
    
    async def get_performance_metrics(
        self,
        test_run_id: uuid.UUID,
        metric_type: Optional[str] = None,
        start_time: Optional[datetime] = None,
        end_time: Optional[datetime] = None,
        limit: int = 1000,
        offset: int = 0
    ) -> List[PerformanceMetric]:
        """Get performance metrics for a test run."""
        query = self.session.query(PerformanceMetric).filter(PerformanceMetric.test_run_id == test_run_id)
        
        if metric_type:
            query = query.filter(PerformanceMetric.metric_type == metric_type)
        if start_time:
            query = query.filter(PerformanceMetric.timestamp >= start_time)
        if end_time:
            query = query.filter(PerformanceMetric.timestamp <= end_time)
        
        return query.order_by(asc(PerformanceMetric.timestamp)).offset(offset).limit(limit).all()
    
    # Trace Data Management
    
    async def add_trace_data(
        self,
        test_run_id: uuid.UUID,
        trace_id: str,
        trace_type: str,
        trace_name: str,
        trace_data: Dict[str, Any],
        duration_ms: Optional[float] = None,
        meta_data: Optional[Dict[str, Any]] = None
    ) -> TraceData:
        """Add trace data."""
        trace_size_bytes = len(str(trace_data).encode('utf-8'))
        
        trace = TraceData(
            test_run_id=test_run_id,
            trace_id=trace_id,
            trace_type=trace_type,
            trace_name=trace_name,
            trace_data=trace_data,
            trace_size_bytes=trace_size_bytes,
            duration_ms=duration_ms,
            meta_data=meta_data or {}
        )
        
        self.session.add(trace)
        self.session.commit()
        self.session.refresh(trace)
        return trace
    
    async def get_trace_data(
        self,
        test_run_id: uuid.UUID,
        trace_type: Optional[str] = None,
        limit: int = 50,
        offset: int = 0
    ) -> List[TraceData]:
        """Get trace data for a test run."""
        query = self.session.query(TraceData).filter(TraceData.test_run_id == test_run_id)
        
        if trace_type:
            query = query.filter(TraceData.trace_type == trace_type)
        
        return query.order_by(desc(TraceData.created_at)).offset(offset).limit(limit).all()
    
    # Coverage Data Management
    
    async def add_coverage_data(
        self,
        test_run_id: uuid.UUID,
        file_path: str,
        lines_total: int,
        lines_covered: int,
        lines_missing: int,
        coverage_percent: float,
        file_type: Optional[str] = None,
        branches_total: Optional[int] = None,
        branches_covered: Optional[int] = None,
        branches_missing: Optional[int] = None,
        functions_total: Optional[int] = None,
        functions_covered: Optional[int] = None,
        functions_missing: Optional[int] = None,
        coverage_data: Optional[Dict[str, Any]] = None
    ) -> CoverageData:
        """Add coverage data for a file."""
        coverage = CoverageData(
            test_run_id=test_run_id,
            file_path=file_path,
            file_type=file_type,
            lines_total=lines_total,
            lines_covered=lines_covered,
            lines_missing=lines_missing,
            branches_total=branches_total,
            branches_covered=branches_covered,
            branches_missing=branches_missing,
            functions_total=functions_total,
            functions_covered=functions_covered,
            functions_missing=functions_missing,
            coverage_percent=coverage_percent,
            coverage_data=coverage_data
        )
        
        self.session.add(coverage)
        self.session.commit()
        self.session.refresh(coverage)
        return coverage
    
    async def get_coverage_data(
        self,
        test_run_id: uuid.UUID,
        file_path: Optional[str] = None,
        min_coverage: Optional[float] = None,
        limit: int = 1000,
        offset: int = 0
    ) -> List[CoverageData]:
        """Get coverage data for a test run."""
        query = self.session.query(CoverageData).filter(CoverageData.test_run_id == test_run_id)
        
        if file_path:
            query = query.filter(CoverageData.file_path.like(f"%{file_path}%"))
        if min_coverage is not None:
            query = query.filter(CoverageData.coverage_percent >= min_coverage)
        
        return query.order_by(desc(CoverageData.coverage_percent)).offset(offset).limit(limit).all()
    
    # Test Artifact Management
    
    async def add_test_artifact(
        self,
        test_run_id: uuid.UUID,
        artifact_type: str,
        artifact_name: str,
        file_path: Optional[str] = None,
        artifact_data: Optional[bytes] = None,
        mime_type: Optional[str] = None,
        test_result_id: Optional[uuid.UUID] = None,
        meta_data: Optional[Dict[str, Any]] = None
    ) -> Artifact:
        """Add a test artifact."""
        file_size_bytes = None
        if artifact_data:
            file_size_bytes = len(artifact_data)
        elif file_path and Path(file_path).exists():
            file_size_bytes = Path(file_path).stat().st_size
        
        artifact = Artifact(
            test_run_id=test_run_id,
            test_result_id=test_result_id,
            artifact_type=artifact_type,
            artifact_name=artifact_name,
            file_path=file_path,
            file_size_bytes=file_size_bytes,
            mime_type=mime_type,
            artifact_data=artifact_data,
            meta_data=meta_data or {}
        )
        
        self.session.add(artifact)
        self.session.commit()
        self.session.refresh(artifact)
        return artifact
    
    async def get_test_artifacts(
        self,
        test_run_id: uuid.UUID,
        artifact_type: Optional[str] = None,
        test_result_id: Optional[uuid.UUID] = None,
        limit: int = 100,
        offset: int = 0
    ) -> List[Artifact]:
        """Get test artifacts for a test run."""
        query = self.session.query(Artifact).filter(Artifact.test_run_id == test_run_id)
        
        if artifact_type:
            query = query.filter(Artifact.artifact_type == artifact_type)
        if test_result_id:
            query = query.filter(Artifact.test_result_id == test_result_id)
        
        return query.order_by(desc(Artifact.created_at)).offset(offset).limit(limit).all()
    
    # Test Report Management
    
    async def add_test_report(
        self,
        test_run_id: uuid.UUID,
        report_type: str,
        report_format: str,
        report_title: str,
        report_content: str,
        meta_data: Optional[Dict[str, Any]] = None
    ) -> Report:
        """Add a test report."""
        report_size_bytes = len(report_content.encode('utf-8'))
        
        report = Report(
            test_run_id=test_run_id,
            report_type=report_type,
            report_format=report_format,
            report_title=report_title,
            report_content=report_content,
            report_size_bytes=report_size_bytes,
            meta_data=meta_data or {}
        )
        
        self.session.add(report)
        self.session.commit()
        self.session.refresh(report)
        return report
    
    async def get_test_reports(
        self,
        test_run_id: uuid.UUID,
        report_type: Optional[str] = None,
        report_format: Optional[str] = None,
        limit: int = 50,
        offset: int = 0
    ) -> List[Report]:
        """Get test reports for a test run."""
        query = self.session.query(Report).filter(Report.test_run_id == test_run_id)
        
        if report_type:
            query = query.filter(Report.report_type == report_type)
        if report_format:
            query = query.filter(Report.report_format == report_format)
        
        return query.order_by(desc(Report.generated_at)).offset(offset).limit(limit).all()
    
    # Analytics and Reporting
    
    async def get_test_run_summary(self, test_run_id: uuid.UUID) -> Dict[str, Any]:
        """Get comprehensive summary of a test run."""
        test_run = await self.get_test_run(test_run_id)
        if not test_run:
            raise ValueError(f"Test run {test_run_id} not found")
        
        # Get all related data
        test_results = await self.get_test_results(test_run_id)
        benchmark_results = await self.get_benchmark_results(test_run_id)
        performance_metrics = await self.get_performance_metrics(test_run_id)
        trace_data = await self.get_trace_data(test_run_id)
        coverage_data = await self.get_coverage_data(test_run_id)
        test_artifacts = await self.get_test_artifacts(test_run_id)
        test_reports = await self.get_test_reports(test_run_id)
        
        # Calculate statistics
        status_counts = {}
        for result in test_results:
            status_counts[result.status] = status_counts.get(result.status, 0) + 1
        
        avg_coverage = 0
        if coverage_data:
            avg_coverage = sum(c.coverage_percent for c in coverage_data) / len(coverage_data)
        
        return {
            "test_run": {
                "id": str(test_run.id),
                "run_id": test_run.run_id,
                "test_type": test_run.test_type,
                "test_suite": test_run.test_suite,
                "environment": test_run.environment,
                "status": test_run.status,
                "started_at": test_run.started_at.isoformat() if test_run.started_at else None,
                "completed_at": test_run.completed_at.isoformat() if test_run.completed_at else None,
                "duration_seconds": test_run.duration_seconds,
                "success_rate": test_run.success_rate,
                "total_tests": test_run.total_tests,
                "passed_tests": test_run.passed_tests,
                "failed_tests": test_run.failed_tests,
                "skipped_tests": test_run.skipped_tests,
            },
            "statistics": {
                "test_results_count": len(test_results),
                "status_counts": status_counts,
                "benchmark_results_count": len(benchmark_results),
                "performance_metrics_count": len(performance_metrics),
                "trace_data_count": len(trace_data),
                "coverage_files_count": len(coverage_data),
                "average_coverage_percent": avg_coverage,
                "artifacts_count": len(test_artifacts),
                "reports_count": len(test_reports),
            },
            "benchmark_summary": [
                {
                    "name": br.benchmark_name,
                    "type": br.benchmark_type,
                    "total_requests": br.total_requests,
                    "success_rate": (br.successful_requests / br.total_requests * 100) if br.total_requests > 0 else 0,
                    "avg_response_time_ms": br.avg_response_time_ms,
                    "requests_per_second": br.requests_per_second,
                }
                for br in benchmark_results
            ],
            "coverage_summary": {
                "total_files": len(coverage_data),
                "average_coverage": avg_coverage,
                "low_coverage_files": [c.file_path for c in coverage_data if c.coverage_percent < 80],
            }
        }
    
    async def cleanup_old_data(self, days_to_keep: int = 30) -> Dict[str, int]:
        """Clean up old test data."""
        cutoff_date = datetime.now(UTC) - timedelta(days=days_to_keep)
        
        # Delete old test runs and cascade to related data
        old_test_runs = self.session.query(Run).filter(
            Run.created_at < cutoff_date
        ).all()
        
        deleted_counts = {
            "test_runs": 0,
            "test_results": 0,
            "benchmark_results": 0,
            "performance_metrics": 0,
            "trace_data": 0,
            "coverage_data": 0,
            "test_artifacts": 0,
            "test_reports": 0,
        }
        
        for test_run in old_test_runs:
            # Count related records before deletion
            deleted_counts["test_results"] += len(test_run.test_results)
            deleted_counts["benchmark_results"] += len(test_run.benchmark_results)
            deleted_counts["performance_metrics"] += len(test_run.performance_metrics)
            deleted_counts["trace_data"] += len(test_run.trace_data)
            deleted_counts["coverage_data"] += len(test_run.coverage_data)
            deleted_counts["test_artifacts"] += len(test_run.test_artifacts)
            deleted_counts["test_reports"] += len(test_run.test_reports)
            
            # Delete the test run (cascade will handle related data)
            self.session.delete(test_run)
            deleted_counts["test_runs"] += 1
        
        self.session.commit()
        return deleted_counts
