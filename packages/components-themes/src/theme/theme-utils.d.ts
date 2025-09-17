/**
 * Theme utility functions for the ThemeShowcase component
 */
export interface ThemeColor {
    name: string;
    value: string;
    var: string;
}
/**
 * Get color palette for a specific theme
 */
export declare const getThemeColors: (themeName: string) => ThemeColor[];
/**
 * Get current theme name (preview or active)
 */
export declare const getCurrentTheme: (previewTheme: string | null, activeTheme: string) => string;
