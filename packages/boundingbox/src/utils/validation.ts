/**
 * Validation utilities for annotations
 *
 * Provides validation functions for bounding boxes and other annotation types,
 * ensuring data integrity and proper constraints.
 */

import type {
  BoundingBox,
  PolygonAnnotation,
  ImageInfo,
  TransformConstraints,
} from "../types";

/**
 * Validate bounding box coordinates and dimensions
 */
export function validateBoundingBox(
  box: BoundingBox,
  imageInfo: ImageInfo,
): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check required fields
  if (!box.id || typeof box.id !== "string") {
    errors.push("Bounding box must have a valid string ID");
  }

  if (!box.label || typeof box.label !== "string") {
    errors.push("Bounding box must have a valid string label");
  }

  // Check coordinate types
  if (typeof box.x !== "number" || !isFinite(box.x)) {
    errors.push("Bounding box x coordinate must be a finite number");
  }

  if (typeof box.y !== "number" || !isFinite(box.y)) {
    errors.push("Bounding box y coordinate must be a finite number");
  }

  if (typeof box.width !== "number" || !isFinite(box.width)) {
    errors.push("Bounding box width must be a finite number");
  }

  if (typeof box.height !== "number" || !isFinite(box.height)) {
    errors.push("Bounding box height must be a finite number");
  }

  // Check coordinate ranges
  if (box.x < 0) {
    errors.push("Bounding box x coordinate cannot be negative");
  }

  if (box.y < 0) {
    errors.push("Bounding box y coordinate cannot be negative");
  }

  if (box.width <= 0) {
    errors.push("Bounding box width must be positive");
  }

  if (box.height <= 0) {
    errors.push("Bounding box height must be positive");
  }

  // Check bounds
  if (box.x + box.width > imageInfo.width) {
    errors.push("Bounding box extends beyond image width");
  }

  if (box.y + box.height > imageInfo.height) {
    errors.push("Bounding box extends beyond image height");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate polygon annotation
 */
export function validatePolygonAnnotation(
  polygon: PolygonAnnotation,
  imageInfo: ImageInfo,
): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check required fields
  if (!polygon.id || typeof polygon.id !== "string") {
    errors.push("Polygon must have a valid string ID");
  }

  if (!polygon.label || typeof polygon.label !== "string") {
    errors.push("Polygon must have a valid string label");
  }

  // Check points array
  if (!Array.isArray(polygon.points)) {
    errors.push("Polygon must have a points array");
  } else if (polygon.points.length < 3) {
    errors.push("Polygon must have at least 3 points");
  } else {
    // Validate each point
    polygon.points.forEach((point, index) => {
      if (typeof point.x !== "number" || !isFinite(point.x)) {
        errors.push(`Point ${index} x coordinate must be a finite number`);
      }
      if (typeof point.y !== "number" || !isFinite(point.y)) {
        errors.push(`Point ${index} y coordinate must be a finite number`);
      }
      if (point.x < 0 || point.x > imageInfo.width) {
        errors.push(`Point ${index} x coordinate is out of bounds`);
      }
      if (point.y < 0 || point.y > imageInfo.height) {
        errors.push(`Point ${index} y coordinate is out of bounds`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate transform constraints
 */
export function validateTransformConstraints(
  constraints: TransformConstraints,
): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (
    constraints.minWidth !== undefined &&
    (typeof constraints.minWidth !== "number" || constraints.minWidth < 0)
  ) {
    errors.push("minWidth must be a non-negative number");
  }

  if (
    constraints.minHeight !== undefined &&
    (typeof constraints.minHeight !== "number" || constraints.minHeight < 0)
  ) {
    errors.push("minHeight must be a non-negative number");
  }

  if (
    constraints.maxWidth !== undefined &&
    (typeof constraints.maxWidth !== "number" || constraints.maxWidth < 0)
  ) {
    errors.push("maxWidth must be a non-negative number");
  }

  if (
    constraints.maxHeight !== undefined &&
    (typeof constraints.maxHeight !== "number" || constraints.maxHeight < 0)
  ) {
    errors.push("maxHeight must be a non-negative number");
  }

  if (
    constraints.minWidth !== undefined &&
    constraints.maxWidth !== undefined &&
    constraints.minWidth > constraints.maxWidth
  ) {
    errors.push("minWidth cannot be greater than maxWidth");
  }

  if (
    constraints.minHeight !== undefined &&
    constraints.maxHeight !== undefined &&
    constraints.minHeight > constraints.maxHeight
  ) {
    errors.push("minHeight cannot be greater than maxHeight");
  }

  if (
    constraints.aspectRatio !== undefined &&
    (typeof constraints.aspectRatio !== "number" ||
      constraints.aspectRatio <= 0)
  ) {
    errors.push("aspectRatio must be a positive number");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Check if a bounding box meets size constraints
 */
export function checkBoundingBoxConstraints(
  box: BoundingBox,
  constraints: TransformConstraints,
): {
  meetsConstraints: boolean;
  violations: string[];
} {
  const violations: string[] = [];

  if (constraints.minWidth !== undefined && box.width < constraints.minWidth) {
    violations.push(
      `Width ${box.width} is less than minimum ${constraints.minWidth}`,
    );
  }

  if (
    constraints.minHeight !== undefined &&
    box.height < constraints.minHeight
  ) {
    violations.push(
      `Height ${box.height} is less than minimum ${constraints.minHeight}`,
    );
  }

  if (constraints.maxWidth !== undefined && box.width > constraints.maxWidth) {
    violations.push(
      `Width ${box.width} is greater than maximum ${constraints.maxWidth}`,
    );
  }

  if (
    constraints.maxHeight !== undefined &&
    box.height > constraints.maxHeight
  ) {
    violations.push(
      `Height ${box.height} is greater than maximum ${constraints.maxHeight}`,
    );
  }

  if (constraints.aspectRatio !== undefined) {
    const currentAspectRatio = box.width / box.height;
    const tolerance = 0.01; // 1% tolerance
    if (Math.abs(currentAspectRatio - constraints.aspectRatio) > tolerance) {
      violations.push(
        `Aspect ratio ${currentAspectRatio.toFixed(3)} does not match required ${constraints.aspectRatio}`,
      );
    }
  }

  return {
    meetsConstraints: violations.length === 0,
    violations,
  };
}

/**
 * Calculate the area of a bounding box
 */
export function calculateBoundingBoxArea(box: BoundingBox): number {
  return box.width * box.height;
}

/**
 * Calculate the area of a polygon using the shoelace formula
 */
export function calculatePolygonArea(polygon: PolygonAnnotation): number {
  if (polygon.points.length < 3) return 0;

  let area = 0;
  const n = polygon.points.length;

  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    area += polygon.points[i].x * polygon.points[j].y;
    area -= polygon.points[j].x * polygon.points[i].y;
  }

  return Math.abs(area) / 2;
}

/**
 * Check if two bounding boxes overlap
 */
export function boundingBoxesOverlap(
  box1: BoundingBox,
  box2: BoundingBox,
): boolean {
  return !(
    box1.x + box1.width <= box2.x ||
    box2.x + box2.width <= box1.x ||
    box1.y + box1.height <= box2.y ||
    box2.y + box2.height <= box1.y
  );
}

/**
 * Calculate intersection over union (IoU) of two bounding boxes
 */
export function calculateBoundingBoxIoU(
  box1: BoundingBox,
  box2: BoundingBox,
): number {
  if (!boundingBoxesOverlap(box1, box2)) {
    return 0;
  }

  // Calculate intersection
  const intersectionX = Math.max(box1.x, box2.x);
  const intersectionY = Math.max(box1.y, box2.y);
  const intersectionWidth =
    Math.min(box1.x + box1.width, box2.x + box2.width) - intersectionX;
  const intersectionHeight =
    Math.min(box1.y + box1.height, box2.y + box2.height) - intersectionY;

  const intersectionArea = intersectionWidth * intersectionHeight;

  // Calculate union
  const box1Area = box1.width * box1.height;
  const box2Area = box2.width * box2.height;
  const unionArea = box1Area + box2Area - intersectionArea;

  return intersectionArea / unionArea;
}
