/**
 * Translation Validation
 *
 * Validates translation completeness and consistency.
 */

export interface ValidationResult {
  isValid: boolean;
  missingKeys: string[];
  unusedKeys: string[];
  duplicateKeys: string[];
  errors: string[];
}

export function validateTranslations(translations: Record<string, unknown>, requiredKeys: string[]): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    missingKeys: [],
    unusedKeys: [],
    duplicateKeys: [],
    errors: [],
  };

  // Check for missing keys
  for (const key of requiredKeys) {
    if (!translations[key]) {
      result.missingKeys.push(key);
      result.isValid = false;
    }
  }

  // Check for unused keys
  const translationKeys = Object.keys(translations);
  for (const key of translationKeys) {
    if (!requiredKeys.includes(key)) {
      result.unusedKeys.push(key);
    }
  }

  return result;
}
