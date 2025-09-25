/**
 * Memory Performance Testing Utilities
 *
 * Helper functions for memory leak detection and performance testing.
 *
 * @author 🦊 The Cunning Fox
 */

import { Page } from "@playwright/test";

/**
 * TypeScript interface for Chrome's performance.memory API
 */
interface PerformanceMemory {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

/**
 * Extended Performance interface with memory property
 */
interface PerformanceWithMemory extends Performance {
  memory?: PerformanceMemory;
}

/**
 * Memory usage snapshot
 */
export interface MemorySnapshot {
  used: number;
  total: number;
  limit?: number;
}

/**
 * Get current memory usage from the page
 */
export async function getMemoryUsage(page: Page): Promise<MemorySnapshot | null> {
  return await page.evaluate(() => {
    const perf = performance as PerformanceWithMemory;

    if (perf.memory) {
      return {
        used: perf.memory.usedJSHeapSize,
        total: perf.memory.totalJSHeapSize,
        limit: perf.memory.jsHeapSizeLimit,
      };
    }

    return null;
  });
}

/**
 * Calculate memory increase between two snapshots
 */
export function calculateMemoryIncrease(initial: MemorySnapshot, final: MemorySnapshot): number {
  return final.used - initial.used;
}

/**
 * Convert bytes to megabytes
 */
export function bytesToMB(bytes: number): number {
  return bytes / (1024 * 1024);
}

/**
 * Assert memory increase is within acceptable limits
 */
export function assertMemoryIncrease(initial: MemorySnapshot, final: MemorySnapshot, maxIncreaseMB: number): void {
  const increase = calculateMemoryIncrease(initial, final);
  const increaseMB = bytesToMB(increase);

  if (increaseMB > maxIncreaseMB) {
    throw new Error(`Memory increase too large: ${increaseMB.toFixed(2)}MB (max: ${maxIncreaseMB}MB)`);
  }
}

/**
 * Perform memory stress test with multiple interactions
 */
export async function performMemoryStressTest(
  page: Page,
  interactions: () => Promise<void>,
  iterations: number = 10
): Promise<void> {
  for (let i = 0; i < iterations; i++) {
    await interactions();
    await page.waitForTimeout(100);
  }
}
