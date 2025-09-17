/**
 * TagBubbleHandlers Composable
 *
 * Handles all event handlers for the TagBubble component.
 */
import { TagBubbleProps } from "reynard-caption-core";
import { Accessor, Setter } from "solid-js";
export interface TagBubbleHandlersConfig {
    isEditing: Accessor<boolean>;
    setIsEditing: Setter<boolean>;
    isHovered: Accessor<boolean>;
    setIsHovered: Setter<boolean>;
    isFocused: Accessor<boolean>;
    setIsFocused: Setter<boolean>;
    query: Accessor<string>;
    setQuery: Setter<string>;
    props: TagBubbleProps;
    inputRef: HTMLInputElement | undefined;
    suggestionsList: HTMLDivElement | undefined;
    clearSuggestions: () => void;
    setIsOpen: (open: boolean) => void;
    isOpen: Accessor<boolean>;
    selectedIndex: Accessor<number>;
    getSelectedSuggestion: () => string | undefined;
    selectNextSuggestion: () => void;
    selectPreviousSuggestion: () => void;
}
export declare function createTagBubbleHandlers(config: TagBubbleHandlersConfig): {
    startEditing: () => void;
    finishEditing: () => void;
    cancelEditing: () => void;
    handleInput: (e: Event) => void;
    handleBlur: () => void;
    handleFocus: () => void;
    handleMouseEnter: () => void;
    handleMouseLeave: () => void;
    handleRemove: () => void;
    handleDoubleClick: () => void;
    handleSuggestionClick: (suggestion: string) => void;
    closeAllSuggestions: () => void;
};
