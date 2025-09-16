/**
 * @fileoverview DOMBench with Integrated Plotting
 *
 * Runs DOMBench and automatically generates beautiful plots of the results.
 *
 * @author Pool-Theorist-35 (Reynard Otter Specialist)
 * @since 1.0.0
 */

import { runWorkingDOMBench } from "./dombench.js";
import { plotBenchmarkResults } from "./plot-benchmark-results.js";

/**
 * Run DOMBench with automatic plotting
 */
export async function runDOMBenchWithPlots(): Promise<void> {
  console.log("🦦 Starting DOMBench with integrated plotting...\n");
  
  try {
    // Run the benchmark
    console.log("📊 Running DOMBench...");
    await runWorkingDOMBench();
    
    console.log("\n📈 Generating performance plots...");
    await plotBenchmarkResults();
    
    console.log("\n✅ DOMBench with plots completed successfully!");
    console.log("🦦 Check the dombench-results/ directory for all generated files!");
    
  } catch (error) {
    console.error("❌ DOMBench with plots failed:", error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runDOMBenchWithPlots().catch(console.error);
}
