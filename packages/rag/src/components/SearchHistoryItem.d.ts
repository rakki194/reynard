/**
 * Search History Item Component
 *
 * Individual search history item display component.
 */
import { Component } from "solid-js";
import type { SearchHistoryItem, RAGModality } from "../types";
export interface SearchHistoryItemProps {
    item: SearchHistoryItem;
    onSearchAgain: (query: string, modality: RAGModality) => void;
    onRemoveItem: (id: string) => void;
}
export declare const SearchHistoryItem: Component<SearchHistoryItemProps>;
