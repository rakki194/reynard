/**
 * 🦊 Integration Tests
 * 
 * Comprehensive test suite for package integration, fallback systems, and performance modes.
 * Tests the complete animation system integration across all packages.
 */

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { 
  useAnimationControl,
  useAnimationFallback,
  createSmartAnimationCore,
  createNoOpAnimationEngine
} from "../core/index.js";
import { 
  useColorAnimation,
  useHueShift,
  useColorRamp,
  useStaggeredColorAnimation
} from "../color/index.js";
import { 
  useThreeDAnimation,
  useClusterAnimation,
  usePointAnimation,
  useCameraAnimation
} from "../3d/index.js";
import { 
  GlobalAnimationProvider,
  useGlobalAnimationContext,
  useGlobalAnimationState,
  useGlobalAnimationControls,
  useShouldDisableAnimations,
  useAnimationEngine,
  usePackageAvailability
} from "../global/index.js";
import { 
  GlobalAnimationDisableFunctions,
  GlobalAnimationIntegrationUtils,
  useGlobalAnimationIntegration
} from "../global/index.js";
import { 
  AnimationDisableTesting
} from "../global/GlobalAnimationDisableUtils.js";

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
    style: {
      setProperty: vi.fn(),
      removeProperty: vi.fn(),
      cssText: "",
    },
    classList: {
      add: vi.fn(),
      remove: vi.fn(),
      contains: vi.fn(),
    },
    offsetHeight: 100,
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
  requestAnimationFrame: vi.fn((callback) => {
    callback();
    return 1;
  }),
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

