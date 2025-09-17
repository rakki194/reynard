/**
 * Search Form Component
 *
 * Handles the search input and button interface
 * for RAG queries.
 */
import { Component } from "solid-js";
export interface SearchFormProps {
    query: string;
    onQueryChange: (query: string) => void;
    onSearch: () => void;
    onKeyPress: (e: KeyboardEvent) => void;
    isSearching: boolean;
    error: string | null;
}
export declare const SearchForm: Component<SearchFormProps>;
