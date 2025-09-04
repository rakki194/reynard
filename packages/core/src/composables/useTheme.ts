/**
 * Theme composable - SolidJS composable for theme management
 * Provides reactive theme state and utilities
 */

import { createContext, useContext } from 'solid-js';
import { createThemeModule, type ThemeModule, type Theme } from '../modules/theme';

const ThemeContext = createContext<ThemeModule>();

export const ThemeProvider = ThemeContext.Provider;

/**
 * Hook for accessing theme state and utilities
 * Must be used within a ThemeProvider
 */
export const useTheme = (): ThemeModule => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

/**
 * Create a theme module instance
 * Use this to create a provider value
 */
export const createTheme = createThemeModule;

/**
 * Hook for theme value only (no setter)
 * Useful for components that only need to read theme
 */
export const useThemeValue = (): Theme => {
  const { theme } = useTheme();
  return theme;
};
