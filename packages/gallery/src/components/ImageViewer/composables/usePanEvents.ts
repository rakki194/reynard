/**
 * Pan Event Handlers
 * Composable for handling pan-related interactions
 */

import type { ImageViewerState, ImageViewerConfig } from "../types";

export interface UsePanEventsReturn {
  handleMouseDown: (event: MouseEvent) => void;
  handleMouseMove: (event: MouseEvent) => void;
  handleMouseUp: () => void;
}

export const usePanEvents = (
  config: ImageViewerConfig,
  state: () => ImageViewerState,
  setState: (updater: (prev: ImageViewerState) => ImageViewerState) => void
): UsePanEventsReturn => {
  const handleMouseDown = (event: MouseEvent) => {
    if (!config.enablePan) return;

    event.preventDefault();
    setState((prev) => ({
      ...prev,
      isDragging: true,
      lastMousePos: { x: event.clientX, y: event.clientY },
    }));
  };

  const handleMouseMove = (event: MouseEvent) => {
    if (!config.enablePan || !state().isDragging) return;

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

  return {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  };
};
