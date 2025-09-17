/**
 * Code file type definitions for the Reynard File Processing system.
 *
 * This module defines supported code file extensions, MIME types, and
 * processing capabilities for code files.
 */
/**
 * Supported code file extensions
 */
export declare const CODE_EXTENSIONS: Set<string>;
/**
 * Code MIME types mapping
 */
export declare const CODE_MIME_TYPES: Record<string, string>;
/**
 * Get MIME type for a code extension
 */
export declare function getCodeMimeType(extension: string): string;
/**
 * Check if extension is a code file
 */
export declare function isCodeExtension(extension: string): boolean;
