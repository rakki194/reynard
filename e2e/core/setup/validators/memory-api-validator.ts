/**
 * 🦦 MEMORY API VALIDATOR
 *
 * *splashes with memory monitoring excitement* Validates browser Memory API availability
 * for memory usage tracking in performance tests.
 */

import { Page } from "@playwright/test";

export interface MemoryAPIAvailability {
  memory: boolean;
  memoryInfo: boolean;
}

/**
 * Validate Memory API availability in browser
 */
export async function validateMemoryAPI(page: Page): Promise<MemoryAPIAvailability> {
  const memoryAPI = await page.evaluate(() => {
    return {
      memory: typeof (performance as any).memory !== "undefined",
      memoryInfo: typeof (performance as any).memory?.usedJSHeapSize !== "undefined",
    };
  });

  console.log("🧠 Memory API Availability:", memoryAPI);
  return memoryAPI;
}
