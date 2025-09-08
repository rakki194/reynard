/**
 * Variation Grid Component
 * Displays color variations in a grid layout
 */

import { Component, For, createEffect } from "solid-js";
import { ColorSwatch } from "./ColorSwatch";

interface ColorVariations {
  base: string;
  lighter: string;
  darker: string;
  moreSaturated: string;
  lessSaturated: string;
  complementary: string;
  triadic1: string;
  triadic2: string;
}

interface VariationGridProps {
  colorVariations: ColorVariations;
}

export const VariationGrid: Component<VariationGridProps> = (props) => {
  const variationSwatchesRef: HTMLDivElement[] = [];

  // Update color variations
  createEffect(() => {
    const variations = props.colorVariations;
    variationSwatchesRef.forEach((ref, index) => {
      if (ref) {
        const variationNames = Object.keys(variations);
        const variationName = variationNames[index];
        if (variationName && variations[variationName as keyof typeof variations]) {
          ref.style.setProperty('--dynamic-bg-color', variations[variationName as keyof typeof variations]);
        }
      }
    });
  });

  return (
    <div class="variation-grid">
      <For each={Object.entries(props.colorVariations)}>
        {([name, color], index) => (
          <div class="variation-item">
            <ColorSwatch 
              color={color}
              size="small"
              ref={(el) => variationSwatchesRef[index()] = el}
            />
            <span class="variation-name">{name}</span>
            <code class="variation-code">{color}</code>
          </div>
        )}
      </For>
    </div>
  );
};
