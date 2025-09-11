import { enTranslations } from "./en";
import { esTranslations } from "./es";
import { jaTranslations } from "./ja";

export const demoTranslations = {
  en: enTranslations,
  es: esTranslations,
  ja: jaTranslations,
  // Add more languages as needed
  fr: enTranslations,
  de: enTranslations,
} as const;

export type DemoTranslationKey = keyof typeof enTranslations;
export type DemoFeaturesKey = keyof typeof enTranslations.featuresList;

// Helper function to get demo translation
export function getDemoTranslation(
  locale: string,
  key: DemoTranslationKey | `featuresList.${DemoFeaturesKey}`
): string {
  const lang = (demoTranslations as any)[locale] || demoTranslations.en;
  
  if (key.startsWith('featuresList.')) {
    const featureKey = key.replace('featuresList.', '') as DemoFeaturesKey;
    return lang.featuresList[featureKey];
  }
  
  return lang[key as DemoTranslationKey];
}
