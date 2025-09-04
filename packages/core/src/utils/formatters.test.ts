import { describe, it, expect } from "vitest";
import {
  formatFileSize,
  formatBytes,
  formatNumber,
  formatCurrency,
  formatPercentage,
  truncateText,
  capitalize,
  camelToKebab,
  kebabToCamel,
  pluralize,
} from "./formatters";

describe("formatters", () => {
  describe("formatFileSize", () => {
    it("formats bytes correctly", () => {
      expect(formatFileSize(0)).toBe("0 B");
      expect(formatFileSize(500)).toBe("500 B"); // No decimal for bytes < 1024
      expect(formatFileSize(1024)).toBe("1.0 KB");
      expect(formatFileSize(1536)).toBe("1.5 KB");
      expect(formatFileSize(1024 * 1024)).toBe("1.0 MB");
      expect(formatFileSize(1024 * 1024 * 1024)).toBe("1.0 GB");
    });
  });

  describe("formatNumber", () => {
    it("formats numbers with default locale", () => {
      expect(formatNumber(1234567)).toBe("1,234,567");
      expect(formatNumber(1234.56)).toBe("1,234.56");
    });
  });

  describe("formatCurrency", () => {
    it("formats currency correctly", () => {
      expect(formatCurrency(1234.56)).toBe("$1,234.56");
      expect(formatCurrency(1234.56, "EUR", "de-DE")).toMatch(/1\.234,56/);
    });
  });

  describe("formatPercentage", () => {
    it("formats percentages correctly", () => {
      expect(formatPercentage(0.1234)).toBe("12.34%");
      expect(formatPercentage(0.1234, 1)).toBe("12.3%");
      expect(formatPercentage(1)).toBe("100.00%");
    });
  });

  describe("truncateText", () => {
    it("truncates text correctly", () => {
      expect(truncateText("Hello world!", 5)).toBe("He..."); // "He" + "..." = 5 chars
      expect(truncateText("Hello world!", 15)).toBe("Hello world!");
      expect(truncateText("Hello world!", 5, "…")).toBe("Hell…"); // "Hell" + "…" = 5 chars
    });
  });

  describe("capitalize", () => {
    it("capitalizes first letter", () => {
      expect(capitalize("hello")).toBe("Hello");
      expect(capitalize("HELLO")).toBe("HELLO");
      expect(capitalize("")).toBe("");
    });
  });

  describe("camelToKebab", () => {
    it("converts camelCase to kebab-case", () => {
      expect(camelToKebab("backgroundColor")).toBe("background-color");
      expect(camelToKebab("fontSize")).toBe("font-size");
      expect(camelToKebab("hello")).toBe("hello");
    });
  });

  describe("kebabToCamel", () => {
    it("converts kebab-case to camelCase", () => {
      expect(kebabToCamel("background-color")).toBe("backgroundColor");
      expect(kebabToCamel("font-size")).toBe("fontSize");
      expect(kebabToCamel("hello")).toBe("hello");
    });
  });

  describe("pluralize", () => {
    it("pluralizes words correctly", () => {
      expect(pluralize(1, "item")).toBe("1 item");
      expect(pluralize(2, "item")).toBe("2 items");
      expect(pluralize(2, "child", "children")).toBe("2 children");
      expect(pluralize(0, "item")).toBe("0 items");
    });
  });
});
