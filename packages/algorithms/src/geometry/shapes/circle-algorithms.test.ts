import { describe, it, expect } from 'vitest';
import { CircleOps } from './circle-algorithms';
import { PointOps } from './point-algorithms';

describe('CircleOps', () => {
  describe('create', () => {
    it('should create a circle with center and radius', () => {
      const center = { x: 10, y: 20 };
      const radius = 5;
      const circle = CircleOps.create(center, radius);
      
      expect(circle.center).toEqual(center);
      expect(circle.radius).toBe(radius);
    });
  });

  describe('area', () => {
    it('should calculate area correctly', () => {
      const circle = CircleOps.create({ x: 0, y: 0 }, 5);
      const expectedArea = Math.PI * 25;
      
      expect(CircleOps.area(circle)).toBeCloseTo(expectedArea, 5);
    });

    it('should calculate area for zero radius', () => {
      const circle = CircleOps.create({ x: 0, y: 0 }, 0);
      expect(CircleOps.area(circle)).toBe(0);
    });
  });

  describe('circumference', () => {
    it('should calculate circumference correctly', () => {
      const circle = CircleOps.create({ x: 0, y: 0 }, 5);
      const expectedCircumference = 2 * Math.PI * 5;
      
      expect(CircleOps.circumference(circle)).toBeCloseTo(expectedCircumference, 5);
    });

    it('should calculate circumference for zero radius', () => {
      const circle = CircleOps.create({ x: 0, y: 0 }, 0);
      expect(CircleOps.circumference(circle)).toBe(0);
    });
  });

  describe('containsPoint', () => {
    it('should return true for point at center', () => {
      const circle = CircleOps.create({ x: 0, y: 0 }, 5);
      const point = { x: 0, y: 0 };
      
      expect(CircleOps.containsPoint(circle, point)).toBe(true);
    });

    it('should return true for point inside circle', () => {
      const circle = CircleOps.create({ x: 0, y: 0 }, 5);
      const point = { x: 3, y: 4 };
      
      expect(CircleOps.containsPoint(circle, point)).toBe(true);
    });

    it('should return true for point on circle edge', () => {
      const circle = CircleOps.create({ x: 0, y: 0 }, 5);
      const point = { x: 5, y: 0 };
      
      expect(CircleOps.containsPoint(circle, point)).toBe(true);
    });

    it('should return false for point outside circle', () => {
      const circle = CircleOps.create({ x: 0, y: 0 }, 5);
      const point = { x: 6, y: 0 };
      
      expect(CircleOps.containsPoint(circle, point)).toBe(false);
    });

    it('should work with offset center', () => {
      const circle = CircleOps.create({ x: 10, y: 20 }, 5);
      const point = { x: 10, y: 20 };
      
      expect(CircleOps.containsPoint(circle, point)).toBe(true);
    });
  });

  describe('intersects', () => {
    it('should return true for overlapping circles', () => {
      const circle1 = CircleOps.create({ x: 0, y: 0 }, 5);
      const circle2 = CircleOps.create({ x: 3, y: 0 }, 5);
      
      expect(CircleOps.intersects(circle1, circle2)).toBe(true);
    });

    it('should return true for touching circles', () => {
      const circle1 = CircleOps.create({ x: 0, y: 0 }, 5);
      const circle2 = CircleOps.create({ x: 10, y: 0 }, 5);
      
      expect(CircleOps.intersects(circle1, circle2)).toBe(true);
    });

    it('should return false for non-overlapping circles', () => {
      const circle1 = CircleOps.create({ x: 0, y: 0 }, 5);
      const circle2 = CircleOps.create({ x: 15, y: 0 }, 5);
      
      expect(CircleOps.intersects(circle1, circle2)).toBe(false);
    });

    it('should return true for identical circles', () => {
      const circle1 = CircleOps.create({ x: 0, y: 0 }, 5);
      const circle2 = CircleOps.create({ x: 0, y: 0 }, 5);
      
      expect(CircleOps.intersects(circle1, circle2)).toBe(true);
    });

    it('should work with different sized circles', () => {
      const circle1 = CircleOps.create({ x: 0, y: 0 }, 3);
      const circle2 = CircleOps.create({ x: 0, y: 0 }, 7);
      
      expect(CircleOps.intersects(circle1, circle2)).toBe(true);
    });
  });

  describe('expand', () => {
    it('should increase radius by specified amount', () => {
      const circle = CircleOps.create({ x: 0, y: 0 }, 5);
      const expanded = CircleOps.expand(circle, 2);
      
      expect(expanded.radius).toBe(7);
      expect(expanded.center).toEqual(circle.center);
    });

    it('should work with negative amount (shrink)', () => {
      const circle = CircleOps.create({ x: 0, y: 0 }, 5);
      const expanded = CircleOps.expand(circle, -2);
      
      expect(expanded.radius).toBe(3);
    });
  });

  describe('shrink', () => {
    it('should decrease radius by specified amount', () => {
      const circle = CircleOps.create({ x: 0, y: 0 }, 5);
      const shrunk = CircleOps.shrink(circle, 2);
      
      expect(shrunk.radius).toBe(3);
      expect(shrunk.center).toEqual(circle.center);
    });

    it('should not allow negative radius', () => {
      const circle = CircleOps.create({ x: 0, y: 0 }, 5);
      const shrunk = CircleOps.shrink(circle, 10);
      
      expect(shrunk.radius).toBe(0);
    });

    it('should handle exact shrink to zero', () => {
      const circle = CircleOps.create({ x: 0, y: 0 }, 5);
      const shrunk = CircleOps.shrink(circle, 5);
      
      expect(shrunk.radius).toBe(0);
    });
  });

  describe('translate', () => {
    it('should move circle by offset vector', () => {
      const circle = CircleOps.create({ x: 0, y: 0 }, 5);
      const offset = { x: 10, y: 20 };
      const translated = CircleOps.translate(circle, offset);
      
      expect(translated.center).toEqual({ x: 10, y: 20 });
      expect(translated.radius).toBe(5);
    });

    it('should preserve original circle', () => {
      const circle = CircleOps.create({ x: 0, y: 0 }, 5);
      const offset = { x: 10, y: 20 };
      CircleOps.translate(circle, offset);
      
      expect(circle.center).toEqual({ x: 0, y: 0 });
      expect(circle.radius).toBe(5);
    });

    it('should work with negative offset', () => {
      const circle = CircleOps.create({ x: 10, y: 20 }, 5);
      const offset = { x: -5, y: -10 };
      const translated = CircleOps.translate(circle, offset);
      
      expect(translated.center).toEqual({ x: 5, y: 10 });
    });
  });
});
