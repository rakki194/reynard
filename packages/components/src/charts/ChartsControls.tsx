/**
 * Charts Interactive Controls
 * Control panel for theme selection, animation speed, and feature toggles
 */

import { Component, For } from "solid-js";

interface ChartsControlsProps {
  selectedTheme: string;
  setSelectedTheme: (theme: string) => void;
  animationSpeed: number;
  setAnimationSpeed: (speed: number) => void;
  realTimeEnabled: boolean;
  setRealTimeEnabled: (enabled: boolean) => void;
  performanceMonitoring: boolean;
  setPerformanceMonitoring: (enabled: boolean) => void;
  availableThemes: string[];
  themeContext: {
    setTheme: (theme: "light" | "dark" | "gray" | "banana" | "strawberry" | "peanut") => void;
  };
}

export const ChartsControls: Component<ChartsControlsProps> = (props) => {
  return (
    <div class="controls-section">
      <h2>Interactive Controls</h2>
      <div class="controls-grid">
        <div class="control-group">
          <label>Theme Selection</label>
          <div class="theme-buttons">
            <For each={props.availableThemes}>
              {(theme) => (
                <button
                  class={`theme-button ${props.selectedTheme === theme ? 'active' : ''}`}
                  onClick={() => {
                    props.setSelectedTheme(theme);
                    props.themeContext.setTheme(theme as "light" | "dark" | "gray" | "banana" | "strawberry" | "peanut");
                  }}
                >
                  {theme}
                </button>
              )}
            </For>
          </div>
        </div>
        
        <div class="control-group">
          <label for="speed-slider">Animation Speed: {props.animationSpeed}</label>
          <input
            id="speed-slider"
            type="range"
            min="0"
            max="3"
            step="0.5"
            value={props.animationSpeed}
            onInput={(e) => props.setAnimationSpeed(parseFloat(e.target.value))}
            class="speed-slider"
          />
        </div>

        <div class="control-group">
          <label class="checkbox-label">
            <input
              type="checkbox"
              checked={props.realTimeEnabled}
              onChange={(e) => props.setRealTimeEnabled(e.target.checked)}
            />
            Enable Real-time Data
          </label>
        </div>

        <div class="control-group">
          <label class="checkbox-label">
            <input
              type="checkbox"
              checked={props.performanceMonitoring}
              onChange={(e) => props.setPerformanceMonitoring(e.target.checked)}
            />
            Performance Monitoring
          </label>
        </div>
      </div>
    </div>
  );
};
