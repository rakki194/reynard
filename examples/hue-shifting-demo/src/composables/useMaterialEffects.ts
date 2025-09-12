import { createSignal } from "solid-js";
import type { OKLCHColor } from "reynard-colors";

export interface MaterialPattern {
  shadowShift: number;
  highlightShift: number;
  chromaBoost: number;
  lightnessRange: number;
}

export const MATERIAL_PATTERNS = {
  metal: {
    shadowShift: 30,
    highlightShift: 15,
    chromaBoost: 0.15,
    lightnessRange: 50,
  },
  skin: {
    shadowShift: 20,
    highlightShift: 25,
    chromaBoost: 0.08,
    lightnessRange: 35,
  },
  fabric: {
    shadowShift: 15,
    highlightShift: 10,
    chromaBoost: 0.05,
    lightnessRange: 40,
  },
  plastic: {
    shadowShift: 10,
    highlightShift: 20,
    chromaBoost: 0.12,
    lightnessRange: 45,
  },
} as const;

export type MaterialType = keyof typeof MATERIAL_PATTERNS;

export interface MaterialState {
  selectedMaterial: MaterialType;
  shiftIntensity: number;
}

export interface MaterialActions {
  setSelectedMaterial: (material: MaterialType) => void;
  setShiftIntensity: (intensity: number) => void;
  getEffectiveColor: (color: OKLCHColor) => OKLCHColor;
  getMaterialPattern: () => MaterialPattern;
}

export function useMaterialEffects() {
  const [selectedMaterial, setSelectedMaterial] =
    createSignal<MaterialType>("fabric");
  const [shiftIntensity, setShiftIntensity] = createSignal(0.3);

  const getEffectiveColor = (color: OKLCHColor): OKLCHColor => {
    // For drawing, we want to use the base color directly
    // Material effects are applied when creating variations, not the base color
    return color;
  };

  const getMaterialPattern = (): MaterialPattern => {
    return MATERIAL_PATTERNS[selectedMaterial()];
  };

  return {
    // State
    selectedMaterial,
    shiftIntensity,

    // Actions
    setSelectedMaterial,
    setShiftIntensity,
    getEffectiveColor,
    getMaterialPattern,
  };
}
