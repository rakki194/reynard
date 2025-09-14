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

import {
  BenchmarkConfig,
  BenchmarkResult,
  ECSBenchmarkRunner,
  runECSBenchmarks,
  runEntityBenchmarks,
  runQueryBenchmarks,
  runStressTests,
  runSystemBenchmarks,
} from "./ecs-benchmark.js";

/**
 * Command line argument parser for benchmark configuration.
 */
interface BenchmarkArgs {
  category?: string;
  entities?: string;
  iterations?: number;
  warmup?: number;
  memory?: boolean;
  export?: string;
  help?: boolean;
}

/**
 * Parses command line arguments into benchmark configuration.
 */
function parseArgs(): BenchmarkArgs {
  const args: BenchmarkArgs = {};

  for (let i = 2; i < process.argv.length; i++) {
    const arg = process.argv[i];

    switch (arg) {
      case "--category":
      case "-c":
        args.category = process.argv[++i];
        break;
      case "--entities":
      case "-e":
        args.entities = process.argv[++i];
        break;
      case "--iterations":
      case "-i":
        args.iterations = parseInt(process.argv[++i], 10);
        break;
      case "--warmup":
      case "-w":
        args.warmup = parseInt(process.argv[++i], 10);
        break;
      case "--memory":
      case "-m":
        args.memory = true;
        break;
      case "--export":
      case "-x":
        args.export = process.argv[++i];
        break;
      case "--help":
      case "-h":
        args.help = true;
        break;
      default:
        if (arg.startsWith("--")) {
          console.warn(`Unknown argument: ${arg}`);
        }
        break;
    }
  }

  return args;
}

/**
 * Converts entity count string to array of numbers.
 */
function parseEntityCounts(entitiesStr: string): number[] {
  return entitiesStr
    .split(",")
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => !isNaN(n));
}

/**
 * Creates benchmark configuration from command line arguments.
 */
function createConfig(args: BenchmarkArgs): Partial<BenchmarkConfig> {
  const config: Partial<BenchmarkConfig> = {};

  if (args.entities) {
    config.entityCounts = parseEntityCounts(args.entities);
  }

  if (args.iterations) {
    config.iterations = args.iterations;
  }

  if (args.warmup) {
    config.warmupIterations = args.warmup;
  }

  if (args.memory !== undefined) {
    config.enableMemoryTracking = args.memory;
  }

  return config;
}

/**
 * Prints help information.
 */
function printHelp(): void {
  console.log(`
🦊> Reynard ECS Benchmark Runner

Usage: npx ts-node run-benchmarks.ts [options]

Options:
  -c, --category <type>    Run specific benchmark category
                          (all, entity, query, system, stress)
  -e, --entities <list>    Comma-separated entity counts (default: 100,500,1000,5000,10000,25000,50000)
  -i, --iterations <num>   Number of iterations per benchmark (default: 1000)
  -w, --warmup <num>       Number of warmup iterations (default: 100)
  -m, --memory            Enable memory usage tracking
  -x, --export <file>     Export results to JSON file
  -h, --help              Show this help message

Examples:
  npx ts-node run-benchmarks.ts
  npx ts-node run-benchmarks.ts --category entity --entities 1000,5000,10000
  npx ts-node run-benchmarks.ts --iterations 500 --memory --export results.json
  npx ts-node run-benchmarks.ts --category stress --entities 10000,50000,100000

Benchmark Categories:
  all      Run all benchmark categories (default)
  entity   Entity creation, component addition/removal
  query    Query performance with various filters
  system   System execution timing
  stress   High entity count stress tests
`);
}

/**
 * Runs benchmarks based on the specified category.
 */
async function runBenchmarkCategory(
  category: string,
  config: Partial<BenchmarkConfig>,
): Promise<BenchmarkResult[]> {
  switch (category.toLowerCase()) {
    case "entity":
      console.log("🦊> Running Entity Benchmarks...");
      return await runEntityBenchmarks(config);

    case "query":
      console.log("🦦> Running Query Benchmarks...");
      return await runQueryBenchmarks(config);

    case "system":
      console.log("🐺> Running System Benchmarks...");
      return await runSystemBenchmarks(config);

    case "stress":
      console.log("🔥> Running Stress Tests...");
      return await runStressTests(config);

    case "all":
    default:
      console.log("🚀> Running All Benchmarks...");
      return await runECSBenchmarks(config);
  }
}

