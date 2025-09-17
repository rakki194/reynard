// Benchmark execution logic for ECS comparison
import { BenchmarkExecutor, BenchmarkResultFactory, } from "./benchmark-executor.js";
export class ECSBenchmarkRunner {
    constructor(simdSystem, reynardWorld, setupTestData) {
        Object.defineProperty(this, "simdSystem", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: simdSystem
        });
        Object.defineProperty(this, "reynardWorld", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: reynardWorld
        });
        Object.defineProperty(this, "setupTestData", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: setupTestData
        });
        Object.defineProperty(this, "executor", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.executor = new BenchmarkExecutor(simdSystem, reynardWorld);
    }
    async benchmarkPositionUpdates(entityCount, iterations = 1000) {
        console.log(`Benchmarking position updates with ${entityCount} entities, ${iterations} iterations...`);
        this.setupTestData(entityCount);
        const deltaTime = 0.016; // 60 FPS
        const simdTime = this.executor.executeSIMDPositions(iterations, deltaTime);
        this.setupTestData(entityCount); // Reset data
        const reynardTime = this.executor.executeReynardPositions(iterations);
        return {
            simd: BenchmarkResultFactory.createPositionResult("Position Updates (WebAssembly SIMD)", iterations, simdTime, entityCount),
            reynard: BenchmarkResultFactory.createPositionResult("Position Updates (Reynard ECS)", iterations, reynardTime, entityCount),
        };
    }
    async benchmarkCollisionDetection(entityCount, iterations = 100) {
        console.log(`Benchmarking collision detection with ${entityCount} entities, ${iterations} iterations...`);
        this.setupTestData(entityCount);
        const radius = 10.0;
        const simdTime = this.executor.executeSIMDCollisions(iterations, radius);
        this.setupTestData(entityCount); // Reset data
        const reynardTime = this.executor.executeReynardCollisions(iterations);
        return {
            simd: BenchmarkResultFactory.createCollisionResult("Collision Detection (WebAssembly SIMD)", iterations, simdTime),
            reynard: BenchmarkResultFactory.createCollisionResult("Collision Detection (Reynard ECS)", iterations, reynardTime),
        };
    }
    async benchmarkSpatialQueries(entityCount, iterations = 1000) {
        console.log(`Benchmarking spatial queries with ${entityCount} entities, ${iterations} iterations...`);
        this.setupTestData(entityCount);
        const queryX = 0;
        const queryY = 0;
        const radius = 100.0;
        const simdTime = this.executor.executeSIMDSpatial(iterations, queryX, queryY, radius);
        this.setupTestData(entityCount); // Reset data
        const reynardTime = this.executor.executeReynardSpatial(iterations);
        return {
            simd: BenchmarkResultFactory.createSpatialResult("Spatial Queries (WebAssembly SIMD)", iterations, simdTime),
            reynard: BenchmarkResultFactory.createSpatialResult("Spatial Queries (Reynard ECS)", iterations, reynardTime),
        };
    }
}
