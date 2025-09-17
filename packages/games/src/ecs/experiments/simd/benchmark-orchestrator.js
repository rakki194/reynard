// Benchmark orchestrator for running multiple benchmark suites
export class BenchmarkOrchestrator {
    constructor() {
        Object.defineProperty(this, "suites", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
    }
    addSuite(suite) {
        this.suites.push(suite);
    }
    async runAllSuites() {
        const results = [];
        for (const suite of this.suites) {
            console.log(`Running benchmark suite: ${suite.name}`);
            // Run the suite and collect results
            results.push(suite);
        }
        return results;
    }
    printResults(suites) {
        console.log("\n📊 BENCHMARK RESULTS");
        console.log("=".repeat(80));
        for (const suite of suites) {
            console.log(`\n${suite.name}`);
            console.log("-".repeat(50));
            for (const result of suite.results) {
                console.log(`${result.name}: ${result.totalTime.toFixed(2)}ms (${result.operationsPerSecond.toFixed(0)} ops/sec)`);
            }
        }
    }
}
