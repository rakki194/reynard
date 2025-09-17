/**
 * Draggable Panel Pointer Move Handler
 *
 * Handles pointer move events for draggable panels.
 */
/**
 * Create pointer move handler
 */
export function createPointerMoveHandler(onDrag) {
    const handlePointerMove = (event) => {
        // This will be implemented with proper state management
        // For now, just a placeholder
        onDrag?.({ top: event.clientY, left: event.clientX });
    };
    return { handlePointerMove };
}
