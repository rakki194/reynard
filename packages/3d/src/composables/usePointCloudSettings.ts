// Point cloud settings composable
// Extracted from usePointCloud for modularity

import { createMemo } from "solid-js";
import type { PointCloudSettings } from "../types";

export function usePointCloudSettings(settings: () => PointCloudSettings = () => ({})) {
  // Performance settings
  const maxPoints = createMemo(() => settings().maxPoints || 100000);
  const pointSize = createMemo(() => settings().pointSize || 2);
  const enableInstancing = createMemo(() => settings().enableInstancing ?? true);
  const enableLOD = createMemo(() => settings().enableLOD ?? true);
  const enableCulling = createMemo(() => settings().enableCulling ?? true);
  const lodDistance = createMemo(() => settings().lodDistance || 50);
  const lodLevels = createMemo(() => settings().lodLevels || 3);
  const enableHighlighting = createMemo(() => settings().enableHighlighting ?? true);
  const highlightColor = createMemo(() => settings().highlightColor || [1, 1, 0]);
  const highlightSize = createMemo(() => settings().highlightSize || 1.5);

  return {
    maxPoints,
    pointSize,
    enableInstancing,
    enableLOD,
    enableCulling,
    lodDistance,
    lodLevels,
    enableHighlighting,
    highlightColor,
    highlightSize,
  };
}
