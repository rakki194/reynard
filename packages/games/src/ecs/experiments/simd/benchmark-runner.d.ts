import { BenchmarkResult } from "./benchmark-types.js";
import { PositionSystemSIMD } from "./position-system-simd.js";
import { World } from "../../index.js";
export interface BenchmarkRunner {
    benchmarkPositionUpdates(entityCount: number, iterations: number): Promise<{
        simd: BenchmarkResult;
        reynard: BenchmarkResult;
    }>;
    benchmarkCollisionDetection(entityCount: number, iterations: number): Promise<{
        simd: BenchmarkResult;
        reynard: BenchmarkResult;
    }>;
    benchmarkSpatialQueries(entityCount: number, iterations: number): Promise<{
        simd: BenchmarkResult;
        reynard: BenchmarkResult;
    }>;
}
export declare class ECSBenchmarkRunner implements BenchmarkRunner {
    private simdSystem;
    private reynardWorld;
    private setupTestData;
    private executor;
    constructor(simdSystem: PositionSystemSIMD, reynardWorld: World, setupTestData: (entityCount: number) => void);
    benchmarkPositionUpdates(entityCount: number, iterations?: number): Promise<{
        simd: BenchmarkResult;
        reynard: BenchmarkResult;
    }>;
    benchmarkCollisionDetection(entityCount: number, iterations?: number): Promise<{
        simd: BenchmarkResult;
        reynard: BenchmarkResult;
    }>;
    benchmarkSpatialQueries(entityCount: number, iterations?: number): Promise<{
        simd: BenchmarkResult;
        reynard: BenchmarkResult;
    }>;
}
