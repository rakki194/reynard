#!/usr/bin/env tsx

/**
 * Generate Coverage Report Script
 * 
 * Generates comprehensive coverage reports including HTML, text, and LCOV
 * formats for the merged E2E and Vitest coverage data.
 */

import { CoverageIntegration } from "../core/utils/coverage-integration";
import { promises as fs } from "fs";
import { join } from "path";

async function main() {
  console.log("🦊 Generating comprehensive coverage reports...");

  try {
    const coverage = new CoverageIntegration();
    
    // Initialize coverage system
    await coverage.initialize();
    
    // Generate comprehensive report
    await coverage.generateComprehensiveReport();
    
    const coverageDir = join(process.cwd(), "..", "coverage");
    
    // Check if reports were generated
    const reports = await Promise.all([
      fs.access(join(coverageDir, "comprehensive-report.html")).then(() => true).catch(() => false),
      fs.access(join(coverageDir, "coverage-summary.txt")).then(() => true).catch(() => false),
      fs.access(join(coverageDir, "lcov.info")).then(() => true).catch(() => false),
      fs.access(join(coverageDir, "merged-coverage.json")).then(() => true).catch(() => false),
    ]);
    
    console.log("📊 Generated reports:");
    if (reports[0]) console.log("   ✅ HTML Report: coverage/comprehensive-report.html");
    if (reports[1]) console.log("   ✅ Text Summary: coverage/coverage-summary.txt");
    if (reports[2]) console.log("   ✅ LCOV Report: coverage/lcov.info");
    if (reports[3]) console.log("   ✅ JSON Report: coverage/merged-coverage.json");
    
    // Display summary
    try {
      const summaryPath = join(coverageDir, "coverage-summary.txt");
      const summary = await fs.readFile(summaryPath, "utf-8");
      console.log("\n" + summary);
    } catch (error) {
      console.log("⚠️ Could not display coverage summary");
    }
    
    // Check threshold results
    try {
      const thresholdPath = join(coverageDir, "threshold-check.json");
      const thresholdData = await fs.readFile(thresholdPath, "utf-8");
      const thresholds = JSON.parse(thresholdData);
      
      if (!thresholds.passed) {
        console.log("\n⚠️ Coverage Quality Check:");
        console.log("Some coverage thresholds were not met. Consider:");
        console.log("1. Adding more unit tests for low-coverage areas");
        console.log("2. Enhancing E2E tests to cover more user workflows");
        console.log("3. Reviewing and improving test quality");
        
        // Don't exit with error, just warn
      } else {
        console.log("\n✅ Coverage Quality Check: All thresholds met!");
      }
    } catch (error) {
      console.log("⚠️ Could not check coverage thresholds");
    }
    
    console.log("\n🎯 Next steps:");
    console.log("1. View HTML report: open coverage/comprehensive-report.html");
    console.log("2. Review text summary: cat coverage/coverage-summary.txt");
    console.log("3. Integrate LCOV with external tools: coverage/lcov.info");
    
    console.log("\n✅ Coverage report generation completed");
    
  } catch (error) {
    console.error("❌ Error generating coverage report:", error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
