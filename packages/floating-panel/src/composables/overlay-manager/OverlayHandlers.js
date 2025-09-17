/**
 * Overlay Handlers
 *
 * Event handlers for overlay manager.
 */
/**
 * Create overlay handlers
 */
export function createOverlayHandlers(eventHandlers = {}) {
    const handlePanelShow = (panel) => {
        eventHandlers.onPanelShow?.(panel);
    };
    const handlePanelHide = (panel) => {
        eventHandlers.onPanelHide?.(panel);
    };
    const handlePanelDrag = (panel, position) => {
        eventHandlers.onPanelDrag?.(panel, position);
    };
    const handlePanelResize = (panel, size) => {
        eventHandlers.onPanelResize?.(panel, size);
    };
    return {
        handlePanelShow,
        handlePanelHide,
        handlePanelDrag,
        handlePanelResize,
    };
}
