/**
 * 🦦 TRACE DEMO TEST
 *
 * *splashes with tracing excitement* Simple test to demonstrate
 * Playwright tracing capabilities with the enhanced configuration.
 */

import { BrowserContext, Page, expect, test } from "@playwright/test";
import { TraceAnalyzer } from "../../core/monitoring/trace-analyzer";

/**
 * Sets up trace analyzer with comprehensive tracing options
 */
async function setupTraceAnalyzer(context: BrowserContext, traceFile: string): Promise<TraceAnalyzer> {
  const traceAnalyzer = new TraceAnalyzer(context, traceFile);

  await traceAnalyzer.startTracing({
    screenshots: true,
    snapshots: true,
    sources: true,
    attachments: true,
  });

  return traceAnalyzer;
}

/**
 * Performs various actions on the page to generate trace data
 */
async function performTraceActions(page: Page): Promise<void> {
  console.log("🦦 Performing actions for trace data...");

  // Try to click a button if it exists
  try {
    await page.click("button");
    console.log("✅ Clicked button");
  } catch {
    console.log("ℹ️ No button found, continuing...");
  }

  // Try to fill an input if it exists
  try {
    await page.fill("input", "test input");
    console.log("✅ Filled input");
  } catch {
    console.log("ℹ️ No input found, continuing...");
  }

  // Take a screenshot
  await page.screenshot({ path: `./results/screenshots/demo-${Date.now()}.png` });
  console.log("✅ Screenshot taken");

  // Wait a bit to capture more trace data
  await page.waitForTimeout(1000);
}

/**
 * Analyzes trace and generates comprehensive report
 */
async function analyzeAndReport(traceAnalyzer: TraceAnalyzer): Promise<void> {
  console.log("🦦 Analyzing trace...");
  await traceAnalyzer.analyzeTrace();

  // Generate report
  const report = await traceAnalyzer.generateReport();
  console.log("📊 Trace Analysis Report:");
  console.log(report);

  // Save report to file
  const reportPath = `./results/reports/trace-demo-report-${Date.now()}.md`;
  await traceAnalyzer.saveReport(reportPath);
  console.log(`✅ Report saved to: ${reportPath}`);
}

test.describe("Tracing Demo", () => {
  test("Basic tracing demonstration", async ({ page, context }) => {
    console.log("🦦 Starting trace demo...");

    // Create trace analyzer
    const traceFile = `./results/traces/trace-demo-${Date.now()}.zip`;
    const traceAnalyzer = await setupTraceAnalyzer(context, traceFile);

    // Navigate to a page
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Perform actions to generate trace data
    await performTraceActions(page);

    // Stop tracing and save
    const savedTracePath = await traceAnalyzer.stopTracing();
    console.log(`✅ Trace saved to: ${savedTracePath}`);

    // Analyze and generate report
    await analyzeAndReport(traceAnalyzer);
    const analysis = await traceAnalyzer.analyzeTrace();

    // Basic assertions
    expect(analysis.traceFile).toBeDefined();
    expect(analysis.duration).toBeGreaterThanOrEqual(0);

    console.log("🎉 Trace demo completed successfully!");
  });

  test("Trace with performance monitoring", async ({ page, context }) => {
    console.log("🦦 Starting performance trace demo...");

    const traceFile = `./results/traces/performance-demo-${Date.now()}.zip`;
    const traceAnalyzer = new TraceAnalyzer(context, traceFile);

    // Start tracing
    await traceAnalyzer.startTracing();

    // Navigate and perform actions
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Measure performance
    const startTime = Date.now();

    // Simulate some work
    await page.evaluate(() => {
      // Simulate some JavaScript work
      let result = 0;
      for (let i = 0; i < 1000000; i++) {
        result += Math.random();
      }
      return result;
    });

    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log(`🦦 JavaScript execution took: ${duration}ms`);

    // Stop tracing
    await traceAnalyzer.stopTracing();

    // Analyze and report
    const analysis = await traceAnalyzer.analyzeTrace();
    const report = await traceAnalyzer.generateReport();

    console.log("📊 Performance Trace Report:");
    console.log(report);

    // Assertions
    expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
    expect(analysis.traceFile).toBeDefined();

    console.log("🎉 Performance trace demo completed!");
  });
});
