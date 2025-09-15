/**
 * 🦦 GLOBAL PERFORMANCE TESTING SETUP
 *
 * *splashes with performance monitoring excitement* Global setup for
 * performance testing including environment validation and optimization.
 */

import { chromium, FullConfig } from "@playwright/test";
import { exec } from "child_process";
import * as fs from "fs";
import { promisify } from "util";

const execAsync = promisify(exec);

async function globalSetup(config: FullConfig) {
  console.log("🦦 Starting Performance Testing Global Setup...");

  // Validate performance testing environment
  await validatePerformanceEnvironment();

  // Setup performance monitoring
  await setupPerformanceMonitoring();

  // Validate browser performance capabilities
  await validateBrowserPerformance();

  // Setup performance data collection
  await setupPerformanceDataCollection();

  console.log("✅ Performance testing global setup completed");
}

/**
 * Validate performance testing environment
 */
async function validatePerformanceEnvironment(): Promise<void> {
  console.log("🔍 Validating performance testing environment...");

  // Check Node.js version for performance features
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split(".")[0]);

  if (majorVersion < 16) {
    throw new Error(`Node.js version ${nodeVersion} is too old for performance testing. Please use Node.js 16+`);
  }

  // Check available memory
  const totalMemory = require("os").totalmem();
  const freeMemory = require("os").freemem();
  const memoryUsagePercent = ((totalMemory - freeMemory) / totalMemory) * 100;

  console.log(
    `📊 System Memory: ${(totalMemory / 1024 / 1024 / 1024).toFixed(2)}GB total, ${(freeMemory / 1024 / 1024 / 1024).toFixed(2)}GB free (${memoryUsagePercent.toFixed(1)}% used)`
  );

  if (memoryUsagePercent > 90) {
    console.warn("⚠️ High memory usage detected. Performance tests may be affected.");
  }

  // Check CPU cores
  const cpuCount = require("os").cpus().length;
  console.log(`🖥️ CPU Cores: ${cpuCount}`);

  if (cpuCount < 4) {
    console.warn("⚠️ Limited CPU cores detected. Consider running performance tests on a more powerful machine.");
  }

  // Validate required directories
  const requiredDirs = ["./results", "./results/performance-results", "./results/traces", "./results/reports"];

  for (const dir of requiredDirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`📁 Created directory: ${dir}`);
    }
  }
}

/**
 * Setup performance monitoring
 */
async function setupPerformanceMonitoring(): Promise<void> {
  console.log("📊 Setting up performance monitoring...");

  // Create performance monitoring configuration
  const perfConfig = {
    enabled: true,
    metrics: {
      layoutShifts: true,
      paintTiming: true,
      navigationTiming: true,
      resourceTiming: true,
      userTiming: true,
      longTasks: true,
    },
    thresholds: {
      cls: 0.1,
      lcp: 2500,
      fid: 100,
      fcp: 1800,
      tbt: 200,
    },
    sampling: {
      interval: 100, // ms
      duration: 30000, // 30 seconds
    },
  };

  const configPath = "./results/performance-config.json";
  fs.writeFileSync(configPath, JSON.stringify(perfConfig, null, 2));
  console.log(`✅ Performance config saved: ${configPath}`);
}

/**
 * Validate browser performance capabilities
 */
async function validateBrowserPerformance(): Promise<void> {
  console.log("🌐 Validating browser performance capabilities...");

  const browser = await chromium.launch({
    headless: true,
    args: [
      "--disable-background-timer-throttling",
      "--disable-backgrounding-occluded-windows",
      "--disable-renderer-backgrounding",
      "--enable-precise-memory-info",
      "--enable-gpu-benchmarking",
    ],
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Test performance API availability
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

    // Test memory API
    const memoryAPI = await page.evaluate(() => {
      return {
        memory: typeof (performance as any).memory !== "undefined",
        memoryInfo: typeof (performance as any).memory?.usedJSHeapSize !== "undefined",
      };
    });

    console.log("🧠 Memory API Availability:", memoryAPI);

    // Test layout shift API
    const layoutShiftAPI = await page.evaluate(() => {
      return {
        layoutShift:
          typeof PerformanceObserver !== "undefined" &&
          PerformanceObserver.supportedEntryTypes?.includes("layout-shift"),
      };
    });

    console.log("🔄 Layout Shift API Availability:", layoutShiftAPI);

    // Validate all required APIs are available
    const requiredAPIs = [
      perfAPIAvailable.performance,
      perfAPIAvailable.performanceObserver,
      layoutShiftAPI.layoutShift,
    ];

    if (!requiredAPIs.every(Boolean)) {
      throw new Error("Required performance APIs are not available in this browser");
    }

    console.log("✅ All required performance APIs are available");
  } finally {
    await browser.close();
  }
}

/**
 * Setup performance data collection
 */
async function setupPerformanceDataCollection(): Promise<void> {
  console.log("📈 Setting up performance data collection...");

  // Create performance data schema
  const performanceSchema = {
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    environment: {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      memory: {
        total: require("os").totalmem(),
        free: require("os").freemem(),
      },
      cpus: require("os").cpus().length,
    },
    metrics: {
      layoutShifts: {
        type: "array",
        items: {
          timestamp: "number",
          value: "number",
          hadRecentInput: "boolean",
          sources: "array",
        },
      },
      paintTiming: {
        firstPaint: "number",
        firstContentfulPaint: "number",
        largestContentfulPaint: "number",
      },
      navigationTiming: {
        navigationStart: "number",
        loadEventEnd: "number",
        domContentLoaded: "number",
        firstByte: "number",
        domInteractive: "number",
      },
      resourceTiming: {
        type: "array",
        items: {
          name: "string",
          startTime: "number",
          duration: "number",
          transferSize: "number",
          initiatorType: "string",
        },
      },
      userTiming: {
        type: "array",
        items: {
          name: "string",
          startTime: "number",
          duration: "number",
        },
      },
    },
  };

  const schemaPath = "./results/performance-schema.json";
  fs.writeFileSync(schemaPath, JSON.stringify(performanceSchema, null, 2));
  console.log(`✅ Performance schema saved: ${schemaPath}`);

  // Create performance baseline
  const baseline = {
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    thresholds: {
      cls: 0.1,
      lcp: 2500,
      fid: 100,
      fcp: 1800,
      tbt: 200,
    },
    targets: {
      cls: 0.05,
      lcp: 2000,
      fid: 50,
      fcp: 1500,
      tbt: 100,
    },
  };

  const baselinePath = "./results/performance-baseline.json";
  fs.writeFileSync(baselinePath, JSON.stringify(baseline, null, 2));
  console.log(`✅ Performance baseline saved: ${baselinePath}`);
}

export default globalSetup;