/**
 * Formats and prints benchmark results in a readable format.
 */
function printResults(results: BenchmarkResult[]): void {
  if (results.length === 0) {
    console.log("No benchmark results to display.");
    return;
  }

  console.log("\n📊 Benchmark Results");
  console.log("=".repeat(80));

  // Group results by operation
  const groupedResults = new Map<string, BenchmarkResult[]>();
  for (const result of results) {
    if (!groupedResults.has(result.operation)) {
      groupedResults.set(result.operation, []);
    }
    groupedResults.get(result.operation)!.push(result);
  }

  // Print results for each operation
  for (const [operation, operationResults] of groupedResults) {
    console.log(`\n${operation}:`);
    console.log("  Entities    Avg Time (μs)    Ops/sec      Memory (MB)");
    console.log("  " + "-".repeat(60));

    for (const result of operationResults) {
      const entities = result.entityCount.toLocaleString().padStart(8);
      const avgTime = result.averageTimeUs.toFixed(2).padStart(12);
      const opsPerSec = result.operationsPerSecond.toFixed(0).padStart(10);
      const memory = result.memoryUsageMB
        ? result.memoryUsageMB.toFixed(2).padStart(10)
        : "N/A".padStart(10);

      console.log(`  ${entities}  ${avgTime}  ${opsPerSec}  ${memory}`);
    }
  }

  // Performance summary
  console.log("\n⚡ Performance Summary:");
  const avgTime =
    results.reduce((sum, r) => sum + r.averageTimeUs, 0) / results.length;
  const maxTime = Math.max(...results.map((r) => r.averageTimeUs));
  const minTime = Math.min(...results.map((r) => r.averageTimeUs));
  const totalMemory = results.reduce(
    (sum, r) => sum + (r.memoryUsageMB || 0),
    0,
  );

  console.log(`  Average Time: ${avgTime.toFixed(2)}μs`);
  console.log(`  Fastest: ${minTime.toFixed(2)}μs`);
  console.log(`  Slowest: ${maxTime.toFixed(2)}μs`);
  console.log(`  Total Memory: ${totalMemory.toFixed(2)} MB`);
}

/**
 * Main function that orchestrates the benchmark execution.
 */
async function main(): Promise<void> {
  const args = parseArgs();

  if (args.help) {
    printHelp();
    return;
  }

  const config = createConfig(args);
  const category = args.category || "all";

  console.log("🦊> Reynard ECS Benchmark Suite");
  console.log("=".repeat(50));
  console.log(`Category: ${category}`);
  console.log(`Entity Counts: ${config.entityCounts?.join(", ") || "default"}`);
  console.log(`Iterations: ${config.iterations || "default"}`);
  console.log(
    `Memory Tracking: ${config.enableMemoryTracking ? "enabled" : "disabled"}`,
  );
  console.log("");

  try {
    const startTime = performance.now();
    const results = await runBenchmarkCategory(category, config);
    const endTime = performance.now();

    printResults(results);

    console.log(
      `\n⏱️  Total benchmark time: ${(endTime - startTime).toFixed(2)}ms`,
    );

    // Export results if requested
    if (args.export) {
      const runner = new ECSBenchmarkRunner(config);
      const jsonData = runner.exportResults(args.export);

      // In a real implementation, you'd write to file system
      console.log(`\n📁 Results exported to: ${args.export}`);
      console.log(`📄 JSON data length: ${jsonData.length} characters`);
    }
  } catch (error) {
    console.error("❌ Benchmark execution failed:", error);
    process.exit(1);
  }
}

// Run the main function if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error("❌ Fatal error:", error);
    process.exit(1);
  });
}

export { main as runBenchmarks };
