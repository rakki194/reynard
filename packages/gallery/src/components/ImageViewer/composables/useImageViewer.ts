/**
 * ImageViewer Main Composable
 * Orchestrates all image viewer functionality
 */

import { createEffect, onCleanup } from "solid-js";
import type { ImageViewerProps, ImageViewerConfig } from "../types";
import {
  useImageViewerState,
  useImageViewerEvents,
  useImageViewerTransform,
} from "./index";

export interface UseImageViewerReturn {
  config: () => ImageViewerConfig;
  state: () => any;
  events: any;
  imageClasses: () => string;
  applyTransforms: (containerRef: HTMLDivElement | undefined) => void;
}

export const useImageViewer = (
  props: ImageViewerProps,
  containerRef: () => HTMLDivElement | undefined,
  imageRef: () => HTMLImageElement | undefined,
): UseImageViewerReturn => {
  // Configuration - computed to avoid reactive variable warnings
  const config = (): ImageViewerConfig => ({
    initialZoom: props.initialZoom || 1.0,
    minZoom: props.minZoom || 0.1,
    maxZoom: props.maxZoom || 10.0,
    enablePan: props.enablePan || true,
    enableZoom: props.enableZoom || true,
    showZoomControls: props.showZoomControls || true,
    showNavigationControls: props.showNavigationControls || true,
  });

  // State management
  const { state, setState } = useImageViewerState(
    config(),
    props.onZoomChange,
    props.onPanChange,
  );

  // Event handlers
  const events = useImageViewerEvents(
    config(),
    state,
    setState,
    containerRef,
    imageRef,
  );

  // Transform management
  const { imageClasses, applyTransforms } = useImageViewerTransform(
    state,
    config().enablePan,
  );

  // Apply transforms when state changes
  createEffect(() => {
    applyTransforms(containerRef());
  });

  // Cleanup
  onCleanup(() => {
    // Remove any global event listeners if needed
  });

  return {
    config,
    state,
    events,
    imageClasses,
    applyTransforms,
  };
};
