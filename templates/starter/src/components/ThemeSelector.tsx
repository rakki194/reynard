/**
 * Theme Selector Component
 * Demonstrates theme switching functionality
 */

import { Component } from 'solid-js';
import { useTheme } from '../../../packages/core/src';

export const ThemeSelector: Component = () => {
  const { theme, setTheme, nextTheme, themes } = useTheme();

  return (
    <div class="theme-selector">
      <label class="theme-label">
        Theme:
        <select 
          class="theme-select" 
          value={theme} 
          onChange={(e) => setTheme(e.target.value as any)}
        >
          {themes.map((themeName) => (
            <option value={themeName}>
              {themeName.charAt(0).toUpperCase() + themeName.slice(1)}
            </option>
          ))}
        </select>
      </label>
      
      <button class="button button--secondary" onClick={nextTheme}>
        Next Theme
      </button>
    </div>
  );
};
