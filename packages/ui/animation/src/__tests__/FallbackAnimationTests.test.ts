/**
 * 🦊 Fallback Animation Tests
 *
 * Comprehensive test suite for fallback animation functionality.
 * Tests CSS fallback animations, immediate completion, and performance optimizations.
 */

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import {
  useAnimationFallback,
  applyStaggeredFallback,
  applyImmediateCompletion,
  createFallbackAnimationCSS,
  applyFallbackAnimationCSS,
  removeFallbackAnimationClasses,
  cleanupFallbackAnimationStyles,
} from "../core/index.js";
import {
  applyColorFallbackTransition,
  applyHueFallbackShift,
  applyColorRampFallback,
  applyStaggeredColorFallback,
  applyImmediateColorChange,
  applyImmediateColorRamp,
  createColorAnimationCSS,
  applyColorAnimationCSS,
  removeColorAnimationClasses,
  cleanupColorAnimationStyles,
} from "../color/index.js";
import {
  apply3DPointFallback,
  apply3DClusterFallback,
  apply3DCameraFallback,
  apply3DRotationFallback,
  apply3DScaleFallback,
  apply3DTranslationFallback,
  applyImmediate3DTransform,
  create3DAnimationCSS,
  apply3DAnimationCSS,
  remove3DAnimationClasses,
  cleanup3DAnimationStyles,
} from "../3d/index.js";
import { GlobalAnimationDisableFunctions, AnimationDisableTesting } from "../global/GlobalAnimationDisableUtils.js";

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
  requestAnimationFrame: vi.fn(callback => {
    callback();
    return 1;
  }),
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

