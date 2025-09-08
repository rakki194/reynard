/**
 * Theme Selector Component
 * Grid of theme cards for selection
 */

import { Component, For } from "solid-js";
import { type ThemeConfig } from "reynard-themes";
import { ThemeCard } from "./ThemeCard";

interface ThemeSelectorProps {
  availableThemes: ThemeConfig[];
  currentTheme: string;
  previewTheme: string | null;
  onThemeChange: (themeName: string) => void;
  onPreviewTheme: (themeName: string) => void;
  onStopPreview: () => void;
}

export const ThemeSelector: Component<ThemeSelectorProps> = (props) => {
  return (
    <div class="theme-selector-panel">
      <h3>Available Themes</h3>
      <div class="theme-grid">
        <For each={props.availableThemes}>{themeConfig => (
          <ThemeCard
            themeConfig={themeConfig}
            isActive={props.currentTheme === themeConfig.name}
            isPreviewing={props.previewTheme === themeConfig.name}
            onThemeChange={props.onThemeChange}
            onPreviewTheme={props.onPreviewTheme}
            onStopPreview={props.onStopPreview}
          />
        )}</For>
      </div>
    </div>
  );
};
