/**
 * OKLCH Animated Palette
 * Generates animated color palettes based on animation state
 */

import { createMemo, type Accessor } from "solid-js";
import { generateColorPalette } from "reynard-color-media";

export interface AnimatedPaletteState {
  selectedHue: Accessor<number>;
  selectedChroma: Accessor<number>;
  selectedLightness: Accessor<number>;
  animationFrame: Accessor<number>;
  animationSpeed: Accessor<number>;
}

export const createAnimatedPalette = (state: AnimatedPaletteState) => {
  // Generate animated color palette
  const animatedPalette = createMemo(() => {
    const frame = state.animationFrame();
    const baseHue = (state.selectedHue() + frame * state.animationSpeed()) % 360;
    return generateColorPalette(12, baseHue, state.selectedChroma(), state.selectedLightness() / 100);
  });

  return {
    animatedPalette
  };
};
