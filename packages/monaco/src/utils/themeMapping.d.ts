/**
 * Theme mapping utilities for Monaco Editor integration with Reynard themes
 * Maps Reynard theme names to appropriate Monaco Editor themes
 */
type ThemeName = "light" | "dark" | "gray" | "banana" | "strawberry" | "peanut" | "high-contrast-black" | "high-contrast-inverse";
/**
 * Maps Reynard theme names to Monaco Editor theme names
 * This ensures the Monaco Editor appearance matches the current Reynard theme
 */
export declare const REYNARD_TO_MONACO_THEME_MAP: Record<ThemeName, string>;
/**
 * Maps Reynard theme names to Shiki theme names for syntax highlighting
 * This ensures syntax highlighting matches the overall theme
 */
export declare const REYNARD_TO_SHIKI_THEME_MAP: Record<ThemeName, string>;
/**
 * Get the appropriate Monaco Editor theme for a given Reynard theme
 * @param reynardTheme - The current Reynard theme name
 * @returns The corresponding Monaco Editor theme name
 */
export declare const getMonacoThemeFromReynard: (reynardTheme: ThemeName) => string;
/**
 * Get the appropriate Shiki theme for a given Reynard theme
 * @param reynardTheme - The current Reynard theme name
 * @returns The corresponding Shiki theme name
 */
export declare const getShikiThemeFromReynard: (reynardTheme: ThemeName) => string;
/**
 * Check if a Reynard theme is considered a dark theme
 * @param reynardTheme - The Reynard theme name
 * @returns True if the theme is dark, false otherwise
 */
export declare const isReynardThemeDark: (reynardTheme: ThemeName) => boolean;
/**
 * Get all available Monaco themes that correspond to Reynard themes
 * @returns Array of Monaco theme names
 */
export declare const getAvailableMonacoThemes: () => string[];
/**
 * Get all available Shiki themes that correspond to Reynard themes
 * @returns Array of Shiki theme names
 */
export declare const getAvailableShikiThemes: () => string[];
export {};
