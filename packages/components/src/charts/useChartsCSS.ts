/**
 * Charts CSS Hook
 * Manages dynamic CSS custom properties for color updates
 */

import { createEffect } from "solid-js";

export const useChartsCSS = () => {
  // Helper function to set CSS custom properties
  const setCSSProperty = (element: HTMLElement, property: string, value: string) => {
    element.style.setProperty(property, value);
  };

  // Update dynamic colors when data changes
  createEffect(() => {
    // Update color swatches
    const colorSwatches = document.querySelectorAll('.color-swatch[data-bg-color]');
    colorSwatches.forEach((swatch) => {
      const bgColor = swatch.getAttribute('data-bg-color');
      if (bgColor) {
        setCSSProperty(swatch as HTMLElement, '--dynamic-bg-color', bgColor);
      }
    });

    // Update color samples
    const colorSamples = document.querySelectorAll('.color-sample[data-bg-color]');
    colorSamples.forEach((sample) => {
      const bgColor = sample.getAttribute('data-bg-color');
      if (bgColor) {
        setCSSProperty(sample as HTMLElement, '--dynamic-bg-color', bgColor);
      }
    });

    // Update tag items
    const tagItems = document.querySelectorAll('.tag-item[data-bg-color]');
    tagItems.forEach((item) => {
      const bgColor = item.getAttribute('data-bg-color');
      if (bgColor) {
        setCSSProperty(item as HTMLElement, '--dynamic-bg-color', bgColor);
      }
    });
  });

  return { setCSSProperty };
};
