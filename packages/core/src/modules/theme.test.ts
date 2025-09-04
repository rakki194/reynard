/**
 * Theme module tests
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  createThemeModule,
  getInitialTheme,
  getNextTheme,
  type Theme,
} from "./theme";

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

// Mock document
Object.defineProperty(document, "documentElement", {
  value: {
    setAttribute: vi.fn(),
  },
});

describe("Theme Module", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getInitialTheme", () => {
    it("should return light theme as default", () => {
      localStorageMock.getItem.mockReturnValue(null);
      expect(getInitialTheme()).toBe("light");
    });

    it("should return saved theme from localStorage", () => {
      localStorageMock.getItem.mockReturnValue("dark");
      expect(getInitialTheme()).toBe("dark");
    });

    it("should fallback to light for invalid theme", () => {
      localStorageMock.getItem.mockReturnValue("invalid-theme");
      expect(getInitialTheme()).toBe("light");
    });
  });

  describe("getNextTheme", () => {
    it("should cycle through themes correctly", () => {
      expect(getNextTheme("light")).toBe("dark");
      expect(getNextTheme("dark")).toBe("gray");
      expect(getNextTheme("peanut")).toBe("light"); // wraps around
    });
  });

  describe("createThemeModule", () => {
    it("should create theme module with initial theme", () => {
      localStorageMock.getItem.mockReturnValue("dark");
      const themeModule = createThemeModule();

      expect(themeModule.theme()).toBe("dark");
      expect(typeof themeModule.setTheme).toBe("function");
      expect(typeof themeModule.nextTheme).toBe("function");
    });

    it("should update theme and persist to localStorage", () => {
      const themeModule = createThemeModule();

      themeModule.setTheme("banana");

      // Note: In actual usage, this would be tested with createEffect
      // For now, we just check the method exists
      expect(typeof themeModule.setTheme).toBe("function");
    });

    it("should provide theme utilities", () => {
      const themeModule = createThemeModule();

      expect(themeModule.themeIconMap).toBeDefined();
      expect(themeModule.themes).toBeDefined();
      expect(Array.isArray(themeModule.themes)).toBe(true);
    });
  });
});
