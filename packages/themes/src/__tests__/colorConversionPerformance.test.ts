/**
 * Performance tests for Color Conversion Utilities
 */

import { oklchToRgb, OKLCH } from "../colorConversion";

describe("Color Conversion Performance", () => {
  it("should handle multiple conversions efficiently", () => {
    const colors: OKLCH[] = [
      { l: 0.1, c: 0.1, h: 0 },
      { l: 0.3, c: 0.2, h: 60 },
      { l: 0.5, c: 0.3, h: 120 },
      { l: 0.7, c: 0.2, h: 180 },
      { l: 0.9, c: 0.1, h: 300 },
    ];

    const start = performance.now();
    colors.forEach((color) => oklchToRgb(color));
    const end = performance.now();

    // Should complete quickly (less than 10ms for 5 conversions)
    expect(end - start).toBeLessThan(10);
  });
});
