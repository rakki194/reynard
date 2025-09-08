/**
 * Theme Showcase Component
 * Interactive demonstration of Reynard's theming system
 */

import { Component, createSignal, createEffect, For } from "solid-js";
import { useTheme, getAvailableThemes, type ThemeName } from "reynard-themes";
import { useNotifications } from "reynard-core";
import { fluentIconsPackage } from "reynard-fluent-icons";

export const ThemeShowcase: Component = () => {
  const { theme, setTheme } = useTheme();
  const { notify } = useNotifications();
  const [previewTheme, setPreviewTheme] = createSignal<string | null>(null);
  const [showColorDetails, setShowColorDetails] = createSignal(false);

  const availableThemes = getAvailableThemes();

  const handleThemeChange = (themeName: string) => {
    setTheme(themeName as ThemeName);
    notify(`Switched to ${themeName} theme!`, "success");
  };

  const handlePreviewTheme = (themeName: string) => {
    setPreviewTheme(themeName);
  };

  const handleStopPreview = () => {
    setPreviewTheme(null);
  };

  const getCurrentTheme = () => {
    return previewTheme() || theme;
  };

  const getThemeColors = (themeName: string) => {
    const themeConfig = availableThemes.find(t => t.name === themeName);
    if (!themeConfig) return [];
    
    return [
      { name: "Primary", value: themeConfig.colors.primary, var: "--color-primary" },
      { name: "Accent", value: themeConfig.colors.accent, var: "--color-accent" },
      { name: "Background", value: themeConfig.colors.background, var: "--color-background" },
      { name: "Surface", value: themeConfig.colors.surface, var: "--color-surface" },
      { name: "Text", value: themeConfig.colors.text, var: "--color-text" },
      { name: "Border", value: themeConfig.colors.border, var: "--color-border" },
    ];
  };

  const copyColorValue = (color: string) => {
    navigator.clipboard.writeText(color);
    notify(`Color ${color} copied to clipboard!`, "info");
  };

  return (
    <section class="theme-showcase-section">
      <div class="section-header">
        <h2>
          {fluentIconsPackage.getIcon("palette") && (
            <span class="section-icon">
              <div
                // eslint-disable-next-line solid/no-innerhtml
                innerHTML={fluentIconsPackage.getIcon("palette")?.outerHTML}
              />
            </span>
          )}
          Theme Showcase
        </h2>
        <p>Experience Reynard's comprehensive theming system with 8 built-in themes</p>
      </div>

      <div class="theme-showcase-content">
        <div class="theme-selector-panel">
          <h3>Available Themes</h3>
          <div class="theme-grid">
            <For each={availableThemes}>{themeConfig => (
              <div 
                class={`theme-card ${theme() === themeConfig.name ? 'active' : ''} ${previewTheme() === themeConfig.name ? 'previewing' : ''}`}
                onClick={() => handleThemeChange(themeConfig.name)}
                onMouseEnter={() => handlePreviewTheme(themeConfig.name)}
                onMouseLeave={handleStopPreview}
              >
                <div class="theme-preview">
                  <div class="theme-preview-header">
                    <div class="theme-dots">
                      <span class="dot" />
                      <span class="dot" />
                      <span class="dot" />
                    </div>
                    <span class="theme-preview-title">Preview</span>
                  </div>
                  <div class="theme-preview-content">
                    <div class="theme-color-strip">
                      <div class="color-bar" style={`background: ${themeConfig.colors.primary}`} />
                      <div class="color-bar" style={`background: ${themeConfig.colors.accent}`} />
                      <div class="color-bar" style={`background: ${themeConfig.colors.background}`} />
                      <div class="color-bar" style={`background: ${themeConfig.colors.surface}`} />
                    </div>
                    <div class="theme-preview-elements">
                      <div class="preview-button" style={`background: ${themeConfig.colors.primary}; color: ${themeConfig.colors.background}`}>
                        Button
                      </div>
                      <div class="preview-card" style={`background: ${themeConfig.colors.surface}; border-color: ${themeConfig.colors.border}`}>
                        <div class="preview-text" style={`color: ${themeConfig.colors.text}`}>Sample text</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="theme-info">
                  <h4 class="theme-name">{themeConfig.displayName}</h4>
                  <p class="theme-description">{themeConfig.description}</p>
                </div>
              </div>
            )}</For>
          </div>
        </div>

        <div class="theme-details-panel">
          <div class="current-theme-info">
            <h3>Current Theme: {availableThemes.find(t => t.name === getCurrentTheme())?.displayName}</h3>
            <button 
              class="button button--secondary"
              onClick={() => setShowColorDetails(!showColorDetails())}
            >
              {fluentIconsPackage.getIcon(showColorDetails() ? "eye-off" : "eye") && (
                <span
                  // eslint-disable-next-line solid/no-innerhtml
                  innerHTML={fluentIconsPackage.getIcon(showColorDetails() ? "eye-off" : "eye")?.outerHTML}
                />
              )}
              {showColorDetails() ? 'Hide' : 'Show'} Color Details
            </button>
          </div>

          {showColorDetails() && (
            <div class="color-details">
              <h4>Color Palette</h4>
              <div class="color-grid">
                <For each={getThemeColors(getCurrentTheme())}>{color => (
                  <div class="color-item">
                    <div 
                      class="color-swatch"
                      style={`background-color: ${color.value}`}
                      onClick={() => copyColorValue(color.value)}
                      title={`Click to copy ${color.value}`}
                     />
                    <div class="color-info">
                      <span class="color-name">{color.name}</span>
                      <code class="color-value">{color.value}</code>
                      <code class="color-var">{color.var}</code>
                    </div>
                  </div>
                )}</For>
              </div>
            </div>
          )}

          <div class="theme-features">
            <h4>Theme Features</h4>
            <ul class="feature-list">
              <li>
                {fluentIconsPackage.getIcon("checkmark") && (
                  <span class="feature-icon">
                    <div
                      // eslint-disable-next-line solid/no-innerhtml
                      innerHTML={fluentIconsPackage.getIcon("checkmark")?.outerHTML}
                    />
                  </span>
                )}
                LCH Color Space for consistent colors
              </li>
              <li>
                {fluentIconsPackage.getIcon("checkmark") && (
                  <span class="feature-icon">
                    <div
                      // eslint-disable-next-line solid/no-innerhtml
                      innerHTML={fluentIconsPackage.getIcon("checkmark")?.outerHTML}
                    />
                  </span>
                )}
                CSS Custom Properties for dynamic switching
              </li>
              <li>
                {fluentIconsPackage.getIcon("checkmark") && (
                  <span class="feature-icon">
                    <div
                      // eslint-disable-next-line solid/no-innerhtml
                      innerHTML={fluentIconsPackage.getIcon("checkmark")?.outerHTML}
                    />
                  </span>
                )}
                Accessibility support with high contrast themes
              </li>
              <li>
                {fluentIconsPackage.getIcon("checkmark") && (
                  <span class="feature-icon">
                    <div
                      // eslint-disable-next-line solid/no-innerhtml
                      innerHTML={fluentIconsPackage.getIcon("checkmark")?.outerHTML}
                    />
                  </span>
                )}
                System theme detection and automatic switching
              </li>
              <li>
                {fluentIconsPackage.getIcon("checkmark") && (
                  <span class="feature-icon">
                    <div
                      // eslint-disable-next-line solid/no-innerhtml
                      innerHTML={fluentIconsPackage.getIcon("checkmark")?.outerHTML}
                    />
                  </span>
                )}
                Reduced motion support for accessibility
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};
