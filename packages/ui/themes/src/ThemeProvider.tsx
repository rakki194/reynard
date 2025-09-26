/**
 * Theme Provider for the Reynard theming system
 * Based on yipyap's ThemeProvider implementation
 */

import { createContext, ParentComponent, createSignal, createEffect } from "solid-js";
import type { ThemeName, ReynardContext, ThemeProviderProps } from "./types";
import type { TranslationContext } from "reynard-i18n";
import { I18nProvider } from "reynard-i18n";
import { createMockI18n } from "reynard-core";
import { getInitialTheme } from "./themeInitialization";
import { createThemeContext } from "./themeContext";
import { setupThemeLifecycle } from "./themeLifecycle";
import { log } from "reynard-error-boundaries";

// Create contexts with default value to prevent context not found errors
export const ReynardContextInstance = createContext<ReynardContext | undefined>(undefined);

// Theme Provider Component
export const ReynardProvider: ParentComponent<ThemeProviderProps> = props => {
  log.debug(
    "ReynardProvider initialization",
    { defaultTheme: props.defaultTheme },
    {
      component: "ThemeProvider",
      function: "ReynardProvider",
    }
  );
  const initialTheme = getInitialTheme(props.defaultTheme);
  log.debug(
    "Initial theme determined",
    { initialTheme },
    {
      component: "ThemeProvider",
      function: "ReynardProvider",
    }
  );
  const [theme, setThemeState] = createSignal<ThemeName>(initialTheme);

  // Create i18n module (using mock to prevent recursion)
  const i18nModule = createMockI18n();

  // Create translation context from i18n module
  const translationContext: TranslationContext = {
    get locale() {
      return i18nModule.locale() as any;
    },
    setLocale: i18nModule.setLocale as any,
    t: i18nModule.t,
    languages: i18nModule.languages as any,
    get isRTL() {
      return i18nModule.isRTL;
    },
  };

  // Theme context
  const themeContext = createThemeContext(theme, setThemeState);

  // Combined context
  const context: ReynardContext = {
    theme: themeContext,
    translation: translationContext,
  };

  // Initialize theme and translations with proper reactive tracking
  createEffect(() => {
    // Track theme signal for reactivity
    const currentTheme = theme();
    // Initialize lifecycle only once, but track theme changes
    setupThemeLifecycle(() => currentTheme, setThemeState, i18nModule as any);
  });

  // Debug logging to track context creation
  log.debug(
    "Context created",
    { context, themeContext, translationContext },
    {
      component: "ThemeProvider",
      function: "ReynardProvider",
    }
  );

  return (
    <I18nProvider value={translationContext}>
      <ReynardContextInstance.Provider value={context}>{props.children}</ReynardContextInstance.Provider>
    </I18nProvider>
  );
};

// Re-export hooks from themeHooks module
export { useReynard, useTheme, useTranslation, useI18n } from "./themeHooks";
