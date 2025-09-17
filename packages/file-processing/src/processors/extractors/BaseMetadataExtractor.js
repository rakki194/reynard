/**
 * Base metadata extractor interface
 *
 * Provides common functionality for all metadata extractors
 */
export class BaseMetadataExtractor {
    constructor(options = {}) {
        Object.defineProperty(this, "options", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.options = {
            extractExif: true,
            analyzeContent: true,
            detectLanguage: true,
            extractEmbedded: true,
            maxContentLength: 1024 * 1024, // 1MB
            ...options,
        };
    }
    /**
     * Get basic file information
     */
    async getBasicFileInfo(file) {
        const fileInfo = await this.getFileInfo(file);
        if (!fileInfo.success) {
            throw new Error(fileInfo.error);
        }
        const { name, size, type } = fileInfo.data;
        const extension = this.getFileExtension(name);
        const fullPath = typeof file === "string" ? file : file.name;
        const path = fullPath.split("/").slice(0, -1).join("/") || ".";
        return {
            name,
            size,
            mime: type,
            mtime: new Date(),
            path,
            fullPath,
            extension,
            isHidden: name.startsWith("."),
            isDirectory: false,
        };
    }
    /**
     * Get file information
     */
    async getFileInfo(file) {
        try {
            if (typeof file === "string") {
                return {
                    success: true,
                    data: {
                        name: file.split("/").pop() || "unknown",
                        size: 0,
                        type: "unknown",
                    },
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
                };
            }
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : "Failed to get file info",
            };
        }
    }
    /**
     * Get file extension from filename
     */
    getFileExtension(filename) {
        const lastDotIndex = filename.lastIndexOf(".");
        return lastDotIndex !== -1
            ? filename.substring(lastDotIndex).toLowerCase()
            : "";
    }
    /**
     * Load text content from file
     */
    async loadText(file) {
        if (typeof file === "string") {
            const response = await fetch(file);
            return await response.text();
        }
        else {
            return await file.text();
        }
    }
}