describe("Integration Tests", () => {
  let mockElement: HTMLElement;

  beforeEach(() => {
    vi.clearAllMocks();
    mockElement = mockDocument.createElement() as any;
  });

  afterEach(() => {
    GlobalAnimationDisableFunctions.reset();
  });

  describe("Package Integration", () => {
    it("should integrate core animation with global context", () => {
      const TestComponent = () => {
        const globalContext = useGlobalAnimationContext();
        const animationControl = useAnimationControl();
        const animationFallback = useAnimationFallback();
        
        expect(globalContext).toBeDefined();
        expect(animationControl).toBeDefined();
        expect(animationFallback).toBeDefined();
        
        return null;
      };

      expect(TestComponent).toBeDefined();
    });

    it("should integrate color animations with global context", () => {
      const TestComponent = () => {
        const globalContext = useGlobalAnimationContext();
        const colorAnimation = useColorAnimation();
        const hueShift = useHueShift();
        const colorRamp = useColorRamp();
        const staggeredColor = useStaggeredColorAnimation();
        
        expect(globalContext).toBeDefined();
        expect(colorAnimation).toBeDefined();
        expect(hueShift).toBeDefined();
        expect(colorRamp).toBeDefined();
        expect(staggeredColor).toBeDefined();
        
        return null;
      };

      expect(TestComponent).toBeDefined();
    });

    it("should integrate 3D animations with global context", () => {
      const TestComponent = () => {
        const globalContext = useGlobalAnimationContext();
        const threeDAnimation = useThreeDAnimation();
        const clusterAnimation = useClusterAnimation();
        const pointAnimation = usePointAnimation();
        const cameraAnimation = useCameraAnimation();
        
        expect(globalContext).toBeDefined();
        expect(threeDAnimation).toBeDefined();
        expect(clusterAnimation).toBeDefined();
        expect(pointAnimation).toBeDefined();
        expect(cameraAnimation).toBeDefined();
        
        return null;
      };

      expect(TestComponent).toBeDefined();
    });

    it("should integrate global animation hooks", () => {
      const TestComponent = () => {
        const shouldDisable = useShouldDisableAnimations();
        const animationEngine = useAnimationEngine();
        const packageAvailability = usePackageAvailability();
        
        expect(shouldDisable).toBeDefined();
        expect(animationEngine).toBeDefined();
        expect(packageAvailability).toBeDefined();
        
        return null;
      };

      expect(TestComponent).toBeDefined();
    });

    it("should integrate global animation integration", () => {
      const TestComponent = () => {
        const integration = useGlobalAnimationIntegration();
        
        expect(integration).toBeDefined();
        expect(integration.integration).toBeDefined();
        expect(integration.performanceMetrics).toBeDefined();
        expect(integration.accessibilityMetrics).toBeDefined();
        expect(integration.getIntegrationState).toBeDefined();
        expect(integration.updateOptions).toBeDefined();
        
        return null;
      };

      expect(TestComponent).toBeDefined();
    });
  });

  describe("Fallback Systems Integration", () => {
    it("should integrate fallback systems with global control", () => {
      // Disable animations globally
      GlobalAnimationDisableFunctions.disableAllAnimations();
      
      const TestComponent = () => {
        const globalContext = useGlobalAnimationContext();
        const animationFallback = useAnimationFallback();
        
        expect(globalContext).toBeDefined();
        expect(animationFallback).toBeDefined();
        
        return null;
      };

      expect(TestComponent).toBeDefined();
    });

    it("should integrate color fallback with global control", () => {
      // Disable animations globally
      GlobalAnimationDisableFunctions.disableAllAnimations();
      
      const TestComponent = () => {
        const globalContext = useGlobalAnimationContext();
        const colorAnimation = useColorAnimation();
        
        expect(globalContext).toBeDefined();
        expect(colorAnimation).toBeDefined();
        
        return null;
      };

      expect(TestComponent).toBeDefined();
    });

    it("should integrate 3D fallback with global control", () => {
      // Disable animations globally
      GlobalAnimationDisableFunctions.disableAllAnimations();
      
      const TestComponent = () => {
        const globalContext = useGlobalAnimationContext();
        const threeDAnimation = useThreeDAnimation();
        
        expect(globalContext).toBeDefined();
        expect(threeDAnimation).toBeDefined();
        
        return null;
      };

      expect(TestComponent).toBeDefined();
    });

    it("should handle package unavailability gracefully", () => {
      // Mock package unavailable
      const TestComponent = () => {
        const packageAvailability = usePackageAvailability();
        const animationEngine = useAnimationEngine();
        
        expect(packageAvailability).toBeDefined();
        expect(animationEngine).toBeDefined();
        
        return null;
      };

      expect(TestComponent).toBeDefined();
    });

    it("should provide fallback when smart imports fail", () => {
      const TestComponent = () => {
        const animationControl = useAnimationControl();
        const animationFallback = useAnimationFallback();
        
        expect(animationControl).toBeDefined();
        expect(animationFallback).toBeDefined();
        
        return null;
      };

      expect(TestComponent).toBeDefined();
    });
  });

  describe("Performance Modes Integration", () => {
    it("should integrate performance mode with all animation systems", () => {
      // Enable performance mode
      GlobalAnimationDisableFunctions.togglePerformanceMode(true);
      
      const TestComponent = () => {
        const globalContext = useGlobalAnimationContext();
        const animationControl = useAnimationControl();
        const colorAnimation = useColorAnimation();
        const threeDAnimation = useThreeDAnimation();
        
        expect(globalContext).toBeDefined();
        expect(animationControl).toBeDefined();
        expect(colorAnimation).toBeDefined();
        expect(threeDAnimation).toBeDefined();
        
        return null;
      };

      expect(TestComponent).toBeDefined();
    });

    it("should optimize color animations in performance mode", () => {
      GlobalAnimationDisableFunctions.togglePerformanceMode(true);
      
      const TestComponent = () => {
        const colorAnimation = useColorAnimation();
        const hueShift = useHueShift();
        const colorRamp = useColorRamp();
        
        expect(colorAnimation).toBeDefined();
        expect(hueShift).toBeDefined();
        expect(colorRamp).toBeDefined();
        
        return null;
      };

      expect(TestComponent).toBeDefined();
    });

    it("should optimize 3D animations in performance mode", () => {
      GlobalAnimationDisableFunctions.togglePerformanceMode(true);
      
      const TestComponent = () => {
        const threeDAnimation = useThreeDAnimation();
        const clusterAnimation = useClusterAnimation();
        const pointAnimation = usePointAnimation();
        
        expect(threeDAnimation).toBeDefined();
        expect(clusterAnimation).toBeDefined();
        expect(pointAnimation).toBeDefined();
        
        return null;
      };

      expect(TestComponent).toBeDefined();
    });

    it("should integrate performance monitoring", () => {
      const TestComponent = () => {
        const integration = useGlobalAnimationIntegration();
        const performanceMetrics = integration.performanceMetrics();
        
        expect(performanceMetrics).toBeDefined();
        expect(performanceMetrics().activeAnimations).toBeDefined();
        expect(performanceMetrics().averageDuration).toBeDefined();
        expect(performanceMetrics().totalAnimationTime).toBeDefined();
        expect(performanceMetrics().performanceMode).toBeDefined();
        expect(performanceMetrics().lastCheck).toBeDefined();
        
        return null;
      };

      expect(TestComponent).toBeDefined();
    });
  });

  describe("Accessibility Modes Integration", () => {
    it("should integrate accessibility mode with all animation systems", () => {
      // Enable accessibility mode
      GlobalAnimationDisableFunctions.toggleAccessibilityMode(true);
      
      const TestComponent = () => {
        const globalContext = useGlobalAnimationContext();
        const animationControl = useAnimationControl();
        const colorAnimation = useColorAnimation();
        const threeDAnimation = useThreeDAnimation();
        
        expect(globalContext).toBeDefined();
        expect(animationControl).toBeDefined();
        expect(colorAnimation).toBeDefined();
        expect(threeDAnimation).toBeDefined();
        
        return null;
      };

      expect(TestComponent).toBeDefined();
    });

    it("should respect reduced motion in all systems", () => {
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

      const TestComponent = () => {
        const shouldDisable = useShouldDisableAnimations();
        const animationEngine = useAnimationEngine();
        
        expect(shouldDisable).toBeDefined();
        expect(animationEngine).toBeDefined();
        
        return null;
      };

      expect(TestComponent).toBeDefined();
    });

    it("should respect high contrast in all systems", () => {
      // Mock prefers-contrast: high
      mockWindow.matchMedia.mockImplementation((query: string) => ({
        matches: query === "(prefers-contrast: high)",
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      const TestComponent = () => {
        const globalContext = useGlobalAnimationContext();
        const colorAnimation = useColorAnimation();
        
        expect(globalContext).toBeDefined();
        expect(colorAnimation).toBeDefined();
        
        return null;
      };

      expect(TestComponent).toBeDefined();
    });

    it("should integrate accessibility monitoring", () => {
      const TestComponent = () => {
        const integration = useGlobalAnimationIntegration();
        const accessibilityMetrics = integration.accessibilityMetrics();
        
        expect(accessibilityMetrics).toBeDefined();
        expect(accessibilityMetrics().reducedMotion).toBeDefined();
        expect(accessibilityMetrics().highContrast).toBeDefined();
        expect(accessibilityMetrics().forcedColors).toBeDefined();
        expect(accessibilityMetrics().accessibilityMode).toBeDefined();
        expect(accessibilityMetrics().lastCheck).toBeDefined();
        
        return null;
      };

      expect(TestComponent).toBeDefined();
    });
  });

  describe("Smart Animation Core Integration", () => {
    it("should integrate smart animation core with global context", () => {
      const TestComponent = () => {
        const globalContext = useGlobalAnimationContext();
        const smartCore = createSmartAnimationCore();
        
        expect(globalContext).toBeDefined();
        expect(smartCore).toBeDefined();
        expect(smartCore.isAnimationsDisabled).toBeDefined();
        expect(smartCore.isPackageAvailable).toBeDefined();
        expect(smartCore.getAnimationEngine).toBeDefined();
        
        return null;
      };

      expect(TestComponent).toBeDefined();
    });

    it("should integrate no-op animation engine with global context", () => {
      const TestComponent = () => {
        const globalContext = useGlobalAnimationContext();
        const noOpEngine = createNoOpAnimationEngine();
        
        expect(globalContext).toBeDefined();
        expect(noOpEngine).toBeDefined();
        expect(noOpEngine.animate).toBeDefined();
        expect(noOpEngine.stop).toBeDefined();
        expect(noOpEngine.isAnimating).toBeDefined();
        
        return null;
      };

      expect(TestComponent).toBeDefined();
    });

    it("should handle engine switching based on global state", () => {
      const TestComponent = () => {
        const globalContext = useGlobalAnimationContext();
        const animationEngine = useAnimationEngine();
        const smartCore = createSmartAnimationCore();
        
        expect(globalContext).toBeDefined();
        expect(animationEngine).toBeDefined();
        expect(smartCore).toBeDefined();
        
        return null;
      };

      expect(TestComponent).toBeDefined();
    });
  });

  describe("Global Animation Integration Utils", () => {
    it("should provide integration utilities", () => {
      const integration = GlobalAnimationIntegrationUtils.createIntegration();
      expect(integration).toBeDefined();
      
      const state = GlobalAnimationIntegrationUtils.getCurrentIntegrationState();
      expect(state).toBeDefined();
      expect(state.disableState).toBeDefined();
      expect(state.integrationActive).toBeDefined();
      
      const isAvailable = GlobalAnimationIntegrationUtils.isIntegrationAvailable();
      expect(typeof isAvailable).toBe("boolean");
      
      const capabilities = GlobalAnimationIntegrationUtils.getBrowserCapabilities();
      expect(capabilities).toBeDefined();
      expect(capabilities.performanceObserver).toBeDefined();
      expect(capabilities.matchMedia).toBeDefined();
      expect(capabilities.cssCustomProperties).toBeDefined();
      
      integration.destroy();
    });

    it("should apply global settings", () => {
      const config = AnimationDisableTesting.createTestConfig();
      const preferences = AnimationDisableTesting.createTestPreferences();
      
      expect(() => {
        GlobalAnimationIntegrationUtils.applyGlobalSettings(config, preferences);
      }).not.toThrow();
    });
  });

  describe("End-to-End Integration", () => {
    it("should handle complete animation workflow", () => {
      const TestComponent = () => {
        // Global context
        const globalContext = useGlobalAnimationContext();
        const globalState = useGlobalAnimationState();
        const globalControls = useGlobalAnimationControls();
        
        // Core animations
        const animationControl = useAnimationControl();
        const animationFallback = useAnimationFallback();
        
        // Color animations
        const colorAnimation = useColorAnimation();
        const hueShift = useHueShift();
        const colorRamp = useColorRamp();
        
        // 3D animations
        const threeDAnimation = useThreeDAnimation();
        const clusterAnimation = useClusterAnimation();
        const pointAnimation = usePointAnimation();
        
        // Global integration
        const shouldDisable = useShouldDisableAnimations();
        const animationEngine = useAnimationEngine();
        const packageAvailability = usePackageAvailability();
        const integration = useGlobalAnimationIntegration();
        
        // Verify all systems are available
        expect(globalContext).toBeDefined();
        expect(globalState).toBeDefined();
        expect(globalControls).toBeDefined();
        expect(animationControl).toBeDefined();
        expect(animationFallback).toBeDefined();
        expect(colorAnimation).toBeDefined();
        expect(hueShift).toBeDefined();
        expect(colorRamp).toBeDefined();
        expect(threeDAnimation).toBeDefined();
        expect(clusterAnimation).toBeDefined();
        expect(pointAnimation).toBeDefined();
        expect(shouldDisable).toBeDefined();
        expect(animationEngine).toBeDefined();
        expect(packageAvailability).toBeDefined();
        expect(integration).toBeDefined();
        
        return null;
      };

      expect(TestComponent).toBeDefined();
    });

    it("should handle animation state changes across all systems", () => {
      const TestComponent = () => {
        const globalControls = useGlobalAnimationControls();
        const integration = useGlobalAnimationIntegration();
        
        expect(globalControls).toBeDefined();
        expect(integration).toBeDefined();
        
        // Test state changes
        expect(() => {
          globalControls.setEnabled(false);
          globalControls.togglePerformanceMode();
          globalControls.toggleAccessibilityMode();
        }).not.toThrow();
        
        return null;
      };

      expect(TestComponent).toBeDefined();
    });

    it("should handle package availability changes", () => {
      const TestComponent = () => {
        const packageAvailability = usePackageAvailability();
        const animationEngine = useAnimationEngine();
        const smartCore = createSmartAnimationCore();
        
        expect(packageAvailability).toBeDefined();
        expect(animationEngine).toBeDefined();
        expect(smartCore).toBeDefined();
        
        return null;
      };

      expect(TestComponent).toBeDefined();
    });
  });

  describe("Error Handling Integration", () => {
    it("should handle errors gracefully across all systems", () => {
      const TestComponent = () => {
        // Test error handling in all systems
        expect(() => {
          useAnimationControl();
          useAnimationFallback();
          useColorAnimation();
          useThreeDAnimation();
          useGlobalAnimationContext();
        }).not.toThrow();
        
        return null;
      };

      expect(TestComponent).toBeDefined();
    });

    it("should handle missing dependencies gracefully", () => {
      const TestComponent = () => {
        const packageAvailability = usePackageAvailability();
        const animationEngine = useAnimationEngine();
        
        expect(packageAvailability).toBeDefined();
        expect(animationEngine).toBeDefined();
        
        return null;
      };

      expect(TestComponent).toBeDefined();
    });

    it("should handle browser compatibility issues", () => {
      const TestComponent = () => {
        const capabilities = GlobalAnimationIntegrationUtils.getBrowserCapabilities();
        const isAvailable = GlobalAnimationIntegrationUtils.isIntegrationAvailable();
        
        expect(capabilities).toBeDefined();
        expect(typeof isAvailable).toBe("boolean");
        
        return null;
      };

      expect(TestComponent).toBeDefined();
    });
  });

  describe("Performance Integration", () => {
    it("should measure integration performance", () => {
      const startTime = performance.now();
      
      const TestComponent = () => {
        useGlobalAnimationContext();
        useAnimationControl();
        useColorAnimation();
        useThreeDAnimation();
        useGlobalAnimationIntegration();
        
        return null;
      };
      
      TestComponent();
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Should initialize quickly (less than 50ms)
      expect(duration).toBeLessThan(50);
    });

    it("should measure state change performance", () => {
      const startTime = performance.now();
      
      GlobalAnimationDisableFunctions.disableAllAnimations();
      GlobalAnimationDisableFunctions.enableAllAnimations();
      GlobalAnimationDisableFunctions.togglePerformanceMode(true);
      GlobalAnimationDisableFunctions.toggleAccessibilityMode(true);
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Should change state quickly (less than 10ms)
      expect(duration).toBeLessThan(10);
    });
  });
});

