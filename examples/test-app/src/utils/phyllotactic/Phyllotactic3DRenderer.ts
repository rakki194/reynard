/**
 * 🦊 3D Phyllotactic Renderer
 * Rendering utilities for 3D phyllotactic visualization
 */

export interface Point3D {
  x: number;
  y: number;
  z: number;
  size?: number;
  angle?: number;
  stroboscopicIntensity?: number;
}

export class Phyllotactic3DRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    this.canvas = canvas;
    this.ctx = ctx;
  }

  /**
   * Render 3D points with perspective projection
   */
  render3DPoints(points: Point3D[]): void {
    this.clearCanvas();
    this.drawBackground();

    // Sort points by Z depth for proper rendering
    const sortedPoints = [...points].sort((a, b) => b.z - a.z);

    // Render points with perspective
    sortedPoints.forEach((point) => {
      this.renderPoint(point);
    });

    this.drawInfo(points);
  }

  /**
   * Clear the canvas
   */
  private clearCanvas(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Draw background
   */
  private drawBackground(): void {
    this.ctx.fillStyle = "#1a1a1a";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Render a single 3D point
   */
  private renderPoint(point: Point3D): void {
    const size = point.size || 2;

    // Simple perspective projection
    const _perspective = 1 / (1 + point.z / 200);
    const projectedX = point.x * _perspective;
    const projectedY = point.y * _perspective;
    const projectedSize = size * _perspective;

    // Skip points that are too far back
    if (projectedSize < 0.5) return;

    // Calculate color based on depth and stroboscopic intensity
    const color = this.calculatePointColor(point, _perspective);
    this.ctx.fillStyle = color;

    this.ctx.beginPath();
    this.ctx.arc(projectedX, projectedY, projectedSize, 0, Math.PI * 2);
    this.ctx.fill();
  }

  /**
   * Calculate color for a point based on depth and properties
   */
  private calculatePointColor(point: Point3D, _perspective: number): string {
    const depth = Math.max(0, Math.min(1, (point.z + 100) / 200));
    const stroboscopicIntensity = point.stroboscopicIntensity || 0;
    const hue = (((point.angle || 0) * 180) / Math.PI) % 360;
    const saturation = 70 + depth * 30;
    const lightness = 50 + depth * 20 + stroboscopicIntensity * 30;
    const alpha = 0.8;

    return `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha})`;
  }

  /**
   * Draw information overlay
   */
  private drawInfo(points: Point3D[]): void {
    this.ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    this.ctx.font = "16px Arial";
    this.ctx.fillText("3D Phyllotactic Spiral", 20, 30);
    this.ctx.fillText(`${points.length} points`, 20, 50);
  }
}
