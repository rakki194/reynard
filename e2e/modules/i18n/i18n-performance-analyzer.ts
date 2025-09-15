/**
 * I18n Performance Analyzer
 *
 * 🦦 *splashes with analysis precision* Utilities for analyzing
 * and grading i18n performance results.
 */

import {
  BenchmarkSummary,
  PerformanceGrade,
  PerformanceResult,
  PerformanceThresholds,
  defaultPerformanceThresholds,
} from "./i18n-performance-types";

export class I18nPerformanceAnalyzer {
  private readonly thresholds: PerformanceThresholds;

  constructor(thresholds: PerformanceThresholds = defaultPerformanceThresholds) {
    this.thresholds = thresholds;
  }

  /**
   * Check if a performance result passes the thresholds
   */
  isResultPassing(result: PerformanceResult): boolean {
    return (
      result.metrics.loadTime < this.thresholds.maxLoadTime &&
      result.metrics.renderTime < this.thresholds.maxRenderTime &&
      result.metrics.memoryUsage < this.thresholds.maxMemoryUsage &&
      (!result.metrics.languageSwitchTime ||
        result.metrics.languageSwitchTime < this.thresholds.maxLanguageSwitchTime) &&
      (!result.metrics.pluralizationTime || result.metrics.pluralizationTime < this.thresholds.maxPluralizationTime)
    );
  }

  /**
   * Calculate performance grade based on metrics
   */
  calculatePerformanceGrade(loadTime: number, renderTime: number, memoryUsage: number): PerformanceGrade {
    let score = 100;

    // Load time scoring (40% weight)
    if (loadTime > 1000) score -= 40;
    else if (loadTime > 500) score -= 20;
    else if (loadTime > 200) score -= 10;

    // Render time scoring (30% weight)
    if (renderTime > 100) score -= 30;
    else if (renderTime > 50) score -= 15;
    else if (renderTime > 20) score -= 5;

    // Memory usage scoring (30% weight)
    const memoryMB = memoryUsage / 1024 / 1024;
    if (memoryMB > 50) score -= 30;
    else if (memoryMB > 25) score -= 15;
    else if (memoryMB > 10) score -= 5;

    if (score >= 90) return "A";
    if (score >= 80) return "B";
    if (score >= 70) return "C";
    if (score >= 60) return "D";
    return "F";
  }

  /**
   * Generate performance recommendations
   */
  generateRecommendations(summary: BenchmarkSummary): string[] {
    const recommendations: string[] = [];

    if (summary.averageLoadTime > 500) {
      recommendations.push("Consider implementing lazy loading for translations");
      recommendations.push("Use code splitting to reduce initial bundle size");
    }

    if (summary.averageRenderTime > 50) {
      recommendations.push("Optimize translation rendering with memoization");
      recommendations.push("Consider using virtual DOM for large translation sets");
    }

    if (summary.averageMemoryUsage > 25 * 1024 * 1024) {
      recommendations.push("Implement translation cleanup for unused languages");
      recommendations.push("Use weak references for cached translations");
    }

    if (summary.performanceGrade === "F") {
      recommendations.push("Critical performance issues detected - immediate optimization required");
    } else if (summary.performanceGrade === "D") {
      recommendations.push("Performance below acceptable thresholds - optimization recommended");
    }

    return recommendations;
  }

  /**
   * Generate benchmark summary from results
   */
  generateSummary(results: PerformanceResult[]): BenchmarkSummary {
    const totalTests = results.length;
    const passedTests = results.filter(r => this.isResultPassing(r)).length;
    const failedTests = totalTests - passedTests;

    const averageLoadTime = results.reduce((sum, r) => sum + r.metrics.loadTime, 0) / totalTests;
    const averageRenderTime = results.reduce((sum, r) => sum + r.metrics.renderTime, 0) / totalTests;
    const averageMemoryUsage = results.reduce((sum, r) => sum + r.metrics.memoryUsage, 0) / totalTests;

    const performanceGrade = this.calculatePerformanceGrade(averageLoadTime, averageRenderTime, averageMemoryUsage);
    const summary: BenchmarkSummary = {
      totalTests,
      passedTests,
      failedTests,
      averageLoadTime,
      averageRenderTime,
      averageMemoryUsage,
      performanceGrade,
      recommendations: [],
    };

    summary.recommendations = this.generateRecommendations(summary);
    return summary;
  }

  /**
   * Get grade description
   */
  getGradeDescription(grade: PerformanceGrade): string {
    const descriptions = {
      A: "Excellent performance - all metrics well within acceptable thresholds",
      B: "Good performance - minor optimizations may be beneficial",
      C: "Acceptable performance - some optimizations recommended",
      D: "Below average performance - optimization strongly recommended",
      F: "Poor performance - immediate optimization required",
    };

    return descriptions[grade] + "\n\n";
  }
}
