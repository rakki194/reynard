/**
 * TagBubbleContainer Component
 *
 * Container component that handles the main div structure and event handlers.
 */
import { TagBubbleProps } from "reynard-caption-core";
import { Component } from "solid-js";
export interface TagBubbleContainerProps {
    props: TagBubbleProps;
    isEditing: () => boolean;
    isHovered: () => boolean;
    isFocused: () => boolean;
    tagBubbleRef: HTMLDivElement | undefined;
    handlers: {
        handleMouseEnter: () => void;
        handleMouseLeave: () => void;
        handleDoubleClick: () => void;
        handleFocus: () => void;
        handleBlur: () => void;
    };
    children: any;
}
export declare const TagBubbleContainer: Component<TagBubbleContainerProps>;
