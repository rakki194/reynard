/**
 * Tests for migration tools and enterprise features
 * Covers TranslationManager, TranslationValidator, and TranslationAnalytics
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  migrateFromSolidI18n,
  migrateFromSolidPrimitives,
  migrateFromI18next,
  migrateTranslations,
  TranslationManager,
  TranslationValidator,
  TranslationAnalytics,
} from "../../migration";
import type { LanguageCode, Translations } from "../../types";

describe("Migration Tools", () => {
  describe("migrateFromSolidI18n", () => {
    it("should migrate flat solid-i18n structure to nested structure", () => {
      const sourceTranslations = {
        "common.language": "Language",
        "common.save": "Save",
        "themes.dark": "Dark Theme",
        "core.loading": "Loading...",
        "components.button": "Button",
        "unknown.key": "Unknown",
      };

      const result = migrateFromSolidI18n(sourceTranslations, {
        sourceLibrary: "solid-i18n",
        sourceTranslations,
        targetLocale: "en",
      });

      expect(result.success).toBe(true);
      expect(result.statistics.migratedKeys).toBe(6);
      expect(result.errors).toHaveLength(0);
      expect(result.warnings.length).toBeGreaterThan(0); // Should warn about unknown.key

      expect(result.migratedTranslations.common).toHaveProperty("language", "Language");
      expect(result.migratedTranslations.common).toHaveProperty("save", "Save");
      expect(result.migratedTranslations.themes).toHaveProperty("dark", "Dark Theme");
      expect(result.migratedTranslations.core).toHaveProperty("loading", "Loading...");
      expect(result.migratedTranslations.components).toHaveProperty("button", "Button");
    });

    it("should handle migration errors gracefully", () => {
      const invalidTranslations = null as any;

      // This should throw an error due to Object.keys(null)
      expect(() => {
        migrateFromSolidI18n(invalidTranslations, {
          sourceLibrary: "solid-i18n",
          sourceTranslations: invalidTranslations,
          targetLocale: "en",
        });
      }).toThrow();
    });
  });

  describe("migrateFromSolidPrimitives", () => {
    it("should migrate solid-primitives nested structure", () => {
      const sourceTranslations = {
        common: {
          hello: "Hello",
          goodbye: "Goodbye",
        },
        themes: {
          light: "Light",
          dark: "Dark",
        },
        unknown: {
          key: "Value",
        },
      };

      const result = migrateFromSolidPrimitives(sourceTranslations, {
        sourceLibrary: "solid-primitives",
        sourceTranslations,
        targetLocale: "en",
      });

      expect(result.success).toBe(true);
      expect(result.statistics.migratedKeys).toBe(5);
      expect(result.warnings.length).toBeGreaterThan(0); // Should warn about unknown namespace

      expect(result.migratedTranslations.common).toEqual(sourceTranslations.common);
      expect(result.migratedTranslations.themes).toEqual(sourceTranslations.themes);
    });
  });

  describe("migrateFromI18next", () => {
    it("should migrate i18next structure", () => {
      const sourceTranslations = {
        common: {
          hello: "Hello",
        },
        themes: {
          light: "Light",
        },
      };

      const result = migrateFromI18next(sourceTranslations, {
        sourceLibrary: "i18next",
        sourceTranslations,
        targetLocale: "en",
      });

      expect(result.success).toBe(true);
      expect(result.statistics.migratedKeys).toBe(2);
      expect(result.migratedTranslations.common).toEqual(sourceTranslations.common);
      expect(result.migratedTranslations.themes).toEqual(sourceTranslations.themes);
    });
  });

  describe("migrateTranslations", () => {
    it("should route to correct migration function for solid-i18n", () => {
      const sourceTranslations = { "common.hello": "Hello" };

      const result = migrateTranslations({
        sourceLibrary: "solid-i18n",
        sourceTranslations,
        targetLocale: "en",
      });

      expect(result.success).toBe(true);
      expect(result.migratedTranslations.common).toHaveProperty("hello", "Hello");
    });

    it("should route to correct migration function for solid-primitives", () => {
      const sourceTranslations = { common: { hello: "Hello" } };

      const result = migrateTranslations({
        sourceLibrary: "solid-primitives",
        sourceTranslations,
        targetLocale: "en",
      });

      expect(result.success).toBe(true);
      expect(result.migratedTranslations.common).toEqual({ hello: "Hello" });
    });

    it("should handle unsupported source library", () => {
      const result = migrateTranslations({
        sourceLibrary: "unsupported" as any,
        sourceTranslations: {},
        targetLocale: "en",
      });

      expect(result.success).toBe(false);
      expect(result.errors[0]).toContain("Unsupported source library");
    });
  });
});

describe("TranslationManager", () => {
  let manager: TranslationManager;
  const config = { locale: "en-US" as LanguageCode };

  beforeEach(() => {
    manager = new TranslationManager(config);
  });

  describe("Translation Management", () => {
    it("should set and get translations", () => {
      manager.setTranslation("en", "common.hello", "Hello", "user@example.com");

      const translation = manager.getTranslation("en", "common.hello");
      expect(translation).toBe("Hello");
    });

    it("should get all translations for a locale", () => {
      manager.setTranslation("en", "common.hello", "Hello");
      manager.setTranslation("en", "common.goodbye", "Goodbye");

      const translations = manager.getTranslations("en");
      expect(translations).toHaveProperty("common");
      expect(translations.common).toHaveProperty("hello", "Hello");
      expect(translations.common).toHaveProperty("goodbye", "Goodbye");
    });

    it("should track change history", () => {
      manager.setTranslation("en", "common.hello", "Hello", "user@example.com");
      manager.setTranslation("en", "common.hello", "Hi", "user@example.com");

      const history = manager.getChangeHistory();
      expect(history).toHaveLength(2);
      expect(history[0]).toHaveProperty("key", "common.hello");
      expect(history[0]).toHaveProperty("newValue", "Hello");
      expect(history[1]).toHaveProperty("oldValue", "Hello");
      expect(history[1]).toHaveProperty("newValue", "Hi");
    });
  });

  describe("Import/Export", () => {
    it("should export translations as JSON", () => {
      manager.setTranslation("en", "common.hello", "Hello");

      const json = manager.exportTranslations("en");
      const parsed = JSON.parse(json);

      expect(parsed.common).toHaveProperty("hello", "Hello");
    });

    it("should import translations from JSON", () => {
      const jsonString = JSON.stringify({
        common: { hello: "Hello", goodbye: "Goodbye" },
      });

      const success = manager.importTranslations("en", jsonString, "user@example.com");

      expect(success).toBe(true);
      expect(manager.getTranslation("en", "common.hello")).toBe("Hello");
      expect(manager.getTranslation("en", "common.goodbye")).toBe("Goodbye");
    });

    it("should handle invalid JSON import", () => {
      const success = manager.importTranslations("en", "invalid json", "user@example.com");

      expect(success).toBe(false);
    });

    it("should record import in change history", () => {
      const jsonString = JSON.stringify({ common: { hello: "Hello" } });

      manager.importTranslations("en", jsonString, "user@example.com");

      const history = manager.getChangeHistory();
      expect(history).toHaveLength(1);
      expect(history[0]).toHaveProperty("key", "IMPORT");
      expect(history[0]).toHaveProperty("author", "user@example.com");
    });
  });
});

describe("TranslationValidator", () => {
  let validator: TranslationValidator;

  beforeEach(() => {
    validator = new TranslationValidator();
  });

  describe("Custom Validation Rules", () => {
    it("should add and execute custom validation rules", () => {
      const customRule = vi.fn().mockReturnValue(["Custom error"]);
      validator.addRule(customRule);

      const translations = { common: { hello: "Hello" } } as any;
      const errors = validator.validate(translations);

      expect(customRule).toHaveBeenCalledWith(translations);
      expect(errors).toContain("Custom error");
    });

    it("should execute multiple validation rules", () => {
      const rule1 = vi.fn().mockReturnValue(["Error 1"]);
      const rule2 = vi.fn().mockReturnValue(["Error 2"]);

      validator.addRule(rule1);
      validator.addRule(rule2);

      const translations = { common: { hello: "Hello" } } as any;
      const errors = validator.validate(translations);

      expect(errors).toContain("Error 1");
      expect(errors).toContain("Error 2");
    });
  });

  describe("Default Validator", () => {
    it("should create default validator with built-in rules", () => {
      const defaultValidator = TranslationValidator.createDefaultValidator();

      const incompleteTranslations = { common: { hello: "Hello" } } as any;
      const errors = defaultValidator.validate(incompleteTranslations);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(error => error.includes("Missing required namespace"))).toBe(true);
    });

    it("should validate complete translations successfully", () => {
      const defaultValidator = TranslationValidator.createDefaultValidator();

      const completeTranslations = {
        common: { hello: "Hello" },
        themes: { light: "Light" },
        core: { loading: "Loading" },
        components: { button: "Button" },
      } as any;

      const errors = defaultValidator.validate(completeTranslations);

      // Should not have missing namespace errors
      expect(errors.some(error => error.includes("Missing required namespace"))).toBe(false);
    });

    it("should detect empty values", () => {
      const defaultValidator = TranslationValidator.createDefaultValidator();

      const translationsWithEmpty = {
        common: { hello: "Hello", empty: "" },
        themes: { light: "Light" },
        core: { loading: "Loading" },
        components: { button: "Button" },
      } as any;

      const errors = defaultValidator.validate(translationsWithEmpty);

      expect(errors.some(error => error.includes("Empty value"))).toBe(true);
    });
  });
});

describe("TranslationAnalytics", () => {
  let analytics: TranslationAnalytics;

  beforeEach(() => {
    analytics = new TranslationAnalytics();
  });

  describe("Usage Tracking", () => {
    it("should track translation usage", () => {
      analytics.trackUsage("common.hello", "en");
      analytics.trackUsage("common.hello", "en");
      analytics.trackUsage("common.goodbye", "en");
      analytics.trackUsage("common.hello", "es");

      const stats = analytics.getUsageStats();

      expect(stats.mostUsedKeys).toHaveLength(2);
      expect(stats.mostUsedKeys[0]).toHaveProperty("key", "common.hello");
      expect(stats.mostUsedKeys[0]).toHaveProperty("count", 3);
      expect(stats.mostUsedKeys[1]).toHaveProperty("key", "common.goodbye");
      expect(stats.mostUsedKeys[1]).toHaveProperty("count", 1);
    });

    it("should track locale usage", () => {
      analytics.trackUsage("common.hello", "en");
      analytics.trackUsage("common.hello", "en");
      analytics.trackUsage("common.hello", "es");

      const stats = analytics.getUsageStats();

      expect(stats.localeUsage).toHaveLength(2);
      expect(stats.localeUsage[0]).toHaveProperty("locale", "en");
      expect(stats.localeUsage[0]).toHaveProperty("count", 2);
      expect(stats.localeUsage[1]).toHaveProperty("locale", "es");
      expect(stats.localeUsage[1]).toHaveProperty("count", 1);
    });

    it("should calculate total usage", () => {
      analytics.trackUsage("common.hello", "en");
      analytics.trackUsage("common.goodbye", "en");
      analytics.trackUsage("common.hello", "es");

      const stats = analytics.getUsageStats();
      expect(stats.totalUsage).toBe(3);
    });
  });

  describe("Statistics Reset", () => {
    it("should reset all statistics", () => {
      analytics.trackUsage("common.hello", "en");
      analytics.trackUsage("common.goodbye", "es");

      analytics.reset();

      const stats = analytics.getUsageStats();
      expect(stats.totalUsage).toBe(0);
      expect(stats.mostUsedKeys).toHaveLength(0);
      expect(stats.localeUsage).toHaveLength(0);
    });
  });

  describe("Usage Statistics", () => {
    it("should provide comprehensive usage statistics", () => {
      analytics.trackUsage("common.hello", "en");
      analytics.trackUsage("common.hello", "en");
      analytics.trackUsage("common.goodbye", "es");

      const stats = analytics.getUsageStats();

      expect(stats).toHaveProperty("mostUsedKeys");
      expect(stats).toHaveProperty("localeUsage");
      expect(stats).toHaveProperty("totalUsage");

      expect(Array.isArray(stats.mostUsedKeys)).toBe(true);
      expect(Array.isArray(stats.localeUsage)).toBe(true);
      expect(typeof stats.totalUsage).toBe("number");
    });

    it("should sort most used keys by count", () => {
      analytics.trackUsage("common.hello", "en");
      analytics.trackUsage("common.hello", "en");
      analytics.trackUsage("common.hello", "en");
      analytics.trackUsage("common.goodbye", "en");

      const stats = analytics.getUsageStats();

      expect(stats.mostUsedKeys[0].count).toBeGreaterThanOrEqual(stats.mostUsedKeys[1].count);
    });

    it("should sort locale usage by count", () => {
      analytics.trackUsage("common.hello", "en");
      analytics.trackUsage("common.hello", "en");
      analytics.trackUsage("common.hello", "es");

      const stats = analytics.getUsageStats();

      expect(stats.localeUsage[0].count).toBeGreaterThanOrEqual(stats.localeUsage[1].count);
    });
  });
});
