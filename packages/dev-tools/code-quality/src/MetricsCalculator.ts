/**
 * 🦊 Reynard Metrics Calculator
 *
 * *red fur gleams with precision* Calculates comprehensive code quality
 * metrics with fox-like analytical prowess.
 */

import { CodeQualityMetrics, LanguageAnalysis } from "./types";
import { DocstringAnalyzer, DocstringMetrics } from "./DocstringAnalyzer";

export class MetricsCalculator {
  private readonly docstringAnalyzer: DocstringAnalyzer;

  constructor() {
    this.docstringAnalyzer = new DocstringAnalyzer();
  }

  /**
   * 🦊 Calculate comprehensive metrics
   */
  async calculateMetrics(files: string[], languageAnalyses: LanguageAnalysis[]): Promise<CodeQualityMetrics> {
    let totalLines = 0;
    let totalComments = 0;
    let totalComplexity = 0;

    for (const analysis of languageAnalyses) {
      totalLines += analysis.lines;
      // Comment counting would be language-specific
      totalComments += Math.floor(analysis.lines * 0.1); // Rough estimate
      totalComplexity += analysis.lines * 0.5; // Rough estimate
    }

    // Calculate docstring metrics
    const docstringMetrics = await this.calculateDocstringMetrics(files);

    return {
      linesOfCode: totalLines,
      linesOfComments: totalComments,
      cyclomaticComplexity: totalComplexity,
      cognitiveComplexity: totalComplexity * 1.2,
      maintainabilityIndex: Math.max(0, 100 - (totalComplexity / totalLines) * 100),
      codeSmells: 0, // Will be calculated by issue detection
      bugs: 0,
      vulnerabilities: 0,
      securityHotspots: 0,
      duplications: 0,
      lineCoverage: 0,
      branchCoverage: 0,
      functionCoverage: 0,
      // Documentation metrics
      docstringCoverage: docstringMetrics.coveragePercentage,
      docstringQualityScore: docstringMetrics.qualityScore,
      documentedFunctions: docstringMetrics.documentedFunctions,
      totalFunctions: docstringMetrics.totalFunctions,
      documentedClasses: docstringMetrics.documentedClasses,
      totalClasses: docstringMetrics.totalClasses,
      documentedModules: docstringMetrics.documentedModules,
      totalModules: docstringMetrics.totalModules,
      technicalDebt: 0,
      reliabilityRating: "A",
      securityRating: "A",
      maintainabilityRating: "A",
    };
  }

  /**
   * 🦊 Update metrics with issue data
   */
  updateMetricsWithIssues(
    metrics: CodeQualityMetrics,
    issues: Array<{ type: string; severity: string; effort: number }>
  ): CodeQualityMetrics {
    let codeSmells = 0;
    let bugs = 0;
    let vulnerabilities = 0;
    let securityHotspots = 0;
    let technicalDebt = 0;

    for (const issue of issues) {
      switch (issue.type) {
        case "CODE_SMELL":
          codeSmells++;
          break;
        case "BUG":
          bugs++;
          break;
        case "VULNERABILITY":
          vulnerabilities++;
          break;
        case "SECURITY_HOTSPOT":
          securityHotspots++;
          break;
      }
      technicalDebt += issue.effort;
    }

    return {
      ...metrics,
      codeSmells,
      bugs,
      vulnerabilities,
      securityHotspots,
      technicalDebt,
    };
  }

  /**
   * 🦊 Calculate maintainability rating
   */
  calculateMaintainabilityRating(metrics: CodeQualityMetrics): "A" | "B" | "C" | "D" | "E" {
    if (metrics.maintainabilityIndex >= 80) return "A";
    if (metrics.maintainabilityIndex >= 60) return "B";
    if (metrics.maintainabilityIndex >= 40) return "C";
    if (metrics.maintainabilityIndex >= 20) return "D";
    return "E";
  }

  /**
   * 🦊 Calculate reliability rating
   */
  calculateReliabilityRating(metrics: CodeQualityMetrics): "A" | "B" | "C" | "D" | "E" {
    const bugDensity = (metrics.bugs / Math.max(metrics.linesOfCode, 1)) * 1000;

    if (bugDensity <= 0.1) return "A";
    if (bugDensity <= 0.5) return "B";
    if (bugDensity <= 1.0) return "C";
    if (bugDensity <= 2.0) return "D";
    return "E";
  }

  /**
   * 🦊 Calculate security rating
   */
  calculateSecurityRating(metrics: CodeQualityMetrics): "A" | "B" | "C" | "D" | "E" {
    const vulnerabilityDensity = (metrics.vulnerabilities / Math.max(metrics.linesOfCode, 1)) * 1000;

    if (vulnerabilityDensity === 0) return "A";
    if (vulnerabilityDensity <= 0.1) return "B";
    if (vulnerabilityDensity <= 0.5) return "C";
    if (vulnerabilityDensity <= 1.0) return "D";
    return "E";
  }

  /**
   * 🦦 Calculate docstring metrics
   */
  private async calculateDocstringMetrics(files: string[]): Promise<DocstringMetrics> {
    try {
      // Filter for Python and TypeScript files
      const docstringFiles = files.filter(
        f => f.endsWith(".py") || f.endsWith(".ts") || f.endsWith(".tsx")
      );

      if (docstringFiles.length === 0) {
        return {
          totalFunctions: 0,
          documentedFunctions: 0,
          totalClasses: 0,
          documentedClasses: 0,
          totalModules: 0,
          documentedModules: 0,
          coveragePercentage: 100,
          averageDocstringLength: 0,
          qualityScore: 100,
        };
      }

      const analyses = await this.docstringAnalyzer.analyzeFiles(docstringFiles);
      return this.docstringAnalyzer.getOverallMetrics(analyses);
    } catch (error) {
      console.warn("⚠️ Failed to calculate docstring metrics:", error);
      return {
        totalFunctions: 0,
        documentedFunctions: 0,
        totalClasses: 0,
        documentedClasses: 0,
        totalModules: 0,
        documentedModules: 0,
        coveragePercentage: 0,
        averageDocstringLength: 0,
        qualityScore: 0,
      };
    }
  }
}
