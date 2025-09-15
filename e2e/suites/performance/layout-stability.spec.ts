/**
 * 🦦 LAYOUT STABILITY PERFORMANCE TESTS
 *
 * *splashes with layout monitoring excitement* Comprehensive tests for
 * monitoring layout shifts, visual stability, and Core Web Vitals.
 */

import { expect, test } from "@playwright/test";
import { LayoutMonitor } from "../../core/monitoring/layout-monitor";
import { TraceAnalyzer } from "../../core/monitoring/trace-analyzer";

test.describe("Layout Stability & Performance Monitoring", () => {
  let layoutMonitor: LayoutMonitor;
  let traceAnalyzer: TraceAnalyzer;

  test.beforeEach(async ({ page, context }) => {
    layoutMonitor = new LayoutMonitor(page);
    traceAnalyzer = new TraceAnalyzer(context, `trace-${Date.now()}.zip`);

    // Initialize monitoring
    await layoutMonitor.initialize();
    await traceAnalyzer.startTracing();
    await layoutMonitor.startMonitoring();
  });

  test.afterEach(async () => {
    // Stop monitoring and save traces
    await layoutMonitor.stopMonitoring();
    await traceAnalyzer.stopTracing();
  });

  test("Monitor layout shifts during page load", async ({ page }) => {
    console.log("🦦 Testing layout stability during page load...");

    await page.goto("/");

    // Wait for page to fully load
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000); // Allow for any delayed layout changes

    // Assert layout stability
    await layoutMonitor.assertLayoutStability({
      maxCLS: 0.1, // Good CLS threshold
      maxLayoutShifts: 5,
      maxUnstableElements: 3,
    });

    // Generate and log report
    const report = await layoutMonitor.generateLayoutReport();
    console.log(report);
  });

  test("Monitor layout shifts during user interactions", async ({ page }) => {
    console.log("🦦 Testing layout stability during user interactions...");

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Perform various interactions that might cause layout shifts
    const interactions = [
      () => page.click("button"),
      () => page.fill("input", "test"),
      () => page.selectOption("select", "option1"),
      () => page.check("checkbox"),
      () => page.hover("a"),
    ];

    for (const interaction of interactions) {
      try {
        await interaction();
        await page.waitForTimeout(500); // Allow for layout changes
      } catch (error) {
        // Skip interactions that fail (element not found, etc.)
        console.log(`Skipping interaction: ${error}`);
      }
    }

    // Assert layout stability after interactions
    await layoutMonitor.assertLayoutStability({
      maxCLS: 0.15, // Slightly higher threshold for interactions
      maxLayoutShifts: 10,
      maxUnstableElements: 5,
    });

    const report = await layoutMonitor.generateLayoutReport();
    console.log(report);
  });

  test("Monitor layout shifts during dynamic content loading", async ({ page }) => {
    console.log("🦦 Testing layout stability during dynamic content loading...");

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Simulate dynamic content loading
    await page.evaluate(() => {
      // Add content dynamically
      const container = document.createElement("div");
      container.innerHTML = `
        <div style="height: 200px; background: #f0f0f0; margin: 10px;">
          Dynamic content 1
        </div>
        <div style="height: 150px; background: #e0e0e0; margin: 10px;">
          Dynamic content 2
        </div>
        <div style="height: 100px; background: #d0d0d0; margin: 10px;">
          Dynamic content 3
        </div>
      `;
      document.body.appendChild(container);
    });

    await page.waitForTimeout(1000);

    // Remove some content
    await page.evaluate(() => {
      const container = document.querySelector("div");
      if (container) {
        container.remove();
      }
    });

    await page.waitForTimeout(1000);

    // Assert layout stability
    await layoutMonitor.assertLayoutStability({
      maxCLS: 0.2, // Higher threshold for dynamic content
      maxLayoutShifts: 15,
      maxUnstableElements: 8,
    });

    const report = await layoutMonitor.generateLayoutReport();
    console.log(report);
  });

  test("Monitor Core Web Vitals", async ({ page }) => {
    console.log("🦦 Testing Core Web Vitals...");

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const metrics = await layoutMonitor.stopMonitoring();

    // Assert Core Web Vitals thresholds
    expect(metrics.cumulativeLayoutShift).toBeLessThanOrEqual(0.1); // Good CLS
    expect(metrics.largestContentfulPaint).toBeLessThanOrEqual(2500); // Good LCP
    expect(metrics.firstInputDelay).toBeLessThanOrEqual(100); // Good FID
    expect(metrics.firstContentfulPaint).toBeLessThanOrEqual(1800); // Good FCP
    expect(metrics.totalBlockingTime).toBeLessThanOrEqual(200); // Good TBT

    console.log("✅ All Core Web Vitals within acceptable thresholds");
  });

  test("Compare layout stability across different viewports", async ({ page }) => {
    console.log("🦦 Testing layout stability across viewports...");

    const viewports = [
      { width: 1920, height: 1080, name: "Desktop" },
      { width: 1024, height: 768, name: "Tablet" },
      { width: 375, height: 667, name: "Mobile" },
    ];

    const results = [];

    for (const viewport of viewports) {
      console.log(`Testing ${viewport.name} viewport...`);

      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto("/");
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(1000);

      const metrics = await layoutMonitor.stopMonitoring();
      const stability = await layoutMonitor.captureVisualStability();

      results.push({
        viewport: viewport.name,
        metrics,
        stability,
      });

      // Reset monitoring for next viewport
      await layoutMonitor.startMonitoring();
    }

    // Assert all viewports meet stability requirements
    for (const result of results) {
      expect(result.metrics.cumulativeLayoutShift).toBeLessThanOrEqual(0.1);
      expect(result.stability.unstableElements).toBeLessThanOrEqual(5);
    }

    console.log("✅ All viewports meet layout stability requirements");
    console.log("Viewport Results:", results);
  });

  test("Generate comprehensive performance report", async ({ page }) => {
    console.log("🦦 Generating comprehensive performance report...");

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Perform various actions
    await page.click("button").catch(() => {});
    await page.fill("input", "test").catch(() => {});
    await page.waitForTimeout(1000);

    // Collect all metrics
    const metrics = await layoutMonitor.stopMonitoring();
    const stability = await layoutMonitor.captureVisualStability();
    const layoutReport = await layoutMonitor.generateLayoutReport();

    // Analyze trace
    const traceAnalysis = await traceAnalyzer.analyzeTrace();
    const traceReport = await traceAnalyzer.generateReport();

    // Save reports
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const layoutReportPath = `./results/layout-report-${timestamp}.md`;
    const traceReportPath = `./results/trace-report-${timestamp}.md`;

    await layoutMonitor.generateLayoutReport().then(report => {
      require("fs").writeFileSync(layoutReportPath, report);
    });

    await traceAnalyzer.saveReport(traceReportPath);

    console.log(`✅ Layout report saved: ${layoutReportPath}`);
    console.log(`✅ Trace report saved: ${traceReportPath}`);

    // Assert overall performance
    expect(metrics.cumulativeLayoutShift).toBeLessThanOrEqual(0.1);
    expect(stability.unstableElements).toBeLessThanOrEqual(5);
    expect(traceAnalysis.errors.length).toBeLessThanOrEqual(0);
  });
});
