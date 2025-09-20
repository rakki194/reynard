/**
 * @fileoverview ECS Benchmark Example Usage
 *
 * This file demonstrates how to use the ECS benchmark suite for performance
 * testing and optimization. It shows various ways to run benchmarks and
 * analyze the results.
 *
 * @example
 * ```typescript
 * import { runECSBenchmarks, ECSBenchmarkRunner } from './ecs-benchmark';
 *
 * // Run all benchmarks with default settings
 * const results = await runECSBenchmarks();
 *
 * // Run with custom configuration
 * const customResults = await runECSBenchmarks({
 *   entityCounts: [1000, 5000, 10000],
 *   iterations: 500,
 *   enableMemoryTracking: true,
 * });
 * ```
 *
 * @author Reynard ECS Team
 * @since 1.0.0
 */

import {
  BenchmarkConfig,
  BenchmarkResult,
  ECSBenchmarkRunner,
  runECSBenchmarks,
  runEntityBenchmarks,
  runQueryBenchmarks,
  runStressTests,
  runSystemBenchmarks,
} from "./ecs-benchmark.js";

/**
 * Example 1: Basic benchmark execution with default settings.
 */
export async function basicBenchmarkExample(): Promise<void> {
  console.log("🦊> Example 1: Basic Benchmark Execution");
  console.log("=".repeat(50));

  try {
    const results = await runECSBenchmarks();
    console.log(`✅ Completed ${results.length} benchmark tests`);

    // Find the fastest and slowest operations
    const fastest = results.reduce((min, result) => (result.averageTimeUs < min.averageTimeUs ? result : min));
    const slowest = results.reduce((max, result) => (result.averageTimeUs > max.averageTimeUs ? result : max));

    console.log(`🏃 Fastest: ${fastest.operation} (${fastest.averageTimeUs.toFixed(2)}μs)`);
    console.log(`🐌 Slowest: ${slowest.operation} (${slowest.averageTimeUs.toFixed(2)}μs)`);
  } catch (error) {
    console.error("❌ Benchmark failed:", error);
  }
}

/**
 * Example 2: Custom benchmark configuration for specific testing scenarios.
 */
export async function customConfigExample(): Promise<void> {
  console.log("\n🦦> Example 2: Custom Configuration");
  console.log("=".repeat(50));

  const customConfig: Partial<BenchmarkConfig> = {
    entityCounts: [100, 500, 1000, 2000], // Smaller range for faster testing
    iterations: 200, // Fewer iterations for quicker results
    warmupIterations: 50, // Fewer warmup iterations
    enableMemoryTracking: true, // Track memory usage
    enableDetailedLogging: true, // More verbose output
  };

  try {
    const runner = new ECSBenchmarkRunner(customConfig);
    const results = await runner.runAllBenchmarks();

    // Analyze memory usage
    const memoryResults = results.filter(r => r.memoryUsageMB !== undefined);
    if (memoryResults.length > 0) {
      const totalMemory = memoryResults.reduce((sum, r) => sum + (r.memoryUsageMB || 0), 0);
      const avgMemory = totalMemory / memoryResults.length;
      console.log(`💾 Average memory usage: ${avgMemory.toFixed(2)} MB`);
    }
  } catch (error) {
    console.error("❌ Custom benchmark failed:", error);
  }
}

/**
 * Example 3: Running specific benchmark categories.
 */
export async function categoryBenchmarkExample(): Promise<void> {
  console.log("\n🐺> Example 3: Category-Specific Benchmarks");
  console.log("=".repeat(50));

  const config: Partial<BenchmarkConfig> = {
    entityCounts: [1000, 5000, 10000],
    iterations: 300,
  };

  try {
    // Test entity operations
    console.log("Testing entity operations...");
    const entityResults = await runEntityBenchmarks(config);
    console.log(`✅ Entity benchmarks: ${entityResults.length} tests completed`);

    // Test query performance
    console.log("Testing query performance...");
    const queryResults = await runQueryBenchmarks(config);
    console.log(`✅ Query benchmarks: ${queryResults.length} tests completed`);

    // Test system execution
    console.log("Testing system execution...");
    const systemResults = await runSystemBenchmarks(config);
    console.log(`✅ System benchmarks: ${systemResults.length} tests completed`);

    // Combine and analyze results
    const allResults = [...entityResults, ...queryResults, ...systemResults];
    const avgTime = allResults.reduce((sum, r) => sum + r.averageTimeUs, 0) / allResults.length;
    console.log(`📊 Overall average time: ${avgTime.toFixed(2)}μs`);
  } catch (error) {
    console.error("❌ Category benchmark failed:", error);
  }
}

