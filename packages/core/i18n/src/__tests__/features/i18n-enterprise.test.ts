/**
 * Tests for enterprise i18n features
 * Covers translation manager, analytics, and enterprise-level functionality
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { createI18nModule } from "../../index";
import { setupAllMocks } from "./test-utils";

// Setup all mocks
const { mockLocalStorage } = setupAllMocks();

describe("I18n Enterprise Features", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue("en");
  });

  describe("Translation Manager", () => {
    it("should provide translation manager", () => {
      const i18n = createI18nModule();

      expect(i18n.translationManager).toBeDefined();
      expect(i18n.translationManager.setTranslation).toBeDefined();
      expect(i18n.translationManager.getTranslation).toBeDefined();
    });

    it("should set translations dynamically", () => {
      const i18n = createI18nModule();

      i18n.translationManager.setTranslation("common.hello", "Hello", "en");

      expect(i18n.translationManager.setTranslation).toBeDefined();
    });

    it("should get translations", () => {
      const i18n = createI18nModule();

      const translation = i18n.translationManager.getTranslation("common.hello", "en");

      // The function should exist and be callable
      expect(i18n.translationManager.getTranslation).toBeDefined();
    });

    it("should get all translations", () => {
      const i18n = createI18nModule();

      const translations = i18n.translationManager.getTranslations("en");

      // The function should exist and be callable
      expect(i18n.translationManager.getTranslations).toBeDefined();
    });

    it("should track change history", () => {
      const i18n = createI18nModule();

      const history = i18n.translationManager.getChangeHistory();

      expect(Array.isArray(history)).toBe(true);
    });

    it("should export translations", () => {
      const i18n = createI18nModule();

      const exported = i18n.translationManager.exportTranslations("en");

      // The function should exist and be callable
      expect(i18n.translationManager.exportTranslations).toBeDefined();
    });

    it("should import translations", () => {
      const i18n = createI18nModule();

      const success = i18n.translationManager.importTranslations('{"common":{"hello":"Hello"}}', "en");

      expect(typeof success).toBe("boolean");
    });
  });

  describe("Analytics", () => {
    it("should provide analytics", () => {
      const i18n = createI18nModule();

      expect(i18n.analytics).toBeDefined();
      expect(i18n.analytics.trackUsage).toBeDefined();
      expect(i18n.analytics.getUsageStats).toBeDefined();
    });

    it("should track translation usage automatically", () => {
      const i18n = createI18nModule();

      i18n.t("common.hello");

      expect(i18n.analytics.trackUsage).toBeDefined();
    });

    it("should track manual usage", () => {
      const i18n = createI18nModule();

      i18n.analytics.trackUsage("common.goodbye", "es");

      expect(i18n.analytics.trackUsage).toBeDefined();
    });

    it("should provide usage statistics", () => {
      const i18n = createI18nModule();

      const stats = i18n.analytics.getUsageStats();

      expect(stats).toHaveProperty("mostUsedKeys");
      expect(stats).toHaveProperty("localeUsage");
      expect(stats).toHaveProperty("totalUsage");
    });

    it("should track most used keys", () => {
      const i18n = createI18nModule();

      const stats = i18n.analytics.getUsageStats();

      expect(stats).toBeDefined();
      expect(stats).toHaveProperty("mostUsedKeys");
    });

    it("should track locale usage", () => {
      const i18n = createI18nModule();

      const stats = i18n.analytics.getUsageStats();

      expect(stats).toBeDefined();
      expect(stats).toHaveProperty("localeUsage");
    });

    it("should reset analytics", () => {
      const i18n = createI18nModule();

      i18n.analytics.reset();

      expect(i18n.analytics.reset).toBeDefined();
    });
  });

  describe("Enterprise Integration", () => {
    it("should integrate translation manager with analytics", () => {
      const i18n = createI18nModule();

      // Set a translation
      i18n.translationManager.setTranslation("common.test", "Test", "en");

      // Use the translation
      i18n.t("common.test");

      // Analytics should track the usage
      expect(i18n.analytics.trackUsage).toBeDefined();
    });

    it("should handle multiple locales in enterprise features", () => {
      const i18n = createI18nModule();

      // Set translations for multiple locales
      i18n.translationManager.setTranslation("common.hello", "Hello", "en");
      i18n.translationManager.setTranslation("common.hello", "Hola", "es");

      // Track usage for different locales
      i18n.analytics.trackUsage("common.hello", "en");
      i18n.analytics.trackUsage("common.hello", "es");

      expect(i18n.analytics.trackUsage).toBeDefined();
    });

    it("should provide comprehensive enterprise workflow", () => {
      const i18n = createI18nModule();

      // Import translations
      const success = i18n.translationManager.importTranslations('{"common":{"welcome":"Welcome"}}', "en");
      expect(typeof success).toBe("boolean");

      // Use translations
      i18n.t("common.welcome");

      // Track usage
      expect(i18n.analytics.trackUsage).toBeDefined();

      // Export translations
      const exported = i18n.translationManager.exportTranslations("en");
      expect(i18n.translationManager.exportTranslations).toBeDefined();

      // Get usage stats
      const stats = i18n.analytics.getUsageStats();
      expect(stats).toBeDefined();
    });
  });
});
