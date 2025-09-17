/**
 * TagBubble Helper Functions
 *
 * Utility functions for TagBubble components.
 */
import { TagBubbleViewProps } from "./TagBubbleView.types";
/**
 * Extracts container handlers from TagBubbleViewProps
 */
export declare const extractContainerHandlers: (handlers: TagBubbleViewProps["handlers"]) => {
    handleMouseEnter: () => void;
    handleMouseLeave: () => void;
    handleDoubleClick: () => void;
    handleFocus: () => void;
    handleBlur: () => void;
};
