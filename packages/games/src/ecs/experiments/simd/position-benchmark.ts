// Position update benchmarks for ECS SIMD performance testing

import { PositionSystem } from "./position-system.js";
import { PositionSystemSIMD } from "./position-system-simd.js";
import { BenchmarkResult } from "./benchmark-types.js";
import { TestDataGenerator } from "./test-data-generator.js";

export class PositionBenchmark {
  private nonSimdSystem: PositionSystem;
  private simdSystem: PositionSystemSIMD;
  private isInitialized: boolean = false;

  constructor(maxEntities: number = 100000) {
    this.nonSimdSystem = new PositionSystem(maxEntities);
    this.simdSystem = new PositionSystemSIMD(maxEntities);
  }

  /**
   * Initialize the benchmark systems
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    await this.simdSystem.initialize();
    this.isInitialized = true;
  }

  /**
   * Benchmark position updates
   */
  async benchmarkPositionUpdates(
    entityCount: number,
    iterations: number = 1000,
  ): Promise<{ nonSimd: BenchmarkResult; simd: BenchmarkResult }> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    console.log(
      `Benchmarking position updates with ${entityCount} entities, ${iterations} iterations...`,
    );

    // Generate test data
    const testData = TestDataGenerator.generateTestData(entityCount);

    // Setup non-SIMD system
    this.nonSimdSystem.clear();
    for (const data of testData) {
      this.nonSimdSystem.addEntity(
        data.position,
        data.velocity,
        data.acceleration,
        data.mass,
      );
    }

    // Setup SIMD system
    this.simdSystem.clear();
    for (const data of testData) {
      this.simdSystem.addEntity(
        data.position,
        data.velocity,
        data.acceleration,
        data.mass,
      );
    }

    const deltaTime = 0.016; // 60 FPS

    // Benchmark non-SIMD
    const nonSimdStart = performance.now();
    for (let i = 0; i < iterations; i++) {
      this.nonSimdSystem.updatePositions(deltaTime);
    }
    const nonSimdEnd = performance.now();
    const nonSimdTime = nonSimdEnd - nonSimdStart;

    // Benchmark SIMD
    const simdStart = performance.now();
    for (let i = 0; i < iterations; i++) {
      this.simdSystem.updatePositions(deltaTime);
    }
    const simdEnd = performance.now();
    const simdTime = simdEnd - simdStart;

    const nonSimdResult: BenchmarkResult = {
      name: "Position Updates (Non-SIMD)",
      iterations,
      totalTime: nonSimdTime,
      averageTime: nonSimdTime / iterations,
      operationsPerSecond: (iterations * entityCount) / (nonSimdTime / 1000),
    };

    const simdResult: BenchmarkResult = {
      name: "Position Updates (SIMD)",
      iterations,
      totalTime: simdTime,
      averageTime: simdTime / iterations,
      operationsPerSecond: (iterations * entityCount) / (simdTime / 1000),
    };

    return { nonSimd: nonSimdResult, simd: simdResult };
  }
}
