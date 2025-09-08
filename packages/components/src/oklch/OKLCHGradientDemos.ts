/**
 * OKLCH Gradient Demonstrations
 * Creates gradient demonstrations from color variations
 */

import { createMemo } from "solid-js";

export interface GradientDemosState {
  colorVariations: () => {
    base: string;
    lighter: string;
    darker: string;
    moreSaturated: string;
    lessSaturated: string;
    complementary: string;
    triadic1: string;
    triadic2: string;
  };
}

export const createGradientDemos = (state: GradientDemosState) => {
  // Generate gradient demonstrations
  const gradientDemos = createMemo(() => {
    const variations = state.colorVariations();
    return [
      {
        name: "Primary Gradient",
        gradient: `linear-gradient(135deg, ${variations.base}, ${variations.complementary})`
      },
      {
        name: "Triadic Harmony",
        gradient: `linear-gradient(45deg, ${variations.base}, ${variations.triadic1}, ${variations.triadic2})`
      },
      {
        name: "Lightness Scale",
        gradient: `linear-gradient(90deg, ${variations.darker}, ${variations.base}, ${variations.lighter})`
      },
      {
        name: "Saturation Scale",
        gradient: `linear-gradient(90deg, ${variations.lessSaturated}, ${variations.base}, ${variations.moreSaturated})`
      }
    ];
  });

  return {
    gradientDemos
  };
};
