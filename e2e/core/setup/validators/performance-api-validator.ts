/**
 * 🦦 PERFORMANCE API VALIDATOR
 *
 * *splashes with API validation excitement* Validates browser Performance API availability
 * for comprehensive performance testing capabilities.
 */

import { Page } from "@playwright/test";

export interface PerformanceAPIAvailability {
  performance: boolean;
  performanceObserver: boolean;
  performanceNavigationTiming: boolean;
  performanceResourceTiming: boolean;
  performancePaintTiming: boolean;
  performanceLongTaskTiming: boolean;
}

/**
 * Validate Performance API availability in browser
 */
export async function validatePerformanceAPI(page: Page): Promise<PerformanceAPIAvailability> {
  const perfAPIAvailable = await page.evaluate(() => {
    return {
      performance: typeof performance !== "undefined",
      performanceObserver: typeof PerformanceObserver !== "undefined",
      performanceNavigationTiming: typeof PerformanceNavigationTiming !== "undefined",
      performanceResourceTiming: typeof PerformanceResourceTiming !== "undefined",
      performancePaintTiming: typeof PerformancePaintTiming !== "undefined",
      performanceLongTaskTiming: typeof PerformanceLongTaskTiming !== "undefined",
    };
  });

  console.log("📊 Performance API Availability:", perfAPIAvailable);
  return perfAPIAvailable;
}
