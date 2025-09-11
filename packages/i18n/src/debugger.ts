/**
 * i18n Debugging and Validation Tools
 * Enhanced developer experience with comprehensive debugging capabilities
 */

import type { LanguageCode, Translations, TranslationParams, I18nModule } from "./types";
import { getTranslationValue } from "./utils";

// Track used translation keys for debugging
const usedKeys = new Set<string>();
const missingKeys = new Set<string>();

// Translation validation utilities
export interface ValidationResult {
  isValid: boolean;
  missingKeys: string[];
  unusedKeys: string[];
  duplicateKeys: string[];
  errors: string[];
}

export interface DebugStats {
  totalKeys: number;
  usedKeys: number;
  missingKeys: number;
  unusedKeys: number;
  cacheHits: number;
  cacheMisses: number;
}

// Enhanced translation function with debugging
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
      );

      if (enableDebug && !result) {
        missingKeys.add(key);
        console.warn(`Missing translation key: ${key} for locale: ${locale()}`);
      }

      return result;
    } catch (error) {
      if (enableDebug) {
        console.error(`Translation error for key ${key}:`, error);
      }
      return key; // Fallback to key itself
    }
  };
};

// Validation functions
export const validateTranslations = (translations: Translations): ValidationResult => {
  const errors: string[] = [];
  const missingKeys: string[] = [];
  const duplicateKeys: string[] = [];
  const allKeys = new Set<string>();

  // Check for required namespaces
  const requiredNamespaces = ['common', 'themes', 'core', 'components'];
  for (const namespace of requiredNamespaces) {
    if (!(namespace in translations)) {
      errors.push(`Missing required namespace: ${namespace}`);
    }
  }

  // Collect all keys and check for duplicates
  const collectKeys = (obj: any, prefix: string = '') => {
    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      
      if (allKeys.has(fullKey)) {
        duplicateKeys.push(fullKey);
      } else {
        allKeys.add(fullKey);
      }

      if (typeof value === 'object' && value !== null) {
        collectKeys(value, fullKey);
      }
    }
  };

  collectKeys(translations);

  // Check for missing keys (compare with used keys)
  for (const usedKey of usedKeys) {
    if (!allKeys.has(usedKey)) {
      missingKeys.push(usedKey);
    }
  }

  return {
    isValid: errors.length === 0 && missingKeys.length === 0,
    missingKeys,
    unusedKeys: Array.from(allKeys).filter(key => !usedKeys.has(key)),
    duplicateKeys,
    errors
  };
};

// Debug statistics
export const getDebugStats = (): DebugStats => {
  return {
    totalKeys: usedKeys.size + Array.from(missingKeys).length,
    usedKeys: usedKeys.size,
    missingKeys: missingKeys.size,
    unusedKeys: 0, // Would need full translation tree to calculate
    cacheHits: 0, // Would need cache integration
    cacheMisses: 0 // Would need cache integration
  };
};

// i18n Debugger class
export class I18nDebugger {
  private validationResults: ValidationResult | null = null;

  constructor(_i18n: I18nModule, _enableDebug: boolean = false) {
    // Constructor parameters are kept for API compatibility but not used internally
  }

  // Get missing translation keys
  getMissingKeys(): string[] {
    return Array.from(missingKeys);
  }

  // Get used translation keys
  getUsedKeys(): string[] {
    return Array.from(usedKeys);
  }

  // Get unused translation keys (requires full translation tree)
  getUnusedKeys(translations: Translations): string[] {
    const allKeys = new Set<string>();
    const collectKeys = (obj: any, prefix: string = '') => {
      for (const [key, value] of Object.entries(obj)) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        allKeys.add(fullKey);
        if (typeof value === 'object' && value !== null) {
          collectKeys(value, fullKey);
        }
      }
    };
    collectKeys(translations);
    return Array.from(allKeys).filter(key => !usedKeys.has(key));
  }

  // Validate current translations
  validate(translations: Translations): ValidationResult {
    this.validationResults = validateTranslations(translations);
    return this.validationResults;
  }

  // Get debug statistics
  getStats(): DebugStats {
    return getDebugStats();
  }

  // Clear debug data
  clear(): void {
    usedKeys.clear();
    missingKeys.clear();
    this.validationResults = null;
  }

  // Export debug data
  exportDebugData() {
    return {
      usedKeys: this.getUsedKeys(),
      missingKeys: this.getMissingKeys(),
      stats: this.getStats(),
      validation: this.validationResults
    };
  }

  // Print debug report
  printReport(translations: Translations): void {
    const validation = this.validate(translations);
    const stats = this.getStats();

    console.group('🌍 i18n Debug Report');
    console.log('📊 Statistics:', stats);
    console.log('✅ Validation:', validation.isValid ? 'PASSED' : 'FAILED');
    
    if (validation.missingKeys.length > 0) {
      console.warn('❌ Missing Keys:', validation.missingKeys);
    }
    
    if (validation.unusedKeys.length > 0) {
      console.info('ℹ️ Unused Keys:', validation.unusedKeys);
    }
    
    if (validation.duplicateKeys.length > 0) {
      console.error('🔄 Duplicate Keys:', validation.duplicateKeys);
    }
    
    if (validation.errors.length > 0) {
      console.error('🚨 Errors:', validation.errors);
    }
    
    console.groupEnd();
  }
}

// Template literal support for translations
export const createTemplateTranslator = (t: (key: string, params?: TranslationParams) => string) => {
  return (template: TemplateStringsArray, ...values: any[]): string => {
    const key = template.join('${}');
    const params: TranslationParams = {};
    
    // Map values to parameters
    values.forEach((value, index) => {
      params[`param${index}`] = value;
    });
    
    return t(key, params);
  };
};

// Enhanced pluralization with debugging
export const createDebugPluralTranslator = (
  t: (key: string, params?: TranslationParams) => string,
  locale: () => LanguageCode
) => {
  return (key: string, count: number, params?: TranslationParams): string => {
    const pluralKey = getPluralKey(key, count, locale());
    const enhancedParams = { ...params, count };
    
    if (process.env.NODE_ENV === 'development') {
      console.debug(`Plural translation: ${key} -> ${pluralKey} (count: ${count})`);
    }
    
    return t(pluralKey, enhancedParams);
  };
};

// Helper function to get plural key
const getPluralKey = (key: string, count: number, _locale: LanguageCode): string => {
  // This would integrate with our existing pluralization system
  // For now, return a simple implementation
  if (count === 1) {
    return `${key}.one`;
  }
  return `${key}.other`;
};

// Performance monitoring
export class I18nPerformanceMonitor {
  private metrics = {
    translationCalls: 0,
    cacheHits: 0,
    cacheMisses: 0,
    loadTimes: [] as number[],
    averageLoadTime: 0
  };

  recordTranslationCall(): void {
    this.metrics.translationCalls++;
  }

  recordCacheHit(): void {
    this.metrics.cacheHits++;
  }

  recordCacheMiss(): void {
    this.metrics.cacheMisses++;
  }

  recordLoadTime(time: number): void {
    this.metrics.loadTimes.push(time);
    this.metrics.averageLoadTime = 
      this.metrics.loadTimes.reduce((a, b) => a + b, 0) / this.metrics.loadTimes.length;
  }

  getMetrics() {
    return {
      ...this.metrics,
      cacheHitRate: this.metrics.cacheHits / (this.metrics.cacheHits + this.metrics.cacheMisses) || 0
    };
  }

  reset(): void {
    this.metrics = {
      translationCalls: 0,
      cacheHits: 0,
      cacheMisses: 0,
      loadTimes: [],
      averageLoadTime: 0
    };
  }
}