/**
 * Example 4: Performance regression testing.
 */
export async function regressionTestExample(): Promise<void> {
  console.log("\n🔥> Example 4: Performance Regression Testing");
  console.log("=".repeat(50));

  const baselineConfig: Partial<BenchmarkConfig> = {
    entityCounts: [1000, 5000, 10000],
    iterations: 1000,
    enableMemoryTracking: true,
  };

  try {
    // Run baseline benchmarks
    console.log("Running baseline benchmarks...");
    const baselineResults = await runECSBenchmarks(baselineConfig);

    // In a real scenario, you'd save these results and compare with future runs
    const baselineData = {
      timestamp: new Date().toISOString(),
      results: baselineResults,
      summary: {
        avgTimeUs: baselineResults.reduce((sum, r) => sum + r.averageTimeUs, 0) / baselineResults.length,
        totalMemoryMB: baselineResults.reduce((sum, r) => sum + (r.memoryUsageMB || 0), 0),
      },
    };

    console.log("📊 Baseline Performance:");
    console.log(`  Average Time: ${baselineData.summary.avgTimeUs.toFixed(2)}μs`);
    console.log(`  Total Memory: ${baselineData.summary.totalMemoryMB.toFixed(2)} MB`);

    // Simulate running the same benchmarks again (in practice, this would be a separate run)
    console.log("\nRunning comparison benchmarks...");
    const comparisonResults = await runECSBenchmarks(baselineConfig);

    // Compare results
    const comparisonData = {
      avgTimeUs: comparisonResults.reduce((sum, r) => sum + r.averageTimeUs, 0) / comparisonResults.length,
      totalMemoryMB: comparisonResults.reduce((sum, r) => sum + (r.memoryUsageMB || 0), 0),
    };

    const timeDiff = comparisonData.avgTimeUs - baselineData.summary.avgTimeUs;
    const timeDiffPercent = (timeDiff / baselineData.summary.avgTimeUs) * 100;

    const memoryDiff = comparisonData.totalMemoryMB - baselineData.summary.totalMemoryMB;
    const memoryDiffPercent = (memoryDiff / baselineData.summary.totalMemoryMB) * 100;

    console.log("📈 Performance Comparison:");
    console.log(
      `  Time Change: ${timeDiff > 0 ? "+" : ""}${timeDiff.toFixed(2)}μs (${timeDiffPercent > 0 ? "+" : ""}${timeDiffPercent.toFixed(1)}%)`
    );
    console.log(
      `  Memory Change: ${memoryDiff > 0 ? "+" : ""}${memoryDiff.toFixed(2)} MB (${memoryDiffPercent > 0 ? "+" : ""}${memoryDiffPercent.toFixed(1)}%)`
    );

    // Alert on significant regressions
    if (timeDiffPercent > 10) {
      console.log("⚠️  WARNING: Significant performance regression detected!");
    } else if (timeDiffPercent < -10) {
      console.log("🎉 Great! Significant performance improvement detected!");
    } else {
      console.log("✅ Performance is within acceptable range.");
    }
  } catch (error) {
    console.error("❌ Regression test failed:", error);
  }
}

/**
 * Example 5: Stress testing with high entity counts.
 */
