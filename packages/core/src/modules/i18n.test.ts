/**
 * Tests for i18n module
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  createI18nModule,
  getInitialLocale,
  isRTL,
  getTranslationValue,
  languages,
  rtlLanguages,
} from "./i18n";
import type { Locale, Translations } from "./i18n";

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

// Mock navigator.language
Object.defineProperty(navigator, "language", {
  value: "en-US",
  writable: true,
});

// Mock document.documentElement
Object.defineProperty(document, "documentElement", {
  value: {
    setAttribute: vi.fn(),
  },
});

describe("I18n Module", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  describe("languages", () => {
    it("should contain 37 supported languages", () => {
      expect(languages).toHaveLength(37);
    });

    it("should include common languages", () => {
      const codes = languages.map((lang) => lang.code);
      expect(codes).toContain("en");
      expect(codes).toContain("es");
      expect(codes).toContain("fr");
      expect(codes).toContain("de");
      expect(codes).toContain("ja");
      expect(codes).toContain("zh");
    });

    it("should have proper structure for each language", () => {
      languages.forEach((language) => {
        expect(language).toHaveProperty("code");
        expect(language).toHaveProperty("name");
        expect(typeof language.code).toBe("string");
        expect(typeof language.name).toBe("string");
      });
    });
  });

  describe("getInitialLocale", () => {
    it("should return en as default when no saved locale", () => {
      localStorageMock.getItem.mockReturnValue(null);
      expect(getInitialLocale()).toBe("en");
    });

    it("should return saved locale from localStorage", () => {
      localStorageMock.getItem.mockReturnValue("es");
      expect(getInitialLocale()).toBe("es");
    });

    it("should fallback to en for invalid saved locale", () => {
      localStorageMock.getItem.mockReturnValue("invalid-locale");
      expect(getInitialLocale()).toBe("en");
    });

    it("should use browser language when available", () => {
      localStorageMock.getItem.mockReturnValue(null);
      Object.defineProperty(navigator, "language", { value: "fr-FR" });
      expect(getInitialLocale()).toBe("fr");
    });

    it("should fallback to en for unsupported browser language", () => {
      localStorageMock.getItem.mockReturnValue(null);
      Object.defineProperty(navigator, "language", { value: "xx-XX" });
      expect(getInitialLocale()).toBe("en");
    });

    it("should handle SSR gracefully", () => {
      const originalWindow = global.window;
      delete (global as any).window;

      expect(getInitialLocale()).toBe("en");

      global.window = originalWindow;
    });
  });

  describe("isRTL", () => {
    it("should return true for RTL languages", () => {
      expect(isRTL("ar")).toBe(true);
      expect(isRTL("he")).toBe(true);
    });

    it("should return false for LTR languages", () => {
      expect(isRTL("en")).toBe(false);
      expect(isRTL("es")).toBe(false);
      expect(isRTL("fr")).toBe(false);
    });
  });

  describe("rtlLanguages", () => {
    it("should contain Arabic and Hebrew", () => {
      expect(rtlLanguages.has("ar")).toBe(true);
      expect(rtlLanguages.has("he")).toBe(true);
    });

    it("should not contain common LTR languages", () => {
      expect(rtlLanguages.has("en")).toBe(false);
      expect(rtlLanguages.has("es")).toBe(false);
      expect(rtlLanguages.has("fr")).toBe(false);
    });
  });

  describe("getTranslationValue", () => {
    const testTranslations: Translations = {
      hello: "Hello",
      welcome: {
        title: "Welcome",
        subtitle: "Welcome to our app",
      },
      user: {
        greeting: "Hello {name}",
        age: "You are {age} years old",
      },
    };

    it("should return simple translation", () => {
      expect(getTranslationValue(testTranslations, "hello")).toBe("Hello");
    });

    it("should return nested translation", () => {
      expect(getTranslationValue(testTranslations, "welcome.title")).toBe(
        "Welcome",
      );
      expect(getTranslationValue(testTranslations, "welcome.subtitle")).toBe(
        "Welcome to our app",
      );
    });

    it("should return key when translation not found", () => {
      expect(getTranslationValue(testTranslations, "nonexistent")).toBe(
        "nonexistent",
      );
      expect(getTranslationValue(testTranslations, "welcome.nonexistent")).toBe(
        "welcome.nonexistent",
      );
    });

    it("should interpolate parameters", () => {
      expect(
        getTranslationValue(testTranslations, "user.greeting", {
          name: "John",
        }),
      ).toBe("Hello John");
      expect(
        getTranslationValue(testTranslations, "user.age", { age: 25 }),
      ).toBe("You are 25 years old");
    });

    it("should handle multiple parameters", () => {
      expect(
        getTranslationValue(testTranslations, "user.greeting", {
          name: "John",
          age: 25,
        }),
      ).toBe("Hello John");
    });

    it("should return key when final value is not string", () => {
      const invalidTranslations: Translations = {
        invalid: { nested: { value: 123 as any } },
      };
      expect(
        getTranslationValue(invalidTranslations, "invalid.nested.value"),
      ).toBe("invalid.nested.value");
    });
  });

  describe("createI18nModule", () => {
    it("should create i18n module with default locale", () => {
      const i18nModule = createI18nModule();

      expect(i18nModule.locale).toBeDefined();
      expect(i18nModule.setLocale).toBeDefined();
      expect(i18nModule.setTranslations).toBeDefined();
      expect(i18nModule.t).toBeDefined();
      expect(i18nModule.languages).toBeDefined();
      expect(i18nModule.isRTL).toBeDefined();
    });

    it("should initialize with default locale", () => {
      const i18nModule = createI18nModule();
      expect(i18nModule.locale()).toBe("en");
    });

    it("should initialize with saved locale", () => {
      localStorageMock.getItem.mockReturnValue("es");
      const i18nModule = createI18nModule();
      expect(i18nModule.locale()).toBe("es");
    });

    it("should allow locale changes", () => {
      const i18nModule = createI18nModule();

      i18nModule.setLocale("fr");
      expect(i18nModule.locale()).toBe("fr");
    });

    it("should persist locale changes to localStorage", () => {
      const i18nModule = createI18nModule();

      i18nModule.setLocale("de");
      expect(localStorageMock.setItem).toHaveBeenCalledWith("locale", "de");
    });

    it("should set document attributes on locale change", () => {
      const i18nModule = createI18nModule();

      i18nModule.setLocale("ar"); // RTL language
      expect(document.documentElement.setAttribute).toHaveBeenCalledWith(
        "lang",
        "ar",
      );
      expect(document.documentElement.setAttribute).toHaveBeenCalledWith(
        "dir",
        "rtl",
      );

      i18nModule.setLocale("en"); // LTR language
      expect(document.documentElement.setAttribute).toHaveBeenCalledWith(
        "lang",
        "en",
      );
      expect(document.documentElement.setAttribute).toHaveBeenCalledWith(
        "dir",
        "ltr",
      );
    });

    it("should allow translation changes", () => {
      const i18nModule = createI18nModule();
      const newTranslations: Translations = { hello: "Hola" };

      i18nModule.setTranslations(newTranslations);
      expect(i18nModule.t("hello")).toBe("Hola");
    });

    it("should provide translation function", () => {
      const translations: Translations = { hello: "Hello" };
      const i18nModule = createI18nModule(translations);

      expect(i18nModule.t("hello")).toBe("Hello");
      expect(i18nModule.t("nonexistent")).toBe("nonexistent");
    });

    it("should handle RTL detection correctly", () => {
      const i18nModule = createI18nModule();

      expect(i18nModule.isRTL).toBe(false); // en is LTR

      i18nModule.setLocale("ar");
      expect(i18nModule.isRTL).toBe(true); // ar is RTL
    });

    it("should handle SSR gracefully", () => {
      const originalWindow = global.window;
      delete (global as any).window;

      const i18nModule = createI18nModule();
      expect(i18nModule.locale()).toBe("en");

      global.window = originalWindow;
    });
  });
});
