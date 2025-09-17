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
/**
 * Example 1: Basic benchmark execution with default settings.
 */
export declare function basicBenchmarkExample(): Promise<void>;
/**
 * Example 2: Custom benchmark configuration for specific testing scenarios.
 */
export declare function customConfigExample(): Promise<void>;
/**
 * Example 3: Running specific benchmark categories.
 */
export declare function categoryBenchmarkExample(): Promise<void>;
/**
 * Example 4: Performance regression testing.
 */
export declare function regressionTestExample(): Promise<void>;
/**
 * Example 5: Stress testing with high entity counts.
 */
export declare function stressTestExample(): Promise<void>;
/**
 * Example 6: Benchmark result analysis and export.
 */
export declare function analysisExample(): Promise<void>;
/**
 * Runs all examples in sequence.
 */
export declare function runAllExamples(): Promise<void>;
