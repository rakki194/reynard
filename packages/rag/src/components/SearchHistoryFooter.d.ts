/**
 * Search History Footer Component
 *
 * Footer section with statistics and limits.
 */
import { Component } from "solid-js";
export interface SearchHistoryFooterProps {
    filteredCount: number;
    totalCount: number;
    maxItems?: number;
}
export declare const SearchHistoryFooter: Component<SearchHistoryFooterProps>;
