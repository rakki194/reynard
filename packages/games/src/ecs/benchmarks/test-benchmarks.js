#!/usr/bin/env node
/**
 * @fileoverview Simple test script to verify ECS benchmarks work correctly.
 *
 * This script runs a minimal set of benchmarks to ensure the benchmark
 * suite is functioning properly before running full performance tests.
 *
 * @example
 * ```bash
 * npx ts-node test-benchmarks.ts
 * ```
 *
 * @author Reynard ECS Team
 * @since 1.0.0
 */
import { ECSBenchmarkRunner } from "./ecs-benchmark.js";
/**
 * Test configuration with minimal settings for quick verification.
 */
const TEST_CONFIG = {
    entityCounts: [10, 50, 100], // Small entity counts for fast testing
    iterations: 10, // Very few iterations for quick verification
    warmupIterations: 2, // Minimal warmup
    enableMemoryTracking: false, // Disable for speed
    enableDetailedLogging: true, // Enable for debugging
};
/**
 * Runs a quick test of the benchmark suite to verify it works.
 */
async function testBenchmarks() {
    console.log("🧪 Testing ECS Benchmark Suite");
    console.log("=".repeat(40));
    try {
        const runner = new ECSBenchmarkRunner(TEST_CONFIG);
        console.log("✅ ECSBenchmarkRunner created successfully");
        // Test entity creation benchmark
        console.log("\n🦊> Testing entity creation benchmark...");
        const entityResults = await runner.benchmarkEntityCreation();
        console.log(`✅ Entity creation benchmark completed: ${entityResults.length} results`);
        // Test query benchmark
        console.log("\n🦦> Testing query benchmark...");
        const queryResults = await runner.benchmarkQueries();
        console.log(`✅ Query benchmark completed: ${queryResults.length} results`);
        // Test system execution benchmark
        console.log("\n🐺> Testing system execution benchmark...");
        const systemResults = await runner.benchmarkSystemExecution();
        console.log(`✅ System execution benchmark completed: ${systemResults.length} results`);
        // Test resource access benchmark
        console.log("\n📦> Testing resource access benchmark...");
        const resourceResults = await runner.benchmarkResourceAccess();
        console.log(`✅ Resource access benchmark completed: ${resourceResults.length} results`);
        // Print summary
        const allResults = [
            ...entityResults,
            ...queryResults,
            ...systemResults,
            ...resourceResults,
        ];
        console.log("\n📊 Test Summary:");
        console.log(`  Total benchmarks run: ${allResults.length}`);
        console.log(`  Average time: ${(allResults.reduce((sum, r) => sum + r.averageTimeUs, 0) / allResults.length).toFixed(2)}μs`);
        console.log(`  Fastest operation: ${Math.min(...allResults.map((r) => r.averageTimeUs)).toFixed(2)}μs`);
        console.log(`  Slowest operation: ${Math.max(...allResults.map((r) => r.averageTimeUs)).toFixed(2)}μs`);
        console.log("\n🎉 All benchmark tests passed successfully!");
        console.log("🚀 The benchmark suite is ready for full performance testing!");
    }
    catch (error) {
        console.error("❌ Benchmark test failed:", error);
        process.exit(1);
    }
}
// Run the test if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    testBenchmarks().catch((error) => {
        console.error("❌ Fatal error:", error);
        process.exit(1);
    });
}
export { testBenchmarks };
