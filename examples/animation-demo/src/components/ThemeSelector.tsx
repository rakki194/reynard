/**
 * 🎨 Theme Selector Component
 * 
 * Dropdown selector for changing themes in the animation demo
 */

import { Component, For } from "solid-js";
import { useTheme, themes, type ThemeName } from "reynard-themes";

export const ThemeSelector: Component = () => {
  const { theme, setTheme } = useTheme();
  const availableThemes = Object.keys(themes) as ThemeName[];

  return (
    <div class="theme-selector">
      <label for="theme-select" class="selector-label">
        🎨 Theme:
      </label>
      <select
        id="theme-select"
        value={theme}
        onChange={(e) => setTheme(e.currentTarget.value as ThemeName)}
        class="selector-dropdown"
      >
        <For each={availableThemes}>
          {(themeName) => (
            <option value={themeName}>
              {themes[themeName].displayName || themeName}
            </option>
          )}
        </For>
      </select>
    </div>
  );
};
