import { BenchmarkResult } from "./benchmark-types.js";
export declare class VectorBenchmark {
    private maxEntities;
    private simdSystem;
    constructor(maxEntities?: number);
    initialize(): Promise<void>;
    benchmarkVectorOperations(arraySize: number, iterations?: number): Promise<BenchmarkResult>;
    destroy(): void;
}
