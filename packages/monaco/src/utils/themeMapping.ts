/**
 * Theme mapping utilities for Monaco Editor integration with Reynard themes
 * Maps Reynard theme names to appropriate Monaco Editor themes
 */

// Define ThemeName locally to avoid dependency issues
type ThemeName = 
  | "light"
  | "dark"
  | "gray"
  | "banana"
  | "strawberry"
  | "peanut"
  | "high-contrast-black"
  | "high-contrast-inverse";

/**
 * Maps Reynard theme names to Monaco Editor theme names
 * This ensures the Monaco Editor appearance matches the current Reynard theme
 */
export const REYNARD_TO_MONACO_THEME_MAP: Record<ThemeName, string> = {
  "light": "vs",
  "dark": "vs-dark", 
  "gray": "vs-dark",
  "banana": "vs",
  "strawberry": "vs-dark",
  "peanut": "vs-dark",
  "high-contrast-black": "hc-black",
  "high-contrast-inverse": "hc-black",
};

/**
 * Maps Reynard theme names to Shiki theme names for syntax highlighting
 * This ensures syntax highlighting matches the overall theme
 */
export const REYNARD_TO_SHIKI_THEME_MAP: Record<ThemeName, string> = {
  "light": "github-light",
  "dark": "github-dark",
  "gray": "github-dark", 
  "banana": "github-light",
  "strawberry": "github-dark",
  "peanut": "github-dark",
  "high-contrast-black": "github-dark",
  "high-contrast-inverse": "github-light",
};

/**
 * Get the appropriate Monaco Editor theme for a given Reynard theme
 * @param reynardTheme - The current Reynard theme name
 * @returns The corresponding Monaco Editor theme name
 */
export const getMonacoThemeFromReynard = (reynardTheme: ThemeName): string => {
  return REYNARD_TO_MONACO_THEME_MAP[reynardTheme] || "vs-dark";
};

/**
 * Get the appropriate Shiki theme for a given Reynard theme
 * @param reynardTheme - The current Reynard theme name
 * @returns The corresponding Shiki theme name
 */
export const getShikiThemeFromReynard = (reynardTheme: ThemeName): string => {
  return REYNARD_TO_SHIKI_THEME_MAP[reynardTheme] || "github-dark";
};

/**
 * Check if a Reynard theme is considered a dark theme
 * @param reynardTheme - The Reynard theme name
 * @returns True if the theme is dark, false otherwise
 */
export const isReynardThemeDark = (reynardTheme: ThemeName): boolean => {
  const darkThemes: ThemeName[] = ["dark", "gray", "strawberry", "peanut", "high-contrast-black"];
  return darkThemes.includes(reynardTheme);
};

/**
 * Get all available Monaco themes that correspond to Reynard themes
 * @returns Array of Monaco theme names
 */
export const getAvailableMonacoThemes = (): string[] => {
  return Array.from(new Set(Object.values(REYNARD_TO_MONACO_THEME_MAP)));
};

/**
 * Get all available Shiki themes that correspond to Reynard themes
 * @returns Array of Shiki theme names
 */
export const getAvailableShikiThemes = (): string[] => {
  return Array.from(new Set(Object.values(REYNARD_TO_SHIKI_THEME_MAP)));
};
