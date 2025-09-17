/**
 * Audio file type definitions for the Reynard File Processing system.
 *
 * This module defines supported audio file extensions, MIME types, and
 * processing capabilities for audio files.
 */
/**
 * Supported audio file extensions
 */
export declare const AUDIO_EXTENSIONS: Set<string>;
/**
 * Audio MIME types mapping
 */
export declare const AUDIO_MIME_TYPES: Record<string, string>;
/**
 * Get MIME type for an audio extension
 */
export declare function getAudioMimeType(extension: string): string;
/**
 * Check if extension is an audio file
 */
export declare function isAudioExtension(extension: string): boolean;
