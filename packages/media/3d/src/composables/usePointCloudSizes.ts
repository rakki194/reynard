// Point cloud size calculation utilities
// Extracted from usePointCloud for modularity

import type { Point3D } from "../types";

/**
 * Size mapping strategies for point clouds
 */
export type SizeMappingStrategy = "importance" | "confidence" | "uniform";

/**
 * Calculate point sizes based on different strategies
 */
export function calculatePointSizes(
  points: Point3D[],
  strategy: SizeMappingStrategy = "uniform",
  baseSize: number = 2
): Point3D[] {
  return points.map(point => {
    let size = baseSize;

    switch (strategy) {
      case "importance":
        size = (point.importance || 0.5) * baseSize * 2;
        break;
      case "confidence":
        const confidence = point.confidence || 0.5;
        size = confidence * baseSize * 2;
        break;
      case "uniform":
        size = baseSize;
        break;
    }

    return { ...point, size };
  });
}
