/**
 * OKLCH Showcase State Management
 * Centralized state management for the OKLCH showcase component
 */

import { createSignal, type Accessor, type Setter } from "solid-js";
import { useTheme, type ThemeName } from "reynard-themes";

export interface OKLCHState {
  selectedHue: Accessor<number>;
  setSelectedHue: Setter<number>;
  selectedLightness: Accessor<number>;
  setSelectedLightness: Setter<number>;
  selectedChroma: Accessor<number>;
  setSelectedChroma: Setter<number>;
  selectedTheme: Accessor<string>;
  setSelectedTheme: Setter<ThemeName>;
  animationSpeed: Accessor<number>;
  setAnimationSpeed: Setter<number>;
  showAdvanced: Accessor<boolean>;
  setShowAdvanced: Setter<boolean>;
  customTag: Accessor<string>;
  setCustomTag: Setter<string>;
  tagIntensity: Accessor<number>;
  setTagIntensity: Setter<number>;
  themeContext: ReturnType<typeof useTheme>;
}

/**
 * Creates and manages all state for the OKLCH showcase
 */
export const useOKLCHState = (): OKLCHState => {
  const themeContext = useTheme();

  // Interactive state
  const [selectedHue, setSelectedHue] = createSignal(240);
  const [selectedLightness, setSelectedLightness] = createSignal(60);
  const [selectedChroma, setSelectedChroma] = createSignal(0.3);
  const [selectedTheme, setSelectedTheme] = createSignal(themeContext.theme);
  const [animationSpeed, setAnimationSpeed] = createSignal(1);
  const [showAdvanced, setShowAdvanced] = createSignal(false);
  const [customTag, setCustomTag] = createSignal("reynard");
  const [tagIntensity, setTagIntensity] = createSignal(1.0);

  return {
    selectedHue,
    setSelectedHue,
    selectedLightness,
    setSelectedLightness,
    selectedChroma,
    setSelectedChroma,
    selectedTheme,
    setSelectedTheme,
    animationSpeed,
    setAnimationSpeed,
    showAdvanced,
    setShowAdvanced,
    customTag,
    setCustomTag,
    tagIntensity,
    setTagIntensity,
    themeContext,
  };
};
