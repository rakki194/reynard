/**
 * TagBubbleSuggestions Component
 *
 * Renders the autocomplete suggestions dropdown.
 */
import { Component } from "solid-js";
export interface TagBubbleSuggestionsProps {
    suggestions: string[];
    selectedIndex: number;
    onSuggestionClick: (suggestion: string) => void;
    suggestionsListRef: HTMLDivElement | undefined;
    isOpen: boolean;
}
export declare const TagBubbleSuggestions: Component<TagBubbleSuggestionsProps>;
