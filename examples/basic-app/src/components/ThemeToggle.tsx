/**
 * ThemeToggle Component
 * Simple theme switching for the basic app
 */

import { Component } from "solid-js";
import { useTheme, getAvailableThemes, type ThemeName } from "reynard-themes";
import { useCustomTranslation } from "../App";

export const ThemeToggle: Component = () => {
  const themeContext = useTheme();
  const t = useCustomTranslation();

  const theme = () => themeContext.theme;

  const nextTheme = () => {
    const themes = getAvailableThemes().map((theme) => theme.name as ThemeName);
    const currentIndex = themes.indexOf(theme());
    const nextIndex = (currentIndex + 1) % themes.length;
    themeContext.setTheme(themes[nextIndex]);
  };

  const getThemeEmoji = () => {
    switch (theme()) {
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

  return (
    <button
      class="theme-toggle"
      onClick={nextTheme}
      title={t("theme.switchTo", { theme: t(`theme.${theme()}`) })}
    >
      {getThemeEmoji()} {t(`theme.${theme()}`)}
    </button>
  );
};
