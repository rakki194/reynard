/**
 * TagBubbleSuggestionsWrapper Component
 *
 * Wrapper component for conditional rendering of suggestions.
 */
import { Component } from "solid-js";
export interface TagBubbleSuggestionsWrapperProps {
    isOpen: () => boolean;
    suggestions: () => string[];
    selectedIndex: () => number;
    onSuggestionClick: (suggestion: string) => void;
    suggestionsListRef: HTMLDivElement | undefined;
}
export declare const TagBubbleSuggestionsWrapper: Component<TagBubbleSuggestionsWrapperProps>;
