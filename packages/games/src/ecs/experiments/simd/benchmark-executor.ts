// Benchmark execution utilities for individual system operations

import { BenchmarkResult } from "./benchmark-types.js";
import { PositionSystemSIMD } from "./position-system-simd.js";
import { World } from "../../index.js";

export class BenchmarkExecutor {
  constructor(
    private simdSystem: PositionSystemSIMD,
    private reynardWorld: World,
  ) {}

  executeSIMDPositions(iterations: number, deltaTime: number): number {
    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
      this.simdSystem.updatePositions(deltaTime);
    }
    return performance.now() - start;
  }

  executeReynardPositions(iterations: number): number {
    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
      this.reynardWorld.runSystem("positionUpdateSystem");
    }
    return performance.now() - start;
  }

  executeSIMDCollisions(iterations: number, radius: number): number {
    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
      this.simdSystem.detectCollisions(radius);
    }
    return performance.now() - start;
  }

  executeReynardCollisions(iterations: number): number {
    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
      this.reynardWorld.runSystem("collisionSystem");
    }
    return performance.now() - start;
  }

  executeSIMDSpatial(
    iterations: number,
    queryX: number,
    queryY: number,
    radius: number,
  ): number {
    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
      this.simdSystem.spatialQuery(queryX, queryY, radius);
    }
    return performance.now() - start;
  }

  executeReynardSpatial(iterations: number): number {
    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
      this.reynardWorld.runSystem("spatialQuerySystem");
    }
    return performance.now() - start;
  }
}

export class BenchmarkResultFactory {
  static createPositionResult(
    name: string,
    iterations: number,
    totalTime: number,
    entityCount: number,
  ): BenchmarkResult {
    return {
      name,
      iterations,
      totalTime,
      averageTime: totalTime / iterations,
      operationsPerSecond: (iterations * entityCount) / (totalTime / 1000),
    };
  }

  static createCollisionResult(
    name: string,
    iterations: number,
    totalTime: number,
  ): BenchmarkResult {
    return {
      name,
      iterations,
      totalTime,
      averageTime: totalTime / iterations,
      operationsPerSecond: iterations / (totalTime / 1000),
    };
  }

  static createSpatialResult(
    name: string,
    iterations: number,
    totalTime: number,
  ): BenchmarkResult {
    return {
      name,
      iterations,
      totalTime,
      averageTime: totalTime / iterations,
      operationsPerSecond: iterations / (totalTime / 1000),
    };
  }
}
