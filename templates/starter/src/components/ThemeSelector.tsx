/**
 * Theme Selector Component
 * Demonstrates theme switching functionality
 */

import { Component, For } from "solid-js";
import { useTheme, getAvailableThemes, type ThemeName } from "reynard-themes";

export const ThemeSelector: Component = () => {
  const { theme, setTheme } = useTheme();
  const availableThemes = getAvailableThemes();

  return (
    <div class="theme-selector">
      <label class="theme-label">
        Theme:
        <select
          class="theme-select"
          value={theme}
          onChange={(e) => setTheme(e.target.value as ThemeName)}
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
