/**
 * @fileoverview ECS Benchmark Suite Index
 *
 * This file provides a clean interface for importing and using the ECS benchmark suite.
 * It exports all the main functionality needed for performance testing.
 *
 * @example
 * ```typescript
 * import {
 *   runECSBenchmarks,
 *   ECSBenchmarkRunner,
 *   BenchmarkConfig
 * } from './benchmarks';
 *
 * // Quick benchmark run
 * const results = await runECSBenchmarks();
 *
 * // Custom configuration
 * const runner = new ECSBenchmarkRunner({
 *   entityCounts: [1000, 5000, 10000],
 *   iterations: 500,
 * });
 * ```
 *
 * @author Reynard ECS Team
 * @since 1.0.0
 */
export { ECSBenchmarkRunner, type BenchmarkConfig, type BenchmarkResult, } from "./ecs-benchmark.js";
export { runECSBenchmarks, runEntityBenchmarks, runQueryBenchmarks, runStressTests, runSystemBenchmarks, } from "./ecs-benchmark.js";
export { runBenchmarks } from "./run-benchmarks.js";
export { analysisExample, basicBenchmarkExample, categoryBenchmarkExample, customConfigExample, regressionTestExample, runAllExamples, stressTestExample, } from "./example.js";
export { testBenchmarks } from "./test-benchmarks.js";