describe("Fallback Animation Tests", () => {
  let mockElement: HTMLElement;

  beforeEach(() => {
    vi.clearAllMocks();
    mockElement = mockDocument.createElement() as any;
  });

  afterEach(() => {
    GlobalAnimationDisableFunctions.reset();
  });

  describe("CSS Fallback Animations", () => {
    it("should apply CSS fallback animations", () => {
      const options = {
        duration: 300,
        easing: "ease-in-out",
        immediateCompletion: false,
        respectGlobalControl: true,
      };

      applyStaggeredFallback([mockElement], options);

      expect(mockElement.style.setProperty).toHaveBeenCalled();
      expect(mockElement.classList.add).toHaveBeenCalled();
    });

    it("should create fallback animation CSS", () => {
      const transforms = {
        transform: "translateX(100px)",
        opacity: "0.5",
      };

      const css = createFallbackAnimationCSS(transforms, {
        duration: 300,
        easing: "ease-in-out",
      });

      expect(css).toContain("--animation-duration: 300ms");
      expect(css).toContain("--animation-easing: ease-in-out");
      expect(css).toContain("--transform: translateX(100px)");
      expect(css).toContain("--opacity: 0.5");
    });

    it("should apply fallback animation CSS to element", () => {
      const transforms = {
        transform: "translateX(100px)",
        opacity: "0.5",
      };

      applyFallbackAnimationCSS(mockElement, transforms, {
        duration: 300,
        easing: "ease-in-out",
      });

      expect(mockElement.style.setProperty).toHaveBeenCalledWith("--animation-duration", "300ms");
      expect(mockElement.style.setProperty).toHaveBeenCalledWith("--animation-easing", "ease-in-out");
      expect(mockElement.style.setProperty).toHaveBeenCalledWith("--transform", "translateX(100px)");
      expect(mockElement.style.setProperty).toHaveBeenCalledWith("--opacity", "0.5");
    });

    it("should remove fallback animation classes", () => {
      removeFallbackAnimationClasses(mockElement);

      expect(mockElement.classList.remove).toHaveBeenCalled();
    });

    it("should cleanup fallback animation styles", () => {
      cleanupFallbackAnimationStyles(mockElement);

      expect(mockElement.style.removeProperty).toHaveBeenCalled();
    });
  });

  describe("Immediate Completion for Disabled State", () => {
    it("should apply immediate completion when animations disabled", () => {
      GlobalAnimationDisableFunctions.disableAllAnimations();

      const options = {
        duration: 300,
        easing: "ease-in-out",
        immediateCompletion: true,
        respectGlobalControl: true,
      };

      applyStaggeredFallback([mockElement], options);

      // Should apply immediate completion
      expect(mockElement.style.setProperty).toHaveBeenCalled();
    });

    it("should apply immediate completion for color animations", () => {
      GlobalAnimationDisableFunctions.disableAllAnimations();

      const startColor = [255, 0, 0] as [number, number, number];
      const endColor = [0, 255, 0] as [number, number, number];

      applyImmediateColorChange(mockElement, startColor, endColor);

      expect(mockElement.style.setProperty).toHaveBeenCalled();
    });

    it("should apply immediate completion for 3D animations", () => {
      GlobalAnimationDisableFunctions.disableAllAnimations();

      const point = { x: 100, y: 200, z: 300 };

      applyImmediate3DTransform(mockElement, point);

      expect(mockElement.style.transform).toBe("translate3d(100px, 200px, 300px)");
    });

    it("should handle immediate completion with performance optimizations", () => {
      GlobalAnimationDisableFunctions.togglePerformanceMode(true);

      const options = {
        duration: 300,
        easing: "ease-in-out",
        immediateCompletion: true,
        respectGlobalControl: true,
        performanceMode: true,
      };

      applyStaggeredFallback([mockElement], options);

      expect(mockElement.style.setProperty).toHaveBeenCalled();
    });
  });

  describe("Performance Optimizations", () => {
    it("should apply performance optimizations in performance mode", () => {
      GlobalAnimationDisableFunctions.togglePerformanceMode(true);

      const options = {
        duration: 300,
        easing: "ease-in-out",
        immediateCompletion: false,
        respectGlobalControl: true,
        performanceMode: true,
      };

      applyStaggeredFallback([mockElement], options);

      expect(mockElement.style.setProperty).toHaveBeenCalled();
    });

    it("should use reduced duration in performance mode", () => {
      GlobalAnimationDisableFunctions.togglePerformanceMode(true);

      const options = {
        duration: 300,
        easing: "ease-in-out",
        immediateCompletion: false,
        respectGlobalControl: true,
        performanceMode: true,
      };

      applyStaggeredFallback([mockElement], options);

      // Should use reduced duration
      expect(mockElement.style.setProperty).toHaveBeenCalledWith(
        expect.stringContaining("duration"),
        expect.any(String)
      );
    });

    it("should optimize color animations for performance", () => {
      GlobalAnimationDisableFunctions.togglePerformanceMode(true);

      const startColor = [255, 0, 0] as [number, number, number];
      const endColor = [0, 255, 0] as [number, number, number];

      applyColorFallbackTransition(mockElement, startColor, endColor, {
        duration: 300,
        easing: "ease-in-out",
        immediateCompletion: false,
        respectGlobalControl: true,
        performanceMode: true,
      });

      expect(mockElement.style.setProperty).toHaveBeenCalled();
    });

    it("should optimize 3D animations for performance", () => {
      GlobalAnimationDisableFunctions.togglePerformanceMode(true);

      const startPoint = { x: 0, y: 0, z: 0 };
      const endPoint = { x: 100, y: 200, z: 300 };

      apply3DPointFallback(mockElement, startPoint, endPoint, {
        duration: 300,
        easing: "ease-in-out",
        immediateCompletion: false,
        respectGlobalControl: true,
        performanceMode: true,
      });

      expect(mockElement.style.setProperty).toHaveBeenCalled();
    });
  });

  describe("Accessibility Compliance", () => {
    it("should respect reduced motion preferences", () => {
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

      const options = {
        duration: 300,
        easing: "ease-in-out",
        immediateCompletion: true,
        respectGlobalControl: true,
      };

      applyStaggeredFallback([mockElement], options);

      // Should apply immediate completion due to reduced motion
      expect(mockElement.style.setProperty).toHaveBeenCalled();
    });

    it("should respect high contrast preferences", () => {
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

      const options = {
        duration: 300,
        easing: "ease-in-out",
        immediateCompletion: false,
        respectGlobalControl: true,
      };

      applyStaggeredFallback([mockElement], options);

      expect(mockElement.style.setProperty).toHaveBeenCalled();
    });

    it("should handle forced colors", () => {
      // Mock forced-colors: active
      mockWindow.matchMedia.mockImplementation((query: string) => ({
        matches: query === "(forced-colors: active)",
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      const options = {
        duration: 300,
        easing: "ease-in-out",
        immediateCompletion: false,
        respectGlobalControl: true,
      };

      applyStaggeredFallback([mockElement], options);

      expect(mockElement.style.setProperty).toHaveBeenCalled();
    });

    it("should provide accessible color animations", () => {
      const startColor = [255, 0, 0] as [number, number, number];
      const endColor = [0, 255, 0] as [number, number, number];

      applyColorFallbackTransition(mockElement, startColor, endColor, {
        duration: 300,
        easing: "ease-in-out",
        immediateCompletion: false,
        respectGlobalControl: true,
        accessibilityMode: true,
      });

      expect(mockElement.style.setProperty).toHaveBeenCalled();
    });

    it("should provide accessible 3D animations", () => {
      const startPoint = { x: 0, y: 0, z: 0 };
      const endPoint = { x: 100, y: 200, z: 300 };

      apply3DPointFallback(mockElement, startPoint, endPoint, {
        duration: 300,
        easing: "ease-in-out",
        immediateCompletion: false,
        respectGlobalControl: true,
        accessibilityMode: true,
      });

      expect(mockElement.style.setProperty).toHaveBeenCalled();
    });
  });

  describe("Color Fallback Animations", () => {
    it("should apply color fallback transition", () => {
      const startColor = [255, 0, 0] as [number, number, number];
      const endColor = [0, 255, 0] as [number, number, number];

      applyColorFallbackTransition(mockElement, startColor, endColor);

      expect(mockElement.style.setProperty).toHaveBeenCalled();
      expect(mockElement.classList.add).toHaveBeenCalled();
    });

    it("should apply hue fallback shift", () => {
      const baseColor = { l: 0.5, c: 0.2, h: 0 };
      const deltaH = 60;

      applyHueFallbackShift(mockElement, baseColor, deltaH);

      expect(mockElement.style.setProperty).toHaveBeenCalled();
      expect(mockElement.classList.add).toHaveBeenCalled();
    });

    it("should apply color ramp fallback", () => {
      const colors = [
        [255, 0, 0] as [number, number, number],
        [0, 255, 0] as [number, number, number],
        [0, 0, 255] as [number, number, number],
      ];

      applyColorRampFallback(mockElement, colors);

      expect(mockElement.style.setProperty).toHaveBeenCalled();
      expect(mockElement.classList.add).toHaveBeenCalled();
    });

    it("should apply staggered color fallback", () => {
      const elements = [mockElement, mockDocument.createElement() as any];
      const colors = [[255, 0, 0] as [number, number, number], [0, 255, 0] as [number, number, number]];

      applyStaggeredColorFallback(elements, colors);

      elements.forEach(element => {
        expect(element.style.setProperty).toHaveBeenCalled();
        expect(element.classList.add).toHaveBeenCalled();
      });
    });

    it("should apply immediate color change", () => {
      const startColor = [255, 0, 0] as [number, number, number];
      const endColor = [0, 255, 0] as [number, number, number];

      applyImmediateColorChange(mockElement, startColor, endColor);

      expect(mockElement.style.setProperty).toHaveBeenCalled();
    });

    it("should apply immediate color ramp", () => {
      const colors = [[255, 0, 0] as [number, number, number], [0, 255, 0] as [number, number, number]];

      applyImmediateColorRamp(mockElement, colors);

      expect(mockElement.style.setProperty).toHaveBeenCalled();
    });

    it("should create color animation CSS", () => {
      const transforms = {
        color: "rgb(255, 0, 0)",
        "background-color": "rgb(0, 255, 0)",
      };

      const css = createColorAnimationCSS(transforms, {
        duration: 300,
        easing: "ease-in-out",
      });

      expect(css).toContain("--color: rgb(255, 0, 0)");
      expect(css).toContain("--background-color: rgb(0, 255, 0)");
    });

    it("should cleanup color animation styles", () => {
      cleanupColorAnimationStyles(mockElement);

      expect(mockElement.style.removeProperty).toHaveBeenCalled();
      expect(mockElement.classList.remove).toHaveBeenCalled();
    });
  });

  describe("3D Fallback Animations", () => {
    it("should apply 3D point fallback", () => {
      const startPoint = { x: 0, y: 0, z: 0 };
      const endPoint = { x: 100, y: 200, z: 300 };

      apply3DPointFallback(mockElement, startPoint, endPoint);

      expect(mockElement.style.setProperty).toHaveBeenCalled();
      expect(mockElement.classList.add).toHaveBeenCalled();
    });

    it("should apply 3D cluster fallback", () => {
      const elements = [mockElement, mockDocument.createElement() as any];
      const center: [number, number, number] = [100, 200, 300];
      const expansionRadius = 50;

      apply3DClusterFallback(elements, center, expansionRadius);

      elements.forEach(element => {
        expect(element.style.setProperty).toHaveBeenCalled();
        expect(element.classList.add).toHaveBeenCalled();
      });
    });

    it("should apply 3D camera fallback", () => {
      const startPosition: [number, number, number] = [0, 0, 0];
      const endPosition: [number, number, number] = [100, 200, 300];

      apply3DCameraFallback(mockElement, startPosition, endPosition);

      expect(mockElement.style.setProperty).toHaveBeenCalled();
      expect(mockElement.classList.add).toHaveBeenCalled();
    });

    it("should apply 3D rotation fallback", () => {
      const rotation: [number, number, number] = [45, 90, 135];

      apply3DRotationFallback(mockElement, rotation);

      expect(mockElement.style.setProperty).toHaveBeenCalled();
      expect(mockElement.classList.add).toHaveBeenCalled();
    });

    it("should apply 3D scale fallback", () => {
      const scale: [number, number, number] = [1.5, 2.0, 0.5];

      apply3DScaleFallback(mockElement, scale);

      expect(mockElement.style.setProperty).toHaveBeenCalled();
      expect(mockElement.classList.add).toHaveBeenCalled();
    });

    it("should apply 3D translation fallback", () => {
      const translation: [number, number, number] = [100, 200, 300];

      apply3DTranslationFallback(mockElement, translation);

      expect(mockElement.style.setProperty).toHaveBeenCalled();
      expect(mockElement.classList.add).toHaveBeenCalled();
    });

    it("should create 3D animation CSS", () => {
      const transforms = {
        transform: "translate3d(100px, 200px, 300px)",
        opacity: "0.8",
      };

      const css = create3DAnimationCSS(transforms, {
        duration: 300,
        easing: "ease-in-out",
        perspective: 1000,
        transformOrigin: "center center",
      });

      expect(css).toContain("--transform: translate3d(100px, 200px, 300px)");
      expect(css).toContain("--opacity: 0.8");
      expect(css).toContain("--3d-perspective: 1000px");
      expect(css).toContain("--3d-transform-origin: center center");
    });

    it("should cleanup 3D animation styles", () => {
      cleanup3DAnimationStyles(mockElement);

      expect(mockElement.style.removeProperty).toHaveBeenCalled();
      expect(mockElement.classList.remove).toHaveBeenCalled();
    });
  });

  describe("Error Handling", () => {
    it("should handle missing element gracefully", () => {
      expect(() => {
        applyStaggeredFallback([null as any], {});
      }).not.toThrow();
    });

    it("should handle missing window gracefully", () => {
      const originalWindow = global.window;
      // @ts-ignore
      delete global.window;

      expect(() => {
        applyStaggeredFallback([mockElement], {});
      }).not.toThrow();

      // Restore window
      global.window = originalWindow;
    });

    it("should handle missing document gracefully", () => {
      const originalDocument = global.document;
      // @ts-ignore
      delete global.document;

      expect(() => {
        applyStaggeredFallback([mockElement], {});
      }).not.toThrow();

      // Restore document
      global.document = originalDocument;
    });

    it("should handle invalid options gracefully", () => {
      const invalidOptions = {
        duration: -1, // Invalid duration
        easing: null, // Invalid easing
      } as any;

      expect(() => {
        applyStaggeredFallback([mockElement], invalidOptions);
      }).not.toThrow();
    });
  });

  describe("Performance Benchmarks", () => {
    it("should measure fallback animation performance", () => {
      const startTime = performance.now();

      applyStaggeredFallback([mockElement], {
        duration: 300,
        easing: "ease-in-out",
      });

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should complete quickly (less than 10ms)
      expect(duration).toBeLessThan(10);
    });

    it("should measure immediate completion performance", () => {
      const startTime = performance.now();

      applyImmediateCompletion([mockElement], {
        duration: 300,
        easing: "ease-in-out",
      });

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should complete very quickly (less than 5ms)
      expect(duration).toBeLessThan(5);
    });
  });
});
