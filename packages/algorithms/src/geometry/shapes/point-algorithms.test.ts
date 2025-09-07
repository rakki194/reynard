import { describe, it, expect } from 'vitest';
import { PointOps, type Point } from './point-algorithms';

describe('PointOps', () => {
  describe('create', () => {
    it('should create a point with given coordinates', () => {
      const point = PointOps.create(5, 10);
      expect(point.x).toBe(5);
      expect(point.y).toBe(10);
    });
  });

  describe('add', () => {
    it('should add two points correctly', () => {
      const a = PointOps.create(1, 2);
      const b = PointOps.create(3, 4);
      const result = PointOps.add(a, b);
      expect(result.x).toBe(4);
      expect(result.y).toBe(6);
    });
  });

  describe('subtract', () => {
    it('should subtract two points correctly', () => {
      const a = PointOps.create(5, 8);
      const b = PointOps.create(2, 3);
      const result = PointOps.subtract(a, b);
      expect(result.x).toBe(3);
      expect(result.y).toBe(5);
    });
  });

  describe('multiply', () => {
    it('should multiply point by scalar correctly', () => {
      const point = PointOps.create(2, 3);
      const result = PointOps.multiply(point, 4);
      expect(result.x).toBe(8);
      expect(result.y).toBe(12);
    });
  });

  describe('divide', () => {
    it('should divide point by scalar correctly', () => {
      const point = PointOps.create(8, 12);
      const result = PointOps.divide(point, 4);
      expect(result.x).toBe(2);
      expect(result.y).toBe(3);
    });

    it('should throw error when dividing by zero', () => {
      const point = PointOps.create(1, 2);
      expect(() => PointOps.divide(point, 0)).toThrow('Division by zero');
    });
  });

  describe('distance', () => {
    it('should calculate distance between two points', () => {
      const a = PointOps.create(0, 0);
      const b = PointOps.create(3, 4);
      const result = PointOps.distance(a, b);
      expect(result).toBe(5);
    });

    it('should return 0 for same points', () => {
      const a = PointOps.create(5, 5);
      const b = PointOps.create(5, 5);
      const result = PointOps.distance(a, b);
      expect(result).toBe(0);
    });
  });

  describe('distanceSquared', () => {
    it('should calculate squared distance between two points', () => {
      const a = PointOps.create(0, 0);
      const b = PointOps.create(3, 4);
      const result = PointOps.distanceSquared(a, b);
      expect(result).toBe(25);
    });
  });

  describe('midpoint', () => {
    it('should calculate midpoint between two points', () => {
      const a = PointOps.create(0, 0);
      const b = PointOps.create(4, 6);
      const result = PointOps.midpoint(a, b);
      expect(result.x).toBe(2);
      expect(result.y).toBe(3);
    });
  });

  describe('lerp', () => {
    it('should interpolate between two points', () => {
      const a = PointOps.create(0, 0);
      const b = PointOps.create(10, 20);
      const result = PointOps.lerp(a, b, 0.5);
      expect(result.x).toBe(5);
      expect(result.y).toBe(10);
    });

    it('should return first point at t=0', () => {
      const a = PointOps.create(1, 2);
      const b = PointOps.create(5, 6);
      const result = PointOps.lerp(a, b, 0);
      expect(result.x).toBe(1);
      expect(result.y).toBe(2);
    });

    it('should return second point at t=1', () => {
      const a = PointOps.create(1, 2);
      const b = PointOps.create(5, 6);
      const result = PointOps.lerp(a, b, 1);
      expect(result.x).toBe(5);
      expect(result.y).toBe(6);
    });
  });

  describe('equals', () => {
    it('should return true for equal points', () => {
      const a = PointOps.create(1.5, 2.5);
      const b = PointOps.create(1.5, 2.5);
      expect(PointOps.equals(a, b)).toBe(true);
    });

    it('should return false for different points', () => {
      const a = PointOps.create(1, 2);
      const b = PointOps.create(1, 3);
      expect(PointOps.equals(a, b)).toBe(false);
    });

    it('should handle floating point precision', () => {
      const a = PointOps.create(0.1 + 0.2, 0.3);
      const b = PointOps.create(0.3, 0.3);
      expect(PointOps.equals(a, b)).toBe(true);
    });
  });

  describe('clone', () => {
    it('should create a copy of the point', () => {
      const original = PointOps.create(3, 7);
      const cloned = PointOps.clone(original);
      expect(cloned.x).toBe(3);
      expect(cloned.y).toBe(7);
      expect(cloned).not.toBe(original);
    });
  });
});
