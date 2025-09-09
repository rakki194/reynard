/**
 * Language-specific type definitions for the Reynard i18n system.
 *
 * This module contains types and interfaces related to language
 * detection, metadata, and configuration.
 */

import type { LanguageCode, Language } from "./common-types";

// Language detection result
export interface LanguageDetectionResult {
  language: LanguageCode;
  confidence: number;
  source: "browser" | "user" | "fallback" | "detected";
}

// Language configuration
export interface LanguageConfig {
  defaultLanguage: LanguageCode;
  fallbackLanguage: LanguageCode;
  supportedLanguages: LanguageCode[];
  autoDetect: boolean;
  persistSelection: boolean;
  detectionSources: ("browser" | "user" | "fallback")[];
}

// Language metadata with extended information
export interface ExtendedLanguage extends Language {
  region?: string;
  script?: string;
  variant?: string;
  direction: "ltr" | "rtl";
  pluralRule: string;
  dateFormat: string;
  timeFormat: string;
  numberFormat: string;
  currencyFormat: string;
}

// Language pack information
export interface LanguagePack {
  language: LanguageCode;
  version: string;
  lastUpdated: string;
  completeness: number;
  missingKeys: string[];
  extraKeys: string[];
}

// Language loading status
export interface LanguageLoadingStatus {
  language: LanguageCode;
  status: "loading" | "loaded" | "error" | "not-found";
  progress: number;
  error?: string;
  loadedAt?: string;
}

// Language switching context
export interface LanguageSwitchContext {
  from: LanguageCode;
  to: LanguageCode;
  reason: "user" | "auto" | "fallback" | "error";
  timestamp: string;
  success: boolean;
  error?: string;
}

// Language validation result
export interface LanguageValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

// Language statistics
export interface LanguageStatistics {
  totalLanguages: number;
  supportedLanguages: number;
  loadedLanguages: number;
  mostUsedLanguage: LanguageCode;
  leastUsedLanguage: LanguageCode;
  averageCompleteness: number;
}
