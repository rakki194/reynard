import { type AABB } from "reynard-algorithms";
import { type PerformanceStats } from "./usePerformanceStats";
import { drawSpatialGrid, drawObjects, drawPerformanceOverlay } from "./spatialDrawingUtils";

/**
 * Composable for rendering spatial optimization demo canvas
 * Handles grid visualization, object rendering, and performance overlay
 */
export function useSpatialCanvasRenderer() {
  const render = (canvas: HTMLCanvasElement, objects: AABB[], stats: PerformanceStats) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw spatial hash grid
    drawSpatialGrid(ctx, canvas.width, canvas.height);

    // Draw objects
    drawObjects(ctx, objects);

    // Draw performance info
    drawPerformanceOverlay(ctx, stats);
  };

  return {
    render,
  };
}
