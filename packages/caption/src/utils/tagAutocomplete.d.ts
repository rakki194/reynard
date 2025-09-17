/**
 * Tag Autocomplete Utilities
 *
 * Utilities for tag autocomplete functionality.
 */
export interface TagAutocompleteState {
    query: string;
    suggestions: string[];
    selectedIndex: number;
    isOpen: boolean;
}
export declare function useTagAutocomplete(): {
    query: import("solid-js").Accessor<string>;
    setQuery: import("solid-js").Setter<string>;
    suggestions: import("solid-js").Accessor<string[]>;
    setSuggestions: import("solid-js").Setter<string[]>;
    selectedIndex: import("solid-js").Accessor<number>;
    setSelectedIndex: import("solid-js").Setter<number>;
    isOpen: import("solid-js").Accessor<boolean>;
    setIsOpen: import("solid-js").Setter<boolean>;
    selectNextSuggestion: () => void;
    selectPreviousSuggestion: () => void;
    getSelectedSuggestion: () => string | undefined;
    clearSuggestions: () => void;
    updateSuggestions: (newSuggestions: string[]) => void;
};
export declare function createTagAutocompleteManager(availableTags?: string[], maxSuggestions?: number): {
    updateQuery: (newQuery: string) => void;
    selectSuggestion: (index: number) => string | null;
    selectCurrentSuggestion: () => string | null;
    availableTags: string[];
    maxSuggestions: number;
    query: import("solid-js").Accessor<string>;
    setQuery: import("solid-js").Setter<string>;
    suggestions: import("solid-js").Accessor<string[]>;
    setSuggestions: import("solid-js").Setter<string[]>;
    selectedIndex: import("solid-js").Accessor<number>;
    setSelectedIndex: import("solid-js").Setter<number>;
    isOpen: import("solid-js").Accessor<boolean>;
    setIsOpen: import("solid-js").Setter<boolean>;
    selectNextSuggestion: () => void;
    selectPreviousSuggestion: () => void;
    getSelectedSuggestion: () => string | undefined;
    clearSuggestions: () => void;
    updateSuggestions: (newSuggestions: string[]) => void;
};
