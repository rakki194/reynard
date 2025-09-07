import { describe, it, expect } from 'vitest';
import { RectangleOps } from './rectangle-algorithms';
import { PointOps } from './point-algorithms';

describe('RectangleOps', () => {
  describe('create', () => {
    it('should create a rectangle with given parameters', () => {
      const rect = RectangleOps.create(10, 20, 100, 50);
      expect(rect.x).toBe(10);
      expect(rect.y).toBe(20);
      expect(rect.width).toBe(100);
      expect(rect.height).toBe(50);
    });
  });

  describe('fromPoints', () => {
    it('should create rectangle from two points', () => {
      const p1 = PointOps.create(0, 0);
      const p2 = PointOps.create(100, 50);
      const rect = RectangleOps.fromPoints(p1, p2);
      expect(rect.x).toBe(0);
      expect(rect.y).toBe(0);
      expect(rect.width).toBe(100);
      expect(rect.height).toBe(50);
    });

    it('should handle points in reverse order', () => {
      const p1 = PointOps.create(100, 50);
      const p2 = PointOps.create(0, 0);
      const rect = RectangleOps.fromPoints(p1, p2);
      expect(rect.x).toBe(100);
      expect(rect.y).toBe(50);
      expect(rect.width).toBe(-100);
      expect(rect.height).toBe(-50);
    });
  });

  describe('area', () => {
    it('should calculate rectangle area', () => {
      const rect = RectangleOps.create(0, 0, 10, 20);
      expect(RectangleOps.area(rect)).toBe(200);
    });

    it('should return 0 for zero-sized rectangle', () => {
      const rect = RectangleOps.create(0, 0, 0, 0);
      expect(RectangleOps.area(rect)).toBe(0);
    });
  });

  describe('perimeter', () => {
    it('should calculate rectangle perimeter', () => {
      const rect = RectangleOps.create(0, 0, 10, 20);
      expect(RectangleOps.perimeter(rect)).toBe(60);
    });
  });

  describe('center', () => {
    it('should calculate rectangle center', () => {
      const rect = RectangleOps.create(0, 0, 100, 50);
      const center = RectangleOps.center(rect);
      expect(center.x).toBe(50);
      expect(center.y).toBe(25);
    });
  });

  describe('corners', () => {
    it('should return correct corner points', () => {
      const rect = RectangleOps.create(10, 20, 100, 50);
      
      const topLeft = RectangleOps.topLeft(rect);
      expect(topLeft.x).toBe(10);
      expect(topLeft.y).toBe(20);
      
      const topRight = RectangleOps.topRight(rect);
      expect(topRight.x).toBe(110);
      expect(topRight.y).toBe(20);
      
      const bottomLeft = RectangleOps.bottomLeft(rect);
      expect(bottomLeft.x).toBe(10);
      expect(bottomLeft.y).toBe(70);
      
      const bottomRight = RectangleOps.bottomRight(rect);
      expect(bottomRight.x).toBe(110);
      expect(bottomRight.y).toBe(70);
    });
  });

  describe('containsPoint', () => {
    it('should return true for point inside rectangle', () => {
      const rect = RectangleOps.create(0, 0, 100, 50);
      const point = PointOps.create(50, 25);
      expect(RectangleOps.containsPoint(rect, point)).toBe(true);
    });

    it('should return false for point outside rectangle', () => {
      const rect = RectangleOps.create(0, 0, 100, 50);
      const point = PointOps.create(150, 75);
      expect(RectangleOps.containsPoint(rect, point)).toBe(false);
    });

    it('should return true for point on rectangle edge', () => {
      const rect = RectangleOps.create(0, 0, 100, 50);
      const point = PointOps.create(50, 0);
      expect(RectangleOps.containsPoint(rect, point)).toBe(true);
    });
  });

  describe('containsRectangle', () => {
    it('should return true when rectangle contains another', () => {
      const outer = RectangleOps.create(0, 0, 100, 100);
      const inner = RectangleOps.create(25, 25, 50, 50);
      expect(RectangleOps.containsRectangle(outer, inner)).toBe(true);
    });

    it('should return false when rectangle does not contain another', () => {
      const rect1 = RectangleOps.create(0, 0, 50, 50);
      const rect2 = RectangleOps.create(25, 25, 50, 50);
      expect(RectangleOps.containsRectangle(rect1, rect2)).toBe(false);
    });
  });

  describe('intersects', () => {
    it('should return true for intersecting rectangles', () => {
      const rect1 = RectangleOps.create(0, 0, 100, 100);
      const rect2 = RectangleOps.create(50, 50, 100, 100);
      expect(RectangleOps.intersects(rect1, rect2)).toBe(true);
    });

    it('should return false for non-intersecting rectangles', () => {
      const rect1 = RectangleOps.create(0, 0, 50, 50);
      const rect2 = RectangleOps.create(100, 100, 50, 50);
      expect(RectangleOps.intersects(rect1, rect2)).toBe(false);
    });
  });

  describe('intersection', () => {
    it('should return intersection of two rectangles', () => {
      const rect1 = RectangleOps.create(0, 0, 100, 100);
      const rect2 = RectangleOps.create(50, 50, 100, 100);
      const intersection = RectangleOps.intersection(rect1, rect2);
      expect(intersection.x).toBe(50);
      expect(intersection.y).toBe(50);
      expect(intersection.width).toBe(50);
      expect(intersection.height).toBe(50);
    });

    it('should return null for non-intersecting rectangles', () => {
      const rect1 = RectangleOps.create(0, 0, 50, 50);
      const rect2 = RectangleOps.create(100, 100, 50, 50);
      const intersection = RectangleOps.intersection(rect1, rect2);
      expect(intersection).toBeNull();
    });
  });

  describe('union', () => {
    it('should return union of two rectangles', () => {
      const rect1 = RectangleOps.create(0, 0, 50, 50);
      const rect2 = RectangleOps.create(25, 25, 50, 50);
      const union = RectangleOps.union(rect1, rect2);
      expect(union.x).toBe(0);
      expect(union.y).toBe(0);
      expect(union.width).toBe(75);
      expect(union.height).toBe(75);
    });
  });

  describe('expand', () => {
    it('should expand rectangle by given amount', () => {
      const rect = RectangleOps.create(10, 20, 100, 50);
      const expanded = RectangleOps.expand(rect, 5);
      expect(expanded.x).toBe(5);
      expect(expanded.y).toBe(15);
      expect(expanded.width).toBe(110);
      expect(expanded.height).toBe(60);
    });
  });

  describe('shrink', () => {
    it('should shrink rectangle by given amount', () => {
      const rect = RectangleOps.create(10, 20, 100, 50);
      const shrunk = RectangleOps.shrink(rect, 5);
      expect(shrunk.x).toBe(15);
      expect(shrunk.y).toBe(25);
      expect(shrunk.width).toBe(90);
      expect(shrunk.height).toBe(40);
    });
  });

  describe('translate', () => {
    it('should translate rectangle by given offset', () => {
      const rect = RectangleOps.create(10, 20, 100, 50);
      const offset = { x: 5, y: 10 };
      const translated = RectangleOps.translate(rect, offset);
      expect(translated.x).toBe(15);
      expect(translated.y).toBe(30);
      expect(translated.width).toBe(100);
      expect(translated.height).toBe(50);
    });
  });

  describe('scale', () => {
    it('should scale rectangle from center', () => {
      const rect = RectangleOps.create(0, 0, 100, 50);
      const scaled = RectangleOps.scale(rect, 2);
      expect(scaled.x).toBe(0);
      expect(scaled.y).toBe(0);
      expect(scaled.width).toBe(200);
      expect(scaled.height).toBe(100);
    });
  });
});
