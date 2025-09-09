// Results formatting and display utilities for ECS benchmarks

import { BenchmarkResult } from "./benchmark-types.js";

export interface BenchmarkResults {
  simd: BenchmarkResult[];
  reynard: BenchmarkResult[];
}

export class BenchmarkResultsFormatter {
  /**
   * Print comparison results
   */
  static printResults(results: BenchmarkResults): void {
    console.log("\n📊 COMPARISON RESULTS");
    console.log("=".repeat(80));

    for (let i = 0; i < results.simd.length; i++) {
      const simd = results.simd[i];
      const reynard = results.reynard[i];
      const speedup = reynard.totalTime / simd.totalTime;

      console.log(`\n${simd.name}`);
      console.log("-".repeat(50));
      console.log(
        `WebAssembly SIMD: ${simd.totalTime.toFixed(2)}ms (${simd.operationsPerSecond.toFixed(0)} ops/sec)`,
      );
      console.log(
        `Reynard ECS:      ${reynard.totalTime.toFixed(2)}ms (${reynard.operationsPerSecond.toFixed(0)} ops/sec)`,
      );
      console.log(
        `Speedup:          ${speedup.toFixed(2)}x ${speedup > 1 ? "🚀" : "🐌"}`,
      );
    }
  }

  /**
   * Generate summary statistics
   */
  static generateSummary(results: BenchmarkResults): {
    averageSpeedup: number;
    bestSpeedup: number;
    worstSpeedup: number;
    totalTests: number;
  } {
    const speedups: number[] = [];

    for (let i = 0; i < results.simd.length; i++) {
      const simd = results.simd[i];
      const reynard = results.reynard[i];
      const speedup = reynard.totalTime / simd.totalTime;
      speedups.push(speedup);
    }

    const averageSpeedup =
      speedups.reduce((sum, speedup) => sum + speedup, 0) / speedups.length;
    const bestSpeedup = Math.max(...speedups);
    const worstSpeedup = Math.min(...speedups);

    return {
      averageSpeedup,
      bestSpeedup,
      worstSpeedup,
      totalTests: results.simd.length,
    };
  }

  /**
   * Export results to JSON format
   */
  static exportToJSON(results: BenchmarkResults): string {
    const summary = this.generateSummary(results);
    return JSON.stringify(
      {
        results,
        summary,
        timestamp: new Date().toISOString(),
      },
      null,
      2,
    );
  }
}
