/**
 * Translation loader for Basic Todo App
 */

import type { Translations } from '@reynard/core';
import { en } from './en';
import { es } from './es';
import { fr } from './fr';

export const translations: Record<string, Translations> = {
  en,
  es,
  fr,
};

export const loadTranslations = async (locale: string): Promise<Translations> => {
  // Return available translation or fallback to English
  return translations[locale] || translations.en;
};
