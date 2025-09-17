import { BenchmarkResult } from "./benchmark-types.js";
export declare class SpatialBenchmark {
    private nonSimdSystem;
    private simdSystem;
    private isInitialized;
    constructor(maxEntities?: number);
    /**
     * Initialize the benchmark systems
     */
    initialize(): Promise<void>;
    /**
     * Benchmark spatial queries
     */
    benchmarkSpatialQueries(entityCount: number, iterations?: number): Promise<{
        nonSimd: BenchmarkResult;
        simd: BenchmarkResult;
    }>;
}
