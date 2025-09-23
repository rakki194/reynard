/**
 * 🦊 Global Animation CSS Control Tests
 * 
 * Comprehensive test suite for the global animation CSS control system.
 * Tests CSS injection, disable utilities, and integration features.
 */

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { 
  GlobalAnimationDisableUtils,
  getGlobalAnimationDisableUtils,
  resetGlobalAnimationDisableUtils,
  GlobalAnimationDisableFunctions,
  AnimationDisableTesting
} from "../GlobalAnimationDisableUtils.js";
import { 
  GlobalAnimationIntegration,
  GlobalAnimationIntegrationUtils,
  useGlobalAnimationIntegration
} from "../GlobalAnimationIntegration.js";
import type { GlobalAnimationConfig, SystemPreferences } from "../GlobalAnimationTypes.js";

// Mock DOM APIs
const mockDocument = {
  head: {
    appendChild: vi.fn(),
    removeChild: vi.fn(),
  },
  documentElement: {
    classList: {
      add: vi.fn(),
      remove: vi.fn(),
      toggle: vi.fn(),
      contains: vi.fn(),
    },
    style: {
      setProperty: vi.fn(),
      removeProperty: vi.fn(),
    },
  },
  createElement: vi.fn(() => ({
    id: "",
    type: "",
    textContent: "",
    parentNode: null,
  })),
};

const mockWindow = {
  matchMedia: vi.fn(() => ({
    matches: false,
    media: "",
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
  PerformanceObserver: vi.fn(() => ({
    observe: vi.fn(),
    disconnect: vi.fn(),
  })),
};

// Mock global objects
Object.defineProperty(global, "document", {
  value: mockDocument,
  writable: true,
});

Object.defineProperty(global, "window", {
  value: mockWindow,
  writable: true,
});

describe("Global Animation Disable Utils", () => {
  let disableUtils: GlobalAnimationDisableUtils;

  beforeEach(() => {
    vi.clearAllMocks();
    disableUtils = new GlobalAnimationDisableUtils();
  });

  afterEach(() => {
    disableUtils.destroy();
  });

  describe("Animation Control", () => {
    it("should disable all animations", () => {
      disableUtils.disableAllAnimations();
      
      const state = disableUtils.getCurrentState();
      expect(state.isDisabled).toBe(true);
    });

    it("should enable all animations", () => {
      disableUtils.disableAllAnimations();
      disableUtils.enableAllAnimations();
      
      const state = disableUtils.getCurrentState();
      expect(state.isDisabled).toBe(false);
    });

    it("should toggle performance mode", () => {
      disableUtils.togglePerformanceMode(true);
      
      const state = disableUtils.getCurrentState();
      expect(state.isPerformanceMode).toBe(true);
    });

    it("should toggle accessibility mode", () => {
      disableUtils.toggleAccessibilityMode(true);
      
      const state = disableUtils.getCurrentState();
      expect(state.isAccessibilityMode).toBe(true);
    });
  });

  describe("CSS Injection", () => {
    it("should inject CSS for disabling animations", () => {
      disableUtils.disableAllAnimations({ useCSSInjection: true });
      
      expect(mockDocument.createElement).toHaveBeenCalledWith("style");
      expect(mockDocument.head.appendChild).toHaveBeenCalled();
    });

    it("should remove injected CSS", () => {
      disableUtils.disableAllAnimations({ useCSSInjection: true });
      disableUtils.enableAllAnimations({ useCSSInjection: true });
      
      // Should have called removeChild
      expect(mockDocument.head.removeChild).toHaveBeenCalled();
    });

    it("should inject custom CSS", () => {
      const customCSS = "body { color: red; }";
      disableUtils.injectCSS({
        css: customCSS,
        id: "test-css",
        useImportant: true,
      });
      
      expect(mockDocument.createElement).toHaveBeenCalledWith("style");
      expect(mockDocument.head.appendChild).toHaveBeenCalled();
    });

    it("should remove custom CSS", () => {
      disableUtils.injectCSS({
        css: "body { color: red; }",
        id: "test-css",
      });
      
      disableUtils.removeInjectedCSS("test-css");
      
      expect(mockDocument.head.removeChild).toHaveBeenCalled();
    });
  });

  describe("Configuration Application", () => {
    it("should apply configuration correctly", () => {
      const config: GlobalAnimationConfig = {
        enabled: false,
        performance: {
          enabled: true,
          maxFPS: 30,
          reducedQuality: true,
          disableComplex: true,
        },
        accessibility: {
          respectReducedMotion: true,
          respectHighContrast: true,
          respectColorScheme: true,
          highContrast: true,
        },
        fallback: {
          useCSSFallbacks: true,
          immediateCompletion: true,
          reducedMotionFallback: true,
        },
        packages: {
          useSmartImports: true,
          checkAvailability: true,
          gracefulDegradation: true,
        },
      };

      const preferences: SystemPreferences = {
        prefersReducedMotion: false,
        prefersHighContrast: false,
        prefersColorScheme: "light",
        prefersContrast: "no-preference",
        forcedColors: "none",
      };

      disableUtils.applyConfiguration(config, preferences);
      
      const state = disableUtils.getCurrentState();
      expect(state.isDisabled).toBe(true);
      expect(state.isPerformanceMode).toBe(true);
      expect(state.isAccessibilityMode).toBe(true);
    });
  });

  describe("State Management", () => {
    it("should get current state", () => {
      const state = disableUtils.getCurrentState();
      
      expect(state).toHaveProperty("isDisabled");
      expect(state).toHaveProperty("isPerformanceMode");
      expect(state).toHaveProperty("isAccessibilityMode");
      expect(state).toHaveProperty("injectedStyles");
    });

    it("should reset state", () => {
      disableUtils.disableAllAnimations();
      disableUtils.togglePerformanceMode(true);
      disableUtils.toggleAccessibilityMode(true);
      
      disableUtils.reset();
      
      const state = disableUtils.getCurrentState();
      expect(state.isDisabled).toBe(false);
      expect(state.isPerformanceMode).toBe(false);
      expect(state.isAccessibilityMode).toBe(false);
    });
  });
});

describe("Global Animation Disable Functions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    resetGlobalAnimationDisableUtils();
  });

  it("should provide global disable functions", () => {
    GlobalAnimationDisableFunctions.disableAllAnimations();
    
    const state = GlobalAnimationDisableFunctions.getCurrentState();
    expect(state.isDisabled).toBe(true);
  });

  it("should provide global enable functions", () => {
    GlobalAnimationDisableFunctions.disableAllAnimations();
    GlobalAnimationDisableFunctions.enableAllAnimations();
    
    const state = GlobalAnimationDisableFunctions.getCurrentState();
    expect(state.isDisabled).toBe(false);
  });

  it("should provide performance mode toggle", () => {
    GlobalAnimationDisableFunctions.togglePerformanceMode(true);
    
    const state = GlobalAnimationDisableFunctions.getCurrentState();
    expect(state.isPerformanceMode).toBe(true);
  });

  it("should provide accessibility mode toggle", () => {
    GlobalAnimationDisableFunctions.toggleAccessibilityMode(true);
    
    const state = GlobalAnimationDisableFunctions.getCurrentState();
    expect(state.isAccessibilityMode).toBe(true);
  });
});

