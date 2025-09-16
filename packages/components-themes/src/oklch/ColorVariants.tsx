/**
 * Color Variants Component
 * Shows different color variants for OKLCH demo
 */

import { Component } from "solid-js";
import { useThemeColors } from "reynard-themes";
import "./ColorVariants.css";

interface ColorVariantsProps {
  selectedColor: string;
}

export const ColorVariants: Component<ColorVariantsProps> = (props) => {
  const themeColors = useThemeColors();

  return (
    <div class="color-variants">
      <h3>Color Variants</h3>
      <div class="variant-grid">
        <div class="variant-item">
          <div
            class="variant-swatch"
            ref={(el) => {
              if (el) {
                el.style.setProperty(
                  "--dynamic-bg-color",
                  themeColors.getColor(props.selectedColor),
                );
              }
            }}
          />
          <span>Base</span>
        </div>
        <div class="variant-item">
          <div
            class="variant-swatch"
            ref={(el) => {
              if (el) {
                el.style.setProperty(
                  "--dynamic-bg-color",
                  themeColors.getColorVariant(props.selectedColor, "lighter"),
                );
              }
            }}
          />
          <span>Lighter</span>
        </div>
        <div class="variant-item">
          <div
            class="variant-swatch"
            ref={(el) => {
              if (el) {
                el.style.setProperty(
                  "--dynamic-bg-color",
                  themeColors.getColorVariant(props.selectedColor, "darker"),
                );
              }
            }}
          />
          <span>Darker</span>
        </div>
        <div class="variant-item">
          <div
            class="variant-swatch"
            ref={(el) => {
              if (el) {
                el.style.setProperty(
                  "--dynamic-bg-color",
                  themeColors.getColorVariant(props.selectedColor, "hover"),
                );
              }
            }}
          />
          <span>Hover</span>
        </div>
        <div class="variant-item">
          <div
            class="variant-swatch"
            ref={(el) => {
              if (el) {
                el.style.setProperty(
                  "--dynamic-bg-color",
                  themeColors.getColorVariant(props.selectedColor, "active"),
                );
              }
            }}
          />
          <span>Active</span>
        </div>
      </div>
    </div>
  );
};
