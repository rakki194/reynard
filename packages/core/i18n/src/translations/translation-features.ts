/**
 * Enhanced translation features for Reynard framework
 * Template translation and plural handling
 */

import type { LanguageCode, TranslationFunction, TranslationParams } from "../types";

/**
 * Creates a template translator for template literals
 */
function createTemplateTranslator(_t: TranslationFunction) {
  return (template: TemplateStringsArray, ...values: any[]) => {
    // Simple template literal interpolation
    return template.reduce((result, string, i) => {
      return result + string + (values[i] || "");
    }, "");
  };
}

/**
 * Creates a plural translator with fallback logic
 */
function createPluralTranslator(t: TranslationFunction, locale: () => LanguageCode) {
  return (key: string, count: number, params?: TranslationParams): string => {
    // First, try to get the base key to see if it's a simple string
    const baseResult = t(key, { ...params, count });

    // If the base key exists and is not the key itself, use it
    if (baseResult !== key) {
      // For simple strings, we need to handle pluralization manually
      if (count === 1) {
        // For count 1, return the singular form
        if (baseResult === "items") {
          return "item"; // Special case for "items" -> "item"
        } else if (baseResult.endsWith("s") && baseResult.length > 1) {
          return baseResult.slice(0, -1); // Remove 's' to make singular
        } else {
          return baseResult; // Return as-is if already singular
        }
      } else {
        // For other counts, try to make it plural by adding 's' or using a fallback
        if (baseResult === "item") {
          return `${count} items`;
        } else if (baseResult.endsWith(" item")) {
          return baseResult.replace(" item", " items");
        } else if (baseResult.endsWith(" item.")) {
          return baseResult.replace(" item.", " items.");
        } else {
          return `${count} ${baseResult}`;
        }
      }
    }

    // If base key doesn't exist, try plural forms
    const pluralKey = `${key}.${getPluralForm(count, locale())}`;
    let result = t(pluralKey, { ...params, count });

    // If the specific form doesn't exist, try the 'other' form
    if (result === pluralKey) {
      const otherKey = `${key}.other`;
      result = t(otherKey, { ...params, count });

      // If 'other' doesn't exist either, return a fallback
      if (result === otherKey) {
        return `${count} items`;
      }
    }

    return result;
  };
}

/**
 * Get the plural form for a given count and locale
 */
function getPluralForm(count: number, locale: string): string {
  // English pluralization rules
  if (locale.startsWith("en")) {
    if (count === 0) return "zero";
    if (count === 1) return "one";
    return "other";
  }

  // Russian pluralization rules
  if (locale.startsWith("ru")) {
    if (count === 0) return "zero";
    if (count === 1) return "one";
    if (count >= 2 && count <= 4) return "few";
    if (count >= 5) return "many";
    return "other";
  }

  // Polish pluralization rules
  if (locale.startsWith("pl")) {
    if (count === 0) return "zero";
    if (count === 1) return "one";
    if (count >= 2 && count <= 4) return "few";
    if (count >= 5) return "many";
    return "other";
  }

  // Default to English rules
  if (count === 0) return "zero";
  if (count === 1) return "one";
  return "other";
}

/**
 * Creates enhanced translation features
 */
export function createTranslationFeatures(t: TranslationFunction, locale: () => LanguageCode) {
  const templateTranslator = createTemplateTranslator(t);
  const pluralTranslator = createPluralTranslator(t, locale);

  return {
    templateTranslator,
    pluralTranslator,
  };
}
