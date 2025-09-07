/**
 * ThemeToggle Component
 * Simple theme switching for the image caption app
 */

import { Component } from "solid-js";
import { Button } from "reynard-components";
import { useTheme, type ThemeName } from "reynard-themes";

export const ThemeToggle: Component = () => {
  const themeContext = useTheme();

  const getThemeEmoji = () => {
    switch (themeContext.theme) {
      case "light":
        return "☀️";
      case "gray":
        return "☁️";
      case "dark":
        return "🌙";
      case "banana":
        return "🍌";
      case "strawberry":
        return "🍓";
      case "peanut":
        return "🥜";
      case "high-contrast-black":
        return "⚫";
      case "high-contrast-inverse":
        return "⚪";
      default:
        return "🎨";
    }
  };

  const nextTheme = () => {
    const themes: ThemeName[] = ["light", "dark", "gray", "banana", "strawberry", "peanut", "high-contrast-black", "high-contrast-inverse"];
    const currentIndex = themes.indexOf(themeContext.theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    themeContext.setTheme(themes[nextIndex]);
  };

  return (
    <Button
      variant="secondary"
      onClick={nextTheme}
      title={`Switch to next theme (currently ${themeContext.theme})`}
    >
      {getThemeEmoji()} {themeContext.theme}
    </Button>
  );
};
