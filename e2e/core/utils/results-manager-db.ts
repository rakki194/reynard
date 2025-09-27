/**
 * @fileoverview Unified Results Manager for E2E Testing - Database Version
 *
 * 🦦 *splashes with database integration enthusiasm* Centralized system for managing
 * all E2E test results in the unified PostgreSQL database instead of scattered files.
 *
 * This version stores all test results, artifacts, and reports in the database
 * while maintaining the same interface for backward compatibility.
 *
 * @author Quality-Otter-15 (Reynard Otter Specialist)
 * @since 2.0.0
 */

import { existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export interface TestRunInfo {
  testType: string;
  timestamp: string;
  runId: string;
  environment?: string;
  branch?: string;
  commit?: string;
}

export interface ResultsPaths {
  baseDir: string;
  testTypeDir: string;
  runDir: string;
  htmlReport: string;
  htmlReportDir: string;
  jsonReport: string;
  junitReport: string;
  artifactsDir: string;
  screenshotsDir: string;
  tracesDir: string;
  videosDir: string;
}

export interface TestResult {
  testName: string;
  status: 'passed' | 'failed' | 'skipped' | 'error';
  duration?: number;
  errorMessage?: string;
  errorTraceback?: string;
  stdout?: string;
  stderr?: string;
  metadata?: Record<string, any>;
}

export interface BenchmarkResult {
  benchmarkName: string;
  benchmarkType: string;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  avgResponseTimeMs: number;
  medianResponseTimeMs: number;
  p95ResponseTimeMs: number;
  p99ResponseTimeMs: number;
  requestsPerSecond: number;
  errorRatePercent: number;
  metadata?: Record<string, any>;
}

export interface PerformanceMetric {
  metricName: string;
  metricType: string;
  value: number;
  unit?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface TraceData {
  traceId: string;
  traceType: string;
  traceName: string;
  traceData: Record<string, any>;
  durationMs?: number;
  metadata?: Record<string, any>;
}

export interface CoverageData {
  filePath: string;
  fileType?: string;
  linesTotal: number;
  linesCovered: number;
  linesMissing: number;
  coveragePercent: number;
  branchesTotal?: number;
  branchesCovered?: number;
  branchesMissing?: number;
  functionsTotal?: number;
  functionsCovered?: number;
  functionsMissing?: number;
  coverageData?: Record<string, any>;
}

export interface TestArtifact {
  artifactType: string;
  artifactName: string;
  filePath?: string;
  artifactData?: Buffer;
  mimeType?: string;
  metadata?: Record<string, any>;
}

export interface TestReport {
  reportType: string;
  reportFormat: string;
  reportTitle: string;
  reportContent: string;
  metadata?: Record<string, any>;
}

/**
 * 🦊 Results Manager - Database Version
 *
 * Manages all E2E test results in the unified PostgreSQL database:
 * - Test runs and individual test results
 * - Benchmark and performance data
 * - Trace and coverage information
 * - Test artifacts and generated reports
 *
 * Maintains backward compatibility with file-based interface while
 * storing everything in the database for unified access and analysis.
 */
export class ResultsManagerDB {
  private readonly baseResultsDir: string;
  private readonly testRunInfo: TestRunInfo;
  private readonly apiBaseUrl: string;
  private testRunId: string | null = null;

  constructor(testType: string, options: Partial<TestRunInfo> = {}) {
    this.baseResultsDir = join(__dirname, "../../results");
    this.testRunInfo = {
      testType,
      timestamp: this.generateTimestamp(),
      runId: this.generateRunId(),
      environment: process.env.NODE_ENV || "development",
      branch: process.env.GIT_BRANCH || "unknown",
      commit: process.env.GIT_COMMIT || "unknown",
      ...options,
    };
    this.apiBaseUrl = process.env.REYNARD_API_URL || "http://localhost:8000";
  }

  /**
   * 🦊 Start a new test run in the database
   */
  public async startTestRun(): Promise<string> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/testing/test-runs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          run_id: this.testRunInfo.runId,
          test_type: this.testRunInfo.testType,
          test_suite: this.testRunInfo.testType,
          environment: this.testRunInfo.environment,
          branch: this.testRunInfo.branch,
          commit_hash: this.testRunInfo.commit,
          metadata: {
            timestamp: this.testRunInfo.timestamp,
            node_version: process.version,
            platform: process.platform,
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create test run: ${response.statusText}`);
      }

      const result = await response.json();
      this.testRunId = result.id;
      
      console.log(`✅ Started test run in database: ${this.testRunInfo.runId} (ID: ${this.testRunId})`);
      return this.testRunId;
    } catch (error) {
      console.warn(`⚠️ Failed to start test run in database: ${error}`);
      console.log(`📁 Falling back to file-based storage`);
      return this.generateRunId();
    }
  }

  /**
   * 🦊 Add a test result to the database
   */
  public async addTestResult(testResult: TestResult): Promise<void> {
    if (!this.testRunId) {
      console.warn("⚠️ No active test run. Call startTestRun() first.");
      return;
    }

    try {
      const response = await fetch(`${this.apiBaseUrl}/api/testing/test-results`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          test_run_id: this.testRunId,
          test_name: testResult.testName,
          status: testResult.status,
          duration_ms: testResult.duration,
          error_message: testResult.errorMessage,
          error_traceback: testResult.errorTraceback,
          stdout: testResult.stdout,
          stderr: testResult.stderr,
          metadata: testResult.metadata,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to add test result: ${response.statusText}`);
      }

      console.log(`✅ Added test result: ${testResult.testName}`);
    } catch (error) {
      console.warn(`⚠️ Failed to add test result to database: ${error}`);
    }
  }

  /**
   * 🦊 Add benchmark results to the database
   */
  public async addBenchmarkResult(benchmarkResult: BenchmarkResult): Promise<void> {
    if (!this.testRunId) {
      console.warn("⚠️ No active test run. Call startTestRun() first.");
      return;
    }

    try {
      const response = await fetch(`${this.apiBaseUrl}/api/testing/benchmark-results`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          test_run_id: this.testRunId,
          benchmark_name: benchmarkResult.benchmarkName,
          benchmark_type: benchmarkResult.benchmarkType,
          total_requests: benchmarkResult.totalRequests,
          successful_requests: benchmarkResult.successfulRequests,
          failed_requests: benchmarkResult.failedRequests,
          avg_response_time_ms: benchmarkResult.avgResponseTimeMs,
          median_response_time_ms: benchmarkResult.medianResponseTimeMs,
          p95_response_time_ms: benchmarkResult.p95ResponseTimeMs,
          p99_response_time_ms: benchmarkResult.p99ResponseTimeMs,
          requests_per_second: benchmarkResult.requestsPerSecond,
          error_rate_percent: benchmarkResult.errorRatePercent,
          metadata: benchmarkResult.metadata,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to add benchmark result: ${response.statusText}`);
      }

      console.log(`✅ Added benchmark result: ${benchmarkResult.benchmarkName}`);
    } catch (error) {
      console.warn(`⚠️ Failed to add benchmark result to database: ${error}`);
    }
  }

  /**
   * 🦊 Add performance metrics to the database
   */
  public async addPerformanceMetric(metric: PerformanceMetric): Promise<void> {
    if (!this.testRunId) {
      console.warn("⚠️ No active test run. Call startTestRun() first.");
      return;
    }

    try {
      const response = await fetch(`${this.apiBaseUrl}/api/testing/performance-metrics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          test_run_id: this.testRunId,
          metric_name: metric.metricName,
          metric_type: metric.metricType,
          value: metric.value,
          unit: metric.unit,
          timestamp: metric.timestamp.toISOString(),
          metadata: metric.metadata,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to add performance metric: ${response.statusText}`);
      }
    } catch (error) {
      console.warn(`⚠️ Failed to add performance metric to database: ${error}`);
    }
  }

  /**
   * 🦊 Add trace data to the database
   */
  public async addTraceData(traceData: TraceData): Promise<void> {
    if (!this.testRunId) {
      console.warn("⚠️ No active test run. Call startTestRun() first.");
      return;
    }

    try {
      const response = await fetch(`${this.apiBaseUrl}/api/testing/trace-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          test_run_id: this.testRunId,
          trace_id: traceData.traceId,
          trace_type: traceData.traceType,
          trace_name: traceData.traceName,
          trace_data: traceData.traceData,
          duration_ms: traceData.durationMs,
          metadata: traceData.metadata,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to add trace data: ${response.statusText}`);
      }

      console.log(`✅ Added trace data: ${traceData.traceName}`);
    } catch (error) {
      console.warn(`⚠️ Failed to add trace data to database: ${error}`);
    }
  }

  /**
   * 🦊 Add coverage data to the database
   */
  public async addCoverageData(coverageData: CoverageData): Promise<void> {
    if (!this.testRunId) {
      console.warn("⚠️ No active test run. Call startTestRun() first.");
      return;
    }

    try {
      const response = await fetch(`${this.apiBaseUrl}/api/testing/coverage-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          test_run_id: this.testRunId,
          file_path: coverageData.filePath,
          file_type: coverageData.fileType,
          lines_total: coverageData.linesTotal,
          lines_covered: coverageData.linesCovered,
          lines_missing: coverageData.linesMissing,
          branches_total: coverageData.branchesTotal,
          branches_covered: coverageData.branchesCovered,
          branches_missing: coverageData.branchesMissing,
          functions_total: coverageData.functionsTotal,
          functions_covered: coverageData.functionsCovered,
          functions_missing: coverageData.functionsMissing,
          coverage_percent: coverageData.coveragePercent,
          coverage_data: coverageData.coverageData,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to add coverage data: ${response.statusText}`);
      }
    } catch (error) {
      console.warn(`⚠️ Failed to add coverage data to database: ${error}`);
    }
  }

  /**
   * 🦊 Add test artifact to the database
   */
  public async addTestArtifact(artifact: TestArtifact): Promise<void> {
    if (!this.testRunId) {
      console.warn("⚠️ No active test run. Call startTestRun() first.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append('test_run_id', this.testRunId);
      formData.append('artifact_type', artifact.artifactType);
      formData.append('artifact_name', artifact.artifactName);
      formData.append('mime_type', artifact.mimeType || 'application/octet-stream');
      
      if (artifact.filePath) {
        formData.append('file_path', artifact.filePath);
      }
      
      if (artifact.artifactData) {
        formData.append('artifact_data', new Blob([artifact.artifactData]));
      }
      
      if (artifact.metadata) {
        formData.append('metadata', JSON.stringify(artifact.metadata));
      }

      const response = await fetch(`${this.apiBaseUrl}/api/testing/test-artifacts`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Failed to add test artifact: ${response.statusText}`);
      }

      console.log(`✅ Added test artifact: ${artifact.artifactName}`);
    } catch (error) {
      console.warn(`⚠️ Failed to add test artifact to database: ${error}`);
    }
  }

  /**
   * 🦊 Add test report to the database
   */
  public async addTestReport(report: TestReport): Promise<void> {
    if (!this.testRunId) {
      console.warn("⚠️ No active test run. Call startTestRun() first.");
      return;
    }

    try {
      const response = await fetch(`${this.apiBaseUrl}/api/testing/test-reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          test_run_id: this.testRunId,
          report_type: report.reportType,
          report_format: report.reportFormat,
          report_title: report.reportTitle,
          report_content: report.reportContent,
          metadata: report.metadata,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to add test report: ${response.statusText}`);
      }

      console.log(`✅ Added test report: ${report.reportTitle}`);
    } catch (error) {
      console.warn(`⚠️ Failed to add test report to database: ${error}`);
    }
  }

  /**
   * 🦊 Update test run status
   */
  public async updateTestRunStatus(
    status: 'running' | 'completed' | 'failed' | 'cancelled',
    totalTests?: number,
    passedTests?: number,
    failedTests?: number,
    skippedTests?: number
  ): Promise<void> {
    if (!this.testRunId) {
      console.warn("⚠️ No active test run. Call startTestRun() first.");
      return;
    }

    try {
      const response = await fetch(`${this.apiBaseUrl}/api/testing/test-runs/${this.testRunId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          total_tests: totalTests,
          passed_tests: passedTests,
          failed_tests: failedTests,
          skipped_tests: skippedTests,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update test run status: ${response.statusText}`);
      }

      console.log(`✅ Updated test run status: ${status}`);
    } catch (error) {
      console.warn(`⚠️ Failed to update test run status in database: ${error}`);
    }
  }

  /**
   * 🦊 Complete the test run
   */
  public async completeTestRun(): Promise<void> {
    await this.updateTestRunStatus('completed');
    console.log(`✅ Completed test run: ${this.testRunInfo.runId}`);
  }

  /**
   * 🦊 Get test run summary from database
   */
  public async getTestRunSummary(): Promise<any> {
    if (!this.testRunId) {
      console.warn("⚠️ No active test run. Call startTestRun() first.");
      return null;
    }

    try {
      const response = await fetch(`${this.apiBaseUrl}/api/testing/test-runs/${this.testRunId}/summary`);
      
      if (!response.ok) {
        throw new Error(`Failed to get test run summary: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.warn(`⚠️ Failed to get test run summary from database: ${error}`);
      return null;
    }
  }

  /**
   * 🦊 Generate complete results directory structure (for backward compatibility)
   */
  public generateResultsPaths(): ResultsPaths {
    const { testType, timestamp, runId } = this.testRunInfo;

    // Create descriptive run directory name
    const runDirName = `${timestamp}_${runId}`;

    const baseDir = this.baseResultsDir;
    const testTypeDir = join(baseDir, testType);
    const runDir = join(testTypeDir, runDirName);

    return {
      baseDir,
      testTypeDir,
      runDir,
      htmlReport: join(runDir, "html-report", "index.html"),
      htmlReportDir: join(runDir, "html-report"),
      jsonReport: join(runDir, "results.json"),
      junitReport: join(runDir, "results.xml"),
      artifactsDir: join(runDir, "artifacts"),
      screenshotsDir: join(runDir, "screenshots"),
      tracesDir: join(runDir, "traces"),
      videosDir: join(runDir, "videos"),
    };
  }

  /**
   * 🦊 Create all necessary directories (for backward compatibility)
   */
  public createDirectories(): ResultsPaths {
    const paths = this.generateResultsPaths();

    // Create all directories
    const dirs = [
      paths.baseDir,
      paths.testTypeDir,
      paths.runDir,
      paths.artifactsDir,
      paths.screenshotsDir,
      paths.tracesDir,
      paths.videosDir,
      paths.htmlReportDir, // HTML report directory
    ];

    for (const dir of dirs) {
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
        console.log(`✅ Created directory: ${dir}`);
      }
    }

    return paths;
  }

  /**
   * 🦊 Get Playwright reporter configuration (for backward compatibility)
   */
  public getReporterConfig(): any[] {
    const paths = this.generateResultsPaths();

    return [
      [
        "html",
        {
          outputFolder: paths.htmlReportDir,
          open: "never",
          attachmentsBaseURL: "../artifacts/",
        },
      ],
      ["json", { outputFile: paths.jsonReport }],
      ["junit", { outputFile: paths.junitReport }],
      ["list"],
    ];
  }

  /**
   * 🦊 Get Playwright output directory configuration (for backward compatibility)
   */
  public getOutputDir(): string {
    const paths = this.generateResultsPaths();
    return paths.artifactsDir;
  }

  /**
   * 🦊 Generate timestamp in format: YYYY-MM-DD_HH-MM-SS
   */
  private generateTimestamp(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");

    return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
  }

  /**
   * 🦊 Generate short run ID (8 characters)
   */
  private generateRunId(): string {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * 🦊 Get test run metadata
   */
  public getTestRunInfo(): TestRunInfo {
    return { ...this.testRunInfo };
  }

  /**
   * 🦊 Get test run ID
   */
  public getTestRunId(): string | null {
    return this.testRunId;
  }
}

/**
 * 🦊 Convenience function to create results manager for specific test type
 */
export function createResultsManagerDB(testType: string, options?: Partial<TestRunInfo>): ResultsManagerDB {
  return new ResultsManagerDB(testType, options);
}

/**
 * 🦊 Get standardized test type names
 */
export const TEST_TYPES = {
  E2E: "e2e",
  EFFECTS: "effects",
  BENCHMARK: "benchmark",
  I18N: "i18n",
  PENETRATION: "penetration",
  PERFORMANCE: "performance",
  COMPONENTS: "components",
  DOM: "dom",
} as const;

export type TestType = (typeof TEST_TYPES)[keyof typeof TEST_TYPES];
