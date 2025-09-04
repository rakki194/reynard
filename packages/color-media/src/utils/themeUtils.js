/**
 * Theme utility functions for managing theme state and color generation
 */
import {
  computeTagBackground,
  computeTagColor,
  computeHoverStyles,
  computeAnimation,
} from "./colorUtils";
/**
 * Default theme configuration
 */
export const DEFAULT_THEME = "light";
/**
 * Available themes
 */
export const AVAILABLE_THEMES = [
  "dark",
  "light",
  "gray",
  "banana",
  "strawberry",
  "peanut",
];
/**
 * Theme metadata for UI display
 */
export const THEME_METADATA = {
  dark: {
    name: "Dark",
    description: "Dark theme with high contrast",
    icon: "moon",
  },
  light: {
    name: "Light",
    description: "Light theme with clean aesthetics",
    icon: "sun",
  },
  gray: {
    name: "Gray",
    description: "Monochromatic gray theme",
    icon: "cloud",
  },
  banana: {
    name: "Banana",
    description: "Warm yellow and cream theme",
    icon: "banana",
  },
  strawberry: {
    name: "Strawberry",
    description: "Red and pink with green accents",
    icon: "strawberry",
  },
  peanut: {
    name: "Peanut",
    description: "Warm brown and tan theme",
    icon: "peanut",
  },
};
/**
 * Get theme from localStorage or default
 * @returns Current theme name
 */
export function getStoredTheme() {
  if (typeof window === "undefined") return DEFAULT_THEME;
  const stored = localStorage.getItem("theme");
  return AVAILABLE_THEMES.includes(stored) ? stored : DEFAULT_THEME;
}
/**
 * Set theme in localStorage and update document attribute
 * @param theme - Theme to set
 */
export function setStoredTheme(theme) {
  if (typeof window === "undefined") return;
  localStorage.setItem("theme", theme);
  document.documentElement.setAttribute("data-theme", theme);
}
/**
 * Get tag style object for a given tag and theme
 * @param theme - Current theme
 * @param tag - Tag text
 * @returns Tag style object
 */
export function getTagStyle(theme, tag) {
  return {
    backgroundColor: computeTagBackground(theme, tag),
    color: computeTagColor(theme, tag),
    hoverStyles: computeHoverStyles(theme),
    animation: computeAnimation(theme),
  };
}
/**
 * Create theme context object
 * @param initialTheme - Initial theme to use
 * @returns Theme context object
 */
export function createThemeContext(initialTheme = DEFAULT_THEME) {
  let currentTheme = initialTheme;
  return {
    get theme() {
      return currentTheme;
    },
    setTheme(theme) {
      currentTheme = theme;
      setStoredTheme(theme);
    },
    getTagStyle: (tag) => getTagStyle(currentTheme, tag),
  };
}
/**
 * Check if a theme is valid
 * @param theme - Theme to validate
 * @returns True if theme is valid
 */
export function isValidTheme(theme) {
  return AVAILABLE_THEMES.includes(theme);
}
/**
 * Get next theme in rotation
 * @param currentTheme - Current theme
 * @returns Next theme in rotation
 */
export function getNextTheme(currentTheme) {
  const currentIndex = AVAILABLE_THEMES.indexOf(currentTheme);
  const nextIndex = (currentIndex + 1) % AVAILABLE_THEMES.length;
  return AVAILABLE_THEMES[nextIndex];
}
/**
 * Get previous theme in rotation
 * @param currentTheme - Current theme
 * @returns Previous theme in rotation
 */
export function getPreviousTheme(currentTheme) {
  const currentIndex = AVAILABLE_THEMES.indexOf(currentTheme);
  const previousIndex =
    currentIndex === 0 ? AVAILABLE_THEMES.length - 1 : currentIndex - 1;
  return AVAILABLE_THEMES[previousIndex];
}
/**
 * Get theme by name
 * @param name - Theme name to find
 * @returns Theme object or undefined if not found
 */
export function getThemeByName(name) {
  if (isValidTheme(name)) {
    return THEME_METADATA[name];
  }
  return undefined;
}
/**
 * Get all available themes
 * @returns Array of all available themes with metadata
 */
export function getAllThemes() {
  return AVAILABLE_THEMES.map((theme) => ({
    id: theme,
    ...THEME_METADATA[theme],
  }));
}
