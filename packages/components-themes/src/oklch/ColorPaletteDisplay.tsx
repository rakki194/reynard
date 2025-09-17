/**
 * Color Palette Display Component
 * Shows generated color palettes for OKLCH demo
 */

import { Component, For, createEffect } from "solid-js";
import { useColorPalette } from "reynard-themes";

interface ColorPaletteDisplayProps {
  selectedColor: string;
}

export const ColorPaletteDisplay: Component<ColorPaletteDisplayProps> = props => {
  const colorPalette = useColorPalette();

  const palette = () => colorPalette.generatePalette(props.selectedColor, 5);
  const monochromaticPalette = () => colorPalette.generateMonochromaticPalette(props.selectedColor, 5);

  // Apply colors to elements using data attributes
  createEffect(() => {
    const colorElements = document.querySelectorAll("[data-bg-color]");
    colorElements.forEach(element => {
      const color = element.getAttribute("data-bg-color");
      if (color) {
        (element as HTMLElement).style.setProperty("--dynamic-bg-color", color);
      }
    });
  });

  return (
    <div class="color-palette-display">
      <h3>Generated Color Palette</h3>
      <div class="palette-grid">
        <div class="palette-group">
          <h4>Base Palette</h4>
          <div class="color-swatches">
            <For each={palette()}>{color => <div class="color-swatch" data-bg-color={color} title={color} />}</For>
          </div>
        </div>

        <div class="palette-group">
          <h4>Monochromatic Palette</h4>
          <div class="color-swatches">
            <For each={monochromaticPalette()}>
              {color => <div class="color-swatch" data-bg-color={color} title={color} />}
            </For>
          </div>
        </div>
      </div>
    </div>
  );
};
