/**
 * Tests for theme configurations
 */

import { describe, it, expect } from "vitest";
import { themes, getTheme, getAvailableThemes, isDarkTheme, isHighContrastTheme } from "../../themes";
import type { ThemeName } from "../../types";

describe("Theme Configurations", () => {
  it("should have all required themes", () => {
    const expectedThemes: ThemeName[] = [
      "light",
      "dark",
      "gray",
      "banana",
      "strawberry",
      "peanut",
      "high-contrast-black",
      "high-contrast-inverse",
    ];

    expectedThemes.forEach(theme => {
      expect(themes[theme]).toBeDefined();
      expect(themes[theme].name).toBe(theme);
    });
  });

  it("should have valid theme configurations", () => {
    Object.values(themes).forEach(theme => {
      expect(theme.name).toBeTruthy();
      expect(theme.displayName).toBeTruthy();
      expect(theme.description).toBeTruthy();
      expect(theme.colors).toBeDefined();
      expect(theme.animations).toBeDefined();
      expect(theme.typography).toBeDefined();
      expect(theme.spacing).toBeDefined();
      expect(theme.shadows).toBeDefined();
      expect(theme.borders).toBeDefined();
    });
  });

  it("should return correct theme by name", () => {
    expect(getTheme("light")).toBe(themes.light);
    expect(getTheme("dark")).toBe(themes.dark);
    expect(getTheme("banana")).toBe(themes.banana);
  });

  it("should return light theme for invalid theme name", () => {
    expect(getTheme("invalid" as ThemeName)).toBe(themes.light);
  });

  it("should return all available themes", () => {
    const availableThemes = getAvailableThemes();
    expect(availableThemes).toHaveLength(8);
    expect(availableThemes).toContain(themes.light);
    expect(availableThemes).toContain(themes.dark);
  });

  it("should correctly identify dark themes", () => {
    expect(isDarkTheme("dark")).toBe(true);
    expect(isDarkTheme("high-contrast-black")).toBe(true);
    expect(isDarkTheme("light")).toBe(false);
    expect(isDarkTheme("banana")).toBe(false);
  });

  it("should correctly identify high contrast themes", () => {
    expect(isHighContrastTheme("high-contrast-black")).toBe(true);
    expect(isHighContrastTheme("high-contrast-inverse")).toBe(true);
    expect(isHighContrastTheme("light")).toBe(false);
    expect(isHighContrastTheme("dark")).toBe(false);
  });
});
