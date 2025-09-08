/**
 * Theme context and provider types
 */

import type { ThemeName } from "./theme";

// Theme context interface
export interface ThemeContext {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  getTagStyle: (tag: string) => {
    backgroundColor: string;
    color: string;
    hoverStyles: Record<string, string>;
    animation: string;
  };
  isDark: boolean;
  isHighContrast: boolean;
}

// Theme provider props
export interface ThemeProviderProps {
  defaultTheme?: ThemeName;
  defaultLocale?: string;
}

// Import i18n context from reynard-i18n for internal use
import type { TranslationContext } from "reynard-i18n";

// Combined context interface
export interface ReynardContext {
  theme: ThemeContext;
  translation: TranslationContext;
}
