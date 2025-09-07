/**
 * Archive file type definitions for the Reynard File Processing system.
 * 
 * This module defines supported archive file extensions, MIME types, and
 * processing capabilities for archive files.
 */

/**
 * Supported archive file extensions
 */
export const ARCHIVE_EXTENSIONS = new Set([
  // Common archives
  ".zip",
  ".rar",
  ".7z",
  ".tar",
  ".gz",
  ".bz2",
  ".xz",
  ".lzma",
  // Disk images
  ".iso",
  ".dmg",
  ".img",
  ".vhd",
  ".vmdk",
  ".vdi",
  ".hdd",
  // Package formats
  ".deb",
  ".rpm",
  ".pkg",
  ".msi",
  ".exe",
  ".app",
  ".apk",
]);

/**
 * Archive MIME types mapping
 */
export const ARCHIVE_MIME_TYPES: Record<string, string> = {
  ".zip": "application/zip",
  ".rar": "application/vnd.rar",
  ".7z": "application/x-7z-compressed",
  ".tar": "application/x-tar",
  ".gz": "application/gzip",
  ".bz2": "application/x-bzip2",
};

/**
 * Get MIME type for an archive extension
 */
export function getArchiveMimeType(extension: string): string {
  const ext = extension.toLowerCase();
  return ARCHIVE_MIME_TYPES[ext] || "application/octet-stream";
}

/**
 * Check if extension is an archive file
 */
export function isArchiveExtension(extension: string): boolean {
  return ARCHIVE_EXTENSIONS.has(extension.toLowerCase());
}
