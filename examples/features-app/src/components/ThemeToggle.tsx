/**
 * Theme Toggle Component
 * Allows switching between light and dark themes
 */

import { useTheme } from "reynard-themes";
import { useLanguage } from "reynard-core";

export default function ThemeToggle() {
  const { t } = useLanguage();
  const [currentTheme, setCurrentTheme] = useTheme();

  const toggleTheme = () => {
    setCurrentTheme(currentTheme() === "light" ? "dark" : "light");
  };

  return (
    <button class="theme-toggle" onClick={toggleTheme}>
      {currentTheme() === "light" ? "🌙" : "☀️"} {t("theme.toggle")}
    </button>
  );
}
