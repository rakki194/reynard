/**
 * JSON Output Handler
 *
 * Handles outputting trace analysis results in JSON format.
 */

import { writeFileSync } from "fs";
import type { CLIOptions, TraceAnalysis } from "../types";

export class JsonOutputHandler {
  /**
   * Output analysis results in JSON format
   */
  static async output(analysis: TraceAnalysis, options: CLIOptions): Promise<void> {
    const outputPath = options.output || `trace-analysis-${Date.now()}.json`;
    const jsonOutput = JSON.stringify(analysis, null, 2);

    if (options.output) {
      writeFileSync(outputPath, jsonOutput);
      console.log(`📄 JSON report saved to: ${outputPath}`);
    } else {
      console.log(jsonOutput);
    }
  }

  /**
   * Output comparison results in JSON format
   */
  static async outputComparison(
    analysis1: TraceAnalysis,
    analysis2: TraceAnalysis,
    options: CLIOptions
  ): Promise<void> {
    const comparison = this.createComparisonData(analysis1, analysis2);
    const outputPath = options.output || `trace-comparison-${Date.now()}.json`;
    const jsonOutput = JSON.stringify(comparison, null, 2);

    if (options.output) {
      writeFileSync(outputPath, jsonOutput);
      console.log(`📄 Comparison report saved to: ${outputPath}`);
    } else {
      console.log(jsonOutput);
    }
  }

  /**
   * Create structured comparison data
   */
  private static createComparisonData(analysis1: TraceAnalysis, analysis2: TraceAnalysis) {
    return {
      comparison: {
        duration: {
          before: analysis1.totalDuration,
          after: analysis2.totalDuration,
          change: this.calculateChange(analysis1.totalDuration, analysis2.totalDuration),
        },
        resources: {
          before: analysis1.resources.length,
          after: analysis2.resources.length,
          change: this.calculateChange(analysis1.resources.length, analysis2.resources.length),
        },
        errors: {
          before: analysis1.errors.length,
          after: analysis2.errors.length,
          change: this.calculateChange(analysis1.errors.length, analysis2.errors.length),
        },
        performance: {
          fcp: {
            before: analysis1.performance.firstContentfulPaint,
            after: analysis2.performance.firstContentfulPaint,
            change: this.calculateChange(
              analysis1.performance.firstContentfulPaint,
              analysis2.performance.firstContentfulPaint
            ),
          },
          lcp: {
            before: analysis1.performance.largestContentfulPaint,
            after: analysis2.performance.largestContentfulPaint,
            change: this.calculateChange(
              analysis1.performance.largestContentfulPaint,
              analysis2.performance.largestContentfulPaint
            ),
          },
          cls: {
            before: analysis1.performance.cumulativeLayoutShift,
            after: analysis2.performance.cumulativeLayoutShift,
            change: this.calculateChange(
              analysis1.performance.cumulativeLayoutShift,
              analysis2.performance.cumulativeLayoutShift
            ),
          },
        },
      },
      before: analysis1,
      after: analysis2,
    };
  }

  /**
   * Calculate percentage change between two values
   */
  private static calculateChange(old: number, newVal: number): number {
    return ((newVal - old) / old) * 100;
  }
}
