/**
 * Tag Autocomplete Component
 *
 * Advanced tag autocomplete system with backend integration,
 * suggestion management, and keyboard navigation. Built for the Reynard caption system.
 *
 * Features:
 * - Backend integration for tag suggestions
 * - Debounced search with configurable delay
 * - Keyboard navigation (Arrow keys, Enter, Escape)
 * - Suggestion filtering and ranking
 * - Integration with existing tag systems
 */
import { Component } from "solid-js";
export interface TagSuggestion {
    text: string;
    count?: number;
    category?: string;
    metadata?: Record<string, any>;
}
export interface TagAutocompleteProps {
    /** Current input value */
    value: string;
    /** Callback when value changes */
    onChange: (value: string) => void;
    /** Callback when a suggestion is selected */
    onSuggestionSelect: (suggestion: string) => void;
    /** Callback when input is submitted */
    onSubmit?: (value: string) => void;
    /** Minimum characters before showing suggestions */
    minCharacters?: number;
    /** Maximum number of suggestions to show */
    maxSuggestions?: number;
    /** Debounce delay in milliseconds */
    debounceDelay?: number;
    /** Backend API endpoint for suggestions */
    apiEndpoint?: string;
    /** Whether to show suggestion counts */
    showCounts?: boolean;
    /** Whether to show suggestion categories */
    showCategories?: boolean;
    /** Placeholder text */
    placeholder?: string;
    /** Whether the input is disabled */
    disabled?: boolean;
    /** Additional CSS class */
    className?: string;
}
export declare const TagAutocomplete: Component<TagAutocompleteProps>;
