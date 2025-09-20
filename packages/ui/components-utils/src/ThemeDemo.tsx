/**
 * Theme Demo Component
 * Interactive demo for testing the theme system
 */

import { Component, createMemo } from "solid-js";
import { useTheme } from "reynard-themes";

export const ThemeDemo: Component = () => {
  const themeContext = createMemo(() => {
    try {
      return useTheme();
    } catch (error) {
      console.error("ThemeDemo: Theme context not available", error);
      return {
        theme: "light",
        setTheme: (theme: string) => {
          console.warn("Theme context not available, cannot set theme:", theme);
        },
        getTagStyle: () => ({}),
        isDark: false,
        isHighContrast: false,
      };
    }
  });

  return (
    <div class="playground-panel">
      <h3>Theme System</h3>
      <div class="theme-demo">
        <div class="current-theme">
          <h4>Current Theme: {themeContext().theme}</h4>
          <div class="theme-preview-box">
            <div class="preview-content">
              <div class="preview-header">Sample Component</div>
              <div class="preview-body">
                <p>This is how content looks in the current theme.</p>
                <button class="button button--primary">Sample Button</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
