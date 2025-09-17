/**
 * @fileoverview Search components for documentation sites
 */
import { Component } from "solid-js";
/**
 * Search input component
 */
export declare const DocsSearch: Component<{
    placeholder?: string;
    onSearch: (query: string) => void;
    onClear?: () => void;
    className?: string;
}>;
/**
 * Search results component
 */
export declare const DocsSearchResults: Component<{
    results: Array<{
        id: string;
        title: string;
        description?: string;
        href: string;
        category?: string;
        tags?: string[];
        score?: number;
    }>;
    query: string;
    onResultClick: (result: any) => void;
    className?: string;
}>;
/**
 * Search suggestions component
 */
export declare const DocsSearchSuggestions: Component<{
    suggestions: string[];
    onSuggestionClick: (suggestion: string) => void;
    className?: string;
}>;
/**
 * Advanced search component
 */
export declare const DocsAdvancedSearch: Component<{
    onSearch: (filters: {
        query: string;
        category?: string;
        tags?: string[];
        dateRange?: {
            start: string;
            end: string;
        };
    }) => void;
    categories?: string[];
    tags?: string[];
    className?: string;
}>;
/**
 * Search modal component
 */
export declare const DocsSearchModal: Component<{
    isOpen: boolean;
    onClose: () => void;
    onSearch: (query: string) => void;
    results: any[];
    onResultClick: (result: any) => void;
    suggestions?: string[];
    className?: string;
}>;
