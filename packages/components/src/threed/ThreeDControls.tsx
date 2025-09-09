/**
 * 3D Controls Component
 * Interactive controls for theme selection and visualization type
 */

import { Component, For } from "solid-js";
import { useTheme, getAvailableThemes, type ThemeName } from "reynard-themes";

interface ThreeDControlsProps {
  selectedTheme: string;
  onThemeChange: (theme: string) => void;
  selectedVisualization: string;
  onVisualizationChange: (viz: string) => void;
  animationEnabled: boolean;
  onAnimationToggle: (enabled: boolean) => void;
}

export const ThreeDControls: Component<ThreeDControlsProps> = (props) => {
  const themeContext = useTheme();

  // Available themes for demonstration
  const availableThemes = getAvailableThemes().map(
    (theme) => theme.name as ThemeName,
  );
  const visualizationTypes = ["point-cloud", "clusters", "embeddings"];

  return (
    <div class="controls-section">
      <h2>Interactive Controls</h2>
      <div class="controls-grid">
        <div class="control-group">
          <label>Theme Selection</label>
          <div class="theme-buttons">
            <For each={availableThemes}>
              {(theme) => (
                <button
                  class={`theme-button ${props.selectedTheme === theme ? "active" : ""}`}
                  onClick={() => {
                    props.onThemeChange(theme);
                    themeContext.setTheme(
                      theme as
                        | "light"
                        | "dark"
                        | "gray"
                        | "banana"
                        | "strawberry"
                        | "peanut",
                    );
                  }}
                >
                  {theme}
                </button>
              )}
            </For>
          </div>
        </div>

        <div class="control-group">
          <label>Visualization Type</label>
          <div class="viz-buttons">
            <For each={visualizationTypes}>
              {(viz) => (
                <button
                  class={`viz-button ${props.selectedVisualization === viz ? "active" : ""}`}
                  onClick={() => props.onVisualizationChange(viz)}
                >
                  {viz
                    .replace("-", " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                </button>
              )}
            </For>
          </div>
        </div>

        <div class="control-group">
          <label class="checkbox-label">
            <input
              type="checkbox"
              checked={props.animationEnabled}
              onChange={(e) => props.onAnimationToggle(e.target.checked)}
            />
            Enable Animations
          </label>
        </div>
      </div>
    </div>
  );
};
