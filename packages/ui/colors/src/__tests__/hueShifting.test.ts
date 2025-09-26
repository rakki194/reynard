/**
 * Tests for hue shifting utility functions
 * Tests both animated and non-animated hue shifting functionality
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import type { OKLCHColor } from "../../types";
import {
  pureHueShift,
  generateHueShiftRamp,
  createComplementaryPair,
  createTriadicSet,
  createTetradicSet,
  createAnalogousSet,
  perceptualHueShift,
  batchHueShift,
  easedHueShift,
  getEasingFunction,
  isAnimationPackageAvailable,
  getAnimationPackage,
  EasingFunctions,
} from "../utils/hueShifting";

// Mock OKLCHColor for testing
const mockBaseColor: OKLCHColor = { l: 60, c: 0.25, h: 240 };
const mockColor2: OKLCHColor = { l: 70, c: 0.3, h: 120 };
const mockColor3: OKLCHColor = { l: 50, c: 0.2, h: 0 };

describe("Hue Shifting Functions", () => {
  describe("pureHueShift", () => {
    it("should shift hue while preserving lightness and chroma", () => {
      const result = pureHueShift(mockBaseColor, 30);

      expect(result.l).toBe(mockBaseColor.l);
      expect(result.c).toBe(mockBaseColor.c);
      expect(result.h).toBe(270); // 240 + 30
    });

    it("should handle hue wrapping correctly", () => {
      const result = pureHueShift(mockBaseColor, 200);

      expect(result.h).toBe(80); // (240 + 200) % 360
    });

    it("should handle negative hue shifts", () => {
      const result = pureHueShift(mockBaseColor, -30);

      expect(result.h).toBe(210); // (240 - 30 + 360) % 360
    });

    it("should handle large negative shifts that wrap around", () => {
      const result = pureHueShift(mockBaseColor, -300);

      expect(result.h).toBe(300); // (240 - 300 + 360) % 360
    });

    it("should preserve exact lightness and chroma values", () => {
      const result = pureHueShift(mockBaseColor, 180);

      expect(result.l).toBe(60);
      expect(result.c).toBe(0.25);
      expect(result.h).toBe(60); // (240 + 180) % 360
    });
  });

  describe("generateHueShiftRamp", () => {
    it("should generate the correct number of colors", () => {
      const ramp = generateHueShiftRamp(mockBaseColor, 5, 60);

      expect(ramp).toHaveLength(5);
    });

    it("should start with the base color", () => {
      const ramp = generateHueShiftRamp(mockBaseColor, 3, 60);

      expect(ramp[0]).toEqual(mockBaseColor);
    });

    it("should distribute hue shifts evenly", () => {
      const ramp = generateHueShiftRamp(mockBaseColor, 3, 60);

      expect(ramp[0].h).toBe(240); // Base color
      expect(ramp[1].h).toBe(270); // 240 + 30
      expect(ramp[2].h).toBe(300); // 240 + 60
    });

    it("should preserve lightness and chroma for all colors", () => {
      const ramp = generateHueShiftRamp(mockBaseColor, 4, 90);

      ramp.forEach(color => {
        expect(color.l).toBe(mockBaseColor.l);
        expect(color.c).toBe(mockBaseColor.c);
      });
    });

    it("should handle custom hue ranges", () => {
      const ramp = generateHueShiftRamp(mockBaseColor, 3, 120);

      expect(ramp[0].h).toBe(240);
      expect(ramp[1].h).toBe(300); // 240 + 60
      expect(ramp[2].h).toBe(0); // (240 + 120) % 360
    });
  });

  describe("createComplementaryPair", () => {
    it("should create exactly 2 colors", () => {
      const pair = createComplementaryPair(mockBaseColor);

      expect(pair).toHaveLength(2);
    });

    it("should start with the base color", () => {
      const pair = createComplementaryPair(mockBaseColor);

      expect(pair[0]).toEqual(mockBaseColor);
    });

    it("should create complementary color 180 degrees apart", () => {
      const pair = createComplementaryPair(mockBaseColor);

      expect(pair[1].h).toBe(60); // (240 + 180) % 360
    });

    it("should preserve lightness and chroma", () => {
      const pair = createComplementaryPair(mockBaseColor);

      pair.forEach(color => {
        expect(color.l).toBe(mockBaseColor.l);
        expect(color.c).toBe(mockBaseColor.c);
      });
    });
  });

  describe("createTriadicSet", () => {
    it("should create exactly 3 colors", () => {
      const triadic = createTriadicSet(mockBaseColor);

      expect(triadic).toHaveLength(3);
    });

    it("should start with the base color", () => {
      const triadic = createTriadicSet(mockBaseColor);

      expect(triadic[0]).toEqual(mockBaseColor);
    });

    it("should create colors 120 degrees apart", () => {
      const triadic = createTriadicSet(mockBaseColor);

      expect(triadic[0].h).toBe(240); // Base
      expect(triadic[1].h).toBe(0); // 240 + 120
      expect(triadic[2].h).toBe(120); // 240 + 240
    });

    it("should preserve lightness and chroma", () => {
      const triadic = createTriadicSet(mockBaseColor);

      triadic.forEach(color => {
        expect(color.l).toBe(mockBaseColor.l);
        expect(color.c).toBe(mockBaseColor.c);
      });
    });
  });

  describe("createTetradicSet", () => {
    it("should create exactly 4 colors", () => {
      const tetradic = createTetradicSet(mockBaseColor);

      expect(tetradic).toHaveLength(4);
    });

    it("should start with the base color", () => {
      const tetradic = createTetradicSet(mockBaseColor);

      expect(tetradic[0]).toEqual(mockBaseColor);
    });

    it("should create colors 90 degrees apart", () => {
      const tetradic = createTetradicSet(mockBaseColor);

      expect(tetradic[0].h).toBe(240); // Base
      expect(tetradic[1].h).toBe(330); // 240 + 90
      expect(tetradic[2].h).toBe(60); // 240 + 180
      expect(tetradic[3].h).toBe(150); // 240 + 270
    });

    it("should preserve lightness and chroma", () => {
      const tetradic = createTetradicSet(mockBaseColor);

      tetradic.forEach(color => {
        expect(color.l).toBe(mockBaseColor.l);
        expect(color.c).toBe(mockBaseColor.c);
      });
    });
  });

  describe("createAnalogousSet", () => {
    it("should create the correct number of colors", () => {
      const analogous = createAnalogousSet(mockBaseColor, 5, 60);

      expect(analogous).toHaveLength(5);
    });

    it("should center the spread around the base color", () => {
      const analogous = createAnalogousSet(mockBaseColor, 3, 60);

      // Should be: base - 30, base, base + 30
      expect(analogous[0].h).toBe(210); // 240 - 30
      expect(analogous[1].h).toBe(240); // Base
      expect(analogous[2].h).toBe(270); // 240 + 30
    });

    it("should handle custom spreads", () => {
      const analogous = createAnalogousSet(mockBaseColor, 3, 120);

      expect(analogous[0].h).toBe(180); // 240 - 60
      expect(analogous[1].h).toBe(240); // Base
      expect(analogous[2].h).toBe(300); // 240 + 60
    });

    it("should preserve lightness and chroma", () => {
      const analogous = createAnalogousSet(mockBaseColor, 4, 80);

      analogous.forEach(color => {
        expect(color.l).toBe(mockBaseColor.l);
        expect(color.c).toBe(mockBaseColor.c);
      });
    });
  });

  describe("perceptualHueShift", () => {
    it("should behave like pureHueShift when preserveRelationships is false", () => {
      const result = perceptualHueShift(mockBaseColor, 30, false);
      const expected = pureHueShift(mockBaseColor, 30);

      expect(result).toEqual(expected);
    });

    it("should behave like pureHueShift when preserveRelationships is true (default)", () => {
      const result = perceptualHueShift(mockBaseColor, 30);
      const expected = pureHueShift(mockBaseColor, 30);

      expect(result).toEqual(expected);
    });

    it("should preserve lightness and chroma", () => {
      const result = perceptualHueShift(mockBaseColor, 45);

      expect(result.l).toBe(mockBaseColor.l);
      expect(result.c).toBe(mockBaseColor.c);
      expect(result.h).toBe(285); // 240 + 45
    });
  });

  describe("batchHueShift", () => {
    it("should shift multiple colors by the same amount", () => {
      const colors = [mockBaseColor, mockColor2, mockColor3];
      const result = batchHueShift(colors, 30);

      expect(result).toHaveLength(3);
      expect(result[0].h).toBe(270); // 240 + 30
      expect(result[1].h).toBe(150); // 120 + 30
      expect(result[2].h).toBe(30); // 0 + 30
    });

    it("should preserve lightness and chroma for all colors", () => {
      const colors = [mockBaseColor, mockColor2];
      const result = batchHueShift(colors, 60);

      expect(result[0].l).toBe(mockBaseColor.l);
      expect(result[0].c).toBe(mockBaseColor.c);
      expect(result[1].l).toBe(mockColor2.l);
      expect(result[1].c).toBe(mockColor2.c);
    });

    it("should handle empty array", () => {
      const result = batchHueShift([], 30);

      expect(result).toHaveLength(0);
    });

    it("should handle negative shifts", () => {
      const colors = [mockBaseColor];
      const result = batchHueShift(colors, -30);

      expect(result[0].h).toBe(210); // 240 - 30
    });
  });

  describe("easedHueShift", () => {
    it("should shift hue with linear easing by default", () => {
      const result = easedHueShift(mockBaseColor, 60, 0.5);

      expect(result.h).toBe(270); // 240 + (60 * 0.5)
      expect(result.l).toBe(mockBaseColor.l);
      expect(result.c).toBe(mockBaseColor.c);
    });

    it("should shift hue with custom easing function", () => {
      const customEasing = (t: number) => t * t; // Quadratic
      const result = easedHueShift(mockBaseColor, 60, 0.5, customEasing);

      expect(result.h).toBe(255); // 240 + (60 * 0.25)
    });

    it("should handle progress values at boundaries", () => {
      const result0 = easedHueShift(mockBaseColor, 60, 0);
      const result1 = easedHueShift(mockBaseColor, 60, 1);

      expect(result0.h).toBe(240); // No shift
      expect(result1.h).toBe(300); // Full shift
    });

    it("should work with built-in easing functions", () => {
      const result = easedHueShift(mockBaseColor, 60, 0.5, EasingFunctions.easeInOut);

      expect(result.l).toBe(mockBaseColor.l);
      expect(result.c).toBe(mockBaseColor.c);
      // The exact hue will depend on the easing function calculation
      expect(result.h).toBeGreaterThanOrEqual(240);
      expect(result.h).toBeLessThanOrEqual(300);
    });

    it("should handle useAnimationPackage parameter", () => {
      // Test with animation package disabled
      const result = easedHueShift(mockBaseColor, 60, 0.5, EasingFunctions.linear, false);

      expect(result.h).toBe(270); // Should still work with built-in easing
    });
  });

  describe("EasingFunctions", () => {
    it("should have all required easing functions", () => {
      expect(EasingFunctions).toHaveProperty("linear");
      expect(EasingFunctions).toHaveProperty("easeInOut");
      expect(EasingFunctions).toHaveProperty("easeIn");
      expect(EasingFunctions).toHaveProperty("easeOut");
      expect(EasingFunctions).toHaveProperty("bounce");
    });

    it("should return values between 0 and 1 for valid inputs", () => {
      const testValues = [0, 0.25, 0.5, 0.75, 1];

      Object.values(EasingFunctions).forEach(easing => {
        testValues.forEach(t => {
          const result = easing(t);
          expect(result).toBeGreaterThanOrEqual(0);
          expect(result).toBeLessThanOrEqual(1);
        });
      });
    });

    it("should handle boundary values correctly", () => {
      Object.values(EasingFunctions).forEach(easing => {
        expect(easing(0)).toBe(0);
        expect(easing(1)).toBe(1);
      });
    });

    it("should have different behaviors for different easing types", () => {
      const t = 0.5;
      const linear = EasingFunctions.linear(t);
      const easeIn = EasingFunctions.easeIn(t);
      const easeOut = EasingFunctions.easeOut(t);

      expect(linear).toBe(0.5);
      expect(easeIn).toBeLessThan(linear);
      expect(easeOut).toBeGreaterThan(linear);
    });
  });

  describe("Animation Package Integration", () => {
    beforeEach(() => {
      // Reset any mocks
      vi.clearAllMocks();
    });

    it("should detect animation package availability", () => {
      const isAvailable = isAnimationPackageAvailable();

      // This will be false in test environment since we don't have the animation package
      expect(typeof isAvailable).toBe("boolean");
    });

    it("should return null animation package when not available", () => {
      const packageInstance = getAnimationPackage();

      // Should be null in test environment
      expect(packageInstance).toBeNull();
    });

    it("should get easing function from built-in functions", () => {
      const linearEasing = getEasingFunction("linear");

      expect(typeof linearEasing).toBe("function");
      expect(linearEasing(0.5)).toBe(0.5);
    });

    it("should fallback to built-in easing when animation package unavailable", () => {
      const easeInOut = getEasingFunction("easeInOut");

      expect(typeof easeInOut).toBe("function");
      expect(easeInOut(0)).toBe(0);
      expect(easeInOut(1)).toBe(1);
    });
  });

  describe("Edge Cases and Error Handling", () => {
    it("should handle extreme hue values", () => {
      const extremeColor: OKLCHColor = { l: 50, c: 0.1, h: 359 };
      const result = pureHueShift(extremeColor, 1);

      expect(result.h).toBe(0); // Should wrap around
    });

    it("should handle zero hue shift", () => {
      const result = pureHueShift(mockBaseColor, 0);

      expect(result).toEqual(mockBaseColor);
    });

    it("should handle 360 degree hue shift", () => {
      const result = pureHueShift(mockBaseColor, 360);

      expect(result.h).toBe(mockBaseColor.h); // Should be same as original
    });

    it("should handle very large hue shifts", () => {
      const result = pureHueShift(mockBaseColor, 720);

      expect(result.h).toBe(mockBaseColor.h); // 720 % 360 = 0
    });

    it("should handle progress values outside 0-1 range in easedHueShift", () => {
      const resultNegative = easedHueShift(mockBaseColor, 60, -0.5);
      const resultOverOne = easedHueShift(mockBaseColor, 60, 1.5);

      // Should still work, though results may be unexpected
      expect(resultNegative.l).toBe(mockBaseColor.l);
      expect(resultOverOne.l).toBe(mockBaseColor.l);
    });
  });
});
