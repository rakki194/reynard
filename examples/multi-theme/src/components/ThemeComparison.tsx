/**
 * ThemeComparison Component
 * Side-by-side comparison of themes
 */

import { Component, createSignal, For } from "solid-js";
import { Toggle } from "reynard-components";

export const ThemeComparison: Component = () => {
  const [selectedThemes, setSelectedThemes] = createSignal(["light", "dark"]);
  const availableThemes = ["light", "dark", "banana", "strawberry", "peanut"];

  const addTheme = (theme: string) => {
    if (!selectedThemes().includes(theme) && selectedThemes().length < 3) {
      setSelectedThemes((prev) => [...prev, theme]);
    }
  };

  const removeTheme = (theme: string) => {
    if (selectedThemes().length > 1) {
      setSelectedThemes((prev) => prev.filter((t) => t !== theme));
    }
  };

  const getThemeEmoji = (theme: string) => {
    const emojis: Record<string, string> = {
      light: "☀️",
      dark: "🌙",
      banana: "🍌",
      strawberry: "🍓",
      peanut: "🥜",
    };
    return emojis[theme] || "🎨";
  };

  return (
    <div class="theme-comparison">
      <h2>⚖️ Theme Comparison</h2>
      <p>Compare themes side-by-side to see the differences</p>

      <div class="comparison-controls">
        <h3>Selected Themes ({selectedThemes().length}/3)</h3>
        <div class="theme-selector">
          <For each={availableThemes}>
            {(theme) => (
              <button
                class={`theme-option ${selectedThemes().includes(theme) ? "selected" : ""}`}
                onClick={() =>
                  selectedThemes().includes(theme)
                    ? removeTheme(theme)
                    : addTheme(theme)
                }
                disabled={
                  !selectedThemes().includes(theme) &&
                  selectedThemes().length >= 3
                }
              >
                {getThemeEmoji(theme)} {theme}
              </button>
            )}
          </For>
        </div>
      </div>

      <div
        class="comparison-grid"
        style={{
          "grid-template-columns": `repeat(${selectedThemes().length}, 1fr)`,
        }}
      >
        <For each={selectedThemes()}>
          {(theme) => (
            <div class="comparison-column" data-theme={theme}>
              <div class="column-header">
                <h3>
                  {getThemeEmoji(theme)} {theme}
                </h3>
                {selectedThemes().length > 1 && (
                  <button
                    class="remove-theme"
                    onClick={() => removeTheme(theme)}
                  >
                    ×
                  </button>
                )}
              </div>

              <div class="comparison-content">
                {/* Color Palette */}
                <div class="color-section">
                  <h4>Colors</h4>
                  <div class="color-grid">
                    <div class="color-item">
                      <div class="color-swatch primary"></div>
                      <span>Primary</span>
                    </div>
                    <div class="color-item">
                      <div class="color-swatch background"></div>
                      <span>Background</span>
                    </div>
                    <div class="color-item">
                      <div class="color-swatch text"></div>
                      <span>Text</span>
                    </div>
                  </div>
                </div>

                {/* Component Samples */}
                <div class="component-section">
                  <h4>Components</h4>

                  <button class="sample-button">Button</button>

                  <input
                    type="text"
                    class="sample-input"
                    placeholder="Input field"
                  />

                  <div class="sample-card">
                    <h5>Card Title</h5>
                    <p>Card content with some text to show typography.</p>
                  </div>

                  <label class="sample-checkbox">
                    <Toggle
    size="sm"
  />
                    <span class="checkmark"></span>
                    Checkbox option
                  </label>

                  <div class="sample-alert">
                    <strong>Alert:</strong> Sample alert message
                  </div>
                </div>

                {/* Typography */}
                <div class="typography-section">
                  <h4>Typography</h4>
                  <h5>Heading</h5>
                  <p>
                    Regular paragraph text with <strong>bold</strong> and{" "}
                    <em>italic</em> formatting.
                  </p>
                  <code>Code snippet</code>
                </div>
              </div>
            </div>
          )}
        </For>
      </div>

      <div class="comparison-notes">
        <h3>💡 Comparison Tips</h3>
        <ul>
          <li>Compare up to 3 themes at once</li>
          <li>Notice how colors, contrast, and mood change</li>
          <li>Check accessibility and readability across themes</li>
          <li>See how components maintain consistency while adapting</li>
        </ul>
      </div>
    </div>
  );
};
