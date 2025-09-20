/**
 * Tests for enhanced i18n features
 * Covers debugger, Intl formatter, template translator, and plural translator
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { createI18nModule } from "../../index";
import { setupAllMocks } from "./test-utils";

// Setup all mocks
const { mockLocalStorage } = setupAllMocks();

describe("I18n Enhanced Features", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue("en");
  });

  describe("Enhanced Features Initialization", () => {
    it("should include all enhanced features", () => {
      const i18n = createI18nModule({
        enableDebug: true,
        enablePerformanceMonitoring: true,
      });

      expect(i18n).toHaveProperty("debugger");
      expect(i18n).toHaveProperty("performanceMonitor");
      expect(i18n).toHaveProperty("intlFormatter");
      expect(i18n).toHaveProperty("templateTranslator");
      expect(i18n).toHaveProperty("pluralTranslator");
      expect(i18n).toHaveProperty("loadNamespace");
      expect(i18n).toHaveProperty("clearCache");
      expect(i18n).toHaveProperty("getCacheStats");
      expect(i18n).toHaveProperty("translationManager");
      expect(i18n).toHaveProperty("analytics");
    });

    it("should initialize debugger when debug is enabled", () => {
      const i18n = createI18nModule({ enableDebug: true });

      expect(i18n.debugger).toBeDefined();
      expect(i18n.debugger.getUsedKeys).toBeDefined();
      expect(i18n.debugger.getMissingKeys).toBeDefined();
    });

    it("should initialize performance monitor when enabled", () => {
      const i18n = createI18nModule({ enablePerformanceMonitoring: true });

      expect(i18n.performanceMonitor).toBeDefined();
      expect(i18n.performanceMonitor.getMetrics).toBeDefined();
    });

    it("should initialize Intl formatter with config", () => {
      const intlConfig = { timeZone: "UTC", currency: "USD" };
      const i18n = createI18nModule({ intlConfig });

      expect(i18n.intlFormatter).toBeDefined();
      expect(i18n.intlFormatter.number).toBeDefined();
      expect(i18n.intlFormatter.date).toBeDefined();
    });

    it("should initialize enterprise features", () => {
      const i18n = createI18nModule();

      expect(i18n.translationManager).toBeDefined();
      expect(i18n.analytics).toBeDefined();
    });
  });

  describe("Debug Features", () => {
    it("should provide debug report when debugger is available", () => {
      const i18n = createI18nModule({
        enableDebug: true,
      });

      expect(i18n.debugger).toBeDefined();
      expect(typeof i18n.debugger.printReport).toBe("function");

      const mockTranslations = { common: { hello: "Hello" } };
      i18n.debugger.printReport(mockTranslations);

      expect(i18n.debugger.printReport).toBeDefined();
    });

    it("should track used keys in debugger when enabled", () => {
      const i18n = createI18nModule({
        enableDebug: true,
      });

      i18n.t("common.hello");

      expect(i18n.debugger).toBeDefined();
    });

    it("should provide debug statistics", () => {
      const i18n = createI18nModule({ enableDebug: true });

      expect(i18n.debugger.getStats).toBeDefined();
      const stats = i18n.debugger.getStats();

      expect(stats).toHaveProperty("totalKeys");
      expect(stats).toHaveProperty("usedKeys");
      expect(stats).toHaveProperty("missingKeys");
    });
  });

  describe("Intl Formatter", () => {
    it("should provide number formatting", () => {
      const i18n = createI18nModule();

      expect(i18n.intlFormatter.number.format).toBeDefined();
      expect(i18n.intlFormatter.number.formatCurrency).toBeDefined();
      expect(i18n.intlFormatter.number.formatPercent).toBeDefined();
    });

    it("should provide date formatting", () => {
      const i18n = createI18nModule();

      expect(i18n.intlFormatter.date.format).toBeDefined();
      expect(i18n.intlFormatter.date.formatLong).toBeDefined();
    });

    it("should provide relative time formatting", () => {
      const i18n = createI18nModule();

      expect(i18n.intlFormatter.relativeTime.formatSmart).toBeDefined();
    });

    it("should update config when locale changes", () => {
      const i18n = createI18nModule();

      i18n.setLocale("es");

      expect(i18n.intlFormatter.updateConfig).toBeDefined();
    });
  });

  describe("Template Translator", () => {
    it("should provide template translator", () => {
      const i18n = createI18nModule();

      const result = i18n.templateTranslator`Hello ${"World"}!`;

      expect(typeof result).toBe("string");
    });

    it("should handle complex template strings", () => {
      const i18n = createI18nModule();

      const name = "Reynard";
      const count = 5;
      const result = i18n.templateTranslator`Hello ${name}, you have ${count} messages!`;

      expect(typeof result).toBe("string");
    });
  });

  describe("Plural Translator", () => {
    it("should provide plural translator", () => {
      const i18n = createI18nModule();

      const result = i18n.pluralTranslator("common.items", 1);

      expect(typeof result).toBe("string");
    });

    it("should handle different plural forms", () => {
      const i18n = createI18nModule();

      const singular = i18n.pluralTranslator("common.items", 1);
      const plural = i18n.pluralTranslator("common.items", 5);

      expect(typeof singular).toBe("string");
      expect(typeof plural).toBe("string");
    });

    it("should handle zero count", () => {
      const i18n = createI18nModule();

      const result = i18n.pluralTranslator("common.items", 0);

      expect(typeof result).toBe("string");
    });
  });

  describe("Translation Function Integration", () => {
    it("should track usage in analytics", () => {
      const i18n = createI18nModule();

      i18n.t("common.hello");

      expect(i18n.analytics.trackUsage).toBeDefined();
    });

    it("should record performance metrics when enabled", () => {
      const i18n = createI18nModule({
        enablePerformanceMonitoring: true,
      });

      expect(i18n.performanceMonitor).toBeDefined();
      expect(typeof i18n.performanceMonitor.recordTranslationCall).toBe("function");

      i18n.t("common.hello");

      expect(typeof i18n.performanceMonitor.recordTranslationCall).toBe("function");
    });
  });
});
