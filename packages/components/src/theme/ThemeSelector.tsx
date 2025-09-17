/**
 * Theme Selector Component
 * Demonstrates theme switching functionality
 */

import { Component, For, createEffect } from "solid-js";
import { useTheme, getAvailableThemes, type ThemeName } from "reynard-themes";

export const ThemeSelector: Component = () => {
  const themeContext = useTheme();
  const availableThemes = getAvailableThemes();

  // Debug logging to track theme changes
  createEffect(() => {
    console.log("ThemeSelector - Current theme:", themeContext.theme);
    console.log("ThemeSelector - Available themes:", availableThemes);
    console.log("ThemeSelector - localStorage theme:", localStorage.getItem("reynard-theme"));
  });

  return (
    <div class="theme-selector">
      <label class="theme-label">
        Theme:
        <select
          class="theme-select"
          value={themeContext.theme}
          onChange={e => {
            console.log("Theme changed to:", e.target.value);
            themeContext.setTheme(e.target.value as ThemeName);
          }}
        >
          <For each={availableThemes}>
            {themeConfig => <option value={themeConfig.name}>{themeConfig.displayName}</option>}
          </For>
        </select>
      </label>
    </div>
  );
};
