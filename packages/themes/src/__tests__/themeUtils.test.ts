/**
 * Tests for theme utilities
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { computeTagBackground, computeTagColor, computeHoverStyles, computeAnimation } from "../../themeUtils";
import { getSystemThemePreference, supportsReducedMotion } from "../../systemThemeUtils";
import type { ThemeName } from "../../types";

describe("Theme Utilities", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("computeTagBackground", () => {
    it("should generate consistent colors for same tag", () => {
      const color1 = computeTagBackground("light", "test-tag");
      const color2 = computeTagBackground("light", "test-tag");
      expect(color1).toBe(color2);
    });

    it("should generate different colors for different tags", () => {
      const color1 = computeTagBackground("light", "tag1");
      const color2 = computeTagBackground("light", "tag2");
      expect(color1).not.toBe(color2);
    });

    it("should adjust lightness for dark themes", () => {
      const lightColor = computeTagBackground("light", "test-tag");
      const darkColor = computeTagBackground("dark", "test-tag");
      expect(lightColor).not.toBe(darkColor);
    });
  });

  describe("computeTagColor", () => {
    it("should return appropriate text colors for light theme", () => {
      const color = computeTagColor("light", "test-tag");
      expect(color).toMatch(/^oklch\(\d+%\s+[\d.]+\s+-?\d+\)$/);
    });

    it("should return appropriate text colors for dark theme", () => {
      const color = computeTagColor("dark", "test-tag");
      expect(color).toMatch(/^oklch\(\d+%\s+[\d.]+\s+-?\d+\)$/);
    });
  });

  describe("computeHoverStyles", () => {
    it("should return hover styles for light theme", () => {
      const styles = computeHoverStyles("light");
      expect(styles).toHaveProperty("filter");
      expect(styles).toHaveProperty("transform");
    });

    it("should return hover styles for dark theme", () => {
      const styles = computeHoverStyles("dark");
      expect(styles).toHaveProperty("filter");
      expect(styles).toHaveProperty("transform");
    });

    it("should return different styles for different themes", () => {
      const lightStyles = computeHoverStyles("light");
      const darkStyles = computeHoverStyles("dark");
      expect(lightStyles.filter).not.toBe(darkStyles.filter);
    });
  });

  describe("computeAnimation", () => {
    it("should return correct animation for light theme", () => {
      expect(computeAnimation("light")).toBe("sun");
    });

    it("should return correct animation for dark theme", () => {
      expect(computeAnimation("dark")).toBe("moon");
    });

    it("should return correct animation for gray theme", () => {
      expect(computeAnimation("gray")).toBe("cloud");
    });

    it("should return correct animation for banana theme", () => {
      expect(computeAnimation("banana")).toBe("banana");
    });

    it("should return correct animation for strawberry theme", () => {
      expect(computeAnimation("strawberry")).toBe("strawberry");
    });

    it("should return correct animation for peanut theme", () => {
      expect(computeAnimation("peanut")).toBe("peanut");
    });
  });

  describe("getSystemThemePreference", () => {
    it("should return dark when system prefers dark", () => {
      Object.defineProperty(window, "matchMedia", {
        writable: true,
        value: vi.fn().mockImplementation(() => ({
          matches: true,
        })),
      });

      expect(getSystemThemePreference()).toBe("dark");
    });

    it("should return light when system prefers light", () => {
      Object.defineProperty(window, "matchMedia", {
        writable: true,
        value: vi.fn().mockImplementation(() => ({
          matches: false,
        })),
      });

      expect(getSystemThemePreference()).toBe("light");
    });
  });

  describe("supportsReducedMotion", () => {
    it("should return true when reduced motion is preferred", () => {
      Object.defineProperty(window, "matchMedia", {
        writable: true,
        value: vi.fn().mockImplementation(() => ({
          matches: true,
        })),
      });

      expect(supportsReducedMotion()).toBe(true);
    });

    it("should return false when reduced motion is not preferred", () => {
      Object.defineProperty(window, "matchMedia", {
        writable: true,
        value: vi.fn().mockImplementation(() => ({
          matches: false,
        })),
      });

      expect(supportsReducedMotion()).toBe(false);
    });
  });
});
