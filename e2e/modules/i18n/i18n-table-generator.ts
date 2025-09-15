/**
 * I18n Table Generator
 *
 * 🦦 *splashes with table precision* Utilities for generating
 * markdown tables for performance reports.
 */

import { I18nPerformanceAnalyzer } from "./i18n-performance-analyzer";
import { PerformanceResult } from "./i18n-performance-types";

export class I18nTableGenerator {
  private readonly analyzer: I18nPerformanceAnalyzer;

  constructor(analyzer: I18nPerformanceAnalyzer) {
    this.analyzer = analyzer;
  }

  /**
   * Generate results table for an approach
   */
  generateResultsTable(results: PerformanceResult[]): string {
    let table = `| Test | Load Time (ms) | Render Time (ms) | Memory (MB) | Status |\n`;
    table += `|------|----------------|------------------|-------------|--------|\n`;

    results.forEach((result, index) => {
      const status = this.analyzer.isResultPassing(result) ? "✅ PASS" : "❌ FAIL";
      table += `| ${index + 1} | ${result.metrics.loadTime.toFixed(2)} | ${result.metrics.renderTime.toFixed(2)} | ${(result.metrics.memoryUsage / 1024 / 1024).toFixed(2)} | ${status} |\n`;
    });

    return table + `\n`;
  }

  /**
   * Generate performance comparison table
   */
  generatePerformanceComparisonTable(groupedResults: Map<string, PerformanceResult[]>): string {
    let table = `| Approach | Avg Load Time (ms) | Avg Render Time (ms) | Avg Memory (MB) | Pass Rate |\n`;
    table += `|----------|-------------------|---------------------|-----------------|----------|\n`;

    groupedResults.forEach((results, approach) => {
      const avgLoadTime = results.reduce((sum, r) => sum + r.metrics.loadTime, 0) / results.length;
      const avgRenderTime = results.reduce((sum, r) => sum + r.metrics.renderTime, 0) / results.length;
      const avgMemoryUsage = results.reduce((sum, r) => sum + r.metrics.memoryUsage, 0) / results.length;
      const passRate = (results.filter(r => this.analyzer.isResultPassing(r)).length / results.length) * 100;

      table += `| ${approach} | ${avgLoadTime.toFixed(2)} | ${avgRenderTime.toFixed(2)} | ${(avgMemoryUsage / 1024 / 1024).toFixed(2)} | ${passRate.toFixed(1)}% |\n`;
    });

    return table + `\n`;
  }

  /**
   * Calculate approach statistics
   */
  calculateApproachStats(results: PerformanceResult[]): {
    avgLoadTime: number;
    avgRenderTime: number;
    avgMemoryUsage: number;
    passRate: number;
  } {
    const avgLoadTime = results.reduce((sum, r) => sum + r.metrics.loadTime, 0) / results.length;
    const avgRenderTime = results.reduce((sum, r) => sum + r.metrics.renderTime, 0) / results.length;
    const avgMemoryUsage = results.reduce((sum, r) => sum + r.metrics.memoryUsage, 0) / results.length;
    const passRate = (results.filter(r => this.analyzer.isResultPassing(r)).length / results.length) * 100;

    return { avgLoadTime, avgRenderTime, avgMemoryUsage, passRate };
  }
}
