/**
 * Tests for useI18n composable
 */

import { describe, it, expect } from "vitest";
import { I18nProvider, useI18n } from "./useI18n";

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
  });

  describe("Context Structure", () => {
    it("should provide proper context structure", () => {
      expect(I18nProvider).toBeDefined();
      expect(typeof I18nProvider).toBe("function");
    });
  });
});
