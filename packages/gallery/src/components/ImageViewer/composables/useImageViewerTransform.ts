/**
 * ImageViewer Transform Management
 * Composable for managing CSS transforms and styling
 */

import { createEffect } from "solid-js";
import type { ImageViewerState } from "../types";

export interface UseImageViewerTransformReturn {
  imageClasses: () => string;
  applyTransforms: (containerRef: HTMLDivElement | undefined) => void;
}

export const useImageViewerTransform = (
  state: () => ImageViewerState,
  enablePan: boolean
): UseImageViewerTransformReturn => {
  const imageClasses = () => {
    const currentState = state();
    const baseClass = "reynard-image-viewer__image";
    const draggingClass = currentState.isDragging
      ? " reynard-image-viewer__image--dragging"
      : "";
    const panEnabledClass = enablePan
      ? " reynard-image-viewer__image--pan-enabled"
      : "";
    return baseClass + draggingClass + panEnabledClass;
  };

  const applyTransforms = (containerRef: HTMLDivElement | undefined) => {
    const currentState = state();
    if (containerRef) {
      containerRef.style.setProperty("--pan-x", `${currentState.panX}px`);
      containerRef.style.setProperty("--pan-y", `${currentState.panY}px`);
      containerRef.style.setProperty("--zoom", currentState.zoom.toString());
    }
  };

  return {
    imageClasses,
    applyTransforms,
  };
};
