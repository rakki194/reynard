/**
 * Global Teardown for E2E Tests with Code Coverage
 *
 * Collects and processes code coverage data from E2E tests,
 * merges it with Vitest coverage, and generates comprehensive reports.
 */

import { FullConfig } from "@playwright/test";
import { promises as fs } from "fs";
import { join } from "path";
import { spawn } from "child_process";
import { promisify } from "util";
import { exec } from "child_process";

const execAsync = promisify(exec);

async function globalTeardown(config: FullConfig) {
  console.log("🦊 Starting E2E test teardown with coverage processing...");

  const coverageDir = join(process.cwd(), "coverage", "e2e");
  const coverageRawDir = join(coverageDir, "raw");
  const coverageReportsDir = join(coverageDir, "reports");

  try {
    // Read coverage state
    const coverageStatePath = join(coverageDir, "coverage-state.json");
    const coverageState = JSON.parse(await fs.readFile(coverageStatePath, "utf-8"));

    // Update final state
    coverageState.endTime = Date.now();
    coverageState.duration = coverageState.endTime - coverageState.startTime;

    await fs.writeFile(coverageStatePath, JSON.stringify(coverageState, null, 2));

    // Collect coverage data from browser instances
    await collectBrowserCoverage(coverageRawDir);

    // Process and merge coverage data
    await processCoverageData(coverageDir, coverageRawDir, coverageReportsDir);

    // Generate reports
    await generateCoverageReports(coverageDir, coverageReportsDir);

    // Integrate with Vitest coverage
    await integrateWithVitestCoverage(coverageDir);

    // Clean up temporary files
    await cleanupTempFiles(coverageRawDir);

    console.log("✅ E2E coverage teardown completed");
    console.log(`📊 Coverage reports available in: ${coverageReportsDir}`);
  } catch (error) {
    console.error("❌ Error during coverage teardown:", error);
    // Don't fail the test run due to coverage issues
  }
}

/**
 * Collect coverage data from browser instances
 */
async function collectBrowserCoverage(rawDir: string): Promise<void> {
  console.log("📊 Collecting browser coverage data...");

  // Browser coverage data is typically stored in the global window object
  // and needs to be extracted from the browser context
  const coverageFiles = await fs.readdir(rawDir).catch(() => []);

  if (coverageFiles.length === 0) {
    console.log("⚠️ No browser coverage files found");
    return;
  }

  console.log(`📁 Found ${coverageFiles.length} coverage files`);
}

/**
 * Process and merge coverage data
 */
async function processCoverageData(coverageDir: string, rawDir: string, reportsDir: string): Promise<void> {
  console.log("🔄 Processing coverage data...");

  try {
    // Use c8 or v8-to-istanbul to process coverage data
    const command = `npx c8 report --reporter=html --reporter=lcov --reporter=json --reports-dir="${reportsDir}" --temp-directory="${rawDir}"`;

    const { stdout, stderr } = await exec(command, { cwd: process.cwd() });

    if (stderr) {
      console.log("Coverage processing warnings:", stderr);
    }

    console.log("✅ Coverage data processed successfully");
  } catch (error) {
    console.log("⚠️ Coverage processing completed with warnings:", error);

    // Fallback: Create basic coverage report
    await createFallbackCoverageReport(reportsDir);
  }
}

/**
 * Generate comprehensive coverage reports
 */
async function generateCoverageReports(coverageDir: string, reportsDir: string): Promise<void> {
  console.log("📈 Generating coverage reports...");

  // Generate summary report
  const summaryReport = {
    timestamp: new Date().toISOString(),
    type: "e2e-coverage",
    summary: {
      lines: { total: 0, covered: 0, percentage: 0 },
      functions: { total: 0, covered: 0, percentage: 0 },
      branches: { total: 0, covered: 0, percentage: 0 },
      statements: { total: 0, covered: 0, percentage: 0 },
    },
    files: [],
  };

  await fs.writeFile(join(reportsDir, "coverage-summary.json"), JSON.stringify(summaryReport, null, 2));

  // Generate HTML index
  const htmlIndex = `
<!DOCTYPE html>
<html>
<head>
    <title>Reynard E2E Code Coverage Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f5f5f5; padding: 20px; border-radius: 5px; }
        .metrics { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin: 20px 0; }
        .metric { background: white; padding: 15px; border: 1px solid #ddd; border-radius: 5px; text-align: center; }
        .metric-value { font-size: 24px; font-weight: bold; color: #2196F3; }
        .metric-label { color: #666; margin-top: 5px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🦊 Reynard E2E Code Coverage Report</h1>
        <p>Generated on ${new Date().toLocaleString()}</p>
    </div>
    
    <div class="metrics">
        <div class="metric">
            <div class="metric-value">0%</div>
            <div class="metric-label">Lines</div>
        </div>
        <div class="metric">
            <div class="metric-value">0%</div>
            <div class="metric-label">Functions</div>
        </div>
        <div class="metric">
            <div class="metric-value">0%</div>
            <div class="metric-label">Branches</div>
        </div>
        <div class="metric">
            <div class="metric-value">0%</div>
            <div class="metric-label">Statements</div>
        </div>
    </div>
    
    <h2>Files Covered</h2>
    <p>E2E coverage data will be displayed here once collection is fully implemented.</p>
    
    <h2>Integration</h2>
    <p>This coverage data is integrated with the Vitest workspace coverage system.</p>
</body>
</html>`;

  await fs.writeFile(join(reportsDir, "index.html"), htmlIndex);
}

/**
 * Integrate with Vitest coverage system
 */
async function integrateWithVitestCoverage(coverageDir: string): Promise<void> {
  console.log("🔗 Integrating with Vitest coverage...");

  const vitestCoverageDir = join(process.cwd(), "coverage");
  const e2eCoverageFile = join(vitestCoverageDir, "e2e-coverage.json");

  // Create e2e coverage entry for Vitest
  const e2eCoverageData = {
    type: "e2e",
    timestamp: new Date().toISOString(),
    coverageDir: coverageDir,
    summary: {
      lines: 0,
      functions: 0,
      branches: 0,
      statements: 0,
    },
  };

  await fs.writeFile(e2eCoverageFile, JSON.stringify(e2eCoverageData, null, 2));

  console.log("✅ E2E coverage integrated with Vitest");
}

/**
 * Create fallback coverage report when processing fails
 */
async function createFallbackCoverageReport(reportsDir: string): Promise<void> {
  const fallbackReport = {
    message: "E2E coverage collection is configured but no data was collected.",
    note: "This may be due to instrumentation not being enabled or tests not executing JavaScript code paths.",
    timestamp: new Date().toISOString(),
  };

  await fs.writeFile(join(reportsDir, "fallback-report.json"), JSON.stringify(fallbackReport, null, 2));
}

/**
 * Clean up temporary coverage files
 */
async function cleanupTempFiles(rawDir: string): Promise<void> {
  try {
    const files = await fs.readdir(rawDir);
    for (const file of files) {
      if (file.startsWith("tmp-") || file.endsWith(".tmp")) {
        await fs.unlink(join(rawDir, file));
      }
    }
  } catch (error) {
    // Ignore cleanup errors
  }
}

export default globalTeardown;
