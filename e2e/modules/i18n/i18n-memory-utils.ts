/**
 * I18n Memory and Bundle Size Utilities
 *
 * 🦦 *splashes with memory precision* Utilities for measuring
 * memory usage and bundle size in i18n performance tests.
 */

import { Page } from "@playwright/test";

export class I18nMemoryUtils {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Measure memory usage in bytes
   */
  async getMemoryUsage(): Promise<number> {
    return await this.page.evaluate(() => {
      if (performance.memory) {
        return performance.memory.usedJSHeapSize;
      }
      return 0;
    });
  }

  /**
   * Measure bundle size from network requests
   */
  async getBundleSize(): Promise<number> {
    return await this.page.evaluate(() => {
      const resources = performance.getEntriesByType("resource") as unknown as Array<{
        name: string;
        transferSize?: number;
      }>;
      return resources
        .filter(
          resource =>
            resource.name.includes(".js") ||
            resource.name.includes(".css") ||
            resource.name.includes("i18n") ||
            resource.name.includes("translation")
        )
        .reduce((total: number, resource) => {
          return total + (resource.transferSize || 0);
        }, 0);
    });
  }

  /**
   * Get memory usage difference between two measurements
   */
  async getMemoryDifference(startMemory: number): Promise<number> {
    const currentMemory = await this.getMemoryUsage();
    return currentMemory - startMemory;
  }

  /**
   * Format memory usage for display
   */
  formatMemoryUsage(bytes: number): string {
    const mb = bytes / 1024 / 1024;
    return `${mb.toFixed(2)}MB`;
  }

  /**
   * Format bundle size for display
   */
  formatBundleSize(bytes: number): string {
    const kb = bytes / 1024;
    return `${kb.toFixed(2)}KB`;
  }
}
