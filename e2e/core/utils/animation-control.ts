/**
 * @fileoverview Animation control utilities for benchmark tests
 *
 * Provides utilities to disable animations and transitions for consistent
 * benchmark timing and performance testing.
 *
 * @author Wit-Mediator-21 (Reynard Fox Specialist)
 * @since 1.0.0
 */

import { Page } from "@playwright/test";

/**
 * Disables all animations and transitions on the page for consistent benchmark results
 *
 * This function:
 * 1. Sets the prefers-reduced-motion media query to 'reduce'
 * 2. Injects CSS to disable all animations and transitions
 * 3. Ensures consistent timing for performance measurements
 *
 * @param page - The Playwright page instance
 */
export async function disableAnimations(page: Page): Promise<void> {
  // Set reduced motion preference
  await page.emulateMedia({ reducedMotion: "reduce" });

  // Inject CSS to disable all animations and transitions
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        transition-duration: 0s !important;
        transition-delay: 0s !important;
        scroll-behavior: auto !important;
      }

      /* Disable specific animation properties */
      [style*="animation"] {
        animation: none !important;
      }

      [style*="transition"] {
        transition: none !important;
      }

      /* Disable CSS animations */
      @keyframes * {
        from, to { transform: none; }
      }

      /* Ensure no transform animations */
      * {
        transform: none !important;
      }
    `,
  });

  // Wait for any pending animations to complete
  await page.waitForTimeout(100);
}

/**
 * Enables animations on the page (reverses disableAnimations)
 *
 * @param page - The Playwright page instance
 */
export async function enableAnimations(page: Page): Promise<void> {
  // Reset media preferences
  await page.emulateMedia({ reducedMotion: "no-preference" });

  // Remove the injected style tag
  await page.evaluate(() => {
    const styleTags = document.querySelectorAll("style[data-playwright-animation-control]");
    styleTags.forEach(tag => tag.remove());
  });
}

/**
 * Sets up a page with animations disabled for benchmark testing
 *
 * This is a convenience function that combines page setup with animation disabling
 *
 * @param page - The Playwright page instance
 * @param url - Optional URL to navigate to
 */
export async function setupBenchmarkPage(page: Page, url?: string): Promise<void> {
  // Navigate to URL if provided
  if (url) {
    await page.goto(url);
  }

  // Disable animations for consistent timing
  await disableAnimations(page);

  // Set up additional benchmark-specific configurations
  await page.evaluate(() => {
    // Disable any performance observers that might interfere
    if (window.PerformanceObserver) {
      const _originalObserve = window.PerformanceObserver.prototype.observe;
      window.PerformanceObserver.prototype.observe = function () {
        // No-op to prevent interference with measurements
      };
    }

    // Ensure consistent timing
    if (window.requestAnimationFrame) {
      const originalRAF = window.requestAnimationFrame;
      window.requestAnimationFrame = (callback: FrameRequestCallback) => {
        return originalRAF(() => {
          // Execute immediately for consistent timing
          callback(performance.now());
        });
      };
    }
  });
}
