/**
 * File Processing Utilities for Multi-Modal Gallery
 *
 * Provides utility functions for file processing and type detection.
 */
/**
 * Get color for file type
 * @param fileType - The file type
 * @returns CSS color string
 */
export function getTypeColor(fileType) {
    const colors = {
        image: "#4CAF50", // Green
        video: "#FF9800", // Orange
        audio: "#9C27B0", // Purple
        text: "#2196F3", // Blue
        document: "#607D8B", // Blue Grey
        unknown: "#9E9E9E", // Grey
    };
    return colors[fileType] || colors.unknown;
}
/**
 * Get icon for file type
 * @param fileType - The file type
 * @returns Icon name
 */
export function getTypeIcon(fileType) {
    const icons = {
        image: "image",
        video: "video",
        audio: "audio",
        text: "text",
        document: "document",
        unknown: "file",
    };
    return icons[fileType] || icons.unknown;
}
/**
 * Get human-readable file type name
 * @param fileType - The file type
 * @returns Human-readable name
 */
export function getTypeName(fileType) {
    const names = {
        image: "Image",
        video: "Video",
        audio: "Audio",
        text: "Text",
        document: "Document",
        unknown: "Unknown",
    };
    return names[fileType] || names.unknown;
}
/**
 * Check if file type supports thumbnails
 * @param fileType - The file type
 * @returns True if thumbnails are supported
 */
export function supportsThumbnails(fileType) {
    return fileType === "image" || fileType === "video";
}
/**
 * Check if file type supports preview
 * @param fileType - The file type
 * @returns True if preview is supported
 */
export function supportsPreview(fileType) {
    return fileType === "image" || fileType === "video" || fileType === "audio" || fileType === "text";
}
/**
 * Check if file type supports editing
 * @param fileType - The file type
 * @returns True if editing is supported
 */
export function supportsEditing(fileType) {
    return fileType === "text" || fileType === "image";
}
