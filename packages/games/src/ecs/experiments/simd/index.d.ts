export { PositionSystem } from "./position-system.js";
export { PositionSystemSIMD } from "./position-system-simd.js";
export { ECSComparisonBenchmark } from "./benchmark.js";
export type { BenchmarkResult, BenchmarkSuite } from "./benchmark.js";
export { runExperiment, runQuickTest } from "./test-runner.js";
export type { Position, Velocity, Acceleration, Mass, } from "./position-system.js";
/**
 * Quick start function for running the experiment
 */
export declare function quickStart(): Promise<void>;
/**
 * Full benchmark function
 */
export declare function fullBenchmark(): Promise<void>;
