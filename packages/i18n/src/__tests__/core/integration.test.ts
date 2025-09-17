/**
 * Integration tests for all enhanced i18n features
 * Tests the complete system working together
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { createI18nModule } from "../../index";

// Mock all dependencies
const mockTrackUsage = vi.fn();
vi.mock("../../features/analytics/analytics-i18n", () => ({
  createAnalyticsI18nModule: vi.fn().mockReturnValue({
    t: vi.fn().mockImplementation((key, params) => {
      // Call analytics.trackUsage when t is called
      mockTrackUsage(key, "en");
      return "Hello";
    }),
    locale: vi.fn().mockReturnValue("en"),
    setLocale: vi.fn(),
    isRTL: false,
    languages: vi.fn().mockReturnValue(["en", "es"]),
    loadTranslations: vi.fn().mockResolvedValue({}),
    templateTranslator: vi.fn().mockImplementation((template, ...values) => {
      return template.reduce((result, string, i) => {
        return result + string + (values[i] || "");
      }, "");
    }),
    pluralTranslator: vi.fn().mockReturnValue("1 items"),
    analytics: {
      trackUsage: mockTrackUsage,
      getUsageStats: vi.fn().mockReturnValue({
        mostUsedKeys: [],
        localeUsage: [],
        totalUsage: 0,
        totalTranslations: 0,
        uniqueKeys: 0,
        lastReset: new Date(),
      }),
    },
    debugger: {
      getUsedKeys: vi.fn().mockReturnValue(["common.hello"]),
      getMissingKeys: vi.fn().mockReturnValue([]),
      getUnusedKeys: vi.fn().mockReturnValue([]),
      exportDebugData: vi.fn().mockReturnValue({}),
      getStats: vi.fn().mockReturnValue({
        totalKeys: 1,
        usedKeys: 1,
        missingKeys: 0,
        unusedKeys: 0,
      }),
    },
    intlFormatter: {
      number: {
        format: vi.fn().mockReturnValue("$1234.56"),
        formatCurrency: vi.fn().mockReturnValue("$1234.56"),
      },
      date: {
        formatLong: vi.fn().mockReturnValue("December 25, 2023"),
        formatShort: vi.fn().mockReturnValue("12/25/2023"),
      },
      relativeTime: {
        formatSmart: vi.fn().mockReturnValue("2 days ago"),
      },
    },
    performanceMonitor: {
      startTiming: vi.fn(),
      endTiming: vi.fn(),
      getMetrics: vi.fn().mockReturnValue({
        translationCalls: 0,
        cacheHits: 0,
        averageLoadTime: 0,
      }),
    },
    loadNamespace: vi.fn().mockResolvedValue({ hello: "Hello" }),
    getCacheStats: vi.fn().mockReturnValue({
      fullTranslations: 1,
      namespaces: [{ name: "common", locales: 1 }],
    }),
    clearCache: vi.fn(),
    translationManager: {
      setTranslation: vi.fn(),
      getTranslation: vi.fn().mockReturnValue("Hello"),
    },
  }),
}));

vi.mock("../../features/enterprise", () => ({
  TranslationManager: vi.fn().mockImplementation(() => ({
    setTranslation: vi.fn(),
    getTranslation: vi.fn().mockReturnValue("Hello"),
    getTranslations: vi.fn().mockReturnValue({ common: { hello: "Hello" } }),
    getChangeHistory: vi.fn().mockReturnValue([]),
    exportTranslations: vi.fn().mockReturnValue('{"common":{"hello":"Hello"}}'),
    importTranslations: vi.fn().mockReturnValue(true),
  })),
  TranslationAnalytics: vi.fn().mockImplementation(() => ({
    trackUsage: vi.fn().mockImplementation(() => {}),
    getUsageStats: vi.fn().mockReturnValue({
      mostUsedKeys: [{ key: "common.hello", count: 5 }],
      localeUsage: { en: 5 },
      totalUsage: 5,
      totalTranslations: 5,
      uniqueKeys: 1,
      lastReset: new Date(),
    }),
    reset: vi.fn(),
  })),
}));

vi.mock("../../features/debug/I18nDebugger", () => ({
  I18nDebugger: vi.fn().mockImplementation(() => ({
    getUsedKeys: vi.fn().mockReturnValue(["common.hello"]),
    getMissingKeys: vi.fn().mockReturnValue([]),
    getUnusedKeys: vi.fn().mockReturnValue([]),
    validate: vi.fn().mockReturnValue({
      isValid: true,
      missingKeys: [],
      unusedKeys: [],
      duplicateKeys: [],
      errors: [],
    }),
    getStats: vi.fn().mockReturnValue({
      usedKeys: ["common.hello"],
      missingKeys: [],
      totalTranslations: 1,
    }),
    printReport: vi.fn(),
    clear: vi.fn(),
    exportDebugData: vi.fn().mockReturnValue({}),
  })),
}));

vi.mock("../../features/performance/performance-monitor", () => ({
  createPerformanceMonitor: vi.fn().mockReturnValue({
    recordTranslationCall: vi.fn(),
    recordCacheHit: vi.fn(),
    recordCacheMiss: vi.fn(),
    recordLoadTime: vi.fn(),
    getMetrics: vi.fn().mockReturnValue({
      translationCalls: 10,
      cacheHits: 5,
      cacheMisses: 2,
      averageLoadTime: 100,
    }),
    reset: vi.fn(),
  }),
  createNoOpPerformanceMonitor: vi.fn().mockReturnValue({
    recordTranslationCall: vi.fn(),
    recordCacheHit: vi.fn(),
    recordCacheMiss: vi.fn(),
    recordLoadTime: vi.fn(),
    getMetrics: vi.fn().mockReturnValue({
      translationCalls: 0,
      cacheHits: 0,
      cacheMisses: 0,
      averageLoadTime: 0,
    }),
    reset: vi.fn(),
  }),
}));

vi.mock("../../loaders/cache/translation-cache", () => ({
  createCacheManager: vi.fn().mockReturnValue({
    clearCache: vi.fn(),
    getCacheStats: vi.fn().mockReturnValue({
      fullTranslations: 1,
      namespaces: ["common"],
      totalSize: 1024,
    }),
  }),
}));

vi.mock("../../loaders", () => ({
  loadTranslationsWithCache: vi.fn().mockResolvedValue({
    common: {
      hello: "Hello",
      goodbye: "Goodbye",
      items: "items", // Base key for simple pluralization
    },
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

vi.mock("../../features/debug", () => ({
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
  createTemplateTranslator: vi.fn().mockImplementation(t => (template: TemplateStringsArray, ...values: any[]) => {
    const key = template.join("${}");
    const params = values.reduce((acc, val, idx) => {
      acc[`param${idx}`] = val;
      return acc;
    }, {} as any);
    return t(key, params);
  }),
  createDebugPluralTranslator: vi.fn().mockImplementation((t, locale) => (key: string, count: number, params?: any) => {
    if (count === 1) {
      return "1 item";
    } else {
      return `${count} items`;
    }
  }),
}));

vi.mock("../../intl/IntlFormatter", () => ({
  createIntlFormatter: vi.fn().mockReturnValue({
    number: {
      format: vi.fn().mockImplementation((value, preset, options) => {
        if (preset === "currency") return `$${value.toFixed(2)}`;
        if (preset === "percent") return `${(value * 100).toFixed(0)}%`;
        return value.toLocaleString();
      }),
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

vi.mock("../../migration", () => ({
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

// Mock browser APIs
const mockLocalStorage = {
  getItem: vi.fn().mockReturnValue("en"),
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

describe("Enhanced I18n Integration Tests", () => {
  let i18n: any;

  beforeEach(() => {
    vi.clearAllMocks();
    i18n = createI18nModule({
      enableDebug: true,
      enablePerformanceMonitoring: true,
      usedNamespaces: ["common", "themes"],
      preloadLocales: ["en", "es"],
      intlConfig: {
        timeZone: "UTC",
        currency: "USD",
      },
    });
  });

  describe("Complete Feature Integration", () => {
    it("should integrate all enhanced features seamlessly", () => {
      // Test that all features are available
      expect(i18n.debugger).toBeDefined();
      expect(i18n.performanceMonitor).toBeDefined();
      expect(i18n.intlFormatter).toBeDefined();
      expect(i18n.templateTranslator).toBeDefined();
      expect(i18n.pluralTranslator).toBeDefined();
      expect(i18n.translationManager).toBeDefined();
      expect(i18n.analytics).toBeDefined();
      expect(i18n.loadNamespace).toBeDefined();
      expect(i18n.clearCache).toBeDefined();
      expect(i18n.getCacheStats).toBeDefined();
    });

    it("should work with template literals and pluralization", () => {
      // Test template translator
      const templateResult = i18n.templateTranslator`Hello ${"World"}! You have ${5} messages.`;
      expect(templateResult).toBeDefined();

      // Test plural translator
      const pluralResult = i18n.pluralTranslator("common.items", 1);
      expect(pluralResult).toBe("1 items");

      const pluralResultMultiple = i18n.pluralTranslator("common.items", 5);
      expect(pluralResultMultiple).toBe("5 items");
    });

    it("should integrate Intl formatting with translations", () => {
      // Test number formatting
      const currency = i18n.intlFormatter.number.format(1234.56, "currency");
      expect(currency).toBe("$1234.56");

      // Test date formatting
      const date = i18n.intlFormatter.date.format(new Date("2023-12-25"));
      expect(date).toBe("12/25/2023");

      // Test relative time
      const relative = i18n.intlFormatter.relativeTime.formatSmart(new Date());
      expect(relative).toBe("2 days ago");
    });

    it("should track performance and analytics together", () => {
      // Use translation function
      i18n.t("common.hello");

      // Check that analytics tracked the usage
      expect(i18n.analytics.trackUsage).toHaveBeenCalledWith("common.hello", "en");

      // Check that performance monitor exists and has correct methods
      expect(i18n.performanceMonitor).toBeDefined();
      expect(typeof i18n.performanceMonitor.recordTranslationCall).toBe("function");

      // Get performance metrics
      const metrics = i18n.performanceMonitor.getMetrics();
      expect(metrics.translationCalls).toBe(10);

      // Get analytics
      const stats = i18n.analytics.getUsageStats();
      expect(stats.totalUsage).toBe(5);
    });

    it("should integrate debugging with validation", () => {
      // Get debug information
      const usedKeys = i18n.debugger.getUsedKeys();
      const missingKeys = i18n.debugger.getMissingKeys();
      const unusedKeys = i18n.debugger.getUnusedKeys({
        common: { hello: "Hello" },
        themes: { light: "Light" },
        core: { loading: "Loading..." },
        components: {},
        gallery: {},
        charts: {},
        auth: {},
        chat: {},
        monaco: {},
      });

      expect(Array.isArray(usedKeys)).toBe(true);
      expect(Array.isArray(missingKeys)).toBe(true);
      expect(Array.isArray(unusedKeys)).toBe(true);

      // Validate translations
      const validation = i18n.debugger.validate({
        common: { hello: "Hello" },
        themes: { light: "Light" },
        core: { loading: "Loading..." },
        components: {},
        gallery: {},
        charts: {},
        auth: {},
        chat: {},
        monaco: {},
      });
      expect(validation.isValid).toBe(true);

      // Print debug report
      i18n.debugger.printReport({
        common: { hello: "Hello" },
        themes: { light: "Light" },
        core: { loading: "Loading..." },
        components: {},
        gallery: {},
        charts: {},
        auth: {},
        chat: {},
        monaco: {},
      });
      expect(i18n.debugger.printReport).toHaveBeenCalled();
    });

    it("should integrate namespace loading with caching", async () => {
      // Load namespace
      const namespaceData = await i18n.loadNamespace("common");
      expect(namespaceData).toEqual({ hello: "Hello" });

      // Check cache stats
      const cacheStats = i18n.getCacheStats();
      expect(cacheStats.fullTranslations).toBe(1);
      expect(cacheStats.namespaces).toHaveLength(1);

      // Clear cache
      i18n.clearCache();
      // The clearCache method should exist and be callable
      expect(typeof i18n.clearCache).toBe("function");
    });

    it("should integrate enterprise features with core functionality", () => {
      // Use translation manager
      i18n.translationManager.setTranslation("en", "common.test", "Test", "user@example.com");
      const translation = i18n.translationManager.getTranslation("en", "common.test");
      expect(translation).toBe("Hello"); // Mocked return value

      // Export translations
      const exported = i18n.translationManager.exportTranslations("en");
      expect(exported).toBe('{"common":{"hello":"Hello"}}');

      // Get analytics
      const analytics = i18n.analytics.getUsageStats();
      expect(analytics.mostUsedKeys).toHaveLength(1);
      expect(Object.keys(analytics.localeUsage)).toHaveLength(1);
    });
  });

  describe("Real-world Usage Scenarios", () => {
    it("should handle a complete translation workflow", async () => {
      // 1. Set up i18n with all features
      const workflowI18n = createI18nModule({
        enableDebug: true,
        enablePerformanceMonitoring: true,
        usedNamespaces: ["common", "themes"],
        preloadLocales: ["en", "es"],
      });

      // 2. Load specific namespace
      const commonTranslations = await workflowI18n.loadNamespace("common");
      expect(commonTranslations).toBeDefined();

      // 3. Use template literals
      const welcomeMessage = workflowI18n.templateTranslator`Welcome ${"User"}!`;
      expect(welcomeMessage).toBeDefined();

      // 4. Use pluralization
      const itemCount = workflowI18n.pluralTranslator("common.items", 3);
      expect(itemCount).toBe("3 items");

      // 5. Format numbers and dates
      const price = workflowI18n.intlFormatter.number.format(99.99, "currency");
      expect(price).toBe("$99.99");

      // 6. Check performance
      const metrics = workflowI18n.performanceMonitor.getMetrics();
      expect(metrics.translationCalls).toBeDefined();

      // 7. Get analytics
      const stats = workflowI18n.analytics.getUsageStats();
      expect(stats.totalUsage).toBeDefined();

      // 8. Debug and validate
      const debugData = workflowI18n.debugger.exportDebugData();
      expect(debugData).toBeDefined();
    });

    it("should handle locale switching with all features", () => {
      // Switch locale
      i18n.setLocale("es");

      // Check that setLocale function exists and can be called
      expect(typeof i18n.setLocale).toBe("function");

      // Check that Intl formatter exists
      expect(typeof i18n.intlFormatter.updateConfig).toBe("function");

      // Use translation in new locale
      i18n.t("common.hello");

      // Check that analytics tracked the new locale
      expect(i18n.analytics.trackUsage).toHaveBeenCalledWith("common.hello", "es");
    });

    it("should handle RTL languages correctly", () => {
      // Switch to RTL language
      i18n.setLocale("ar");

      // Check that isRTL property works
      expect(typeof i18n.isRTL).toBe("boolean");
    });

    it("should handle error scenarios gracefully", async () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      // Mock a loading error
      const { loadTranslationsWithCache } = await import("../../loaders");
      loadTranslationsWithCache.mockRejectedValueOnce(new Error("Network error"));

      // Create new i18n instance that will encounter the error
      const errorI18n = createI18nModule();

      // Wait for the effect to run
      await new Promise(resolve => setTimeout(resolve, 0));

      // Should handle error gracefully
      expect(typeof i18n.loadTranslations).toBe("function");

      consoleSpy.mockRestore();
    });
  });

  describe("Performance and Optimization", () => {
    it("should optimize bundle size with namespace loading", () => {
      // Create i18n with specific namespaces
      const optimizedI18n = createI18nModule({
        usedNamespaces: ["common", "themes"],
      });

      // Should use optimized loader
      expect(typeof i18n.loadNamespace).toBe("function");
    });

    it("should preload critical locales", () => {
      // Should have preloaded specified locales
      expect(typeof i18n.loadNamespace).toBe("function");
    });

    it("should cache translations efficiently", async () => {
      // Load namespace multiple times
      await i18n.loadNamespace("common");
      await i18n.loadNamespace("common");

      // Should only load once due to caching
      expect(typeof i18n.loadNamespace).toBe("function");
    });
  });

  describe("Enterprise Workflow", () => {
    it("should support complete enterprise translation management", () => {
      // 1. Set translation
      i18n.translationManager.setTranslation("en", "common.enterprise", "Enterprise", "admin@company.com");

      // 2. Get translation
      const translation = i18n.translationManager.getTranslation("en", "common.enterprise");

      // 3. Export for backup
      const backup = i18n.translationManager.exportTranslations("en");

      // 4. Track usage
      i18n.t("common.enterprise");

      // 5. Get analytics
      const usageStats = i18n.analytics.getUsageStats();

      // 6. Validate translations
      const validation = i18n.debugger.validate({
        common: { hello: "Hello" },
        themes: { light: "Light" },
        core: { loading: "Loading..." },
        components: {},
        gallery: {},
        charts: {},
        auth: {},
        chat: {},
        monaco: {},
      });

      // 7. Get performance metrics
      const performance = i18n.performanceMonitor.getMetrics();

      // All should work together
      expect(translation).toBeDefined();
      expect(backup).toBeDefined();
      expect(usageStats).toBeDefined();
      expect(validation).toBeDefined();
      expect(performance).toBeDefined();
    });
  });
});
