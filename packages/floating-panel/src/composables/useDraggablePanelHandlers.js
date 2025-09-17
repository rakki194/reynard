/**
 * Draggable Panel Handlers
 *
 * Event handlers for draggable panels.
 */
import { createPointerDownHandler } from "./useDraggablePanelPointerDown.js";
import { createPointerMoveHandler } from "./useDraggablePanelPointerMove.js";
/**
 * Create draggable panel handlers
 */
export function createDraggablePanelHandlers(core, onDragStart, onDrag, onDragEnd) {
    const pointerDownHandler = createPointerDownHandler(core, onDragStart);
    const pointerMoveHandler = createPointerMoveHandler(onDrag);
    const handlePointerUp = () => {
        const [, setDragState] = core.dragState;
        setDragState((prev) => ({ ...prev, isDragging: false }));
        onDragEnd?.(core.position[0]());
    };
    return {
        handlePointerDown: pointerDownHandler.handlePointerDown,
        handlePointerMove: pointerMoveHandler.handlePointerMove,
        handlePointerUp,
    };
}
