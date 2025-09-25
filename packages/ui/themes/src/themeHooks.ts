/**
 * Theme Hooks Module
 * Provides hooks for accessing theme and translation contexts
 */

import { useContext } from "solid-js";
import type { ReynardContext, ThemeContext } from "./types";
import type { TranslationContext } from "reynard-i18n";
import { ReynardContextInstance } from "./ThemeProvider";
import { log } from "reynard-error-boundaries";

/**
 * Hook to use the Reynard context
 */
export const useReynard = (): ReynardContext => {
  const context = useContext(ReynardContextInstance);
  if (!context) {
    // Add more debugging information
    const error = new Error("useReynard must be used within a ReynardProvider");
    log.error("useReynard: Context is null/undefined", error, { 
      ReynardContextInstance,
      stack: error.stack 
    }, {
      component: "themeHooks",
      function: "useReynard"
    });
    throw error;
  }
  return context;
};

/**
 * Hook to use theme context only
 */
export const useTheme = (): ThemeContext => {
  const { theme } = useReynard();
  return theme;
};

/**
 * Hook to use translation context only
 */
export const useTranslation = (): TranslationContext => {
  const { translation } = useReynard();
  return translation;
};

/**
 * Hook to use i18n (alias for useTranslation)
 */
export const useI18n = (): TranslationContext => {
  return useTranslation();
};
