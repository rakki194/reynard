/**
 * Document file type definitions for the Reynard File Processing system.
 *
 * This module defines supported document file extensions, MIME types, and
 * processing capabilities for document files.
 */
/**
 * Supported document file extensions
 */
export declare const DOCUMENT_EXTENSIONS: Set<string>;
/**
 * Document MIME types mapping
 */
export declare const DOCUMENT_MIME_TYPES: Record<string, string>;
/**
 * Get MIME type for a document extension
 */
export declare function getDocumentMimeType(extension: string): string;
/**
 * Check if extension is a document file
 */
export declare function isDocumentExtension(extension: string): boolean;
