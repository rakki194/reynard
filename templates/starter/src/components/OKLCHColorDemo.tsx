/**
 * OKLCH Color Demo Component
 * Demonstrates the modular OKLCH color system
 */

import { Component, For, createSignal, createMemo } from "solid-js";
import { useThemeColors, useTagColors, useColorPalette, useTheme } from "reynard-themes";
import { fluentIconsPackage } from "reynard-fluent-icons";
import { OKLCHButton } from "./OKLCHButton";

export const OKLCHColorDemo: Component = () => {
  const themeContext = useTheme();
  const themeColors = useThemeColors();
  const tagColors = useTagColors();
  const colorPalette = useColorPalette();
  
  const [selectedColor, setSelectedColor] = createSignal("primary");
  const [tagInput, setTagInput] = createSignal("react");
  const [intensity, setIntensity] = createSignal(1.0);

  const colorOptions = [
    "primary", "secondary", "accent", "success", "warning", "error", "info"
  ];

  const sampleTags = ["react", "solidjs", "typescript", "oklch", "design-system", "accessibility"];

  // Create reactive tag styles that update when theme changes
  const tagStyles = createMemo(() => {
    const currentTheme = themeContext.theme;
    console.log(`Computing tag styles for theme: ${currentTheme}`);
    return sampleTags.map(tag => ({
      tag,
      style: tagColors.getTagStyle(tag)
    }));
  });

  const palette = () => colorPalette.generatePalette(selectedColor(), 5);
  const monochromaticPalette = () => colorPalette.generateMonochromaticPalette(selectedColor(), 5);

  return (
    <section class="oklch-demo-section">
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
          OKLCH Color System Demo
        </h2>
        <p>Experience the power of OKLCH color space with perceptual uniformity and theme-aware generation</p>
      </div>

      <div class="oklch-demo-content">
        {/* Color Selection */}
        <div class="color-selection">
          <h3>Select Base Color</h3>
          <div class="color-options">
            <For each={colorOptions}>
              {(color) => (
                <button
                  class={`color-option ${selectedColor() === color ? 'active' : ''}`}
                  style={{
                    'background-color': themeColors.getColor(color),
                    'border-color': themeColors.getColor(color)
                  }}
                  onClick={() => setSelectedColor(color)}
                >
                  {color}
                </button>
              )}
            </For>
          </div>
        </div>

        {/* Color Palette Display */}
        <div class="color-palette-display">
          <h3>Generated Color Palette</h3>
          <div class="palette-grid">
            <div class="palette-group">
              <h4>Base Palette</h4>
              <div class="color-swatches">
                <For each={palette()}>
                  {(color) => (
                    <div 
                      class="color-swatch"
                      style={{ 'background-color': color }}
                      title={color}
                    />
                  )}
                </For>
              </div>
            </div>
            
            <div class="palette-group">
              <h4>Monochromatic Palette</h4>
              <div class="color-swatches">
                <For each={monochromaticPalette()}>
                  {(color) => (
                    <div 
                      class="color-swatch"
                      style={{ 'background-color': color }}
                      title={color}
                    />
                  )}
                </For>
              </div>
            </div>
          </div>
        </div>

        {/* Color Variants */}
        <div class="color-variants">
          <h3>Color Variants</h3>
          <div class="variant-grid">
            <div class="variant-item">
              <div 
                class="variant-swatch"
                style={{ 'background-color': themeColors.getColor(selectedColor()) }}
              />
              <span>Base</span>
            </div>
            <div class="variant-item">
              <div 
                class="variant-swatch"
                style={{ 'background-color': themeColors.getColorVariant(selectedColor(), 'lighter') }}
              />
              <span>Lighter</span>
            </div>
            <div class="variant-item">
              <div 
                class="variant-swatch"
                style={{ 'background-color': themeColors.getColorVariant(selectedColor(), 'darker') }}
              />
              <span>Darker</span>
            </div>
            <div class="variant-item">
              <div 
                class="variant-swatch"
                style={{ 'background-color': themeColors.getColorVariant(selectedColor(), 'hover') }}
              />
              <span>Hover</span>
            </div>
            <div class="variant-item">
              <div 
                class="variant-swatch"
                style={{ 'background-color': themeColors.getColorVariant(selectedColor(), 'active') }}
              />
              <span>Active</span>
            </div>
          </div>
        </div>

        {/* Dynamic Tag Colors */}
        <div class="tag-colors-demo">
          <h3>Dynamic Tag Colors</h3>
          <div class="tag-input-section">
            <input
              type="text"
              placeholder="Enter tag name"
              value={tagInput()}
              onInput={(e) => setTagInput(e.target.value)}
            />
            <input
              type="range"
              min="0.1"
              max="2.0"
              step="0.1"
              value={intensity()}
              onInput={(e) => setIntensity(parseFloat(e.target.value))}
            />
            <span>Intensity: {intensity()}</span>
          </div>
          
          <div class="tag-display">
            <div 
              class="tag"
              style={tagColors.getTagStyle(tagInput(), intensity())}
            >
              {tagInput()}
            </div>
          </div>

          <div class="sample-tags">
            <h4>Sample Tags</h4>
            
            <div class="tag-list">
              <For each={tagStyles()}>
                {(tagData) => {
                  // Debug logging
                  console.log(`Tag: ${tagData.tag}, Style:`, tagData.style);
                  
                  return (
                    <div 
                      class="tag"
                      style={{
                        '--tag-bg': tagData.style['--tag-bg'],
                        '--tag-color': tagData.style['--tag-color'],
                      }}
                    >
                      {tagData.tag}
                    </div>
                  );
                }}
              </For>
            </div>
          </div>
        </div>

        {/* Gradient Demo */}
        <div class="gradient-demo">
          <h3>OKLCH Gradients</h3>
          <div class="gradient-grid">
            <div 
              class="gradient-sample"
              style={{ 'background': themeColors.getGradient('primary', 'accent') }}
            >
              Primary → Accent
            </div>
            <div 
              class="gradient-sample"
              style={{ 'background': themeColors.getGradient('success', 'info') }}
            >
              Success → Info
            </div>
            <div 
              class="gradient-sample"
              style={{ 'background': themeColors.getGradient('warning', 'error') }}
            >
              Warning → Error
            </div>
          </div>
        </div>

        {/* OKLCH Button Examples */}
        <div class="oklch-buttons-demo">
          <h3>OKLCH Button Components</h3>
          <div class="button-grid">
            <OKLCHButton variant="primary">Primary</OKLCHButton>
            <OKLCHButton variant="secondary">Secondary</OKLCHButton>
            <OKLCHButton variant="accent">Accent</OKLCHButton>
            <OKLCHButton variant="success">Success</OKLCHButton>
            <OKLCHButton variant="warning">Warning</OKLCHButton>
            <OKLCHButton variant="error">Error</OKLCHButton>
            <OKLCHButton variant="info">Info</OKLCHButton>
            <OKLCHButton variant="primary" size="small">Small</OKLCHButton>
            <OKLCHButton variant="primary" size="large">Large</OKLCHButton>
            <OKLCHButton variant="primary" disabled>Disabled</OKLCHButton>
          </div>
        </div>

        {/* Theme Information */}
        <div class="theme-info">
          <h3>Current Theme Information</h3>
          <div class="info-grid">
            <div class="info-item">
              <strong>Theme:</strong> {themeContext.theme}
            </div>
            <div class="info-item">
              <strong>Is Dark:</strong> {themeContext.isDark ? 'Yes' : 'No'}
            </div>
            <div class="info-item">
              <strong>Is High Contrast:</strong> {themeContext.isHighContrast ? 'Yes' : 'No'}
            </div>
            <div class="info-item">
              <strong>Color Space:</strong> OKLCH (Perceptually Uniform)
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
