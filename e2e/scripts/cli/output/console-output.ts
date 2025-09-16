/**
 * Console Output Handler
 *
 * Handles outputting trace analysis results in human-readable console format.
 */

import type { CLIOptions, TraceAnalysis } from "../types";

export class ConsoleOutputHandler {
  /**
   * Output analysis results in console format
   */
  static output(analysis: TraceAnalysis, options: CLIOptions): void {
    const { resources, performance, bottlenecks, recommendations } = analysis;

    console.log(`\n📊 Trace Analysis: ${analysis.traceFile}`);
    console.log(`⏱️  Duration: ${analysis.totalDuration.toFixed(1)}ms`);
    console.log(`📦 Resources: ${resources.length}`);
    console.log(`❌ Errors: ${analysis.errors.length}`);
    console.log(`📸 Screenshots: ${analysis.screenshots.length}`);

    this.outputPerformanceMetrics(analysis, performance);
    this.outputBottlenecks(bottlenecks);
    this.outputRecommendations(recommendations);

    if (options.verbose) {
      this.outputAllResources(resources);
    }
  }

  /**
   * Output performance metrics section
   */
  private static outputPerformanceMetrics(analysis: TraceAnalysis, performance: any): void {
    console.log("\n🚨 Performance Metrics:");
    console.log(`  Page Load Time: ${analysis.totalDuration.toFixed(0)}ms`);
    console.log(`  First Contentful Paint: ${performance.firstContentfulPaint.toFixed(0)}ms`);
    console.log(`  Largest Contentful Paint: ${performance.largestContentfulPaint.toFixed(0)}ms`);
    console.log(`  Cumulative Layout Shift: ${performance.cumulativeLayoutShift.toFixed(3)}`);
  }

  /**
   * Output bottlenecks section
   */
  private static outputBottlenecks(bottlenecks: any): void {
    console.log("\n🐌 Slowest Resources:");
    bottlenecks.slowestResources.slice(0, 5).forEach((r: any, i: number) => {
      console.log(`  ${i + 1}. ${r.filename}: ${r.totalTime.toFixed(1)}ms`);
    });

    console.log("\n⏳ Server Delays (>200ms):");
    bottlenecks.serverDelays.slice(0, 5).forEach((r: any, i: number) => {
      console.log(`  ${i + 1}. ${r.filename}: ${r.waitTime.toFixed(1)}ms wait`);
    });
  }

  /**
   * Output recommendations section
   */
  private static outputRecommendations(recommendations: string[]): void {
    console.log("\n🎯 Top Recommendations:");
    recommendations.slice(0, 3).forEach((rec: string, i: number) => {
      console.log(`  ${i + 1}. ${rec}`);
    });
  }

  /**
   * Output all resources (verbose mode)
   */
  private static outputAllResources(resources: any[]): void {
    console.log("\n📋 All Resources:");
    resources.forEach((r: any, i: number) => {
      const sizeText = r.size > 0 ? `${(r.size / 1024).toFixed(1)}KB` : "unknown";
      console.log(`  ${i + 1}. ${r.filename} - ${r.totalTime.toFixed(1)}ms (${sizeText})`);
    });
  }

  /**
   * Output comparison results in console format
   */
  static outputComparison(analysis1: TraceAnalysis, analysis2: TraceAnalysis): void {
    console.log("\n🔄 Comparing traces...");
    console.log("\n📊 Comparison Results:");
    console.log("=".repeat(50));

    this.outputBasicComparison(analysis1, analysis2);
    this.outputPerformanceComparison(analysis1, analysis2);
  }

  /**
   * Output basic comparison metrics
   */
  private static outputBasicComparison(analysis1: TraceAnalysis, analysis2: TraceAnalysis): void {
    console.log(
      `Duration: ${analysis1.totalDuration.toFixed(1)}ms → ${analysis2.totalDuration.toFixed(1)}ms (${this.getChange(analysis1.totalDuration, analysis2.totalDuration)})`
    );
    console.log(`Resources: ${analysis1.resources.length} → ${analysis2.resources.length}`);
    console.log(`Errors: ${analysis1.errors.length} → ${analysis2.errors.length}`);
  }

  /**
   * Output performance comparison metrics
   */
  private static outputPerformanceComparison(analysis1: TraceAnalysis, analysis2: TraceAnalysis): void {
    console.log("\nPerformance Changes:");
    console.log(
      `FCP: ${analysis1.performance.firstContentfulPaint.toFixed(0)}ms → ${analysis2.performance.firstContentfulPaint.toFixed(0)}ms (${this.getChange(analysis1.performance.firstContentfulPaint, analysis2.performance.firstContentfulPaint)})`
    );
    console.log(
      `LCP: ${analysis1.performance.largestContentfulPaint.toFixed(0)}ms → ${analysis2.performance.largestContentfulPaint.toFixed(0)}ms (${this.getChange(analysis1.performance.largestContentfulPaint, analysis2.performance.largestContentfulPaint)})`
    );
    console.log(
      `CLS: ${analysis1.performance.cumulativeLayoutShift.toFixed(3)} → ${analysis2.performance.cumulativeLayoutShift.toFixed(3)} (${this.getChange(analysis1.performance.cumulativeLayoutShift, analysis2.performance.cumulativeLayoutShift)})`
    );
  }

  /**
   * Format change percentage with emoji
   */
  private static getChange(old: number, newVal: number): string {
    const change = ((newVal - old) / old) * 100;
    const sign = change > 0 ? "+" : "";
    const emoji = change > 0 ? "📈" : change < 0 ? "📉" : "➡️";
    return `${emoji} ${sign}${change.toFixed(1)}%`;
  }
}
