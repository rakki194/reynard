/**
 * File information utilities for thumbnail generation.
 *
 * Provides utilities for extracting file metadata and determining
 * file characteristics needed for thumbnail processing.
 */
/**
 * Get file information from File object or URL string
 */
export async function getFileInfo(file) {
    try {
        if (typeof file === "string") {
            // URL case - we can't get size without fetching
            return {
                success: true,
                data: {
                    name: file.split("/").pop() || "unknown",
                    size: 0,
                    type: "unknown",
                },
                duration: 0,
                timestamp: new Date(),
            };
        }
        else {
            return {
                success: true,
                data: {
                    name: file.name,
                    size: file.size,
                    type: file.type,
                },
                duration: 0,
                timestamp: new Date(),
            };
        }
    }
    catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to get file info",
            duration: 0,
            timestamp: new Date(),
        };
    }
}
/**
 * Get file extension from filename
 */
export function getFileExtension(filename) {
    const lastDotIndex = filename.lastIndexOf(".");
    return lastDotIndex !== -1
        ? filename.substring(lastDotIndex).toLowerCase()
        : "";
}
