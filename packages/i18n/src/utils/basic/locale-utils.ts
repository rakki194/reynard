/**
 * Locale Utilities
 * Browser locale detection and basic locale operations
 */

import type { LanguageCode } from "../../types";
import { languages } from "./language-data";

// Get browser locale
export function getBrowserLocale(): LanguageCode {
  if (typeof navigator === "undefined") return "en";

  const browserLang = navigator.language || (navigator as { userLanguage?: string }).userLanguage;
  if (!browserLang) return "en";

  const langCode = browserLang.split("-")[0] as LanguageCode;

  // Check if we support this language
  if (languages.some(lang => lang.code === langCode)) {
    return langCode;
  }

  // Check for full locale (e.g., pt-BR)
  if (languages.some(lang => lang.code === browserLang)) {
    return browserLang as LanguageCode;
  }

  return "en"; // Default fallback
}

// Get initial locale from localStorage or browser
export function getInitialLocale(): LanguageCode {
  if (typeof window === "undefined") return "en";

  const stored = localStorage.getItem("reynard-locale") as LanguageCode;
  if (stored && languages.some(lang => lang.code === stored)) {
    return stored;
  }

  return getBrowserLocale();
}

// Helper function to get the path separator based on locale and platform
export function getPathSeparator(locale: LanguageCode): string {
  if (locale === "ja") return "￥";
  return navigator.userAgent.toLowerCase().includes("win") ? " \\ " : " / ";
}
