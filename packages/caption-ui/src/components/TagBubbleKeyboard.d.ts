/**
 * TagBubbleKeyboard Composable
 *
 * Handles keyboard shortcuts and navigation for the TagBubble component.
 */
import { Accessor, Setter } from "solid-js";
export interface TagBubbleKeyboardConfig {
    isEditing: Accessor<boolean>;
    isFocused: Accessor<boolean>;
    query: Accessor<string>;
    isOpen: Accessor<boolean>;
    selectedIndex: Accessor<number>;
    getSelectedSuggestion: () => string | undefined;
    selectNextSuggestion: () => void;
    selectPreviousSuggestion: () => void;
    setQuery: Setter<string>;
    finishEditing: () => void;
    cancelEditing: () => void;
    startEditing: () => void;
    handleRemove: () => void;
    props: {
        onRemove: () => void;
    };
}
export declare function createTagBubbleKeyboard(config: TagBubbleKeyboardConfig): {
    handleKeyDown: (e: KeyboardEvent) => void;
};
