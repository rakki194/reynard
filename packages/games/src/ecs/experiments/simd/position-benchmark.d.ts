import { BenchmarkResult } from "./benchmark-types.js";
export declare class PositionBenchmark {
    private nonSimdSystem;
    private simdSystem;
    private isInitialized;
    constructor(maxEntities?: number);
    /**
     * Initialize the benchmark systems
     */
    initialize(): Promise<void>;
    /**
     * Benchmark position updates
     */
    benchmarkPositionUpdates(entityCount: number, iterations?: number): Promise<{
        nonSimd: BenchmarkResult;
        simd: BenchmarkResult;
    }>;
}
