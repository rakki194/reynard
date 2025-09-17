/**
 * Shared test utilities and mocks for i18n testing
 * Provides consistent mocking setup across all i18n test files
 */

import { vi } from "vitest";

// Mock the loader functions
export const mockLoader = () => {
  vi.mock("../loader", () => ({
    loadTranslationsWithCache: vi.fn().mockResolvedValue({
      common: { hello: "Hello", goodbye: "Goodbye" },
      themes: { light: "Light", dark: "Dark" },
      core: { loading: "Loading..." },
      components: {},
      gallery: {},
      charts: {},
      auth: {},
      chat: {},
      monaco: {},
    }),
    loadNamespace: vi.fn().mockResolvedValue({ hello: "Hello" }),
    createOptimizedLoader: vi.fn().mockReturnValue({
      loadNamespace: vi.fn().mockResolvedValue({ hello: "Hello" }),
      loadFull: vi.fn().mockResolvedValue({ common: { hello: "Hello" } }),
    }),
    clearTranslationCache: vi.fn(),
    getCacheStats: vi.fn().mockReturnValue({
      fullTranslations: 1,
      namespaces: [{ name: "common", locales: 1 }],
    }),
    preloadTranslations: vi.fn().mockResolvedValue(undefined),
    fullTranslations: {},
  }));
};

// Mock the debugger
export const mockDebugger = () => {
  vi.mock("../debugger", () => ({
    I18nDebugger: vi.fn().mockImplementation(() => ({
      getUsedKeys: vi.fn().mockReturnValue(["common.hello"]),
      getMissingKeys: vi.fn().mockReturnValue([]),
      getUnusedKeys: vi.fn().mockReturnValue(["common.unused"]),
      validate: vi.fn().mockReturnValue({
        isValid: true,
        missingKeys: [],
        unusedKeys: ["common.unused"],
        duplicateKeys: [],
        errors: [],
      }),
      getStats: vi.fn().mockReturnValue({
        totalKeys: 10,
        usedKeys: 5,
        missingKeys: 0,
        unusedKeys: 5,
        cacheHits: 0,
        cacheMisses: 0,
      }),
      clear: vi.fn(),
      exportDebugData: vi.fn().mockReturnValue({
        usedKeys: ["common.hello"],
        missingKeys: [],
        stats: {},
        validation: {},
      }),
      printReport: vi.fn(),
    })),
    I18nPerformanceMonitor: vi.fn().mockImplementation(() => ({
      recordTranslationCall: vi.fn(),
      recordCacheHit: vi.fn(),
      recordCacheMiss: vi.fn(),
      recordLoadTime: vi.fn(),
      getMetrics: vi.fn().mockReturnValue({
        translationCalls: 10,
        cacheHits: 5,
        cacheMisses: 2,
        loadTimes: [100, 200, 150],
        averageLoadTime: 150,
      }),
      reset: vi.fn(),
    })),
    createTemplateTranslator: vi.fn().mockReturnValue(vi.fn().mockReturnValue("Hello World!")),
    createDebugPluralTranslator: vi.fn().mockReturnValue(vi.fn().mockReturnValue("1 item")),
  }));
};

// Mock the Intl formatter
export const mockIntl = () => {
  vi.mock("../intl", () => ({
    createIntlFormatter: vi.fn().mockReturnValue({
      number: {
        format: vi.fn().mockReturnValue("1,234.56"),
        formatCurrency: vi.fn().mockReturnValue("$1,234.56"),
        formatPercent: vi.fn().mockReturnValue("75%"),
      },
      date: {
        format: vi.fn().mockReturnValue("12/25/2023"),
        formatLong: vi.fn().mockReturnValue("December 25, 2023"),
      },
      relativeTime: {
        formatSmart: vi.fn().mockReturnValue("2 days ago"),
      },
      updateConfig: vi.fn(),
    }),
  }));
};

// Mock the migration tools
export const mockMigration = () => {
  vi.mock("../migration", () => ({
    TranslationManager: vi.fn().mockImplementation(() => ({
      setTranslation: vi.fn(),
      getTranslation: vi.fn().mockReturnValue("Hello"),
      getTranslations: vi.fn().mockReturnValue({ common: { hello: "Hello" } }),
      getChangeHistory: vi.fn().mockReturnValue([]),
      exportTranslations: vi.fn().mockReturnValue('{"common":{"hello":"Hello"}}'),
      importTranslations: vi.fn().mockReturnValue(true),
    })),
    TranslationAnalytics: vi.fn().mockImplementation(() => ({
      trackUsage: vi.fn(),
      getUsageStats: vi.fn().mockReturnValue({
        mostUsedKeys: [{ key: "common.hello", count: 5 }],
        localeUsage: [{ locale: "en", count: 5 }],
        totalUsage: 5,
      }),
      reset: vi.fn(),
    })),
  }));
};

// Mock browser APIs
export const mockBrowserAPIs = (): {
  mockLocalStorage: {
    getItem: ReturnType<typeof vi.fn>;
    setItem: ReturnType<typeof vi.fn>;
  };
  mockDocument: {
    documentElement: {
      setAttribute: ReturnType<typeof vi.fn>;
    };
  };
} => {
  const mockLocalStorage = {
    getItem: vi.fn(),
    setItem: vi.fn(),
  };
  vi.stubGlobal("localStorage", mockLocalStorage);

  const mockDocument = {
    documentElement: {
      setAttribute: vi.fn(),
    },
  };
  vi.stubGlobal("document", mockDocument);

  vi.stubGlobal("performance", {
    now: vi.fn().mockReturnValue(1000),
  });

  return { mockLocalStorage, mockDocument };
};

// Setup all mocks
export const setupAllMocks = (): {
  mockLocalStorage: {
    getItem: ReturnType<typeof vi.fn>;
    setItem: ReturnType<typeof vi.fn>;
  };
  mockDocument: {
    documentElement: {
      setAttribute: ReturnType<typeof vi.fn>;
    };
  };
} => {
  mockLoader();
  mockDebugger();
  mockIntl();
  mockMigration();
  return mockBrowserAPIs();
};
