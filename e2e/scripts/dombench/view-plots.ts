/**
 * @fileoverview Simple Plot Viewer
 *
 * Opens the generated benchmark plots in a browser using Playwright.
 *
 * @author Pool-Theorist-35 (Reynard Otter Specialist)
 * @since 1.0.0
 */

import { chromium } from "@playwright/test";
import { existsSync } from "fs";
import { join, resolve } from "path";

async function viewPlots(): Promise<void> {
  console.log("🦦 Opening benchmark plots in browser...");

  const resultsDir = join(process.cwd(), "dombench-results");
  const plotFiles = [
    "render-time-performance.html",
    "memory-usage-analysis.html",
    "dom-nodes-analysis.html",
    "scaling-analysis.html",
    "performance-comparison.html",
    "category-breakdown.html",
    "efficiency-analysis.html",
  ];

  try {
    // Launch browser
    const browser = await chromium.launch({
      headless: false, // Show the browser
      slowMo: 500, // Slow down for better viewing
    });

    const context = await browser.newContext();
    const page = await context.newPage();

    for (const file of plotFiles) {
      const filePath = join(resultsDir, file);
      if (existsSync(filePath)) {
        try {
          console.log(`📊 Opening ${file} in browser...`);

          // Convert to file:// URL with absolute path
          const absolutePath = resolve(filePath);
          const fileUrl = `file://${absolutePath}`;

          console.log(`🔗 URL: ${fileUrl}`);
          await page.goto(fileUrl);

          // Wait for the chart to render
          await page.waitForTimeout(3000);

          // Take a screenshot for reference
          const screenshotPath = join(resultsDir, `${file.replace(".html", "")}-screenshot.png`);
          await page.screenshot({ path: screenshotPath, fullPage: true });
          console.log(`📸 Screenshot saved: ${screenshotPath}`);

          // Wait for user to view
          console.log(`⏳ Viewing ${file} for 3 seconds...`);
          await page.waitForTimeout(3000);
        } catch (error) {
          console.log(`⚠️  Could not open ${file}: ${error.message}`);
        }
      } else {
        console.log(`❌ File not found: ${file}`);
      }
    }

    await browser.close();
    console.log("✅ Plot viewing complete!");
  } catch (error) {
    console.log(`⚠️  Could not launch browser: ${error.message}`);
    console.log("📁 You can manually open the HTML files in your browser from the dombench-results/ directory");
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  viewPlots().catch(console.error);
}
