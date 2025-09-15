/**
 * I18n Markdown Report Generator
 *
 * 🦦 *splashes with markdown precision* Utilities for generating
 * markdown-formatted performance reports.
 */

import { I18nPerformanceAnalyzer } from "./i18n-performance-analyzer";
import { PerformanceResult } from "./i18n-performance-types";
import { I18nSectionGenerator } from "./i18n-section-generator";
import { I18nTableGenerator } from "./i18n-table-generator";

export class I18nMarkdownGenerator {
  private readonly analyzer: I18nPerformanceAnalyzer;
  private readonly tableGenerator: I18nTableGenerator;
  private readonly sectionGenerator: I18nSectionGenerator;

  constructor(analyzer: I18nPerformanceAnalyzer) {
    this.analyzer = analyzer;
    this.tableGenerator = new I18nTableGenerator(analyzer);
    this.sectionGenerator = new I18nSectionGenerator(analyzer);
  }

  /**
   * Generate markdown report
   */
  generateMarkdownReport(results: PerformanceResult[]): string {
    const summary = this.analyzer.generateSummary(results);
    const timestamp = new Date().toISOString();
    const groupedResults = this.groupResultsByApproach(results);

    let report = this.sectionGenerator.generateReportHeader(summary, timestamp);
    report += this.sectionGenerator.generateExecutiveSummary(summary);
    report += this.generateDetailedResults(groupedResults);
    report += this.generatePerformanceComparison(groupedResults);
    report += this.sectionGenerator.generateRecommendations(summary);
    report += this.sectionGenerator.generateMethodology();
    report += this.sectionGenerator.generateReportFooter();

    return report;
  }

  /**
   * Group results by approach
   */
  private groupResultsByApproach(results: PerformanceResult[]): Map<string, PerformanceResult[]> {
    const grouped = new Map<string, PerformanceResult[]>();

    results.forEach(result => {
      if (!grouped.has(result.approach)) {
        grouped.set(result.approach, []);
      }
      grouped.get(result.approach)!.push(result);
    });

    return grouped;
  }

  /**
   * Generate detailed results section
   */
  private generateDetailedResults(groupedResults: Map<string, PerformanceResult[]>): string {
    let section = `## Detailed Results\n\n`;

    groupedResults.forEach((results, approach) => {
      section += `### ${approach}\n\n`;

      const stats = this.tableGenerator.calculateApproachStats(results);

      section += `- **Tests**: ${results.length}\n`;
      section += `- **Pass Rate**: ${stats.passRate.toFixed(1)}%\n`;
      section += `- **Avg Load Time**: ${stats.avgLoadTime.toFixed(2)}ms\n`;
      section += `- **Avg Render Time**: ${stats.avgRenderTime.toFixed(2)}ms\n`;
      section += `- **Avg Memory Usage**: ${(stats.avgMemoryUsage / 1024 / 1024).toFixed(2)}MB\n\n`;

      section += this.tableGenerator.generateResultsTable(results);
    });

    return section;
  }

  /**
   * Generate performance comparison section
   */
  private generatePerformanceComparison(groupedResults: Map<string, PerformanceResult[]>): string {
    let section = `## Performance Comparison\n\n`;
    section += this.tableGenerator.generatePerformanceComparisonTable(groupedResults);
    return section;
  }
}
