import { BenchmarkResult } from "./benchmark-types.js";
export declare class CollisionBenchmark {
    private nonSimdSystem;
    private simdSystem;
    private isInitialized;
    constructor(maxEntities?: number);
    /**
     * Initialize the benchmark systems
     */
    initialize(): Promise<void>;
    /**
     * Benchmark collision detection
     */
    benchmarkCollisionDetection(entityCount: number, iterations?: number): Promise<{
        nonSimd: BenchmarkResult;
        simd: BenchmarkResult;
    }>;
}
