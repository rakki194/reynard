/**
 * TagBubble Helper Functions
 *
 * Utility functions for TagBubble components.
 */

import { TagBubbleViewProps } from "./TagBubbleView.types";

/**
 * Extracts container handlers from TagBubbleViewProps
 */
export const extractContainerHandlers = (handlers: TagBubbleViewProps["handlers"]) => ({
  handleMouseEnter: handlers.handleMouseEnter,
  handleMouseLeave: handlers.handleMouseLeave,
  handleDoubleClick: handlers.handleDoubleClick,
  handleFocus: handlers.handleFocus,
  handleBlur: handlers.handleBlur,
});
