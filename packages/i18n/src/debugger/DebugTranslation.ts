/**
 * Debug Translation Function
 *
 * Enhanced translation function with debugging capabilities.
 */

import type { LanguageCode, Translations, TranslationParams } from "../types";
import { getTranslationValue } from "../utils";
import { usedKeys, missingKeys } from "./DebugStats";

export const createDebugTranslationFunction = (
  baseTranslations: () => Translations,
  locale: () => LanguageCode,
  enableDebug: boolean = false,
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
        locale(),
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
