/**
 * Draggable Panel Pointer Down Handler
 *
 * Handles pointer down events for draggable panels.
 */

import type { PanelPosition, DraggablePanelCore } from "./useDraggablePanelCore.js";

export interface PointerDownHandler {
  handlePointerDown: (event: globalThis.PointerEvent) => void;
}

/**
 * Create pointer down handler
 */
export function createPointerDownHandler(
  core: DraggablePanelCore,
  onDragStart?: (position: PanelPosition) => void
): PointerDownHandler {
  let _dragStartPos = { x: 0, y: 0 };
  let initialPanelPos = { top: 0, left: 0 };

  const handlePointerDown = (event: globalThis.PointerEvent) => {
    if (!core.enabled) return;

    const target = event.target as HTMLElement;
    const panel = core.panelRef();

    if (!panel) return;

    // Check if drag handle is specified and event target matches
    if (core.dragHandle && !target.closest(core.dragHandle)) {
      return;
    }

    // Check if target is draggable
    if (target.closest("[data-no-drag]")) {
      return;
    }

    event.preventDefault();
    _dragStartPos = { x: event.clientX, y: event.clientY };
    initialPanelPos = { ...core.position[0]() };

    const [, setDragState] = core.dragState;
    setDragState({
      isDragging: true,
      startPosition: initialPanelPos,
      currentPosition: initialPanelPos,
      delta: { x: 0, y: 0 },
    });

    onDragStart?.(initialPanelPos);
  };

  return { handlePointerDown };
}
