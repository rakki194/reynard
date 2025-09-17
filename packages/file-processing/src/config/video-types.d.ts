/**
 * Video file type definitions for the Reynard File Processing system.
 *
 * This module defines supported video file extensions, MIME types, and
 * processing capabilities for video files.
 */
/**
 * Supported video file extensions
 */
export declare const VIDEO_EXTENSIONS: Set<string>;
/**
 * Video MIME types mapping
 */
export declare const VIDEO_MIME_TYPES: Record<string, string>;
/**
 * Get MIME type for a video extension
 */
export declare function getVideoMimeType(extension: string): string;
/**
 * Check if extension is a video file
 */
export declare function isVideoExtension(extension: string): boolean;
