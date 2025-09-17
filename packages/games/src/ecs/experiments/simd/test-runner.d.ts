/**
 * Run the SIMD ECS benchmark experiment
 */
declare function runExperiment(): Promise<void>;
/**
 * Run a quick test with a smaller dataset
 */
declare function runQuickTest(): Promise<void>;
export { runExperiment, runQuickTest };
