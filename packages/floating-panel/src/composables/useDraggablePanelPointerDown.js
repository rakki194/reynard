/**
 * Draggable Panel Pointer Down Handler
 *
 * Handles pointer down events for draggable panels.
 */
/**
 * Create pointer down handler
 */
export function createPointerDownHandler(core, onDragStart) {
    let _dragStartPos = { x: 0, y: 0 };
    let initialPanelPos = { top: 0, left: 0 };
    const handlePointerDown = (event) => {
        if (!core.enabled)
            return;
        const target = event.target;
        const panel = core.panelRef();
        if (!panel)
            return;
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
