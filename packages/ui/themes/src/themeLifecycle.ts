/**
 * Theme Lifecycle Module
 * Handles theme initialization and system theme change detection
 */

import { onMount, onCleanup } from "solid-js";
import type { ThemeName } from "./types";
import type { I18nModule } from "reynard-i18n";
import { applyTheme } from "./themeUtils";
import { onSystemThemeChange } from "./systemThemeUtils";
import { log } from "reynard-error-boundaries";

/**
 * Sets up theme lifecycle management
 */
export const setupThemeLifecycle = (
  theme: () => ThemeName,
  setThemeState: (theme: ThemeName) => void,
  i18nModule: I18nModule
) => {
  onMount(async () => {
    log.debug(
      "Theme lifecycle onMount",
      { currentTheme: theme() },
      {
        component: "themeLifecycle",
        function: "setupThemeLifecycle",
      }
    );
    // Apply the initial theme
    applyTheme(theme());

    // Set initial document attributes (i18n module handles locale automatically)
    document.documentElement.setAttribute("dir", i18nModule.isRTL ? "rtl" : "ltr");
    document.documentElement.setAttribute("lang", i18nModule.locale());

    // Listen for system theme changes
    const cleanup = onSystemThemeChange((systemTheme: "light" | "dark") => {
      log.debug(
        "System theme changed",
        { systemTheme },
        {
          component: "themeLifecycle",
          function: "onSystemThemeChange",
        }
      );
      // Only auto-switch if user hasn't manually set a theme
      const savedTheme = localStorage.getItem("reynard-theme");
      if (!savedTheme) {
        log.debug(
          "No saved theme, switching to system theme",
          { systemTheme },
          {
            component: "themeLifecycle",
            function: "onSystemThemeChange",
          }
        );
        setThemeState(systemTheme);
        applyTheme(systemTheme);
      }
    });

    onCleanup(cleanup);
  });
};
