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
  LanguageCode,
  ThemeContext,
  TranslationContext,
  ReynardContext,
  ThemeProviderProps,
  Translations,
} from "./types";
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
  languages,
  loadTranslations,
  getTranslationValue,
  getBrowserLocale,
  isRTL,
} from "./translations";

// Create contexts
const ReynardContext = createContext<ReynardContext | undefined>();

// Theme Provider Component
export const ReynardProvider: ParentComponent<ThemeProviderProps> = (props) => {
  // Theme state
  const [theme, setThemeState] = createSignal<ThemeName>(
    props.defaultTheme || getSystemThemePreference(),
  );

  // Translation state
  const [locale, setLocaleState] = createSignal<LanguageCode>(
    props.defaultLocale || getBrowserLocale(),
  );

  // Translation data
  const [translationData, setTranslationData] =
    createSignal<Translations | null>(null);

  // Load translations when locale changes
  const loadTranslationsForLocale = async (newLocale: LanguageCode) => {
    try {
      const translations = await loadTranslations(newLocale);
      setTranslationData(translations);
    } catch (error) {
      console.error("Failed to load translations:", error);
    }
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

  // Translation context
  const translationContext: TranslationContext = {
    get locale() {
      return locale();
    },

    setLocale(newLocale: LanguageCode) {
      setLocaleState(newLocale);
      loadTranslationsForLocale(newLocale);
      localStorage.setItem("reynard-locale", newLocale);

      // Update document direction for RTL languages
      document.documentElement.setAttribute(
        "dir",
        isRTL(newLocale) ? "rtl" : "ltr",
      );
      document.documentElement.setAttribute("lang", newLocale);
    },

    t(key: string, params?: any): string {
      const translations = translationData();
      if (!translations) return key;

      try {
        const value = getTranslationValue(translations, key, params);
        return value || key;
      } catch (error) {
        console.warn(`Translation error for key "${key}":`, error);
        return key;
      }
    },

    get languages() {
      return languages;
    },

    get isRTL() {
      return isRTL(locale());
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

    // Load saved locale or use browser locale
    const savedLocale = localStorage.getItem("reynard-locale") as LanguageCode;
    if (savedLocale) {
      setLocaleState(savedLocale);
    }
    await loadTranslationsForLocale(locale());

    // Set initial document attributes
    document.documentElement.setAttribute(
      "dir",
      isRTL(locale()) ? "rtl" : "ltr",
    );
    document.documentElement.setAttribute("lang", locale());

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
    <ReynardContext.Provider
      value={context}
      {...props}
    ></ReynardContext.Provider>
  );
};

// Hook to use the Reynard context
export const useReynard = (): ReynardContext => {
  const context = useContext(ReynardContext);
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
export { ReynardContext };
