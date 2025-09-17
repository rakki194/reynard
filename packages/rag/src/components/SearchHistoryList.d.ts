/**
 * Search History List Component
 *
 * List section with items and empty state.
 */
import { Component } from "solid-js";
import type { SearchHistoryItem, RAGModality } from "../types";
export interface SearchHistoryListProps {
    filteredHistory: SearchHistoryItem[];
    searchQuery: string;
    selectedModality: RAGModality | "all";
    onSearchAgain: (query: string, modality: RAGModality) => void;
    onRemoveItem: (id: string) => void;
}
export declare const SearchHistoryList: Component<SearchHistoryListProps>;
