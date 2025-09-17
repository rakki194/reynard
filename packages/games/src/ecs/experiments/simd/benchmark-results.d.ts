import { BenchmarkResult } from "./benchmark-types.js";
export interface BenchmarkResults {
    simd: BenchmarkResult[];
    reynard: BenchmarkResult[];
}
export declare class BenchmarkResultsFormatter {
    /**
     * Print comparison results
     */
    static printResults(results: BenchmarkResults): void;
    /**
     * Generate summary statistics
     */
    static generateSummary(results: BenchmarkResults): {
        averageSpeedup: number;
        bestSpeedup: number;
        worstSpeedup: number;
        totalTests: number;
    };
    /**
     * Export results to JSON format
     */
    static exportToJSON(results: BenchmarkResults): string;
}
