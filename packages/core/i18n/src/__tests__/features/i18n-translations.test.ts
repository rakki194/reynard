/**
 * Translation logic tests
 * Testing parameter interpolation, function values, and translation helpers
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { createI18nModule, getTranslationValue } from "../../index";
import type { TranslationParams } from "../../types";

// Mock translations for testing
const mockTranslations = {
  common: {
    close: "Close",
    save: "Save",
    welcome: "Welcome, {name}!",
    itemCount: "You have {count} items",
    dynamic: (params: TranslationParams) => `Hello ${params.name}`,
    complex: (params: TranslationParams) => `User ${params.name} has ${params.count} items in ${params.category}`,
  },
  templates: {
    greeting: "Hello {name}, you have {count} items",
    nested: "Level {level} with {value}",
  },
  complex: {
    mixed: "User {name} (ID: {id}) has {count} items worth ${amount}",
  },
};

describe("Translation Logic", () => {
  let i18n: ReturnType<typeof createI18nModule>;

  beforeEach(() => {
    // Mock localStorage
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: vi.fn(() => null),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
      },
      writable: true,
    });

    // Mock document
    Object.defineProperty(document, "documentElement", {
      value: {
        setAttribute: vi.fn(),
      },
      writable: true,
    });

    i18n = createI18nModule({
      initialTranslations: mockTranslations,
      enableDebug: true,
    });
  });

  describe("Translation with Parameters", () => {
    it("should interpolate parameters in translations", () => {
      expect(i18n.t("common.welcome", { name: "John" })).toBe("Welcome, John!");
      expect(i18n.t("common.itemCount", { count: 5 })).toBe("You have 5 items");
    });

    it("should handle missing parameters", () => {
      expect(i18n.t("common.welcome", {})).toBe("Welcome, !");
      expect(i18n.t("common.welcome")).toBe("Welcome, {name}!");
    });

    it("should handle multiple parameters", () => {
      expect(i18n.t("templates.greeting", { name: "Alice", count: 3 })).toBe("Hello Alice, you have 3 items");
    });

    it("should handle nested parameter access", () => {
      expect(i18n.t("templates.nested", { level: 2, value: "test" })).toBe("Level 2 with test");
    });
  });

  describe("Function-based Translations", () => {
    it("should handle function values", () => {
      expect(i18n.t("common.dynamic", { name: "World" })).toBe("Hello World");
    });

    it("should handle function values with multiple parameters", () => {
      const dynamicTranslation = {
        ...mockTranslations,
        common: {
          ...mockTranslations.common,
          complex: (params: TranslationParams) => `User ${params.name} has ${params.count} items in ${params.category}`,
        },
      };

      const i18nWithComplex = createI18nModule(dynamicTranslation);
      expect(
        i18nWithComplex.t("common.complex", {
          name: "Bob",
          count: 7,
          category: "electronics",
        })
      ).toBe("User Bob has 7 items in electronics");
    });
  });

  describe("Translation Value Helper", () => {
    it("should get nested values", () => {
      const obj = {
        level1: {
          level2: {
            value: "test",
          },
        },
      };

      expect(getTranslationValue(obj, "level1.level2.value")).toBe("test");
    });

    it("should handle function values", () => {
      const obj = {
        dynamic: (params: TranslationParams) => `Hello ${params.name}`,
      };

      expect(getTranslationValue(obj, "dynamic", { name: "World" })).toBe("Hello World");
    });

    it("should interpolate parameters in strings", () => {
      const obj = {
        template: "Hello {name}, you have {count} items",
      };

      expect(getTranslationValue(obj, "template", { name: "John", count: 5 })).toBe("Hello John, you have 5 items");
    });

    it("should return key if value not found", () => {
      const obj = {};
      expect(getTranslationValue(obj, "nonexistent.key")).toBe("nonexistent.key");
    });

    it("should handle empty objects", () => {
      expect(getTranslationValue({}, "any.key")).toBe("any.key");
    });

    it("should handle null/undefined values", () => {
      expect(getTranslationValue(null as any, "any.key")).toBe("any.key");
      expect(getTranslationValue(undefined as any, "any.key")).toBe("any.key");
    });
  });

  describe("Complex Translation Scenarios", () => {
    it("should handle mixed parameter types", () => {
      const complexTranslation = {
        ...mockTranslations,
        complex: {
          mixed: "User {name} (ID: {id}) has {count} items worth ${amount}",
        },
      };

      const i18nComplex = createI18nModule(complexTranslation);
      expect(
        i18nComplex.t("complex.mixed", {
          name: "Alice",
          id: 123,
          count: 5,
          amount: 99.99,
        })
      ).toBe("User Alice (ID: 123) has 5 items worth $99.99");
    });

    it("should handle special characters in parameters", () => {
      expect(i18n.t("common.welcome", { name: "José & María" })).toBe("Welcome, José & María!");
    });

    it("should handle numeric parameters", () => {
      expect(i18n.t("common.itemCount", { count: 0 })).toBe("You have 0 items");
      expect(i18n.t("common.itemCount", { count: -1 })).toBe("You have -1 items");
    });
  });
});
