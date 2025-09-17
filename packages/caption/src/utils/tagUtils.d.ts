/**
 * Tag Utilities
 *
 * Utilities for working with tags including parsing, validation, and formatting.
 */
export declare function splitAndCleanTags(tagString: string): string[];
export declare function cleanTag(tag: string): string;
export declare function validateTag(tag: string): boolean;
export declare function formatTags(tags: string[]): string;
export declare function removeDuplicateTags(tags: string[]): string[];
export declare function sortTags(tags: string[], sortOrder?: "alphabetical" | "length" | "frequency"): string[];
export declare function filterTags(tags: string[], query: string): string[];
export declare function getTagSuggestions(tags: string[], query: string, maxSuggestions?: number): string[];
export declare function mergeTags(tags1: string[], tags2: string[]): string[];
export declare function getTagStats(tags: string[]): {
    total: number;
    unique: number;
    duplicates: number;
    averageLength: number;
    longestTag: string;
    shortestTag: string;
};
