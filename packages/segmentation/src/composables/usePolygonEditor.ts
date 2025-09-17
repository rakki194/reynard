/**
 * Polygon Editor Composable
 *
 * Composable for managing polygon editing operations including vertex
 * manipulation, edge editing, and geometric transformations.
 * Leverages reynard-algorithms for robust geometric operations.
 */

import { createSignal, createEffect, onCleanup } from "solid-js";
import { PolygonOps, PointOps, LineOps, type Point, type Polygon } from "reynard-algorithms";
import { SegmentationEditorConfig } from "../types/index.js";

export interface UsePolygonEditorOptions {
  config: SegmentationEditorConfig;
  onPolygonChange?: (polygon: Polygon, segmentationId?: string) => void;
}

export interface UsePolygonEditorReturn {
  // Polygon operations
  addVertex: (polygon: Polygon, point: Point, index?: number) => Polygon;
  removeVertex: (polygon: Polygon, index: number) => Polygon;
  moveVertex: (polygon: Polygon, index: number, point: Point) => Polygon;
  insertVertex: (polygon: Polygon, edgeIndex: number, point: Point) => Polygon;

  // Geometric operations
  simplifyPolygon: (polygon: Polygon, tolerance?: number) => Polygon;
  smoothPolygon: (polygon: Polygon, iterations?: number) => Polygon;
  scalePolygon: (polygon: Polygon, scale: number, center?: Point) => Polygon;
  rotatePolygon: (polygon: Polygon, angle: number, center?: Point) => Polygon;
  translatePolygon: (polygon: Polygon, offset: Point) => Polygon;

  // Validation and utilities
  validatePolygon: (polygon: Polygon) => boolean;
  getPolygonCenter: (polygon: Polygon) => Point;
  getPolygonBounds: (polygon: Polygon) => { min: Point; max: Point };
  isPointInPolygon: (polygon: Polygon, point: Point) => boolean;
  getClosestVertex: (polygon: Polygon, point: Point) => { index: number; distance: number };
  getClosestEdge: (polygon: Polygon, point: Point) => { index: number; distance: number; point: Point };

  // Cleanup
  cleanup: () => void;
}

/**
 * Polygon editor composable leveraging reynard-algorithms
 */
