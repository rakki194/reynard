/**
 * Docstring Action Handler
 *
 * Handles the main action logic for the docstring command,
 * including file discovery, analysis, and result processing.
 */

import { DocstringAnalyzer } from "../DocstringAnalyzer";
import { FileDiscoveryService } from "../FileDiscoveryService";
import { displaySummary } from "./docstring-summary-formatter";
import { displayTable } from "./docstring-table-formatter";

/**
 * Handle docstring analysis action
 */
export async function handleDocstringAction(options: any): Promise<void> {
  try {
    console.log("🦦 Starting docstring analysis...");

    const analyzer = new DocstringAnalyzer();
    const fileDiscovery = new FileDiscoveryService();

    // Discover files
    const files = await fileDiscovery.discoverFiles(options.path);
    const docstringFiles = files.filter(f => f.endsWith(".py") || f.endsWith(".ts") || f.endsWith(".tsx"));

    if (docstringFiles.length === 0) {
      console.log("ℹ️ No Python or TypeScript files found to analyze");
      return;
    }

    console.log(`📁 Found ${docstringFiles.length} files to analyze`);

    // Analyze files
    const analyses = await analyzer.analyzeFiles(docstringFiles);
    const overallMetrics = analyzer.getOverallMetrics(analyses);

    // Display results based on format
    switch (options.format) {
      case "json":
        console.log(JSON.stringify({ analyses, overallMetrics }, null, 2));
        break;
      case "summary":
        displaySummary(overallMetrics, options);
        break;
      case "table":
      default:
        displayTable(analyses, overallMetrics, options);
        break;
    }

    // Check thresholds
    checkQualityGates(overallMetrics, options);
  } catch (error) {
    console.error("❌ Docstring analysis failed:", error);
    process.exit(1);
  }
}

/**
 * Check quality gates and exit with appropriate code
 */
function checkQualityGates(overallMetrics: any, options: any): void {
  const coveragePassed = overallMetrics.coveragePercentage >= parseFloat(options.minCoverage);
  const qualityPassed = overallMetrics.qualityScore >= parseFloat(options.minQuality);

  if (!coveragePassed || !qualityPassed) {
    console.log("\n❌ Quality gates failed:");
    if (!coveragePassed) {
      console.log(`  - Docstring coverage: ${overallMetrics.coveragePercentage.toFixed(1)}% < ${options.minCoverage}%`);
    }
    if (!qualityPassed) {
      console.log(`  - Quality score: ${overallMetrics.qualityScore} < ${options.minQuality}`);
    }
    process.exit(1);
  } else {
    console.log("\n✅ All quality gates passed!");
  }
}
