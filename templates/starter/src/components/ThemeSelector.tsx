/**
 * Theme Selector Component
 * Demonstrates theme switching functionality
 */

import { Component, For, createEffect, createSignal } from "solid-js";
import { useTheme, getAvailableThemes, type ThemeName } from "reynard-themes";

export const ThemeSelector: Component = () => {
  const { theme, setTheme } = useTheme();
  const availableThemes = getAvailableThemes();

  // Create a local signal that syncs with the theme
  const [localTheme, setLocalTheme] = createSignal(theme);

  // Sync local theme with global theme
  createEffect(() => {
    setLocalTheme(theme);
    // Debug logging inside effect to avoid linter warnings
    console.log("ThemeSelector - Current theme:", theme);
    console.log("ThemeSelector - Local theme:", localTheme());
    console.log("ThemeSelector - Available themes:", availableThemes);
    console.log("ThemeSelector - localStorage theme:", localStorage.getItem("reynard-theme"));
  });

  return (
    <div class="theme-selector">
      <label class="theme-label">
        Theme:
        <select
          class="theme-select"
          value={localTheme()}
          onChange={(e) => {
            console.log("Theme changed to:", e.target.value);
            setTheme(e.target.value as ThemeName);
          }}
        >
          <For each={availableThemes}>
            {(themeConfig) => (
              <option value={themeConfig.name}>
                {themeConfig.displayName}
              </option>
            )}
          </For>
        </select>
      </label>
    </div>
  );
};
