import { Component } from "solid-js";
import { useTheme } from "reynard-themes";

export const ThemeToggle: Component = () => {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <button class="theme-toggle" onClick={toggleTheme}>
      <span class="theme-icon">{theme === "light" ? "🌙" : "☀️"}</span>
      <span class="theme-text">{theme === "light" ? "Dark" : "Light"} Mode</span>
    </button>
  );
};
