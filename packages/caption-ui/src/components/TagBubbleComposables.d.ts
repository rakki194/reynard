/**
 * TagBubbleComposables
 *
 * Creates and configures all composables for the TagBubble component.
 */
import { TagBubbleProps } from "reynard-caption-core";
import { Accessor, Setter } from "solid-js";
export interface TagBubbleComposablesConfig {
    props: TagBubbleProps;
    isEditing: Accessor<boolean>;
    setIsEditing: Setter<boolean>;
    isHovered: Accessor<boolean>;
    setIsHovered: Setter<boolean>;
    isFocused: Accessor<boolean>;
    setIsFocused: Setter<boolean>;
    inputRef: HTMLInputElement | undefined;
    suggestionsList: HTMLDivElement | undefined;
    tagBubbleRef: HTMLDivElement | undefined;
}
export declare function createTagBubbleComposables(config: TagBubbleComposablesConfig): {
    autocomplete: {
        query: Accessor<string>;
        setQuery: Setter<string>;
        suggestions: Accessor<string[]>;
        setSuggestions: Setter<string[]>;
        selectedIndex: Accessor<number>;
        setSelectedIndex: Setter<number>;
        isOpen: Accessor<boolean>;
        setIsOpen: Setter<boolean>;
        selectNextSuggestion: () => void;
        selectPreviousSuggestion: () => void;
        getSelectedSuggestion: () => string | undefined;
        clearSuggestions: () => void;
        updateSuggestions: (newSuggestions: string[]) => void;
    };
    handlers: {
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
    keyboard: {
        handleKeyDown: (e: KeyboardEvent) => void;
    };
};
