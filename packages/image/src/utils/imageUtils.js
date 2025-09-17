/**
 * Image utility functions for file handling and validation
 */
/**
 * Check if a file is an image
 * @param file - File to check
 * @returns True if file is an image
 */
export function isImageFile(file) {
    const imageExtensions = [
        ".jpg",
        ".jpeg",
        ".png",
        ".gif",
        ".webp",
        ".bmp",
        ".tiff",
        ".svg",
    ];
    return imageExtensions.includes(getFileExtension(file.name));
}
/**
 * Get file extension from filename
 * @param filename - The filename to extract extension from
 * @returns File extension with dot (e.g., '.jpg')
 */
export function getFileExtension(filename) {
    return "." + filename.split(".").pop()?.toLowerCase();
}
/**
 * Format file size in human-readable format
 * @param bytes - File size in bytes
 * @returns Formatted file size string
 */
export function formatFileSize(bytes) {
    if (bytes === 0)
        return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}
