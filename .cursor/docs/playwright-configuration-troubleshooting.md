# Playwright Configuration Troubleshooting Guide

_Comprehensive guide to resolving common Playwright configuration issues, TypeScript errors, and best practices for reliable test automation._

## Overview

This document addresses common Playwright configuration problems, TypeScript compilation errors, and provides systematic approaches to resolving configuration issues. Based on real-world research and troubleshooting experience, this guide helps developers avoid common pitfalls and implement robust Playwright configurations.

## Common Configuration Errors

### 1. Invalid Property Errors

#### Error: `'reducedMotion' does not exist in type 'UseOptions'`

**Problem Description:**

```typescript
// ❌ This causes TypeScript error
export default defineConfig({
  use: {
    reducedMotion: "reduce", // Property doesn't exist
  },
});
```

**Error Message:**

```
No overload matches this call.
The last overload gave the following error.
Object literal may only specify known properties, and 'reducedMotion' does not exist in type 'UseOptions<PlaywrightTestOptions & CustomProperties<unknown>, PlaywrightWorkerOptions & CustomProperties<unknown>>'.
```

**Root Cause Analysis:**

- `reducedMotion` is not a valid property in Playwright's `UseOptions` type
- This property was likely assumed to exist based on CSS media query naming
- Playwright uses different APIs for media query emulation

**Correct Solution:**

```typescript
// ✅ Use proper Playwright APIs in test setup
import { test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
});
```

#### Error: `'viewport' does not exist in type 'UseOptions'`

**Problem Description:**

```typescript
// ❌ Incorrect property name
export default defineConfig({
  use: {
    viewport: { width: 1920, height: 1080 }, // Should be 'viewport'
  },
});
```

**Correct Solution:**

```typescript
// ✅ Correct property name
export default defineConfig({
  use: {
    viewport: { width: 1920, height: 1080 },
  },
});
```

### 2. Type Definition Issues

#### Error: `Property 'memory' does not exist on type 'Performance'`

**Problem Description:**

```typescript
// ❌ TypeScript doesn't recognize performance.memory
const memoryUsage = performance.memory.usedJSHeapSize;
```

**Root Cause:**

- `performance.memory` is a Chrome-specific extension
- Not part of the standard Performance API
- Requires proper type definitions

**Correct Solution:**

```typescript
// ✅ Proper type handling
const memoryUsage = (performance as any).memory?.usedJSHeapSize || 0;

// Or with proper type assertion
interface PerformanceWithMemory extends Performance {
  memory?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
}

const memoryUsage = (performance as PerformanceWithMemory).memory?.usedJSHeapSize || 0;
```

### 3. Configuration Structure Issues

#### Error: `Cannot find module '@playwright/test'`

**Problem Description:**

```typescript
// ❌ Import fails
import { test, expect } from "@playwright/test";
```

**Root Cause Analysis:**

- Playwright not installed
- Incorrect package manager usage
- Version compatibility issues

**Solutions:**

1. **Install Playwright:**

```bash
# Using npm
npm install @playwright/test

# Using pnpm (Reynard's preferred)
pnpm add @playwright/test

# Using yarn
yarn add @playwright/test
```

2. **Install browsers:**

```bash
npx playwright install
```

3. **Check package.json:**

```json
{
  "devDependencies": {
    "@playwright/test": "^1.40.0"
  }
}
```

## Systematic Troubleshooting Approach

### Step 1: Verify Installation

```bash
# Check if Playwright is installed
npm list @playwright/test

# Check Playwright version
npx playwright --version

# Verify browser installation
npx playwright install --dry-run
```

### Step 2: Validate Configuration Syntax

```typescript
// Basic valid configuration template
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
```

### Step 3: Check TypeScript Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM"],
    "module": "ESNext",
    "moduleResolution": "node",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

### Step 4: Validate Test Structure

```typescript
// Basic test structure
import { test, expect } from "@playwright/test";

test("basic test", async ({ page }) => {
  await page.goto("https://playwright.dev/");
  await expect(page).toHaveTitle(/Playwright/);
});
```

## Advanced Configuration Patterns

### 1. Environment-Specific Configuration

