/**
 * Image file type definitions for the Reynard File Processing system.
 *
 * This module defines supported image file extensions, MIME types, and
 * processing capabilities for image files.
 */
/**
 * Supported image file extensions
 */
export declare const IMAGE_EXTENSIONS: Set<string>;
/**
 * Image MIME types mapping
 */
export declare const IMAGE_MIME_TYPES: Record<string, string>;
/**
 * Get MIME type for an image extension
 */
export declare function getImageMimeType(extension: string): string;
/**
 * Check if extension is an image file
 */
export declare function isImageExtension(extension: string): boolean;
