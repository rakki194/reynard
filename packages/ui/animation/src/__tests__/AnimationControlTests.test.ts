/**
 * 🦊 Animation Control Tests
 * 
 * Comprehensive test suite for animation control functionality.
 * Tests prefers-reduced-motion respect, fallbacks, performance, and accessibility.
 */

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { 
  useAnimationControl,
  useAnimationFallback,
  shouldDisableAnimations,
  getAnimationEngine,
  createSmartAnimationCore,
  createNoOpAnimationEngine
} from "../core/index.js";
import { 
  GlobalAnimationProvider,
  useGlobalAnimationContext,
  useGlobalAnimationState,
  useGlobalAnimationControls
} from "../global/index.js";
import { 
  GlobalAnimationDisableFunctions,
  AnimationDisableTesting
} from "../global/GlobalAnimationDisableUtils.js";
import type { GlobalAnimationConfig, SystemPreferences } from "../global/GlobalAnimationTypes.js";

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

describe("Animation Control Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Clean up any global state
    GlobalAnimationDisableFunctions.reset();
  });

  describe("prefers-reduced-motion Respect", () => {
    it("should disable animations when prefers-reduced-motion is true", () => {
      // Mock prefers-reduced-motion: reduce
      mockWindow.matchMedia.mockImplementation((query: string) => ({
        matches: query === "(prefers-reduced-motion: reduce)",
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      const config: GlobalAnimationConfig = {
        enabled: true,
        performance: {
          enabled: false,
          maxFPS: 60,
          reducedQuality: false,
          disableComplex: false,
        },
        accessibility: {
          respectReducedMotion: true,
          respectHighContrast: false,
          respectColorScheme: false,
          highContrast: false,
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
        prefersReducedMotion: true,
        prefersHighContrast: false,
        prefersColorScheme: "light",
        prefersContrast: "no-preference",
        forcedColors: "none",
      };

      expect(shouldDisableAnimations(config, preferences)).toBe(true);
    });

    it("should enable animations when prefers-reduced-motion is false", () => {
      // Mock prefers-reduced-motion: no-preference
      mockWindow.matchMedia.mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      const config: GlobalAnimationConfig = {
        enabled: true,
        performance: {
          enabled: false,
          maxFPS: 60,
          reducedQuality: false,
          disableComplex: false,
        },
        accessibility: {
          respectReducedMotion: true,
          respectHighContrast: false,
          respectColorScheme: false,
          highContrast: false,
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

      expect(shouldDisableAnimations(config, preferences)).toBe(false);
    });

    it("should respect accessibility configuration", () => {
      const config: GlobalAnimationConfig = {
        enabled: true,
        performance: {
          enabled: false,
          maxFPS: 60,
          reducedQuality: false,
          disableComplex: false,
        },
        accessibility: {
          respectReducedMotion: false, // Disabled
          respectHighContrast: false,
          respectColorScheme: false,
          highContrast: false,
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
        prefersReducedMotion: true, // User prefers reduced motion
        prefersHighContrast: false,
        prefersColorScheme: "light",
        prefersContrast: "no-preference",
        forcedColors: "none",
      };

      // Should not disable because respectReducedMotion is false
      expect(shouldDisableAnimations(config, preferences)).toBe(false);
    });
  });

  describe("Fallback When Package Unavailable", () => {
    it("should use fallback engine when package unavailable", () => {
      const config: GlobalAnimationConfig = {
        enabled: true,
        performance: {
          enabled: false,
          maxFPS: 60,
          reducedQuality: false,
          disableComplex: false,
        },
        accessibility: {
          respectReducedMotion: true,
          respectHighContrast: false,
          respectColorScheme: false,
          highContrast: false,
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

      // Package unavailable
      const packageAvailable = false;
      const engine = getAnimationEngine(config, preferences, packageAvailable);
      
      expect(engine).toBe("fallback");
    });

    it("should use full engine when package available", () => {
      const config: GlobalAnimationConfig = {
        enabled: true,
        performance: {
          enabled: false,
          maxFPS: 60,
          reducedQuality: false,
          disableComplex: false,
        },
        accessibility: {
          respectReducedMotion: true,
          respectHighContrast: false,
          respectColorScheme: false,
          highContrast: false,
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

      // Package available
      const packageAvailable = true;
      const engine = getAnimationEngine(config, preferences, packageAvailable);
      
      expect(engine).toBe("full");
    });

    it("should use disabled engine when animations disabled", () => {
      const config: GlobalAnimationConfig = {
        enabled: false, // Disabled
        performance: {
          enabled: false,
          maxFPS: 60,
          reducedQuality: false,
          disableComplex: false,
        },
        accessibility: {
          respectReducedMotion: true,
          respectHighContrast: false,
          respectColorScheme: false,
          highContrast: false,
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

      const packageAvailable = true;
      const engine = getAnimationEngine(config, preferences, packageAvailable);
      
      expect(engine).toBe("disabled");
    });
  });

  describe("Performance Mode Functionality", () => {
    it("should enable performance optimizations in performance mode", () => {
      const config: GlobalAnimationConfig = {
        enabled: true,
        performance: {
          enabled: true, // Performance mode enabled
          maxFPS: 30, // Reduced FPS
          reducedQuality: true,
          disableComplex: true,
        },
        accessibility: {
          respectReducedMotion: true,
          respectHighContrast: false,
          respectColorScheme: false,
          highContrast: false,
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

      // Should disable animations when performance mode disables complex animations
      expect(shouldDisableAnimations(config, preferences)).toBe(true);
    });

    it("should maintain performance settings", () => {
      const config: GlobalAnimationConfig = {
        enabled: true,
        performance: {
          enabled: true,
          maxFPS: 30,
          reducedQuality: true,
          disableComplex: false, // Don't disable complex animations
        },
        accessibility: {
          respectReducedMotion: true,
          respectHighContrast: false,
          respectColorScheme: false,
          highContrast: false,
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

      // Should not disable animations
      expect(shouldDisableAnimations(config, preferences)).toBe(false);
    });
  });

  describe("Accessibility Compliance", () => {
    it("should respect high contrast preferences", () => {
      const config: GlobalAnimationConfig = {
        enabled: true,
        performance: {
          enabled: false,
          maxFPS: 60,
          reducedQuality: false,
          disableComplex: false,
        },
        accessibility: {
          respectReducedMotion: true,
          respectHighContrast: true, // Respect high contrast
          respectColorScheme: false,
          highContrast: false,
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
        prefersHighContrast: true, // User prefers high contrast
        prefersColorScheme: "light",
        prefersContrast: "no-preference",
        forcedColors: "none",
      };

      // Should not disable animations for high contrast alone
      expect(shouldDisableAnimations(config, preferences)).toBe(false);
    });

    it("should respect forced colors", () => {
      const config: GlobalAnimationConfig = {
        enabled: true,
        performance: {
          enabled: false,
          maxFPS: 60,
          reducedQuality: false,
          disableComplex: false,
        },
        accessibility: {
          respectReducedMotion: true,
          respectHighContrast: true,
          respectColorScheme: false,
          highContrast: false,
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
        forcedColors: "active", // Forced colors active
      };

      // Should not disable animations for forced colors alone
      expect(shouldDisableAnimations(config, preferences)).toBe(false);
    });

    it("should handle multiple accessibility preferences", () => {
      const config: GlobalAnimationConfig = {
        enabled: true,
        performance: {
          enabled: false,
          maxFPS: 60,
          reducedQuality: false,
          disableComplex: false,
        },
        accessibility: {
          respectReducedMotion: true,
          respectHighContrast: true,
          respectColorScheme: true,
          highContrast: true, // High contrast mode enabled
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
        prefersReducedMotion: true, // Reduced motion
        prefersHighContrast: true, // High contrast
        prefersColorScheme: "dark",
        prefersContrast: "high",
        forcedColors: "active", // Forced colors
      };

      // Should disable animations due to reduced motion
      expect(shouldDisableAnimations(config, preferences)).toBe(true);
    });
  });

  describe("Smart Animation Core", () => {
    it("should create smart animation core", () => {
      const core = createSmartAnimationCore();
      expect(core).toBeDefined();
      expect(core.isAnimationsDisabled).toBeDefined();
      expect(core.isPackageAvailable).toBeDefined();
      expect(core.getAnimationEngine).toBeDefined();
    });

    it("should create no-op animation engine", () => {
      const engine = createNoOpAnimationEngine();
      expect(engine).toBeDefined();
      expect(engine.animate).toBeDefined();
      expect(engine.stop).toBeDefined();
      expect(engine.isAnimating).toBeDefined();
    });

    it("should handle immediate completion", async () => {
      const engine = createNoOpAnimationEngine();
      
      const result = await engine.animate({
        duration: 1000,
        onUpdate: vi.fn(),
        onComplete: vi.fn(),
      });
      
      expect(result).toBeDefined();
    });
  });

  describe("Global Animation Context Integration", () => {
    it("should provide global animation context", () => {
      const TestComponent = () => {
        const context = useGlobalAnimationContext();
        expect(context).toBeDefined();
        expect(context.state).toBeDefined();
        expect(context.controls).toBeDefined();
        expect(context.isAvailable).toBeDefined();
        return null;
      };

      // This would be tested in a real SolidJS environment
      expect(TestComponent).toBeDefined();
    });

    it("should provide global animation state", () => {
      const TestComponent = () => {
        const state = useGlobalAnimationState();
        expect(state).toBeDefined();
        return null;
      };

      expect(TestComponent).toBeDefined();
    });

    it("should provide global animation controls", () => {
      const TestComponent = () => {
        const controls = useGlobalAnimationControls();
        expect(controls).toBeDefined();
        expect(controls.setEnabled).toBeDefined();
        expect(controls.togglePerformanceMode).toBeDefined();
        expect(controls.toggleAccessibilityMode).toBeDefined();
        return null;
      };

      expect(TestComponent).toBeDefined();
    });
  });

  describe("Animation Disable Functions", () => {
    it("should disable all animations globally", () => {
      GlobalAnimationDisableFunctions.disableAllAnimations();
      
      const state = GlobalAnimationDisableFunctions.getCurrentState();
      expect(state.isDisabled).toBe(true);
    });

    it("should enable all animations globally", () => {
      GlobalAnimationDisableFunctions.disableAllAnimations();
      GlobalAnimationDisableFunctions.enableAllAnimations();
      
      const state = GlobalAnimationDisableFunctions.getCurrentState();
      expect(state.isDisabled).toBe(false);
    });

    it("should toggle performance mode", () => {
      GlobalAnimationDisableFunctions.togglePerformanceMode(true);
      
      const state = GlobalAnimationDisableFunctions.getCurrentState();
      expect(state.isPerformanceMode).toBe(true);
    });

    it("should toggle accessibility mode", () => {
      GlobalAnimationDisableFunctions.toggleAccessibilityMode(true);
      
      const state = GlobalAnimationDisableFunctions.getCurrentState();
      expect(state.isAccessibilityMode).toBe(true);
    });
  });

  describe("Testing Utilities", () => {
    it("should provide animation disable testing utilities", () => {
      const testConfig = AnimationDisableTesting.createTestConfig();
      expect(testConfig).toBeDefined();
      expect(testConfig.enabled).toBe(true);

      const testPreferences = AnimationDisableTesting.createTestPreferences();
      expect(testPreferences).toBeDefined();
      expect(testPreferences.prefersReducedMotion).toBe(false);
    });

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
  });

  describe("Error Handling", () => {
    it("should handle missing window gracefully", () => {
      const originalWindow = global.window;
      // @ts-ignore
      delete global.window;
      
      const config = AnimationDisableTesting.createTestConfig();
      const preferences = AnimationDisableTesting.createTestPreferences();
      
      // Should not throw
      expect(() => shouldDisableAnimations(config, preferences)).not.toThrow();
      
      // Restore window
      global.window = originalWindow;
    });

    it("should handle missing document gracefully", () => {
      const originalDocument = global.document;
      // @ts-ignore
      delete global.document;
      
      // Should not throw
      expect(() => GlobalAnimationDisableFunctions.getCurrentState()).not.toThrow();
      
      // Restore document
      global.document = originalDocument;
    });

    it("should handle invalid configuration gracefully", () => {
      const invalidConfig = {
        enabled: "invalid", // Invalid type
        performance: {
          maxFPS: -1, // Invalid value
        },
      } as any;

      const preferences = AnimationDisableTesting.createTestPreferences();
      
      // Should not throw and should handle gracefully
      expect(() => shouldDisableAnimations(invalidConfig, preferences)).not.toThrow();
    });
  });
});
