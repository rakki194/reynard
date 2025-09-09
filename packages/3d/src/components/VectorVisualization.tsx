import {
  Component,
  Show,
  createSignal,
  createMemo,
  onMount,
  onCleanup,
  createEffect,
} from "solid-js";
import type { VectorVisualizationProps } from "../types/rendering";
import "./VectorVisualization.css";

export const VectorVisualization: Component<VectorVisualizationProps> = (
  props,
) => {
  const [canvasRef, setCanvasRef] = createSignal<HTMLCanvasElement>();
  const [isExpanded, setIsExpanded] = createSignal(false);
  const [selectedVector, setSelectedVector] = createSignal<number>(-1);
  const [selectedRegion, setSelectedRegion] = createSignal<{
    start: number;
    end: number;
  } | null>(null);
  const [hoveredCell, setHoveredCell] = createSignal<{
    vectorIndex: number;
    valueIndex: number;
  } | null>(null);
  const [tooltipPosition, setTooltipPosition] = createSignal<{
    x: number;
    y: number;
  } | null>(null);
  const [zoomLevel, setZoomLevel] = createSignal(1);
  const [panOffset, setPanOffset] = createSignal({ x: 0, y: 0 });

  let animationFrameId: number | null = null;
  let isDragging = false;
  let lastMousePos = { x: 0, y: 0 };

  const width = () => props.width || 400;
  const height = () => props.height || 300;

  const normalizedVectors = createMemo(() => {
    if (!props.vectors || props.vectors.length === 0) return [];

    // Normalize vectors to [0, 1] range
    const allValues = props.vectors.flat();
    const minVal = Math.min(...allValues);
    const maxVal = Math.max(...allValues);
    const range = maxVal - minVal;

    if (range === 0) return props.vectors;

    return props.vectors.map((vector) =>
      vector.map((val) => (val - minVal) / range),
    );
  });

  const colormap = createMemo(() => {
    const map = props.colormap || "viridis";
    return getColormap(map);
  });

  const getColormap = (name: string) => {
    const colormaps = {
      viridis: (t: number) => {
        const r = Math.round(255 * (0.267 + 0.004 * t + 0.329 * t * t));
        const g = Math.round(255 * (0.004 + 0.329 * t + 0.329 * t * t));
        const b = Math.round(255 * (0.329 + 0.329 * t - 0.329 * t * t));
        return `rgb(${r}, ${g}, ${b})`;
      },
      plasma: (t: number) => {
        const r = Math.round(255 * (0.329 + 0.329 * t + 0.329 * t * t));
        const g = Math.round(255 * (0.004 + 0.329 * t + 0.329 * t * t));
        const b = Math.round(255 * (0.329 + 0.329 * t - 0.329 * t * t));
        return `rgb(${r}, ${g}, ${b})`;
      },
      inferno: (t: number) => {
        const r = Math.round(255 * (0.329 + 0.329 * t + 0.329 * t * t));
        const g = Math.round(255 * (0.004 + 0.329 * t + 0.329 * t * t));
        const b = Math.round(255 * (0.329 + 0.329 * t - 0.329 * t * t));
        return `rgb(${r}, ${g}, ${b})`;
      },
      magma: (t: number) => {
        const r = Math.round(255 * (0.329 + 0.329 * t + 0.329 * t * t));
        const g = Math.round(255 * (0.004 + 0.329 * t + 0.329 * t * t));
        const b = Math.round(255 * (0.329 + 0.329 * t - 0.329 * t * t));
        return `rgb(${r}, ${g}, ${b})`;
      },
      cividis: (t: number) => {
        const r = Math.round(255 * (0.329 + 0.329 * t + 0.329 * t * t));
        const g = Math.round(255 * (0.004 + 0.329 * t + 0.329 * t * t));
        const b = Math.round(255 * (0.329 + 0.329 * t - 0.329 * t * t));
        return `rgb(${r}, ${g}, ${b})`;
      },
    };
    return colormaps[name as keyof typeof colormaps] || colormaps.viridis;
  };

  const drawVisualization = () => {
    const canvas = canvasRef();
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const vectors = normalizedVectors();
    if (vectors.length === 0) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply zoom and pan
    ctx.save();
    ctx.translate(panOffset().x, panOffset().y);
    ctx.scale(zoomLevel(), zoomLevel());

    const cellWidth = canvas.width / vectors[0].length;
    const cellHeight = canvas.height / vectors.length;

    // Draw vectors
    vectors.forEach((vector, vectorIndex) => {
      vector.forEach((value, valueIndex) => {
        const x = valueIndex * cellWidth;
        const y = vectorIndex * cellHeight;

        // Get color from colormap
        const color = colormap()(value);

        // Apply opacity
        const opacity = props.pointOpacity || 0.8;
        ctx.fillStyle = color
          .replace("rgb", "rgba")
          .replace(")", `, ${opacity})`);

        // Draw cell
        ctx.fillRect(x, y, cellWidth, cellHeight);

        // Draw border
        ctx.strokeStyle = "rgba(0, 0, 0, 0.1)";
        ctx.lineWidth = 0.5;
        ctx.strokeRect(x, y, cellWidth, cellHeight);

        // Draw value text if enabled
        if (props.showValues && cellWidth > 20 && cellHeight > 20) {
          ctx.fillStyle = value > 0.5 ? "white" : "black";
          ctx.font = "10px Arial";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(
            props.vectors[vectorIndex][valueIndex].toFixed(2),
            x + cellWidth / 2,
            y + cellHeight / 2,
          );
        }
      });
    });

    // Draw selection
    if (selectedVector() >= 0) {
      const y = selectedVector() * cellHeight;
      ctx.strokeStyle = "rgba(255, 0, 0, 0.8)";
      ctx.lineWidth = 2;
      ctx.strokeRect(0, y, canvas.width, cellHeight);
    }

    // Draw region selection
    if (selectedRegion()) {
      const { start, end } = selectedRegion()!;
      ctx.fillStyle = "rgba(0, 123, 255, 0.2)";
      ctx.fillRect(
        start * cellWidth,
        0,
        (end - start) * cellWidth,
        canvas.height,
      );
    }

    ctx.restore();
  };

  const handleMouseMove = (event: MouseEvent) => {
    const canvas = canvasRef();
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Update tooltip position
    setTooltipPosition({ x: event.clientX, y: event.clientY });

    // Calculate cell coordinates
    const vectors = normalizedVectors();
    if (vectors.length === 0) return;

    const cellWidth = canvas.width / vectors[0].length;
    const cellHeight = canvas.height / vectors.length;

    const vectorIndex = Math.floor(y / cellHeight);
    const valueIndex = Math.floor(x / cellWidth);

    if (
      vectorIndex >= 0 &&
      vectorIndex < vectors.length &&
      valueIndex >= 0 &&
      valueIndex < vectors[0].length
    ) {
      setHoveredCell({ vectorIndex, valueIndex });
    } else {
      setHoveredCell(null);
    }

    // Handle dragging
    if (isDragging && props.enablePan) {
      const deltaX = x - lastMousePos.x;
      const deltaY = y - lastMousePos.y;
      setPanOffset((prev) => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY,
      }));
    }

    lastMousePos = { x, y };
  };

  const handleMouseDown = (event: MouseEvent) => {
    if (props.enablePan) {
      isDragging = true;
    }
  };

  const handleMouseUp = () => {
    isDragging = false;
  };

  const handleWheel = (event: WheelEvent) => {
    if (!props.enableZoom) return;

    event.preventDefault();
    const delta = event.deltaY > 0 ? 0.9 : 1.1;
    setZoomLevel((prev) => Math.max(0.1, Math.min(5, prev * delta)));
  };

  const handleClick = (event: MouseEvent) => {
    const canvas = canvasRef();
    if (!canvas || !props.interactive) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const vectors = normalizedVectors();
    if (vectors.length === 0) return;

    const cellWidth = canvas.width / vectors[0].length;
    const cellHeight = canvas.height / vectors.length;

    const vectorIndex = Math.floor(y / cellHeight);
    const valueIndex = Math.floor(x / cellWidth);

    if (vectorIndex >= 0 && vectorIndex < vectors.length) {
      setSelectedVector(vectorIndex);
      if (props.onVectorSelect) {
        props.onVectorSelect(vectorIndex, props.vectors[vectorIndex]);
      }
    }
  };

  createEffect(() => {
    drawVisualization();
  });

  onMount(() => {
    const canvas = canvasRef();
    if (!canvas) return;

    // Add event listeners
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("wheel", handleWheel);
    canvas.addEventListener("click", handleClick);

    onCleanup(() => {
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mouseup", handleMouseUp);
      canvas.removeEventListener("wheel", handleWheel);
      canvas.removeEventListener("click", handleClick);
    });
  });

  return (
    <div class={`vector-visualization ${props.className || ""}`}>
      <Show when={props.title}>
        <h3 class="visualization-title">{props.title}</h3>
      </Show>

      <div class="visualization-container">
        <canvas
          ref={setCanvasRef}
          width={width()}
          height={height()}
          class="visualization-canvas"
        />

        <Show when={props.showLegend}>
          <div class="color-legend">
            <div class="legend-title">Value</div>
            <div class="legend-gradient" />
            <div class="legend-labels">
              <span>0</span>
              <span>1</span>
            </div>
          </div>
        </Show>
      </div>

      <Show when={hoveredCell() && props.enableTooltips}>
        <div
          class="tooltip"
          classList={{
            "tooltip-visible": true,
          }}
          style={{
            "--tooltip-x": `${tooltipPosition()?.x || 0}px`,
            "--tooltip-y": `${(tooltipPosition()?.y || 0) - 30}px`,
            "z-index": "1000",
          }}
        >
          <div class="tooltip-content">
            <div>Vector: {hoveredCell()?.vectorIndex}</div>
            <div>
              Value:{" "}
              {props.vectors[hoveredCell()?.vectorIndex || 0]?.[
                hoveredCell()?.valueIndex || 0
              ]?.toFixed(3)}
            </div>
            <Show when={props.labels?.[hoveredCell()?.vectorIndex || 0]}>
              <div>
                Label: {props.labels?.[hoveredCell()?.vectorIndex || 0]}
              </div>
            </Show>
          </div>
        </div>
      </Show>

      <div class="visualization-controls">
        <button
          onClick={() => setIsExpanded(!isExpanded())}
          class="expand-button"
        >
          {isExpanded() ? "Collapse" : "Expand"}
        </button>

        <Show when={props.interactive}>
          <div class="interaction-info">
            <span>Click to select vector</span>
            <Show when={props.enableZoom}>
              <span>Scroll to zoom</span>
            </Show>
            <Show when={props.enablePan}>
              <span>Drag to pan</span>
            </Show>
          </div>
        </Show>
      </div>
    </div>
  );
};
