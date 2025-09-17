/**
 * RAG Search History Component
 *
 * Component for displaying and managing search history
 * with filtering and quick re-search capabilities.
 */
import { Component } from "solid-js";
import type { SearchHistoryItem, RAGModality } from "../types";
export interface RAGSearchHistoryProps {
    searchHistory: SearchHistoryItem[];
    onSearchAgain: (query: string, modality: RAGModality) => void;
    onClearHistory: () => void;
    onRemoveItem: (id: string) => void;
    maxItems?: number;
    showFilters?: boolean;
}
export declare const RAGSearchHistory: Component<RAGSearchHistoryProps>;
