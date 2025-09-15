/**
 * 🦦 GLOBAL PERFORMANCE TESTING SETUP
 *
 * *splashes with performance monitoring excitement* Global setup for
 * performance testing including environment validation and optimization.
 */

import { chromium, FullConfig } from "@playwright/test";
import * as fs from "fs";
import * as os from "os";
import { setupPerformanceDataCollection } from "./performance-data-collector";
import { validateLayoutShiftAPI, validateMemoryAPI, validatePerformanceAPI } from "./validators";

async function globalSetup(_config: FullConfig) {
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
  const totalMemory = os.totalmem();
  const freeMemory = os.freemem();
  const memoryUsagePercent = ((totalMemory - freeMemory) / totalMemory) * 100;

  console.log(
    `📊 System Memory: ${(totalMemory / 1024 / 1024 / 1024).toFixed(2)}GB total, ${(freeMemory / 1024 / 1024 / 1024).toFixed(2)}GB free (${memoryUsagePercent.toFixed(1)}% used)`
  );

  if (memoryUsagePercent > 90) {
    console.warn("⚠️ High memory usage detected. Performance tests may be affected.");
  }

  // Check CPU cores
  const cpuCount = os.cpus().length;
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
    // Validate all required APIs using modular validators
    const [perfAPI, , layoutShiftAPI] = await Promise.all([
      validatePerformanceAPI(page),
      validateMemoryAPI(page),
      validateLayoutShiftAPI(page),
    ]);

    // Check if all required APIs are available
    const requiredAPIs = [perfAPI.performance, perfAPI.performanceObserver, layoutShiftAPI.layoutShift];

    if (!requiredAPIs.every(Boolean)) {
      throw new Error("Required performance APIs are not available in this browser");
    }

    console.log("✅ All required performance APIs are available");
  } finally {
    await browser.close();
  }
}

export default globalSetup;
