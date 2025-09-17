/**
 * Image utility functions for file handling and validation
 */
/**
 * Check if a file is an image
 * @param file - File to check
 * @returns True if file is an image
 */
export declare function isImageFile(file: File): boolean;
/**
 * Get file extension from filename
 * @param filename - The filename to extract extension from
 * @returns File extension with dot (e.g., '.jpg')
 */
export declare function getFileExtension(filename: string): string;
/**
 * Format file size in human-readable format
 * @param bytes - File size in bytes
 * @returns Formatted file size string
 */
export declare function formatFileSize(bytes: number): string;
