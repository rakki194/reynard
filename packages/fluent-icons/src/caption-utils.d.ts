/**
 * Natural Language Caption Utilities
 *
 * Utility functions for generating, managing, and working with natural language captions
 * for icons in the Reynard icon system.
 */
import type { IconMetadata } from "./types";
/**
 * Generate a natural language caption for an icon based on its metadata
 *
 * @param metadata - The icon metadata containing name, tags, and description
 * @returns A natural language caption describing the icon's purpose and appearance
 */
export declare function generateCaption(metadata: IconMetadata): string;
/**
 * Search for icons by natural language description
 *
 * @param icons - Object containing icon data
 * @param query - Natural language search query
 * @returns Array of matching icon names and their captions
 */
export declare function searchIconsByCaption<T extends Record<string, {
    metadata: IconMetadata;
}>>(icons: T, query: string): Array<{
    name: string;
    caption: string;
    score: number;
}>;
/**
 * Get all captions for a set of icons
 *
 * @param icons - Object containing icon data
 * @returns Object mapping icon names to their captions
 */
export declare function getAllCaptions<T extends Record<string, {
    metadata: IconMetadata;
}>>(icons: T): Record<string, string>;
/**
 * Validate that an icon has a proper caption
 *
 * @param metadata - The icon metadata to validate
 * @returns True if the icon has a valid caption, false otherwise
 */
export declare function validateCaption(metadata: IconMetadata): boolean;
/**
 * Suggest improvements for an icon caption
 *
 * @param metadata - The icon metadata to analyze
 * @returns Array of suggestions for improving the caption
 */
export declare function suggestCaptionImprovements(metadata: IconMetadata): string[];
/**
 * Generate captions for all icons in a category that don't have them
 *
 * @param icons - Object containing icon data
 * @returns Object with generated captions for icons that were missing them
 */
export declare function generateMissingCaptions<T extends Record<string, {
    metadata: IconMetadata;
}>>(icons: T): Record<string, string>;
/**
 * Export captions to a format suitable for AI/LLM consumption
 *
 * @param icons - Object containing icon data
 * @param format - Output format ('json' | 'markdown' | 'text')
 * @returns Formatted string containing all captions
 */
export declare function exportCaptions<T extends Record<string, {
    metadata: IconMetadata;
}>>(icons: T, format?: "json" | "markdown" | "text"): string;
