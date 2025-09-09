/**
 * Audio file type definitions for the Reynard File Processing system.
 *
 * This module defines supported audio file extensions, MIME types, and
 * processing capabilities for audio files.
 */

/**
 * Supported audio file extensions
 */
export const AUDIO_EXTENSIONS = new Set([
  // Lossy formats
  ".mp3",
  ".aac",
  ".ogg",
  ".wma",
  ".opus",
  // Lossless formats
  ".wav",
  ".flac",
  ".alac",
  ".ape",
  ".wv",
  ".tta",
  // High resolution formats
  ".dsd",
  ".dff",
  ".dsf",
  ".m4a",
  ".aiff",
  ".aif",
]);

/**
 * Audio MIME types mapping
 */
export const AUDIO_MIME_TYPES: Record<string, string> = {
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".flac": "audio/flac",
  ".aac": "audio/aac",
  ".ogg": "audio/ogg",
  ".m4a": "audio/mp4",
  ".aiff": "audio/aiff",
  ".aif": "audio/aiff",
};

/**
 * Get MIME type for an audio extension
 */
export function getAudioMimeType(extension: string): string {
  const ext = extension.toLowerCase();
  return AUDIO_MIME_TYPES[ext] || "audio/mpeg";
}

/**
 * Check if extension is an audio file
 */
export function isAudioExtension(extension: string): boolean {
  return AUDIO_EXTENSIONS.has(extension.toLowerCase());
}
