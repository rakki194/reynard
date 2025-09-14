/**
 * 🦊 Enhanced Renderer
 * Handles all rendering logic for the integration demo
 */

export interface RenderConfig {
  mode: "2d" | "3d";
  enableStroboscopic: boolean;
  enablePerformanceOptimization: boolean;
  stroboscopicState?: any;
}

export class EnhancedRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.canvas.width = 800;
    this.canvas.height = 600;
  }

  renderPoints(points: any[], config: RenderConfig, performanceEngine?: any) {
    if (!this.ctx) return;

    this.clearCanvas();
    this.drawBackground();

    // Apply performance optimizations
    let optimizedPoints = points;
    if (config.enablePerformanceOptimization && performanceEngine) {
      optimizedPoints = performanceEngine.applySpatialCulling(points, {
        x: 0,
        y: 0,
        width: this.canvas.width,
        height: this.canvas.height,
      });
      optimizedPoints = performanceEngine.applyLOD(optimizedPoints);
    }

    // Sort by depth for 3D
    if (config.mode === "3d") {
      optimizedPoints = [...optimizedPoints].sort(
        (a, b) => (b.z || 0) - (a.z || 0),
      );
    }

    this.renderOptimizedPoints(optimizedPoints, config);
    this.drawInfoOverlay(points, optimizedPoints, config);

    return optimizedPoints;
  }

  private clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  private drawBackground() {
    this.ctx.fillStyle = "#1a1a1a";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  private renderOptimizedPoints(points: any[], config: RenderConfig) {
    points.forEach((point, index) => {
      const size = point.size || 2;

      if (config.mode === "3d" && point.z !== undefined) {
        this.render3DPoint(point, size, index);
      } else {
        this.render2DPoint(point, size, index);
      }
    });
  }

  private render3DPoint(point: any, size: number, index: number) {
    const perspective = 1 / (1 + point.z / 200);
    const projectedX = point.x * perspective;
    const projectedY = point.y * perspective;
    const projectedSize = size * perspective;

    if (projectedSize < 0.5) return;

    this.ctx.fillStyle =
      point.color || `hsl(${(index * 137.5) % 360}, 70%, 60%)`;
    this.ctx.beginPath();
    this.ctx.arc(projectedX, projectedY, projectedSize, 0, Math.PI * 2);
    this.ctx.fill();
  }

  private render2DPoint(point: any, size: number, index: number) {
    this.ctx.fillStyle =
      point.color || `hsl(${(index * 137.5) % 360}, 70%, 60%)`;
    this.ctx.beginPath();
    this.ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
    this.ctx.fill();
  }

  private drawInfoOverlay(
    originalPoints: any[],
    optimizedPoints: any[],
    config: RenderConfig,
  ) {
    this.ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    this.ctx.font = "16px Arial";
    this.ctx.fillText(`${config.mode.toUpperCase()} PATTERN`, 20, 30);
    this.ctx.fillText(`Original: ${originalPoints.length} points`, 20, 50);
    this.ctx.fillText(`Rendered: ${optimizedPoints.length} points`, 20, 70);

    if (config.enableStroboscopic && config.stroboscopicState?.isStroboscopic) {
      this.ctx.fillStyle = `rgba(255, 255, 0, ${config.stroboscopicState.temporalAliasing})`;
      this.ctx.fillRect(20, 90, 20, 20);
      this.ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
      this.ctx.fillText("Stroboscopic Active", 50, 105);
    }
  }

  getCanvas() {
    return this.canvas;
  }

  getContext() {
    return this.ctx;
  }
}
