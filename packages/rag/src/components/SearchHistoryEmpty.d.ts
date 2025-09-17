/**
 * Search History Empty State Component
 *
 * Empty state display when no search history is found.
 */
import { Component } from "solid-js";
export interface SearchHistoryEmptyProps {
    hasFilters: boolean;
}
export declare const SearchHistoryEmpty: Component<SearchHistoryEmptyProps>;
