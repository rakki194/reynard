/**
 * Features test utilities for i18n feature tests
 * Re-exports the main test utilities with feature-specific additions
 */

import { vi, type MockedFunction } from "vitest";

export { setupAllMocks, mockLoader, mockDebugger, mockIntl, mockMigration, mockBrowserAPIs } from "../test-utils";

// Features-specific mocks
export const mockFeatureModule = (): {
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
      debugger: {
        log: MockedFunction<() => void>;
        warn: MockedFunction<() => void>;
        error: MockedFunction<() => void>;
      };
      performanceMonitor: {
        start: MockedFunction<() => void>;
        end: MockedFunction<() => void>;
      };
      loadNamespace: MockedFunction<() => Promise<Record<string, unknown>>>;
      clearCache: MockedFunction<() => void>;
      getCacheStats: MockedFunction<() => Record<string, unknown>>;
    }
  >;
} => {
  // Mock feature module creation
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
      // Feature-specific methods
      debugger: {
        log: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
      },
      performanceMonitor: {
        start: vi.fn(),
        end: vi.fn(),
      },
      loadNamespace: vi.fn().mockResolvedValue({}),
      clearCache: vi.fn(),
      getCacheStats: vi.fn().mockReturnValue({}),
    }),
  };
};
