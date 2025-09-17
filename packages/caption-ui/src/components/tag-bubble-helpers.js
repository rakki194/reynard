/**
 * TagBubble Helper Functions
 *
 * Utility functions for TagBubble components.
 */
/**
 * Extracts container handlers from TagBubbleViewProps
 */
export const extractContainerHandlers = (handlers) => ({
    handleMouseEnter: handlers.handleMouseEnter,
    handleMouseLeave: handlers.handleMouseLeave,
    handleDoubleClick: handlers.handleDoubleClick,
    handleFocus: handlers.handleFocus,
    handleBlur: handlers.handleBlur,
});
