// Benchmark execution logic for ECS comparison

import { BenchmarkResult } from "./benchmark-types.js";
import { PositionSystemSIMD } from "./position-system-simd.js";
import { World } from "../../index.js";
import { BenchmarkExecutor, BenchmarkResultFactory } from "./benchmark-executor.js";

export interface BenchmarkRunner {
  benchmarkPositionUpdates(
    entityCount: number,
    iterations: number
  ): Promise<{ simd: BenchmarkResult; reynard: BenchmarkResult }>;
  benchmarkCollisionDetection(
    entityCount: number,
    iterations: number
  ): Promise<{ simd: BenchmarkResult; reynard: BenchmarkResult }>;
  benchmarkSpatialQueries(
    entityCount: number,
    iterations: number
  ): Promise<{ simd: BenchmarkResult; reynard: BenchmarkResult }>;
}

export class ECSBenchmarkRunner implements BenchmarkRunner {
  private executor: BenchmarkExecutor;

  constructor(
    private simdSystem: PositionSystemSIMD,
    private reynardWorld: World,
    private setupTestData: (entityCount: number) => void
  ) {
    this.executor = new BenchmarkExecutor(simdSystem, reynardWorld);
  }

  async benchmarkPositionUpdates(
    entityCount: number,
    iterations: number = 1000
  ): Promise<{ simd: BenchmarkResult; reynard: BenchmarkResult }> {
    console.log(`Benchmarking position updates with ${entityCount} entities, ${iterations} iterations...`);

    this.setupTestData(entityCount);
    const deltaTime = 0.016; // 60 FPS

    const simdTime = this.executor.executeSIMDPositions(iterations, deltaTime);
    this.setupTestData(entityCount); // Reset data
    const reynardTime = this.executor.executeReynardPositions(iterations);

    return {
      simd: BenchmarkResultFactory.createPositionResult(
        "Position Updates (WebAssembly SIMD)",
        iterations,
        simdTime,
        entityCount
      ),
      reynard: BenchmarkResultFactory.createPositionResult(
        "Position Updates (Reynard ECS)",
        iterations,
        reynardTime,
        entityCount
      ),
    };
  }

  async benchmarkCollisionDetection(
    entityCount: number,
    iterations: number = 100
  ): Promise<{ simd: BenchmarkResult; reynard: BenchmarkResult }> {
    console.log(`Benchmarking collision detection with ${entityCount} entities, ${iterations} iterations...`);

    this.setupTestData(entityCount);
    const radius = 10.0;

    const simdTime = this.executor.executeSIMDCollisions(iterations, radius);
    this.setupTestData(entityCount); // Reset data
    const reynardTime = this.executor.executeReynardCollisions(iterations);

    return {
      simd: BenchmarkResultFactory.createCollisionResult(
        "Collision Detection (WebAssembly SIMD)",
        iterations,
        simdTime
      ),
      reynard: BenchmarkResultFactory.createCollisionResult(
        "Collision Detection (Reynard ECS)",
        iterations,
        reynardTime
      ),
    };
  }

  async benchmarkSpatialQueries(
    entityCount: number,
    iterations: number = 1000
  ): Promise<{ simd: BenchmarkResult; reynard: BenchmarkResult }> {
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
