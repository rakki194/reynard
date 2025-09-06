/**
 * Theme Provider for the Reynard theming system
 * Based on yipyap's ThemeProvider implementation
 */

import {
  createContext,
  useContext,
  ParentComponent,
  createSignal,
  onMount,
  onCleanup,
} from "solid-js";
import type {
  ThemeName,
  ThemeContext,
  ReynardContext,
  ThemeProviderProps,
} from "./types";
import type { TranslationContext } from "reynard-i18n";
import { themes, isDarkTheme, isHighContrastTheme } from "./themes";
import {
  computeTagBackground,
  computeTagColor,
  computeHoverStyles,
  computeAnimation,
  applyTheme,
  getSystemThemePreference,
  onSystemThemeChange,
} from "./themeUtils";
import {
  I18nProvider,
  createI18nModule,
} from "reynard-i18n";

// Create contexts
const ReynardContextInstance = createContext<ReynardContext | undefined>();

// Theme Provider Component
export const ReynardProvider: ParentComponent<ThemeProviderProps> = (props) => {
  // Theme state
  const [theme, setThemeState] = createSignal<ThemeName>(
    props.defaultTheme || getSystemThemePreference(),
  );

  // Create i18n module
  const i18nModule = createI18nModule();

  // Create translation context from i18n module
  const translationContext: TranslationContext = {
    get locale() {
      return i18nModule.locale();
    },
    setLocale: i18nModule.setLocale,
    t: i18nModule.t,
    languages: i18nModule.languages,
    get isRTL() {
      return i18nModule.isRTL;
    },
  };

  // Theme context
  const themeContext: ThemeContext = {
    get theme() {
      return theme();
    },

    setTheme(newTheme: ThemeName) {
      setThemeState(newTheme);
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
  };

  // Combined context
  const context: ReynardContext = {
    theme: themeContext,
    translation: translationContext,
  };

  // Initialize theme and translations
  onMount(async () => {
    // Load saved theme or use system preference
    const savedTheme = localStorage.getItem("reynard-theme") as ThemeName;
    if (savedTheme && themes[savedTheme]) {
      setThemeState(savedTheme);
    }
    applyTheme(theme());

    // Set initial document attributes (i18n module handles locale automatically)
    document.documentElement.setAttribute(
      "dir",
      i18nModule.isRTL ? "rtl" : "ltr",
    );
    document.documentElement.setAttribute("lang", i18nModule.locale());

    // Listen for system theme changes
    const cleanup = onSystemThemeChange((systemTheme) => {
      // Only auto-switch if user hasn't manually set a theme
      const savedTheme = localStorage.getItem("reynard-theme");
      if (!savedTheme) {
        setThemeState(systemTheme);
        applyTheme(systemTheme);
      }
    });

    onCleanup(cleanup);
  });

  return (
    <I18nProvider value={translationContext}>
      <ReynardContextInstance.Provider value={context}>
        {props.children}
      </ReynardContextInstance.Provider>
    </I18nProvider>
  );
};

// Hook to use the Reynard context
export const useReynard = (): ReynardContext => {
  const context = useContext(ReynardContextInstance);
  if (!context) {
    throw new Error("useReynard must be used within a ReynardProvider");
  }
  return context;
};

// Hook to use theme context only
export const useTheme = (): ThemeContext => {
  const { theme } = useReynard();
  return theme;
};

// Hook to use translation context only
export const useTranslation = (): TranslationContext => {
  const { translation } = useReynard();
  return translation;
};

// Hook to use i18n (alias for useTranslation)
export const useI18n = (): TranslationContext => {
  return useTranslation();
};

// Export individual contexts for advanced usage
export { ReynardContextInstance as ReynardContext };
