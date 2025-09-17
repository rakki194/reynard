/**
 * Segmentation Canvas Component
 *
 * Interactive canvas for displaying and editing polygon segmentations.
 * Integrates with the Reynard algorithms package for geometric operations
 * and provides comprehensive rendering capabilities with real-time updates.
 */

import { Component, createSignal, createEffect, onMount, onCleanup, Show, For } from "solid-js";
import { PolygonOps, PointOps, type Point, type Polygon } from "reynard-algorithms";
import { SegmentationData, SegmentationEditorConfig, SegmentationEditorState } from "../types/index.js";
import { useCanvasInteraction } from "../composables/useCanvasInteraction.js";
import "./SegmentationCanvas.css";

export interface SegmentationCanvasProps {
  /** Image source */
  imageSrc: string;
  /** Segmentations to display */
  segmentations: SegmentationData[];
  /** Editor configuration */
  config: SegmentationEditorConfig;
  /** Editor state */
  state: SegmentationEditorState;
  /** Mouse move handler */
  onMouseMove?: (position: Point) => void;
  /** Zoom change handler */
  onZoomChange?: (zoom: number) => void;
  /** Pan change handler */
  onPanChange?: (offset: Point) => void;
  /** Segmentation selection handler */
  onSegmentationSelect?: (segmentationId: string) => void;
  /** Segmentation creation handler */
  onSegmentationCreate?: (polygon: Polygon) => void;
  /** Segmentation update handler */
  onSegmentationUpdate?: (segmentationId: string, polygon: Polygon) => void;
  /** Additional CSS class */
  class?: string;
}

/**
 * Segmentation Canvas Component with comprehensive rendering capabilities
 */
