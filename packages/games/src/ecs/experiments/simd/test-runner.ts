// Test runner for SIMD ECS experiments

import { ECSComparisonBenchmark } from "./ecs-comparison-benchmark.js";
import { PositionBenchmark } from "./position-benchmark.js";

/**
 * Run the SIMD ECS benchmark experiment
 */
async function runExperiment(): Promise<void> {
  console.log("🦊> Starting Reynard ECS SIMD Experiment");
  console.log("=".repeat(60));

  try {
    // Create benchmark instance
    const benchmark = new ECSComparisonBenchmark(100000);

    // Run the complete benchmark suite
    await benchmark.runComparisonBenchmark();
  } catch (error) {
    console.error("❌ Experiment failed:", error);
  }
}

/**
 * Run a quick test with a smaller dataset
 */
async function runQuickTest(): Promise<void> {
  console.log("🦊> Starting Quick WebAssembly SIMD Test");
  console.log("=".repeat(50));

  try {
    const benchmark = new PositionBenchmark(1000);
    await benchmark.initialize();

    console.log("✅ WebAssembly SIMD system initialized successfully!");

    // Run a simple benchmark
    const results = await benchmark.benchmarkPositionUpdates(100, 100);

    console.log("\n📊 Results:");
    console.log(
      `Non-SIMD: ${results.nonSimd.totalTime.toFixed(2)}ms (${results.nonSimd.operationsPerSecond.toFixed(0)} ops/sec)`,
    );
    console.log(
      `SIMD:     ${results.simd.totalTime.toFixed(2)}ms (${results.simd.operationsPerSecond.toFixed(0)} ops/sec)`,
    );

    const speedup = results.nonSimd.totalTime / results.simd.totalTime;
    console.log(
      `Speedup:  ${speedup.toFixed(2)}x ${speedup > 1 ? "🚀" : "🐌"}`,
    );

    console.log(
      "\n🎉 Quick WebAssembly SIMD benchmark completed successfully!",
    );
  } catch (error) {
    console.error("❌ Quick test failed:", error);
  }
}

/**
 * Print a summary of the benchmark results
 */
function _printSummary(): void {
  console.log("\n🎯 EXPERIMENT SUMMARY");
  console.log("=".repeat(60));
  console.log("Check the detailed results above for performance comparisons.");
  console.log(
    "Look for speedup ratios to determine if SIMD provides benefits.",
  );
}

// Export functions for use in other modules
export { runExperiment, runQuickTest };

// Run experiment if this file is executed directly
if (
  typeof window === "undefined" &&
  typeof globalThis !== "undefined" &&
  globalThis.process
) {
  // Node.js environment
  runExperiment().catch(console.error);
} else if (typeof window !== "undefined") {
  // Browser environment - expose to global scope
  (
    window as unknown as { runECSSIMDExperiment: typeof runExperiment }
  ).runECSSIMDExperiment = runExperiment;

  console.log("🦊> ECS SIMD Experiment loaded in browser");
  console.log("Run: window.runECSSIMDExperiment() to start the benchmark");
}
