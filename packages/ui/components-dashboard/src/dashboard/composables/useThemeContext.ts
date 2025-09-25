/**
 * Theme Context Hook
 * Provides safe access to theme context with fallback handling
 */

import { createMemo } from "solid-js";
import { useTheme } from "reynard-themes";
import { log } from "reynard-error-boundaries";

export interface ThemeContextFallback {
  theme: string;
  setTheme: (theme: string) => void;
  getTagStyle: () => Record<string, any>;
  isDark: boolean;
  isHighContrast: boolean;
}

export const useThemeContext = () => {
  return createMemo(() => {
    try {
      return useTheme();
    } catch (error) {
      log.error("useThemeContext: Theme context not available", error instanceof Error ? error : new Error(String(error)), undefined, {
        component: "useThemeContext",
        function: "useThemeContext"
      });
      return {
        theme: "light",
        setTheme: (theme: string) => {
          log.warn("Theme context not available, cannot set theme", { theme }, {
            component: "useThemeContext",
            function: "setTheme"
          });
        },
        getTagStyle: () => ({}),
        isDark: false,
        isHighContrast: false,
      } as ThemeContextFallback;
    }
  });
};
