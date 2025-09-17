// Point cloud state management composable
// Extracted from usePointCloud for modularity
import { createSignal } from "solid-js";
export function usePointCloudState() {
    // Point cloud state
    const [pointCloud, setPointCloud] = createSignal(null);
    const [visiblePoints, setVisiblePoints] = createSignal([]);
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
