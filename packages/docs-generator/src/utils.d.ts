/**
 * @fileoverview Utility functions for documentation generator
 */
/**
 * Generate a URL-friendly slug from a string
 */
export declare function generateSlug(text: string): string;
/**
 * Format package name for display
 */
export declare function formatPackageName(name: string): string;
/**
 * Check if a file exists
 */
export declare function fileExists(filePath: string): Promise<boolean>;
/**
 * Read file if it exists
 */
export declare function readFileIfExists(filePath: string): Promise<string | null>;
/**
 * Write file with directory creation
 */
export declare function writeFileWithDirs(filePath: string, content: string): Promise<void>;
/**
 * Copy file with directory creation
 */
export declare function copyFileWithDirs(src: string, dest: string): Promise<void>;
/**
 * Find files matching a pattern
 */
export declare function findFiles(dir: string, pattern: RegExp, excludePatterns?: RegExp[]): Promise<string[]>;
/**
 * Extract title from markdown content
 */
export declare function extractTitleFromMarkdown(content: string): string | null;
/**
 * Extract description from markdown content
 */
export declare function extractDescriptionFromMarkdown(content: string): string | null;
/**
 * Sanitize filename for filesystem
 */
export declare function sanitizeFilename(filename: string): string;
/**
 * Get relative path between two files
 */
export declare function getRelativePath(from: string, to: string): string;
/**
 * Check if a path is within a directory
 */
export declare function isWithinDirectory(filePath: string, dirPath: string): boolean;
/**
 * Format file size in human readable format
 */
export declare function formatFileSize(bytes: number): string;
/**
 * Format date for display
 */
export declare function formatDate(date: Date | string): string;
/**
 * Format relative time
 */
export declare function formatRelativeTime(date: Date | string): string;
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
/**
 * Retry function with exponential backoff
 */
export declare function retry<T>(fn: () => Promise<T>, maxAttempts?: number, baseDelay?: number): Promise<T>;
/**
 * Progress tracker for long-running operations
 */
export declare class ProgressTracker {
    private total;
    private current;
    private onProgress;
    constructor(total: number, onProgress: (progress: number) => void);
    increment(): void;
    setProgress(current: number): void;
    getProgress(): number;
}
