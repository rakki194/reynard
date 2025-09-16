/**
 * Trace Comparison Module
 *
 * Handles comparison logic between two trace analysis results.
 */

import type { ChangeInfo, ComparisonResult, PerformanceChangeInfo, TraceAnalysis } from "./types";

export class TraceComparison {
  /**
   * Compare two trace analysis results
   */
  static compare(analysis1: TraceAnalysis, analysis2: TraceAnalysis): ComparisonResult {
    return {
      duration: this.createChangeInfo(analysis1.totalDuration, analysis2.totalDuration),
      resources: this.createChangeInfo(analysis1.resources.length, analysis2.resources.length),
      errors: this.createChangeInfo(analysis1.errors.length, analysis2.errors.length),
      performance: this.createPerformanceChangeInfo(analysis1.performance, analysis2.performance),
    };
  }

  /**
   * Create change information for a metric
   */
  private static createChangeInfo(old: number, newVal: number): ChangeInfo {
    const change = this.calculateChange(old, newVal);
    const emoji = this.getChangeEmoji(change);

    return {
      old,
      new: newVal,
      change: `${emoji} ${change > 0 ? "+" : ""}${change.toFixed(1)}%`,
      emoji,
    };
  }

  /**
   * Create performance change information
   */
  private static createPerformanceChangeInfo(perf1: any, perf2: any): PerformanceChangeInfo {
    return {
      fcp: this.createChangeInfo(perf1.firstContentfulPaint, perf2.firstContentfulPaint),
      lcp: this.createChangeInfo(perf1.largestContentfulPaint, perf2.largestContentfulPaint),
      cls: this.createChangeInfo(perf1.cumulativeLayoutShift, perf2.cumulativeLayoutShift),
    };
  }

  /**
   * Calculate percentage change between two values
   */
  private static calculateChange(old: number, newVal: number): number {
    if (old === 0) return newVal === 0 ? 0 : 100;
    return ((newVal - old) / old) * 100;
  }

  /**
   * Get emoji for change direction
   */
  private static getChangeEmoji(change: number): string {
    if (change > 0) return "📈";
    if (change < 0) return "📉";
    return "➡️";
  }

  /**
   * Get formatted change string with emoji
   */
  static getFormattedChange(old: number, newVal: number): string {
    const change = this.calculateChange(old, newVal);
    const emoji = this.getChangeEmoji(change);
    const sign = change > 0 ? "+" : "";
    return `${emoji} ${sign}${change.toFixed(1)}%`;
  }

  /**
   * Check if comparison shows improvement
   */
  static isImprovement(comparison: ComparisonResult): boolean {
    // Lower duration, fewer errors, and better performance metrics are improvements
    const durationImproved = comparison.duration.old > comparison.duration.new;
    const errorsImproved = comparison.errors.old > comparison.errors.new;
    const fcpImproved = comparison.performance.fcp.old > comparison.performance.fcp.new;
    const lcpImproved = comparison.performance.lcp.old > comparison.performance.lcp.new;
    const clsImproved = comparison.performance.cls.old < comparison.performance.cls.new;

    return durationImproved || errorsImproved || fcpImproved || lcpImproved || clsImproved;
  }

  /**
   * Get summary of comparison
   */
  static getSummary(comparison: ComparisonResult): string {
    const improvements = [];
    const regressions = [];

    if (comparison.duration.old > comparison.duration.new) {
      improvements.push("faster load time");
    } else if (comparison.duration.old < comparison.duration.new) {
      regressions.push("slower load time");
    }

    if (comparison.errors.old > comparison.errors.new) {
      improvements.push("fewer errors");
    } else if (comparison.errors.old < comparison.errors.new) {
      regressions.push("more errors");
    }

    if (comparison.performance.fcp.old > comparison.performance.fcp.new) {
      improvements.push("better FCP");
    } else if (comparison.performance.fcp.old < comparison.performance.fcp.new) {
      regressions.push("worse FCP");
    }

    let summary = "";
    if (improvements.length > 0) {
      summary += `✅ Improvements: ${improvements.join(", ")}`;
    }
    if (regressions.length > 0) {
      if (summary) summary += "\n";
      summary += `❌ Regressions: ${regressions.join(", ")}`;
    }

    return summary || "➡️ No significant changes detected";
  }
}
