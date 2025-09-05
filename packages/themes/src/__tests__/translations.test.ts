/**
 * Tests for translation system
 */

import { describe, it, expect } from "vitest";
import {
  languages,
  loadTranslations,
  getTranslationValue,
  getLanguage,
  isRTL,
  getBrowserLocale,
  getPluralForm,
} from "../translations";
import type { LanguageCode } from "../types";

describe("Translation System", () => {
  it("should have all required languages", () => {
    const expectedLanguages: LanguageCode[] = [
      "en",
      "ja",
      "fr",
      "ru",
      "zh",
      "sv",
      "pl",
      "uk",
      "fi",
      "de",
      "es",
      "it",
      "pt",
      "pt-BR",
      "ko",
      "nl",
      "tr",
      "vi",
      "th",
      "ar",
      "he",
      "hi",
      "id",
      "cs",
      "el",
      "hu",
      "ro",
      "bg",
      "da",
      "nb",
    ];

    expectedLanguages.forEach((code) => {
      const language = getLanguage(code);
      expect(language).toBeDefined();
      expect(language?.code).toBe(code);
    });
  });

  it("should load English translations", async () => {
    const translations = await loadTranslations("en");
    expect(translations).toBeDefined();
    expect(translations.common).toBeDefined();
    expect(translations.themes).toBeDefined();
  });

  it("should load translations for other languages", async () => {
    const translations = await loadTranslations("ja");
    expect(translations).toBeDefined();
    expect(translations.common).toBeDefined();
    expect(translations.themes).toBeDefined();
  });

  it("should fallback to English for invalid locale", async () => {
    const translations = await loadTranslations("invalid" as LanguageCode);
    expect(translations).toBeDefined();
    expect(translations.common).toBeDefined();
  });

  describe("getTranslationValue", () => {
    const testTranslations = {
      common: {
        close: "Close",
        save: "Save",
        count: (params: { count: number }) => `Count: ${params.count}`,
      },
      themes: {
        light: "Light",
        dark: "Dark",
      },
    };

    it("should return simple string values", () => {
      expect(getTranslationValue(testTranslations, "common.close")).toBe(
        "Close",
      );
      expect(getTranslationValue(testTranslations, "themes.light")).toBe(
        "Light",
      );
    });

    it("should return function results with parameters", () => {
      expect(
        getTranslationValue(testTranslations, "common.count", { count: 5 }),
      ).toBe("Count: 5");
    });

    it("should return key for missing translations", () => {
      expect(getTranslationValue(testTranslations, "missing.key")).toBe(
        "missing.key",
      );
    });

    it("should interpolate parameters in strings", () => {
      const translations = {
        test: "Hello {name}, you have {count} items",
      };
      expect(
        getTranslationValue(translations, "test", { name: "John", count: 3 }),
      ).toBe("Hello John, you have 3 items");
    });
  });

  describe("getLanguage", () => {
    it("should return language for valid code", () => {
      const language = getLanguage("en");
      expect(language).toBeDefined();
      expect(language?.code).toBe("en");
      expect(language?.name).toBe("English");
    });

    it("should return undefined for invalid code", () => {
      expect(getLanguage("invalid" as LanguageCode)).toBeUndefined();
    });
  });

  describe("isRTL", () => {
    it("should return true for RTL languages", () => {
      expect(isRTL("ar")).toBe(true);
      expect(isRTL("he")).toBe(true);
    });

    it("should return false for LTR languages", () => {
      expect(isRTL("en")).toBe(false);
      expect(isRTL("ja")).toBe(false);
      expect(isRTL("fr")).toBe(false);
    });
  });

  describe("getBrowserLocale", () => {
    it("should return English for unsupported language", () => {
      Object.defineProperty(navigator, "language", {
        value: "unsupported",
        writable: true,
      });

      expect(getBrowserLocale()).toBe("en");
    });

    it("should return supported language", () => {
      Object.defineProperty(navigator, "language", {
        value: "ja",
        writable: true,
      });

      expect(getBrowserLocale()).toBe("ja");
    });
  });

  describe("getPluralForm", () => {
    it("should return correct plural form for English", () => {
      expect(getPluralForm("en", 1)).toBe(0); // singular
      expect(getPluralForm("en", 2)).toBe(1); // plural
    });

    it("should return correct plural form for Russian", () => {
      expect(getPluralForm("ru", 1)).toBe(0); // singular
      expect(getPluralForm("ru", 2)).toBe(1); // few
      expect(getPluralForm("ru", 5)).toBe(2); // many
    });

    it("should return correct plural form for Arabic", () => {
      expect(getPluralForm("ar", 0)).toBe(0); // zero
      expect(getPluralForm("ar", 1)).toBe(1); // one
      expect(getPluralForm("ar", 2)).toBe(2); // two
      expect(getPluralForm("ar", 3)).toBe(3); // few
      expect(getPluralForm("ar", 11)).toBe(4); // many
      expect(getPluralForm("ar", 100)).toBe(5); // other
    });
  });
});
