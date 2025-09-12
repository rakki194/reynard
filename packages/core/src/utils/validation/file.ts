/**
 * File Validation Utilities
 * Functions for validating file-related data
 */

/**
 * File type validation
 */
export function isValidFileType(
  filename: string,
  allowedTypes: string[],
): boolean {
  const extension = filename.split(".").pop()?.toLowerCase();
  return extension ? allowedTypes.includes(extension) : false;
}

/**
 * File size validation (in bytes)
 */
export function isValidFileSize(size: number, maxSize: number): boolean {
  return size <= maxSize;
}