describe("Global Animation Integration", () => {
  let integration: GlobalAnimationIntegration;

  beforeEach(() => {
    vi.clearAllMocks();
    integration = new GlobalAnimationIntegration({
      enablePerformanceMonitoring: false, // Disable for testing
      enableAccessibilityMonitoring: false, // Disable for testing
    });
  });

  afterEach(() => {
    integration.destroy();
  });

  describe("Integration System", () => {
    it("should create integration system", () => {
      expect(integration).toBeDefined();
      expect(integration.getIntegrationState()).toBeDefined();
    });

    it("should get performance metrics", () => {
      const metrics = integration.getPerformanceMetrics();
      
      expect(metrics).toHaveProperty("activeAnimations");
      expect(metrics).toHaveProperty("averageDuration");
      expect(metrics).toHaveProperty("totalAnimationTime");
      expect(metrics).toHaveProperty("performanceMode");
      expect(metrics).toHaveProperty("lastCheck");
    });

    it("should get accessibility metrics", () => {
      const metrics = integration.getAccessibilityMetrics();
      
      expect(metrics).toHaveProperty("reducedMotion");
      expect(metrics).toHaveProperty("highContrast");
      expect(metrics).toHaveProperty("forcedColors");
      expect(metrics).toHaveProperty("accessibilityMode");
      expect(metrics).toHaveProperty("lastCheck");
    });
  });

  describe("Observer System", () => {
    it("should add and remove observers", () => {
      const observer = vi.fn();
      
      integration.addObserver(observer);
      expect(integration.getIntegrationState().isActive).toBe(true);
      
      integration.removeObserver(observer);
      expect(integration.getIntegrationState().isActive).toBe(false);
    });

    it("should notify observers", () => {
      const observer = vi.fn();
      integration.addObserver(observer);
      
      // Trigger a notification
      integration.updateOptions({ enablePerformanceMonitoring: true });
      
      // Observer should have been called
      expect(observer).toHaveBeenCalled();
    });
  });

  describe("Options Management", () => {
    it("should update options", () => {
      const newOptions = {
        enablePerformanceMonitoring: true,
        enableAccessibilityMonitoring: true,
      };
      
      integration.updateOptions(newOptions);
      
      const state = integration.getIntegrationState();
      expect(state.options.enablePerformanceMonitoring).toBe(true);
      expect(state.options.enableAccessibilityMonitoring).toBe(true);
    });
  });
});

