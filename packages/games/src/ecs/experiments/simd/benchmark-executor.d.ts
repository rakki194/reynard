import { BenchmarkResult } from "./benchmark-types.js";
import { PositionSystemSIMD } from "./position-system-simd.js";
import { World } from "../../index.js";
export declare class BenchmarkExecutor {
    private simdSystem;
    private reynardWorld;
    constructor(simdSystem: PositionSystemSIMD, reynardWorld: World);
    executeSIMDPositions(iterations: number, deltaTime: number): number;
    executeReynardPositions(iterations: number): number;
    executeSIMDCollisions(iterations: number, radius: number): number;
    executeReynardCollisions(iterations: number): number;
    executeSIMDSpatial(iterations: number, queryX: number, queryY: number, radius: number): number;
    executeReynardSpatial(iterations: number): number;
}
export declare class BenchmarkResultFactory {
    static createPositionResult(name: string, iterations: number, totalTime: number, entityCount: number): BenchmarkResult;
    static createCollisionResult(name: string, iterations: number, totalTime: number): BenchmarkResult;
    static createSpatialResult(name: string, iterations: number, totalTime: number): BenchmarkResult;
}
