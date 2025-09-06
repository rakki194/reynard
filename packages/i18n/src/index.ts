/**
 * Main i18n module for Reynard framework
 * Comprehensive internationalization system with 37 language support
 */

import { createSignal, createEffect, createContext, useContext } from 'solid-js';
import type { 
  LanguageCode, 
  Translations, 
  TranslationParams, 
  TranslationFunction,
  I18nModule,
  TranslationContext 
} from './types';
import { 
  languages, 
  getInitialLocale, 
  isRTL, 
  getTranslationValue
} from './utils';

// Translation loading function
export async function loadTranslations(locale: LanguageCode): Promise<Translations> {
  try {
    // Dynamic import of translation files
    const translationModule = await import(`./lang/${locale}.js`);
    return translationModule.default;
  } catch (error) {
    console.warn(`Failed to load translations for ${locale}, falling back to English:`, error);
    // Fallback to English
    if (locale !== 'en') {
      const englishModule = await import('./lang/en.js');
      return englishModule.default;
    }
    throw error;
  }
}

// Create i18n context
const I18nContext = createContext<TranslationContext>();

export const I18nProvider = I18nContext.Provider;

// Main i18n composable
export function useI18n(): TranslationContext {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}

// Create i18n module
export function createI18nModule(initialTranslations?: Partial<Translations>): I18nModule {
  const [locale, setLocaleSignal] = createSignal<LanguageCode>(getInitialLocale());
  const [translations, _setTranslationsSignal] = createSignal<Translations>(initialTranslations as Translations || {} as Translations);

  // Initialize with initial locale from localStorage/browser if available
  const initialLocale = getInitialLocale();
  if (initialLocale !== 'en') {
    setLocaleSignal(initialLocale);
  }

  // Persist locale changes and apply RTL
  createEffect(() => {
    const currentLocale = locale();
    if (typeof window !== 'undefined') {
      localStorage.setItem('reynard-locale', currentLocale);
      document.documentElement.setAttribute('lang', currentLocale);
      document.documentElement.setAttribute('dir', isRTL(currentLocale) ? 'rtl' : 'ltr');
    }
  });

  const setLocale = (newLocale: LanguageCode) => {
    setLocaleSignal(newLocale);
  };


  const t: TranslationFunction = (key: string, params?: TranslationParams) => {
    return getTranslationValue(translations(), key, params);
  };

  return {
    locale,
    get isRTL() {
      return isRTL(locale());
    },
    languages,
    setLocale,
    t,
    loadTranslations,
  };
}

// Export types and utilities
export type { 
  LanguageCode, 
  Language, 
  Translations, 
  TranslationParams, 
  TranslationFunction,
  I18nModule,
  TranslationContext,
  PluralForms 
} from './types';

export { 
  languages, 
  getInitialLocale, 
  isRTL, 
  getTranslationValue,
  formatNumber,
  formatDate,
  formatCurrency,
  isValidLanguageCode,
  getNativeLanguageName,
  getEnglishLanguageName,
  hasComplexPluralization,
  getPluralizationCategories
} from './utils';

export { 
  getPlural, 
  createPluralTranslation,
  pluralRules 
} from './plurals';
