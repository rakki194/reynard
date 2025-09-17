/**
 * File type validation utilities for the processing pipeline.
 *
 * Handles file type checking and validation against supported extensions.
 */
import { getFileTypeInfo, isSupportedExtension, getAllSupportedExtensions, } from "../../config/file-types";
export class FileTypeValidator {
    constructor(supportedExtensions) {
        Object.defineProperty(this, "supportedExtensions", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.supportedExtensions =
            supportedExtensions || getAllSupportedExtensions();
    }
    /**
     * Check if file type is supported
     */
    isSupported(file) {
        if (typeof file === "string") {
            // URL case - extract extension from path
            const extension = this.getFileExtension(file);
            return isSupportedExtension(extension);
        }
        else {
            // File object case
            const extension = this.getFileExtension(file.name);
            return isSupportedExtension(extension);
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
     * Get file type information
     */
    getFileTypeInfo(extension) {
        return getFileTypeInfo(extension);
    }
    /**
     * Get all supported extensions
     */
    getAllSupportedExtensions() {
        return getAllSupportedExtensions();
    }
    /**
     * Check if extension is supported
     */
    isExtensionSupported(extension) {
        return isSupportedExtension(extension);
    }
    /**
     * Update supported extensions
     */
    updateSupportedExtensions(extensions) {
        this.supportedExtensions = new Set(extensions);
    }
    /**
     * Add supported extension
     */
    addSupportedExtension(extension) {
        this.supportedExtensions.add(extension.toLowerCase());
    }
    /**
     * Remove supported extension
     */
    removeSupportedExtension(extension) {
        this.supportedExtensions.delete(extension.toLowerCase());
    }
    /**
     * Get current supported extensions
     */
    getSupportedExtensions() {
        return new Set(this.supportedExtensions);
    }
}
