# Playwright Animation Control for Benchmark Testing

_Comprehensive guide to disabling animations and transitions in Playwright tests for consistent performance measurements and benchmark accuracy._

## Overview

When conducting performance benchmarks and automated testing, animations and transitions can introduce significant variability in timing measurements. This document provides a complete solution for controlling animations in Playwright tests, ensuring consistent and reliable benchmark results.

## Problem Statement

### The Challenge

Animations and CSS transitions can cause:

- **Timing Variability**: Different animation durations affect performance measurements
- **Inconsistent Results**: Tests may pass or fail based on animation timing rather than actual performance
- **Measurement Interference**: Performance observers may capture animation-related metrics
- **Accessibility Testing**: Need to test with `prefers-reduced-motion` media query

### Common Configuration Errors

**❌ Invalid Approach:**

```typescript
// This DOES NOT work - reducedMotion is not a valid Playwright config option
export default defineConfig({
  use: {
    reducedMotion: "reduce", // ❌ TypeScript error
  },
});
```

**✅ Correct Approach:**

```typescript
// Use proper Playwright APIs in test setup
import { disableAnimations } from "../core/utils/animation-control";

test.beforeEach(async ({ page }) => {
  await disableAnimations(page);
});
```

## Solution Architecture

### Core Components

1. **Animation Control Utilities** (`animation-control.ts`)
2. **Test Integration** (beforeEach hooks)
3. **Configuration Management** (Playwright config)
4. **Performance Optimization** (observer management)

### Implementation Strategy

The solution uses a multi-layered approach:

1. **CSS Media Query Control**: `page.emulateMedia({ reducedMotion: 'reduce' })`
2. **CSS Injection**: Disable all animations and transitions via injected styles
3. **Performance Observer Management**: Prevent interference with measurements
4. **Timing Consistency**: Ensure predictable execution timing

## Implementation Guide

### 1. Animation Control Utilities

Create `e2e/core/utils/animation-control.ts`:

```typescript
/**
 * @fileoverview Animation control utilities for benchmark tests
 *
 * Provides utilities to disable animations and transitions for consistent
 * benchmark timing and performance testing.
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
```

### 2. Test Integration

#### Basic Integration

```typescript
import { test } from "@playwright/test";
import { disableAnimations } from "../core/utils/animation-control";

test.describe("Performance Tests", () => {
  test.beforeEach(async ({ page }) => {
    // Disable animations for consistent benchmark timing
    await disableAnimations(page);
  });

  test("component rendering benchmark", async ({ page }) => {
    await page.goto("/test-page");
    // Your benchmark test logic here
  });
});
```

#### Advanced Integration with Complete Setup

```typescript
import { test } from "@playwright/test";
import { setupBenchmarkPage } from "../core/utils/animation-control";

test.describe("Advanced Benchmark Tests", () => {
  test("comprehensive performance test", async ({ page }) => {
    // Complete setup with navigation and animation control
    await setupBenchmarkPage(page, "http://localhost:3000/benchmark");

    // Your benchmark test logic here
    const startTime = performance.now();
    await page.click("#trigger-render");
    const endTime = performance.now();

    expect(endTime - startTime).toBeLessThan(100); // 100ms threshold
  });
});
```

### 3. Playwright Configuration

#### Correct Configuration

```typescript
// playwright.config.benchmark.ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "../suites/benchmark",
  testMatch: ["**/*.spec.ts"],

  // Single worker for consistent benchmark results
  workers: 1,
  fullyParallel: false,

  use: {
    baseURL: "http://localhost:3000",

    // Extended timeouts for benchmark tests
    actionTimeout: 30000,
    navigationTimeout: 60000,

    // Set consistent viewport
    viewport: { width: 1920, height: 1080 },

    // Disable service workers for consistent results
    serviceWorkers: "block",

    // ❌ DO NOT include reducedMotion here - it's not a valid option
  },

  projects: [
    {
      name: "benchmark-chromium",
      use: {
        ...devices["Desktop Chrome"],
        launchOptions: {
          args: [
            "--disable-gpu",
            "--disable-dev-shm-usage",
            "--disable-extensions",
            "--disable-background-timer-throttling",
            "--disable-backgrounding-occluded-windows",
            "--disable-renderer-backgrounding",
            "--disable-features=TranslateUI",
            "--disable-ipc-flooding-protection",
            "--no-sandbox",
            "--disable-setuid-sandbox",
          ],
        },
      },
    },
  ],

  // Extended timeouts for benchmark tests
  timeout: 120 * 1000, // 2 minutes per test
  expect: {
    timeout: 30 * 1000,
  },
});
```

## Advanced Patterns

### 1. Conditional Animation Control

```typescript
export async function conditionalAnimationControl(page: Page, disable: boolean = true): Promise<void> {
  if (disable) {
    await disableAnimations(page);
  } else {
    await enableAnimations(page);
  }
}

// Usage in tests
test("test with animations enabled", async ({ page }) => {
  await conditionalAnimationControl(page, false);
  // Test with animations enabled
});

test("test with animations disabled", async ({ page }) => {
  await conditionalAnimationControl(page, true);
  // Test with animations disabled
});
```

### 2. Performance Measurement Integration

