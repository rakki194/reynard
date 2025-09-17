/**
 * Shared language utilities for text and code editing components
 * Consolidates language detection, mapping, and naming logic
 */
import type { LanguageInfo } from "../types";
/**
 * Get Monaco language ID from file path or extension
 */
export declare function getMonacoLanguage(filePath: string): string;
/**
 * Get display name for language from file path or extension
 */
export declare function getLanguageDisplayName(filePath: string): string;
/**
 * Check if file is a code file based on extension
 */
export declare function isCodeFile(filePath: string): boolean;
/**
 * Get complete language info from file path
 */
export declare function getLanguageInfo(filePath: string): LanguageInfo;
/**
 * Get Monaco language ID from language name (for backward compatibility)
 */
export declare function getMonacoLanguageFromName(language: string): string;
/**
 * Get display name from language name (for backward compatibility)
 */
export declare function getDisplayNameFromLanguage(language: string): string;
