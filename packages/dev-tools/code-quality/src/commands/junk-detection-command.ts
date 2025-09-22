/**
 * Junk Detection Command Handler
 *
 * Advanced CLI command handler for detecting and analyzing Git-tracked development
 * artifacts in the Reynard monorepo. Provides comprehensive analysis of files
 * that shouldn't be tracked in version control, with configurable filtering,
 * multiple output formats, and integration with the quality gates system.
 */

import { JunkFileDetector, JunkFileAnalysis } from "../JunkFileDetector";
import { handleJsonOutput } from "./output-formatters";
import { handleTableOutput } from "./table-formatter";
import { handleSummaryOutput } from "./summary-formatter";
import { handleFixOption } from "./junk-fix-handler";
import { filterAnalysis } from "./junk-filter-utils";

export interface JunkDetectionOptions {
  project?: string;
  output?: string;
  format?: "json" | "table" | "summary" | "report";
  severity?: "all" | "critical" | "high" | "medium" | "low";
  category?: "all" | "python" | "typescript" | "reynard" | "general";
  fix?: boolean;
}

export async function handleJunkDetectionCommand(options: JunkDetectionOptions): Promise<void> {
  const projectRoot = options.project || process.cwd();
  const format = options.format || "summary";
  const severity = options.severity || "all";
  const category = options.category || "all";

  console.log("🦊 Reynard Junk File Detection");
  console.log("=".repeat(40));

  try {
    // Initialize detector
    const detector = new JunkFileDetector(projectRoot);

    // Run detection
    console.log(`🔍 Scanning project: ${projectRoot}`);
    const analysis = await detector.detectJunkFiles();

    // Filter results based on options
    const filteredAnalysis = filterAnalysis(analysis, severity, category);

    // Display results based on format
    switch (format) {
      case "json":
        await handleJsonOutput(filteredAnalysis, options.output);
        break;
      case "table":
        handleTableOutput(filteredAnalysis);
        break;
      case "report":
        handleReportOutput(filteredAnalysis, detector);
        break;
      case "summary":
      default:
        handleSummaryOutput(filteredAnalysis);
        break;
    }

    // Handle fix option
    if (options.fix && filteredAnalysis.files.length > 0) {
      await handleFixOption(filteredAnalysis, projectRoot);
    }

    // Exit with appropriate code
    if (filteredAnalysis.criticalIssues > 0 || filteredAnalysis.highIssues > 0) {
      console.log("\n❌ Critical or high-priority junk files detected!");
      process.exit(1);
    } else if (filteredAnalysis.totalFiles > 0) {
      console.log("\n⚠️ Junk files detected, but none are critical or high-priority.");
      process.exit(0);
    } else {
      console.log("\n✅ No junk files detected! Repository is clean.");
      process.exit(0);
    }
  } catch (error) {
    console.error("❌ Junk file detection failed:", error);
    process.exit(1);
  }
}

/**
 * Handle report output format
 */
function handleReportOutput(analysis: JunkFileAnalysis, detector: JunkFileDetector): void {
  const report = detector.generateReport(analysis);
  console.log("\n" + report);
}
