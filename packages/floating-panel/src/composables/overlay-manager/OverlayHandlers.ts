/**
 * Overlay Handlers
 *
 * Event handlers for overlay manager.
 */

import type { PanelEventHandlers, FloatingPanel } from "../../types.js";

/**
 * Create overlay handlers
 */
export function createOverlayHandlers(eventHandlers: PanelEventHandlers = {}) {
  const handlePanelShow = (panel: FloatingPanel) => {
    eventHandlers.onPanelShow?.(panel);
  };

  const handlePanelHide = (panel: FloatingPanel) => {
    eventHandlers.onPanelHide?.(panel);
  };

  const handlePanelDrag = (panel: FloatingPanel, position: { top: number; left: number }) => {
    eventHandlers.onPanelDrag?.(panel, position);
  };

  const handlePanelResize = (panel: FloatingPanel, size: { width: number; height: number }) => {
    eventHandlers.onPanelResize?.(panel, size);
  };

  return {
    handlePanelShow,
    handlePanelHide,
    handlePanelDrag,
    handlePanelResize,
  };
}
