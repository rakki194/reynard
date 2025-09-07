/**
 * Video file type definitions for the Reynard File Processing system.
 * 
 * This module defines supported video file extensions, MIME types, and
 * processing capabilities for video files.
 */

/**
 * Supported video file extensions
 */
export const VIDEO_EXTENSIONS = new Set([
  // Common formats
  ".mp4",
  ".avi",
  ".mov",
  ".mkv",
  ".webm",
  ".flv",
  ".wmv",
  ".m4v",
  // High quality formats
  ".mpg",
  ".mpeg",
  ".ts",
  ".mts",
  ".m2ts",
  ".vob",
  ".ogv",
  ".3gp",
  // Professional formats
  ".prores",
  ".dnxhd",
  ".cine",
  ".r3d",
  ".braw",
  ".arw",
]);

/**
 * Video MIME types mapping
 */
export const VIDEO_MIME_TYPES: Record<string, string> = {
  ".mp4": "video/mp4",
  ".avi": "video/x-msvideo",
  ".mov": "video/quicktime",
  ".mkv": "video/x-matroska",
  ".webm": "video/webm",
  ".flv": "video/x-flv",
  ".wmv": "video/x-ms-wmv",
  ".m4v": "video/x-m4v",
  ".mpg": "video/mpeg",
  ".mpeg": "video/mpeg",
};

/**
 * Get MIME type for a video extension
 */
export function getVideoMimeType(extension: string): string {
  const ext = extension.toLowerCase();
  return VIDEO_MIME_TYPES[ext] || "video/mp4";
}

/**
 * Check if extension is a video file
 */
export function isVideoExtension(extension: string): boolean {
  return VIDEO_EXTENSIONS.has(extension.toLowerCase());
}
