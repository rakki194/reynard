/**
 * Archive file type definitions for the Reynard File Processing system.
 *
 * This module defines supported archive file extensions, MIME types, and
 * processing capabilities for archive files.
 */
/**
 * Supported archive file extensions
 */
export declare const ARCHIVE_EXTENSIONS: Set<string>;
/**
 * Archive MIME types mapping
 */
export declare const ARCHIVE_MIME_TYPES: Record<string, string>;
/**
 * Get MIME type for an archive extension
 */
export declare function getArchiveMimeType(extension: string): string;
/**
 * Check if extension is an archive file
 */
export declare function isArchiveExtension(extension: string): boolean;
