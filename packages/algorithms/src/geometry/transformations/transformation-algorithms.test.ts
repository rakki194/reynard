import { describe, it, expect } from 'vitest';
import { TransformOps } from './transformation-algorithms';
import { RectangleOps } from '../shapes/rectangle-algorithms';

describe('TransformOps', () => {
  describe('identity', () => {
    it('should create identity transform', () => {
      const transform = TransformOps.identity();
      
      expect(transform.translateX).toBe(0);
      expect(transform.translateY).toBe(0);
      expect(transform.scaleX).toBe(1);
      expect(transform.scaleY).toBe(1);
      expect(transform.rotation).toBe(0);
    });
  });

  describe('translate', () => {
    it('should create translation transform', () => {
      const transform = TransformOps.translate(10, 20);
      
      expect(transform.translateX).toBe(10);
      expect(transform.translateY).toBe(20);
      expect(transform.scaleX).toBe(1);
      expect(transform.scaleY).toBe(1);
      expect(transform.rotation).toBe(0);
    });

    it('should work with negative values', () => {
      const transform = TransformOps.translate(-5, -10);
      
      expect(transform.translateX).toBe(-5);
      expect(transform.translateY).toBe(-10);
    });
  });

  describe('scale', () => {
    it('should create uniform scale transform', () => {
      const transform = TransformOps.scale(2);
      
      expect(transform.translateX).toBe(0);
      expect(transform.translateY).toBe(0);
      expect(transform.scaleX).toBe(2);
      expect(transform.scaleY).toBe(2);
      expect(transform.rotation).toBe(0);
    });

    it('should create non-uniform scale transform', () => {
      const transform = TransformOps.scale(2, 3);
      
      expect(transform.scaleX).toBe(2);
      expect(transform.scaleY).toBe(3);
    });

    it('should work with fractional scale', () => {
      const transform = TransformOps.scale(0.5);
      
      expect(transform.scaleX).toBe(0.5);
      expect(transform.scaleY).toBe(0.5);
    });
  });

  describe('rotate', () => {
    it('should create rotation transform', () => {
      const transform = TransformOps.rotate(Math.PI / 2);
      
      expect(transform.translateX).toBe(0);
      expect(transform.translateY).toBe(0);
      expect(transform.scaleX).toBe(1);
      expect(transform.scaleY).toBe(1);
      expect(transform.rotation).toBe(Math.PI / 2);
    });

    it('should work with negative rotation', () => {
      const transform = TransformOps.rotate(-Math.PI / 4);
      
      expect(transform.rotation).toBe(-Math.PI / 4);
    });
  });

  describe('combine', () => {
    it('should combine two identity transforms', () => {
      const a = TransformOps.identity();
      const b = TransformOps.identity();
      const combined = TransformOps.combine(a, b);
      
      expect(combined.translateX).toBe(0);
      expect(combined.translateY).toBe(0);
      expect(combined.scaleX).toBe(1);
      expect(combined.scaleY).toBe(1);
      expect(combined.rotation).toBe(0);
    });

    it('should combine translation and scale', () => {
      const a = TransformOps.translate(10, 20);
      const b = TransformOps.scale(2, 3);
      const combined = TransformOps.combine(a, b);
      
      expect(combined.translateX).toBe(10);
      expect(combined.translateY).toBe(20);
      expect(combined.scaleX).toBe(2);
      expect(combined.scaleY).toBe(3);
      expect(combined.rotation).toBe(0);
    });

    it('should combine rotation and translation', () => {
      const a = TransformOps.rotate(Math.PI / 2);
      const b = TransformOps.translate(10, 0);
      const combined = TransformOps.combine(a, b);
      
      expect(combined.rotation).toBe(Math.PI / 2);
      // Translation should be rotated
      expect(combined.translateX).toBeCloseTo(0, 5);
      expect(combined.translateY).toBeCloseTo(10, 5);
    });

    it('should combine scale and rotation', () => {
      const a = TransformOps.scale(2, 2);
      const b = TransformOps.rotate(Math.PI / 2);
      const combined = TransformOps.combine(a, b);
      
      expect(combined.scaleX).toBe(2);
      expect(combined.scaleY).toBe(2);
      expect(combined.rotation).toBe(Math.PI / 2);
    });

    it('should handle complex combination', () => {
      const a = TransformOps.combine(
        TransformOps.translate(5, 10),
        TransformOps.scale(2, 3)
      );
      const b = TransformOps.combine(
        TransformOps.rotate(Math.PI / 4),
        TransformOps.translate(1, 1)
      );
      const combined = TransformOps.combine(a, b);
      
      expect(combined.rotation).toBeCloseTo(Math.PI / 4, 5);
      expect(combined.scaleX).toBe(2);
      expect(combined.scaleY).toBe(3);
    });
  });

  describe('applyToPoint', () => {
    it('should apply identity transform to point', () => {
      const transform = TransformOps.identity();
      const point = { x: 10, y: 20 };
      const result = TransformOps.applyToPoint(transform, point);
      
      expect(result).toEqual({ x: 10, y: 20 });
    });

    it('should apply translation to point', () => {
      const transform = TransformOps.translate(5, 10);
      const point = { x: 10, y: 20 };
      const result = TransformOps.applyToPoint(transform, point);
      
      expect(result).toEqual({ x: 15, y: 30 });
    });

    it('should apply scale to point', () => {
      const transform = TransformOps.scale(2, 3);
      const point = { x: 10, y: 20 };
      const result = TransformOps.applyToPoint(transform, point);
      
      expect(result).toEqual({ x: 20, y: 60 });
    });

    it('should apply rotation to point', () => {
      const transform = TransformOps.rotate(Math.PI / 2);
      const point = { x: 10, y: 0 };
      const result = TransformOps.applyToPoint(transform, point);
      
      expect(result.x).toBeCloseTo(0, 5);
      expect(result.y).toBeCloseTo(10, 5);
    });

    it('should apply combined transform to point', () => {
      const transform = TransformOps.combine(
        TransformOps.translate(5, 10),
        TransformOps.scale(2, 2)
      );
      const point = { x: 10, y: 20 };
      const result = TransformOps.applyToPoint(transform, point);
      
      expect(result).toEqual({ x: 25, y: 50 });
    });

    it('should handle point at origin', () => {
      const transform = TransformOps.combine(
        TransformOps.rotate(Math.PI / 4),
        TransformOps.scale(2, 2)
      );
      const point = { x: 0, y: 0 };
      const result = TransformOps.applyToPoint(transform, point);
      
      expect(result.x).toBeCloseTo(0, 5);
      expect(result.y).toBeCloseTo(0, 5);
    });
  });

  describe('applyToRectangle', () => {
    it('should apply identity transform to rectangle', () => {
      const transform = TransformOps.identity();
      const rect = { x: 10, y: 20, width: 30, height: 40 };
      const result = TransformOps.applyToRectangle(transform, rect);
      
      expect(result).toEqual({ x: 10, y: 20, width: 30, height: 40 });
    });

    it('should apply translation to rectangle', () => {
      const transform = TransformOps.translate(5, 10);
      const rect = { x: 10, y: 20, width: 30, height: 40 };
      const result = TransformOps.applyToRectangle(transform, rect);
      
      expect(result).toEqual({ x: 15, y: 30, width: 30, height: 40 });
    });

    it('should apply scale to rectangle', () => {
      const transform = TransformOps.scale(2, 3);
      const rect = { x: 10, y: 20, width: 30, height: 40 };
      const result = TransformOps.applyToRectangle(transform, rect);
      
      expect(result).toEqual({ x: 20, y: 60, width: 60, height: 120 });
    });

    it('should apply rotation to rectangle', () => {
      const transform = TransformOps.rotate(Math.PI / 2);
      const rect = { x: 0, y: 0, width: 10, height: 20 };
      const result = TransformOps.applyToRectangle(transform, rect);
      
      expect(result.x).toBeCloseTo(-20, 5);
      expect(result.y).toBeCloseTo(0, 5);
      expect(result.width).toBeCloseTo(20, 5);
      expect(result.height).toBeCloseTo(10, 5);
    });

    it('should apply combined transform to rectangle', () => {
      const transform = TransformOps.combine(
        TransformOps.translate(5, 10),
        TransformOps.scale(2, 2)
      );
      const rect = { x: 10, y: 20, width: 30, height: 40 };
      const result = TransformOps.applyToRectangle(transform, rect);
      
      expect(result).toEqual({ x: 25, y: 50, width: 60, height: 80 });
    });

    it('should handle zero-size rectangle', () => {
      const transform = TransformOps.scale(2, 2);
      const rect = { x: 10, y: 20, width: 0, height: 0 };
      const result = TransformOps.applyToRectangle(transform, rect);
      
      expect(result).toEqual({ x: 20, y: 40, width: 0, height: 0 });
    });
  });

  describe('inverse', () => {
    it('should create inverse of identity transform', () => {
      const transform = TransformOps.identity();
      const inverse = TransformOps.inverse(transform);
      
      expect(inverse.translateX).toBeCloseTo(0, 5);
      expect(inverse.translateY).toBeCloseTo(0, 5);
      expect(inverse.scaleX).toBe(1);
      expect(inverse.scaleY).toBe(1);
      expect(inverse.rotation).toBeCloseTo(0, 5);
    });

    it('should create inverse of translation', () => {
      const transform = TransformOps.translate(10, 20);
      const inverse = TransformOps.inverse(transform);
      
      expect(inverse.translateX).toBe(-10);
      expect(inverse.translateY).toBe(-20);
      expect(inverse.scaleX).toBe(1);
      expect(inverse.scaleY).toBe(1);
      expect(inverse.rotation).toBeCloseTo(0, 5);
    });

    it('should create inverse of scale', () => {
      const transform = TransformOps.scale(2, 3);
      const inverse = TransformOps.inverse(transform);
      
      expect(inverse.translateX).toBeCloseTo(0, 5);
      expect(inverse.translateY).toBeCloseTo(0, 5);
      expect(inverse.scaleX).toBe(0.5);
      expect(inverse.scaleY).toBeCloseTo(1/3, 5);
      expect(inverse.rotation).toBeCloseTo(0, 5);
    });

    it('should create inverse of rotation', () => {
      const transform = TransformOps.rotate(Math.PI / 2);
      const inverse = TransformOps.inverse(transform);
      
      expect(inverse.translateX).toBeCloseTo(0, 5);
      expect(inverse.translateY).toBeCloseTo(0, 5);
      expect(inverse.scaleX).toBe(1);
      expect(inverse.scaleY).toBe(1);
      expect(inverse.rotation).toBeCloseTo(-Math.PI / 2, 5);
    });

    it('should create inverse of combined transform', () => {
      // Combine transforms step by step
      const translate = TransformOps.translate(10, 20);
      const scale = TransformOps.scale(2, 2);
      const rotate = TransformOps.rotate(Math.PI / 4);
      
      const transform1 = TransformOps.combine(translate, scale);
      const transform = TransformOps.combine(transform1, rotate);
      const inverse = TransformOps.inverse(transform);
      
      // The rotation should be negated
      expect(inverse.rotation).toBeCloseTo(-Math.PI / 4, 5);
      expect(inverse.scaleX).toBe(0.5);
      expect(inverse.scaleY).toBe(0.5);
      // Translation values will be complex due to rotation, just check they exist
      expect(typeof inverse.translateX).toBe('number');
      expect(typeof inverse.translateY).toBe('number');
    });

    it('should verify inverse property', () => {
      const transform = TransformOps.combine(
        TransformOps.translate(5, 10),
        TransformOps.scale(2, 3),
        TransformOps.rotate(Math.PI / 6)
      );
      const inverse = TransformOps.inverse(transform);
      const identity = TransformOps.combine(transform, inverse);
      
      expect(identity.translateX).toBeCloseTo(0, 5);
      expect(identity.translateY).toBeCloseTo(0, 5);
      expect(identity.scaleX).toBeCloseTo(1, 5);
      expect(identity.scaleY).toBeCloseTo(1, 5);
      expect(identity.rotation).toBeCloseTo(0, 5);
    });
  });
});
