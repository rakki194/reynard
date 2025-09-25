/**
 * 🦊 Color Animation Tests
 *
 * Comprehensive test suite for the unified color animation system.
 * Tests smart imports, fallbacks, and accessibility compliance.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import type { OKLCHColor } from "reynard-colors";
import {
  easedHueShift,
  pureHueShift,
  batchHueShift,
  interpolateColor,
  generateEasedColorRamp,
  generateEasedHueRamp,
  animateColorTransition,
  ColorEasingFunctions,
} from "../ColorAnimations.js";
import {
  createColorAnimationSystem,
  getColorAnimationSystem,
  resetColorAnimationSystem,
} from "../ColorAnimationSystem.js";
import {
  applyColorFallbackTransition,
  applyHueFallbackShift,
  applyColorRampFallback,
  applyStaggeredColorFallback,
  cleanupColorAnimationStyles,
} from "../ColorFallbackUtils.js";

// Mock OKLCHColor for testing
const mockBaseColor: OKLCHColor = { l: 0.5, c: 0.1, h: 0 };
const mockTargetColor: OKLCHColor = { l: 0.7, c: 0.2, h: 120 };

describe("ColorAnimations", () => {
  describe("easedHueShift", () => {
    it("should shift hue with linear easing", () => {
      const result = easedHueShift(mockBaseColor, 30, 0.5);
      expect(result.h).toBe(15); // 0 + (30 * 0.5)
      expect(result.l).toBe(mockBaseColor.l);
      expect(result.c).toBe(mockBaseColor.c);
    });

    it("should shift hue with custom easing function", () => {
      const customEasing = (t: number) => t * t; // Quadratic
      const result = easedHueShift(mockBaseColor, 30, 0.5, customEasing);
      expect(result.h).toBe(7.5); // 0 + (30 * 0.25)
    });

    it("should handle hue wrapping", () => {
      const result = easedHueShift(mockBaseColor, 400, 1);
      expect(result.h).toBe(40); // (0 + 400) % 360
    });
  });

  describe("pureHueShift", () => {
    it("should shift hue without easing", () => {
      const result = pureHueShift(mockBaseColor, 30);
      expect(result.h).toBe(30);
      expect(result.l).toBe(mockBaseColor.l);
      expect(result.c).toBe(mockBaseColor.c);
    });

    it("should preserve lightness and chroma", () => {
      const result = pureHueShift(mockBaseColor, 180);
      expect(result.l).toBe(mockBaseColor.l);
      expect(result.c).toBe(mockBaseColor.c);
      expect(result.h).toBe(180);
    });
  });

  describe("batchHueShift", () => {
    it("should shift multiple colors", () => {
      const colors = [mockBaseColor, { ...mockBaseColor, h: 60 }];
      const result = batchHueShift(colors, 30);

      expect(result).toHaveLength(2);
      expect(result[0].h).toBe(30);
      expect(result[1].h).toBe(90);
    });
  });

  describe("interpolateColor", () => {
    it("should interpolate between two colors", () => {
      const result = interpolateColor(mockBaseColor, mockTargetColor, 0.5);

      expect(result.l).toBe(0.6); // (0.5 + 0.7) / 2
      expect(result.c).toBe(0.15); // (0.1 + 0.2) / 2
      expect(result.h).toBe(60); // (0 + 120) / 2
    });

    it("should handle hue interpolation with wrapping", () => {
      const startColor = { l: 0.5, c: 0.1, h: 350 };
      const endColor = { l: 0.5, c: 0.1, h: 10 };
      const result = interpolateColor(startColor, endColor, 0.5);

      expect(result.h).toBe(0); // Should wrap correctly
    });
  });

  describe("generateEasedColorRamp", () => {
    it("should generate color ramp with default parameters", () => {
      const result = generateEasedColorRamp(mockBaseColor, mockTargetColor);

      expect(result).toHaveLength(5);
      expect(result[0]).toEqual(mockBaseColor);
      expect(result[4]).toEqual(mockTargetColor);
    });

    it("should generate color ramp with custom stops", () => {
      const result = generateEasedColorRamp(mockBaseColor, mockTargetColor, 3);

      expect(result).toHaveLength(3);
      expect(result[0]).toEqual(mockBaseColor);
      expect(result[2]).toEqual(mockTargetColor);
    });
  });

  describe("generateEasedHueRamp", () => {
    it("should generate hue ramp", () => {
      const result = generateEasedHueRamp(mockBaseColor, 3, 60);

      expect(result).toHaveLength(3);
      expect(result[0].h).toBe(0);
      expect(result[1].h).toBe(30);
      expect(result[2].h).toBe(60);
    });
  });

  describe("animateColorTransition", () => {
    it("should return immediate completion when disabled", async () => {
      // Mock disabled animations
      vi.spyOn(window, "matchMedia").mockReturnValue({
        matches: true,
        media: "(prefers-reduced-motion: reduce)",
      } as MediaQueryList);

      const result = await animateColorTransition(mockBaseColor, mockTargetColor, {
        respectGlobalControl: true,
      });

      expect(result).toEqual([mockTargetColor]);
    });

    it("should create full transition when enabled", async () => {
      // Mock enabled animations
      vi.spyOn(window, "matchMedia").mockReturnValue({
        matches: false,
        media: "(prefers-reduced-motion: reduce)",
      } as MediaQueryList);

      const result = await animateColorTransition(mockBaseColor, mockTargetColor, {
        duration: 100,
        respectGlobalControl: true,
      });

      expect(result.length).toBeGreaterThan(1);
      expect(result[0]).toEqual(mockBaseColor);
      expect(result[result.length - 1]).toEqual(mockTargetColor);
    });
  });

  describe("ColorEasingFunctions", () => {
    it("should have all required easing functions", () => {
      expect(ColorEasingFunctions.linear).toBeDefined();
      expect(ColorEasingFunctions.easeInOut).toBeDefined();
      expect(ColorEasingFunctions.easeIn).toBeDefined();
      expect(ColorEasingFunctions.easeOut).toBeDefined();
      expect(ColorEasingFunctions.bounce).toBeDefined();
      expect(ColorEasingFunctions.elastic).toBeDefined();
      expect(ColorEasingFunctions.cubic).toBeDefined();
    });

    it("should return values between 0 and 1", () => {
      Object.values(ColorEasingFunctions).forEach(easing => {
        expect(easing(0)).toBe(0);
        expect(easing(1)).toBe(1);
        expect(easing(0.5)).toBeGreaterThanOrEqual(0);
        expect(easing(0.5)).toBeLessThanOrEqual(1);
      });
    });
  });
});

describe("ColorAnimationSystem", () => {
  beforeEach(() => {
    resetColorAnimationSystem();
  });

  afterEach(() => {
    resetColorAnimationSystem();
  });

  describe("createColorAnimationSystem", () => {
    it("should create color animation system", () => {
      const system = createColorAnimationSystem();

      expect(system.state).toBeDefined();
      expect(system.functions).toBeDefined();
      expect(system.state.animationEngine).toBeDefined();
      expect(system.state.isAnimationsDisabled).toBeDefined();
      expect(system.state.isColorPackageAvailable).toBeDefined();
    });

    it("should provide enhanced functions", () => {
      const system = createColorAnimationSystem();

      expect(system.functions.easedHueShift).toBeDefined();
      expect(system.functions.pureHueShift).toBeDefined();
      expect(system.functions.batchHueShift).toBeDefined();
      expect(system.functions.interpolateColor).toBeDefined();
      expect(system.functions.generateEasedColorRamp).toBeDefined();
      expect(system.functions.generateEasedHueRamp).toBeDefined();
      expect(system.functions.animateColorTransition).toBeDefined();
    });
  });

  describe("getColorAnimationSystem", () => {
    it("should return singleton instance", () => {
      const system1 = getColorAnimationSystem();
      const system2 = getColorAnimationSystem();

      expect(system1).toBe(system2);
    });
  });

  describe("resetColorAnimationSystem", () => {
    it("should reset the global system", () => {
      const system1 = getColorAnimationSystem();
      resetColorAnimationSystem();
      const system2 = getColorAnimationSystem();

      expect(system1).not.toBe(system2);
    });
  });
});

describe("ColorFallbackUtils", () => {
  let mockElement: HTMLElement;

  beforeEach(() => {
    mockElement = document.createElement("div");
    document.body.appendChild(mockElement);
  });

  afterEach(() => {
    if (mockElement.parentNode) {
      mockElement.parentNode.removeChild(mockElement);
    }
    cleanupColorAnimationStyles(mockElement);
  });

  describe("applyColorFallbackTransition", () => {
    it("should apply CSS transition", () => {
      applyColorFallbackTransition(mockBaseColor, mockTargetColor, mockElement);

      expect(mockElement.classList.contains("color-fallback-transition")).toBe(true);
      expect(mockElement.style.getPropertyValue("--color-start")).toBe("oklch(0.5 0.1 0)");
      expect(mockElement.style.getPropertyValue("--color-end")).toBe("oklch(0.7 0.2 120)");
    });

    it("should respect disabled animations", () => {
      // Mock disabled animations
      vi.spyOn(window, "matchMedia").mockReturnValue({
        matches: true,
        media: "(prefers-reduced-motion: reduce)",
      } as MediaQueryList);

      applyColorFallbackTransition(mockBaseColor, mockTargetColor, mockElement, {
        respectGlobalControl: true,
        immediateCompletion: true,
      });

      expect(mockElement.style.backgroundColor).toBe("oklch(0.7 0.2 120)");
    });
  });

  describe("applyHueFallbackShift", () => {
    it("should apply hue shift", () => {
      applyHueFallbackShift(mockBaseColor, 30, mockElement);

      expect(mockElement.classList.contains("hue-fallback-shift")).toBe(true);
      expect(mockElement.style.getPropertyValue("--hue-shift")).toBe("30deg");
    });
  });

  describe("applyColorRampFallback", () => {
    it("should apply color ramp", () => {
      const colors = [mockBaseColor, mockTargetColor];
      applyColorRampFallback(colors, mockElement);

      expect(mockElement.classList.contains("color-ramp-fallback")).toBe(true);
    });
  });

  describe("applyStaggeredColorFallback", () => {
    it("should apply staggered animation", () => {
      const elements = [mockElement, document.createElement("div")];
      const colors = [mockBaseColor, mockTargetColor];

      applyStaggeredColorFallback(elements, colors);

      elements.forEach(element => {
        expect(element.classList.contains("color-staggered-fallback")).toBe(true);
        expect(element.classList.contains("color-item")).toBe(true);
      });
    });
  });

  describe("cleanupColorAnimationStyles", () => {
    it("should remove animation classes and styles", () => {
      mockElement.classList.add("color-fallback-transition");
      mockElement.style.setProperty("--color-animation-duration", "300ms");

      cleanupColorAnimationStyles(mockElement);

      expect(mockElement.classList.contains("color-fallback-transition")).toBe(false);
      expect(mockElement.style.getPropertyValue("--color-animation-duration")).toBe("");
    });
  });
});

describe("Integration Tests", () => {
  describe("Smart Import System", () => {
    it("should handle missing color package gracefully", async () => {
      // Mock missing package
      const originalImport = global.import;
      global.import = vi.fn().mockRejectedValue(new Error("Module not found"));

      const system = createColorAnimationSystem();

      // Should still work with fallbacks
      expect(system.state.animationEngine()).toBe("fallback");

      global.import = originalImport;
    });
  });

  describe("Accessibility Compliance", () => {
    it("should respect prefers-reduced-motion", () => {
      vi.spyOn(window, "matchMedia").mockReturnValue({
        matches: true,
        media: "(prefers-reduced-motion: reduce)",
      } as MediaQueryList);

      const system = createColorAnimationSystem();

      expect(system.state.isAnimationsDisabled()).toBe(true);
    });

    it("should respect performance mode", () => {
      document.documentElement.classList.add("performance-mode");

      const system = createColorAnimationSystem();

      expect(system.state.isAnimationsDisabled()).toBe(true);

      document.documentElement.classList.remove("performance-mode");
    });
  });

  describe("Performance Optimizations", () => {
    it("should use immediate completion when disabled", () => {
      document.documentElement.classList.add("animations-disabled");

      const system = createColorAnimationSystem();
      const result = system.functions.easedHueShift(mockBaseColor, 30, 0.5);

      // Should return base color when disabled
      expect(result).toEqual(mockBaseColor);

      document.documentElement.classList.remove("animations-disabled");
    });
  });
});
