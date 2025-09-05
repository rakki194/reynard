/**
 * ImageViewer Component
 * Advanced image viewer with zoom, pan, and navigation capabilities
 */

import {
  Component,
  createSignal,
  createEffect,
  onCleanup,
  splitProps,
  Show,
} from "solid-js";
import { Button } from "@reynard/components";
import "./ImageViewer.css";

export interface ImageViewerProps {
  /** Source URL of the image */
  src: string;
  /** Alt text for accessibility */
  alt?: string;
  /** Initial zoom level (1.0 = 100%) */
  initialZoom?: number;
  /** Minimum zoom level */
  minZoom?: number;
  /** Maximum zoom level */
  maxZoom?: number;
  /** Whether to enable panning */
  enablePan?: boolean;
  /** Whether to enable zooming */
  enableZoom?: boolean;
  /** Whether to show zoom controls */
  showZoomControls?: boolean;
  /** Whether to show navigation controls */
  showNavigationControls?: boolean;
  /** Callback when zoom changes */
  onZoomChange?: (zoom: number) => void;
  /** Callback when pan changes */
  onPanChange?: (x: number, y: number) => void;
  /** Custom class name */
  class?: string;
}

export interface ImageViewerState {
  zoom: number;
  panX: number;
  panY: number;
  isDragging: boolean;
  lastMousePos: { x: number; y: number };
}

const defaultProps = {
  initialZoom: 1.0,
  minZoom: 0.1,
  maxZoom: 10.0,
  enablePan: true,
  enableZoom: true,
  showZoomControls: true,
  showNavigationControls: true,
};

export const ImageViewer: Component<ImageViewerProps> = (props) => {
  const merged = { ...defaultProps, ...props };
  const [local] = splitProps(merged, [
    "src",
    "alt",
    "initialZoom",
    "minZoom",
    "maxZoom",
    "enablePan",
    "enableZoom",
    "showZoomControls",
    "showNavigationControls",
    "onZoomChange",
    "onPanChange",
    "class",
  ]);

  // State
  const [state, setState] = createSignal<ImageViewerState>({
    zoom: local.initialZoom || 1.0,
    panX: 0,
    panY: 0,
    isDragging: false,
    lastMousePos: { x: 0, y: 0 },
  });

  // Refs
  let containerRef: HTMLDivElement | undefined;
  let imageRef: HTMLImageElement | undefined;

  // Effects
  createEffect(() => {
    const currentState = state();
    local.onZoomChange?.(currentState.zoom);
  });

  createEffect(() => {
    const currentState = state();
    local.onPanChange?.(currentState.panX, currentState.panY);
  });

  // Cleanup
  onCleanup(() => {
    // Remove any global event listeners if needed
  });

  // Event handlers
  const handleWheel = (event: WheelEvent) => {
    if (!local.enableZoom) return;

    event.preventDefault();
    const delta = event.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(
      local.minZoom || 0.1,
      Math.min(local.maxZoom || 10.0, state().zoom * delta),
    );

    setState((prev) => ({ ...prev, zoom: newZoom }));
  };

  const handleMouseDown = (event: MouseEvent) => {
    if (!local.enablePan) return;

    event.preventDefault();
    setState((prev) => ({
      ...prev,
      isDragging: true,
      lastMousePos: { x: event.clientX, y: event.clientY },
    }));
  };

  const handleMouseMove = (event: MouseEvent) => {
    if (!local.enablePan || !state().isDragging) return;

    event.preventDefault();
    const deltaX = event.clientX - state().lastMousePos.x;
    const deltaY = event.clientY - state().lastMousePos.y;

    setState((prev) => ({
      ...prev,
      panX: prev.panX + deltaX,
      panY: prev.panY + deltaY,
      lastMousePos: { x: event.clientX, y: event.clientY },
    }));
  };

  const handleMouseUp = () => {
    setState((prev) => ({ ...prev, isDragging: false }));
  };

  const handleZoomIn = () => {
    const newZoom = Math.min(local.maxZoom || 10.0, state().zoom * 1.2);
    setState((prev) => ({ ...prev, zoom: newZoom }));
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(local.minZoom || 0.1, state().zoom / 1.2);
    setState((prev) => ({ ...prev, zoom: newZoom }));
  };

  const handleReset = () => {
    setState((prev) => ({
      ...prev,
      zoom: local.initialZoom || 1.0,
      panX: 0,
      panY: 0,
    }));
  };

  const handleFitToView = () => {
    if (!containerRef || !imageRef) return;

    const containerRect = containerRef.getBoundingClientRect();
    const imageRect = imageRef.getBoundingClientRect();

    const scaleX = containerRect.width / imageRect.width;
    const scaleY = containerRect.height / imageRect.height;
    const scale = Math.min(scaleX, scaleY, 1);

    setState((prev) => ({
      ...prev,
      zoom: scale,
      panX: 0,
      panY: 0,
    }));
  };

  // Computed CSS classes
  const imageClasses = () => {
    const currentState = state();
    const baseClass = "reynard-image-viewer__image";
    const draggingClass = currentState.isDragging
      ? " reynard-image-viewer__image--dragging"
      : "";
    const panEnabledClass = local.enablePan
      ? " reynard-image-viewer__image--pan-enabled"
      : "";
    return baseClass + draggingClass + panEnabledClass;
  };

  // Set CSS custom properties for transform
  createEffect(() => {
    const currentState = state();
    if (containerRef) {
      containerRef.style.setProperty("--pan-x", `${currentState.panX}px`);
      containerRef.style.setProperty("--pan-y", `${currentState.panY}px`);
      containerRef.style.setProperty("--zoom", currentState.zoom.toString());
    }
  });

  const zoomPercentage = () => Math.round(state().zoom * 100);

  return (
    <div
      class={`reynard-image-viewer ${local.class || ""}`}
      ref={containerRef}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Image */}
      <img
        ref={imageRef}
        src={local.src}
        alt={local.alt || ""}
        class={imageClasses()}
        draggable={false}
      />

      {/* Zoom Controls */}
      <Show when={local.showZoomControls}>
        <div class="reynard-image-viewer__zoom-controls">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleZoomOut}
            disabled={state().zoom <= (local.minZoom || 0.1)}
          >
            -
          </Button>
          <span class="reynard-image-viewer__zoom-level">
            {zoomPercentage()}%
          </span>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleZoomIn}
            disabled={state().zoom >= (local.maxZoom || 10.0)}
          >
            +
          </Button>
        </div>
      </Show>

      {/* Navigation Controls */}
      <Show when={local.showNavigationControls}>
        <div class="reynard-image-viewer__nav-controls">
          <Button size="sm" variant="ghost" onClick={handleReset}>
            Reset
          </Button>
          <Button size="sm" variant="ghost" onClick={handleFitToView}>
            Fit
          </Button>
        </div>
      </Show>

      {/* Instructions */}
      <Show when={local.enableZoom || local.enablePan}>
        <div class="reynard-image-viewer__instructions">
          <Show when={local.enableZoom}>
            <span>Scroll to zoom</span>
          </Show>
          <Show when={local.enablePan}>
            <span>Drag to pan</span>
          </Show>
        </div>
      </Show>
    </div>
  );
};
