/**
 * Theme utility functions for managing theme state and color generation
 */
import type { ThemeName } from "../types";
/**
 * Theme context interface
 */
export interface ThemeContext {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  getTagStyle: (tag: string) => {
    backgroundColor: string;
    color: string;
    hoverStyles: Record<string, string>;
    animation: string;
  };
}
/**
 * Default theme configuration
 */
export declare const DEFAULT_THEME: ThemeName;
/**
 * Available themes
 */
export declare const AVAILABLE_THEMES: ThemeName[];
/**
 * Theme metadata for UI display
 */
export declare const THEME_METADATA: Record<
  ThemeName,
  {
    name: string;
    description: string;
    icon: string;
  }
>;
/**
 * Get theme from localStorage or default
 * @returns Current theme name
 */
export declare function getStoredTheme(): ThemeName;
/**
 * Set theme in localStorage and update document attribute
 * @param theme - Theme to set
 */
export declare function setStoredTheme(theme: ThemeName): void;
/**
 * Get tag style object for a given tag and theme
 * @param theme - Current theme
 * @param tag - Tag text
 * @returns Tag style object
 */
export declare function getTagStyle(
  theme: ThemeName,
  tag: string,
): {
  backgroundColor: string;
  color: string;
  hoverStyles: Record<string, string>;
  animation: string;
};
/**
 * Create theme context object
 * @param initialTheme - Initial theme to use
 * @returns Theme context object
 */
export declare function createThemeContext(
  initialTheme?: ThemeName,
): ThemeContext;
/**
 * Check if a theme is valid
 * @param theme - Theme to validate
 * @returns True if theme is valid
 */
export declare function isValidTheme(theme: string): theme is ThemeName;
/**
 * Get next theme in rotation
 * @param currentTheme - Current theme
 * @returns Next theme in rotation
 */
export declare function getNextTheme(currentTheme: ThemeName): ThemeName;
/**
 * Get previous theme in rotation
 * @param currentTheme - Current theme
 * @returns Previous theme in rotation
 */
export declare function getPreviousTheme(currentTheme: ThemeName): ThemeName;
/**
 * Get theme by name
 * @param name - Theme name to find
 * @returns Theme object or undefined if not found
 */
export declare function getThemeByName(name: string):
  | {
      name: string;
      description: string;
      icon: string;
    }
  | undefined;
/**
 * Get all available themes
 * @returns Array of all available themes with metadata
 */
export declare function getAllThemes(): {
  name: string;
  description: string;
  icon: string;
  id: ThemeName;
}[];
