/**
 * Translation loader for Basic Todo App
 */

import { en } from "./en";
import { es } from "./es";
import { fr } from "./fr";

export const translations: Record<string, Record<string, any>> = {
  en,
  es,
  fr,
};

export const loadTranslations = async (locale: string): Promise<Record<string, any>> => {
  // Return available translation or fallback to English
  return translations[locale] || translations.en;
};
