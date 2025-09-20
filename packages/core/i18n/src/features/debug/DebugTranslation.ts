/**
 * Debug Translation Function
 *
 * Enhanced translation function with debugging capabilities.
 */

import type { LanguageCode, Translations, TranslationParams } from "../../types";
import { getTranslationValue } from "../../utils";
import { usedKeys, missingKeys } from "./DebugStats";

export const createDebugTranslationFunction = (
  baseTranslations: () => Translations,
  locale: () => LanguageCode,
  enableDebug: boolean = false
) => {
  return (key: string, params?: TranslationParams): string => {
    if (enableDebug) {
      usedKeys.add(key);
    }

    try {
      const result = getTranslationValue(
        baseTranslations() as unknown as Record<string, unknown>,
        key,
        params,
        locale()
      );

      if (!result && enableDebug) {
        missingKeys.add(key);
        console.warn(`Missing translation for key: ${key} in locale: ${locale()}`);
      }

      return result || key;
    } catch (error) {
      if (enableDebug) {
        console.error(`Translation error for key: ${key}`, error);
      }
      return key;
    }
  };
};

// Template translator for template literals
export const createTemplateTranslator = (t: (key: string, params?: TranslationParams) => string) => {
  return (template: TemplateStringsArray, ...values: any[]) => {
    const key = template.join("${}");
    const params = values.reduce((acc, val, idx) => {
      acc[`param${idx}`] = val;
      return acc;
    }, {} as any);
    return t(key, params);
  };
};

// Debug plural translator
export const createDebugPluralTranslator = (
  t: (key: string, params?: TranslationParams) => string,
  locale: () => LanguageCode,
  enableDebug: boolean = false
) => {
  return (key: string, count: number, params?: TranslationParams): string => {
    if (enableDebug) {
      usedKeys.add(key);
    }

    try {
      const pluralKey = count === 1 ? `${key}.one` : `${key}.other`;
      const result = t(pluralKey, { ...params, count });

      if (!result && enableDebug) {
        missingKeys.add(pluralKey);
        console.warn(`Missing plural translation for key: ${pluralKey} in locale: ${locale()}`);
      }

      // Debug logging in development mode
      if (typeof process !== "undefined" && process.env.NODE_ENV === "development") {
        console.debug(`Plural translation: ${key} with count ${count} -> ${result || `${count} items`}`);
      }

      return result || `${count} items`;
    } catch (error) {
      if (enableDebug) {
        console.error(`Plural translation error for key: ${key}`, error);
      }
      return `${count} items`;
    }
  };
};
