#!/usr/bin/env node
/**
 * @fileoverview Test script to verify memory tracking fixes and improvements.
 *
 * This script tests the enhanced memory tracking system to ensure it properly
 * handles garbage collection and provides accurate memory usage statistics.
 *
 * @example
 * ```bash
 * npx tsx test-memory-fixes.ts
 * ```
 *
 * @author Reynard ECS Team
 * @since 1.0.0
 */
/**
 * Runs all memory tracking verification tests.
 */
declare function runAllMemoryTests(): Promise<void>;
export { runAllMemoryTests };
