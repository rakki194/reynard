/**
 * Theme management module - handles theme state and persistence
 * Extracted from yipyap's proven theme system
 */

import { createSignal, createEffect } from "solid-js";

/** Available theme options for the application */
export type Theme =
  | "light"
  | "gray"
  | "dark"
  | "banana"
  | "strawberry"
  | "peanut"
  | "high-contrast-black"
  | "high-contrast-inverse";

/** Base themes that are always available */
const baseThemes: Record<string, string> = {
  light: "sun",
  gray: "cloud",
  dark: "moon",
  banana: "banana",
  strawberry: "strawberry",
  peanut: "peanut",
  "high-contrast-black": "contrast",
  "high-contrast-inverse": "contrast-inverse",
};

/**
 * Maps theme names to their corresponding icon identifiers.
 * Used for theme switching UI elements.
 */
export const themeIconMap: Record<string, string> = {
  light: "sun",
  dark: "moon",
  gray: "cloud",
  banana: "banana",
  strawberry: "strawberry",
  peanut: "peanut",
};

export const themes = Object.keys(themeIconMap) as Readonly<Theme[]>;

/**
 * Gets the initial theme from localStorage or defaults to 'light'
 */
export const getInitialTheme = (): Theme => {
  if (typeof window === "undefined") return "light";

  const saved = localStorage.getItem("theme") as Theme;
  if (saved && themes.includes(saved)) {
    return saved;
  }

  return "light";
};

/**
 * Gets the next theme in the rotation sequence.
 */
export const getNextTheme = (currentTheme: Theme): Theme => {
  const currentIndex = themes.indexOf(currentTheme);
  const nextIndex = (currentIndex + 1) % themes.length;
  return themes[nextIndex];
};

export interface ThemeModule {
  theme: () => Theme;
  setTheme: (theme: Theme) => void;
  nextTheme: () => void;
  themeIconMap: Record<string, string>;
  themes: readonly Theme[];
}

export const createThemeModule = (): ThemeModule => {
  const [theme, setThemeSignal] = createSignal<Theme>(getInitialTheme());

  // Persist theme changes to localStorage and DOM
  createEffect(() => {
    const currentTheme = theme();
    if (typeof window !== "undefined") {
      localStorage.setItem("theme", currentTheme);
      document.documentElement.setAttribute("data-theme", currentTheme);
    }
  });

  const setTheme = (newTheme: Theme) => {
    setThemeSignal(newTheme);
  };

  const nextTheme = () => {
    setTheme(getNextTheme(theme()));
  };

  return {
    theme,
    setTheme,
    nextTheme,
    themeIconMap,
    themes,
  };
};
