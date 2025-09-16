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
export const createTagBubbleClasses = (options: TagBubbleClassOptions) => {
  const { isEditing, isHovered, isFocused, props } = options;

  return {
    "tag-bubble": true,
    "tag-bubble--editing": isEditing,
    "tag-bubble--hovered": isHovered,
    "tag-bubble--focused": isFocused,
    "tag-bubble--editable": props.editable !== false,
    "tag-bubble--removable": props.removable !== false,
    [`tag-bubble--${props.size || "medium"}`]: true,
    // Enhanced OKLCH variant classes
    "tag-bubble--muted": props.variant === "muted",
    "tag-bubble--vibrant": props.variant === "vibrant",
    "tag-bubble--intense": !!(props.intensity && props.intensity > 1.5),
    "tag-bubble--subtle": !!(props.intensity && props.intensity < 0.8),
  };
};
