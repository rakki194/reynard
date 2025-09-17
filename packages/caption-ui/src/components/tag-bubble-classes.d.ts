/**
 * TagBubble Class Utilities
 *
 * Utility functions for generating CSS classes for TagBubble components.
 */
import { TagBubbleProps } from "reynard-caption-core";
export interface TagBubbleClassOptions {
    isEditing: boolean;
    isHovered: boolean;
    isFocused: boolean;
    props: TagBubbleProps;
}
/**
 * Generates the classList object for TagBubble components
 */
export declare const createTagBubbleClasses: (options: TagBubbleClassOptions) => {
    [x: string]: boolean;
    "tag-bubble": boolean;
    "tag-bubble--editing": boolean;
    "tag-bubble--hovered": boolean;
    "tag-bubble--focused": boolean;
    "tag-bubble--editable": boolean;
    "tag-bubble--removable": boolean;
    "tag-bubble--muted": boolean;
    "tag-bubble--vibrant": boolean;
    "tag-bubble--intense": boolean;
    "tag-bubble--subtle": boolean;
};
