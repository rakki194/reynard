/**
 * Theme Showcase Component
 * Interactive demonstration of Reynard's theming system
 */

import { Component } from "solid-js";
import { fluentIconsPackage } from "reynard-fluent-icons";
import { ThemeSelector, ThemeDetails, useThemeShowcase, getThemeColors } from ".";

export const ThemeShowcase: Component = () => {
  const {
    availableThemes,
    previewTheme,
    showColorDetails,
    setShowColorDetails,
    handleThemeChange,
    handlePreviewTheme,
    handleStopPreview,
    copyColorValue,
    currentTheme,
    currentThemeConfig,
    themeContext,
  } = useThemeShowcase();

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
        <ThemeSelector />

        <ThemeDetails
          currentThemeName={currentThemeConfig()?.displayName || "Unknown"}
          showColorDetails={showColorDetails()}
          themeColors={getThemeColors(currentTheme())}
          onToggleColorDetails={() => setShowColorDetails(!showColorDetails())}
          onCopyColor={copyColorValue}
        />
      </div>
    </section>
  );
};
