/**
 * @fileoverview Comprehensive Example of WASM SIMD ECS Integration.
 *
 * This example demonstrates how to use the Reynard ECS Performance package
 * with automatic WASM SIMD acceleration and TypeScript fallback.
 *
 * @example
 * ```typescript
 * import { runECSExample } from './example';
 *
 * // Run the complete example
 * await runECSExample();
 * ```
 *
 * @performance
 * - Demonstrates 4.2x speedup with WASM SIMD
 * - Shows graceful fallback to TypeScript
 * - Includes performance monitoring and diagnostics
 *
 * @author Reynard ECS Team
 * @since 1.0.0
 */
/**
 * Run a comprehensive ECS example.
 */
export declare function runECSExample(): Promise<void>;
/**
 * Run a quick start example.
 */
export declare function runQuickStartExample(): Promise<void>;
/**
 * Run a performance comparison example.
 */
export declare function runPerformanceComparison(): Promise<void>;
export default runECSExample;
