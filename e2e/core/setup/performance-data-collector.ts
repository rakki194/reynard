/**
 * 🦦 PERFORMANCE DATA COLLECTOR
 *
 * *splashes with data collection excitement* Sets up performance data collection
 * schemas and baselines for comprehensive performance testing.
 */

import * as fs from "fs";
import * as os from "os";

/**
 * Setup performance data collection
 */
export async function setupPerformanceDataCollection(): Promise<void> {
  console.log("📈 Setting up performance data collection...");

  // Create performance data schema
  await createPerformanceSchema();

  // Create performance baseline
  await createPerformanceBaseline();
}

/**
 * Create performance data schema
 */
async function createPerformanceSchema(): Promise<void> {
  const performanceSchema = {
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    environment: {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      memory: {
        total: os.totalmem(),
        free: os.freemem(),
      },
      cpus: os.cpus().length,
    },
    metrics: {
      layoutShifts: {
        type: "array",
        items: {
          timestamp: "number",
          value: "number",
          hadRecentInput: "boolean",
          sources: "array",
        },
      },
      paintTiming: {
        firstPaint: "number",
        firstContentfulPaint: "number",
        largestContentfulPaint: "number",
      },
      navigationTiming: {
        navigationStart: "number",
        loadEventEnd: "number",
        domContentLoaded: "number",
        firstByte: "number",
        domInteractive: "number",
      },
      resourceTiming: {
        type: "array",
        items: {
          name: "string",
          startTime: "number",
          duration: "number",
          transferSize: "number",
          initiatorType: "string",
        },
      },
      userTiming: {
        type: "array",
        items: {
          name: "string",
          startTime: "number",
          duration: "number",
        },
      },
    },
  };

  const schemaPath = "./results/performance-schema.json";
  fs.writeFileSync(schemaPath, JSON.stringify(performanceSchema, null, 2));
  console.log(`✅ Performance schema saved: ${schemaPath}`);
}

/**
 * Create performance baseline
 */
async function createPerformanceBaseline(): Promise<void> {
  const baseline = {
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    thresholds: {
      cls: 0.1,
      lcp: 2500,
      fid: 100,
      fcp: 1800,
      tbt: 200,
    },
    targets: {
      cls: 0.05,
      lcp: 2000,
      fid: 50,
      fcp: 1500,
      tbt: 100,
    },
  };

  const baselinePath = "./results/performance-baseline.json";
  fs.writeFileSync(baselinePath, JSON.stringify(baseline, null, 2));
  console.log(`✅ Performance baseline saved: ${baselinePath}`);
}
