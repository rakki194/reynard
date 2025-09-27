"""Create comprehensive testing ecosystem tables

Revision ID: 20250115_000000
Revises: 
Create Date: 2025-01-15 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '20250115_000000'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    """Create comprehensive testing ecosystem tables."""
    
    # Test Runs - Core table for all test executions
    op.create_table('test_runs',
        sa.Column('id', sa.UUID(), nullable=False, primary_key=True),
        sa.Column('run_id', sa.String(50), nullable=False, unique=True),
        sa.Column('test_type', sa.String(50), nullable=False),  # e2e, benchmark, performance, etc.
        sa.Column('test_suite', sa.String(100), nullable=False),  # specific test suite name
        sa.Column('environment', sa.String(50), nullable=False),  # development, staging, production
        sa.Column('branch', sa.String(100), nullable=True),
        sa.Column('commit_hash', sa.String(40), nullable=True),
        sa.Column('started_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('status', sa.String(20), nullable=False),  # running, completed, failed, cancelled
        sa.Column('total_tests', sa.Integer(), nullable=False, default=0),
        sa.Column('passed_tests', sa.Integer(), nullable=False, default=0),
        sa.Column('failed_tests', sa.Integer(), nullable=False, default=0),
        sa.Column('skipped_tests', sa.Integer(), nullable=False, default=0),
        sa.Column('success_rate', sa.Float(), nullable=True),
        sa.Column('duration_seconds', sa.Float(), nullable=True),
        sa.Column('metadata', postgresql.JSONB(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    
    # Individual Test Results
    op.create_table('test_results',
        sa.Column('id', sa.UUID(), nullable=False, primary_key=True),
        sa.Column('test_run_id', sa.UUID(), nullable=False),
        sa.Column('test_name', sa.String(200), nullable=False),
        sa.Column('test_file', sa.String(500), nullable=True),
        sa.Column('test_class', sa.String(200), nullable=True),
        sa.Column('test_method', sa.String(200), nullable=True),
        sa.Column('status', sa.String(20), nullable=False),  # passed, failed, skipped, error
        sa.Column('duration_ms', sa.Float(), nullable=True),
        sa.Column('started_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('error_message', sa.Text(), nullable=True),
        sa.Column('error_traceback', sa.Text(), nullable=True),
        sa.Column('stdout', sa.Text(), nullable=True),
        sa.Column('stderr', sa.Text(), nullable=True),
        sa.Column('metadata', postgresql.JSONB(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(['test_run_id'], ['test_runs.id'], ondelete='CASCADE'),
    )
    
    # Benchmark Results - Performance testing data
    op.create_table('benchmark_results',
        sa.Column('id', sa.UUID(), nullable=False, primary_key=True),
        sa.Column('test_run_id', sa.UUID(), nullable=False),
        sa.Column('benchmark_name', sa.String(200), nullable=False),
        sa.Column('benchmark_type', sa.String(50), nullable=False),  # load_test, performance, stress
        sa.Column('endpoint', sa.String(500), nullable=True),
        sa.Column('method', sa.String(10), nullable=True),
        sa.Column('total_requests', sa.Integer(), nullable=False),
        sa.Column('successful_requests', sa.Integer(), nullable=False),
        sa.Column('failed_requests', sa.Integer(), nullable=False),
        sa.Column('avg_response_time_ms', sa.Float(), nullable=True),
        sa.Column('median_response_time_ms', sa.Float(), nullable=True),
        sa.Column('p95_response_time_ms', sa.Float(), nullable=True),
        sa.Column('p99_response_time_ms', sa.Float(), nullable=True),
        sa.Column('min_response_time_ms', sa.Float(), nullable=True),
        sa.Column('max_response_time_ms', sa.Float(), nullable=True),
        sa.Column('requests_per_second', sa.Float(), nullable=True),
        sa.Column('error_rate_percent', sa.Float(), nullable=True),
        sa.Column('concurrent_users', sa.Integer(), nullable=True),
        sa.Column('duration_seconds', sa.Float(), nullable=True),
        sa.Column('peak_memory_mb', sa.Float(), nullable=True),
        sa.Column('peak_cpu_percent', sa.Float(), nullable=True),
        sa.Column('status_codes', postgresql.JSONB(), nullable=True),
        sa.Column('errors', postgresql.JSONB(), nullable=True),
        sa.Column('metadata', postgresql.JSONB(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(['test_run_id'], ['test_runs.id'], ondelete='CASCADE'),
    )
    
    # Performance Metrics - Detailed performance data
    op.create_table('performance_metrics',
        sa.Column('id', sa.UUID(), nullable=False, primary_key=True),
        sa.Column('test_run_id', sa.UUID(), nullable=False),
        sa.Column('benchmark_result_id', sa.UUID(), nullable=True),
        sa.Column('metric_name', sa.String(100), nullable=False),
        sa.Column('metric_type', sa.String(50), nullable=False),  # response_time, memory, cpu, throughput
        sa.Column('value', sa.Float(), nullable=False),
        sa.Column('unit', sa.String(20), nullable=True),  # ms, mb, percent, req/s
        sa.Column('timestamp', sa.DateTime(timezone=True), nullable=False),
        sa.Column('metadata', postgresql.JSONB(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(['test_run_id'], ['test_runs.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['benchmark_result_id'], ['benchmark_results.id'], ondelete='CASCADE'),
    )
    
    # Trace Data - Detailed execution traces
    op.create_table('trace_data',
        sa.Column('id', sa.UUID(), nullable=False, primary_key=True),
        sa.Column('test_run_id', sa.UUID(), nullable=False),
        sa.Column('trace_id', sa.String(100), nullable=False),
        sa.Column('trace_type', sa.String(50), nullable=False),  # playwright, performance, custom
        sa.Column('trace_name', sa.String(200), nullable=False),
        sa.Column('trace_data', postgresql.JSONB(), nullable=False),
        sa.Column('trace_size_bytes', sa.Integer(), nullable=True),
        sa.Column('duration_ms', sa.Float(), nullable=True),
        sa.Column('metadata', postgresql.JSONB(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(['test_run_id'], ['test_runs.id'], ondelete='CASCADE'),
    )
    
    # Coverage Data - Code coverage information
    op.create_table('coverage_data',
        sa.Column('id', sa.UUID(), nullable=False, primary_key=True),
        sa.Column('test_run_id', sa.UUID(), nullable=False),
        sa.Column('file_path', sa.String(1000), nullable=False),
        sa.Column('file_type', sa.String(20), nullable=True),  # py, ts, js, etc.
        sa.Column('lines_total', sa.Integer(), nullable=False),
        sa.Column('lines_covered', sa.Integer(), nullable=False),
        sa.Column('lines_missing', sa.Integer(), nullable=False),
        sa.Column('branches_total', sa.Integer(), nullable=True),
        sa.Column('branches_covered', sa.Integer(), nullable=True),
        sa.Column('branches_missing', sa.Integer(), nullable=True),
        sa.Column('functions_total', sa.Integer(), nullable=True),
        sa.Column('functions_covered', sa.Integer(), nullable=True),
        sa.Column('functions_missing', sa.Integer(), nullable=True),
        sa.Column('coverage_percent', sa.Float(), nullable=False),
        sa.Column('coverage_data', postgresql.JSONB(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(['test_run_id'], ['test_runs.id'], ondelete='CASCADE'),
    )
    
    # Test Artifacts - Screenshots, videos, logs, etc.
    op.create_table('test_artifacts',
        sa.Column('id', sa.UUID(), nullable=False, primary_key=True),
        sa.Column('test_run_id', sa.UUID(), nullable=False),
        sa.Column('test_result_id', sa.UUID(), nullable=True),
        sa.Column('artifact_type', sa.String(50), nullable=False),  # screenshot, video, log, report
        sa.Column('artifact_name', sa.String(200), nullable=False),
        sa.Column('file_path', sa.String(1000), nullable=True),
        sa.Column('file_size_bytes', sa.Integer(), nullable=True),
        sa.Column('mime_type', sa.String(100), nullable=True),
        sa.Column('artifact_data', postgresql.BYTEA(), nullable=True),  # Store binary data
        sa.Column('metadata', postgresql.JSONB(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(['test_run_id'], ['test_runs.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['test_result_id'], ['test_results.id'], ondelete='CASCADE'),
    )
    
    # Test Reports - Generated reports and summaries
    op.create_table('test_reports',
        sa.Column('id', sa.UUID(), nullable=False, primary_key=True),
        sa.Column('test_run_id', sa.UUID(), nullable=False),
        sa.Column('report_type', sa.String(50), nullable=False),  # summary, detailed, performance, coverage
        sa.Column('report_format', sa.String(20), nullable=False),  # json, html, markdown, text
        sa.Column('report_title', sa.String(200), nullable=False),
        sa.Column('report_content', sa.Text(), nullable=False),
        sa.Column('report_size_bytes', sa.Integer(), nullable=True),
        sa.Column('generated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('metadata', postgresql.JSONB(), nullable=True),
        sa.ForeignKeyConstraint(['test_run_id'], ['test_runs.id'], ondelete='CASCADE'),
    )
    
    # Create indexes for performance
    op.create_index('idx_test_runs_type_status', 'test_runs', ['test_type', 'status'])
    op.create_index('idx_test_runs_started_at', 'test_runs', ['started_at'])
    op.create_index('idx_test_runs_environment', 'test_runs', ['environment'])
    
    op.create_index('idx_test_results_run_id', 'test_results', ['test_run_id'])
    op.create_index('idx_test_results_status', 'test_results', ['status'])
    op.create_index('idx_test_results_name', 'test_results', ['test_name'])
    
    op.create_index('idx_benchmark_results_run_id', 'benchmark_results', ['test_run_id'])
    op.create_index('idx_benchmark_results_type', 'benchmark_results', ['benchmark_type'])
    op.create_index('idx_benchmark_results_name', 'benchmark_results', ['benchmark_name'])
    
    op.create_index('idx_performance_metrics_run_id', 'performance_metrics', ['test_run_id'])
    op.create_index('idx_performance_metrics_type', 'performance_metrics', ['metric_type'])
    op.create_index('idx_performance_metrics_timestamp', 'performance_metrics', ['timestamp'])
    
    op.create_index('idx_trace_data_run_id', 'trace_data', ['test_run_id'])
    op.create_index('idx_trace_data_type', 'trace_data', ['trace_type'])
    
    op.create_index('idx_coverage_data_run_id', 'coverage_data', ['test_run_id'])
    op.create_index('idx_coverage_data_file_path', 'coverage_data', ['file_path'])
    
    op.create_index('idx_test_artifacts_run_id', 'test_artifacts', ['test_run_id'])
    op.create_index('idx_test_artifacts_type', 'test_artifacts', ['artifact_type'])
    
    op.create_index('idx_test_reports_run_id', 'test_reports', ['test_run_id'])
    op.create_index('idx_test_reports_type', 'test_reports', ['report_type'])


def downgrade():
    """Drop all testing ecosystem tables."""
    op.drop_table('test_reports')
    op.drop_table('test_artifacts')
    op.drop_table('coverage_data')
    op.drop_table('trace_data')
    op.drop_table('performance_metrics')
    op.drop_table('benchmark_results')
    op.drop_table('test_results')
    op.drop_table('test_runs')
