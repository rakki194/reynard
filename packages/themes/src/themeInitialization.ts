/**
 * Theme Initialization Module
 * Handles theme initialization and system theme detection
 */

import type { ThemeName } from "./types";
import { themes } from "./themes";
import { getSystemThemePreference } from "./systemThemeUtils";

/**
 * Gets the initial theme based on saved preference, default, or system theme
 */
export const getInitialTheme = (defaultTheme?: ThemeName): ThemeName => {
  const savedTheme = localStorage.getItem("reynard-theme") as ThemeName;
  const systemTheme = getSystemThemePreference();
  
  console.log("getInitialTheme - savedTheme:", savedTheme);
  console.log("getInitialTheme - themes object:", themes);
  console.log("getInitialTheme - themes[savedTheme]:", themes[savedTheme]);
  console.log("getInitialTheme - savedTheme && themes[savedTheme]:", savedTheme && themes[savedTheme]);
  
  const finalTheme = savedTheme && themes[savedTheme] ? savedTheme : (defaultTheme || systemTheme);
  
  console.log("getInitialTheme - systemTheme:", systemTheme);
  console.log("getInitialTheme - defaultTheme:", defaultTheme);
  console.log("getInitialTheme - finalTheme:", finalTheme);
  
  return finalTheme;
};
