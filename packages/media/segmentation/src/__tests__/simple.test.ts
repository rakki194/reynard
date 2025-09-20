/**
 * Simple Test
 *
 * Basic test to verify vitest is working.
 */

import { describe, it, expect } from "vitest";

describe("Simple Test", () => {
  it("should work", () => {
    expect(1 + 1).toBe(2);
  });

  it("should have correct point structure", () => {
    const point = { x: 50, y: 75 };
    expect(point).toHaveProperty("x");
    expect(point).toHaveProperty("y");
    expect(typeof point.x).toBe("number");
    expect(typeof point.y).toBe("number");
  });
});
