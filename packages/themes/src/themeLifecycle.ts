/**
 * Theme Lifecycle Module
 * Handles theme initialization and system theme change detection
 */

import { onMount, onCleanup } from "solid-js";
import type { ThemeName } from "./types";
import type { I18nModule } from "reynard-i18n";
import { applyTheme } from "./themeUtils";
import { onSystemThemeChange } from "./systemThemeUtils";

/**
 * Sets up theme lifecycle management
 */
export const setupThemeLifecycle = (
  theme: () => ThemeName,
  setThemeState: (theme: ThemeName) => void,
  i18nModule: I18nModule,
) => {
  onMount(async () => {
    console.log("onMount - Current theme:", theme());
    // Apply the initial theme
    applyTheme(theme());

    // Set initial document attributes (i18n module handles locale automatically)
    document.documentElement.setAttribute(
      "dir",
      i18nModule.isRTL ? "rtl" : "ltr",
    );
    document.documentElement.setAttribute("lang", i18nModule.locale());

    // Listen for system theme changes
    const cleanup = onSystemThemeChange((systemTheme: "light" | "dark") => {
      console.log("System theme changed to:", systemTheme);
      // Only auto-switch if user hasn't manually set a theme
      const savedTheme = localStorage.getItem("reynard-theme");
      console.log("Saved theme in system change listener:", savedTheme);
      if (!savedTheme) {
        console.log("No saved theme, switching to system theme:", systemTheme);
        setThemeState(systemTheme);
        applyTheme(systemTheme);
      }
    });

    onCleanup(cleanup);
  });
};
