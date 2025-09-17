/**
 * Text file type definitions for the Reynard File Processing system.
 *
 * This module defines supported text file extensions, MIME types, and
 * processing capabilities for text files.
 */
/**
 * Supported text file extensions
 */
export declare const TEXT_EXTENSIONS: Set<string>;
/**
 * Text MIME types mapping
 */
export declare const TEXT_MIME_TYPES: Record<string, string>;
/**
 * Get MIME type for a text extension
 */
export declare function getTextMimeType(extension: string): string;
/**
 * Check if extension is a text file
 */
export declare function isTextExtension(extension: string): boolean;
