/**
 * @fileoverview Comprehensive ECS Performance Benchmark Suite
 *
 * This benchmark suite tests the performance of all critical ECS operations:
 * - Entity creation and destruction
 * - Component operations (add, remove, access)
 * - Query performance with various filters
 * - System execution timing
 * - Memory usage and allocation patterns
 * - Stress testing with high entity counts
 *
 * @example
 * ```typescript
 * import { runECSBenchmarks } from './ecs-benchmark';
 *
 * // Run all benchmarks
 * await runECSBenchmarks();
 *
 * // Run specific benchmark category
 * await runEntityBenchmarks();
 * ```
 *
 * @performance
 * - Measures operations in microseconds for precision
 * - Tests with entity counts from 100 to 100,000
 * - Includes memory usage tracking
 * - Provides performance regression detection
 *
 * @author Reynard ECS Team
 * @since 1.0.0
 */
import { World } from "../index";
/**
 * Benchmark result interface for structured performance data.
 */
export interface BenchmarkResult {
    name: string;
    operation: string;
    entityCount: number;
    iterations: number;
    totalTimeMs: number;
    averageTimeMs: number;
    averageTimeUs: number;
    operationsPerSecond: number;
    memoryUsageMB?: number;
    notes?: string;
}
/**
 * Benchmark configuration for customizing test parameters.
 */
export interface BenchmarkConfig {
    entityCounts: number[];
    iterations: number;
    warmupIterations: number;
    enableMemoryTracking: boolean;
    enableDetailedLogging: boolean;
}
/**
 * Benchmark runner that executes tests and collects results.
 */
export declare class ECSBenchmarkRunner {
    readonly world: World;
    private config;
    private results;
    private componentTypes;
    private resourceTypes;
    private scalingOptimizer;
    private memoryTracker;
    constructor(config?: Partial<BenchmarkConfig>);
    private setupComponentTypes;
    private setupResourceTypes;
    /**
     * Runs a single benchmark with the given parameters.
     */
    private runBenchmark;
    /**
     * Clears all entities from the world for clean benchmarks.
     */
    private clearWorld;
    /**
     * Benchmark entity creation performance.
     */
    benchmarkEntityCreation(): Promise<BenchmarkResult[]>;
    /**
     * Benchmark component addition performance.
     */
    benchmarkComponentAddition(): Promise<BenchmarkResult[]>;
    /**
     * Benchmark component removal performance.
     */
    benchmarkComponentRemoval(): Promise<BenchmarkResult[]>;
    /**
     * Benchmark query performance with different component combinations.
     */
    benchmarkQueries(): Promise<BenchmarkResult[]>;
    /**
     * Benchmark system execution performance.
     */
    benchmarkSystemExecution(): Promise<BenchmarkResult[]>;
    /**
     * Benchmark resource access performance.
     */
    benchmarkResourceAccess(): Promise<BenchmarkResult[]>;
    /**
     * Stress test with high entity counts and complex operations.
     */
    benchmarkStressTest(): Promise<BenchmarkResult[]>;
    /**
     * Runs all benchmarks and returns comprehensive results.
     */
    runAllBenchmarks(): Promise<BenchmarkResult[]>;
    /**
     * Prints a summary of all benchmark results.
     */
    private printSummary;
    /**
     * Gets the current memory usage in MB.
     */
    getMemoryUsageMB(): number;
    /**
     * Gets the peak memory usage in MB.
     */
    getPeakMemoryUsageMB(): number;
    /**
     * Checks if memory tracking is available.
     */
    isMemoryTrackingAvailable(): boolean;
    /**
     * Starts memory tracking.
     */
    startMemoryTracking(): void;
    /**
     * Updates memory tracking.
     */
    updateMemoryTracking(): void;
    /**
     * Gets detailed memory statistics.
     */
    getMemoryStats(): any;
    /**
     * Exports results to JSON format for further analysis.
     */
    exportResults(filename?: string): string;
}
/**
 * Convenience function to run all ECS benchmarks with default configuration.
 */
export declare function runECSBenchmarks(config?: Partial<BenchmarkConfig>): Promise<BenchmarkResult[]>;
/**
 * Convenience function to run specific benchmark categories.
 */
export declare function runEntityBenchmarks(config?: Partial<BenchmarkConfig>): Promise<BenchmarkResult[]>;
/**
 * Convenience function to run query performance benchmarks.
 */
export declare function runQueryBenchmarks(config?: Partial<BenchmarkConfig>): Promise<BenchmarkResult[]>;
/**
 * Convenience function to run system execution benchmarks.
 */
export declare function runSystemBenchmarks(config?: Partial<BenchmarkConfig>): Promise<BenchmarkResult[]>;
/**
 * Convenience function to run stress tests.
 */
export declare function runStressTests(config?: Partial<BenchmarkConfig>): Promise<BenchmarkResult[]>;
