import { describe, it, expect } from 'vitest';
import { PolygonOps } from './polygon-algorithms';
import { PointOps } from './point-algorithms';

describe('PolygonOps', () => {
  const triangle = [
    { x: 0, y: 0 },
    { x: 10, y: 0 },
    { x: 5, y: 10 }
  ];

  const square = [
    { x: 0, y: 0 },
    { x: 10, y: 0 },
    { x: 10, y: 10 },
    { x: 0, y: 10 }
  ];

  describe('create', () => {
    it('should create a polygon with copied points', () => {
      const points = [{ x: 0, y: 0 }, { x: 10, y: 0 }];
      const polygon = PolygonOps.create(points);
      
      expect(polygon.points).toEqual(points);
      expect(polygon.points).not.toBe(points); // Should be a copy
    });

    it('should handle empty point array', () => {
      const polygon = PolygonOps.create([]);
      expect(polygon.points).toEqual([]);
    });
  });

  describe('area', () => {
    it('should calculate triangle area correctly', () => {
      const polygon = PolygonOps.create(triangle);
      const area = PolygonOps.area(polygon);
      
      expect(area).toBe(50); // (10 * 10) / 2
    });

    it('should calculate square area correctly', () => {
      const polygon = PolygonOps.create(square);
      const area = PolygonOps.area(polygon);
      
      expect(area).toBe(100); // 10 * 10
    });

    it('should return zero for polygon with less than 3 points', () => {
      const polygon = PolygonOps.create([{ x: 0, y: 0 }, { x: 10, y: 0 }]);
      expect(PolygonOps.area(polygon)).toBe(0);
    });

    it('should return zero for empty polygon', () => {
      const polygon = PolygonOps.create([]);
      expect(PolygonOps.area(polygon)).toBe(0);
    });

    it('should handle polygon with negative coordinates', () => {
      const points = [
        { x: -5, y: -5 },
        { x: 5, y: -5 },
        { x: 5, y: 5 },
        { x: -5, y: 5 }
      ];
      const polygon = PolygonOps.create(points);
      const area = PolygonOps.area(polygon);
      
      expect(area).toBe(100);
    });

    it('should handle complex polygon', () => {
      const points = [
        { x: 0, y: 0 },
        { x: 4, y: 0 },
        { x: 4, y: 2 },
        { x: 2, y: 2 },
        { x: 2, y: 4 },
        { x: 0, y: 4 }
      ];
      const polygon = PolygonOps.create(points);
      const area = PolygonOps.area(polygon);
      
      expect(area).toBe(12);
    });
  });

  describe('perimeter', () => {
    it('should calculate triangle perimeter correctly', () => {
      const polygon = PolygonOps.create(triangle);
      const perimeter = PolygonOps.perimeter(polygon);
      
      // Triangle with sides: 10, sqrt(125), sqrt(125)
      const expected = 10 + 2 * Math.sqrt(125);
      expect(perimeter).toBeCloseTo(expected, 5);
    });

    it('should calculate square perimeter correctly', () => {
      const polygon = PolygonOps.create(square);
      const perimeter = PolygonOps.perimeter(polygon);
      
      expect(perimeter).toBe(40); // 4 * 10
    });

    it('should return zero for polygon with less than 2 points', () => {
      const polygon = PolygonOps.create([{ x: 0, y: 0 }]);
      expect(PolygonOps.perimeter(polygon)).toBe(0);
    });

    it('should return zero for empty polygon', () => {
      const polygon = PolygonOps.create([]);
      expect(PolygonOps.perimeter(polygon)).toBe(0);
    });
  });

  describe('centroid', () => {
    it('should calculate triangle centroid correctly', () => {
      const polygon = PolygonOps.create(triangle);
      const centroid = PolygonOps.centroid(polygon);
      
      expect(centroid.x).toBeCloseTo(5, 5);
      expect(centroid.y).toBeCloseTo(3.333, 2);
    });

    it('should calculate square centroid correctly', () => {
      const polygon = PolygonOps.create(square);
      const centroid = PolygonOps.centroid(polygon);
      
      expect(centroid).toEqual({ x: 5, y: 5 });
    });

    it('should return zero point for empty polygon', () => {
      const polygon = PolygonOps.create([]);
      const centroid = PolygonOps.centroid(polygon);
      
      expect(centroid).toEqual({ x: 0, y: 0 });
    });

    it('should return the point for single-point polygon', () => {
      const polygon = PolygonOps.create([{ x: 5, y: 10 }]);
      const centroid = PolygonOps.centroid(polygon);
      
      expect(centroid).toEqual({ x: 5, y: 10 });
    });
  });

  describe('containsPoint', () => {
    it('should return true for point inside triangle', () => {
      const polygon = PolygonOps.create(triangle);
      const point = { x: 5, y: 3 };
      
      expect(PolygonOps.containsPoint(polygon, point)).toBe(true);
    });

    it('should return false for point outside triangle', () => {
      const polygon = PolygonOps.create(triangle);
      const point = { x: 15, y: 15 };
      
      expect(PolygonOps.containsPoint(polygon, point)).toBe(false);
    });

    it('should return true for point inside square', () => {
      const polygon = PolygonOps.create(square);
      const point = { x: 5, y: 5 };
      
      expect(PolygonOps.containsPoint(polygon, point)).toBe(true);
    });

    it('should return false for point outside square', () => {
      const polygon = PolygonOps.create(square);
      const point = { x: 15, y: 15 };
      
      expect(PolygonOps.containsPoint(polygon, point)).toBe(false);
    });

    it('should return false for polygon with less than 3 points', () => {
      const polygon = PolygonOps.create([{ x: 0, y: 0 }, { x: 10, y: 0 }]);
      const point = { x: 5, y: 0 };
      
      expect(PolygonOps.containsPoint(polygon, point)).toBe(false);
    });

    it('should handle point on polygon edge', () => {
      const polygon = PolygonOps.create(square);
      const point = { x: 5, y: 0 };
      
      expect(PolygonOps.containsPoint(polygon, point)).toBe(true);
    });

    it('should handle point at polygon vertex', () => {
      const polygon = PolygonOps.create(square);
      const point = { x: 0, y: 0 };
      
      expect(PolygonOps.containsPoint(polygon, point)).toBe(true);
    });
  });

  describe('boundingBox', () => {
    it('should calculate triangle bounding box correctly', () => {
      const polygon = PolygonOps.create(triangle);
      const bbox = PolygonOps.boundingBox(polygon);
      
      expect(bbox).toEqual({ x: 0, y: 0, width: 10, height: 10 });
    });

    it('should calculate square bounding box correctly', () => {
      const polygon = PolygonOps.create(square);
      const bbox = PolygonOps.boundingBox(polygon);
      
      expect(bbox).toEqual({ x: 0, y: 0, width: 10, height: 10 });
    });

    it('should return zero box for empty polygon', () => {
      const polygon = PolygonOps.create([]);
      const bbox = PolygonOps.boundingBox(polygon);
      
      expect(bbox).toEqual({ x: 0, y: 0, width: 0, height: 0 });
    });

    it('should handle polygon with negative coordinates', () => {
      const points = [
        { x: -5, y: -5 },
        { x: 5, y: -5 },
        { x: 5, y: 5 },
        { x: -5, y: 5 }
      ];
      const polygon = PolygonOps.create(points);
      const bbox = PolygonOps.boundingBox(polygon);
      
      expect(bbox).toEqual({ x: -5, y: -5, width: 10, height: 10 });
    });
  });

  describe('translate', () => {
    it('should move all points by offset', () => {
      const polygon = PolygonOps.create(triangle);
      const offset = { x: 10, y: 20 };
      const translated = PolygonOps.translate(polygon, offset);
      
      expect(translated.points[0]).toEqual({ x: 10, y: 20 });
      expect(translated.points[1]).toEqual({ x: 20, y: 20 });
      expect(translated.points[2]).toEqual({ x: 15, y: 30 });
    });

    it('should preserve original polygon', () => {
      const polygon = PolygonOps.create(triangle);
      const offset = { x: 10, y: 20 };
      PolygonOps.translate(polygon, offset);
      
      expect(polygon.points[0]).toEqual({ x: 0, y: 0 });
    });

    it('should work with negative offset', () => {
      const polygon = PolygonOps.create(square);
      const offset = { x: -5, y: -5 };
      const translated = PolygonOps.translate(polygon, offset);
      
      expect(translated.points[0]).toEqual({ x: -5, y: -5 });
      expect(translated.points[1]).toEqual({ x: 5, y: -5 });
    });
  });

  describe('scale', () => {
    it('should scale from origin when no center specified', () => {
      const polygon = PolygonOps.create(square);
      const scaled = PolygonOps.scale(polygon, 2);
      
      expect(scaled.points[0]).toEqual({ x: 0, y: 0 });
      expect(scaled.points[1]).toEqual({ x: 20, y: 0 });
      expect(scaled.points[2]).toEqual({ x: 20, y: 20 });
      expect(scaled.points[3]).toEqual({ x: 0, y: 20 });
    });

    it('should scale around specified center', () => {
      const polygon = PolygonOps.create(square);
      const center = { x: 5, y: 5 };
      const scaled = PolygonOps.scale(polygon, 2, center);
      
      expect(scaled.points[0]).toEqual({ x: -5, y: -5 });
      expect(scaled.points[1]).toEqual({ x: 15, y: -5 });
      expect(scaled.points[2]).toEqual({ x: 15, y: 15 });
      expect(scaled.points[3]).toEqual({ x: -5, y: 15 });
    });

    it('should preserve original polygon', () => {
      const polygon = PolygonOps.create(square);
      PolygonOps.scale(polygon, 2);
      
      expect(polygon.points[0]).toEqual({ x: 0, y: 0 });
    });

    it('should work with scale factor less than 1', () => {
      const polygon = PolygonOps.create(square);
      const scaled = PolygonOps.scale(polygon, 0.5);
      
      expect(scaled.points[0]).toEqual({ x: 0, y: 0 });
      expect(scaled.points[1]).toEqual({ x: 5, y: 0 });
      expect(scaled.points[2]).toEqual({ x: 5, y: 5 });
      expect(scaled.points[3]).toEqual({ x: 0, y: 5 });
    });

    it('should work with zero scale factor', () => {
      const polygon = PolygonOps.create(square);
      const center = { x: 5, y: 5 };
      const scaled = PolygonOps.scale(polygon, 0, center);
      
      expect(scaled.points[0]).toEqual({ x: 5, y: 5 });
      expect(scaled.points[1]).toEqual({ x: 5, y: 5 });
      expect(scaled.points[2]).toEqual({ x: 5, y: 5 });
      expect(scaled.points[3]).toEqual({ x: 5, y: 5 });
    });
  });
});
