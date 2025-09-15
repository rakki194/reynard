/**
 * 🦦 LAYOUT SHIFT VALIDATOR
 *
 * *splashes with layout stability excitement* Validates browser Layout Shift API availability
 * for Core Web Vitals monitoring in performance tests.
 */

import { Page } from "@playwright/test";

export interface LayoutShiftAPIAvailability {
  layoutShift: boolean;
}

/**
 * Validate Layout Shift API availability in browser
 */
export async function validateLayoutShiftAPI(page: Page): Promise<LayoutShiftAPIAvailability> {
  const layoutShiftAPI = await page.evaluate(() => {
    return {
      layoutShift:
        typeof PerformanceObserver !== "undefined" && PerformanceObserver.supportedEntryTypes?.includes("layout-shift"),
    };
  });

  console.log("🔄 Layout Shift API Availability:", layoutShiftAPI);
  return layoutShiftAPI;
}
