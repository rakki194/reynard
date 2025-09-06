/**
 * Theme Toggle Component
 * Allows switching between light and dark themes
 */

import { Component } from "solid-js";
import { useTheme } from "reynard-core";
import { getIcon } from "reynard-fluent-icons";

export const ThemeToggle: Component = () => {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme() === "light" ? "dark" : "light");
  };

  const iconName = theme() === "light" ? "moon" : "sun";
  const iconElement = getIcon(iconName);

  return (
    <button 
      class="theme-toggle"
      onClick={toggleTheme}
      title={`Switch to ${theme() === "light" ? "dark" : "light"} theme`}
    >
      {iconElement && (
        <div innerHTML={iconElement} />
      )}
    </button>
  );
};
