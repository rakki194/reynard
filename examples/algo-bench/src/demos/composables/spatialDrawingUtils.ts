import { type AABB } from "reynard-algorithms";
import { type PerformanceStats } from "./usePerformanceStats";

/**
 * Utility functions for spatial optimization demo canvas drawing
 * Separated to keep individual functions under 50 lines
 */

/**
 * Draw the spatial hash grid on the canvas
 */
export function drawSpatialGrid(ctx: CanvasRenderingContext2D, width: number, height: number) {
  ctx.strokeStyle = "#333333";
  ctx.lineWidth = 1;
  const cellSize = 50;

  // Draw vertical lines
  for (let x = 0; x < width; x += cellSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  // Draw horizontal lines
  for (let y = 0; y < height; y += cellSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
}

/**
 * Draw AABB objects with color coding
 */
export function drawObjects(ctx: CanvasRenderingContext2D, objects: AABB[]) {
  objects.forEach((obj, index) => {
    // Fill with color
    ctx.fillStyle = `hsl(${(index * 137.5) % 360}, 70%, 60%)`;
    ctx.fillRect(obj.x, obj.y, obj.width, obj.height);

    // Draw border
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.strokeRect(obj.x, obj.y, obj.width, obj.height);
  });
}

/**
 * Draw performance statistics overlay
 */
export function drawPerformanceOverlay(ctx: CanvasRenderingContext2D, stats: PerformanceStats) {
  ctx.fillStyle = "#ffffff";
  ctx.font = "16px monospace";

  const lines = [
    `Objects: ${stats.objectCount}`,
    `Naive Time: ${stats.naiveTime.toFixed(2)}ms`,
    `Spatial Time: ${stats.spatialTime.toFixed(2)}ms`,
    `Speedup: ${stats.speedup.toFixed(2)}x`,
    `Collisions: ${stats.collisionCount}`,
  ];

  lines.forEach((line, index) => {
    ctx.fillText(line, 10, 30 + index * 20);
  });
}
