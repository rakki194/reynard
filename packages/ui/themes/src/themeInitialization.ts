/**
 * Theme Initialization Module
 * Handles theme initialization and system theme detection
 */

import type { ThemeName } from "./types";
import { themes } from "./themes";
import { getSystemThemePreference } from "./systemThemeUtils";
import { log } from "reynard-error-boundaries";

/**
 * Gets the initial theme based on saved preference, default, or system theme
 */
export const getInitialTheme = (defaultTheme?: ThemeName): ThemeName => {
  const savedTheme = localStorage.getItem("reynard-theme") as ThemeName;
  const systemTheme = getSystemThemePreference();

  log.debug("Theme initialization", { savedTheme, themes, systemTheme, defaultTheme }, {
    component: "themeInitialization",
    function: "getInitialTheme"
  });

  const finalTheme = savedTheme && themes[savedTheme] ? savedTheme : defaultTheme || systemTheme;

  log.debug("Final theme selected", { finalTheme }, {
    component: "themeInitialization",
    function: "getInitialTheme"
  });

  return finalTheme;
};
