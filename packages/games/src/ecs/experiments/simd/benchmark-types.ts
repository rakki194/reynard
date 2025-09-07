// Benchmark result types for SIMD experiments

export interface BenchmarkResult {
  name: string;
  iterations: number;
  totalTime: number;
  averageTime: number;
  operationsPerSecond: number;
}

export interface BenchmarkSuite {
  name: string;
  results: BenchmarkResult[];
  totalTime: number;
  averageTime: number;
}

export interface TestData {
  position: { x: number; y: number };
  velocity: { vx: number; vy: number };
  acceleration: { ax: number; ay: number };
  mass: { mass: number };
}