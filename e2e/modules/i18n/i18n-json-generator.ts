/**
 * I18n JSON Report Generator
 *
 * 🦦 *splashes with JSON precision* Utilities for generating
 * JSON-formatted performance reports.
 */

import { I18nPerformanceAnalyzer } from "./i18n-performance-analyzer";
import { PerformanceResult } from "./i18n-performance-types";

export class I18nJsonGenerator {
  private readonly analyzer: I18nPerformanceAnalyzer;

  constructor(analyzer: I18nPerformanceAnalyzer) {
    this.analyzer = analyzer;
  }

  /**
   * Generate JSON report
   */
  generateJSONReport(results: PerformanceResult[]): string {
    const summary = this.analyzer.generateSummary(results);
    const groupedResults = this.groupResultsByApproach(results);

    const report = {
      timestamp: new Date().toISOString(),
      summary,
      results,
      groupedResults: Object.fromEntries(groupedResults),
      metadata: this.generateMetadata(results, groupedResults),
    };

    return JSON.stringify(report, null, 2);
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
   * Generate metadata for the report
   */
  private generateMetadata(results: PerformanceResult[], groupedResults: Map<string, PerformanceResult[]>) {
    return {
      totalApproaches: groupedResults.size,
      browsers: [...new Set(results.map(r => r.browser))],
      testNames: [...new Set(results.map(r => r.testName))],
      totalResults: results.length,
      dateRange: this.getDateRange(results),
    };
  }

  /**
   * Get date range from results
   */
  private getDateRange(results: PerformanceResult[]): { earliest: string; latest: string } | null {
    if (results.length === 0) return null;

    const timestamps = results.map(r => r.timestamp.getTime());
    const earliest = new Date(Math.min(...timestamps));
    const latest = new Date(Math.max(...timestamps));

    return {
      earliest: earliest.toISOString(),
      latest: latest.toISOString(),
    };
  }
}
