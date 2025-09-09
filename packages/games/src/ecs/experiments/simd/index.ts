// SIMD ECS Experiment - Main Entry Point
// This experiment compares SIMD-accelerated ECS operations against their non-SIMD counterparts

export { PositionSystem } from "./position-system.js";
export { PositionSystemSIMD } from "./position-system-simd.js";
export { ECSComparisonBenchmark } from "./benchmark.js";
export type { BenchmarkResult, BenchmarkSuite } from "./benchmark.js";
export { runExperiment, runQuickTest } from "./test-runner.js";

// Re-export types
export type {
  Position,
  Velocity,
  Acceleration,
  Mass,
} from "./position-system.js";

/**
 * Quick start function for running the experiment
 */
export async function quickStart(): Promise<void> {
  console.log("🦊> Reynard ECS SIMD Experiment - Quick Start");
  console.log("============================================");

  const { runQuickTest } = await import("./test-runner.js");
  await runQuickTest();
}

/**
 * Full benchmark function
 */
export async function fullBenchmark(): Promise<void> {
  console.log("🦊> Reynard ECS SIMD Experiment - Full Benchmark");
  console.log("===============================================");

  const { runExperiment } = await import("./test-runner.js");
  await runExperiment();
}

// Auto-run quick test if imported
if (typeof window !== "undefined") {
  // Browser environment
  (
    window as typeof window & { ReynardECSSIMD: Record<string, unknown> }
  ).ReynardECSSIMD = {
    quickStart,
    fullBenchmark,
    PositionSystem: (await import("./position-system.js")).PositionSystem,
    PositionSystemSIMD: (await import("./position-system-simd.js"))
      .PositionSystemSIMD,
    ECSComparisonBenchmark: (await import("./benchmark.js"))
      .ECSComparisonBenchmark,
  };

  console.log("🦊> Reynard ECS SIMD Experiment loaded!");
  console.log("Available functions:");
  console.log("- ReynardECSSIMD.quickStart() - Run quick test");
  console.log("- ReynardECSSIMD.fullBenchmark() - Run full benchmark");
}
