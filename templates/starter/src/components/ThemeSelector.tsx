/**
 * Theme Selector Component
 * Demonstrates theme switching functionality
 */

import { Component, For } from "solid-js";
import { useTheme, type Theme } from "reynard-core";

export const ThemeSelector: Component = () => {
  const { theme, setTheme, nextTheme, themes } = useTheme();

  return (
    <div class="theme-selector">
      <label class="theme-label">
        Theme:
        <select
          class="theme-select"
          value={theme()}
          onChange={(e) => setTheme(e.target.value as Theme)}
        >
          <For each={themes}>
            {(themeName: string) => (
              <option value={themeName}>
                {themeName.charAt(0).toUpperCase() + themeName.slice(1)}
              </option>
            )}
          </For>
        </select>
      </label>

      <button class="button button--secondary" onClick={nextTheme}>
        Next Theme
      </button>
    </div>
  );
};
