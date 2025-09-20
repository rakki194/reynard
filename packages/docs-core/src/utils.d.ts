/**
 * @fileoverview Utility functions for Reynard documentation system
 */
/**
 * Generate a URL-friendly slug from a string
 */
export declare function generateSlug(text: any): any;
/**
 * Extract headings from HTML content
 */
export declare function extractHeadings(html: any): {
    id: string;
    text: string;
    level: number;
}[];
/**
 * Generate table of contents from headings
 */
export declare function generateTableOfContents(headings: any): {
    id: any;
    text: any;
    level: any;
    children: never[];
}[];
/**
 * Validate documentation metadata
 */
export declare function validateMetadata(metadata: any): {
    isValid: boolean;
    errors: string[];
};
/**
 * Sort pages by order and title
 */
export declare function sortPages(pages: any): any[];
/**
 * Sort sections by order and title
 */
export declare function sortSections(sections: any): any[];
/**
 * Filter pages by criteria
 */
export declare function filterPages(pages: any, criteria: any): any;
/**
 * Calculate reading time for content
 */
export declare function calculateReadingTime(content: any): number;
/**
 * Extract code blocks from content
 */
export declare function extractCodeBlocks(content: any): {
    language: string;
    code: string;
    startLine: number;
    endLine: number;
}[];
/**
 * Generate a unique ID for documentation elements
 */
export declare function generateId(prefix?: string): string;
/**
 * Format date for display
 */
export declare function formatDate(date: any): any;
/**
 * Format relative time
 */
export declare function formatRelativeTime(date: any): any;
/**
 * Sanitize HTML content
 */
export declare function sanitizeHtml(html: any): string;
/**
 * Deep merge objects
 */
export declare function deepMerge(target: any, source: any): any;
/**
 * Debounce function
 */
export declare function debounce(func: any, wait: any): (...args: any[]) => void;
/**
 * Throttle function
 */
export declare function throttle(func: any, limit: any): (...args: any[]) => void;
