import type { BenchmarkResult } from "../composables/useBenchmarkAlgorithms";

/**
 * Utility functions for drawing chart elements
 * Handles the detailed canvas drawing operations
 */
export const drawAxes = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, margin: number) => {
  ctx.strokeStyle = "#666666";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(margin, margin);
  ctx.lineTo(margin, canvas.height - margin);
  ctx.lineTo(canvas.width - margin, canvas.height - margin);
  ctx.stroke();
};

export const drawGridLines = (
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  margin: number,
  chartWidth: number,
  chartHeight: number
) => {
  ctx.strokeStyle = "#333333";
  ctx.lineWidth = 1;
  for (let i = 0; i <= 10; i++) {
    const x = margin + (i / 10) * chartWidth;
    const y = margin + (i / 10) * chartHeight;

    ctx.beginPath();
    ctx.moveTo(x, margin);
    ctx.lineTo(x, canvas.height - margin);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(margin, y);
    ctx.lineTo(canvas.width - margin, y);
    ctx.stroke();
  }
};

export const drawAlgorithmLine = (
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  margin: number,
  chartWidth: number,
  chartHeight: number,
  results: BenchmarkResult[],
  maxObjects: number,
  maxTime: number,
  color: string,
  timeProperty: keyof BenchmarkResult
) => {
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.beginPath();
  results.forEach((result, index) => {
    const x = margin + (result.objectCount / maxObjects) * chartWidth;
    const y = canvas.height - margin - ((result[timeProperty] as number) / maxTime) * chartHeight;

    if (index === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });
  ctx.stroke();
};

export const drawDataPoints = (
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  margin: number,
  chartWidth: number,
  chartHeight: number,
  results: BenchmarkResult[],
  maxObjects: number,
  maxTime: number
) => {
  results.forEach(result => {
    const x = margin + (result.objectCount / maxObjects) * chartWidth;
    const naiveY = canvas.height - margin - (result.naiveTime / maxTime) * chartHeight;
    const spatialY = canvas.height - margin - (result.spatialTime / maxTime) * chartHeight;

    // Naive points
    ctx.fillStyle = "#ff6b6b";
    ctx.beginPath();
    ctx.arc(x, naiveY, 4, 0, Math.PI * 2);
    ctx.fill();

    // Spatial points
    ctx.fillStyle = "#4ecdc4";
    ctx.beginPath();
    ctx.arc(x, spatialY, 4, 0, Math.PI * 2);
    ctx.fill();
  });
};

export const drawLabels = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
  ctx.fillStyle = "#ffffff";
  ctx.font = "14px monospace";
  ctx.fillText("Object Count", canvas.width / 2 - 50, canvas.height - 20);

  ctx.save();
  ctx.translate(20, canvas.height / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText("Execution Time (ms)", 0, 0);
  ctx.restore();
};

export const drawLegend = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
  // Draw legend
  ctx.fillStyle = "#ff6b6b";
  ctx.fillRect(canvas.width - 200, 20, 15, 15);
  ctx.fillStyle = "#ffffff";
  ctx.fillText("Naive O(n²)", canvas.width - 180, 32);

  ctx.fillStyle = "#4ecdc4";
  ctx.fillRect(canvas.width - 200, 40, 15, 15);
  ctx.fillStyle = "#ffffff";
  ctx.fillText("Spatial Hash O(n)", canvas.width - 180, 52);
};
