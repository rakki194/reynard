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

// Helper function to get initial theme
const getInitialTheme = (defaultTheme?: ThemeName): ThemeName => {
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

// Helper function to create theme context
const createThemeContext = (
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

// Theme Provider Component
export const ReynardProvider: ParentComponent<ThemeProviderProps> = (props) => {
  console.log("ReynardProvider - props.defaultTheme:", props.defaultTheme);
  const initialTheme = getInitialTheme(props.defaultTheme);
  console.log("ReynardProvider - initialTheme:", initialTheme);
  const [theme, setThemeState] = createSignal<ThemeName>(initialTheme);

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
  const themeContext = createThemeContext(theme, setThemeState);

  // Combined context
  const context: ReynardContext = {
    theme: themeContext,
    translation: translationContext,
  };

  // Initialize theme and translations
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
    const cleanup = onSystemThemeChange((systemTheme) => {
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
