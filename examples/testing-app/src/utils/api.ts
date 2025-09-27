/**
 * Testing Ecosystem API Client
 * 
 * 🦊 *whiskers twitch with API integration cunning* Comprehensive API client
 * for interacting with the Reynard testing ecosystem backend.
 */

import type { 
  TestRun, 
  TestResult, 
  BenchmarkResult, 
  PerformanceMetric, 
  TraceData, 
  CoverageData, 
  TestArtifact, 
  TestReport, 
  TestRunSummary,
  FilterOptions,
  DashboardStats,
  ApiResponse 
} from '../types/testing';

const API_BASE_URL = (import.meta as any).env?.VITE_TESTING_API_URL || 'http://localhost:8000';

class TestingApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Health Check
  async healthCheck(): Promise<{ status: string; service: string; version: string }> {
    return this.request('/api/testing/health');
  }

  // Test Runs
  async getTestRuns(filters: FilterOptions = {}): Promise<TestRun[]> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });
    
    const queryString = params.toString();
    const endpoint = queryString ? `/api/testing/test-runs?${queryString}` : '/api/testing/test-runs';
    
    return this.request<TestRun[]>(endpoint);
  }

  async getTestRun(id: string): Promise<TestRun> {
    return this.request<TestRun>(`/api/testing/test-runs/${id}`);
  }

  async getTestRunSummary(id: string): Promise<TestRunSummary> {
    return this.request<TestRunSummary>(`/api/testing/test-runs/${id}/summary`);
  }

  // Test Results
  async getTestResults(testRunId: string, status?: string, limit = 100, offset = 0): Promise<TestResult[]> {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());
    
    return this.request<TestResult[]>(`/api/testing/test-runs/${testRunId}/test-results?${params.toString()}`);
  }

  // Benchmark Results
  async getBenchmarkResults(testRunId: string, benchmarkType?: string, limit = 50, offset = 0): Promise<BenchmarkResult[]> {
    const params = new URLSearchParams();
    if (benchmarkType) params.append('benchmark_type', benchmarkType);
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());
    
    return this.request<BenchmarkResult[]>(`/api/testing/test-runs/${testRunId}/benchmark-results?${params.toString()}`);
  }

  // Performance Metrics
  async getPerformanceMetrics(
    testRunId: string, 
    metricType?: string, 
    startTime?: string, 
    endTime?: string, 
    limit = 1000, 
    offset = 0
  ): Promise<PerformanceMetric[]> {
    const params = new URLSearchParams();
    if (metricType) params.append('metric_type', metricType);
    if (startTime) params.append('start_time', startTime);
    if (endTime) params.append('end_time', endTime);
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());
    
    return this.request<PerformanceMetric[]>(`/api/testing/test-runs/${testRunId}/performance-metrics?${params.toString()}`);
  }

  // Trace Data
  async getTraceData(testRunId: string, traceType?: string, limit = 50, offset = 0): Promise<TraceData[]> {
    const params = new URLSearchParams();
    if (traceType) params.append('trace_type', traceType);
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());
    
    return this.request<TraceData[]>(`/api/testing/test-runs/${testRunId}/trace-data?${params.toString()}`);
  }

  // Coverage Data
  async getCoverageData(
    testRunId: string, 
    filePath?: string, 
    minCoverage?: number, 
    limit = 1000, 
    offset = 0
  ): Promise<CoverageData[]> {
    const params = new URLSearchParams();
    if (filePath) params.append('file_path', filePath);
    if (minCoverage !== undefined) params.append('min_coverage', minCoverage.toString());
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());
    
    return this.request<CoverageData[]>(`/api/testing/test-runs/${testRunId}/coverage-data?${params.toString()}`);
  }

  // Test Artifacts
  async getTestArtifacts(testRunId: string, artifactType?: string, limit = 100, offset = 0): Promise<TestArtifact[]> {
    const params = new URLSearchParams();
    if (artifactType) params.append('artifact_type', artifactType);
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());
    
    return this.request<TestArtifact[]>(`/api/testing/test-runs/${testRunId}/test-artifacts?${params.toString()}`);
  }

  // Test Reports
  async getTestReports(
    testRunId: string, 
    reportType?: string, 
    reportFormat?: string, 
    limit = 50, 
    offset = 0
  ): Promise<TestReport[]> {
    const params = new URLSearchParams();
    if (reportType) params.append('report_type', reportType);
    if (reportFormat) params.append('report_format', reportFormat);
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());
    
    return this.request<TestReport[]>(`/api/testing/test-runs/${testRunId}/test-reports?${params.toString()}`);
  }

  // Dashboard Statistics
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      // Get recent test runs to calculate stats
      const testRuns = await this.getTestRuns({ limit: 100 });
      
      const totalTestRuns = testRuns.length;
      const totalTests = testRuns.reduce((sum, run) => sum + run.total_tests, 0);
      const totalPassed = testRuns.reduce((sum, run) => sum + run.passed_tests, 0);
      const successRate = totalTests > 0 ? (totalPassed / totalTests) * 100 : 0;
      
      const completedRuns = testRuns.filter(run => run.duration_seconds !== null);
      const avgDuration = completedRuns.length > 0 
        ? completedRuns.reduce((sum, run) => sum + (run.duration_seconds || 0), 0) / completedRuns.length 
        : 0;
      
      const recentFailures = testRuns.filter(run => 
        run.status === 'failed' && 
        new Date(run.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
      ).length;
      
      // Calculate trends (simplified - in real app you'd have historical data)
      const coverageRuns = testRuns.filter(run => run.test_type === 'coverage');
      const coverageTrend = coverageRuns.length > 0 
        ? coverageRuns.reduce((sum, run) => sum + (run.success_rate || 0), 0) / coverageRuns.length 
        : 0;
      
      const performanceRuns = testRuns.filter(run => run.test_type === 'performance');
      const performanceTrend = performanceRuns.length > 0 
        ? performanceRuns.reduce((sum, run) => sum + (run.success_rate || 0), 0) / performanceRuns.length 
        : 0;
      
      return {
        total_test_runs: totalTestRuns,
        total_tests: totalTests,
        success_rate: successRate,
        avg_duration: avgDuration,
        recent_failures: recentFailures,
        coverage_trend: coverageTrend,
        performance_trend: performanceTrend,
      };
    } catch (error) {
      console.error('Failed to calculate dashboard stats:', error);
      return {
        total_test_runs: 0,
        total_tests: 0,
        success_rate: 0,
        avg_duration: 0,
        recent_failures: 0,
        coverage_trend: 0,
        performance_trend: 0,
      };
    }
  }

  // Utility Methods
  async isApiAvailable(): Promise<boolean> {
    try {
      await this.healthCheck();
      return true;
    } catch {
      return false;
    }
  }

  getApiBaseUrl(): string {
    return this.baseUrl;
  }
}

// Export singleton instance
export const testingApi = new TestingApiClient();
export default testingApi;
