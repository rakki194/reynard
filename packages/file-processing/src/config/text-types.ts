/**
 * Text file type definitions for the Reynard File Processing system.
 * 
 * This module defines supported text file extensions, MIME types, and
 * processing capabilities for text files.
 */

/**
 * Supported text file extensions
 */
export const TEXT_EXTENSIONS = new Set([
  // Plain text
  ".txt",
  ".md",
  ".rst",
  ".tex",
  ".log",
  ".csv",
  ".tsv",
  // Data formats
  ".json",
  ".xml",
  ".yaml",
  ".yml",
  ".toml",
  ".ini",
  ".cfg",
  ".conf",
  // Structured data
  ".parquet",
  ".arrow",
  ".feather",
  ".h5",
  ".hdf5",
  ".pkl",
  ".pickle",
  // Scientific data
  ".npy",
  ".npz",
  ".mat",
  ".sav",
  ".rdata",
  ".joblib",
]);

/**
 * Text MIME types mapping
 */
export const TEXT_MIME_TYPES: Record<string, string> = {
  ".txt": "text/plain",
  ".md": "text/markdown",
  ".json": "application/json",
  ".xml": "application/xml",
  ".csv": "text/csv",
  ".yaml": "text/yaml",
  ".yml": "text/yaml",
  ".toml": "application/toml",
};

/**
 * Get MIME type for a text extension
 */
export function getTextMimeType(extension: string): string {
  const ext = extension.toLowerCase();
  return TEXT_MIME_TYPES[ext] || "text/plain";
}

/**
 * Check if extension is a text file
 */
export function isTextExtension(extension: string): boolean {
  return TEXT_EXTENSIONS.has(extension.toLowerCase());
}
