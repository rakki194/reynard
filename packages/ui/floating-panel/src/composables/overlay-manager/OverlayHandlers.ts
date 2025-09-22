/**
 * Overlay Handlers
 *
 * Event handlers for overlay manager.
 */

import type { PanelEventHandlers } from "../../types.js";

/**
 * Create overlay handlers
 */
export function createOverlayHandlers(eventHandlers: PanelEventHandlers = {}) {
  const handlePanelShow = (panel: unknown) => {
    eventHandlers.onPanelShow?.(panel);
  };

  const handlePanelHide = (panel: unknown) => {
    eventHandlers.onPanelHide?.(panel);
  };

  const handlePanelDrag = (panel: unknown, position: { top: number; left: number }) => {
    eventHandlers.onPanelDrag?.(panel, position);
  };

  const handlePanelResize = (panel: unknown, size: { width: number; height: number }) => {
    eventHandlers.onPanelResize?.(panel, size);
  };

  return {
    handlePanelShow,
    handlePanelHide,
    handlePanelDrag,
    handlePanelResize,
  };
}
