/**
 * Image file type definitions for the Reynard File Processing system.
 *
 * This module defines supported image file extensions, MIME types, and
 * processing capabilities for image files.
 */
/**
 * Supported image file extensions
 */
export const IMAGE_EXTENSIONS = new Set([
    // Raster formats
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".webp",
    ".bmp",
    ".tiff",
    ".tif",
    // Modern formats
    ".jxl",
    ".avif",
    ".heic",
    ".heif",
    ".jp2",
    ".j2k",
    ".jpx",
    ".jpf",
    // Vector formats
    ".svg",
    ".eps",
    ".ai",
    ".cdr",
    ".wmf",
    ".emf",
    // Raw formats
    ".raw",
    ".cr2",
    ".nef",
    ".arw",
    ".dng",
    ".orf",
    ".rw2",
    ".pef",
    ".srw",
]);
/**
 * Image MIME types mapping
 */
export const IMAGE_MIME_TYPES = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".bmp": "image/bmp",
    ".tiff": "image/tiff",
    ".tif": "image/tiff",
    ".jxl": "image/jxl",
    ".avif": "image/avif",
    ".heic": "image/heic",
    ".heif": "image/heif",
    ".svg": "image/svg+xml",
};
/**
 * Get MIME type for an image extension
 */
export function getImageMimeType(extension) {
    const ext = extension.toLowerCase();
    return IMAGE_MIME_TYPES[ext] || "image/jpeg";
}
/**
 * Check if extension is an image file
 */
export function isImageExtension(extension) {
    return IMAGE_EXTENSIONS.has(extension.toLowerCase());
}
