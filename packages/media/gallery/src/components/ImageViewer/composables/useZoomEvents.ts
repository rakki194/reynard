/**
 * Zoom Event Handlers
 * Composable for handling zoom-related interactions
 */

import type { ImageViewerState, ImageViewerConfig } from "../types";

export interface UseZoomEventsReturn {
  handleWheel: (event: WheelEvent) => void;
  handleZoomIn: () => void;
  handleZoomOut: () => void;
}

export const useZoomEvents = (
  config: ImageViewerConfig,
  state: () => ImageViewerState,
  setState: (updater: (prev: ImageViewerState) => ImageViewerState) => void
): UseZoomEventsReturn => {
  const handleWheel = (event: WheelEvent) => {
    if (!config.enableZoom) return;

    event.preventDefault();
    const delta = event.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(config.minZoom, Math.min(config.maxZoom, state().zoom * delta));

    setState(prev => ({ ...prev, zoom: newZoom }));
  };

  const handleZoomIn = () => {
    const newZoom = Math.min(config.maxZoom, state().zoom * 1.2);
    setState(prev => ({ ...prev, zoom: newZoom }));
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(config.minZoom, state().zoom / 1.2);
    setState(prev => ({ ...prev, zoom: newZoom }));
  };

  return {
    handleWheel,
    handleZoomIn,
    handleZoomOut,
  };
};
