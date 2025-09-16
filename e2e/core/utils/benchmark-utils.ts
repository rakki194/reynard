/**
 * @fileoverview Benchmark utility functions for component performance testing
 *
 * Comprehensive utilities for measuring, analyzing, and reporting component
 * rendering performance across different approaches and scenarios.
 *
 * @author Pool-Theorist-35 (Reynard Otter Specialist)
 * @since 1.0.0
 */

import { BenchmarkConfig, BenchmarkReport, BenchmarkResult, PerformanceMetrics } from "../types/benchmark-types";

/**
 * Create a benchmark suite with configuration
 */
export function createBenchmarkSuite(config?: Partial<BenchmarkConfig>) {
  const defaultConfig: BenchmarkConfig = {
    iterations: 10,
    warmupRuns: 3,
    componentCounts: [1, 10, 50, 100, 500],
    renderingApproaches: ["csr", "ssr", "lazy", "virtual", "static"],
  };

  const finalConfig = { ...defaultConfig, ...config };

  return {
    config: finalConfig,
    calculateStatistics,
    generateReport,
    exportResults,
    detectRegressions,
    createPerformanceReport,
  };
}

/**
 * Calculate statistical metrics from performance measurements
 */
export function calculateStatistics(
  metrics: PerformanceMetrics[],
  metadata: {
    category: string;
    approach: string;
    componentCount: number;
    testName: string;
  }
): BenchmarkResult {
  const renderTimes = metrics.map(m => m.renderTime);
  const memoryUsages = metrics.map(m => m.memoryUsage);
  const memoryDeltas = metrics.map(m => m.memoryDelta);

  return {
    ...metadata,
    averageRenderTime: calculateAverage(renderTimes),
    stdDeviation: calculateStandardDeviation(renderTimes),
    minRenderTime: Math.min(...renderTimes),
    maxRenderTime: Math.max(...renderTimes),
    averageMemoryUsage: calculateAverage(memoryUsages),
    averageMemoryDelta: calculateAverage(memoryDeltas),
    iterations: metrics.length,
    timestamp: new Date(),
  };
}

/**
 * Generate comprehensive benchmark report
 */
export function generateReport(results: BenchmarkResult[]): string {
  const report: BenchmarkReport = {
    metadata: {
      timestamp: new Date(),
      environment: getCurrentEnvironment(),
      config: {
        iterations: 10,
        warmupRuns: 3,
        componentCounts: [1, 10, 50, 100, 500],
        renderingApproaches: ["csr", "ssr", "lazy", "virtual", "static"],
      },
    },
    results,
    recommendations: generateRecommendations(results),
    regressions: detectRegressions(results),
    summary: generateSummary(results),
  };

  return formatReport(report);
}

/**
 * Export benchmark results to JSON
 */
export function exportResults(results: BenchmarkResult[]): string {
  return JSON.stringify(
    {
      timestamp: new Date().toISOString(),
      results,
      summary: generateSummary(results),
    },
    null,
    2
  );
}

/**
 * Detect performance regressions by comparing with baseline
 */
export function detectRegressions(results: BenchmarkResult[]): Array<{
  testName: string;
  previousTime: number;
  currentTime: number;
  regressionPercent: number;
}> {
  // This would typically compare with stored baseline results
  // For now, we'll return empty array as we don't have baseline data
  return [];
}

/**
 * Create comprehensive performance report
 */
export function createPerformanceReport(results: BenchmarkResult[]): BenchmarkReport {
  return {
    metadata: {
      timestamp: new Date(),
      environment: getCurrentEnvironment(),
      config: {
        iterations: 10,
        warmupRuns: 3,
        componentCounts: [1, 10, 50, 100, 500],
        renderingApproaches: ["csr", "ssr", "lazy", "virtual", "static"],
      },
    },
    results,
    recommendations: generateRecommendations(results),
    regressions: detectRegressions(results),
    summary: generateSummary(results),
  };
}

// Helper functions

