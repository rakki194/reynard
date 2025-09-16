/**
 * TagBubbleView Types
 *
 * Type definitions for the TagBubbleView component.
 */

import { TagBubbleProps } from "reynard-caption-core";

export interface TagBubbleViewProps {
  props: TagBubbleProps;
  isEditing: () => boolean;
  isHovered: () => boolean;
  isFocused: () => boolean;
  tagBubbleRef: HTMLDivElement | undefined;
  inputRef: HTMLInputElement | undefined;
  suggestionsList: HTMLDivElement | undefined;
  autocomplete: {
    query: () => string;
    isOpen: () => boolean;
    suggestions: () => string[];
    selectedIndex: () => number;
  };
  handlers: {
    handleMouseEnter: () => void;
    handleMouseLeave: () => void;
    handleDoubleClick: () => void;
    handleFocus: () => void;
    handleBlur: () => void;
    handleInput: (e: Event) => void;
    handleKeyDown: (e: KeyboardEvent) => void;
    handleRemove: () => void;
    handleSuggestionClick: (suggestion: string) => void;
  };
}
