/**
 * File type validation utilities for the processing pipeline.
 *
 * Handles file type checking and validation against supported extensions.
 */
export declare class FileTypeValidator {
    private supportedExtensions;
    constructor(supportedExtensions?: Set<string>);
    /**
     * Check if file type is supported
     */
    isSupported(file: File | string): boolean;
    /**
     * Get file extension from filename
     */
    getFileExtension(filename: string): string;
    /**
     * Get file type information
     */
    getFileTypeInfo(extension: string): import("../..").FileTypeInfo;
    /**
     * Get all supported extensions
     */
    getAllSupportedExtensions(): Set<string>;
    /**
     * Check if extension is supported
     */
    isExtensionSupported(extension: string): boolean;
    /**
     * Update supported extensions
     */
    updateSupportedExtensions(extensions: Set<string>): void;
    /**
     * Add supported extension
     */
    addSupportedExtension(extension: string): void;
    /**
     * Remove supported extension
     */
    removeSupportedExtension(extension: string): void;
    /**
     * Get current supported extensions
     */
    getSupportedExtensions(): Set<string>;
}