export function usePolygonEditor(options: UsePolygonEditorOptions): UsePolygonEditorReturn {
  const [editingPolygon, setEditingPolygon] = createSignal<Polygon | undefined>();
  const [editingSegmentationId, setEditingSegmentationId] = createSignal<string | undefined>();

  // Add a vertex to the polygon
  const addVertex = (polygon: Polygon, point: Point, index?: number): Polygon => {
    const newPoints = [...polygon.points];
    if (index !== undefined && index >= 0 && index <= newPoints.length) {
      newPoints.splice(index, 0, point);
    } else {
      newPoints.push(point);
    }
    return PolygonOps.create(newPoints);
  };

  // Remove a vertex from the polygon
  const removeVertex = (polygon: Polygon, index: number): Polygon => {
    if (polygon.points.length <= 3) {
      // Don't remove vertex if it would make the polygon invalid
      return polygon;
    }
    const newPoints = [...polygon.points];
    newPoints.splice(index, 1);
    return PolygonOps.create(newPoints);
  };

  // Move a vertex to a new position
  const moveVertex = (polygon: Polygon, index: number, point: Point): Polygon => {
    const newPoints = [...polygon.points];
    newPoints[index] = point;
    return PolygonOps.create(newPoints);
  };

  // Insert a vertex on an edge
  const insertVertex = (polygon: Polygon, edgeIndex: number, point: Point): Polygon => {
    const newPoints = [...polygon.points];
    const insertIndex = (edgeIndex + 1) % newPoints.length;
    newPoints.splice(insertIndex, 0, point);
    return PolygonOps.create(newPoints);
  };

  // Simplify polygon using Douglas-Peucker algorithm
  const simplifyPolygon = (polygon: Polygon, tolerance: number = 1.0): Polygon => {
    if (polygon.points.length <= 3) return polygon;

    // Simple implementation - remove points that are too close to the line between adjacent points
    const newPoints = [polygon.points[0]];

    for (let i = 1; i < polygon.points.length - 1; i++) {
      const prev = polygon.points[i - 1];
      const curr = polygon.points[i];
      const next = polygon.points[i + 1];

      // Calculate distance from current point to line between prev and next
      const line = LineOps.create(prev, next);
      const distance = LineOps.distanceToPoint(line, curr);

      if (distance > tolerance) {
        newPoints.push(curr);
      }
    }

    newPoints.push(polygon.points[polygon.points.length - 1]);
    return PolygonOps.create(newPoints);
  };

  // Smooth polygon using simple averaging
  const smoothPolygon = (polygon: Polygon, iterations: number = 1): Polygon => {
    let smoothed = polygon;

    for (let iter = 0; iter < iterations; iter++) {
      const points = smoothed.points;
      const newPoints = [];

      for (let i = 0; i < points.length; i++) {
        const prev = points[(i - 1 + points.length) % points.length];
        const curr = points[i];
        const next = points[(i + 1) % points.length];

        // Average with adjacent points
        const smoothedPoint = {
          x: (prev.x + curr.x + next.x) / 3,
          y: (prev.y + curr.y + next.y) / 3,
        };

        newPoints.push(smoothedPoint);
      }

      smoothed = PolygonOps.create(newPoints);
    }

    return smoothed;
  };

  // Scale polygon around a center point
  const scalePolygon = (polygon: Polygon, scale: number, center?: Point): Polygon => {
    const centerPoint = center || getPolygonCenter(polygon);
    const newPoints = polygon.points.map(point => ({
      x: centerPoint.x + (point.x - centerPoint.x) * scale,
      y: centerPoint.y + (point.y - centerPoint.y) * scale,
    }));
    return PolygonOps.create(newPoints);
  };

  // Rotate polygon around a center point
  const rotatePolygon = (polygon: Polygon, angle: number, center?: Point): Polygon => {
    const centerPoint = center || getPolygonCenter(polygon);
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    const newPoints = polygon.points.map(point => {
      const dx = point.x - centerPoint.x;
      const dy = point.y - centerPoint.y;

      return {
        x: centerPoint.x + dx * cos - dy * sin,
        y: centerPoint.y + dx * sin + dy * cos,
      };
    });

    return PolygonOps.create(newPoints);
  };

  // Translate polygon by an offset
  const translatePolygon = (polygon: Polygon, offset: Point): Polygon => {
    const newPoints = polygon.points.map(point => ({
      x: point.x + offset.x,
      y: point.y + offset.y,
    }));
    return PolygonOps.create(newPoints);
  };

  // Validate polygon
  const validatePolygon = (polygon: Polygon): boolean => {
    if (!polygon.points || polygon.points.length < 3) {
      return false;
    }

    // Check for duplicate points
    for (let i = 0; i < polygon.points.length; i++) {
      for (let j = i + 1; j < polygon.points.length; j++) {
        if (PointOps.distance(polygon.points[i], polygon.points[j]) < 0.001) {
          return false;
        }
      }
    }

    // Check for self-intersection (simplified check)
    const area = PolygonOps.area(polygon);
    if (area <= 0) {
      return false;
    }

    // Check area constraints if config is provided
    if (options.config) {
      if (area < options.config.minPolygonArea || area > options.config.maxPolygonArea) {
        return false;
      }
    }

    return true;
  };

  // Get polygon center (centroid)
  const getPolygonCenter = (polygon: Polygon): Point => {
    if (polygon.points.length === 0) return { x: 0, y: 0 };

    let sumX = 0;
    let sumY = 0;

    for (const point of polygon.points) {
      sumX += point.x;
      sumY += point.y;
    }

    return {
      x: sumX / polygon.points.length,
      y: sumY / polygon.points.length,
    };
  };

  // Get polygon bounding box
  const getPolygonBounds = (polygon: Polygon): { min: Point; max: Point } => {
    if (polygon.points.length === 0) {
      return { min: { x: 0, y: 0 }, max: { x: 0, y: 0 } };
    }

    let minX = polygon.points[0].x;
    let minY = polygon.points[0].y;
    let maxX = polygon.points[0].x;
    let maxY = polygon.points[0].y;

    for (const point of polygon.points) {
      minX = Math.min(minX, point.x);
      minY = Math.min(minY, point.y);
      maxX = Math.max(maxX, point.x);
      maxY = Math.max(maxY, point.y);
    }

    return {
      min: { x: minX, y: minY },
      max: { x: maxX, y: maxY },
    };
  };

  // Check if point is inside polygon
  const isPointInPolygon = (polygon: Polygon, point: Point): boolean => {
    return PolygonOps.containsPoint(polygon, point);
  };

  // Get closest vertex to a point
  const getClosestVertex = (polygon: Polygon, point: Point): { index: number; distance: number } => {
    let closestIndex = 0;
    let closestDistance = PointOps.distance(polygon.points[0], point);

    for (let i = 1; i < polygon.points.length; i++) {
      const distance = PointOps.distance(polygon.points[i], point);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = i;
      }
    }

    return { index: closestIndex, distance: closestDistance };
  };

  // Get closest edge to a point
  const getClosestEdge = (polygon: Polygon, point: Point): { index: number; distance: number; point: Point } => {
    let closestIndex = 0;
    let closestDistance = Infinity;
    let closestPoint = polygon.points[0];

    for (let i = 0; i < polygon.points.length; i++) {
      const p1 = polygon.points[i];
      const p2 = polygon.points[(i + 1) % polygon.points.length];

      // Calculate closest point on line segment
      const line = LineOps.create(p1, p2);
      const distance = LineOps.distanceToPoint(line, point);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = i;
        // Find the actual closest point on the line
        const A = point.x - p1.x;
        const B = point.y - p1.y;
        const C = p2.x - p1.x;
        const D = p2.y - p1.y;
        const dot = A * C + B * D;
        const lenSq = C * C + D * D;
        const param = lenSq === 0 ? 0 : Math.max(0, Math.min(1, dot / lenSq));
        closestPoint = {
          x: p1.x + param * C,
          y: p1.y + param * D,
        };
      }
    }

    return {
      index: closestIndex,
      distance: closestDistance,
      point: closestPoint,
    };
  };

  // Cleanup function
  const cleanup = () => {
    setEditingPolygon(undefined);
    setEditingSegmentationId(undefined);
  };

  // Effect to notify when polygon changes
  createEffect(() => {
    const polygon = editingPolygon();
    const segmentationId = editingSegmentationId();

    if (polygon && options.onPolygonChange) {
      options.onPolygonChange(polygon, segmentationId);
    }
  });

  // Cleanup on unmount
  onCleanup(cleanup);

  return {
    addVertex,
    removeVertex,
    moveVertex,
    insertVertex,
    simplifyPolygon,
    smoothPolygon,
    scalePolygon,
    rotatePolygon,
    translatePolygon,
    validatePolygon,
    getPolygonCenter,
    getPolygonBounds,
    isPointInPolygon,
    getClosestVertex,
    getClosestEdge,
    cleanup,
  };
}
