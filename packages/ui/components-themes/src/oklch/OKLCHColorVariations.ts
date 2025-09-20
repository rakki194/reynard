/**
 * OKLCH Color Variations
 * Generates color variations and harmonies from base OKLCH color
 */

import { createMemo, type Accessor } from "solid-js";
import { formatOKLCH, adjustLightness, adjustSaturation, type OKLCHColor } from "reynard-colors";

export interface ColorVariationsState {
  selectedHue: Accessor<number>;
  selectedLightness: Accessor<number>;
  selectedChroma: Accessor<number>;
}

export const createColorVariations = (state: ColorVariationsState) => {
  // Generate current OKLCH color based on controls
  const currentOKLCH = createMemo(
    (): OKLCHColor => ({
      l: state.selectedLightness(),
      c: state.selectedChroma(),
      h: state.selectedHue(),
    })
  );

  // Generate color variations
  const colorVariations = createMemo(() => {
    const base = currentOKLCH();
    return {
      base: formatOKLCH(base),
      lighter: formatOKLCH(adjustLightness(base, 1.3)),
      darker: formatOKLCH(adjustLightness(base, 0.7)),
      moreSaturated: formatOKLCH(adjustSaturation(base, 1.5)),
      lessSaturated: formatOKLCH(adjustSaturation(base, 0.5)),
      complementary: formatOKLCH({ ...base, h: (base.h + 180) % 360 }),
      triadic1: formatOKLCH({ ...base, h: (base.h + 120) % 360 }),
      triadic2: formatOKLCH({ ...base, h: (base.h + 240) % 360 }),
    };
  });

  return {
    currentOKLCH,
    colorVariations,
  };
};
