/**
 * Pluralization type definitions for the Reynard i18n system.
 *
 * This module contains types and interfaces related to pluralization
 * rules and forms for different languages.
 */

// Plural forms for different languages
export type PluralForms = {
  zero?: string;
  one: string;
  two?: string;
  few?: string;
  many?: string;
  other: string;
};

// Pluralization rule function type
export type PluralizationRule = (count: number) => keyof PluralForms;

// Language-specific pluralization rules
export interface PluralizationRules {
  [languageCode: string]: PluralizationRule;
}

// Pluralization context for complex pluralization
export interface PluralizationContext {
  count: number;
  language: string;
  forms: PluralForms;
}

// Pluralization result
export interface PluralizationResult {
  form: keyof PluralForms;
  value: string;
  isExact: boolean;
}

// Pluralization configuration
export interface PluralizationConfig {
  strictMode: boolean;
  fallbackLanguage: string;
  customRules?: PluralizationRules;
}

// Enhanced pluralization with context
export interface EnhancedPluralization {
  getPluralForm: (count: number, language: string) => keyof PluralForms;
  getPluralValue: (count: number, forms: PluralForms, language: string) => string;
  validatePluralForms: (forms: PluralForms, language: string) => boolean;
  getSupportedLanguages: () => string[];
}
