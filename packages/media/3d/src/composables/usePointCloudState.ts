// Point cloud state management composable
// Extracted from usePointCloud for modularity

import { createSignal } from "solid-js";
import type { Point3D } from "../types";

export function usePointCloudState() {
  // Point cloud state
  const [pointCloud, setPointCloud] = createSignal<unknown>(null);
  const [visiblePoints, setVisiblePoints] = createSignal<Point3D[]>([]);
  const [renderStats, setRenderStats] = createSignal({
    totalPoints: 0,
    visiblePoints: 0,
    renderedPoints: 0,
    fps: 60,
    memoryUsage: 0,
  });

  return {
    pointCloud,
    visiblePoints,
    renderStats,
    setPointCloud,
    setVisiblePoints,
    setRenderStats,
  };
}
