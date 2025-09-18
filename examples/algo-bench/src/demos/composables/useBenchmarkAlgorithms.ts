import { generateTestData } from "../utils/benchmarkData";
import { benchmarkAlgorithm, warmUpAlgorithms } from "../utils/benchmarkUtils";

export interface BenchmarkResult {
  objectCount: number;
  naiveTime: number;
  spatialTime: number;
  speedup: number;
  collisionCount: number;
}

/**
 * Composable for benchmark algorithm execution
 * Handles the core benchmarking logic for collision detection algorithms
 */
export function useBenchmarkAlgorithms() {
  // Run benchmark for a specific object count
  const runBenchmark = (objectCount: number): BenchmarkResult => {
    const objects = generateTestData(objectCount);

    // Warm up algorithms
    warmUpAlgorithms(objects);

    // Benchmark naive algorithm (multiple runs for accuracy)
    const { time: naiveTime } = benchmarkAlgorithm(objects, false);

    // Benchmark spatial hash algorithm (multiple runs for accuracy)
    const { time: spatialTime, collisionCount } = benchmarkAlgorithm(objects, true);

    return {
      objectCount,
      naiveTime,
      spatialTime,
      speedup: naiveTime / spatialTime,
      collisionCount,
    };
  };

  return {
    runBenchmark,
  };
}
