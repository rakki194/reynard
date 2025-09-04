/**
 * Theme utility functions for managing theme state and color generation
 */

import type { ThemeName } from '../types';
import {
  computeTagBackground,
  computeTagColor,
  computeHoverStyles,
  computeAnimation,
} from './colorUtils';

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
export const DEFAULT_THEME: ThemeName = 'light';

/**
 * Available themes
 */
export const AVAILABLE_THEMES: ThemeName[] = [
  'dark',
  'light',
  'gray',
  'banana',
  'strawberry',
  'peanut',
];

/**
 * Theme metadata for UI display
 */
export const THEME_METADATA: Record<ThemeName, { name: string; description: string; icon: string }> = {
  dark: {
    name: 'Dark',
    description: 'Dark theme with high contrast',
    icon: 'moon',
  },
  light: {
    name: 'Light',
    description: 'Light theme with clean aesthetics',
    icon: 'sun',
  },
  gray: {
    name: 'Gray',
    description: 'Monochromatic gray theme',
    icon: 'cloud',
  },
  banana: {
    name: 'Banana',
    description: 'Warm yellow and cream theme',
    icon: 'banana',
  },
  strawberry: {
    name: 'Strawberry',
    description: 'Red and pink with green accents',
    icon: 'strawberry',
  },
  peanut: {
    name: 'Peanut',
    description: 'Warm brown and tan theme',
    icon: 'peanut',
  },
};

/**
 * Get theme from localStorage or default
 * @returns Current theme name
 */
export function getStoredTheme(): ThemeName {
  if (typeof window === 'undefined') return DEFAULT_THEME;
  
  const stored = localStorage.getItem('theme') as ThemeName;
  return AVAILABLE_THEMES.includes(stored) ? stored : DEFAULT_THEME;
}

/**
 * Set theme in localStorage and update document attribute
 * @param theme - Theme to set
 */
export function setStoredTheme(theme: ThemeName): void {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem('theme', theme);
  document.documentElement.setAttribute('data-theme', theme);
}

/**
 * Get tag style object for a given tag and theme
 * @param theme - Current theme
 * @param tag - Tag text
 * @returns Tag style object
 */
export function getTagStyle(theme: ThemeName, tag: string) {
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
export function createThemeContext(initialTheme: ThemeName = DEFAULT_THEME): ThemeContext {
  let currentTheme = initialTheme;

  return {
    get theme() {
      return currentTheme;
    },
    setTheme(theme: ThemeName) {
      currentTheme = theme;
      setStoredTheme(theme);
    },
    getTagStyle: (tag: string) => getTagStyle(currentTheme, tag),
  };
}

/**
 * Check if a theme is valid
 * @param theme - Theme to validate
 * @returns True if theme is valid
 */
export function isValidTheme(theme: string): theme is ThemeName {
  return AVAILABLE_THEMES.includes(theme as ThemeName);
}

/**
 * Get next theme in rotation
 * @param currentTheme - Current theme
 * @returns Next theme in rotation
 */
export function getNextTheme(currentTheme: ThemeName): ThemeName {
  const currentIndex = AVAILABLE_THEMES.indexOf(currentTheme);
  const nextIndex = (currentIndex + 1) % AVAILABLE_THEMES.length;
  return AVAILABLE_THEMES[nextIndex];
}

/**
 * Get previous theme in rotation
 * @param currentTheme - Current theme
 * @returns Previous theme in rotation
 */
export function getPreviousTheme(currentTheme: ThemeName): ThemeName {
  const currentIndex = AVAILABLE_THEMES.indexOf(currentTheme);
  const previousIndex = currentIndex === 0 ? AVAILABLE_THEMES.length - 1 : currentIndex - 1;
  return AVAILABLE_THEMES[previousIndex];
}

/**
 * Get theme by name
 * @param name - Theme name to find
 * @returns Theme object or undefined if not found
 */
export function getThemeByName(name: string) {
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
  return AVAILABLE_THEMES.map(theme => ({
    id: theme,
    ...THEME_METADATA[theme],
  }));
}
