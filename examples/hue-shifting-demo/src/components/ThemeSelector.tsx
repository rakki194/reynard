import { Component, For } from "solid-js";
import { useTheme, getAvailableThemes } from "reynard-themes";
import { allIcons } from "reynard-fluent-icons";
import type { ThemeName } from "reynard-themes";
import "./ThemeSelector.css";

export const ThemeSelector: Component = () => {
  const { theme, setTheme } = useTheme();
  const availableThemes = getAvailableThemes();

  const themeIcons: Record<string, string> = {
    light: "sun",
    dark: "moon",
    gray: "cloud",
    banana: "banana",
    strawberry: "strawberry",
    peanut: "peanut",
    "high-contrast-black": "eye",
    "high-contrast-inverse": "eye-off",
  };

  return (
    <div class="theme-selector">
      <h3>🎨 Theme</h3>
      <div class="theme-grid">
        <For each={availableThemes}>
          {(themeConfig) => {
            const themeName = themeConfig.name as ThemeName;
            const iconName = themeIcons[themeName] || "palette";
            const isSelected = theme === themeName;

            return (
              <button
                class={`theme-card ${isSelected ? "selected" : ""}`}
                onClick={() => setTheme(themeName)}
                title={`Switch to ${themeName} theme`}
              >
                <div
                  class="theme-icon"
                  innerHTML={
                    allIcons[iconName as keyof typeof allIcons]?.svg ||
                    allIcons.settings?.svg ||
                    ""
                  }
                />
                <div class="theme-info">
                  <h4>{themeConfig.displayName}</h4>
                </div>
                <div class="theme-preview" data-theme={themeName} />
              </button>
            );
          }}
        </For>
      </div>
    </div>
  );
};
