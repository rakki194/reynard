/**
 * Docstring Summary Formatter
 *
 * Provides summary-based output formatting for docstring analysis results,
 * including coverage metrics, quality scores, and grade assessments.
 */

/**
 * Display summary format for docstring analysis
 */
export function displaySummary(metrics: any, _options: any): void {
  console.log("\n📊 Docstring Analysis Summary");
  console.log("=".repeat(50));
  console.log(`📁 Total Files Analyzed: ${metrics.totalFunctions + metrics.totalClasses + metrics.totalModules}`);
  console.log(
    `📝 Functions: ${metrics.documentedFunctions}/${metrics.totalFunctions} documented (${((metrics.documentedFunctions / Math.max(metrics.totalFunctions, 1)) * 100).toFixed(1)}%)`
  );
  console.log(
    `🏗️  Classes: ${metrics.documentedClasses}/${metrics.totalClasses} documented (${((metrics.documentedClasses / Math.max(metrics.totalClasses, 1)) * 100).toFixed(1)}%)`
  );
  console.log(
    `📦 Modules: ${metrics.documentedModules}/${metrics.totalModules} documented (${((metrics.documentedModules / Math.max(metrics.totalModules, 1)) * 100).toFixed(1)}%)`
  );
  console.log(`📈 Overall Coverage: ${metrics.coveragePercentage.toFixed(1)}%`);
  console.log(`⭐ Quality Score: ${metrics.qualityScore}/100`);
  console.log(`📏 Average Docstring Length: ${metrics.averageDocstringLength.toFixed(1)} characters`);

  // Quality assessment
  const coverageGrade = getGrade(metrics.coveragePercentage);
  const qualityGrade = getGrade(metrics.qualityScore);
  console.log(`\n🎯 Coverage Grade: ${coverageGrade}`);
  console.log(`🎯 Quality Grade: ${qualityGrade}`);
}

/**
 * Get grade based on score
 */
function getGrade(score: number): string {
  if (score >= 90) return "A+";
  if (score >= 80) return "A";
  if (score >= 70) return "B";
  if (score >= 60) return "C";
  if (score >= 50) return "D";
  return "F";
}