```typescript
// playwright.config.ts
import { defineConfig, devices } from "@playwright/test";

const isCI = !!process.env.CI;
const baseURL = process.env.BASE_URL || "http://localhost:3000";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: !isCI,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 1 : undefined,
  reporter: [["html"], ["json", { outputFile: "test-results.json" }], ...(isCI ? [["github"]] : [])],
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: baseURL,
    reuseExistingServer: !isCI,
  },
});
```

### 2. Multi-Environment Setup

```typescript
// playwright.config.ts
import { defineConfig, devices } from "@playwright/test";

const environments = {
  development: {
    baseURL: "http://localhost:3000",
    workers: 4,
    retries: 0,
  },
  staging: {
    baseURL: "https://staging.example.com",
    workers: 2,
    retries: 1,
  },
  production: {
    baseURL: "https://example.com",
    workers: 1,
    retries: 2,
  },
};

const env = process.env.ENVIRONMENT || "development";
const config = environments[env as keyof typeof environments];

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: config.retries,
  workers: config.workers,
  reporter: "html",
  use: {
    baseURL: config.baseURL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
```

### 3. Custom Test Utilities

```typescript
// test-utils.ts
import { Page, expect } from "@playwright/test";

export class TestUtils {
  constructor(private page: Page) {}

  async disableAnimations(): Promise<void> {
    await this.page.emulateMedia({ reducedMotion: "reduce" });
    await this.page.addStyleTag({
      content: `
        *, *::before, *::after {
          animation-duration: 0s !important;
          transition-duration: 0s !important;
        }
      `,
    });
  }

  async waitForStableLayout(): Promise<void> {
    await this.page.waitForLoadState("networkidle");
    await this.page.waitForTimeout(100);
  }

  async measurePerformance<T>(operation: () => Promise<T>): Promise<{ result: T; duration: number }> {
    const startTime = performance.now();
    const result = await operation();
    const duration = performance.now() - startTime;
    return { result, duration };
  }
}

// Usage in tests
import { test } from "@playwright/test";
import { TestUtils } from "./test-utils";

test("performance test", async ({ page }) => {
  const utils = new TestUtils(page);
  await utils.disableAnimations();

  const { result, duration } = await utils.measurePerformance(async () => {
    await page.click("#render-button");
    await page.waitForSelector("#result");
  });

  expect(duration).toBeLessThan(100);
});
```

## Performance Optimization

### 1. Parallel Execution

```typescript
// Optimize for parallel execution
export default defineConfig({
  fullyParallel: true,
  workers: process.env.CI ? 2 : 4,
  projects: [
    {
      name: "smoke-tests",
      testMatch: "**/smoke/**/*.spec.ts",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "integration-tests",
      testMatch: "**/integration/**/*.spec.ts",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
```

### 2. Resource Management

```typescript
// Optimize resource usage
export default defineConfig({
  use: {
    // Disable unnecessary features
    javaScriptEnabled: true,
    acceptDownloads: false,
    ignoreHTTPSErrors: true,

    // Optimize network
    extraHTTPHeaders: {
      "Accept-Encoding": "gzip, deflate",
    },
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        launchOptions: {
          args: ["--disable-gpu", "--disable-dev-shm-usage", "--disable-extensions", "--no-sandbox"],
        },
      },
    },
  ],
});
```

### 3. Caching and Reuse

```typescript
// Enable caching for faster test execution
export default defineConfig({
  use: {
    // Enable browser context reuse
    storageState: "auth.json",

    // Cache resources
    extraHTTPHeaders: {
      "Cache-Control": "max-age=3600",
    },
  },
  globalSetup: require.resolve("./global-setup.ts"),
  globalTeardown: require.resolve("./global-teardown.ts"),
});
```

## Debugging Techniques

### 1. Debug Mode

```typescript
// Enable debug mode
export default defineConfig({
  use: {
    // Enable debugging
    headless: false,
    slowMo: 100,
    trace: "on",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
});
```

### 2. Logging and Tracing

```typescript
// Comprehensive logging
import { test } from "@playwright/test";

test("debug test", async ({ page }) => {
  // Enable console logging
  page.on("console", msg => console.log("PAGE LOG:", msg.text()));

  // Enable network logging
  page.on("request", request => console.log("REQUEST:", request.url()));
  page.on("response", response => console.log("RESPONSE:", response.url()));

  // Enable error logging
  page.on("pageerror", error => console.log("PAGE ERROR:", error.message));

  await page.goto("https://example.com");
});
```

