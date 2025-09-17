/**
 * Image Format Utilities
 *
 * Utilities for handling image formats and validation in Reynard's
 * caption generation system. Provides format detection and validation
 * without heavy image processing dependencies.
 */
export interface ImageFormatInfo {
    extension: string;
    mimeType: string;
    supported: boolean;
    requiresPlugin?: boolean;
    description: string;
}
export declare const BASE_IMAGE_FORMATS: Record<string, ImageFormatInfo>;
export declare const PLUGIN_IMAGE_FORMATS: Record<string, ImageFormatInfo>;
export declare const SUPPORTED_IMAGE_FORMATS: Record<string, ImageFormatInfo>;
export declare class ImageFormatUtils {
    private static pluginSupportCache;
    private static readonly CACHE_DURATION;
    /**
     * Update plugin support based on backend API response.
     */
    static updatePluginSupport(): Promise<void>;
    /**
     * Get supported image file extensions with runtime plugin detection.
     *
     * @returns Set of supported file extensions (lowercase, with dot)
     */
    static getSupportedFormats(): Promise<Set<string>>;
    /**
     * Check if a file extension is supported.
     *
     * @param extension - File extension to check
     * @returns True if the extension is supported
     */
    static isSupportedFormat(extension: string): Promise<boolean>;
    /**
     * Get format information for an extension.
     *
     * @param extension - File extension
     * @returns Format information or undefined
     */
    static getFormatInfo(extension: string): Promise<ImageFormatInfo | undefined>;
    /**
     * Validate image file path.
     *
     * @param filePath - Path to validate
     * @returns True if the path appears to be a supported image
     */
    static validateImagePath(filePath: string): Promise<boolean>;
    /**
     * Extract file extension from path.
     *
     * @param filePath - File path
     * @returns File extension (lowercase, with dot)
     */
    static getFileExtension(filePath: string): string;
    /**
     * Get MIME type for file extension.
     *
     * @param extension - File extension
     * @returns MIME type or undefined
     */
    static getMimeType(extension: string): string | undefined;
    /**
     * Check if format requires additional plugins.
     *
     * @param extension - File extension
     * @returns True if the format requires plugins
     */
    static requiresPlugin(extension: string): boolean;
    /**
     * Check if image format supports transparency.
     *
     * @param extension - File extension
     * @returns True if the format supports transparency
     */
    static supportsTransparency(extension: string): boolean;
    /**
     * Get all available formats (including unsupported ones).
     *
     * @returns Array of all format information
     */
    static getAllFormats(): ImageFormatInfo[];
    /**
     * Get only supported formats.
     *
     * @returns Array of supported format information
     */
    static getSupportedFormatsInfo(): ImageFormatInfo[];
    /**
     * Generate image filename with proper extension.
     *
     * @param baseName - Base filename without extension
     * @param extension - Desired extension
     * @param suffix - Optional suffix to add
     * @returns Generated filename
     */
    static generateFilename(baseName: string, extension: string, suffix?: string): string;
}
