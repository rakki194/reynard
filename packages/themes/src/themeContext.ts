/**
 * Theme Context Creation Module
 * Handles theme context creation and management
 */

import { createSignal } from "solid-js";
import type { ThemeName, ThemeContext } from "./types";
import {
  computeTagBackground,
  computeTagColor,
  computeHoverStyles,
  computeAnimation,
  applyTheme,
} from "./themeUtils";
import { isDarkTheme, isHighContrastTheme } from "./themes";

/**
 * Creates a theme context with reactive theme state
 */
export const createThemeContext = (
  theme: () => ThemeName,
  setThemeState: (theme: ThemeName) => void,
): ThemeContext => ({
  get theme() {
    const currentTheme = theme();
    console.log("ThemeContext - get theme() called, returning:", currentTheme);
    return currentTheme;
  },

  setTheme(newTheme: ThemeName) {
    console.log("setTheme called with:", newTheme);
    console.log("Current theme before setThemeState:", theme());
    setThemeState(newTheme);
    console.log("Current theme after setThemeState:", theme());
    applyTheme(newTheme);
    localStorage.setItem("reynard-theme", newTheme);
  },

  getTagStyle(tag: string) {
    const currentTheme = theme();
    return {
      backgroundColor: computeTagBackground(currentTheme, tag),
      color: computeTagColor(currentTheme, tag),
      hoverStyles: computeHoverStyles(currentTheme),
      animation: computeAnimation(currentTheme),
    };
  },

  get isDark() {
    return isDarkTheme(theme());
  },

  get isHighContrast() {
    return isHighContrastTheme(theme());
  },
});
