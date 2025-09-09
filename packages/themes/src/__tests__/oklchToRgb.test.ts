/**
 * Tests for oklchToRgb function
 */

import { oklchToRgb, OKLCH } from "../colorConversion";

describe("oklchToRgb", () => {
  it("should convert basic OKLCH values to RGB", () => {
    const oklch: OKLCH = { l: 0.7, c: 0.2, h: 120 };
    const rgb = oklchToRgb(oklch);

    expect(rgb).toHaveProperty("r");
    expect(rgb).toHaveProperty("g");
    expect(rgb).toHaveProperty("b");
    expect(rgb.r).toBeGreaterThanOrEqual(0);
    expect(rgb.r).toBeLessThanOrEqual(255);
    expect(rgb.g).toBeGreaterThanOrEqual(0);
    expect(rgb.g).toBeLessThanOrEqual(255);
    expect(rgb.b).toBeGreaterThanOrEqual(0);
    expect(rgb.b).toBeLessThanOrEqual(255);
  });

  it("should handle edge cases correctly", () => {
    // Test pure black
    const black: OKLCH = { l: 0, c: 0, h: 0 };
    const blackRgb = oklchToRgb(black);
    expect(blackRgb.r).toBe(0);
    expect(blackRgb.g).toBe(0);
    expect(blackRgb.b).toBe(0);

    // Test pure white
    const white: OKLCH = { l: 1, c: 0, h: 0 };
    const whiteRgb = oklchToRgb(white);
    expect(whiteRgb.r).toBe(255);
    expect(whiteRgb.g).toBe(255);
    expect(whiteRgb.b).toBe(255);
  });

  it("should handle different hues correctly", () => {
    const baseOklch: OKLCH = { l: 0.5, c: 0.2, h: 0 };
    const red = oklchToRgb(baseOklch);

    const greenOklch: OKLCH = { l: 0.5, c: 0.2, h: 120 };
    const green = oklchToRgb(greenOklch);

    const blueOklch: OKLCH = { l: 0.5, c: 0.2, h: 240 };
    const blue = oklchToRgb(blueOklch);

    // Red should have highest red component
    expect(red.r).toBeGreaterThan(red.g);
    expect(red.r).toBeGreaterThan(red.b);

    // Green should have green component >= red component (may be equal due to color space conversion)
    expect(green.g).toBeGreaterThanOrEqual(green.r);
    expect(green.g).toBeGreaterThan(green.b);

    // Blue should have highest blue component
    expect(blue.b).toBeGreaterThan(blue.r);
    expect(blue.b).toBeGreaterThan(blue.g);
  });

  it("should handle high chroma values", () => {
    const highChroma: OKLCH = { l: 0.5, c: 0.4, h: 180 };
    const rgb = oklchToRgb(highChroma);

    // Should still produce valid RGB values
    expect(rgb.r).toBeGreaterThanOrEqual(0);
    expect(rgb.r).toBeLessThanOrEqual(255);
    expect(rgb.g).toBeGreaterThanOrEqual(0);
    expect(rgb.g).toBeLessThanOrEqual(255);
    expect(rgb.b).toBeGreaterThanOrEqual(0);
    expect(rgb.b).toBeLessThanOrEqual(255);
  });

  it("should handle zero chroma (grayscale)", () => {
    const grayscale: OKLCH = { l: 0.5, c: 0, h: 0 };
    const rgb = oklchToRgb(grayscale);

    // Grayscale should have equal RGB values
    expect(rgb.r).toBe(rgb.g);
    expect(rgb.g).toBe(rgb.b);
  });

  it("should handle hue values at boundaries", () => {
    const hue0: OKLCH = { l: 0.5, c: 0.2, h: 0 };
    const hue360: OKLCH = { l: 0.5, c: 0.2, h: 360 };

    const rgb0 = oklchToRgb(hue0);
    const rgb360 = oklchToRgb(hue360);

    // Hue 0 and 360 should produce similar results
    expect(Math.abs(rgb0.r - rgb360.r)).toBeLessThan(5);
    expect(Math.abs(rgb0.g - rgb360.g)).toBeLessThan(5);
    expect(Math.abs(rgb0.b - rgb360.b)).toBeLessThan(5);
  });

  it("should handle very small chroma values", () => {
    const lowChroma: OKLCH = { l: 0.5, c: 0.001, h: 120 };
    const rgb = oklchToRgb(lowChroma);

    // Should still produce valid RGB values
    expect(rgb.r).toBeGreaterThanOrEqual(0);
    expect(rgb.r).toBeLessThanOrEqual(255);
    expect(rgb.g).toBeGreaterThanOrEqual(0);
    expect(rgb.g).toBeLessThanOrEqual(255);
    expect(rgb.b).toBeGreaterThanOrEqual(0);
    expect(rgb.b).toBeLessThanOrEqual(255);
  });

  it("should produce consistent results for the same input", () => {
    const oklch: OKLCH = { l: 0.6, c: 0.25, h: 45 };
    const rgb1 = oklchToRgb(oklch);
    const rgb2 = oklchToRgb(oklch);

    expect(rgb1).toEqual(rgb2);
  });
});
