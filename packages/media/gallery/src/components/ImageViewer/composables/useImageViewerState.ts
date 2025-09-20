/**
 * ImageViewer State Management
 * Composable for managing image viewer state
 */

import { createSignal, createEffect } from "solid-js";
import type { ImageViewerState, ImageViewerConfig } from "../types";

export interface UseImageViewerStateReturn {
  state: () => ImageViewerState;
  setState: (updater: (prev: ImageViewerState) => ImageViewerState) => void;
  zoomPercentage: () => number;
}

export const useImageViewerState = (
  config: ImageViewerConfig,
  onZoomChange?: (zoom: number) => void,
  onPanChange?: (x: number, y: number) => void
): UseImageViewerStateReturn => {
  const [state, setState] = createSignal<ImageViewerState>({
    zoom: config.initialZoom,
    panX: 0,
    panY: 0,
    isDragging: false,
    lastMousePos: { x: 0, y: 0 },
  });

  // Effects for callbacks
  createEffect(() => {
    const currentState = state();
    onZoomChange?.(currentState.zoom);
  });

  createEffect(() => {
    const currentState = state();
    onPanChange?.(currentState.panX, currentState.panY);
  });

  const zoomPercentage = () => Math.round(state().zoom * 100);

  return {
    state,
    setState,
    zoomPercentage,
  };
};
