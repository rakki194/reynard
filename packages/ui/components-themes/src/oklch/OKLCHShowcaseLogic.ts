/**
 * OKLCH Showcase Logic
 * Orchestrates business logic and computed values for the OKLCH showcase
 */

import type { Accessor } from "solid-js";
import { formatOKLCH } from "reynard-colors";
import { createColorVariations } from "./OKLCHColorVariations";
import { createGradientDemos } from "./OKLCHGradientDemos";
import { createThemeTags } from "./OKLCHThemeTags";
import { createAnimatedPalette } from "./OKLCHAnimatedPalette";

export interface OKLCHShowcaseState {
  selectedHue: Accessor<number>;
  selectedLightness: Accessor<number>;
  selectedChroma: Accessor<number>;
  animationFrame: Accessor<number>;
  animationSpeed: Accessor<number>;
  customTag: Accessor<string>;
  tagIntensity: Accessor<number>;
}

export const createOKLCHShowcaseLogic = (state: OKLCHShowcaseState) => {
  // Create color variations module
  const colorVariationsModule = createColorVariations(state);

  // Create gradient demos module
  const gradientDemosModule = createGradientDemos({
    colorVariations: colorVariationsModule.colorVariations,
  });

  // Create theme tags module
  const themeTagsModule = createThemeTags(state);

  // Create animated palette module
  const animatedPaletteModule = createAnimatedPalette(state);

  return {
    availableThemes: themeTagsModule.availableThemes,
    sampleTags: themeTagsModule.sampleTags,
    currentOKLCH: () => formatOKLCH(colorVariationsModule.currentOKLCH()),
    colorVariations: colorVariationsModule.colorVariations,
    animatedPalette: animatedPaletteModule.animatedPalette,
    themeTagColors: themeTagsModule.themeTagColors,
    gradientDemos: gradientDemosModule.gradientDemos,
  };
};
