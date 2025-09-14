/**
 * Polygon Editor Tests
 *
 * Test suite for the usePolygonEditor composable.
 */

import { describe, it, expect, beforeEach } from "vitest";
import { usePolygonEditor } from "../composables/usePolygonEditor.js";
import { SegmentationEditorConfig } from "../types/index.js";
import { PolygonOps, type Point, type Polygon } from "reynard-algorithms";

describe("usePolygonEditor", () => {
  let config: SegmentationEditorConfig;
  let polygonEditor: ReturnType<typeof usePolygonEditor>;

  beforeEach(() => {
    config = {
      enabled: true,
      showGrid: true,
      gridSize: 20,
      snapToGrid: true,
      showVertices: true,
      vertexSize: 8,
      showEdges: true,
      edgeThickness: 2,
      showFill: true,
      fillOpacity: 0.3,
      showBoundingBox: false,
      allowVertexEdit: true,
      allowEdgeEdit: true,
      allowPolygonCreation: true,
      allowPolygonDeletion: true,
      maxPolygons: 50,
      minPolygonArea: 100,
      maxPolygonArea: 1000000,
    };

    polygonEditor = usePolygonEditor({
      config,
      onPolygonChange: vi.fn(),
    });
  });

  describe("Vertex Operations", () => {
    it("should add vertex to polygon", () => {
      const polygon: Polygon = {
        points: [
          { x: 0, y: 0 },
          { x: 100, y: 0 },
          { x: 100, y: 100 },
        ],
      };

      const newPoint: Point = { x: 0, y: 100 };
      const result = polygonEditor.addVertex(polygon, newPoint);

      expect(result.points).toHaveLength(4);
      expect(result.points[3]).toEqual(newPoint);
    });

    it("should add vertex at specific index", () => {
      const polygon: Polygon = {
        points: [
          { x: 0, y: 0 },
          { x: 100, y: 0 },
          { x: 100, y: 100 },
        ],
      };

      const newPoint: Point = { x: 50, y: 50 };
      const result = polygonEditor.addVertex(polygon, newPoint, 1);

      expect(result.points).toHaveLength(4);
      expect(result.points[1]).toEqual(newPoint);
      expect(result.points[2]).toEqual({ x: 100, y: 0 });
    });

    it("should remove vertex from polygon", () => {
      const polygon: Polygon = {
        points: [
          { x: 0, y: 0 },
          { x: 100, y: 0 },
          { x: 100, y: 100 },
          { x: 0, y: 100 },
        ],
      };

      const result = polygonEditor.removeVertex(polygon, 1);

      expect(result.points).toHaveLength(3);
      expect(result.points[1]).toEqual({ x: 100, y: 100 });
    });

    it("should not remove vertex if polygon would become invalid", () => {
      const polygon: Polygon = {
        points: [
          { x: 0, y: 0 },
          { x: 100, y: 0 },
          { x: 100, y: 100 },
        ],
      };

      const result = polygonEditor.removeVertex(polygon, 0);

      // Should return original polygon since removing would make it invalid
      expect(result).toEqual(polygon);
    });

    it("should move vertex to new position", () => {
      const polygon: Polygon = {
        points: [
          { x: 0, y: 0 },
          { x: 100, y: 0 },
          { x: 100, y: 100 },
        ],
      };

      const newPosition: Point = { x: 50, y: 50 };
      const result = polygonEditor.moveVertex(polygon, 1, newPosition);

      expect(result.points[1]).toEqual(newPosition);
    });

    it("should insert vertex on edge", () => {
      const polygon: Polygon = {
        points: [
          { x: 0, y: 0 },
          { x: 100, y: 0 },
          { x: 100, y: 100 },
        ],
      };

      const newPoint: Point = { x: 50, y: 0 };
      const result = polygonEditor.insertVertex(polygon, 0, newPoint);

      expect(result.points).toHaveLength(4);
      expect(result.points[1]).toEqual(newPoint);
    });
  });

  describe("Geometric Operations", () => {
    it("should simplify polygon", () => {
      const polygon: Polygon = {
        points: [
          { x: 0, y: 0 },
          { x: 10, y: 0 },
          { x: 20, y: 0 },
          { x: 30, y: 0 },
          { x: 100, y: 0 },
          { x: 100, y: 100 },
          { x: 0, y: 100 },
        ],
      };

      const result = polygonEditor.simplifyPolygon(polygon, 5.0);

      expect(result.points.length).toBeLessThanOrEqual(polygon.points.length);
      expect(result.points.length).toBeGreaterThanOrEqual(3);
    });

    it("should smooth polygon", () => {
      const polygon: Polygon = {
        points: [
          { x: 0, y: 0 },
          { x: 50, y: 10 },
          { x: 100, y: 0 },
          { x: 100, y: 100 },
          { x: 0, y: 100 },
        ],
      };

      const result = polygonEditor.smoothPolygon(polygon, 2);

      expect(result.points).toHaveLength(5);
      // Smoothing should reduce sharp angles - after 2 iterations, the y value should be much smaller
      expect(result.points[1].y).toBeLessThan(5);
    });

    it("should scale polygon", () => {
      const polygon: Polygon = {
        points: [
          { x: 0, y: 0 },
          { x: 100, y: 0 },
          { x: 100, y: 100 },
          { x: 0, y: 100 },
        ],
      };

      const result = polygonEditor.scalePolygon(polygon, 2.0);

      // Scaling by 2 around center (50,50): (100,0) becomes (150,-50)
      expect(result.points[1].x).toBe(150);
      expect(result.points[1].y).toBe(-50);
    });

    it("should rotate polygon", () => {
      const polygon: Polygon = {
        points: [
          { x: 0, y: 0 },
          { x: 100, y: 0 },
          { x: 100, y: 100 },
          { x: 0, y: 100 },
        ],
      };

      const result = polygonEditor.rotatePolygon(polygon, Math.PI / 2);

      // After 90-degree rotation around center (50,50), (0,0) becomes (100,0)
      expect(result.points[0].x).toBeCloseTo(100);
      expect(result.points[0].y).toBeCloseTo(0);
    });

    it("should translate polygon", () => {
      const polygon: Polygon = {
        points: [
          { x: 0, y: 0 },
          { x: 100, y: 0 },
          { x: 100, y: 100 },
          { x: 0, y: 100 },
        ],
      };

      const offset: Point = { x: 50, y: 25 };
      const result = polygonEditor.translatePolygon(polygon, offset);

      expect(result.points[0]).toEqual({ x: 50, y: 25 });
      expect(result.points[1]).toEqual({ x: 150, y: 25 });
    });
  });

  describe("Validation and Utilities", () => {
    it("should validate valid polygon", () => {
      const validPolygon: Polygon = {
        points: [
          { x: 0, y: 0 },
          { x: 100, y: 0 },
          { x: 100, y: 100 },
          { x: 0, y: 100 },
        ],
      };

      expect(polygonEditor.validatePolygon(validPolygon)).toBe(true);
    });

    it("should reject invalid polygon", () => {
      const invalidPolygon: Polygon = {
        points: [
          { x: 0, y: 0 },
          { x: 100, y: 0 },
          // Missing third point
        ],
      };

      expect(polygonEditor.validatePolygon(invalidPolygon)).toBe(false);
    });

    it("should reject polygon with zero area", () => {
      const zeroAreaPolygon: Polygon = {
        points: [
          { x: 0, y: 0 },
          { x: 0, y: 0 },
          { x: 0, y: 0 },
        ],
      };

      expect(polygonEditor.validatePolygon(zeroAreaPolygon)).toBe(false);
    });

    it("should get polygon center", () => {
      const polygon: Polygon = {
        points: [
          { x: 0, y: 0 },
          { x: 100, y: 0 },
          { x: 100, y: 100 },
          { x: 0, y: 100 },
        ],
      };

      const center = polygonEditor.getPolygonCenter(polygon);

      expect(center.x).toBe(50);
      expect(center.y).toBe(50);
    });

    it("should get polygon bounds", () => {
      const polygon: Polygon = {
        points: [
          { x: 10, y: 20 },
          { x: 100, y: 30 },
          { x: 50, y: 80 },
        ],
      };

      const bounds = polygonEditor.getPolygonBounds(polygon);

      expect(bounds.min.x).toBe(10);
      expect(bounds.min.y).toBe(20);
      expect(bounds.max.x).toBe(100);
      expect(bounds.max.y).toBe(80);
    });

    it("should check if point is in polygon", () => {
      const polygon: Polygon = {
        points: [
          { x: 0, y: 0 },
          { x: 100, y: 0 },
          { x: 100, y: 100 },
          { x: 0, y: 100 },
        ],
      };

      const insidePoint: Point = { x: 50, y: 50 };
      const outsidePoint: Point = { x: 150, y: 150 };

      expect(polygonEditor.isPointInPolygon(polygon, insidePoint)).toBe(true);
      expect(polygonEditor.isPointInPolygon(polygon, outsidePoint)).toBe(false);
    });

    it("should find closest vertex", () => {
      const polygon: Polygon = {
        points: [
          { x: 0, y: 0 },
          { x: 100, y: 0 },
          { x: 100, y: 100 },
          { x: 0, y: 100 },
        ],
      };

      const testPoint: Point = { x: 10, y: 10 };
      const result = polygonEditor.getClosestVertex(polygon, testPoint);

      expect(result.index).toBe(0);
      expect(result.distance).toBeCloseTo(14.14, 1);
    });

    it("should find closest edge", () => {
      const polygon: Polygon = {
        points: [
          { x: 0, y: 0 },
          { x: 100, y: 0 },
          { x: 100, y: 100 },
          { x: 0, y: 100 },
        ],
      };

      const testPoint: Point = { x: 50, y: 10 };
      const result = polygonEditor.getClosestEdge(polygon, testPoint);

      expect(result.index).toBe(0);
      expect(result.distance).toBeCloseTo(10, 1);
      expect(result.point.x).toBe(50);
      expect(result.point.y).toBe(0);
    });
  });

  describe("Area Constraints", () => {
    it("should reject polygon below minimum area", () => {
      const smallPolygon: Polygon = {
        points: [
          { x: 0, y: 0 },
          { x: 5, y: 0 },
          { x: 5, y: 5 },
          { x: 0, y: 5 },
        ],
      };

      expect(polygonEditor.validatePolygon(smallPolygon)).toBe(false);
    });

    it("should reject polygon above maximum area", () => {
      const largePolygon: Polygon = {
        points: [
          { x: 0, y: 0 },
          { x: 2000, y: 0 },
          { x: 2000, y: 2000 },
          { x: 0, y: 2000 },
        ],
      };

      expect(polygonEditor.validatePolygon(largePolygon)).toBe(false);
    });
  });

  describe("Cleanup", () => {
    it("should cleanup resources", () => {
      expect(() => polygonEditor.cleanup()).not.toThrow();
    });
  });
});





