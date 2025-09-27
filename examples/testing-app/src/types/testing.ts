/**
 * Testing Ecosystem Types
 * 
 * 🦦 *splashes with type safety enthusiasm* Comprehensive TypeScript types
 * for the Reynard testing ecosystem data structures.
 */

export interface TestRun {
  id: string;
  run_id: string;
  test_type: 'pytest' | 'vitest' | 'e2e' | 'benchmark' | 'performance' | 'coverage' | 'tracing';
  test_suite: string;
  environment: string;
  branch?: string;
  commit_hash?: string;
  started_at: string;
  completed_at?: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  total_tests: number;
  passed_tests: number;
  failed_tests: number;
  skipped_tests: number;
  success_rate?: number;
  duration_seconds?: number;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface TestResult {
  id: string;
  test_run_id: string;
  test_name: string;
  test_file?: string;
  test_class?: string;
  test_method?: string;
  status: 'passed' | 'failed' | 'skipped' | 'error';
  duration_ms?: number;
  started_at?: string;
  completed_at?: string;
  error_message?: string;
  error_traceback?: string;
  stdout?: string;
  stderr?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface BenchmarkResult {
  id: string;
  test_run_id: string;
  benchmark_name: string;
  benchmark_type: 'load_test' | 'performance' | 'stress' | 'endurance';
  endpoint?: string;
  method?: string;
  total_requests: number;
  successful_requests: number;
  failed_requests: number;
  avg_response_time_ms?: number;
  median_response_time_ms?: number;
  p95_response_time_ms?: number;
  p99_response_time_ms?: number;
  min_response_time_ms?: number;
  max_response_time_ms?: number;
  requests_per_second?: number;
  error_rate_percent?: number;
  concurrent_users?: number;
  duration_seconds?: number;
  peak_memory_mb?: number;
  peak_cpu_percent?: number;
  status_codes?: Record<string, any>;
  errors?: Record<string, any>;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface PerformanceMetric {
  id: string;
  test_run_id: string;
  benchmark_result_id?: string;
  metric_name: string;
  metric_type: 'response_time' | 'memory' | 'cpu' | 'throughput' | 'latency' | 'bandwidth';
  value: number;
  unit?: string;
  timestamp: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface TraceData {
  id: string;
  test_run_id: string;
  trace_id: string;
  trace_type: 'playwright' | 'performance' | 'custom' | 'network' | 'browser';
  trace_name: string;
  trace_data: Record<string, any>;
  trace_size_bytes?: number;
  duration_ms?: number;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface CoverageData {
  id: string;
  test_run_id: string;
  file_path: string;
  file_type?: string;
  lines_total: number;
  lines_covered: number;
  lines_missing: number;
  branches_total?: number;
  branches_covered?: number;
  branches_missing?: number;
  functions_total?: number;
  functions_covered?: number;
  functions_missing?: number;
  coverage_percent: number;
  coverage_data?: Record<string, any>;
  created_at: string;
}

export interface TestArtifact {
  id: string;
  test_run_id: string;
  test_result_id?: string;
  artifact_type: 'screenshot' | 'video' | 'log' | 'report' | 'trace' | 'coverage' | 'performance';
  artifact_name: string;
  file_path?: string;
  file_size_bytes?: number;
  mime_type?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface TestReport {
  id: string;
  test_run_id: string;
  report_type: 'summary' | 'detailed' | 'performance' | 'coverage' | 'benchmark' | 'trace';
  report_format: 'json' | 'html' | 'markdown' | 'text' | 'xml' | 'csv';
  report_title: string;
  report_content: string;
  report_size_bytes?: number;
  generated_at: string;
  metadata?: Record<string, any>;
}

export interface TestRunSummary {
  test_run: TestRun;
  statistics: {
    test_results_count: number;
    status_counts: Record<string, number>;
    benchmark_results_count: number;
    performance_metrics_count: number;
    trace_data_count: number;
    coverage_files_count: number;
    average_coverage_percent: number;
    artifacts_count: number;
    reports_count: number;
  };
  benchmark_summary: Array<{
    name: string;
    type: string;
    total_requests: number;
    success_rate: number;
    avg_response_time_ms?: number;
    requests_per_second?: number;
  }>;
  coverage_summary: {
    total_files: number;
    average_coverage: number;
    low_coverage_files: string[];
  };
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface FilterOptions {
  test_type?: string;
  environment?: string;
  status?: string;
  branch?: string;
  date_from?: string;
  date_to?: string;
  limit?: number;
  offset?: number;
}

export interface DashboardStats {
  total_test_runs: number;
  total_tests: number;
  success_rate: number;
  avg_duration: number;
  recent_failures: number;
  coverage_trend: number;
  performance_trend: number;
}
