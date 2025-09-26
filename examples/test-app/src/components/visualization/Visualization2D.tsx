/**
 * 🦊 2D Data Visualization Component
 * Canvas-based 2D visualization with OKLCH colors and Three.js integration
 */

import { Component, createSignal, onMount, onCleanup, createMemo } from "solid-js";
import { Card, Button } from "reynard-primitives";
import { getIcon } from "reynard-fluent-icons";
import { useOKLCHColors } from "reynard-themes";
import { VisualizationCore, type DataPoint, type VisualizationConfig } from "./VisualizationCore";
import { DataProcessor, type ProcessedData } from "./DataProcessor";
import { createAnimationEngine } from "../../utils/animationEngine";

interface Visualization2DProps {
  data: DataPoint[];
  config?: Partial<VisualizationConfig>;
  width?: number;
  height?: number;
  enableAnimation?: boolean;
  showControls?: boolean;
}

export const Visualization2D: Component<Visualization2DProps> = props => {
  const oklchColors = useOKLCHColors();

  // State
  const [processedData, setProcessedData] = createSignal<ProcessedData | null>(null);
  const [visualizationCore] = createSignal(new VisualizationCore(props.config));
  const [isAnimating, setIsAnimating] = createSignal(false);
  const [zoom, setZoom] = createSignal(1);
  const [panX, setPanX] = createSignal(0);
  const [panY, setPanY] = createSignal(0);

  // Refs
  let canvasRef: HTMLCanvasElement | undefined;
  let ctx: CanvasRenderingContext2D | undefined;
  let animationEngine: ReturnType<typeof createAnimationEngine> | undefined;

  // Process data when props change
  const processedDataMemo = createMemo(() => {
    if (!props.data.length) return null;

    const processed = DataProcessor.processData(props.data, {
      normalize: true,
      enableClustering: true,
      clusterCount: 5,
    });

    setProcessedData(processed);
    return processed;
  });

  // Generate colors for data points
  const colors = createMemo(() => {
    const data = processedDataMemo();
    if (!data) return [];

    return visualizationCore().generateColors(data.points);
  });

  // Render visualization
  const render = () => {
    if (!ctx || !canvasRef || !processedData()) return;

    const data = processedData()!;
    const pointColors = colors();

    // Clear canvas
    ctx.fillStyle = oklchColors.getColor("background");
    ctx.fillRect(0, 0, canvasRef.width, canvasRef.height);

    // Apply transformations
    ctx.save();
    ctx.translate(canvasRef.width / 2 + panX(), canvasRef.height / 2 + panY());
    ctx.scale(zoom(), zoom());

    // Draw grid
    drawGrid();

    // Draw clusters if available
    if (data.clusters) {
      drawClusters(data.clusters);
    }

    // Draw data points
    data.points.forEach((point, index) => {
      const color = pointColors[index];
      if (color) {
        drawDataPoint(point, color);
      }
    });

    // Draw statistics overlay
    drawStatistics(data.statistics);

    ctx.restore();
  };

  // Draw grid
  const drawGrid = () => {
    if (!ctx) return;

    const gridSize = 0.1;
    const gridColor = oklchColors.getColor("border");

    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 0.5;
    ctx.globalAlpha = 0.3;

    // Vertical lines
    for (let x = -1; x <= 1; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, -1);
      ctx.lineTo(x, 1);
      ctx.stroke();
    }

    // Horizontal lines
    for (let y = -1; y <= 1; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(-1, y);
      ctx.lineTo(1, y);
      ctx.stroke();
    }

    ctx.globalAlpha = 1;
  };

  // Draw clusters
  const drawClusters = (clusters: any[]) => {
    if (!ctx) return;

    clusters.forEach(cluster => {
      if (!ctx) return;
      ctx.strokeStyle = cluster.color;
      ctx.fillStyle = cluster.color;
      ctx.globalAlpha = 0.2;
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.arc(cluster.center.x - 0.5, cluster.center.y - 0.5, cluster.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.globalAlpha = 1;
    });
  };

  // Draw data point
  const drawDataPoint = (point: DataPoint, color: any) => {
    if (!ctx) return;

    const x = (point.x - 0.5) * 2; // Convert to -1 to 1 range
    const y = (point.y - 0.5) * 2;
    const size = 3 + color.intensity * 5;

    ctx.fillStyle = color.css;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();

    // Draw glow effect
    ctx.shadowColor = color.css;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(x, y, size * 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  };

  // Draw statistics
  const drawStatistics = (stats: any) => {
    if (!ctx) return;

    ctx.fillStyle = oklchColors.getColor("text");
    ctx.font = "12px monospace";
    ctx.textAlign = "left";

    const statsText = [
      `Points: ${stats.count}`,
      `Mean: ${stats.mean.toFixed(3)}`,
      `Std: ${stats.std.toFixed(3)}`,
      `Range: ${stats.min.toFixed(3)} - ${stats.max.toFixed(3)}`,
    ];

    statsText.forEach((text, index) => {
      if (!ctx) return;
      ctx.fillText(text, -0.9, -0.9 + index * 0.05);
    });
  };

  // Handle mouse events
  const handleMouseWheel = (e: WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.max(0.1, Math.min(5, prev * delta)));
  };

  const handleMouseDown = (e: MouseEvent) => {
    if (!canvasRef) return;

    const rect = canvasRef.getBoundingClientRect();
    const startX = e.clientX - rect.left;
    const startY = e.clientY - rect.top;
    const startPanX = panX();
    const startPanY = panY();

    const handleMouseMove = (e: MouseEvent) => {
      const newX = startPanX + (e.clientX - rect.left - startX);
      const newY = startPanY + (e.clientY - rect.top - startY);
      setPanX(newX);
      setPanY(newY);
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  // Animation
  const startAnimation = () => {
    if (isAnimating()) return;

    setIsAnimating(true);
    animationEngine?.start({
      onRender: render,
    });
  };

  const stopAnimation = () => {
    setIsAnimating(false);
    animationEngine?.stop();
  };

  // Lifecycle
  onMount(() => {
    if (canvasRef) {
      ctx = canvasRef.getContext("2d")!;
      canvasRef.width = props.width || 800;
      canvasRef.height = props.height || 600;

      animationEngine = createAnimationEngine();

      // Add event listeners
      canvasRef.addEventListener("wheel", handleMouseWheel);
      canvasRef.addEventListener("mousedown", handleMouseDown);

      // Initial render
      render();
    }
  });

  onCleanup(() => {
    if (canvasRef) {
      canvasRef.removeEventListener("wheel", handleMouseWheel);
      canvasRef.removeEventListener("mousedown", handleMouseDown);
    }
    animationEngine?.stop();
  });

  return (
    <div class="visualization-2d">
      <Card class="visualization-container">
        <div class="visualization-header">
          <h3>🦊 2D Data Visualization</h3>
          <p>Interactive 2D visualization with OKLCH colors and clustering</p>
        </div>

        <div class="visualization-content">
          <div class="canvas-wrapper">
            <canvas ref={canvasRef} class="visualization-canvas" />
          </div>

          {props.showControls && (
            <div class="visualization-controls">
              <div class="control-group">
                <Button
                  variant={isAnimating() ? "danger" : "success"}
                  size="sm"
                  onClick={isAnimating() ? stopAnimation : startAnimation}
                  leftIcon={getIcon(isAnimating() ? "pause" : "play")}
                >
                  {isAnimating() ? "Stop" : "Animate"}
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setZoom(1);
                    setPanX(0);
                    setPanY(0);
                  }}
                  leftIcon={getIcon("refresh")}
                >
                  Reset View
                </Button>
              </div>

              <div class="stats-display">
                {processedData() && (
                  <div class="stats-grid">
                    <div class="stat-item">
                      <span class="stat-label">Points:</span>
                      <span class="stat-value">{processedData()!.statistics.count}</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-label">Mean:</span>
                      <span class="stat-value">{processedData()!.statistics.mean.toFixed(3)}</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-label">Std Dev:</span>
                      <span class="stat-value">{processedData()!.statistics.std.toFixed(3)}</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-label">Clusters:</span>
                      <span class="stat-value">{processedData()!.clusters?.length || 0}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
