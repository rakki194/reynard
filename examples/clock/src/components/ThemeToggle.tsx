/**
 * Theme Toggle Component
 * Theme switching with emoji indicators
 */

import { Component } from "solid-js";
import { Button } from "@reynard/components";
import { useTheme } from "@reynard/core";

export const ThemeToggle: Component = () => {
  const { theme, nextTheme } = useTheme();

  const getThemeEmoji = (theme: string) => {
    switch (theme) {
      case "light": return "☀️";
      case "dark": return "🌙";
      case "banana": return "🍌";
      case "strawberry": return "🍓";
      case "peanut": return "🥜";
      case "gray": return "🌫️";
      default: return "🎨";
    }
  };

  return (
    <Button 
      onClick={nextTheme} 
      class="btn btn-secondary theme-toggle-button"
    >
      {getThemeEmoji(theme())} {theme()}
    </Button>
  );
};
