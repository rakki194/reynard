import { describe, it, expect } from 'vitest';
import { LineOps } from './line-algorithms';
import { PointOps } from './point-algorithms';

describe('LineOps', () => {
  describe('create', () => {
    it('should create a line with start and end points', () => {
      const start = { x: 0, y: 0 };
      const end = { x: 10, y: 20 };
      const line = LineOps.create(start, end);
      
      expect(line.start).toEqual(start);
      expect(line.end).toEqual(end);
    });
  });

  describe('getLength', () => {
    it('should calculate length correctly', () => {
      const line = LineOps.create({ x: 0, y: 0 }, { x: 3, y: 4 });
      expect(LineOps.getLength(line)).toBe(5);
    });

    it('should calculate length for horizontal line', () => {
      const line = LineOps.create({ x: 0, y: 0 }, { x: 10, y: 0 });
      expect(LineOps.getLength(line)).toBe(10);
    });

    it('should calculate length for vertical line', () => {
      const line = LineOps.create({ x: 0, y: 0 }, { x: 0, y: 10 });
      expect(LineOps.getLength(line)).toBe(10);
    });

    it('should return zero for point line', () => {
      const line = LineOps.create({ x: 5, y: 5 }, { x: 5, y: 5 });
      expect(LineOps.getLength(line)).toBe(0);
    });
  });

  describe('getLengthSquared', () => {
    it('should calculate squared length correctly', () => {
      const line = LineOps.create({ x: 0, y: 0 }, { x: 3, y: 4 });
      expect(LineOps.getLengthSquared(line)).toBe(25);
    });

    it('should be faster than getLength for comparisons', () => {
      const line = LineOps.create({ x: 0, y: 0 }, { x: 3, y: 4 });
      const lengthSquared = LineOps.getLengthSquared(line);
      const length = LineOps.getLength(line);
      
      expect(lengthSquared).toBe(length * length);
    });
  });

  describe('midpoint', () => {
    it('should calculate midpoint correctly', () => {
      const line = LineOps.create({ x: 0, y: 0 }, { x: 10, y: 20 });
      const midpoint = LineOps.midpoint(line);
      
      expect(midpoint).toEqual({ x: 5, y: 10 });
    });

    it('should work with negative coordinates', () => {
      const line = LineOps.create({ x: -10, y: -20 }, { x: 10, y: 20 });
      const midpoint = LineOps.midpoint(line);
      
      expect(midpoint).toEqual({ x: 0, y: 0 });
    });

    it('should work for point line', () => {
      const line = LineOps.create({ x: 5, y: 5 }, { x: 5, y: 5 });
      const midpoint = LineOps.midpoint(line);
      
      expect(midpoint).toEqual({ x: 5, y: 5 });
    });
  });

  describe('direction', () => {
    it('should calculate direction vector correctly', () => {
      const line = LineOps.create({ x: 0, y: 0 }, { x: 3, y: 4 });
      const direction = LineOps.direction(line);
      
      expect(direction).toEqual({ x: 3, y: 4 });
    });

    it('should work with negative direction', () => {
      const line = LineOps.create({ x: 3, y: 4 }, { x: 0, y: 0 });
      const direction = LineOps.direction(line);
      
      expect(direction).toEqual({ x: -3, y: -4 });
    });

    it('should return zero vector for point line', () => {
      const line = LineOps.create({ x: 5, y: 5 }, { x: 5, y: 5 });
      const direction = LineOps.direction(line);
      
      expect(direction).toEqual({ x: 0, y: 0 });
    });
  });

  describe('normal', () => {
    it('should calculate normalized perpendicular vector', () => {
      const line = LineOps.create({ x: 0, y: 0 }, { x: 3, y: 0 });
      const normal = LineOps.normal(line);
      
      expect(normal.x).toBeCloseTo(0, 5);
      expect(normal.y).toBeCloseTo(1, 5);
    });

    it('should calculate normal for diagonal line', () => {
      const line = LineOps.create({ x: 0, y: 0 }, { x: 1, y: 1 });
      const normal = LineOps.normal(line);
      const magnitude = Math.sqrt(normal.x * normal.x + normal.y * normal.y);
      
      expect(magnitude).toBeCloseTo(1, 5);
    });

    it('should return zero vector for point line', () => {
      const line = LineOps.create({ x: 5, y: 5 }, { x: 5, y: 5 });
      const normal = LineOps.normal(line);
      
      expect(normal).toEqual({ x: 0, y: 0 });
    });
  });

  describe('pointAt', () => {
    it('should return start point at t=0', () => {
      const line = LineOps.create({ x: 0, y: 0 }, { x: 10, y: 20 });
      const point = LineOps.pointAt(line, 0);
      
      expect(point).toEqual({ x: 0, y: 0 });
    });

    it('should return end point at t=1', () => {
      const line = LineOps.create({ x: 0, y: 0 }, { x: 10, y: 20 });
      const point = LineOps.pointAt(line, 1);
      
      expect(point).toEqual({ x: 10, y: 20 });
    });

    it('should return midpoint at t=0.5', () => {
      const line = LineOps.create({ x: 0, y: 0 }, { x: 10, y: 20 });
      const point = LineOps.pointAt(line, 0.5);
      
      expect(point).toEqual({ x: 5, y: 10 });
    });

    it('should work with t outside [0,1] range', () => {
      const line = LineOps.create({ x: 0, y: 0 }, { x: 10, y: 20 });
      const point = LineOps.pointAt(line, 2);
      
      expect(point).toEqual({ x: 20, y: 40 });
    });
  });

  describe('distanceToPoint', () => {
    it('should return zero for point on line', () => {
      const line = LineOps.create({ x: 0, y: 0 }, { x: 10, y: 0 });
      const point = { x: 5, y: 0 };
      
      expect(LineOps.distanceToPoint(line, point)).toBe(0);
    });

    it('should return distance to closest point on line', () => {
      const line = LineOps.create({ x: 0, y: 0 }, { x: 10, y: 0 });
      const point = { x: 5, y: 3 };
      
      expect(LineOps.distanceToPoint(line, point)).toBe(3);
    });

    it('should return distance to start point when closest to start', () => {
      const line = LineOps.create({ x: 0, y: 0 }, { x: 10, y: 0 });
      const point = { x: -5, y: 0 };
      
      expect(LineOps.distanceToPoint(line, point)).toBe(5);
    });

    it('should return distance to end point when closest to end', () => {
      const line = LineOps.create({ x: 0, y: 0 }, { x: 10, y: 0 });
      const point = { x: 15, y: 0 };
      
      expect(LineOps.distanceToPoint(line, point)).toBe(5);
    });

    it('should handle point line', () => {
      const line = LineOps.create({ x: 5, y: 5 }, { x: 5, y: 5 });
      const point = { x: 0, y: 0 };
      
      expect(LineOps.distanceToPoint(line, point)).toBeCloseTo(7.071, 2);
    });
  });

  describe('intersects', () => {
    it('should return intersection point for crossing lines', () => {
      const line1 = LineOps.create({ x: 0, y: 0 }, { x: 10, y: 10 });
      const line2 = LineOps.create({ x: 0, y: 10 }, { x: 10, y: 0 });
      
      const intersection = LineOps.intersects(line1, line2);
      expect(intersection).toEqual({ x: 5, y: 5 });
    });

    it('should return null for parallel lines', () => {
      const line1 = LineOps.create({ x: 0, y: 0 }, { x: 10, y: 0 });
      const line2 = LineOps.create({ x: 0, y: 5 }, { x: 10, y: 5 });
      
      const intersection = LineOps.intersects(line1, line2);
      expect(intersection).toBeNull();
    });

    it('should return null for non-intersecting lines', () => {
      const line1 = LineOps.create({ x: 0, y: 0 }, { x: 5, y: 0 });
      const line2 = LineOps.create({ x: 0, y: 10 }, { x: 5, y: 10 });
      
      const intersection = LineOps.intersects(line1, line2);
      expect(intersection).toBeNull();
    });

    it('should return null when intersection is outside line segments', () => {
      const line1 = LineOps.create({ x: 0, y: 0 }, { x: 5, y: 0 });
      const line2 = LineOps.create({ x: 0, y: 5 }, { x: 5, y: 5 });
      
      const intersection = LineOps.intersects(line1, line2);
      expect(intersection).toBeNull();
    });

    it('should return intersection at line endpoints', () => {
      const line1 = LineOps.create({ x: 0, y: 0 }, { x: 10, y: 0 });
      const line2 = LineOps.create({ x: 0, y: 0 }, { x: 0, y: 10 });
      
      const intersection = LineOps.intersects(line1, line2);
      expect(intersection).toEqual({ x: 0, y: 0 });
    });

    it('should return null for identical lines (parallel)', () => {
      const line1 = LineOps.create({ x: 0, y: 0 }, { x: 10, y: 0 });
      const line2 = LineOps.create({ x: 0, y: 0 }, { x: 10, y: 0 });
      
      const intersection = LineOps.intersects(line1, line2);
      expect(intersection).toBeNull();
    });

    it('should return null for point lines (parallel)', () => {
      const line1 = LineOps.create({ x: 5, y: 5 }, { x: 5, y: 5 });
      const line2 = LineOps.create({ x: 5, y: 5 }, { x: 5, y: 5 });
      
      const intersection = LineOps.intersects(line1, line2);
      expect(intersection).toBeNull();
    });
  });
});
