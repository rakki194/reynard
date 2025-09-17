/**
 * Advanced Panel Handlers
 *
 * Event handlers for advanced panels.
 */
/**
 * Create advanced panel handlers
 */
export function createAdvancedHandlers(props) {
    const handleShow = () => {
        console.log("🦦> Advanced panel shown:", props.id);
        props.onShow?.();
    };
    const handleHide = () => {
        console.log("🦦> Advanced panel hidden:", props.id);
        props.onHide?.();
    };
    const handleDrag = (position) => {
        console.log("🦦> Advanced panel dragged:", props.id, position);
        props.onDrag?.(position);
    };
    const handleResize = (size) => {
        console.log("🦦> Advanced panel resized:", props.id, size);
        props.onResize?.(size);
    };
    return {
        handleShow,
        handleHide,
        handleDrag,
        handleResize,
    };
}
