import { createSignal } from "solid-js";
import { useBenchmarkAlgorithms, type BenchmarkResult } from "./useBenchmarkAlgorithms";
import { getBenchmarkTestSizes } from "../utils/benchmarkData";

export interface BenchmarkStats {
  currentTest: number;
  totalTests: number;
  latestResult: BenchmarkResult;
}

/**
 * Composable for executing performance benchmarks
 * Orchestrates benchmark execution and state management
 */
export function useBenchmarkExecution() {
  const [isRunning, setIsRunning] = createSignal(false);
  const [results, setResults] = createSignal<BenchmarkResult[]>([]);
  const [currentTest, setCurrentTest] = createSignal(0);

  const { runBenchmark } = useBenchmarkAlgorithms();

  // Run comprehensive benchmark
  const runComprehensiveBenchmark = async (onStatsUpdate: (stats: BenchmarkStats) => void) => {
    const testSizes = getBenchmarkTestSizes();
    const newResults: BenchmarkResult[] = [];

    for (let i = 0; i < testSizes.length; i++) {
      setCurrentTest(i + 1);
      const result = runBenchmark(testSizes[i]);
      newResults.push(result);

      // Update results incrementally
      setResults([...newResults]);
      onStatsUpdate({
        currentTest: i + 1,
        totalTests: testSizes.length,
        latestResult: result,
      });

      // Small delay to allow UI updates
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    setCurrentTest(0);
    setIsRunning(false);
  };

  const startBenchmark = (onStatsUpdate: (stats: BenchmarkStats) => void) => {
    setIsRunning(true);
    setResults([]);
    runComprehensiveBenchmark(onStatsUpdate);
  };

  const clearResults = () => {
    setResults([]);
  };

  return {
    isRunning,
    results,
    currentTest,
    startBenchmark,
    clearResults,
  };
}
