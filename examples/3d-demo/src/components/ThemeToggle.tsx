import { Component } from "solid-js";
import { useTheme } from "reynard-themes";

export const ThemeToggle: Component = () => {
  const themeContext = useTheme();

  const toggleTheme = () => {
    themeContext.setTheme(themeContext.theme === "light" ? "dark" : "light");
  };

  return (
    <button class="theme-toggle" onClick={toggleTheme}>
      <span class="theme-icon">
        {themeContext.theme === "light" ? "🌙" : "☀️"}
      </span>
      <span class="theme-text">
        {themeContext.theme === "light" ? "Dark" : "Light"} Mode
      </span>
    </button>
  );
};
