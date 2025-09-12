// Point cloud color calculation utilities
// Extracted from usePointCloud for modularity

import type { Point3D } from "../types";

/**
 * Color mapping strategies for point clouds
 */
export type ColorMappingStrategy =
  | "similarity"
  | "cluster"
  | "importance"
  | "confidence"
  | "custom";

/**
 * Calculate point colors based on different strategies
 */
export function calculatePointColors(
  points: Point3D[],
  strategy: ColorMappingStrategy = "similarity",
): Point3D[] {
  return points.map((point) => {
    let color: [number, number, number] = [1, 1, 1];

    switch (strategy) {
      case "similarity":
        color = calculateSimilarityColor(point);
        break;
      case "cluster":
        color = calculateClusterColor(point);
        break;
      case "importance":
        color = calculateImportanceColor(point);
        break;
      case "confidence":
        color = calculateConfidenceColor(point);
        break;
      case "custom":
        color = point.color || [1, 1, 1];
        break;
    }

    return { ...point, color };
  });
}

/**
 * Calculate color based on similarity to center point or query point
 */
function calculateSimilarityColor(point: Point3D): [number, number, number] {
  if (point.similarity !== undefined) {
    // Use similarity value directly
    const similarity = Math.max(0, Math.min(1, point.similarity));
    return [similarity, 1 - similarity, 0.5];
  } else {
    // Fallback to distance-based similarity
    const center = [0, 0, 0];
    const distance = Math.sqrt(
      Math.pow(point.position[0] - center[0], 2) +
        Math.pow(point.position[1] - center[1], 2) +
        Math.pow(point.position[2] - center[2], 2),
    );
    const normalizedDistance = Math.min(distance / 10, 1);
    return [normalizedDistance, 1 - normalizedDistance, 0.5];
  }
}

/**
 * Calculate color based on cluster ID
 */
function calculateClusterColor(point: Point3D): [number, number, number] {
  if (point.clusterId) {
    const hash = point.clusterId.split("").reduce((a, b) => {
      a = (a << 5) - a + b.charCodeAt(0);
      return a & a;
    }, 0);
    const hue = Math.abs(hash) % 360;
    const rgb = hslToRgb(hue / 360, 0.7, 0.6);
    return [rgb[0], rgb[1], rgb[2]];
  }
  return [1, 1, 1];
}

/**
 * Calculate color based on importance
 */
function calculateImportanceColor(point: Point3D): [number, number, number] {
  const importance = point.importance || 0.5;
  return [importance, 1 - importance, 0.5];
}

/**
 * Calculate color based on confidence
 */
function calculateConfidenceColor(point: Point3D): [number, number, number] {
  const confidence = point.confidence || 0.5;
  return [confidence, 1 - confidence, 0.5];
}

/**
 * Utility function to convert HSL to RGB
 */
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return [r, g, b];
}
