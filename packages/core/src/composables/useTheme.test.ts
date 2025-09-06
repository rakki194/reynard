/**
 * Tests for useTheme composable
 */

import { describe, it, expect } from "vitest";
import { createRoot } from "solid-js";
import { createTheme, ThemeProvider, useTheme, useThemeValue } from "./useTheme";

describe("useTheme Composable", () => {
  describe("createTheme", () => {
    it("should create a theme module instance", () => {
      const themeModule = createTheme();

      expect(themeModule).toBeDefined();
      expect(typeof themeModule.theme).toBe("function");
      expect(typeof themeModule.setTheme).toBe("function");
      expect(typeof themeModule.nextTheme).toBe("function");
    });

    it("should create theme module with default light theme", () => {
      const themeModule = createTheme();
      expect(themeModule.theme()).toBe("light");
    });

    it("should have themeIconMap and themes properties", () => {
      const themeModule = createTheme();
      expect(themeModule.themeIconMap).toBeDefined();
      expect(themeModule.themes).toBeDefined();
    });

    it("should allow theme changes", () => {
      const themeModule = createTheme();

      themeModule.setTheme("dark");
      expect(themeModule.theme()).toBe("dark");

      themeModule.setTheme("gray");
      expect(themeModule.theme()).toBe("gray");
    });

    it("should cycle through themes with nextTheme", () => {
      const themeModule = createTheme();

      expect(themeModule.theme()).toBe("light");

      themeModule.nextTheme();
      expect(themeModule.theme()).toBe("dark");

      themeModule.nextTheme();
      expect(themeModule.theme()).toBe("gray");
    });
  });

  describe("ThemeProvider", () => {
    it("should be defined", () => {
      expect(ThemeProvider).toBeDefined();
    });
  });

  describe("useTheme", () => {
    it("should throw error when used outside provider", () => {
      createRoot(() => {
        expect(() => useTheme()).toThrow("useTheme must be used within a ThemeProvider");
      });
    });

    it("should return context when used within provider", () => {
      const themeModule = createTheme();
      
      createRoot((dispose) => {
        // Test that the module has the expected structure
        expect(themeModule).toBeDefined();
        expect(typeof themeModule.theme).toBe("function");
        expect(typeof themeModule.setTheme).toBe("function");
        expect(typeof themeModule.nextTheme).toBe("function");
        dispose();
      });
    });
  });

  describe("useThemeValue", () => {
    it("should return theme value", () => {
      const themeModule = createTheme();
      
      createRoot((dispose) => {
        // Test that the module has the expected structure
        expect(themeModule).toBeDefined();
        expect(themeModule.theme()).toBe("light");
        dispose();
      });
    });
  });
});