export const SegmentationCanvas: Component<SegmentationCanvasProps> = props => {
  let canvasRef: HTMLCanvasElement | undefined;
  let imageRef: HTMLImageElement | undefined;

  const [canvasSize, setCanvasSize] = createSignal({ width: 800, height: 600 });
  const [imageLoaded, setImageLoaded] = createSignal(false);
  const [isDrawing, setIsDrawing] = createSignal(false);
  const [currentPolygon, setCurrentPolygon] = createSignal<Point[]>([]);
  const [isDragging, setIsDragging] = createSignal(false);
  const [dragStart, setDragStart] = createSignal<Point | undefined>();

  // Initialize canvas interaction
  const canvasInteraction = useCanvasInteraction({
    canvas: () => canvasRef,
    config: props.config,
    state: props.state,
    onMouseMove: props.onMouseMove,
    onZoomChange: props.onZoomChange,
    onPanChange: props.onPanChange,
    onPolygonComplete: polygon => {
      if (props.onSegmentationCreate) {
        props.onSegmentationCreate(PolygonOps.create(polygon));
      }
      setCurrentPolygon([]);
      setIsDrawing(false);
    },
    onPolygonUpdate: (polygon, segmentationId) => {
      if (segmentationId && props.onSegmentationUpdate) {
        props.onSegmentationUpdate(segmentationId, PolygonOps.create(polygon));
      }
    },
  });

  // Load image
  onMount(() => {
    if (imageRef) {
      imageRef.onload = () => {
        setImageLoaded(true);
        updateCanvasSize();
      };
      imageRef.src = props.imageSrc;
    }
  });

  // Update canvas size when image loads
  const updateCanvasSize = () => {
    if (imageRef && canvasRef) {
      const rect = canvasRef.getBoundingClientRect();
      setCanvasSize({
        width: rect.width,
        height: rect.height,
      });
    }
  };

  // Draw canvas content
  const drawCanvas = () => {
    if (!canvasRef || !imageLoaded()) return;

    const ctx = canvasRef.getContext("2d");
    if (!ctx) return;

    const { width, height } = canvasSize();
    const { zoom, panOffset } = props.state;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Save context
    ctx.save();

    // Apply zoom and pan
    ctx.scale(zoom, zoom);
    ctx.translate(panOffset.x, panOffset.y);

    // Draw image
    if (imageRef) {
      ctx.drawImage(imageRef, 0, 0);
    }

    // Draw grid if enabled
    if (props.config.showGrid) {
      drawGrid(ctx);
    }

    // Draw segmentations
    For({ each: props.segmentations }, segmentation => {
      drawSegmentation(ctx, segmentation);
    });

    // Draw current polygon being created
    if (isDrawing() && currentPolygon().length > 0) {
      drawCurrentPolygon(ctx);
    }

    // Restore context
    ctx.restore();
  };

  // Draw grid
  const drawGrid = (ctx: CanvasRenderingContext2D) => {
    const { gridSize } = props.config;
    const { zoom, panOffset } = props.state;

    ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
    ctx.lineWidth = 1 / zoom;

    const startX = Math.floor(panOffset.x / gridSize) * gridSize;
    const startY = Math.floor(panOffset.y / gridSize) * gridSize;
    const endX = startX + canvasSize().width / zoom;
    const endY = startY + canvasSize().height / zoom;

    // Draw vertical lines
    for (let x = startX; x <= endX; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, startY);
      ctx.lineTo(x, endY);
      ctx.stroke();
    }

    // Draw horizontal lines
    for (let y = startY; y <= endY; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(startX, y);
      ctx.lineTo(endX, y);
      ctx.stroke();
    }
  };

  // Draw segmentation
  const drawSegmentation = (ctx: CanvasRenderingContext2D, segmentation: SegmentationData) => {
    const { polygon } = segmentation;
    const isSelected = segmentation.id === props.state.selectedSegmentation;
    const isHovered = segmentation.id === props.state.hoveredSegmentation;

    // Set styles based on state
    if (isSelected) {
      ctx.strokeStyle = "#3b82f6";
      ctx.fillStyle = "rgba(59, 130, 246, 0.3)";
    } else if (isHovered) {
      ctx.strokeStyle = "#10b981";
      ctx.fillStyle = "rgba(16, 185, 129, 0.2)";
    } else {
      ctx.strokeStyle = "#6b7280";
      ctx.fillStyle = "rgba(107, 114, 128, 0.2)";
    }

    ctx.lineWidth = props.config.edgeThickness / props.state.zoom;

    // Draw polygon fill
    if (props.config.showFill) {
      ctx.globalAlpha = props.config.fillOpacity;
      drawPolygon(ctx, polygon.points);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    // Draw polygon edges
    if (props.config.showEdges) {
      drawPolygon(ctx, polygon.points);
      ctx.stroke();
    }

    // Draw vertices
    if (props.config.showVertices) {
      drawVertices(ctx, polygon.points, isSelected);
    }

    // Draw bounding box
    if (props.config.showBoundingBox) {
      drawBoundingBox(ctx, polygon);
    }
  };

  // Draw polygon path
  const drawPolygon = (ctx: CanvasRenderingContext2D, points: Point[]) => {
    if (points.length === 0) return;

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);

    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }

    ctx.closePath();
  };

  // Draw vertices
  const drawVertices = (ctx: CanvasRenderingContext2D, points: Point[], isSelected: boolean) => {
    const vertexSize = props.config.vertexSize / props.state.zoom;

    ctx.fillStyle = isSelected ? "#3b82f6" : "#6b7280";

    for (const point of points) {
      ctx.beginPath();
      ctx.arc(point.x, point.y, vertexSize, 0, 2 * Math.PI);
      ctx.fill();
    }
  };

  // Draw bounding box
  const drawBoundingBox = (ctx: CanvasRenderingContext2D, polygon: Polygon) => {
    const bounds = getPolygonBounds(polygon);

    ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
    ctx.lineWidth = 1 / props.state.zoom;
    ctx.setLineDash([5 / props.state.zoom, 5 / props.state.zoom]);

    ctx.strokeRect(bounds.min.x, bounds.min.y, bounds.max.x - bounds.min.x, bounds.max.y - bounds.min.y);

    ctx.setLineDash([]);
  };

  // Draw current polygon being created
  const drawCurrentPolygon = (ctx: CanvasRenderingContext2D) => {
    const points = currentPolygon();
    if (points.length === 0) return;

    ctx.strokeStyle = "#f59e0b";
    ctx.fillStyle = "rgba(245, 158, 11, 0.2)";
    ctx.lineWidth = props.config.edgeThickness / props.state.zoom;

    // Draw polygon
    drawPolygon(ctx, points);
    ctx.fill();
    ctx.stroke();

    // Draw vertices
    drawVertices(ctx, points, true);

    // Draw line to mouse position
    if (props.state.mousePosition) {
      ctx.strokeStyle = "#f59e0b";
      ctx.setLineDash([5 / props.state.zoom, 5 / props.state.zoom]);
      ctx.beginPath();
      ctx.moveTo(points[points.length - 1].x, points[points.length - 1].y);
      ctx.lineTo(props.state.mousePosition.x, props.state.mousePosition.y);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  };

  // Get polygon bounds
  const getPolygonBounds = (polygon: Polygon): { min: Point; max: Point } => {
    const points = polygon.points;
    const xs = points.map(p => p.x);
    const ys = points.map(p => p.y);

    return {
      min: { x: Math.min(...xs), y: Math.min(...ys) },
      max: { x: Math.max(...xs), y: Math.max(...ys) },
    };
  };

  // Handle mouse events
  const handleMouseDown = (event: MouseEvent) => {
    if (!props.config.enabled) return;

    const rect = canvasRef?.getBoundingClientRect();
    if (!rect) return;

    const x = (event.clientX - rect.left) / props.state.zoom - props.state.panOffset.x;
    const y = (event.clientY - rect.top) / props.state.zoom - props.state.panOffset.y;

    const point = { x, y };

    if (props.state.isCreating) {
      // Add point to current polygon
      setCurrentPolygon(prev => [...prev, point]);
      setIsDrawing(true);
    } else {
      // Check for vertex/edge selection
      const selectedSegmentation = findSegmentationAtPoint(point);
      if (selectedSegmentation) {
        props.onSegmentationSelect?.(selectedSegmentation.id);
        setIsDragging(true);
        setDragStart(point);
      }
    }
  };

  const handleMouseUp = (event: MouseEvent) => {
    // Handle polygon completion
    if (isDrawing() && currentPolygon().length >= 3) {
      const polygon = PolygonOps.create(currentPolygon());
      if (PolygonOps.area(polygon) > props.config.minPolygonArea) {
        props.onSegmentationCreate?.(polygon);
      }
      setCurrentPolygon([]);
      setIsDrawing(false);
    }

    // Handle dragging
    if (isDragging()) {
      setIsDragging(false);
      setDragStart(undefined);
    }
  };

  const handleDoubleClick = (event: MouseEvent) => {
    if (isDrawing() && currentPolygon().length >= 3) {
      // Complete polygon on double click
      const polygon = PolygonOps.create(currentPolygon());
      if (PolygonOps.area(polygon) > props.config.minPolygonArea) {
        props.onSegmentationCreate?.(polygon);
      }
      setCurrentPolygon([]);
      setIsDrawing(false);
    }
  };

  // Find segmentation at point
  const findSegmentationAtPoint = (point: Point): SegmentationData | undefined => {
    for (const segmentation of props.segmentations) {
      if (PolygonOps.contains(segmentation.polygon, point)) {
        return segmentation;
      }
    }
    return undefined;
  };

  // Redraw canvas when dependencies change
  createEffect(() => {
    drawCanvas();
  });

  // Redraw on state changes
  createEffect(() => {
    if (props.state.selectedSegmentation || props.state.hoveredSegmentation) {
      drawCanvas();
    }
  });

  createEffect(() => {
    if (props.segmentations.length > 0) {
      drawCanvas();
    }
  });

  // Handle window resize
  const handleResize = () => {
    updateCanvasSize();
  };

  onMount(() => {
    window.addEventListener("resize", handleResize);
  });

  onCleanup(() => {
    window.removeEventListener("resize", handleResize);
  });

  return (
    <div class={`segmentation-canvas ${props.class || ""}`}>
      <canvas
        ref={canvasRef}
        width={canvasSize().width}
        height={canvasSize().height}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onDoubleClick={handleDoubleClick}
        onMouseMove={canvasInteraction.handleMouseMove}
        onWheel={canvasInteraction.handleWheel}
        class="segmentation-canvas-element"
      />

      <img ref={imageRef} src={props.imageSrc} style={{ display: "none" }} alt="Segmentation target" />

      <Show when={!imageLoaded()}>
        <div class="segmentation-canvas-loading">Loading image...</div>
      </Show>
    </div>
  );
};
