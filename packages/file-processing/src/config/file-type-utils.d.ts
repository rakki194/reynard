/**
 * Utility functions for file type operations in the Reynard File Processing system.
 *
 * This module provides helper functions for checking file support,
 * getting categories, and managing file type collections.
 */
/**
 * Check if a file extension is supported for processing
 */
export declare function isSupportedExtension(extension: string): boolean;
/**
 * Get all supported file extensions
 */
export declare function getAllSupportedExtensions(): Set<string>;
/**
 * Get file category from extension
 */
export declare function getFileCategory(extension: string): string;