describe("Global Animation Integration Utils", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create integration system", () => {
    const integration = GlobalAnimationIntegrationUtils.createIntegration();
    expect(integration).toBeDefined();
    integration.destroy();
  });

  it("should get current integration state", () => {
    const state = GlobalAnimationIntegrationUtils.getCurrentIntegrationState();
    expect(state).toHaveProperty("disableState");
    expect(state).toHaveProperty("integrationActive");
  });

  it("should check if integration is available", () => {
    const isAvailable = GlobalAnimationIntegrationUtils.isIntegrationAvailable();
    expect(typeof isAvailable).toBe("boolean");
  });

  it("should get browser capabilities", () => {
    const capabilities = GlobalAnimationIntegrationUtils.getBrowserCapabilities();
    
    expect(capabilities).toHaveProperty("performanceObserver");
    expect(capabilities).toHaveProperty("matchMedia");
    expect(capabilities).toHaveProperty("cssCustomProperties");
  });
});

describe("Animation Disable Testing", () => {
  it("should mock document for testing", () => {
    const restore = AnimationDisableTesting.mockDocument({
      head: { appendChild: vi.fn() },
    });
    
    expect(global.document.head.appendChild).toBeDefined();
    
    restore();
  });

  it("should mock window for testing", () => {
    const restore = AnimationDisableTesting.mockWindow({
      matchMedia: vi.fn(),
    });
    
    expect(global.window.matchMedia).toBeDefined();
    
    restore();
  });

  it("should create test configuration", () => {
    const config = AnimationDisableTesting.createTestConfig();
    
    expect(config).toHaveProperty("enabled");
    expect(config).toHaveProperty("performance");
    expect(config).toHaveProperty("accessibility");
    expect(config).toHaveProperty("fallback");
    expect(config).toHaveProperty("packages");
  });

  it("should create test preferences", () => {
    const preferences = AnimationDisableTesting.createTestPreferences();
    
    expect(preferences).toHaveProperty("prefersReducedMotion");
    expect(preferences).toHaveProperty("prefersHighContrast");
    expect(preferences).toHaveProperty("prefersColorScheme");
    expect(preferences).toHaveProperty("prefersContrast");
    expect(preferences).toHaveProperty("forcedColors");
  });
});

describe("CSS Generation", () => {
  let disableUtils: GlobalAnimationDisableUtils;

  beforeEach(() => {
    disableUtils = new GlobalAnimationDisableUtils();
  });

  afterEach(() => {
    disableUtils.destroy();
  });

  it("should generate disable CSS with custom selector", () => {
    disableUtils.disableAllAnimations({
      useCSSInjection: true,
      customSelector: ".test-selector",
    });
    
    expect(mockDocument.createElement).toHaveBeenCalledWith("style");
  });

  it("should generate disable CSS with immediate completion", () => {
    disableUtils.disableAllAnimations({
      useCSSInjection: true,
      immediateCompletion: true,
    });
    
    expect(mockDocument.createElement).toHaveBeenCalledWith("style");
  });

  it("should generate disable CSS with print styles", () => {
    disableUtils.disableAllAnimations({
      useCSSInjection: true,
      includePrintStyles: true,
    });
    
    expect(mockDocument.createElement).toHaveBeenCalledWith("style");
  });
});

describe("Error Handling", () => {
  it("should handle missing document gracefully", () => {
    const originalDocument = global.document;
    // @ts-ignore
    delete global.document;
    
    const disableUtils = new GlobalAnimationDisableUtils();
    disableUtils.disableAllAnimations();
    
    // Should not throw
    expect(() => disableUtils.getCurrentState()).not.toThrow();
    
    disableUtils.destroy();
    
    // Restore document
    global.document = originalDocument;
  });

  it("should handle missing window gracefully", () => {
    const originalWindow = global.window;
    // @ts-ignore
    delete global.window;
    
    const integration = new GlobalAnimationIntegration({
      enablePerformanceMonitoring: false,
      enableAccessibilityMonitoring: false,
    });
    
    // Should not throw
    expect(() => integration.getIntegrationState()).not.toThrow();
    
    integration.destroy();
    
    // Restore window
    global.window = originalWindow;
  });
});

