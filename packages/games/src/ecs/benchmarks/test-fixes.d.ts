#!/usr/bin/env node
/**
 * @fileoverview Test script to verify Map size limit fixes and memory tracking improvements.
 *
 * This script tests the optimized change detection and memory tracking systems
 * to ensure they can handle large entity counts without hitting limits.
 *
 * @example
 * ```bash
 * npx tsx test-fixes.ts
 * ```
 *
 * @author Reynard ECS Team
 * @since 1.0.0
 */
/**
 * Runs all fix verification tests.
 */
declare function runAllTests(): Promise<void>;
export { runAllTests };
