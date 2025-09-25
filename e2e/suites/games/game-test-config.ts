/**
 * Game Test Configuration Utilities
 *
 * Centralized configuration for game-specific test options and constants.
 * This approach avoids Playwright configuration type conflicts while
 * providing reusable game test settings.
 *
 * 🦊 *whiskers twitch with gaming precision* Game test configuration made elegant.
 */

/**
 * Game-specific test configuration options
 */
export const GAME_TEST_CONFIG = {
  // Performance thresholds
  maxLoadTime: 5000, // 5 seconds
  maxRenderTime: 100, // 100ms
  maxMemoryIncrease: 20 * 1024 * 1024, // 20MB

  // Interaction timeouts
  clickTimeout: 1000,
  keyboardTimeout: 500,
  hoverTimeout: 200,

  // Game-specific settings
  gameInitializationDelay: 2000, // 2 seconds for games to initialize
  gameInteractionDelay: 100, // 100ms between interactions

  // Viewport configurations
  viewports: {
    standard: { width: 1280, height: 720 },
    highDpi: { width: 1920, height: 1080 },
    mobile: { width: 375, height: 667 },
  },

  // Browser launch options for games
  browserArgs: {
    chromium: [
      "--enable-webgl",
      "--enable-gpu",
      "--enable-accelerated-2d-canvas",
      "--enable-accelerated-mjpeg-decode",
      "--enable-accelerated-video-decode",
      "--disable-background-timer-throttling",
      "--disable-backgrounding-occluded-windows",
      "--disable-renderer-backgrounding",
    ] as string[],
    firefox: {
      "webgl.force-enabled": true,
      "webgl.msaa-force": true,
      "gfx.webrender.all": true,
    },
  },
} as const;

/**
 * Game test environment variables
 */
export const GAME_ENV_VARS = {
  // Performance monitoring
  ENABLE_PERFORMANCE_MONITORING: process.env.ENABLE_PERFORMANCE_MONITORING === "true",

  // Debug options
  DEBUG_GAME_RENDERING: process.env.DEBUG_GAME_RENDERING === "true",
  DEBUG_GAME_INTERACTIONS: process.env.DEBUG_GAME_INTERACTIONS === "true",

  // Test data
  GAME_TEST_DATA_PATH: process.env.GAME_TEST_DATA_PATH || "./test-data",

  // Screenshot options
  CAPTURE_GAME_SCREENSHOTS: process.env.CAPTURE_GAME_SCREENSHOTS === "true",
  SCREENSHOT_QUALITY: parseInt(process.env.SCREENSHOT_QUALITY || "80", 10),
} as const;

/**
 * Helper function to get game test timeout based on test type
 */
export function getGameTestTimeout(testType: "load" | "interaction" | "performance" | "default"): number {
  switch (testType) {
    case "load":
      return GAME_TEST_CONFIG.maxLoadTime;
    case "interaction":
      return GAME_TEST_CONFIG.clickTimeout;
    case "performance":
      return GAME_TEST_CONFIG.maxRenderTime;
    default:
      return 15000; // 15 seconds default
  }
}

/**
 * Helper function to get game initialization delay
 */
export function getGameInitializationDelay(): number {
  return GAME_TEST_CONFIG.gameInitializationDelay;
}

/**
 * Helper function to get game interaction delay
 */
export function getGameInteractionDelay(): number {
  return GAME_TEST_CONFIG.gameInteractionDelay;
}

/**
 * Helper function to check if performance monitoring is enabled
 */
export function isPerformanceMonitoringEnabled(): boolean {
  return GAME_ENV_VARS.ENABLE_PERFORMANCE_MONITORING;
}

/**
 * Helper function to get viewport configuration
 */
export function getViewportConfig(type: keyof typeof GAME_TEST_CONFIG.viewports) {
  return GAME_TEST_CONFIG.viewports[type];
}

/**
 * Helper function to get Chromium browser launch arguments
 */
export function getChromiumArgs(): string[] {
  return GAME_TEST_CONFIG.browserArgs.chromium;
}

/**
 * Helper function to get Firefox browser launch arguments
 */
export function getFirefoxArgs(): { [key: string]: string | number | boolean } {
  return GAME_TEST_CONFIG.browserArgs.firefox;
}
