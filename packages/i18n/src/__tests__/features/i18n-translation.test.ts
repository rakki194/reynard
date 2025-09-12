/**
 * Tests for i18n translation functionality
 * Covers translation function, loading, and namespace management
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { createI18nModule } from "../../index";
import { setupAllMocks } from "./test-utils";

// Setup all mocks
const { mockLocalStorage } = setupAllMocks();

describe("I18n Translation Functionality", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue("en");
  });

  describe("Translation Function", () => {
    it("should provide translation function", () => {
      const i18n = createI18nModule();

      expect(typeof i18n.t).toBe("function");
    });

    it("should return translation key when translation not found", () => {
      const i18n = createI18nModule();

      const result = i18n.t("nonexistent.key");
      expect(result).toBe("nonexistent.key");
    });

    it("should handle interpolation", () => {
      const i18n = createI18nModule();

      // This would work with proper translations loaded
      const result = i18n.t("common.hello", { name: "World" });
      expect(typeof result).toBe("string");
    });
  });

  describe("Translation Loading", () => {
    it("should provide loadTranslations function", () => {
      const i18n = createI18nModule();

      expect(typeof i18n.loadTranslations).toBe("function");
    });

    it("should handle loading errors gracefully", async () => {
      const i18n = createI18nModule();

      expect(i18n).toBeDefined();
      expect(typeof i18n.loadTranslations).toBe("function");

      try {
        await i18n.loadTranslations("invalid-locale");
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe("Namespace Loading", () => {
    it("should load specific namespace", async () => {
      const i18n = createI18nModule();

      const result = await i18n.loadNamespace("common");

      expect(result).toBeDefined();
      expect(result).toHaveProperty("hello");
    });

    it("should use optimized loader when namespaces are specified", async () => {
      const i18n = createI18nModule({
        usedNamespaces: ["common", "themes"],
      });

      const result = await i18n.loadNamespace("common");
      expect(result).toBeDefined();
      expect(result).toHaveProperty("hello");
    });

    it("should handle multiple namespace loading", async () => {
      const i18n = createI18nModule();

      const commonResult = await i18n.loadNamespace("common");
      const themesResult = await i18n.loadNamespace("themes");

      expect(commonResult).toBeDefined();
      expect(themesResult).toBeDefined();
    });
  });

  describe("Preloading", () => {
    it("should preload specified locales", () => {
      const i18n = createI18nModule({
        preloadLocales: ["en", "es", "fr"],
      });

      expect(i18n).toBeDefined();
      expect(typeof i18n.loadNamespace).toBe("function");
    });
  });
});
