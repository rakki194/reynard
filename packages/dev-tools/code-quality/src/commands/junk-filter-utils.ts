/**
 * Junk Filter Utilities
 *
 * Provides filtering functionality for junk file detection results,
 * allowing filtering by severity and category with proper metric recalculation.
 */

import { JunkFileAnalysis } from "../JunkFileDetector";

/**
 * Filter analysis results based on severity and category
 */
export function filterAnalysis(analysis: JunkFileAnalysis, severity: string, category: string): JunkFileAnalysis {
  let filteredFiles = analysis.files;

  // Filter by severity
  if (severity !== "all") {
    filteredFiles = filteredFiles.filter(file => file.severity === severity);
  }

  // Filter by category
  if (category !== "all") {
    filteredFiles = filteredFiles.filter(file => file.category === category);
  }

  // Recalculate metrics for filtered results
  return recalculateMetrics(analysis, filteredFiles);
}

/**
 * Recalculate metrics for filtered results
 */
function recalculateMetrics(originalAnalysis: JunkFileAnalysis, filteredFiles: JunkFileAnalysis['files']): JunkFileAnalysis {
  const pythonArtifacts = filteredFiles.filter(f => f.category === "python").length;
  const typescriptArtifacts = filteredFiles.filter(f => f.category === "typescript").length;
  const reynardArtifacts = filteredFiles.filter(f => f.category === "reynard").length;
  const generalArtifacts = filteredFiles.filter(f => f.category === "general").length;

  const criticalIssues = filteredFiles.filter(f => f.severity === "critical").length;
  const highIssues = filteredFiles.filter(f => f.severity === "high").length;
  const mediumIssues = filteredFiles.filter(f => f.severity === "medium").length;
  const lowIssues = filteredFiles.filter(f => f.severity === "low").length;

  // Recalculate quality score
  const totalIssues = filteredFiles.length;
  const qualityScore =
    totalIssues === 0
      ? 100
      : Math.max(0, 100 - (criticalIssues * 20 + highIssues * 10 + mediumIssues * 5 + lowIssues * 2));

  return {
    ...originalAnalysis,
    totalFiles: filteredFiles.length,
    pythonArtifacts,
    typescriptArtifacts,
    reynardArtifacts,
    generalArtifacts,
    criticalIssues,
    highIssues,
    mediumIssues,
    lowIssues,
    files: filteredFiles,
    qualityScore: Math.round(qualityScore),
  };
}