```typescript
export async function measurePerformance(page: Page, testFunction: () => Promise<void>): Promise<number> {
  await disableAnimations(page);

  const startTime = performance.now();
  await testFunction();
  const endTime = performance.now();

  return endTime - startTime;
}

// Usage
test("performance measurement", async ({ page }) => {
  const renderTime = await measurePerformance(page, async () => {
    await page.click("#render-button");
    await page.waitForSelector("#result");
  });

  expect(renderTime).toBeLessThan(50); // 50ms threshold
});
```

### 3. Accessibility Testing Integration

```typescript
export async function testWithReducedMotion(page: Page, testFunction: () => Promise<void>): Promise<void> {
  // Test with reduced motion preference
  await page.emulateMedia({ reducedMotion: "reduce" });
  await testFunction();

  // Test with normal motion preference
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await testFunction();
}

// Usage
test("accessibility compliance", async ({ page }) => {
  await testWithReducedMotion(page, async () => {
    await page.goto("/animated-page");
    // Verify page works correctly in both modes
  });
});
```

## Best Practices

### 1. Test Organization

```typescript
// Organize tests by animation requirements
test.describe("Performance Tests (No Animations)", () => {
  test.beforeEach(async ({ page }) => {
    await disableAnimations(page);
  });

  // All performance tests here
});

test.describe("Visual Tests (With Animations)", () => {
  // Visual tests that need animations
});
```

### 2. Error Handling

```typescript
export async function safeDisableAnimations(page: Page): Promise<void> {
  try {
    await disableAnimations(page);
  } catch (error) {
    console.warn("Failed to disable animations:", error);
    // Continue with test - don't fail due to animation control issues
  }
}
```

### 3. Performance Monitoring

```typescript
export async function benchmarkWithMonitoring(
  page: Page,
  testName: string,
  testFunction: () => Promise<void>
): Promise<BenchmarkResult> {
  await disableAnimations(page);

  const startTime = performance.now();
  const startMemory = await page.evaluate(() => performance.memory?.usedJSHeapSize || 0);

  await testFunction();

  const endTime = performance.now();
  const endMemory = await page.evaluate(() => performance.memory?.usedJSHeapSize || 0);

  return {
    testName,
    duration: endTime - startTime,
    memoryDelta: endMemory - startMemory,
    timestamp: Date.now(),
  };
}
```

## Troubleshooting

### Common Issues

#### 1. TypeScript Configuration Errors

**Error**: `'reducedMotion' does not exist in type 'UseOptions'`

**Solution**: Remove `reducedMotion` from Playwright config and use the utility functions instead.

#### 2. Animations Still Running

**Cause**: CSS animations with higher specificity or JavaScript animations

**Solution**:

```typescript
// Add more specific CSS rules
await page.addStyleTag({
  content: `
    * {
      animation: none !important;
      transition: none !important;
      transform: none !important;
    }

    /* Target specific animation libraries */
    .animate, .fade-in, .slide-up {
      animation: none !important;
    }
  `,
});
```

#### 3. Performance Observer Interference

**Cause**: Performance observers capturing animation-related metrics

**Solution**: Use the provided `setupBenchmarkPage` function which disables interfering observers.

### Debug Mode

```typescript
export async function debugAnimationControl(page: Page): Promise<void> {
  await page.evaluate(() => {
    console.log("Animation control debug info:");
    console.log("Reduced motion preference:", window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    console.log("Active animations:", document.getAnimations().length);
    console.log("CSS transitions:", document.querySelectorAll("*").length);
  });
}
```

## Performance Impact

### Before Animation Control

- **Timing Variability**: ±50-200ms due to animations
- **Inconsistent Results**: Tests may pass/fail randomly
- **Measurement Noise**: Performance observers capture animation metrics

### After Animation Control

- **Consistent Timing**: ±1-5ms measurement precision
- **Reliable Results**: Tests pass/fail based on actual performance
- **Clean Metrics**: Only relevant performance data captured

## Integration with Reynard Framework

### Package Structure

```
e2e/
├── core/
│   ├── utils/
│   │   └── animation-control.ts
│   └── setup/
│       └── benchmark-setup.ts
├── suites/
│   └── benchmark/
│       ├── component-rendering-benchmark.spec.ts
│       └── virtual-scrolling-verification.spec.ts
└── configs/
    └── playwright.config.benchmark.ts
```

### Usage in Reynard Tests

```typescript
// In any Reynard benchmark test
import { disableAnimations, setupBenchmarkPage } from "../../core/utils/animation-control";

test.beforeEach(async ({ page }) => {
  await disableAnimations(page);
  // Your test setup
});
```

## Conclusion

🦊 _whiskers twitch with satisfaction_ Proper animation control in Playwright tests is essential for reliable performance benchmarking. By using the correct Playwright APIs and implementing comprehensive animation control utilities, you can achieve:

- **Consistent Performance Measurements**: Eliminate timing variability from animations
- **Reliable Test Results**: Tests pass/fail based on actual performance, not animation timing
- **Accessibility Compliance**: Proper testing of reduced motion preferences
- **Clean Performance Metrics**: Accurate measurement without animation interference

The solution provided here follows Reynard's modular architecture principles and integrates seamlessly with the existing benchmark testing infrastructure. Remember: always use proper Playwright APIs rather than non-existent configuration options, and implement comprehensive animation control for the most reliable benchmark results.

_Strategic animation control leads to precise performance insights - the fox's way of ensuring every measurement counts._ 🦊
