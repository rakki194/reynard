/**
 * Summary Formatter for Junk Detection
 *
 * Provides summary-based output formatting for junk file detection results,
 * including severity breakdowns, sample files, and recommendations.
 */

import { JunkFileAnalysis } from "../JunkFileDetector";

/**
 * Handle summary output format
 */
export function handleSummaryOutput(analysis: JunkFileAnalysis): void {
  console.log("\n📊 Git-Tracked Junk File Detection Results:");
  console.log(`   🐍 Python artifacts: ${analysis.pythonArtifacts} files`);
  console.log(`   📦 TypeScript/JS artifacts: ${analysis.typescriptArtifacts} files`);
  console.log(`   🦊 Reynard-specific artifacts: ${analysis.reynardArtifacts} files`);
  console.log(`   📋 General artifacts: ${analysis.generalArtifacts} files`);
  console.log(`   📋 Total tracked junk files: ${analysis.totalFiles} files`);

  if (analysis.totalFiles > 0) {
    displaySeverityBreakdown(analysis);
    displaySampleFiles(analysis);
    displayRecommendations(analysis);
  } else {
    console.log("\n✅ No tracked junk files detected! Git repository is clean.");
  }
}

/**
 * Display severity breakdown for summary output
 */
function displaySeverityBreakdown(analysis: JunkFileAnalysis): void {
  console.log("\n⚠️ Severity Breakdown:");
  console.log(`   🔴 Critical: ${analysis.criticalIssues} files`);
  console.log(`   🟠 High: ${analysis.highIssues} files`);
  console.log(`   🟡 Medium: ${analysis.mediumIssues} files`);
  console.log(`   🟢 Low: ${analysis.lowIssues} files`);
  console.log(`\n📈 Quality Score: ${analysis.qualityScore}/100`);
}

/**
 * Display sample files for summary output
 */
function displaySampleFiles(analysis: JunkFileAnalysis): void {
  console.log("\n📁 Sample detected files:");
  analysis.files.slice(0, 10).forEach(file => {
    const severityEmoji = {
      critical: "🔴",
      high: "🟠",
      medium: "🟡",
      low: "🟢",
    }[file.severity];
    console.log(`   ${severityEmoji} ${file.file} (${file.category}: ${file.reason})`);
  });

  if (analysis.files.length > 10) {
    console.log(`   ... and ${analysis.files.length - 10} more files`);
  }
}

/**
 * Display recommendations for summary output
 */
function displayRecommendations(analysis: JunkFileAnalysis): void {
  console.log("\n💡 Recommendations:");
  analysis.recommendations.forEach(rec => {
    console.log(`   ${rec}`);
  });
}
