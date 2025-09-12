// Point cloud processing composable
// Handles point data processing with color, size, and search integration

import { createMemo } from "solid-js";
import type { Point3D, PointCloudSettings } from "../types";
import { calculatePointColors } from "./usePointCloudColors";
import { calculatePointSizes } from "./usePointCloudSizes";

export function usePointCloudProcessing(
  points: () => Point3D[],
  settings: () => PointCloudSettings,
  maxPoints: () => number,
  pointSize: () => number,
  processPointsWithSearchIntegration: (points: Point3D[]) => Point3D[],
) {
  // Process points with color, size, and search integration
  const processedPoints = createMemo(() => {
    const pointData = points().slice(0, maxPoints());
    const coloredPoints = calculatePointColors(
      pointData,
      settings().colorMapping || "similarity",
    );
    const sizedPoints = calculatePointSizes(
      coloredPoints,
      settings().sizeMapping || "uniform",
      pointSize(),
    );
    return processPointsWithSearchIntegration(sizedPoints);
  });

  return { processedPoints };
}
