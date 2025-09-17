/**
 * Search History Filter Composable
 *
 * Provides filtering and sorting functionality for search history items.
 */
import { Accessor } from "solid-js";
import type { SearchHistoryItem, RAGModality } from "../types";
export interface SearchHistoryFilterState {
    searchQuery: string;
    selectedModality: RAGModality | "all";
    sortBy: "timestamp" | "resultCount" | "topScore";
    sortOrder: "asc" | "desc";
}
export declare function useSearchHistoryFilter(searchHistory: Accessor<SearchHistoryItem[]>): {
    searchQuery: Accessor<string>;
    selectedModality: Accessor<"all" | RAGModality>;
    sortBy: Accessor<"resultCount" | "timestamp" | "topScore">;
    sortOrder: Accessor<"desc" | "asc">;
    setSearchQuery: import("solid-js").Setter<string>;
    setSelectedModality: import("solid-js").Setter<"all" | RAGModality>;
    setSortBy: import("solid-js").Setter<"resultCount" | "timestamp" | "topScore">;
    setSortOrder: import("solid-js").Setter<"desc" | "asc">;
    filteredHistory: Accessor<SearchHistoryItem[]>;
};