function calculateAverage(values: number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function calculateStandardDeviation(values: number[]): number {
  const average = calculateAverage(values);
  const squaredDiffs = values.map(value => Math.pow(value - average, 2));
  const avgSquaredDiff = calculateAverage(squaredDiffs);
  return Math.sqrt(avgSquaredDiff);
}

function getCurrentEnvironment() {
  return {
    browser: "chromium", // This would be detected from Playwright
    browserVersion: "latest",
    os: "linux",
    device: "desktop",
    resolution: "1920x1080",
    network: "fast-3g",
    cpuThrottling: 1,
    memoryConstraints: 0,
  };
}

function generateRecommendations(results: BenchmarkResult[]): Array<{
  category: string;
  approach: string;
  reason: string;
  confidence: number;
}> {
  const recommendations = [];
  const resultsByCategory = groupBy(results, "category");

  for (const [category, categoryResults] of Object.entries(resultsByCategory)) {
    const bestResult = categoryResults.reduce((best, current) => {
      return current.averageRenderTime < best.averageRenderTime ? current : best;
    }, categoryResults[0]);

    let reason = "";
    let confidence = 0.8;

    switch (category) {
      case "primitives":
        reason = "Fastest rendering for simple UI components";
        confidence = 0.9;
        break;
      case "layouts":
        reason = "Optimal for complex layout structures";
        confidence = 0.85;
        break;
      case "data":
        reason = "Best performance for data-heavy components";
        confidence = 0.8;
        break;
      case "overlays":
        reason = "Efficient for on-demand rendering";
        confidence = 0.75;
        break;
      default:
        reason = "Best overall performance for this category";
        confidence = 0.7;
    }

    recommendations.push({
      category,
      approach: bestResult.approach,
      reason,
      confidence,
    });
  }

  return recommendations;
}

function generateSummary(results: BenchmarkResult[]) {
  const allRenderTimes = results.map(r => r.averageRenderTime);
  const approaches = [...new Set(results.map(r => r.approach))];

  const approachPerformance = approaches.map(approach => {
    const approachResults = results.filter(r => r.approach === approach);
    const avgTime = calculateAverage(approachResults.map(r => r.averageRenderTime));
    return { approach, avgTime };
  });

  const fastestApproach = approachPerformance.reduce(
    (best, current) => (current.avgTime < best.avgTime ? current : best),
    approachPerformance[0]
  ).approach;

  const slowestApproach = approachPerformance.reduce(
    (best, current) => (current.avgTime > best.avgTime ? current : best),
    approachPerformance[0]
  ).approach;

  // Find most memory efficient approach
  const memoryEfficientApproach = approaches.reduce((best, current) => {
    const currentResults = results.filter(r => r.approach === current);
    const currentMemory = calculateAverage(currentResults.map(r => r.averageMemoryDelta));
    const bestResults = results.filter(r => r.approach === best);
    const bestMemory = calculateAverage(bestResults.map(r => r.averageMemoryDelta));
    return currentMemory < bestMemory ? current : best;
  }, approaches[0]);

  return {
    totalTests: results.length,
    averageRenderTime: calculateAverage(allRenderTimes),
    fastestApproach,
    slowestApproach,
    memoryEfficientApproach,
  };
}

function formatReport(report: BenchmarkReport): string {
  let output = "\n🦦 === REYNARD COMPONENT RENDERING BENCHMARK REPORT ===\n\n";

  output += `📊 SUMMARY:\n`;
  output += `  Total Tests: ${report.summary.totalTests}\n`;
  output += `  Average Render Time: ${report.summary.averageRenderTime.toFixed(2)}ms\n`;
  output += `  Fastest Approach: ${report.summary.fastestApproach.toUpperCase()}\n`;
  output += `  Slowest Approach: ${report.summary.slowestApproach.toUpperCase()}\n`;
  output += `  Most Memory Efficient: ${report.summary.memoryEfficientApproach.toUpperCase()}\n\n`;

  output += `🎯 RECOMMENDATIONS:\n`;
  report.recommendations.forEach(rec => {
    output += `  • ${rec.category}: Use ${rec.approach.toUpperCase()} (${(rec.confidence * 100).toFixed(0)}% confidence)\n`;
    output += `    ${rec.reason}\n`;
  });

  output += "\n🦦 *splashes with satisfaction* Benchmark analysis complete!\n";

  return output;
}

function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce(
    (groups, item) => {
      const group = String(item[key]);
      if (!groups[group]) {
        groups[group] = [];
      }
      groups[group].push(item);
      return groups;
    },
    {} as Record<string, T[]>
  );
}
