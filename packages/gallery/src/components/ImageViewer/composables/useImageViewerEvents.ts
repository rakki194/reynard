/**
 * ImageViewer Event Handlers
 * Orchestrates all image viewer event handling
 */

import type { ImageViewerState, ImageViewerConfig } from "../types";
import { useZoomEvents } from "./useZoomEvents";
import { usePanEvents } from "./usePanEvents";
import { useNavigationEvents } from "./useNavigationEvents";

export interface UseImageViewerEventsReturn {
  handleWheel: (event: WheelEvent) => void;
  handleMouseDown: (event: MouseEvent) => void;
  handleMouseMove: (event: MouseEvent) => void;
  handleMouseUp: () => void;
  handleZoomIn: () => void;
  handleZoomOut: () => void;
  handleReset: () => void;
  handleFitToView: () => void;
}

export const useImageViewerEvents = (
  config: ImageViewerConfig,
  state: () => ImageViewerState,
  setState: (updater: (prev: ImageViewerState) => ImageViewerState) => void,
  containerRef: () => HTMLDivElement | undefined,
  imageRef: () => HTMLImageElement | undefined,
): UseImageViewerEventsReturn => {
  const zoomEvents = useZoomEvents(config, state, setState);
  const panEvents = usePanEvents(config, state, setState);
  const navEvents = useNavigationEvents(
    config,
    state,
    setState,
    containerRef,
    imageRef,
  );

  return {
    ...zoomEvents,
    ...panEvents,
    ...navEvents,
  };
};
