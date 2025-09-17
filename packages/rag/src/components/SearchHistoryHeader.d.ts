/**
 * Search History Header Component
 *
 * Header section with title and clear action.
 */
import { Component } from "solid-js";
export interface SearchHistoryHeaderProps {
    onClearHistory: () => void;
}
export declare const SearchHistoryHeader: Component<SearchHistoryHeaderProps>;
