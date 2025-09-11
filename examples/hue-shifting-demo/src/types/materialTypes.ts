import type { OKLCHColor } from "reynard-colors";

export interface MaterialDefinition {
  key: keyof typeof import("../utils/hueShiftingAlgorithms").MATERIAL_PATTERNS;
  name: string;
  description: string;
  icon: string;
  exampleColor: OKLCHColor;
}

export interface MaterialColors {
  shadow: OKLCHColor;
  base: OKLCHColor;
  highlight: OKLCHColor;
}