export async function stressTestExample(): Promise<void> {
  console.log("\n💥> Example 5: Stress Testing");
  console.log("=".repeat(50));

  const stressConfig: Partial<BenchmarkConfig> = {
    entityCounts: [10000, 25000, 50000, 100000],
    iterations: 50, // Fewer iterations for stress tests
    warmupIterations: 10,
    enableMemoryTracking: true,
  };

  try {
    console.log("Running stress tests with high entity counts...");
    const stressResults = await runStressTests(stressConfig);

    console.log("🔥 Stress Test Results:");
    for (const result of stressResults) {
      const opsPerSecond = result.operationsPerSecond;
      const memoryMB = result.memoryUsageMB || 0;

      console.log(
        `  ${result.entityCount.toLocaleString().padStart(8)} entities: ${result.averageTimeUs.toFixed(2).padStart(8)}μs, ${opsPerSecond.toFixed(0).padStart(8)} ops/sec, ${memoryMB.toFixed(2).padStart(6)} MB`
      );
    }

    // Find the breaking point (where performance degrades significantly)
    const sortedResults = stressResults.sort((a, b) => a.entityCount - b.entityCount);
    let breakingPoint = null;

    for (let i = 1; i < sortedResults.length; i++) {
      const prev = sortedResults[i - 1];
      const curr = sortedResults[i];
      const timeIncrease = (curr.averageTimeUs - prev.averageTimeUs) / prev.averageTimeUs;

      if (timeIncrease > 0.5) {
        // 50% increase in time
        breakingPoint = curr.entityCount;
        break;
      }
    }

    if (breakingPoint) {
      console.log(`⚠️  Performance breaking point detected at ${breakingPoint.toLocaleString()} entities`);
    } else {
      console.log("✅ No significant performance breaking point detected in tested range");
    }
  } catch (error) {
    console.error("❌ Stress test failed:", error);
  }
}

/**
 * Example 6: Benchmark result analysis and export.
 */
export async function analysisExample(): Promise<void> {
  console.log("\n📊> Example 6: Result Analysis and Export");
  console.log("=".repeat(50));

  try {
    const runner = new ECSBenchmarkRunner({
      entityCounts: [100, 500, 1000, 5000],
      iterations: 200,
      enableMemoryTracking: true,
    });

    const results = await runner.runAllBenchmarks();

    // Export results to JSON
    const jsonData = runner.exportResults("benchmark-results.json");

    // Perform custom analysis
    console.log("🔍 Custom Analysis:");

    // Group by entity count
    const byEntityCount = new Map<number, BenchmarkResult[]>();
    for (const result of results) {
      if (!byEntityCount.has(result.entityCount)) {
        byEntityCount.set(result.entityCount, []);
      }
      byEntityCount.get(result.entityCount)!.push(result);
    }

    // Analyze scaling behavior
    console.log("📈 Scaling Analysis:");
    for (const [entityCount, entityResults] of byEntityCount) {
      const avgTime = entityResults.reduce((sum, r) => sum + r.averageTimeUs, 0) / entityResults.length;
      const avgMemory = entityResults.reduce((sum, r) => sum + (r.memoryUsageMB || 0), 0) / entityResults.length;

      console.log(
        `  ${entityCount.toLocaleString().padStart(6)} entities: ${avgTime.toFixed(2).padStart(8)}μs avg, ${avgMemory.toFixed(2).padStart(6)} MB avg`
      );
    }

    // Find performance bottlenecks
    const slowestOperations = results.sort((a, b) => b.averageTimeUs - a.averageTimeUs).slice(0, 3);

    console.log("\n🐌 Slowest Operations:");
    for (const result of slowestOperations) {
      console.log(`  ${result.operation}: ${result.averageTimeUs.toFixed(2)}μs (${result.entityCount} entities)`);
    }
  } catch (error) {
    console.error("❌ Analysis failed:", error);
  }
}

/**
 * Runs all examples in sequence.
 */
export async function runAllExamples(): Promise<void> {
  console.log("🚀 Reynard ECS Benchmark Examples");
  console.log("=".repeat(60));

  try {
    await basicBenchmarkExample();
    await customConfigExample();
    await categoryBenchmarkExample();
    await regressionTestExample();
    await stressTestExample();
    await analysisExample();

    console.log("\n✅ All examples completed successfully!");
    console.log("🎯 Use these patterns to create your own benchmark tests!");
  } catch (error) {
    console.error("❌ Example execution failed:", error);
  }
}

// Run examples if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllExamples().catch(error => {
    console.error("❌ Fatal error:", error);
    process.exit(1);
  });
}
