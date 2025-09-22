/**
 * Table Formatter for Junk Detection
 *
 * Provides table-based output formatting for junk file detection results,
 * including summary tables, severity breakdowns, and detailed file listings.
 */

import { JunkFileAnalysis } from "../JunkFileDetector";

/**
 * Handle table output format
 */
export function handleTableOutput(analysis: JunkFileAnalysis): void {
  console.log("\n📊 Junk File Detection Results:");
  console.log("=".repeat(60));

  displaySummaryTable(analysis);
  displaySeverityTable(analysis);
  console.log(`\n📈 Quality Score: ${analysis.qualityScore}/100`);

  // Files table (if any)
  if (analysis.files.length > 0) {
    displayFilesTable(analysis);
  }
}

/**
 * Display summary table
 */
function displaySummaryTable(analysis: JunkFileAnalysis): void {
  console.log("\n📈 Summary:");
  console.log("┌─────────────────────┬─────────┐");
  console.log("│ Category            │ Count   │");
  console.log("├─────────────────────┼─────────┤");
  console.log(`│ Python Artifacts    │ ${analysis.pythonArtifacts.toString().padStart(7)} │`);
  console.log(`│ TypeScript Artifacts│ ${analysis.typescriptArtifacts.toString().padStart(7)} │`);
  console.log(`│ Reynard Artifacts   │ ${analysis.reynardArtifacts.toString().padStart(7)} │`);
  console.log(`│ General Artifacts   │ ${analysis.generalArtifacts.toString().padStart(7)} │`);
  console.log(`│ Total Files         │ ${analysis.totalFiles.toString().padStart(7)} │`);
  console.log("└─────────────────────┴─────────┘");
}

/**
 * Display severity table
 */
function displaySeverityTable(analysis: JunkFileAnalysis): void {
  console.log("\n⚠️ Severity Breakdown:");
  console.log("┌─────────────┬─────────┬─────────┐");
  console.log("│ Severity    │ Count   │ Emoji   │");
  console.log("├─────────────┼─────────┼─────────┤");
  console.log(`│ Critical    │ ${analysis.criticalIssues.toString().padStart(7)} │ 🔴      │`);
  console.log(`│ High        │ ${analysis.highIssues.toString().padStart(7)} │ 🟠      │`);
  console.log(`│ Medium      │ ${analysis.mediumIssues.toString().padStart(7)} │ 🟡      │`);
  console.log(`│ Low         │ ${analysis.lowIssues.toString().padStart(7)} │ 🟢      │`);
  console.log("└─────────────┴─────────┴─────────┘");
}

/**
 * Display files table
 */
function displayFilesTable(analysis: JunkFileAnalysis): void {
  console.log("\n📁 Detected Files:");
  console.log(
    "┌─────────────────────────────────────────────────────────────┬─────────────┬─────────────┬─────────────────────┐"
  );
  console.log(
    "│ File Path                                                  │ Category    │ Severity   │ Reason              │"
  );
  console.log(
    "├─────────────────────────────────────────────────────────────┼─────────────┼─────────────┼─────────────────────┤"
  );

  analysis.files.slice(0, 20).forEach(file => {
    const severityEmoji = {
      critical: "🔴",
      high: "🟠",
      medium: "🟡",
      low: "🟢",
    }[file.severity];

    const truncatedPath = file.file.length > 60 ? file.file.substring(0, 57) + "..." : file.file;
    const truncatedReason = file.reason.length > 18 ? file.reason.substring(0, 15) + "..." : file.reason;

    console.log(
      `│ ${truncatedPath.padEnd(59)} │ ${file.category.padEnd(11)} │ ${(severityEmoji + " " + file.severity).padEnd(11)} │ ${truncatedReason.padEnd(19)} │`
    );
  });

  if (analysis.files.length > 20) {
    console.log(`│ ... and ${analysis.files.length - 20} more files`.padEnd(119) + "│");
  }

  console.log(
    "└─────────────────────────────────────────────────────────────┴─────────────┴─────────────┴─────────────────────┘"
  );
}
