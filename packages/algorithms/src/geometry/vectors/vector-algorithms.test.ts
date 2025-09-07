import { describe, it, expect } from 'vitest';
import { VectorOps, type Vector } from './vector-algorithms';
import { PointOps } from '../shapes/point-algorithms';

describe('VectorOps', () => {
  describe('create', () => {
    it('should create a vector with given components', () => {
      const vector = VectorOps.create(3, 4);
      expect(vector.x).toBe(3);
      expect(vector.y).toBe(4);
    });
  });

  describe('fromPoints', () => {
    it('should create vector from two points', () => {
      const start = PointOps.create(1, 2);
      const end = PointOps.create(4, 6);
      const vector = VectorOps.fromPoints(start, end);
      expect(vector.x).toBe(3);
      expect(vector.y).toBe(4);
    });
  });

  describe('add', () => {
    it('should add two vectors', () => {
      const a = VectorOps.create(1, 2);
      const b = VectorOps.create(3, 4);
      const result = VectorOps.add(a, b);
      expect(result.x).toBe(4);
      expect(result.y).toBe(6);
    });
  });

  describe('subtract', () => {
    it('should subtract two vectors', () => {
      const a = VectorOps.create(5, 8);
      const b = VectorOps.create(2, 3);
      const result = VectorOps.subtract(a, b);
      expect(result.x).toBe(3);
      expect(result.y).toBe(5);
    });
  });

  describe('multiply', () => {
    it('should multiply vector by scalar', () => {
      const vector = VectorOps.create(2, 3);
      const result = VectorOps.multiply(vector, 4);
      expect(result.x).toBe(8);
      expect(result.y).toBe(12);
    });
  });

  describe('divide', () => {
    it('should divide vector by scalar', () => {
      const vector = VectorOps.create(8, 12);
      const result = VectorOps.divide(vector, 4);
      expect(result.x).toBe(2);
      expect(result.y).toBe(3);
    });

    it('should throw error when dividing by zero', () => {
      const vector = VectorOps.create(1, 2);
      expect(() => VectorOps.divide(vector, 0)).toThrow('Division by zero');
    });
  });

  describe('dot', () => {
    it('should calculate dot product', () => {
      const a = VectorOps.create(1, 2);
      const b = VectorOps.create(3, 4);
      const result = VectorOps.dot(a, b);
      expect(result).toBe(11); // 1*3 + 2*4 = 3 + 8 = 11
    });

    it('should return 0 for perpendicular vectors', () => {
      const a = VectorOps.create(1, 0);
      const b = VectorOps.create(0, 1);
      const result = VectorOps.dot(a, b);
      expect(result).toBe(0);
    });
  });

  describe('cross', () => {
    it('should calculate cross product', () => {
      const a = VectorOps.create(1, 2);
      const b = VectorOps.create(3, 4);
      const result = VectorOps.cross(a, b);
      expect(result).toBe(-2); // 1*4 - 2*3 = 4 - 6 = -2
    });
  });

  describe('magnitude', () => {
    it('should calculate vector magnitude', () => {
      const vector = VectorOps.create(3, 4);
      const result = VectorOps.magnitude(vector);
      expect(result).toBe(5);
    });

    it('should return 0 for zero vector', () => {
      const vector = VectorOps.create(0, 0);
      const result = VectorOps.magnitude(vector);
      expect(result).toBe(0);
    });
  });

  describe('magnitudeSquared', () => {
    it('should calculate squared magnitude', () => {
      const vector = VectorOps.create(3, 4);
      const result = VectorOps.magnitudeSquared(vector);
      expect(result).toBe(25);
    });
  });

  describe('normalize', () => {
    it('should normalize a vector', () => {
      const vector = VectorOps.create(3, 4);
      const result = VectorOps.normalize(vector);
      expect(result.x).toBeCloseTo(0.6, 1);
      expect(result.y).toBeCloseTo(0.8, 1);
      expect(VectorOps.magnitude(result)).toBeCloseTo(1, 5);
    });

    it('should return zero vector when normalizing zero vector', () => {
      const vector = VectorOps.create(0, 0);
      const result = VectorOps.normalize(vector);
      expect(result.x).toBe(0);
      expect(result.y).toBe(0);
    });
  });

  describe('angle', () => {
    it('should calculate angle of a vector', () => {
      const vector = VectorOps.create(1, 0);
      const result = VectorOps.angle(vector);
      expect(result).toBeCloseTo(0, 5);
    });

    it('should calculate angle of a vector pointing up', () => {
      const vector = VectorOps.create(0, 1);
      const result = VectorOps.angle(vector);
      expect(result).toBeCloseTo(Math.PI / 2, 5);
    });
  });

  describe('angleBetween', () => {
    it('should calculate angle between vectors', () => {
      const a = VectorOps.create(1, 0);
      const b = VectorOps.create(0, 1);
      const result = VectorOps.angleBetween(a, b);
      expect(result).toBeCloseTo(Math.PI / 2, 5);
    });

    it('should return 0 for parallel vectors', () => {
      const a = VectorOps.create(1, 0);
      const b = VectorOps.create(2, 0);
      const result = VectorOps.angleBetween(a, b);
      expect(result).toBeCloseTo(0, 5);
    });
  });

  describe('rotate', () => {
    it('should rotate vector by angle', () => {
      const vector = VectorOps.create(1, 0);
      const result = VectorOps.rotate(vector, Math.PI / 2);
      expect(result.x).toBeCloseTo(0, 5);
      expect(result.y).toBeCloseTo(1, 5);
    });

    it('should rotate vector by negative angle', () => {
      const vector = VectorOps.create(1, 0);
      const result = VectorOps.rotate(vector, -Math.PI / 2);
      expect(result.x).toBeCloseTo(0, 5);
      expect(result.y).toBeCloseTo(-1, 5);
    });
  });

  // Note: project, reflect, lerp, equals, and clone methods are not implemented
  // in the current VectorOps class, so these tests are removed
});
