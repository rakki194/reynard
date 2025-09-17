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
/**
 * Runs a quick test of the benchmark suite to verify it works.
 */
declare function testBenchmarks(): Promise<void>;
export { testBenchmarks };
