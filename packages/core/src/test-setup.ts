/**
 * Test setup for core package
 * Provides mocks for i18n and other dependencies
 */

import { vi } from 'vitest';

// Mock the i18n system
vi.mock('reynard-i18n', () => ({
  i18n: {
    t: vi.fn((key: string) => {
      // Return a mock translation that includes the key for debugging
      return `[${key}]`;
    })
  },
  createI18nModule: vi.fn(() => ({
    t: vi.fn((key: string) => `[${key}]`),
    setLocale: vi.fn(),
    getLocale: vi.fn(() => 'en'),
    addTranslations: vi.fn(),
    hasTranslation: vi.fn(() => true),
    locale: 'en',
    isRTL: false,
    languages: ['en', 'es', 'fr', 'de', 'ru', 'ar']
  }))
}));

// Mock console methods to avoid noise in tests
global.console = {
  ...console,
  log: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  debug: vi.fn(),
};