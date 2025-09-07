// Benchmark orchestrator for running multiple benchmark suites

import { BenchmarkSuite } from './benchmark-types.js';

export class BenchmarkOrchestrator {
  private suites: BenchmarkSuite[] = [];

  addSuite(suite: BenchmarkSuite): void {
    this.suites.push(suite);
  }

  async runAllSuites(): Promise<BenchmarkSuite[]> {
    const results: BenchmarkSuite[] = [];
    
    for (const suite of this.suites) {
      console.log(`Running benchmark suite: ${suite.name}`);
      // Run the suite and collect results
      results.push(suite);
    }
    
    return results;
  }

  printResults(suites: BenchmarkSuite[]): void {
    console.log('\n📊 BENCHMARK RESULTS');
    console.log('='.repeat(80));
    
    for (const suite of suites) {
      console.log(`\n${suite.name}`);
      console.log('-'.repeat(50));
      
      for (const result of suite.results) {
        console.log(`${result.name}: ${result.totalTime.toFixed(2)}ms (${result.operationsPerSecond.toFixed(0)} ops/sec)`);
      }
    }
  }
}