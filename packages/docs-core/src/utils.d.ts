/**
 * @fileoverview Utility functions for Reynard documentation system
 */
import type { DocPage, DocSection, DocMetadata } from "./types";
/**
 * Generate a URL-friendly slug from a string
 */
export declare function generateSlug(text: string): string;
/**
 * Extract headings from HTML content
 */
export declare function extractHeadings(html: string): Array<{
    id: string;
    text: string;
    level: number;
}>;
/**
 * Generate table of contents from headings
 */
export declare function generateTableOfContents(headings: Array<{
    id: string;
    text: string;
    level: number;
}>): Array<{
    id: string;
    text: string;
    level: number;
    children: any[];
}>;
/**
 * Validate documentation metadata
 */
export declare function validateMetadata(metadata: DocMetadata): {
    isValid: boolean;
    errors: string[];
};
/**
 * Sort pages by order and title
 */
export declare function sortPages(pages: DocPage[]): DocPage[];
/**
 * Sort sections by order and title
 */
export declare function sortSections(sections: DocSection[]): DocSection[];
/**
 * Filter pages by criteria
 */
export declare function filterPages(pages: DocPage[], criteria: {
    published?: boolean;
    category?: string;
    tags?: string[];
    search?: string;
}): DocPage[];
/**
 * Calculate reading time for content
 */
export declare function calculateReadingTime(content: string): number;
/**
 * Extract code blocks from content
 */
export declare function extractCodeBlocks(content: string): Array<{
    language: string;
    code: string;
    startLine: number;
    endLine: number;
}>;
/**
 * Generate a unique ID for documentation elements
 */
export declare function generateId(prefix?: string): string;
/**
 * Format date for display
 */
export declare function formatDate(date: string | Date): string;
/**
 * Format relative time
 */
export declare function formatRelativeTime(date: string | Date): string;
/**
 * Sanitize HTML content
 */
export declare function sanitizeHtml(html: string): string;
/**
 * Deep merge objects
 */
export declare function deepMerge<T extends Record<string, any>>(target: T, source: Partial<T>): T;
/**
 * Debounce function
 */
export declare function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void;
/**
 * Throttle function
 */
export declare function throttle<T extends (...args: any[]) => any>(func: T, limit: number): (...args: Parameters<T>) => void;
