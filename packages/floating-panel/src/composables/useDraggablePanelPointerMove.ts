/**
 * Draggable Panel Pointer Move Handler
 *
 * Handles pointer move events for draggable panels.
 */

import type { PanelPosition } from "../types.js";

export interface PointerMoveHandler {
  handlePointerMove: (event: globalThis.PointerEvent) => void;
}

/**
 * Create pointer move handler
 */
export function createPointerMoveHandler(
  onDrag?: (position: PanelPosition) => void,
): PointerMoveHandler {
  const handlePointerMove = (event: globalThis.PointerEvent) => {
    // This will be implemented with proper state management
    // For now, just a placeholder
    onDrag?.({ top: event.clientY, left: event.clientX });
  };

  return { handlePointerMove };
}
