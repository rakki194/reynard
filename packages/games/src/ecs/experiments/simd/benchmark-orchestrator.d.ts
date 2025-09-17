import { BenchmarkSuite } from "./benchmark-types.js";
export declare class BenchmarkOrchestrator {
    private suites;
    addSuite(suite: BenchmarkSuite): void;
    runAllSuites(): Promise<BenchmarkSuite[]>;
    printResults(suites: BenchmarkSuite[]): void;
}
