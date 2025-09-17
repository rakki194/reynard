// Simple test for WebAssembly SIMD benchmark
import { PositionBenchmark } from "./position-benchmark.js";
async function runSimpleTest() {
    console.log("🦊> Starting Simple WebAssembly SIMD Test");
    console.log("=".repeat(50));
    try {
        const benchmark = new PositionBenchmark(1000);
        await benchmark.initialize();
        console.log("✅ WebAssembly SIMD system initialized successfully!");
        // Run a simple benchmark
        const results = await benchmark.benchmarkPositionUpdates(100, 100);
        console.log("\n📊 Results:");
        console.log(`Non-SIMD: ${results.nonSimd.totalTime.toFixed(2)}ms (${results.nonSimd.operationsPerSecond.toFixed(0)} ops/sec)`);
        console.log(`SIMD:     ${results.simd.totalTime.toFixed(2)}ms (${results.simd.operationsPerSecond.toFixed(0)} ops/sec)`);
        const speedup = results.nonSimd.totalTime / results.simd.totalTime;
        console.log(`Speedup:  ${speedup.toFixed(2)}x ${speedup > 1 ? "🚀" : "🐌"}`);
        console.log("\n🎉 WebAssembly SIMD benchmark completed successfully!");
    }
    catch (error) {
        console.error("❌ Test failed:", error);
    }
}
runSimpleTest();