### 3. Performance Monitoring

```typescript
// Monitor performance metrics
test("performance monitoring", async ({ page }) => {
  await page.goto("https://example.com");

  // Get performance metrics
  const metrics = await page.evaluate(() => {
    const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
    return {
      loadTime: navigation.loadEventEnd - navigation.loadEventStart,
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      firstPaint: performance.getEntriesByName("first-paint")[0]?.startTime || 0,
    };
  });

  console.log("Performance metrics:", metrics);
});
```

## Best Practices

### 1. Configuration Organization

```typescript
// Organize configuration by concern
const baseConfig = {
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
};

const retryConfig = {
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
};

const reporterConfig = {
  reporter: [["html"], ["json", { outputFile: "test-results.json" }]],
};

const useConfig = {
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
};

export default defineConfig({
  ...baseConfig,
  ...retryConfig,
  ...reporterConfig,
  ...useConfig,
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
```

### 2. Environment Variables

```bash
# .env file
BASE_URL=http://localhost:3000
CI=false
ENVIRONMENT=development
HEADLESS=true
SLOW_MO=0
```

```typescript
// Use environment variables
export default defineConfig({
  use: {
    baseURL: process.env.BASE_URL || "http://localhost:3000",
    headless: process.env.HEADLESS === "true",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        launchOptions: {
          slowMo: parseInt(process.env.SLOW_MO || "0"),
        },
      },
    },
  ],
});
```

### 3. Error Handling

```typescript
// Robust error handling
test("error handling example", async ({ page }) => {
  try {
    await page.goto("https://example.com");
    await page.click("#non-existent-element");
  } catch (error) {
    console.error("Test failed:", error);
    await page.screenshot({ path: "error-screenshot.png" });
    throw error;
  }
});
```

## Integration with Reynard Framework

### 1. Package Structure

```
e2e/
├── configs/
│   ├── playwright.config.benchmark.ts
│   ├── playwright.config.e2e.ts
│   └── playwright.config.unit.ts
├── core/
│   ├── utils/
│   │   ├── animation-control.ts
│   │   └── test-utils.ts
│   └── setup/
│       ├── global-setup.ts
│       └── global-teardown.ts
└── suites/
    ├── benchmark/
    ├── e2e/
    └── unit/
```

### 2. Reynard-Specific Configuration

```typescript
// playwright.config.reynard.ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "../suites",
  testMatch: ["**/*.spec.ts"],

  // Reynard-specific settings
  fullyParallel: false, // For consistent benchmark results
  workers: 1, // Single worker for deterministic results

  use: {
    baseURL: "http://localhost:3000",

    // Reynard animation control
    // Note: reducedMotion is handled in test setup, not config

    // Performance optimization
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },

  projects: [
    {
      name: "reynard-chromium",
      use: {
        ...devices["Desktop Chrome"],
        launchOptions: {
          args: ["--disable-gpu", "--disable-dev-shm-usage", "--disable-extensions", "--no-sandbox"],
        },
      },
    },
  ],

  // Reynard web server
  webServer: {
    command: "cd ../fixtures/benchmark-pages && python3 -m http.server 3000",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
  },
});
```

## Conclusion

🦊 _whiskers twitch with strategic satisfaction_ Proper Playwright configuration is essential for reliable test automation. By understanding common configuration errors, implementing systematic troubleshooting approaches, and following best practices, you can create robust and maintainable test suites.

Key takeaways:

- **Use Correct APIs**: Always use proper Playwright APIs rather than assuming configuration properties exist
- **Validate TypeScript**: Ensure proper type definitions and handle browser-specific APIs correctly
- **Organize Configuration**: Structure configuration files for maintainability and clarity
- **Implement Error Handling**: Build robust error handling and debugging capabilities
- **Optimize Performance**: Configure for optimal test execution speed and resource usage

The patterns and solutions provided here are based on real-world research and troubleshooting experience, ensuring they address actual problems developers encounter when working with Playwright.

_Strategic configuration leads to reliable automation - the fox's way of ensuring every test runs smoothly._ 🦊
