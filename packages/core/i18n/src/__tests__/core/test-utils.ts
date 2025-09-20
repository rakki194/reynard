/**
 * Core test utilities for i18n core tests
 * Re-exports the main test utilities with core-specific additions
 */

import { vi, type MockedFunction } from "vitest";

export { setupAllMocks, mockLoader, mockDebugger, mockIntl, mockMigration, mockBrowserAPIs } from "../test-utils";

// Core-specific mocks
export const mockCoreModule = (): {
  createI18nModule: MockedFunction<
    () => {
      locale: MockedFunction<() => string>;
      setLocale: MockedFunction<() => void>;
      t: MockedFunction<() => string>;
      loadTranslations: MockedFunction<() => Promise<Record<string, unknown>>>;
      getCurrentLocale: MockedFunction<() => string>;
      getCurrentTranslations: MockedFunction<() => Record<string, unknown>>;
      isCurrentLocaleRTL: MockedFunction<() => boolean>;
      translations: MockedFunction<() => Record<string, unknown>>;
    }
  >;
  createBasicI18nModule: MockedFunction<
    () => {
      locale: MockedFunction<() => string>;
      setLocale: MockedFunction<() => void>;
      t: MockedFunction<() => string>;
    }
  >;
} => {
  // Mock core module creation
  return {
    createI18nModule: vi.fn().mockReturnValue({
      locale: vi.fn().mockReturnValue("en"),
      setLocale: vi.fn(),
      t: vi.fn().mockReturnValue("Hello"),
      loadTranslations: vi.fn().mockResolvedValue({}),
      getCurrentLocale: vi.fn().mockReturnValue("en"),
      getCurrentTranslations: vi.fn().mockReturnValue({}),
      isCurrentLocaleRTL: vi.fn().mockReturnValue(false),
      translations: vi.fn().mockReturnValue({}),
    }),
    createBasicI18nModule: vi.fn().mockReturnValue({
      locale: vi.fn().mockReturnValue("en"),
      setLocale: vi.fn(),
      t: vi.fn().mockReturnValue("Hello"),
    }),
  };
};
