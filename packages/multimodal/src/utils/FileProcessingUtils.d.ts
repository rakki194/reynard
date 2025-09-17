/**
 * File Processing Utilities for Multi-Modal Gallery
 *
 * Provides utility functions for file processing and type detection.
 */
import type { MediaType } from "../types";
/**
 * Get color for file type
 * @param fileType - The file type
 * @returns CSS color string
 */
export declare function getTypeColor(fileType: MediaType): string;
/**
 * Get icon for file type
 * @param fileType - The file type
 * @returns Icon name
 */
export declare function getTypeIcon(fileType: MediaType): string;
/**
 * Get human-readable file type name
 * @param fileType - The file type
 * @returns Human-readable name
 */
export declare function getTypeName(fileType: MediaType): string;
/**
 * Check if file type supports thumbnails
 * @param fileType - The file type
 * @returns True if thumbnails are supported
 */
export declare function supportsThumbnails(fileType: MediaType): boolean;
/**
 * Check if file type supports preview
 * @param fileType - The file type
 * @returns True if preview is supported
 */
export declare function supportsPreview(fileType: MediaType): boolean;
/**
 * Check if file type supports editing
 * @param fileType - The file type
 * @returns True if editing is supported
 */
export declare function supportsEditing(fileType: MediaType): boolean;
