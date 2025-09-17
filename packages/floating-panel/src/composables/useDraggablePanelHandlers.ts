/**
 * Draggable Panel Handlers
 *
 * Event handlers for draggable panels.
 */

import type { PanelPosition, DraggablePanelCore } from "./useDraggablePanelCore.js";
import { createPointerDownHandler } from "./useDraggablePanelPointerDown.js";
import { createPointerMoveHandler } from "./useDraggablePanelPointerMove.js";

export interface DraggablePanelHandlers {
  handlePointerDown: (event: globalThis.PointerEvent) => void;
  handlePointerMove: (event: globalThis.PointerEvent) => void;
  handlePointerUp: () => void;
}

/**
 * Create draggable panel handlers
 */
export function createDraggablePanelHandlers(
  core: DraggablePanelCore,
  onDragStart?: (position: PanelPosition) => void,
  onDrag?: (position: PanelPosition) => void,
  onDragEnd?: (position: PanelPosition) => void
): DraggablePanelHandlers {
  const pointerDownHandler = createPointerDownHandler(core, onDragStart);
  const pointerMoveHandler = createPointerMoveHandler(onDrag);

  const handlePointerUp = () => {
    const [, setDragState] = core.dragState;
    setDragState(prev => ({ ...prev, isDragging: false }));
    onDragEnd?.(core.position[0]());
  };

  return {
    handlePointerDown: pointerDownHandler.handlePointerDown,
    handlePointerMove: pointerMoveHandler.handlePointerMove,
    handlePointerUp,
  };
}
