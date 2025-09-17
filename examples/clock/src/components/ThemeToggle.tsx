/**
 * Theme Toggle Component
 * Theme switching with emoji indicators
 */

import { Component } from "solid-js";
import { Button } from "reynard-components";
import { useTheme, getAvailableThemes, type ThemeName } from "reynard-themes";

export const ThemeToggle: Component = () => {
  const { theme, setTheme } = useTheme();

  const getThemeEmoji = (theme: string) => {
    switch (theme) {
      case "light":
        return "☀️";
      case "dark":
        return "🌙";
      case "banana":
        return "🍌";
      case "strawberry":
        return "🍓";
      case "peanut":
        return "🥜";
      case "gray":
        return "🌫️";
      default:
        return "🎨";
    }
  };

  const cycleTheme = () => {
    const themes = getAvailableThemes().map(theme => theme.name as ThemeName);
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  return (
    <Button onClick={cycleTheme} class="btn btn-secondary theme-toggle-button">
      {getThemeEmoji(theme)} {theme}
    </Button>
  );
};
