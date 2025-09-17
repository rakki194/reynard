#!/usr/bin/env node
/**
 * @fileoverview ECS Benchmark Runner Script
 *
 * This script provides a command-line interface for running ECS benchmarks
 * with various configurations and output formats.
 *
 * @example
 * ```bash
 * # Run all benchmarks with default settings
 * npx ts-node run-benchmarks.ts
 *
 * # Run specific benchmark categories
 * npx ts-node run-benchmarks.ts --category entity
 * npx ts-node run-benchmarks.ts --category query
 * npx ts-node run-benchmarks.ts --category system
 * npx ts-node run-benchmarks.ts --category stress
 *
 * # Run with custom configuration
 * npx ts-node run-benchmarks.ts --entities 1000,5000,10000 --iterations 500
 *
 * # Export results to file
 * npx ts-node run-benchmarks.ts --export results.json
 * ```
 *
 * @author Reynard ECS Team
 * @since 1.0.0
 */
/**
 * Main function that orchestrates the benchmark execution.
 */
declare function main(): Promise<void>;
export { main as runBenchmarks };
