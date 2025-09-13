/**
 * Optional i18n utility for Reynard Core
 * Provides fallback functionality when i18n is not available
 */

// Type for the i18n module when available
interface I18nModule {
  t: (key: string, params?: Record<string, unknown>) => string;
  setLocale: (locale: string) => void;
  getLocale: () => string;
  addTranslations: (translations: Record<string, unknown>) => void;
  hasTranslation: (key: string) => boolean;
  locale: string;
  isRTL: boolean;
  languages: string[];
}

// Fallback translations for core package
const FALLBACK_TRANSLATIONS: Record<string, string> = {
  "core.errors.moduleIsNull": "Module is null",
  "core.errors.invalidModuleStructure": "Invalid module structure",
  "core.errors.exportValidationFailed":
    "Export validation failed for {package}: {errors}",
  "core.errors.loadFailed": "Failed to load module",
  "core.errors.mediaQueryNotSupported": "matchMedia not supported",
  "core.errors.generic": "An error occurred",
  "core.errors.network": "Network error",
  "core.errors.validation": "Validation error",
  "core.errors.permission": "Permission denied",
  "core.errors.notFound": "Not found",
  "core.test.notification": "Test notification",
  "core.module.load-failed": "Failed to load module",
  "core.storage.potentially-dangerous-json-detected":
    "Potentially dangerous JSON detected",
  "core.storage.failed-to-parse-json-from-localstorage":
    "Failed to parse JSON from localStorage:",
};

// Cache for the i18n module
let i18nModule: I18nModule | null = null;
let i18nAvailable = false;

/**
 * Attempts to load the i18n module dynamically
 * Returns true if successful, false otherwise
 */
function tryLoadI18n(): boolean {
  if (i18nModule !== null) {
    return i18nAvailable;
  }

  try {
    // Dynamic import with error handling
    const i18n = require("reynard-i18n");
    if (i18n && i18n.createI18nModule) {
      i18nModule = i18n.createI18nModule();
      i18nAvailable = true;
      return true;
    }
  } catch (error) {
    // i18n not available, use fallbacks
    i18nAvailable = false;
  }

  return false;
}

/**
 * Translation function that falls back to hardcoded strings when i18n is unavailable
 */
export function t(key: string, params?: Record<string, unknown>): string {
  // Try to load i18n if not already attempted
  if (i18nModule === null) {
    tryLoadI18n();
  }

  // Use i18n if available
  if (i18nAvailable && i18nModule) {
    try {
      return i18nModule.t(key, params);
    } catch (error) {
      // Fall through to fallback
    }
  }

  // Use fallback translation
  let translation = FALLBACK_TRANSLATIONS[key] || key;

  // Simple parameter substitution
  if (params) {
    for (const [paramKey, paramValue] of Object.entries(params)) {
      translation = translation.replace(`{${paramKey}}`, String(paramValue));
    }
  }

  return translation;
}

/**
 * Check if i18n is available
 */
export function isI18nAvailable(): boolean {
  if (i18nModule === null) {
    tryLoadI18n();
  }
  return i18nAvailable;
}

/**
 * Get the i18n module if available, null otherwise
 */
export function getI18nModule(): I18nModule | null {
  if (i18nModule === null) {
    tryLoadI18n();
  }
  return i18nAvailable ? i18nModule : null;
}

/**
 * Create a mock i18n module for testing
 */
export function createMockI18n(): I18nModule {
  return {
    t: (key: string, params?: Record<string, unknown>) => t(key, params),
    setLocale: () => {},
    getLocale: () => "en",
    addTranslations: () => {},
    hasTranslation: (key: string) => key in FALLBACK_TRANSLATIONS,
    locale: "en",
    isRTL: false,
    languages: ["en"],
  };
}
