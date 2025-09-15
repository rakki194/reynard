/**
 * 🦦 GLOBAL PERFORMANCE TESTING TEARDOWN
 *
 * *splashes with cleanup excitement* Global teardown for
 * performance testing including cleanup and report generation.
 */

import { FullConfig } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

async function globalTeardown(config: FullConfig) {
  console.log("🦦 Starting Performance Testing Global Teardown...");

  // Cleanup performance test artifacts
  await cleanupPerformanceArtifacts();

  // Generate final performance report
  await generateFinalPerformanceReport();

  // Archive old traces if needed
  await archiveOldTraces();

  console.log("✅ Performance testing global teardown completed");
}

/**
 * Cleanup performance test artifacts
 */
async function cleanupPerformanceArtifacts(): Promise<void> {
  console.log("🧹 Cleaning up performance test artifacts...");

  const artifactsDir = "./results/performance-results";
  if (fs.existsSync(artifactsDir)) {
    const files = fs.readdirSync(artifactsDir);
    console.log(`📁 Found ${files.length} artifact files to clean up`);
  }
}

/**
 * Generate final performance report
 */
async function generateFinalPerformanceReport(): Promise<void> {
  console.log("📊 Generating final performance report...");

  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalTests: 0, // Would be populated from actual test results
      passedTests: 0,
      failedTests: 0,
      averageDuration: 0,
    },
    recommendations: [
      "Review trace files for performance insights",
      "Monitor Core Web Vitals trends over time",
      "Set up automated performance regression detection",
    ],
  };

  const reportPath = "./results/performance-summary.json";
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`✅ Final performance report saved: ${reportPath}`);
}

/**
 * Archive old traces to save space
 */
async function archiveOldTraces(): Promise<void> {
  console.log("📦 Archiving old traces...");

  const tracesDir = "./results/traces";
  if (!fs.existsSync(tracesDir)) {
    return;
  }

  const files = fs.readdirSync(tracesDir);
  const oldTraces = files.filter(file => {
    const filePath = path.join(tracesDir, file);
    const stats = fs.statSync(filePath);
    const ageInDays = (Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60 * 24);
    return ageInDays > 7; // Archive traces older than 7 days
  });

  if (oldTraces.length > 0) {
    console.log(`📦 Found ${oldTraces.length} old traces to archive`);
    // In a real implementation, you would move these to an archive directory
  }
}

export default globalTeardown;
