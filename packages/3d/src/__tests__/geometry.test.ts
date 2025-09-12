import { describe, it, expect } from "vitest";
import {
  createVector3,
  addVector3,
  subtractVector3,
  multiplyVector3,
  lengthVector3,
  normalizeVector3,
  distanceVector3,
  dotVector3,
  crossVector3,
  lerpVector3,
  createBoundingBox,
  centerBoundingBox,
  sizeBoundingBox,
  isPointInBoundingBox,
  expandBoundingBox,
  hslToRgb,
  rgbToHsl,
  randomColor,
  colorFromHash,
  clamp,
  mapRange,
  generateSpherePoints,
  generateCubePoints,
} from "../geometry";

describe("Geometry Utilities", () => {
  describe("Vector3 Operations", () => {
    it("creates a 3D vector", () => {
      const v = createVector3(1, 2, 3);
      expect(v).toEqual({ x: 1, y: 2, z: 3 });
    });

    it("creates a default 3D vector", () => {
      const v = createVector3();
      expect(v).toEqual({ x: 0, y: 0, z: 0 });
    });

    it("adds two 3D vectors", () => {
      const a = createVector3(1, 2, 3);
      const b = createVector3(4, 5, 6);
      const result = addVector3(a, b);
      expect(result).toEqual({ x: 5, y: 7, z: 9 });
    });

    it("subtracts two 3D vectors", () => {
      const a = createVector3(5, 7, 9);
      const b = createVector3(1, 2, 3);
      const result = subtractVector3(a, b);
      expect(result).toEqual({ x: 4, y: 5, z: 6 });
    });

    it("multiplies a 3D vector by a scalar", () => {
      const v = createVector3(1, 2, 3);
      const result = multiplyVector3(v, 2);
      expect(result).toEqual({ x: 2, y: 4, z: 6 });
    });

    it("calculates the length of a 3D vector", () => {
      const v = createVector3(3, 4, 0);
      expect(lengthVector3(v)).toBe(5);
    });

    it("normalizes a 3D vector", () => {
      const v = createVector3(3, 4, 0);
      const normalized = normalizeVector3(v);
      expect(normalized.x).toBeCloseTo(0.6);
      expect(normalized.y).toBeCloseTo(0.8);
      expect(normalized.z).toBeCloseTo(0);
    });

    it("handles zero vector normalization", () => {
      const v = createVector3(0, 0, 0);
      const normalized = normalizeVector3(v);
      expect(normalized).toEqual({ x: 0, y: 0, z: 0 });
    });

    it("calculates distance between two 3D vectors", () => {
      const a = createVector3(0, 0, 0);
      const b = createVector3(3, 4, 0);
      expect(distanceVector3(a, b)).toBe(5);
    });

    it("calculates dot product of two 3D vectors", () => {
      const a = createVector3(1, 2, 3);
      const b = createVector3(4, 5, 6);
      expect(dotVector3(a, b)).toBe(32); // 1*4 + 2*5 + 3*6
    });

    it("calculates cross product of two 3D vectors", () => {
      const a = createVector3(1, 0, 0);
      const b = createVector3(0, 1, 0);
      const result = crossVector3(a, b);
      expect(result).toEqual({ x: 0, y: 0, z: 1 });
    });

    it("performs linear interpolation between two 3D vectors", () => {
      const a = createVector3(0, 0, 0);
      const b = createVector3(10, 20, 30);
      const result = lerpVector3(a, b, 0.5);
      expect(result).toEqual({ x: 5, y: 10, z: 15 });
    });
  });

  describe("Bounding Box Operations", () => {
    it("creates a bounding box from points", () => {
      const points = [
        createVector3(0, 0, 0),
        createVector3(1, 2, 3),
        createVector3(-1, -2, -3),
      ];
      const box = createBoundingBox(points);
      expect(box.min).toEqual({ x: -1, y: -2, z: -3 });
      expect(box.max).toEqual({ x: 1, y: 2, z: 3 });
    });

    it("handles empty points array", () => {
      const box = createBoundingBox([]);
      expect(box.min).toEqual({ x: 0, y: 0, z: 0 });
      expect(box.max).toEqual({ x: 0, y: 0, z: 0 });
    });

    it("calculates center of bounding box", () => {
      const box = {
        min: createVector3(-1, -2, -3),
        max: createVector3(1, 2, 3),
      };
      const center = centerBoundingBox(box);
      expect(center).toEqual({ x: 0, y: 0, z: 0 });
    });

    it("calculates size of bounding box", () => {
      const box = {
        min: createVector3(-1, -2, -3),
        max: createVector3(1, 2, 3),
      };
      const size = sizeBoundingBox(box);
      expect(size).toEqual({ x: 2, y: 4, z: 6 });
    });

    it("checks if point is inside bounding box", () => {
      const box = {
        min: createVector3(-1, -1, -1),
        max: createVector3(1, 1, 1),
      };
      expect(isPointInBoundingBox(createVector3(0, 0, 0), box)).toBe(true);
      expect(isPointInBoundingBox(createVector3(2, 0, 0), box)).toBe(false);
    });

    it("expands bounding box to include point", () => {
      const box = {
        min: createVector3(0, 0, 0),
        max: createVector3(1, 1, 1),
      };
      const expanded = expandBoundingBox(box, createVector3(2, 2, 2));
      expect(expanded.min).toEqual({ x: 0, y: 0, z: 0 });
      expect(expanded.max).toEqual({ x: 2, y: 2, z: 2 });
    });
  });

  describe("Color Utilities", () => {
    it("converts HSL to RGB", () => {
      const rgb = hslToRgb(0, 1, 0.5); // Red
      expect(rgb[0]).toBeCloseTo(1);
      expect(rgb[1]).toBeCloseTo(0);
      expect(rgb[2]).toBeCloseTo(0);
    });

    it("converts RGB to HSL", () => {
      const hsl = rgbToHsl(255, 0, 0); // Red
      expect(hsl[0]).toBeCloseTo(0);
      expect(hsl[1]).toBeCloseTo(1);
      expect(hsl[2]).toBeCloseTo(0.5);
    });

    it("generates random color", () => {
      const color = randomColor();
      expect(color).toHaveLength(3);
      expect(color[0]).toBeGreaterThanOrEqual(0);
      expect(color[0]).toBeLessThanOrEqual(1);
      expect(color[1]).toBeGreaterThanOrEqual(0);
      expect(color[1]).toBeLessThanOrEqual(1);
      expect(color[2]).toBeGreaterThanOrEqual(0);
      expect(color[2]).toBeLessThanOrEqual(1);
    });

    it("generates color from hash", () => {
      const color1 = colorFromHash("test1");
      const color2 = colorFromHash("test2");
      expect(color1).not.toEqual(color2);
      expect(color1).toHaveLength(3);
      expect(color2).toHaveLength(3);
    });
  });

  describe("Utility Functions", () => {
    it("clamps values between min and max", () => {
      expect(clamp(5, 0, 10)).toBe(5);
      expect(clamp(-1, 0, 10)).toBe(0);
      expect(clamp(15, 0, 10)).toBe(10);
    });

    it("maps values from one range to another", () => {
      expect(mapRange(5, 0, 10, 0, 100)).toBe(50);
      expect(mapRange(2, 0, 10, 0, 100)).toBe(20);
      expect(mapRange(0, 0, 10, 0, 100)).toBe(0);
    });
  });

  describe("Point Generation", () => {
    it("generates points in a sphere", () => {
      const center = createVector3(0, 0, 0);
      const points = generateSpherePoints(center, 5, 10);
      expect(points).toHaveLength(10);

      // Check that all points are within the sphere radius
      points.forEach((point) => {
        const distance = distanceVector3(point, center);
        expect(distance).toBeLessThanOrEqual(5);
      });
    });

    it("generates points in a cube", () => {
      const center = createVector3(0, 0, 0);
      const points = generateCubePoints(center, 10, 5);
      expect(points).toHaveLength(5);

      // Check that all points are within the cube bounds
      points.forEach((point) => {
        expect(point.x).toBeGreaterThanOrEqual(-5);
        expect(point.x).toBeLessThanOrEqual(5);
        expect(point.y).toBeGreaterThanOrEqual(-5);
        expect(point.y).toBeLessThanOrEqual(5);
        expect(point.z).toBeGreaterThanOrEqual(-5);
        expect(point.z).toBeLessThanOrEqual(5);
      });
    });
  });
});
