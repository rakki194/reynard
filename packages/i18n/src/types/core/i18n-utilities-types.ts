/**
 * @fileoverview Type definitions for i18n utilities and tooling infrastructure
 *
 * This module contains TypeScript interfaces for the Reynard i18n system's
 * supporting infrastructure, including debugging utilities, performance monitoring,
 * cache management, analytics, and translation management tools.
 *
 * These types are used by development tools, debugging systems, and advanced
 * features that extend beyond basic translation functionality.
 *
 * @author Reynard Development Team
 * @since 1.0.0
 */

import type { TranslationParams } from "./common-types";
import type { IntlConfig } from "../../intl/IntlConfig";
import type {
  IntlNumberFormatter,
  IntlDateFormatter,
  IntlRelativeTimeFormatter,
  IntlPluralRules,
} from "./intl-classes";

/**
 * Statistics about the i18n cache system
 *
 * Provides information about cached translations and namespace distribution
 * for monitoring cache performance and memory usage.
 */
export interface CacheStats {
  /** Total number of fully cached translations */
  fullTranslations: number;
  /** Array of namespace information with locale counts */
  namespaces: Array<{
    /** Namespace identifier */
    name: string;
    /** Number of locales cached for this namespace */
    locales: number;
  }>;
}

/**
 * Debugging statistics for the i18n system
 *
 * Tracks key usage, cache performance, and translation coverage
 * to help developers identify missing translations and optimize performance.
 */
export interface DebugStats {
  /** Total number of translation keys in the system */
  totalKeys: number;
  /** Number of keys that have been accessed */
  usedKeys: number;
  /** Number of keys that were requested but not found */
  missingKeys: number;
  /** Number of keys that exist but have never been used */
  unusedKeys: number;
  /** Number of successful cache lookups */
  cacheHits: number;
  /** Number of failed cache lookups */
  cacheMisses: number;
}

/**
 * Internationalization formatters for various data types
 *
 * Provides access to locale-aware formatters for numbers, dates,
 * and relative time formatting using the Intl API.
 */
export interface IntlFormatter {
  /** Number formatting utilities */
  number: IntlNumberFormatter;
  /** Date formatting utilities */
  date: IntlDateFormatter;
  /** Relative time formatting utilities */
  relative: IntlRelativeTimeFormatter;
  /** Relative time formatting utilities */
  relativeTime: IntlRelativeTimeFormatter;
  /** Plural rules utilities */
  pluralRules: IntlPluralRules;
  /** Update configuration */
  updateConfig: (config: Partial<IntlConfig>) => void;
  /** Format translation with parameters */
  formatTranslation: (translation: string, params?: TranslationParams) => string;
}

/**
 * Function type for template-based translation with parameter substitution
 *
 * @param key - The translation key to look up
 * @param params - Optional parameters for template substitution
 * @returns The translated string with parameters substituted
 */
export type TemplateTranslator = (key: string, params?: TranslationParams) => string;

/**
 * Function type for plural-aware translation
 *
 * @param key - The translation key to look up
 * @param params - Optional parameters including count for plural rules
 * @returns The translated string with appropriate plural form
 */
export type PluralTranslator = (key: string, params?: TranslationParams) => string;

/**
 * Debugging utilities for the i18n system
 *
 * Provides comprehensive debugging capabilities including key validation,
 * usage tracking, and performance statistics for development and testing.
 */
export interface I18nDebugger {
  /** Get all translation keys that have been accessed */
  getUsedKeys: () => string[];
  /** Get all translation keys that were requested but not found */
  getMissingKeys: () => string[];
  /** Get all translation keys that exist but have never been used */
  getUnusedKeys: () => string[];
  /** Validate translation completeness against required keys */
  validate: (requiredKeys: string[]) => {
    /** Whether all required keys are present and valid */
    isValid: boolean;
    /** Keys that are required but missing */
    missingKeys: string[];
    /** Keys that exist but are not in the required set */
    unusedKeys: string[];
    /** Keys that appear multiple times */
    duplicateKeys: string[];
    /** Validation error messages */
    errors: string[];
  };
  /** Get current debugging statistics */
  getStats: () => DebugStats;
  /** Clear all debugging data */
  clear: () => void;
  /** Export all debugging data for analysis */
  exportDebugData: () => {
    usedKeys: string[];
    missingKeys: string[];
    stats: DebugStats;
    validation: Record<string, unknown>;
  };
  /** Print a formatted debugging report to console */
  printReport: () => void;
}

/**
 * Performance monitoring for i18n operations
 *
 * Tracks translation call performance, cache efficiency, and load times
 * to help optimize the i18n system's performance characteristics.
 */
export interface I18nPerformanceMonitor {
  /** Record a translation call with optional timing data */
  recordTranslationCall: (key?: string, duration?: number) => void;
  /** Record a successful cache lookup */
  recordCacheHit: (key?: string) => void;
  /** Record a failed cache lookup */
  recordCacheMiss: (key?: string) => void;
  /** Record namespace loading time */
  recordLoadTime: (namespace?: string, duration?: number) => void;
  /** Get current performance metrics */
  getMetrics: () => {
    /** Total number of translation calls */
    translationCalls: number;
    /** Number of successful cache hits */
    cacheHits: number;
    /** Number of cache misses */
    cacheMisses: number;
    /** Array of recorded load times in milliseconds */
    loadTimes: number[];
    /** Average load time across all operations */
    averageLoadTime: number;
    /** Cache hit rate as a percentage (0-100) */
    cacheHitRate?: number;
  };
  /** Reset all performance metrics */
  reset: () => void;
}

/**
 * Translation management and versioning system
 *
 * Provides CRUD operations for translations with change tracking,
 * import/export capabilities, and author attribution for collaborative
 * translation workflows.
 */
export interface TranslationManager {
  /** Get current translation manager configuration */
  getConfig: () => Record<string, unknown>;
  /** Set a translation value with author attribution */
  setTranslation: (locale: string, key: string, value: string, author: string) => void;
  /** Get a translation value for a specific locale and key */
  getTranslation: (locale: string, key: string) => string;
  /** Get the complete change history for all translations */
  getChangeHistory: () => Array<{
    /** When the change was made */
    timestamp: Date;
    /** Locale that was modified */
    locale: string;
    /** Translation key that was changed */
    key: string;
    /** Author who made the change */
    author: string;
  }>;
  /** Export all translations for a specific locale */
  exportTranslations: (locale: string) => Record<string, unknown>;
  /** Import translations for a locale with author attribution */
  importTranslations: (locale: string, data: Record<string, unknown>, author: string) => void;
}

/**
 * Analytics and usage tracking for translations
 *
 * Monitors translation key usage patterns, locale preferences,
 * and provides insights for translation optimization and maintenance.
 */
export interface TranslationAnalytics {
  /** Start tracking translation usage */
  track: () => void;
  /** Record usage of a specific translation key in a locale */
  trackUsage: (key: string, locale: string) => void;
  /** Get comprehensive usage statistics */
  getUsageStats: () => {
    /** Most frequently used translation keys */
    mostUsedKeys: Array<{ key: string; count: number }>;
    /** Usage statistics by locale */
    localeUsage: Array<{ locale: string; count: number }>;
    /** Total number of translation calls tracked */
    totalUsage: number;
  };
}
