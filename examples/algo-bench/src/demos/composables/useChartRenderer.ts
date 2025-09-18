import { createSignal } from "solid-js";
import type { BenchmarkResult } from "./useBenchmarkAlgorithms";
import {
  drawAxes,
  drawGridLines,
  drawAlgorithmLine,
  drawDataPoints,
  drawLabels,
  drawLegend,
} from "../utils/chartDrawing";

/**
 * Composable for rendering benchmark performance charts
 * Handles canvas rendering and chart visualization
 */
export function useChartRenderer() {
  const [canvasRef, setCanvasRef] = createSignal<HTMLCanvasElement>();

  // Render benchmark visualization
  const renderChart = (results: BenchmarkResult[]) => {
    const canvas = canvasRef();
    if (!canvas || results.length === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Set up chart dimensions
    const margin = 60;
    const chartWidth = canvas.width - 2 * margin;
    const chartHeight = canvas.height - 2 * margin;
    const maxObjects = Math.max(...results.map(r => r.objectCount));
    const maxTime = Math.max(...results.map(r => Math.max(r.naiveTime, r.spatialTime)));

    // Draw chart elements
    drawAxes(ctx, canvas, margin);
    drawGridLines(ctx, canvas, margin, chartWidth, chartHeight);

    // Draw algorithm lines
    drawAlgorithmLine(
      ctx,
      canvas,
      margin,
      chartWidth,
      chartHeight,
      results,
      maxObjects,
      maxTime,
      "#ff6b6b",
      "naiveTime"
    );
    drawAlgorithmLine(
      ctx,
      canvas,
      margin,
      chartWidth,
      chartHeight,
      results,
      maxObjects,
      maxTime,
      "#4ecdc4",
      "spatialTime"
    );

    drawDataPoints(ctx, canvas, margin, chartWidth, chartHeight, results, maxObjects, maxTime);
    drawLabels(ctx, canvas);
    drawLegend(ctx, canvas);
  };

  return {
    canvasRef: setCanvasRef,
    renderChart,
  };
}
