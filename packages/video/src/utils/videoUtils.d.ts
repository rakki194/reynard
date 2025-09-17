/**
 * Video utility functions for file handling and validation
 */
/**
 * Check if a file is a video file
 * @param file - File to check
 * @returns True if file is a video file
 */
export declare function isVideoFile(file: File): boolean;
/**
 * Get file extension from filename
 * @param filename - The filename to extract extension from
 * @returns File extension with dot (e.g., '.mp4')
 */
export declare function getFileExtension(filename: string): string;
/**
 * Format duration in human-readable format
 * @param seconds - Duration in seconds
 * @returns Formatted duration string
 */
export declare function formatDuration(seconds?: number): string;
/**
 * Format file size in human-readable format
 * @param bytes - File size in bytes
 * @returns Formatted file size string
 */
export declare function formatFileSize(bytes: number): string;
