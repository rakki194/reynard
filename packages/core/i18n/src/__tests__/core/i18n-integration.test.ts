/**
 * Integration tests for i18n system
 * Testing translation loading, error handling, and system integration
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { createI18nModule, loadTranslations } from "../../index";
import { clearTranslationCache } from "../../loaders";

// Mock translations for testing - updated to match loader's comprehensive mock data
const mockTranslations = {
  common: {
    hello: "Hello",
    welcome: "Welcome, {name}!",
    itemCount: "You have {count} items",
    dynamic: "Hello {name}",
    complex: "User {name} has {count} items in {category}",
    items: "One item",
    messages: "No messages",
    close: "Close",
    save: "Save",
  },
  templates: {
    greeting: "Hello {name}, you have {count} items",
    nested: "Level {level} with {value}",
  },
  complex: {
    mixed: "User {name} (ID: {id}) has {count} items worth ${amount}",
  },
  integration: {
    dynamic: "Dynamic content: {value}",
  },
  russian: {
    files: "1 файл",
  },
  polish: {
    books: "1 książka",
  },
  large: {
    key500: "value500",
  },
};

describe("I18n Integration Tests", () => {
  beforeEach(() => {
    // Clear translation cache to prevent interference between tests
    clearTranslationCache();
    // Clear all mocks
    vi.clearAllMocks();
  });

  describe("Translation Loading", () => {
    it("should load translations for supported locales", async () => {
      // Mock the dynamic import
      const mockImport = vi.fn().mockResolvedValue({ default: mockTranslations });
      vi.stubGlobal("import", mockImport);

      const translations = await loadTranslations("en");
      expect(translations).toEqual(mockTranslations);
    });

    it("should fallback to English on error", async () => {
      // Mock the dynamic import to fail for the requested locale but succeed for English
      const mockImport = vi
        .fn()
        .mockRejectedValueOnce(new Error("Not found"))
        .mockResolvedValueOnce({ default: mockTranslations });
      vi.stubGlobal("import", mockImport);

      const translations = await loadTranslations("nonexistent");
      expect(translations).toEqual(mockTranslations);
    });

    it("should throw error if English fallback fails", async () => {
      // Mock the dynamic import to fail for both requested locale and English
      const mockImport = vi.fn().mockRejectedValue(new Error("Not found"));
      vi.stubGlobal("import", mockImport);

      await expect(loadTranslations("nonexistent")).rejects.toThrow("Not found");
    });

    it("should handle network errors gracefully", async () => {
      const mockImport = vi.fn().mockRejectedValue(new Error("Network error"));
      vi.stubGlobal("import", mockImport);

      await expect(loadTranslations("en")).rejects.toThrow("Network error");
    });
  });

  describe("System Integration", () => {
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

      i18n = createI18nModule(mockTranslations);
    });

    it("should integrate with localStorage for persistence", () => {
      i18n.setLocale("fr");
      expect(window.localStorage.setItem).toHaveBeenCalledWith("reynard-locale", "fr");
    });

    it("should integrate with document attributes", () => {
      i18n.setLocale("ar");
      expect(document.documentElement.setAttribute).toHaveBeenCalledWith("lang", "ar");
      expect(document.documentElement.setAttribute).toHaveBeenCalledWith("dir", "rtl");
    });

    it("should handle localStorage errors gracefully", () => {
      // Mock localStorage to throw error
      Object.defineProperty(window, "localStorage", {
        value: {
          getItem: vi.fn(() => null),
          setItem: vi.fn(() => {
            throw new Error("Storage full");
          }),
          removeItem: vi.fn(),
          clear: vi.fn(),
        },
        writable: true,
      });

      // Should not throw error even if localStorage fails
      expect(() => i18n.setLocale("de")).not.toThrow();
    });

    it("should handle document attribute errors gracefully", () => {
      // Mock document to throw error
      Object.defineProperty(document, "documentElement", {
        value: {
          setAttribute: vi.fn(() => {
            throw new Error("DOM error");
          }),
        },
        writable: true,
      });

      // Should not throw error even if DOM manipulation fails
      expect(() => i18n.setLocale("es")).not.toThrow();
    });
  });

  describe("Error Handling", () => {
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

      i18n = createI18nModule(mockTranslations);
    });

    it("should handle malformed translation keys", () => {
      expect(i18n.t("")).toBe("");
      expect(i18n.t("   ")).toBe("   ");
      expect(i18n.t("invalid..key")).toBe("invalid..key");
    });

    it("should handle null/undefined translations", () => {
      const nullTranslations = {
        test: null,
        nested: {
          value: undefined,
        },
      };

      const i18nWithNulls = createI18nModule(nullTranslations as any);
      expect(i18nWithNulls.t("test")).toBe("test");
      expect(i18nWithNulls.t("nested.value")).toBe("nested.value");
    });

    it("should handle circular references in translations", () => {
      const circularTranslations: any = {
        test: "value",
      };
      circularTranslations.self = circularTranslations;

      const i18nCircular = createI18nModule(circularTranslations);
      expect(i18nCircular.t("test")).toBe("value");
      expect(i18nCircular.t("self")).toBe("self");
    });
  });

  describe("Performance Integration", () => {
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

      i18n = createI18nModule(mockTranslations);
    });

    it("should handle large translation objects efficiently", () => {
      const largeTranslations = {
        ...mockTranslations,
        large: {},
      };

      // Create a large nested object
      for (let i = 0; i < 1000; i++) {
        (largeTranslations.large as any)[`key${i}`] = `value${i}`;
      }

      const i18nLarge = createI18nModule(largeTranslations);
      expect(i18nLarge.t("large.key500")).toBe("value500");
    });

    it("should handle frequent locale changes efficiently", () => {
      const startTime = Date.now();

      for (let i = 0; i < 100; i++) {
        i18n.setLocale(i % 2 === 0 ? "en" : "fr");
      }

      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(1000); // Should complete in under 1 second
    });
  });

  describe("Real-world Scenarios", () => {
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

      i18n = createI18nModule(mockTranslations);
    });

    it("should handle typical application workflow", () => {
      // Simulate typical app initialization
      expect(i18n.locale()).toBe("en");
      expect(i18n.t("common.close")).toBe("Close");

      // User changes language
      i18n.setLocale("fr");
      expect(i18n.locale()).toBe("fr");

      // App continues to work
      expect(i18n.t("common.save")).toBe("Save");
    });

    it("should handle dynamic content updates", () => {
      expect(i18n.t("integration.dynamic", { value: "test" })).toBe("Dynamic content: test");

      expect(i18n.t("integration.dynamic", { value: "updated" })).toBe("Dynamic content: updated");
    });

    it("should maintain state across multiple operations", () => {
      i18n.setLocale("de");
      expect(i18n.locale()).toBe("de");

      // Perform multiple translations
      expect(i18n.t("common.close")).toBe("Close");
      expect(i18n.t("common.save")).toBe("Save");

      // State should be maintained
      expect(i18n.locale()).toBe("de");
    });
  });
});
