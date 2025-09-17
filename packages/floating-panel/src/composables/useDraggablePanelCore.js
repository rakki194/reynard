/**
 * Draggable Panel Core
 *
 * Core functionality for draggable panels.
 */
import { createSignal } from "solid-js";
/**
 * Create draggable panel core
 */
export function createDraggablePanelCore(panelRef, initialPosition, constraints, snapPoints, dragHandle, enabled = true) {
    const position = createSignal(initialPosition);
    const dragState = createSignal({
        isDragging: false,
        startPosition: initialPosition,
        currentPosition: initialPosition,
        delta: { x: 0, y: 0 },
    });
    return {
        position,
        dragState,
        panelRef,
        constraints,
        snapPoints,
        dragHandle,
        enabled,
    };
}
