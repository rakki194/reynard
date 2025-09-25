#!/usr/bin/env tsx

/**
 * Merge Coverage Script
 *
 * Merges E2E coverage data with Vitest coverage data to create
 * a comprehensive coverage report for the entire Reynard ecosystem.
 */

import { CoverageIntegration } from "../core/utils/coverage-integration";
import { promises as fs } from "fs";
import { join } from "path";

async function main() {
  console.log("🦊 Merging E2E and Vitest coverage data...");

  try {
    const coverage = new CoverageIntegration();

    // Initialize coverage system
    await coverage.initialize();

    // Merge coverage reports
    const mergedReport = await coverage.mergeCoverageReports();

    console.log("📊 Coverage merge summary:");
    console.log(`   Report type: ${mergedReport.type}`);
    console.log(`   Files analyzed: ${mergedReport.files.length}`);
    console.log(`   Lines coverage: ${mergedReport.summary.lines.percentage}%`);
    console.log(`   Functions coverage: ${mergedReport.summary.functions.percentage}%`);
    console.log(`   Branches coverage: ${mergedReport.summary.branches.percentage}%`);
    console.log(`   Statements coverage: ${mergedReport.summary.statements.percentage}%`);

    // Check coverage thresholds
    const thresholds = {
      lines: 80,
      functions: 80,
      branches: 80,
      statements: 80,
    };

    const failedThresholds = [];
    if (mergedReport.summary.lines.percentage < thresholds.lines) {
      failedThresholds.push(`Lines: ${mergedReport.summary.lines.percentage}% < ${thresholds.lines}%`);
    }
    if (mergedReport.summary.functions.percentage < thresholds.functions) {
      failedThresholds.push(`Functions: ${mergedReport.summary.functions.percentage}% < ${thresholds.functions}%`);
    }
    if (mergedReport.summary.branches.percentage < thresholds.branches) {
      failedThresholds.push(`Branches: ${mergedReport.summary.branches.percentage}% < ${thresholds.branches}%`);
    }
    if (mergedReport.summary.statements.percentage < thresholds.statements) {
      failedThresholds.push(`Statements: ${mergedReport.summary.statements.percentage}% < ${thresholds.statements}%`);
    }

    if (failedThresholds.length > 0) {
      console.log("⚠️ Coverage thresholds not met:");
      failedThresholds.forEach(threshold => console.log(`   ${threshold}`));
    } else {
      console.log("✅ All coverage thresholds met!");
    }

    // Save threshold check results
    const thresholdResults = {
      passed: failedThresholds.length === 0,
      failedThresholds,
      summary: mergedReport.summary,
      timestamp: new Date().toISOString(),
    };

    const coverageDir = join(process.cwd(), "..", "coverage");
    await fs.writeFile(join(coverageDir, "threshold-check.json"), JSON.stringify(thresholdResults, null, 2));

    console.log("✅ Coverage merge completed");
  } catch (error) {
    console.error("❌ Error merging coverage:", error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
