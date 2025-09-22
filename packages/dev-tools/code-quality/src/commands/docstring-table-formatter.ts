/**
 * Docstring Table Formatter
 *
 * Provides table-based output formatting for docstring analysis results,
 * including file-by-file breakdowns, overall metrics, and issue summaries.
 */

/**
 * Display table format for docstring analysis
 */
export function displayTable(analyses: any[], overallMetrics: any, _options: any): void {
  console.log("\n📊 Docstring Analysis Results");
  console.log("=".repeat(100));

  displayFileBreakdown(analyses);
  displayOverallMetrics(overallMetrics);
  displayIssuesSummary(analyses);
}

/**
 * Display file-by-file breakdown
 */
function displayFileBreakdown(analyses: any[]): void {
  console.log("\n📁 File Analysis:");
  console.log(
    "File".padEnd(50) +
      "Language".padEnd(10) +
      "Functions".padEnd(12) +
      "Classes".padEnd(10) +
      "Coverage".padEnd(10) +
      "Quality"
  );
  console.log("-".repeat(100));

  for (const analysis of analyses) {
    const funcCoverage =
      analysis.metrics.totalFunctions > 0
        ? ((analysis.metrics.documentedFunctions / analysis.metrics.totalFunctions) * 100).toFixed(1) + "%"
        : "N/A";

    const fileName = analysis.file.split("/").pop() || analysis.file;
    const language = analysis.language.toUpperCase();
    const functions = `${analysis.metrics.documentedFunctions}/${analysis.metrics.totalFunctions}`;
    const classes = `${analysis.metrics.documentedClasses}/${analysis.metrics.totalClasses}`;
    const quality = analysis.metrics.qualityScore;

    console.log(
      fileName.padEnd(50) +
        language.padEnd(10) +
        functions.padEnd(12) +
        classes.padEnd(10) +
        funcCoverage.padEnd(10) +
        quality.toString()
    );
  }
}

/**
 * Display overall metrics
 */
function displayOverallMetrics(overallMetrics: any): void {
  console.log("\n📈 Overall Metrics:");
  console.log("-".repeat(50));
  console.log(`Total Functions: ${overallMetrics.totalFunctions}`);
  console.log(`Documented Functions: ${overallMetrics.documentedFunctions}`);
  console.log(`Total Classes: ${overallMetrics.totalClasses}`);
  console.log(`Documented Classes: ${overallMetrics.documentedClasses}`);
  console.log(`Total Modules: ${overallMetrics.totalModules}`);
  console.log(`Documented Modules: ${overallMetrics.documentedModules}`);
  console.log(`Overall Coverage: ${overallMetrics.coveragePercentage.toFixed(1)}%`);
  console.log(`Quality Score: ${overallMetrics.qualityScore}/100`);
  console.log(`Average Docstring Length: ${overallMetrics.averageDocstringLength.toFixed(1)} characters`);
}

/**
 * Display issues summary
 */
function displayIssuesSummary(analyses: any[]): void {
  const totalIssues = analyses.reduce((sum, analysis) => sum + analysis.issues.length, 0);
  if (totalIssues > 0) {
    console.log(`\n⚠️  Total Issues Found: ${totalIssues}`);

    // Group issues by type
    const issueTypes = new Map<string, number>();
    for (const analysis of analyses) {
      for (const issue of analysis.issues) {
        const type = issue.rule;
        issueTypes.set(type, (issueTypes.get(type) || 0) + 1);
      }
    }

    console.log("\nIssue Breakdown:");
    for (const [type, count] of issueTypes) {
      console.log(`  ${type}: ${count}`);
    }
  } else {
    console.log("\n✅ No docstring issues found!");
  }
}
