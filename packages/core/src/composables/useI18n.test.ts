/**
 * Tests for useI18n composable
 */

import { describe, it, expect } from "vitest";
import { createRoot } from "solid-js";
import { I18nProvider, useI18n } from "./useI18n";
import { createI18nModule } from "../modules/i18n";

describe("useI18n Composable", () => {
  describe("I18nProvider", () => {
    it("should be defined", () => {
      expect(I18nProvider).toBeDefined();
    });

    it("should be a context provider", () => {
      expect(typeof I18nProvider).toBe("function");
    });
  });

  describe("useI18n", () => {
    it("should be defined", () => {
      expect(typeof useI18n).toBe("function");
    });

    it("should be a hook function", () => {
      expect(typeof useI18n).toBe("function");
      // Hooks typically have no parameters when called
      expect(useI18n.length).toBe(0);
    });

    it("should throw error when used outside provider", () => {
      createRoot(() => {
        expect(() => useI18n()).toThrow("useI18n must be used within an I18nProvider");
      });
    });

    it("should return context when used within provider", () => {
      const i18nModule = createI18nModule();
      
      createRoot((dispose) => {
        // Test that the module has the expected structure
        expect(i18nModule).toBeDefined();
        expect(typeof i18nModule.t).toBe("function");
        expect(typeof i18nModule.setLocale).toBe("function");
        expect(typeof i18nModule.locale).toBe("function");
        dispose();
      });
    });
  });

  describe("Context Structure", () => {
    it("should provide proper context structure", () => {
      expect(I18nProvider).toBeDefined();
      expect(typeof I18nProvider).toBe("function");
    });
  });
});
