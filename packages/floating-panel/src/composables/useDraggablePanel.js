/**
 * Draggable Panel Composable
 *
 * Handles drag functionality for floating panels with constraints and snap points.
 * Based on Yipyap's sophisticated drag handling patterns.
 */
import { createEffect, onCleanup } from "solid-js";
import { createDraggablePanelCore, } from "./useDraggablePanelCore.js";
import { createDraggablePanelHandlers } from "./useDraggablePanelHandlers.js";
import { constrainPosition, snapToPoint } from "./useDraggablePanelUtils.js";
export function useDraggablePanel(panelRef, options = {}) {
    const { initialPosition = { top: 0, left: 0 }, constraints, snapPoints, dragHandle, onDragStart, onDrag, onDragEnd, enabled = true, } = options;
    const core = createDraggablePanelCore(panelRef, initialPosition, constraints, snapPoints, dragHandle, enabled);
    const handlers = createDraggablePanelHandlers(core, onDragStart, onDrag, onDragEnd);
    // Apply constraints and snap points
    createEffect(() => {
        const currentPosition = core.position[0]();
        const constrainedPosition = constrainPosition(currentPosition, constraints);
        const snappedPosition = snapToPoint(constrainedPosition, snapPoints);
        if (constrainedPosition !== currentPosition ||
            snappedPosition !== constrainedPosition) {
            const [, setPosition] = core.position;
            setPosition(snappedPosition);
        }
    });
    // Cleanup
    onCleanup(() => {
        document.removeEventListener("pointermove", handlers.handlePointerMove);
        document.removeEventListener("pointerup", handlers.handlePointerUp);
        document.removeEventListener("pointercancel", handlers.handlePointerUp);
    });
    return {
        position: core.position[0],
        setPosition: core.position[1],
        dragState: () => {
            const [dragState] = core.dragState;
            return dragState();
        },
        startDrag: handlers.handlePointerDown,
        updateDrag: handlers.handlePointerMove,
        endDrag: handlers.handlePointerUp,
        snapToPoint: (position) => snapToPoint(position, snapPoints),
        constrainPosition: (position) => constrainPosition(position, constraints),
    };
}
