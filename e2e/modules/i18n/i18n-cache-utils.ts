/**
 * I18n Cache Performance Utilities
 *
 * 🦦 *splashes with cache precision* Utilities for measuring
 * cache performance and hit rates in i18n systems.
 */

import { Page } from "@playwright/test";
import { CachePerformanceResult } from "./i18n-benchmark-types";

export class I18nCacheUtils {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Measure cache performance
   */
  async measureCachePerformance(): Promise<CachePerformanceResult> {
    // First load (cache miss)
    const startTime1 = performance.now();
    await this.page.reload();
    await this.page.waitForSelector('[data-testid="translated-content"]');
    const endTime1 = performance.now();
    const cacheMissTime = endTime1 - startTime1;

    // Second load (cache hit)
    const startTime2 = performance.now();
    await this.page.reload();
    await this.page.waitForSelector('[data-testid="translated-content"]');
    const endTime2 = performance.now();
    const cacheHitTime = endTime2 - startTime2;

    const hitRate = cacheMissTime > 0 ? (cacheMissTime - cacheHitTime) / cacheMissTime : 0;

    return {
      hitRate: Math.max(0, Math.min(1, hitRate)),
      loadTime: cacheHitTime,
    };
  }

  /**
   * Measure cache performance with multiple iterations
   */
  async measureCachePerformanceWithIterations(iterations: number = 5): Promise<{
    averageHitRate: number;
    averageLoadTime: number;
    results: CachePerformanceResult[];
  }> {
    const results: CachePerformanceResult[] = [];

    for (let i = 0; i < iterations; i++) {
      const result = await this.measureCachePerformance();
      results.push(result);
    }

    const averageHitRate = results.reduce((sum, r) => sum + r.hitRate, 0) / results.length;
    const averageLoadTime = results.reduce((sum, r) => sum + r.loadTime, 0) / results.length;

    return {
      averageHitRate,
      averageLoadTime,
      results,
    };
  }

  /**
   * Clear cache and measure cold start performance
   */
  async measureColdStartPerformance(): Promise<number> {
    // Clear cache
    await this.page.evaluate(() => {
      if ("caches" in window) {
        const cachesAPI = (window as { caches: { keys(): Promise<string[]>; delete(name: string): Promise<boolean> } })
          .caches;
        cachesAPI.keys().then((names: string[]) => {
          names.forEach(name => {
            cachesAPI.delete(name);
          });
        });
      }
    });

    const startTime = performance.now();
    await this.page.reload();
    await this.page.waitForSelector('[data-testid="translated-content"]');
    const endTime = performance.now();

    return endTime - startTime;
  }

  /**
   * Format cache hit rate for display
   */
  formatHitRate(hitRate: number): string {
    return `${(hitRate * 100).toFixed(1)}%`;
  }
}
