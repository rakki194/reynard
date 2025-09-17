/**
 * Search History Filters Component
 *
 * Filter and sort controls for search history.
 */
import { Component } from "solid-js";
import type { RAGModality } from "../types";
export interface SearchHistoryFiltersProps {
    searchQuery: string;
    selectedModality: RAGModality | "all";
    sortBy: "timestamp" | "resultCount" | "topScore";
    sortOrder: "asc" | "desc";
    onSearchQueryChange: (value: string) => void;
    onModalityChange: (value: RAGModality | "all") => void;
    onSortByChange: (value: "timestamp" | "resultCount" | "topScore") => void;
    onSortOrderChange: (value: "asc" | "desc") => void;
}
export declare const SearchHistoryFilters: Component<SearchHistoryFiltersProps>;
