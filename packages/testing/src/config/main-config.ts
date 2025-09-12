/**
 * Main i18n Testing Configuration
 * Central configuration for translation testing across all Reynard packages
 */

import type { I18nTestingConfig } from './types';
import { allPackages } from './packages';
import { BASE_IGNORE_PATTERNS } from './ignore-patterns';

export const defaultI18nTestingConfig: I18nTestingConfig = {
  packages: allPackages,
  locales: [
    'en', 'es', 'fr', 'de', 'ru', 'ar', 'zh', 'ja', 'ko', 'pt', 'it', 'nl', 
    'sv', 'no', 'da', 'fi', 'pl', 'cs', 'hu', 'tr'
  ],
  defaultIgnorePatterns: BASE_IGNORE_PATTERNS,
  generateCoverageReport: true,
  failOnCI: true,
  eslintConfig: {
    enabled: true,
    rules: {
      '@reynard/i18n/no-hardcoded-strings': 'error',
      '@reynard/i18n/no-untranslated-keys': 'warn'
    }
  }
};
