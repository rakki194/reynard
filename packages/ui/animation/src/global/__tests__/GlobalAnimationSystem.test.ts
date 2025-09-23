/**
 * 🦊 Global Animation System Tests
 * 
 * Comprehensive test suite for the global animation control system.
 * Tests configuration, state management, and controls.
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { 
  DEFAULT_GLOBAL_ANIMATION_CONFIG,
  PERFORMANCE_ANIMATION_CONFIG,
  ACCESSIBILITY_ANIMATION_CONFIG,
  DISABLED_ANIMATION_CONFIG,
  detectSystemPreferences,
  createConfigFromPreferences,
  validateConfig,
  mergeConfigs,
  createPersistence,
  shouldDisableAnimations,
  getAnimationEngine,
  CONFIG_PRESETS,
  getConfigPreset
} from "../GlobalAnimationConfig.js";
import { GlobalAnimationControlSystem, GlobalAnimationUtils } from "../GlobalAnimationControls.js";

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

// Mock matchMedia
const matchMediaMock = vi.fn((query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
}));

Object.defineProperty(window, "matchMedia", {
  value: matchMediaMock,
});

describe("Global Animation Configuration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("DEFAULT_GLOBAL_ANIMATION_CONFIG", () => {
    it("should have correct default values", () => {
      expect(DEFAULT_GLOBAL_ANIMATION_CONFIG.enabled).toBe(true);
      expect(DEFAULT_GLOBAL_ANIMATION_CONFIG.performance.enabled).toBe(false);
      expect(DEFAULT_GLOBAL_ANIMATION_CONFIG.accessibility.respectReducedMotion).toBe(true);
      expect(DEFAULT_GLOBAL_ANIMATION_CONFIG.fallback.useCSSFallbacks).toBe(true);
      expect(DEFAULT_GLOBAL_ANIMATION_CONFIG.packages.useSmartImports).toBe(true);
    });
  });

  describe("detectSystemPreferences", () => {
    it("should detect system preferences correctly", () => {
      matchMediaMock.mockImplementation((query: string) => ({
        matches: query === "(prefers-reduced-motion: reduce)",
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      const preferences = detectSystemPreferences();
      
      expect(preferences.prefersReducedMotion).toBe(true);
      expect(preferences.prefersHighContrast).toBe(false);
      expect(preferences.prefersColorScheme).toBe("light");
    });

    it("should handle server-side rendering", () => {
      // Mock window as undefined
      const originalWindow = global.window;
      // @ts-ignore
      delete global.window;

      const preferences = detectSystemPreferences();
      
      expect(preferences.prefersReducedMotion).toBe(false);
      expect(preferences.prefersHighContrast).toBe(false);
      expect(preferences.prefersColorScheme).toBe("no-preference");

      // Restore window
      global.window = originalWindow;
    });
  });

  describe("createConfigFromPreferences", () => {
    it("should create config respecting reduced motion", () => {
      const preferences = {
        prefersReducedMotion: true,
        prefersHighContrast: false,
        prefersColorScheme: "light" as const,
        prefersContrast: "no-preference" as const,
        forcedColors: "none" as const,
      };

      const config = createConfigFromPreferences(preferences);
      
      expect(config.enabled).toBe(false);
      expect(config.fallback.immediateCompletion).toBe(true);
      expect(config.fallback.reducedMotionFallback).toBe(true);
    });

    it("should create config respecting high contrast", () => {
      const preferences = {
        prefersReducedMotion: false,
        prefersHighContrast: true,
        prefersColorScheme: "light" as const,
        prefersContrast: "no-preference" as const,
        forcedColors: "none" as const,
      };

      const config = createConfigFromPreferences(preferences);
      
      expect(config.accessibility.highContrast).toBe(true);
      expect(config.performance.disableComplex).toBe(true);
    });

    it("should create config respecting forced colors", () => {
      const preferences = {
        prefersReducedMotion: false,
        prefersHighContrast: false,
        prefersColorScheme: "light" as const,
        prefersContrast: "no-preference" as const,
        forcedColors: "active" as const,
      };

      const config = createConfigFromPreferences(preferences);
      
      expect(config.accessibility.highContrast).toBe(true);
      expect(config.performance.disableComplex).toBe(true);
    });
  });

  describe("validateConfig", () => {
    it("should validate and fix invalid values", () => {
      const invalidConfig = {
        performance: {
          maxFPS: 200, // Invalid: too high
        },
        enabled: "invalid", // Invalid: not boolean
      };

      const validated = validateConfig(invalidConfig);
      
      expect(validated.performance.maxFPS).toBe(60); // Should be fixed
      expect(validated.enabled).toBe(false); // Should be converted to boolean
    });

    it("should preserve valid values", () => {
      const validConfig = {
        enabled: true,
        performance: {
          enabled: true,
          maxFPS: 30,
        },
      };

      const validated = validateConfig(validConfig);
      
      expect(validated.enabled).toBe(true);
      expect(validated.performance.enabled).toBe(true);
      expect(validated.performance.maxFPS).toBe(30);
    });
  });

  describe("mergeConfigs", () => {
    it("should merge configurations correctly", () => {
      const base = DEFAULT_GLOBAL_ANIMATION_CONFIG;
      const override = {
        enabled: false,
        performance: {
          enabled: true,
        },
      };

      const merged = mergeConfigs(base, override);
      
      expect(merged.enabled).toBe(false);
      expect(merged.performance.enabled).toBe(true);
      expect(merged.performance.maxFPS).toBe(base.performance.maxFPS); // Should preserve base value
    });
  });

  describe("shouldDisableAnimations", () => {
    it("should disable animations when globally disabled", () => {
      const config = { ...DEFAULT_GLOBAL_ANIMATION_CONFIG, enabled: false };
      const preferences = {
        prefersReducedMotion: false,
        prefersHighContrast: false,
        prefersColorScheme: "light" as const,
        prefersContrast: "no-preference" as const,
        forcedColors: "none" as const,
      };

      expect(shouldDisableAnimations(config, preferences)).toBe(true);
    });

    it("should disable animations when reduced motion is preferred", () => {
      const config = DEFAULT_GLOBAL_ANIMATION_CONFIG;
      const preferences = {
        prefersReducedMotion: true,
        prefersHighContrast: false,
        prefersColorScheme: "light" as const,
        prefersContrast: "no-preference" as const,
        forcedColors: "none" as const,
      };

      expect(shouldDisableAnimations(config, preferences)).toBe(true);
    });

    it("should not disable animations when conditions are met", () => {
      const config = DEFAULT_GLOBAL_ANIMATION_CONFIG;
      const preferences = {
        prefersReducedMotion: false,
        prefersHighContrast: false,
        prefersColorScheme: "light" as const,
        prefersContrast: "no-preference" as const,
        forcedColors: "none" as const,
      };

      expect(shouldDisableAnimations(config, preferences)).toBe(false);
    });
  });

  describe("getAnimationEngine", () => {
    it("should return disabled when animations should be disabled", () => {
      const config = { ...DEFAULT_GLOBAL_ANIMATION_CONFIG, enabled: false };
      const preferences = {
        prefersReducedMotion: false,
        prefersHighContrast: false,
        prefersColorScheme: "light" as const,
        prefersContrast: "no-preference" as const,
        forcedColors: "none" as const,
      };

      expect(getAnimationEngine(config, preferences, true)).toBe("disabled");
    });

    it("should return fallback when package unavailable", () => {
      const config = DEFAULT_GLOBAL_ANIMATION_CONFIG;
      const preferences = {
        prefersReducedMotion: false,
        prefersHighContrast: false,
        prefersColorScheme: "light" as const,
        prefersContrast: "no-preference" as const,
        forcedColors: "none" as const,
      };

      expect(getAnimationEngine(config, preferences, false)).toBe("fallback");
    });

    it("should return full when all conditions are met", () => {
      const config = DEFAULT_GLOBAL_ANIMATION_CONFIG;
      const preferences = {
        prefersReducedMotion: false,
        prefersHighContrast: false,
        prefersColorScheme: "light" as const,
        prefersContrast: "no-preference" as const,
        forcedColors: "none" as const,
      };

      expect(getAnimationEngine(config, preferences, true)).toBe("full");
    });
  });

  describe("CONFIG_PRESETS", () => {
    it("should have correct preset configurations", () => {
      expect(CONFIG_PRESETS.performance.performance.enabled).toBe(true);
      expect(CONFIG_PRESETS.accessibility.accessibility.highContrast).toBe(true);
      expect(CONFIG_PRESETS.disabled.enabled).toBe(false);
    });

    it("should create auto preset from preferences", () => {
      const autoConfig = CONFIG_PRESETS.auto();
      expect(autoConfig).toBeDefined();
      expect(typeof autoConfig.enabled).toBe("boolean");
    });
  });

  describe("getConfigPreset", () => {
    it("should return correct preset", () => {
      const performanceConfig = getConfigPreset("performance");
      expect(performanceConfig.performance.enabled).toBe(true);

      const accessibilityConfig = getConfigPreset("accessibility");
      expect(accessibilityConfig.accessibility.highContrast).toBe(true);

      const disabledConfig = getConfigPreset("disabled");
      expect(disabledConfig.enabled).toBe(false);
    });
  });
});

describe("Global Animation Control System", () => {
  let controlSystem: GlobalAnimationControlSystem;
  let mockPreferences: any;

  beforeEach(() => {
    mockPreferences = {
      prefersReducedMotion: false,
      prefersHighContrast: false,
      prefersColorScheme: "light" as const,
      prefersContrast: "no-preference" as const,
      forcedColors: "none" as const,
    };

    controlSystem = new GlobalAnimationControlSystem(
      DEFAULT_GLOBAL_ANIMATION_CONFIG,
      mockPreferences
    );
  });

  describe("Configuration Management", () => {
    it("should get current configuration", () => {
      const config = controlSystem.getConfig();
      expect(config).toEqual(DEFAULT_GLOBAL_ANIMATION_CONFIG);
    });

    it("should update configuration", () => {
      const newConfig = { enabled: false };
      controlSystem.updateConfig(newConfig);
      
      const config = controlSystem.getConfig();
      expect(config.enabled).toBe(false);
    });

    it("should reset configuration", () => {
      controlSystem.updateConfig({ enabled: false });
      controlSystem.resetConfig();
      
      const config = controlSystem.getConfig();
      expect(config.enabled).toBe(true);
    });
  });

  describe("State Management", () => {
    it("should get current state", () => {
      const state = controlSystem.getState();
      
      expect(state.config).toBeDefined();
      expect(state.isDisabled).toBe(false);
      expect(state.performanceMode).toBe(false);
      expect(state.accessibilityMode).toBe(false);
      expect(state.animationEngine).toBe("full");
    });

    it("should update state when configuration changes", () => {
      controlSystem.updateConfig({ enabled: false });
      
      const state = controlSystem.getState();
      expect(state.isDisabled).toBe(true);
      expect(state.animationEngine).toBe("disabled");
    });
  });

  describe("Controls", () => {
    it("should enable/disable animations", () => {
      controlSystem.setEnabled(false);
      expect(controlSystem.getConfig().enabled).toBe(false);
      
      controlSystem.setEnabled(true);
      expect(controlSystem.getConfig().enabled).toBe(true);
    });

    it("should toggle performance mode", () => {
      expect(controlSystem.getConfig().performance.enabled).toBe(false);
      
      controlSystem.togglePerformanceMode();
      expect(controlSystem.getConfig().performance.enabled).toBe(true);
      
      controlSystem.togglePerformanceMode();
      expect(controlSystem.getConfig().performance.enabled).toBe(false);
    });

    it("should toggle accessibility mode", () => {
      expect(controlSystem.getConfig().accessibility.highContrast).toBe(false);
      
      controlSystem.toggleAccessibilityMode();
      expect(controlSystem.getConfig().accessibility.highContrast).toBe(true);
      
      controlSystem.toggleAccessibilityMode();
      expect(controlSystem.getConfig().accessibility.highContrast).toBe(false);
    });
  });

  describe("Package Management", () => {
    it("should register and check package availability", () => {
      expect(controlSystem.checkPackageAvailability("test-package")).toBe(false);
      
      controlSystem.registerPackage("test-package");
      expect(controlSystem.checkPackageAvailability("test-package")).toBe(true);
      
      controlSystem.unregisterPackage("test-package");
      expect(controlSystem.checkPackageAvailability("test-package")).toBe(false);
    });
  });

  describe("Testing Utilities", () => {
    it("should mock system preferences", () => {
      const testing = controlSystem.getTesting();
      
      testing.mockSystemPreferences({ prefersReducedMotion: true });
      
      const state = controlSystem.getState();
      expect(state.systemPreferences.prefersReducedMotion).toBe(true);
    });

    it("should mock package availability", () => {
      const testing = controlSystem.getTesting();
      
      testing.mockPackageAvailability("test-package", true);
      expect(controlSystem.checkPackageAvailability("test-package")).toBe(true);
      
      testing.mockPackageAvailability("test-package", false);
      expect(controlSystem.checkPackageAvailability("test-package")).toBe(false);
    });

    it("should reset mocks", () => {
      const testing = controlSystem.getTesting();
      
      testing.mockSystemPreferences({ prefersReducedMotion: true });
      testing.mockPackageAvailability("test-package", true);
      
      testing.resetMocks();
      
      const state = controlSystem.getState();
      expect(state.systemPreferences.prefersReducedMotion).toBe(false);
      expect(controlSystem.checkPackageAvailability("test-package")).toBe(false);
    });
  });
});

describe("Global Animation Utils", () => {
  beforeEach(() => {
    // Mock document
    Object.defineProperty(document, "documentElement", {
      value: {
        classList: {
          add: vi.fn(),
          remove: vi.fn(),
          contains: vi.fn(),
          toggle: vi.fn(),
        },
        style: {
          setProperty: vi.fn(),
          removeProperty: vi.fn(),
        },
      },
      writable: true,
    });
  });

  describe("applyGlobalSettings", () => {
    it("should apply global settings to document", () => {
      const config = DEFAULT_GLOBAL_ANIMATION_CONFIG;
      const preferences = {
        prefersReducedMotion: false,
        prefersHighContrast: false,
        prefersColorScheme: "light" as const,
        prefersContrast: "no-preference" as const,
        forcedColors: "none" as const,
      };

      GlobalAnimationUtils.applyGlobalSettings(config, preferences);

      expect(document.documentElement.classList.toggle).toHaveBeenCalledWith("animations-disabled", false);
      expect(document.documentElement.classList.toggle).toHaveBeenCalledWith("performance-mode", false);
      expect(document.documentElement.style.setProperty).toHaveBeenCalledWith("--animation-enabled", "1");
    });
  });

  describe("removeGlobalSettings", () => {
    it("should remove global settings from document", () => {
      GlobalAnimationUtils.removeGlobalSettings();

      expect(document.documentElement.classList.remove).toHaveBeenCalledWith(
        "animations-disabled",
        "performance-mode",
        "accessibility-mode",
        "reduced-motion",
        "high-contrast"
      );
    });
  });

  describe("isGlobalAnimationAvailable", () => {
    it("should return true when window and document are available", () => {
      expect(GlobalAnimationUtils.isGlobalAnimationAvailable()).toBe(true);
    });
  });

  describe("getCurrentGlobalState", () => {
    it("should get current global state from DOM", () => {
      (document.documentElement.classList.contains as any).mockReturnValue(true);

      const state = GlobalAnimationUtils.getCurrentGlobalState();

      expect(state.animationsDisabled).toBe(true);
      expect(state.performanceMode).toBe(true);
      expect(state.accessibilityMode).toBe(true);
    });
  });
});
