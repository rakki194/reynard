/**
 * @fileoverview Unified Results Manager for E2E Testing
 *
 * 🦊 *whiskers twitch with organizational precision* Centralized system for managing
 * all E2E test results in a unified, date-organized structure.
 *
 * @author Strategic-Fox-42 (Reynard Fox Specialist)
 * @since 1.0.0
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

/**
 * 🦊 Results Manager - Unified E2E Test Results Organization
 *
 * Creates a consistent, date-organized structure for all test results:
 *
 * results/
 * ├── e2e/
 * │   └── 2025-01-15_14-30-25_auth-flow/
 * │       ├── report.html
 * │       ├── results.json
 * │       ├── results.xml
 * │       ├── artifacts/
 * │       ├── screenshots/
 * │       ├── traces/
 * │       └── videos/
 * ├── effects/
 * │   └── 2025-01-15_14-35-10_solidjs-effects/
 * ├── benchmark/
 * │   └── 2025-01-15_14-40-15_performance-benchmark/
 * ├── i18n/
 * │   └── 2025-01-15_14-45-30_i18n-performance/
 * ├── penetration/
 * │   └── 2025-01-15_14-50-45_security-tests/
 * ├── performance/
 * │   └── 2025-01-15_14-55-00_load-testing/
 * ├── components/
 * │   └── 2025-01-15_15-00-15_component-tests/
 * └── dom/
 *     └── 2025-01-15_15-05-30_dom-assertions/
 */
export class ResultsManager {
  private readonly baseResultsDir: string;
  private readonly testRunInfo: TestRunInfo;

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
  }

  /**
   * 🦊 Generate complete results directory structure
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
   * 🦊 Create all necessary directories
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
   * 🦊 Get Playwright reporter configuration
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
   * 🦊 Get Playwright output directory configuration
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
   * 🦊 Generate summary report path
   */
  public getSummaryReportPath(): string {
    const paths = this.generateResultsPaths();
    return join(paths.runDir, "summary.md");
  }

  /**
   * 🦊 Generate performance report path
   */
  public getPerformanceReportPath(): string {
    const paths = this.generateResultsPaths();
    return join(paths.runDir, "performance.json");
  }

  /**
   * 🦊 Get latest run directory for a test type
   */
  public static getLatestRunDir(testType: string): string | null {
    const baseDir = join(__dirname, "../../results");
    const testTypeDir = join(baseDir, testType);

    if (!existsSync(testTypeDir)) {
      return null;
    }

    // Get all run directories and sort by name (timestamp)
    const fs = require("fs");
    const dirs = fs
      .readdirSync(testTypeDir, { withFileTypes: true })
      .filter((dirent: any) => dirent.isDirectory())
      .map((dirent: any) => dirent.name)
      .sort()
      .reverse(); // Most recent first

    return dirs.length > 0 ? join(testTypeDir, dirs[0]) : null;
  }

  /**
   * 🦊 List all test runs for a given test type
   */
  public static listTestRuns(testType: string): string[] {
    const baseDir = join(__dirname, "../../results");
    const testTypeDir = join(baseDir, testType);

    if (!existsSync(testTypeDir)) {
      return [];
    }

    const fs = require("fs");
    return fs
      .readdirSync(testTypeDir, { withFileTypes: true })
      .filter((dirent: any) => dirent.isDirectory())
      .map((dirent: any) => dirent.name)
      .sort()
      .reverse(); // Most recent first
  }

  /**
   * 🦊 Clean up old test runs (keep last N runs)
   */
  public static cleanupOldRuns(testType: string, keepCount: number = 10): void {
    const runs = this.listTestRuns(testType);

    if (runs.length <= keepCount) {
      return;
    }

    const baseDir = join(__dirname, "../../results");
    const testTypeDir = join(baseDir, testType);
    const fs = require("fs");
    const path = require("path");

    // Remove old runs
    const runsToDelete = runs.slice(keepCount);
    for (const run of runsToDelete) {
      const runPath = join(testTypeDir, run);
      try {
        fs.rmSync(runPath, { recursive: true, force: true });
        console.log(`🗑️ Cleaned up old run: ${run}`);
      } catch (error) {
        console.warn(`⚠️ Failed to clean up run: ${run}`, error);
      }
    }
  }
}

/**
 * 🦊 Convenience function to create results manager for specific test type
 */
export function createResultsManager(testType: string, options?: Partial<TestRunInfo>): ResultsManager {
  return new ResultsManager(testType, options);
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
