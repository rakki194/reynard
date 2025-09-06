/**
 * Theme Toggle Component
 * Allows switching between light and dark themes
 */

import { useTheme } from "reynard-themes";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <button class="theme-toggle" onClick={toggleTheme}>
      {theme === "light" ? "🌙" : "☀️"} Toggle Theme
    </button>
  );
}
