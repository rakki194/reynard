import { Component, createSignal, createEffect, For, Show } from 'solid-js';
import { Modal } from 'reynard-components-core';
import { TestRun, TestResult, BenchmarkResult, PerformanceMetric, TraceData, CoverageData, TestArtifact, TestReport } from '~/types/testing';
import { testingApi } from '~/utils/api';

interface TestRunDetailModalProps {
  testRun: TestRun | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TestRunDetailModal: Component<TestRunDetailModalProps> = (props) => {
  const [activeTab, setActiveTab] = createSignal<'overview' | 'results' | 'benchmarks' | 'performance' | 'traces' | 'coverage' | 'artifacts' | 'reports'>('overview');
  const [testResults, setTestResults] = createSignal<TestResult[]>([]);
  const [benchmarkResults, setBenchmarkResults] = createSignal<BenchmarkResult[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = createSignal<PerformanceMetric[]>([]);
  const [traceData, setTraceData] = createSignal<TraceData[]>([]);
  const [coverageData, setCoverageData] = createSignal<CoverageData[]>([]);
  const [testArtifacts, setTestArtifacts] = createSignal<TestArtifact[]>([]);
  const [testReports, setTestReports] = createSignal<TestReport[]>([]);
  const [loading, setLoading] = createSignal(false);
  const [summaryData, setSummaryData] = createSignal<any>(null);

  const apiClient = testingApi;

  // Load detailed data when modal opens
  createEffect(() => {
    if (props.isOpen && props.testRun) {
      loadDetailedData();
    }
  });

  // Reset when modal closes
  createEffect(() => {
    if (!props.isOpen) {
      setActiveTab('overview');
      setTestResults([]);
      setBenchmarkResults([]);
      setPerformanceMetrics([]);
      setTraceData([]);
      setCoverageData([]);
      setTestArtifacts([]);
      setTestReports([]);
      setSummaryData(null);
    }
  });

  const loadDetailedData = async () => {
    if (!props.testRun) return;

    setLoading(true);
    try {
      // Try to fetch detailed data in parallel
      const [results, benchmarks, performance, traces, coverage, artifacts, reports, summary] = await Promise.allSettled([
        apiClient.getTestResults(props.testRun.id),
        apiClient.getBenchmarkResults(props.testRun.id),
        apiClient.getPerformanceMetrics(props.testRun.id),
        apiClient.getTraceData(props.testRun.id),
        apiClient.getCoverageData(props.testRun.id),
        apiClient.getTestArtifacts(props.testRun.id),
        apiClient.getTestReports(props.testRun.id),
        apiClient.getTestRunSummary(props.testRun.id)
      ]);

      // Set results if successful
      if (results.status === 'fulfilled') setTestResults(results.value);
      if (benchmarks.status === 'fulfilled') setBenchmarkResults(benchmarks.value);
      if (performance.status === 'fulfilled') setPerformanceMetrics(performance.value);
      if (traces.status === 'fulfilled') setTraceData(traces.value);
      if (coverage.status === 'fulfilled') setCoverageData(coverage.value);
      if (artifacts.status === 'fulfilled') setTestArtifacts(artifacts.value);
      if (reports.status === 'fulfilled') setTestReports(reports.value);
      if (summary.status === 'fulfilled') setSummaryData(summary.value);

    } catch (error) {
      console.error('Error loading detailed data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (ms: number | null | undefined) => {
    if (!ms) return 'N/A';
    if (ms < 1000) return `${ms.toFixed(2)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const formatBytes = (bytes: number | null | undefined) => {
    if (!bytes) return 'N/A';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'passed': return 'text-green-600 bg-green-50';
      case 'failed': return 'text-red-600 bg-red-50';
      case 'skipped': return 'text-yellow-600 bg-yellow-50';
      case 'error': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'results', label: 'Test Results' },
    { id: 'benchmarks', label: 'Benchmarks' },
    { id: 'performance', label: 'Performance' },
    { id: 'traces', label: 'Traces' },
    { id: 'coverage', label: 'Coverage' },
    { id: 'artifacts', label: 'Artifacts' },
    { id: 'reports', label: 'Reports' }
  ] as const;

  return (
    <Modal
      open={props.isOpen}
      onClose={props.onClose}
      size="xl"
      title={props.testRun ? `${props.testRun.test_suite} - ${props.testRun.run_id}` : 'Test Run Details'}
    >
      <div class="test-run-detail-modal">
        {/* Tab Navigation */}
        <div class="border-b border-gray-200 mb-6">
          <nav class="flex space-x-8">
            <For each={tabs}>
              {(tab) => (
                <button
                  class={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab() === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              )}
            </For>
          </nav>
        </div>

        {/* Tab Content */}
        <div class="tab-content">
          <Show when={loading()}>
            <div class="flex items-center justify-center py-8">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span class="ml-2 text-gray-600">Loading detailed data...</span>
            </div>
          </Show>

          <Show when={!loading()}>
            {/* Overview Tab */}
            <Show when={activeTab() === 'overview'}>
              <div class="space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div class="bg-white p-4 rounded-lg border">
                    <div class="text-sm font-medium text-gray-500">Total Tests</div>
                    <div class="text-2xl font-bold text-gray-900">{props.testRun?.total_tests || 0}</div>
                  </div>
                  <div class="bg-white p-4 rounded-lg border">
                    <div class="text-sm font-medium text-gray-500">Passed</div>
                    <div class="text-2xl font-bold text-green-600">{props.testRun?.passed_tests || 0}</div>
                  </div>
                  <div class="bg-white p-4 rounded-lg border">
                    <div class="text-sm font-medium text-gray-500">Failed</div>
                    <div class="text-2xl font-bold text-red-600">{props.testRun?.failed_tests || 0}</div>
                  </div>
                  <div class="bg-white p-4 rounded-lg border">
                    <div class="text-sm font-medium text-gray-500">Skipped</div>
                    <div class="text-2xl font-bold text-yellow-600">{props.testRun?.skipped_tests || 0}</div>
                  </div>
                </div>

                <div class="bg-white p-6 rounded-lg border">
                  <h3 class="text-lg font-semibold mb-4">Test Run Information</h3>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700">Run ID</label>
                      <p class="mt-1 text-sm text-gray-900">{props.testRun?.run_id}</p>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700">Test Type</label>
                      <p class="mt-1 text-sm text-gray-900">{props.testRun?.test_type}</p>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700">Environment</label>
                      <p class="mt-1 text-sm text-gray-900">{props.testRun?.environment}</p>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700">Branch</label>
                      <p class="mt-1 text-sm text-gray-900">{props.testRun?.branch || 'main'}</p>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700">Duration</label>
                      <p class="mt-1 text-sm text-gray-900">{formatDuration(props.testRun?.duration_seconds ? props.testRun.duration_seconds * 1000 : undefined)}</p>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700">Status</label>
                      <span class={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(props.testRun?.status || 'unknown')}`}>
                        {props.testRun?.status}
                      </span>
                    </div>
                  </div>
                </div>

                <Show when={summaryData()}>
                  <div class="bg-white p-6 rounded-lg border">
                    <h3 class="text-lg font-semibold mb-4">Summary Statistics</h3>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label class="block text-sm font-medium text-gray-700">Success Rate</label>
                        <p class="mt-1 text-sm text-gray-900">
                          {summaryData()?.statistics?.success_rate ? `${(summaryData().statistics.success_rate * 100).toFixed(1)}%` : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <label class="block text-sm font-medium text-gray-700">Average Duration</label>
                        <p class="mt-1 text-sm text-gray-900">
                          {formatDuration(summaryData()?.statistics?.avg_duration_ms)}
                        </p>
                      </div>
                      <div>
                        <label class="block text-sm font-medium text-gray-700">Total Duration</label>
                        <p class="mt-1 text-sm text-gray-900">
                          {formatDuration(summaryData()?.statistics?.total_duration_ms)}
                        </p>
                      </div>
                    </div>
                  </div>
                </Show>
              </div>
            </Show>

            {/* Test Results Tab */}
            <Show when={activeTab() === 'results'}>
              <div class="space-y-4">
                <Show when={testResults().length > 0}>
                  <For each={testResults()}>
                    {(result) => (
                      <div class="bg-white p-4 rounded-lg border">
                        <div class="flex items-center justify-between mb-2">
                          <h4 class="font-medium text-gray-900">{result.test_name}</h4>
                          <span class={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(result.status)}`}>
                            {result.status}
                          </span>
                        </div>
                        <div class="text-sm text-gray-600">
                          <p>Duration: {formatDuration(result.duration_ms)}</p>
                          <Show when={result.error_message}>
                            <p class="text-red-600 mt-1">Error: {result.error_message}</p>
                          </Show>
                          <Show when={result.stdout}>
                            <details class="mt-2">
                              <summary class="cursor-pointer text-blue-600">Show Output</summary>
                              <pre class="mt-1 text-xs bg-gray-100 p-2 rounded overflow-x-auto">{result.stdout}</pre>
                            </details>
                          </Show>
                          <Show when={result.stderr}>
                            <details class="mt-2">
                              <summary class="cursor-pointer text-red-600">Show Errors</summary>
                              <pre class="mt-1 text-xs bg-red-50 p-2 rounded overflow-x-auto">{result.stderr}</pre>
                            </details>
                          </Show>
                        </div>
                      </div>
                    )}
                  </For>
                </Show>
                <Show when={testResults().length === 0}>
                  <div class="text-center py-8 text-gray-500">
                    <p>No detailed test results available.</p>
                    <p class="text-sm mt-1">This might require authentication or the detailed endpoints may not be accessible.</p>
                    <Show when={summaryData()?.statistics?.status_counts}>
                      <div class="mt-4 text-sm">
                        <p>Summary data available:</p>
                        {Object.entries(summaryData()?.statistics?.status_counts || {}).map(([status, count]) => (
                          <span class="ml-2">
                            {status}: {String(count)}
                          </span>
                        ))}
                      </div>
                    </Show>
                  </div>
                </Show>
              </div>
            </Show>

            {/* Benchmarks Tab */}
            <Show when={activeTab() === 'benchmarks'}>
              <div class="space-y-4">
                <Show when={benchmarkResults().length > 0}>
                  <For each={benchmarkResults()}>
                    {(benchmark) => (
                      <div class="bg-white p-4 rounded-lg border">
                        <h4 class="font-medium text-gray-900 mb-2">{benchmark.benchmark_name}</h4>
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <label class="block text-gray-500">Total Requests</label>
                            <p class="font-medium">{benchmark.total_requests}</p>
                          </div>
                          <div>
                            <label class="block text-gray-500">Success Rate</label>
                            <p class="font-medium">{((benchmark.successful_requests / benchmark.total_requests) * 100).toFixed(1)}%</p>
                          </div>
                          <div>
                            <label class="block text-gray-500">Avg Response Time</label>
                            <p class="font-medium">{formatDuration(benchmark.avg_response_time_ms)}</p>
                          </div>
                          <div>
                            <label class="block text-gray-500">Requests/sec</label>
                            <p class="font-medium">{benchmark.requests_per_second?.toFixed(1) || 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </For>
                </Show>
                <Show when={benchmarkResults().length === 0}>
                  <div class="text-center py-8 text-gray-500">
                    <p>No benchmark results available.</p>
                  </div>
                </Show>
              </div>
            </Show>

            {/* Performance Tab */}
            <Show when={activeTab() === 'performance'}>
              <div class="space-y-4">
                <Show when={performanceMetrics().length > 0}>
                  <For each={performanceMetrics()}>
                    {(metric) => (
                      <div class="bg-white p-4 rounded-lg border">
                        <div class="flex items-center justify-between mb-2">
                          <h4 class="font-medium text-gray-900">{metric.metric_name}</h4>
                          <span class="text-sm text-gray-500">{metric.metric_type}</span>
                        </div>
                        <div class="text-2xl font-bold text-blue-600">
                          {metric.value} {metric.unit || ''}
                        </div>
                        <div class="text-sm text-gray-500">
                          {new Date(metric.timestamp).toLocaleString()}
                        </div>
                      </div>
                    )}
                  </For>
                </Show>
                <Show when={performanceMetrics().length === 0}>
                  <div class="text-center py-8 text-gray-500">
                    <p>No performance metrics available.</p>
                  </div>
                </Show>
              </div>
            </Show>

            {/* Traces Tab */}
            <Show when={activeTab() === 'traces'}>
              <div class="space-y-4">
                <Show when={traceData().length > 0}>
                  <For each={traceData()}>
                    {(trace) => (
                      <div class="bg-white p-4 rounded-lg border">
                        <h4 class="font-medium text-gray-900 mb-2">{trace.trace_name}</h4>
                        <div class="text-sm text-gray-600">
                          <p>Type: {trace.trace_type}</p>
                          <p>Duration: {formatDuration(trace.duration_ms)}</p>
                          <details class="mt-2">
                            <summary class="cursor-pointer text-blue-600">Show Trace Data</summary>
                            <pre class="mt-1 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                              {JSON.stringify(trace.trace_data, null, 2)}
                            </pre>
                          </details>
                        </div>
                      </div>
                    )}
                  </For>
                </Show>
                <Show when={traceData().length === 0}>
                  <div class="text-center py-8 text-gray-500">
                    <p>No trace data available.</p>
                  </div>
                </Show>
              </div>
            </Show>

            {/* Coverage Tab */}
            <Show when={activeTab() === 'coverage'}>
              <div class="space-y-4">
                <Show when={coverageData().length > 0}>
                  <For each={coverageData()}>
                    {(coverage) => (
                      <div class="bg-white p-4 rounded-lg border">
                        <div class="flex items-center justify-between mb-2">
                          <h4 class="font-medium text-gray-900">{coverage.file_path}</h4>
                          <span class="text-sm font-medium text-blue-600">
                            {coverage.coverage_percent.toFixed(1)}%
                          </span>
                        </div>
                        <div class="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <label class="block text-gray-500">Lines</label>
                            <p class="font-medium">{coverage.lines_covered}/{coverage.lines_total}</p>
                          </div>
                          <div>
                            <label class="block text-gray-500">Branches</label>
                            <p class="font-medium">{coverage.branches_covered || 0}/{coverage.branches_total || 0}</p>
                          </div>
                          <div>
                            <label class="block text-gray-500">Functions</label>
                            <p class="font-medium">{coverage.functions_covered || 0}/{coverage.functions_total || 0}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </For>
                </Show>
                <Show when={coverageData().length === 0}>
                  <div class="text-center py-8 text-gray-500">
                    <p>No coverage data available.</p>
                  </div>
                </Show>
              </div>
            </Show>

            {/* Artifacts Tab */}
            <Show when={activeTab() === 'artifacts'}>
              <div class="space-y-4">
                <Show when={testArtifacts().length > 0}>
                  <For each={testArtifacts()}>
                    {(artifact) => (
                      <div class="bg-white p-4 rounded-lg border">
                        <div class="flex items-center justify-between mb-2">
                          <h4 class="font-medium text-gray-900">{artifact.artifact_name}</h4>
                          <span class="text-sm text-gray-500">{artifact.artifact_type}</span>
                        </div>
                        <div class="text-sm text-gray-600">
                          <Show when={artifact.file_path}>
                            <p>Path: {artifact.file_path}</p>
                          </Show>
                          <Show when={artifact.mime_type}>
                            <p>Type: {artifact.mime_type}</p>
                          </Show>
                        </div>
                      </div>
                    )}
                  </For>
                </Show>
                <Show when={testArtifacts().length === 0}>
                  <div class="text-center py-8 text-gray-500">
                    <p>No test artifacts available.</p>
                  </div>
                </Show>
              </div>
            </Show>

            {/* Reports Tab */}
            <Show when={activeTab() === 'reports'}>
              <div class="space-y-4">
                <Show when={testReports().length > 0}>
                  <For each={testReports()}>
                    {(report) => (
                      <div class="bg-white p-4 rounded-lg border">
                        <div class="flex items-center justify-between mb-2">
                          <h4 class="font-medium text-gray-900">{report.report_title}</h4>
                          <span class="text-sm text-gray-500">{report.report_type}</span>
                        </div>
                        <div class="text-sm text-gray-600">
                          <p>Format: {report.report_format}</p>
                          <details class="mt-2">
                            <summary class="cursor-pointer text-blue-600">Show Report Content</summary>
                            <pre class="mt-1 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                              {report.report_content}
                            </pre>
                          </details>
                        </div>
                      </div>
                    )}
                  </For>
                </Show>
                <Show when={testReports().length === 0}>
                  <div class="text-center py-8 text-gray-500">
                    <p>No test reports available.</p>
                  </div>
                </Show>
              </div>
            </Show>
          </Show>
        </div>
      </div>
    </Modal>
  );
};