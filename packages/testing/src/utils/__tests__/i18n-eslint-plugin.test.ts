/**
 * Tests for i18n ESLint plugin
 */

import { describe, it, expect } from "vitest";
import { i18nPlugin, i18nRules } from "../i18n-eslint-plugin";

describe("i18n ESLint plugin", () => {
  describe("i18nRules", () => {
    it("should have no-hardcoded-strings rule", () => {
      expect(i18nRules["no-hardcoded-strings"]).toBeDefined();
      expect(i18nRules["no-hardcoded-strings"].meta).toBeDefined();
      expect(i18nRules["no-hardcoded-strings"].meta.docs.description).toBe(
        "Disallow hardcoded strings in JSX/TSX files",
      );
    });

    it("should have no-untranslated-keys rule", () => {
      expect(i18nRules["no-untranslated-keys"]).toBeDefined();
      expect(i18nRules["no-untranslated-keys"].meta).toBeDefined();
      expect(i18nRules["no-untranslated-keys"].meta.docs.description).toBe(
        "Ensure all translation keys exist in translation files",
      );
    });
  });

  describe("i18nPlugin", () => {
    it("should export rules", () => {
      expect(i18nPlugin.rules).toBeDefined();
      expect(i18nPlugin.rules["no-hardcoded-strings"]).toBeDefined();
      expect(i18nPlugin.rules["no-untranslated-keys"]).toBeDefined();
    });

    it("should have recommended config", () => {
      expect(i18nPlugin.configs).toBeDefined();
      expect(i18nPlugin.configs.recommended).toBeDefined();
      expect(i18nPlugin.configs.recommended.plugins).toContain("@reynard/i18n");
      expect(i18nPlugin.configs.recommended.rules).toBeDefined();
    });

    it("should have correct rule configurations in recommended config", () => {
      const recommended = i18nPlugin.configs.recommended;

      expect(recommended.rules["@reynard/i18n/no-hardcoded-strings"]).toBe(
        "error",
      );
      expect(recommended.rules["@reynard/i18n/no-untranslated-keys"]).toBe(
        "warn",
      );
    });
  });

  describe("rule implementations", () => {
    describe("no-hardcoded-strings", () => {
      it("should create rule with correct meta", () => {
        const rule = i18nRules["no-hardcoded-strings"];

        expect(rule.meta.type).toBe("problem");
        expect(rule.meta.fixable).toBe("code");
        expect(rule.meta.schema).toBeDefined();
        expect(rule.create).toBeInstanceOf(Function);
      });

      it("should have schema for options", () => {
        const rule = i18nRules["no-hardcoded-strings"];
        const schema = rule.meta.schema[0];

        expect(schema.type).toBe("object");
        expect(schema.properties.ignorePatterns).toBeDefined();
        expect(schema.properties.minLength).toBeDefined();
        expect(schema.properties.minLength.default).toBe(3);
      });
    });

    describe("no-untranslated-keys", () => {
      it("should create rule with correct meta", () => {
        const rule = i18nRules["no-untranslated-keys"];

        expect(rule.meta.type).toBe("problem");
        expect(rule.meta.schema).toBeDefined();
        expect(rule.create).toBeInstanceOf(Function);
      });

      it("should have schema for translation files", () => {
        const rule = i18nRules["no-untranslated-keys"];
        const schema = rule.meta.schema[0];

        expect(schema.type).toBe("object");
        expect(schema.properties.translationFiles).toBeDefined();
        expect(schema.properties.translationFiles.default).toEqual([
          "src/lang/**/*.ts",
        ]);
      });
    });
  });
});
