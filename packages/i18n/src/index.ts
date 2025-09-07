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

// Dynamic import of translation files using import.meta.glob (like Yipyap)
export const translations: Record<string, () => Promise<Translations>> = Object.fromEntries(
  Object.entries(import.meta.glob<Translations>('./lang/*.ts', { import: 'default' })).map(([key, value]) => [
    key.replace(/^\.\/lang\/(.+)\.ts$/, '$1'),
    value,
  ])
);

// Translation loading function with enhanced error handling
export async function loadTranslations(locale: LanguageCode): Promise<Translations> {
  try {
    // Use dynamic imports with fallback
    const translationLoader = translations[locale];
    if (translationLoader) {
      return await translationLoader();
    }
    
    // Fallback to dynamic import if not in glob
    const translationModule = await import(`./lang/${locale}.js`);
    return translationModule.default;
  } catch (error) {
    console.warn(`Failed to load translations for ${locale}, falling back to English:`, error);
    // Fallback to English
    if (locale !== 'en') {
      try {
        const englishLoader = translations['en'];
        if (englishLoader) {
          return await englishLoader();
        }
        const englishModule = await import('./lang/en.js');
        return englishModule.default;
      } catch (fallbackError) {
        console.error('Failed to load English fallback translations:', fallbackError);
        throw fallbackError;
      }
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
  getPluralizationCategories,
  // Advanced pluralization functions
  getRussianPlural,
  getArabicPlural,
  getPolishPlural,
  getSpanishPlural,
  getTurkishPlural,
  getCzechPlural,
  getRomanianPlural,
  getPortuguesePlural,
  // Grammar helpers
  getHungarianArticle,
  getHungarianArticleForWord,
  getHungarianSuffix
} from './utils';

export { 
  getPlural, 
  createPluralTranslation,
  pluralRules 
} from './plurals';
