/**
 * Tests for oklchStringToRgb function
 */

import { oklchStringToRgb } from "../colorConversion";

describe("oklchStringToRgb", () => {
  it("should parse valid OKLCH strings", () => {
    const result = oklchStringToRgb("oklch(70% 0.2 120)");
    expect(result).toMatch(/^rgb\(\d+, \d+, \d+\)$/);
  });

  it("should handle OKLCH strings without percentage sign", () => {
    const result = oklchStringToRgb("oklch(70 0.2 120)");
    expect(result).toMatch(/^rgb\(\d+, \d+, \d+\)$/);
  });

  it("should handle OKLCH strings with extra whitespace", () => {
    const result = oklchStringToRgb("  oklch(  70%  0.2  120  )  ");
    expect(result).toMatch(/^rgb\(\d+, \d+, \d+\)$/);
  });

  it("should handle case insensitive OKLCH strings", () => {
    const result = oklchStringToRgb("OKLCH(70% 0.2 120)");
    expect(result).toMatch(/^rgb\(\d+, \d+, \d+\)$/);
  });

  it("should return fallback color for invalid strings", () => {
    const result = oklchStringToRgb("invalid-color");
    expect(result).toBe("#666666");
  });

  it("should return fallback color for malformed OKLCH", () => {
    const result = oklchStringToRgb("oklch(70% 0.2)"); // Missing hue
    expect(result).toBe("#666666");
  });

  it("should return fallback color for out-of-range values", () => {
    const result = oklchStringToRgb("oklch(150% 0.2 120)"); // Lightness > 100%
    expect(result).toBe("#666666");
  });

  it("should return fallback color for negative values", () => {
    const result = oklchStringToRgb("oklch(-10% 0.2 120)"); // Negative lightness
    expect(result).toBe("#666666");
  });
});
