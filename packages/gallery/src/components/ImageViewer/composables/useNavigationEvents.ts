/**
 * Navigation Event Handlers
 * Composable for handling navigation-related interactions
 */

import type { ImageViewerState, ImageViewerConfig } from "../types";

export interface UseNavigationEventsReturn {
  handleReset: () => void;
  handleFitToView: () => void;
}

export const useNavigationEvents = (
  config: ImageViewerConfig,
  state: () => ImageViewerState,
  setState: (updater: (prev: ImageViewerState) => ImageViewerState) => void,
  containerRef: () => HTMLDivElement | undefined,
  imageRef: () => HTMLImageElement | undefined
): UseNavigationEventsReturn => {
  const handleReset = () => {
    setState((prev) => ({
      ...prev,
      zoom: config.initialZoom,
      panX: 0,
      panY: 0,
    }));
  };

  const handleFitToView = () => {
    const container = containerRef();
    const image = imageRef();
    if (!container || !image) return;

    const containerRect = container.getBoundingClientRect();
    const imageRect = image.getBoundingClientRect();

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

  return {
    handleReset,
    handleFitToView,
  };
};
