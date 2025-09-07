// Test runner for SIMD ECS experiments

import { ECSComparisonBenchmark } from './ecs-comparison-benchmark.js';

/**
 * Run the SIMD ECS benchmark experiment
 */
async function runExperiment(): Promise<void> {
  console.log('🦊> Starting Reynard ECS SIMD Experiment');
  console.log('='.repeat(60));

  try {
    // Create benchmark instance
    const benchmark = new ECSComparisonBenchmark(100000);
    
    // Run the complete benchmark suite
    await benchmark.runComparisonBenchmark();
    
  } catch (error) {
    console.error('❌ Experiment failed:', error);
  }
}

/**
 * Print a summary of the benchmark results
 */
function printSummary(): void {
  console.log('\n🎯 EXPERIMENT SUMMARY');
  console.log('='.repeat(60));
  console.log('Check the detailed results above for performance comparisons.');
  console.log('Look for speedup ratios to determine if SIMD provides benefits.');
}

/**
 * Run a quick test to verify systems work
 */
async function runQuickTest(): Promise<void> {
  console.log('🧪 Running Quick Test...');
  
  try {
    const benchmark = new ECSComparisonBenchmark(1000);
    await benchmark.initialize();
    
    // Test with small dataset
    const results = await benchmark.benchmarkPositionUpdates(100, 100);
    
    console.log('✅ Quick test passed!');
    console.log(`Reynard ECS: ${results.reynard.totalTime.toFixed(2)}ms`);
    console.log(`SIMD: ${results.simd.totalTime.toFixed(2)}ms`);
    
  } catch (error) {
    console.error('❌ Quick test failed:', error);
  }
}

// Export functions for use in other modules
export { runExperiment, runQuickTest };

// Run experiment if this file is executed directly
if (typeof window === 'undefined' && typeof globalThis !== 'undefined' && globalThis.process) {
  // Node.js environment
  runExperiment().catch(console.error);
} else if (typeof window !== 'undefined') {
  // Browser environment - expose to global scope
  (window as unknown as { runECSSIMDExperiment: typeof runExperiment; runECSSIMDQuickTest: typeof runQuickTest }).runECSSIMDExperiment = runExperiment;
  (window as unknown as { runECSSIMDExperiment: typeof runExperiment; runECSSIMDQuickTest: typeof runQuickTest }).runECSSIMDQuickTest = runQuickTest;
  
  console.log('🦊> ECS SIMD Experiment loaded in browser');
  console.log('Run: window.runECSSIMDExperiment() to start the benchmark');
  console.log('Run: window.runECSSIMDQuickTest() for a quick test');
}
