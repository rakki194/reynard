/**
 * Pluralization tests
 * Testing plural forms, count-based translations, and language-specific rules
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { createI18nModule } from "../../index";

// Mock translations with pluralization
const mockTranslationsWithPluralization = {
  common: {
    items: {
      zero: "No items",
      one: "One item",
      few: "{count} items",
      many: "{count} items",
      other: "{count} items",
    },
    messages: {
      zero: "No messages",
      one: "One message",
      few: "{count} messages",
      many: "{count} messages",
      other: "{count} messages",
    },
  },
  // Russian-style pluralization (3 forms)
  russian: {
    files: {
      one: "{count} файл",
      few: "{count} файла",
      many: "{count} файлов",
      other: "{count} файлов",
    },
  },
  // Polish-style pluralization (3 forms)
  polish: {
    books: {
      one: "{count} książka",
      few: "{count} książki",
      many: "{count} książek",
      other: "{count} książek",
    },
  },
};

describe("Pluralization", () => {
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

    i18n = createI18nModule(mockTranslationsWithPluralization);
  });

  describe("English Pluralization", () => {
    it("should handle zero items", () => {
      expect(i18n.t("common.items", { count: 0 })).toBe("No items");
    });

    it("should handle one item", () => {
      expect(i18n.t("common.items", { count: 1 })).toBe("One item");
    });

    it("should handle multiple items", () => {
      expect(i18n.t("common.items", { count: 2 })).toBe("2 items");
      expect(i18n.t("common.items", { count: 5 })).toBe("5 items");
      expect(i18n.t("common.items", { count: 100 })).toBe("100 items");
    });

    it("should handle messages pluralization", () => {
      expect(i18n.t("common.messages", { count: 0 })).toBe("No messages");
      expect(i18n.t("common.messages", { count: 1 })).toBe("One message");
      expect(i18n.t("common.messages", { count: 3 })).toBe("3 messages");
    });
  });

  describe("Russian Pluralization", () => {
    beforeEach(() => {
      i18n.setLocale("ru");
    });

    it("should handle Russian plural forms", () => {
      // Russian has 3 plural forms
      expect(i18n.t("russian.files", { count: 1 })).toBe("1 файл");
      expect(i18n.t("russian.files", { count: 2 })).toBe("2 файла");
      expect(i18n.t("russian.files", { count: 3 })).toBe("3 файла");
      expect(i18n.t("russian.files", { count: 4 })).toBe("4 файла");
      expect(i18n.t("russian.files", { count: 5 })).toBe("5 файлов");
      expect(i18n.t("russian.files", { count: 10 })).toBe("10 файлов");
      expect(i18n.t("russian.files", { count: 11 })).toBe("11 файлов");
      expect(i18n.t("russian.files", { count: 21 })).toBe("21 файл");
      expect(i18n.t("russian.files", { count: 22 })).toBe("22 файла");
    });
  });

  describe("Polish Pluralization", () => {
    beforeEach(() => {
      i18n.setLocale("pl");
    });

    it("should handle Polish plural forms", () => {
      // Polish has 3 plural forms
      expect(i18n.t("polish.books", { count: 1 })).toBe("1 książka");
      expect(i18n.t("polish.books", { count: 2 })).toBe("2 książki");
      expect(i18n.t("polish.books", { count: 3 })).toBe("3 książki");
      expect(i18n.t("polish.books", { count: 4 })).toBe("4 książki");
      expect(i18n.t("polish.books", { count: 5 })).toBe("5 książek");
      expect(i18n.t("polish.books", { count: 10 })).toBe("10 książek");
      expect(i18n.t("polish.books", { count: 11 })).toBe("11 książek");
      expect(i18n.t("polish.books", { count: 21 })).toBe("21 książka");
      expect(i18n.t("polish.books", { count: 22 })).toBe("22 książki");
    });
  });

  describe("Edge Cases", () => {
    it("should handle negative numbers", () => {
      expect(i18n.t("common.items", { count: -1 })).toBe("-1 items");
      expect(i18n.t("common.items", { count: -5 })).toBe("-5 items");
    });

    it("should handle decimal numbers", () => {
      expect(i18n.t("common.items", { count: 1.5 })).toBe("1.5 items");
      expect(i18n.t("common.items", { count: 2.7 })).toBe("2.7 items");
    });

    it("should handle very large numbers", () => {
      expect(i18n.t("common.items", { count: 1000000 })).toBe("1000000 items");
    });

    it("should fallback to other form when specific form missing", () => {
      const incompleteTranslation = {
        test: {
          other: "{count} items",
        },
      };

      const i18nIncomplete = createI18nModule(incompleteTranslation);
      expect(i18nIncomplete.t("test", { count: 0 })).toBe("0 items");
      expect(i18nIncomplete.t("test", { count: 1 })).toBe("1 items");
      expect(i18nIncomplete.t("test", { count: 5 })).toBe("5 items");
    });
  });

  describe("Pluralization Rules", () => {
    it("should apply correct pluralization rules for different languages", () => {
      // Test English (2 forms: one, other)
      i18n.setLocale("en");
      expect(i18n.t("common.items", { count: 1 })).toBe("One item");
      expect(i18n.t("common.items", { count: 0 })).toBe("No items");
      expect(i18n.t("common.items", { count: 2 })).toBe("2 items");

      // Test French (2 forms: one, other)
      i18n.setLocale("fr");
      expect(i18n.t("common.items", { count: 1 })).toBe("One item");
      expect(i18n.t("common.items", { count: 0 })).toBe("No items");
      expect(i18n.t("common.items", { count: 2 })).toBe("2 items");
    });

    it("should handle missing count parameter", () => {
      expect(i18n.t("common.items")).toBe("common.items");
    });

    it("should handle non-numeric count", () => {
      expect(i18n.t("common.items", { count: "invalid" as any })).toBe("common.items");
    });
  });
});
