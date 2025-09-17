/**
 * Debug Panel Handlers
 *
 * Event handlers for debug panels.
 */
/**
 * Create debug panel handlers
 */
export function createDebugHandlers(props) {
    const handleHide = () => {
        console.log("🦦> Panel hide requested:", props.id);
        props.onHide?.();
    };
    const handleDragStart = () => {
        console.log("🦦> Panel drag started:", props.id);
        props.onShow?.();
    };
    const handleDrag = (position) => {
        console.log("🦦> Panel dragging:", props.id, position);
        props.onDrag?.(position);
    };
    const handleDragEnd = () => {
        console.log("🦦> Panel drag ended:", props.id);
        props.onHide?.();
    };
    return {
        handleHide,
        handleDragStart,
        handleDrag,
        handleDragEnd,
    };
}
