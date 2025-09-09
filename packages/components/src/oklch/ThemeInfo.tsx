/**
 * Theme Info Component
 * Displays current theme information
 */

import { Component } from "solid-js";
import { useTheme } from "reynard-themes";

export const ThemeInfo: Component = () => {
  const themeContext = useTheme();

  return (
    <div class="theme-info">
      <h3>Current Theme Information</h3>
      <div class="info-grid">
        <div class="info-item">
          <strong>Theme:</strong> {themeContext.theme}
        </div>
        <div class="info-item">
          <strong>Is Dark:</strong> {themeContext.isDark ? "Yes" : "No"}
        </div>
        <div class="info-item">
          <strong>Is High Contrast:</strong>{" "}
          {themeContext.isHighContrast ? "Yes" : "No"}
        </div>
        <div class="info-item">
          <strong>Color Space:</strong> OKLCH (Perceptually Uniform)
        </div>
      </div>
    </div>
  );
};
