/**
 * Tests for Native OKLCH CSS Functions
 */

import { oklchStringToCSS, oklchStringToCSSWithAlpha } from "../../colorConversion";

describe("Native OKLCH CSS Functions", () => {
  describe("oklchStringToCSS", () => {
    it("should convert OKLCH string to native CSS format", () => {
      const result = oklchStringToCSS("oklch(70% 0.2 120)");
      expect(result).toMatch(/^oklch\(\d+%\s+[\d.]+\s+\d+\)$/);
    });

    it("should normalize OKLCH values correctly", () => {
      const result = oklchStringToCSS("oklch(70.5% 0.2 120.7)");
      expect(result).toMatch(/^oklch\(71%\s+0\.2\s+120\.7\)$/); // Lightness rounded to nearest integer
    });

    it("should return fallback OKLCH color for invalid strings", () => {
      const result = oklchStringToCSS("invalid-color");
      expect(result).toBe("oklch(40% 0.02 0)");
    });

    it("should handle OKLCH strings without percentage sign", () => {
      const result = oklchStringToCSS("oklch(70 0.2 120)");
      expect(result).toMatch(/^oklch\(\d+%\s+[\d.]+\s+\d+\)$/);
    });

    it("should handle case insensitive OKLCH strings", () => {
      const result = oklchStringToCSS("OKLCH(70% 0.2 120)");
      expect(result).toMatch(/^oklch\(\d+%\s+[\d.]+\s+\d+\)$/);
    });

    it("should produce valid CSS oklch() syntax", () => {
      const result = oklchStringToCSS("oklch(70% 0.2 120)");
      expect(result).toMatch(/^oklch\(\d+%\s+[\d.]+\s+\d+\)$/);

      // Should be valid CSS that can be used in stylesheets
      const testElement = document.createElement("div");
      testElement.style.backgroundColor = result;
      expect(testElement.style.backgroundColor).toBeTruthy();
    });
  });

  describe("oklchStringToCSSWithAlpha", () => {
    it("should convert OKLCH string to native CSS format with alpha", () => {
      const result = oklchStringToCSSWithAlpha("oklch(70% 0.2 120)", 0.5);
      expect(result).toBe("oklch(70% 0.2 120 / 0.5)");
    });

    it("should clamp alpha values to valid range", () => {
      const result1 = oklchStringToCSSWithAlpha("oklch(70% 0.2 120)", 1.5);
      expect(result1).toBe("oklch(70% 0.2 120 / 1)");

      const result2 = oklchStringToCSSWithAlpha("oklch(70% 0.2 120)", -0.5);
      expect(result2).toBe("oklch(70% 0.2 120 / 0)");
    });

    it("should default alpha to 1 when not provided", () => {
      const result = oklchStringToCSSWithAlpha("oklch(70% 0.2 120)");
      expect(result).toBe("oklch(70% 0.2 120 / 1)");
    });

    it("should return fallback OKLCH color with alpha for invalid strings", () => {
      const result = oklchStringToCSSWithAlpha("invalid-color", 0.8);
      expect(result).toBe("oklch(40% 0.02 0 / 0.8)");
    });

    it("should handle alpha values correctly in CSS", () => {
      const result = oklchStringToCSSWithAlpha("oklch(70% 0.2 120)", 0.5);
      expect(result).toMatch(/^oklch\(\d+%\s+[\d.]+\s+\d+\s+\/\s+[\d.]+\)$/);

      // Should be valid CSS that can be used in stylesheets
      const testElement = document.createElement("div");
      testElement.style.backgroundColor = result;
      expect(testElement.style.backgroundColor).toBeTruthy();
    });
  });

  describe("Performance Comparison", () => {
    it("should be more efficient than RGB conversion for CSS usage", () => {
      const oklchString = "oklch(70% 0.2 120)";

      const startCSS = performance.now();
      for (let i = 0; i < 1000; i++) {
        oklchStringToCSS(oklchString);
      }
      const endCSS = performance.now();

      // CSS conversion should be fast (no complex math)
      expect(endCSS - startCSS).toBeLessThan(50); // Should complete in under 50ms
    });
  });
});
