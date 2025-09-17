// Vector operation benchmark

import { PositionSystemSIMD } from "./position-system-simd.js";
import { TestDataGenerator } from "./test-data-generator.js";
import { BenchmarkResult } from "./benchmark-types.js";

export class VectorBenchmark {
  private simdSystem: PositionSystemSIMD;

  constructor(private maxEntities: number = 100000) {
    this.simdSystem = new PositionSystemSIMD(maxEntities);
  }

  async initialize(): Promise<void> {
    await this.simdSystem.initialize();
  }

  async benchmarkVectorOperations(arraySize: number, iterations: number = 1000): Promise<BenchmarkResult> {
    console.log(`Benchmarking vector operations with ${arraySize} elements, ${iterations} iterations...`);

    // Generate test data
    const { a, b } = TestDataGenerator.generateVectorArrays(arraySize);

    // Benchmark SIMD vector operations
    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
      this.simdSystem.simdVectorAdd(a, b);
    }
    const end = performance.now();
    const totalTime = end - start;

    return {
      name: "Vector Operations (SIMD)",
      iterations,
      totalTime,
      averageTime: totalTime / iterations,
      operationsPerSecond: (iterations * arraySize) / (totalTime / 1000),
    };
  }

  destroy(): void {
    this.simdSystem.destroy();
  }
}
