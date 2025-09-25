/**
 * Theme Context Creation Module
 * Handles theme context creation and management
 */

import { applyTheme, computeAnimation, computeHoverStyles, computeTagBackground, computeTagColor } from "./themeUtils";
import { isDarkTheme, isHighContrastTheme } from "./themes";
import type { ThemeContext, ThemeName } from "./types";
import { log } from "reynard-error-boundaries";

/**
 * Creates a theme context with reactive theme state
 */
export const createThemeContext = (
  theme: () => ThemeName,
  setThemeState: (theme: ThemeName) => void
): ThemeContext => ({
  get theme() {
    const currentTheme = theme();
    log.debug("Theme getter called", { currentTheme }, {
      component: "themeContext",
      function: "theme"
    });
    return currentTheme;
  },

  setTheme(newTheme: ThemeName) {
    log.debug("Theme setter called", { newTheme, currentTheme: theme() }, {
      component: "themeContext",
      function: "setTheme"
    });
    setThemeState(newTheme);
    applyTheme(newTheme);
    localStorage.setItem("reynard-theme", newTheme);
    log.debug("Theme updated", { newTheme }, {
      component: "themeContext",
      function: "setTheme"
    });
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
