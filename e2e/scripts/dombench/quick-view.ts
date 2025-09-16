/**
 * @fileoverview Quick Plot Viewer
 *
 * Opens a specific benchmark plot quickly for immediate viewing.
 *
 * @author Pool-Theorist-35 (Reynard Otter Specialist)
 * @since 1.0.0
 */

import { chromium } from "@playwright/test";
import { existsSync } from "fs";
import { join, resolve } from "path";

async function quickView(plotName?: string): Promise<void> {
  const resultsDir = join(process.cwd(), "dombench-results");

  // Available plots
  const availablePlots = {
    render: "render-time-performance.html",
    memory: "memory-usage-analysis.html",
    dom: "dom-nodes-analysis.html",
    scaling: "scaling-analysis.html",
    comparison: "performance-comparison.html",
    category: "category-breakdown.html",
    efficiency: "efficiency-analysis.html",
  };

  // If no plot specified, show available options
  if (!plotName) {
    console.log("🦦 Available plots:");
    Object.entries(availablePlots).forEach(([key, file]) => {
      console.log(`  ${key} - ${file}`);
    });
    console.log("\nUsage: pnpm exec tsx quick-view.ts <plot-name>");
    return;
  }

  const fileName = availablePlots[plotName as keyof typeof availablePlots];
  if (!fileName) {
    console.log(`❌ Unknown plot: ${plotName}`);
    console.log("Available plots:", Object.keys(availablePlots).join(", "));
    return;
  }

  const filePath = join(resultsDir, fileName);
  if (!existsSync(filePath)) {
    console.log(`❌ Plot file not found: ${fileName}`);
    console.log("Run the plotting system first: pnpm exec tsx plot-benchmark-results.ts");
    return;
  }

  try {
    console.log(`🦦 Opening ${fileName} in browser...`);

    // Launch browser
    const browser = await chromium.launch({
      headless: false,
      slowMo: 500,
    });

    const context = await browser.newContext();
    const page = await context.newPage();

    // Convert to file:// URL with absolute path
    const absolutePath = resolve(filePath);
    const fileUrl = `file://${absolutePath}`;

    console.log(`🔗 URL: ${fileUrl}`);
    await page.goto(fileUrl);

    // Wait for the chart to render
    await page.waitForTimeout(2000);

    // Take a screenshot
    const screenshotPath = join(resultsDir, `${fileName.replace(".html", "")}-quick-screenshot.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`📸 Screenshot saved: ${screenshotPath}`);

    console.log("⏳ Browser will stay open for 10 seconds...");
    await page.waitForTimeout(10000);

    await browser.close();
    console.log("✅ Quick view complete!");
  } catch (error) {
    console.log(`⚠️  Could not open plot: ${error.message}`);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const plotName = process.argv[2];
  quickView(plotName).catch(console.error);
}
