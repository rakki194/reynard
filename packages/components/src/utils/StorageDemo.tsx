/**
 * Storage Demo Component
 * Interactive demo for testing the storage system
 */

import { Component, createMemo } from "solid-js";
import { useTheme } from "reynard-themes";

export const StorageDemo: Component = () => {
  const themeContext = createMemo(() => {
    try {
      return useTheme();
    } catch (error) {
      console.error("StorageDemo: Theme context not available", error);
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
      <h3>Local Storage</h3>
      <div class="storage-demo">
        <p>Local storage is automatically handled by Reynard's reactive system.</p>
        <p>Try changing themes or other settings - they'll persist across page reloads!</p>
        <div class="storage-info">
          <div class="info-item">
            <strong>Current Theme:</strong> {themeContext().theme} (stored in localStorage)
          </div>
        </div>
      </div>
    </div>
  );
};
