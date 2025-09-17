/**
 * OKLCH Showcase State Management
 * Centralized state management for the OKLCH showcase component
 */
import { type Accessor, type Setter } from "solid-js";
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
export declare const useOKLCHState: () => OKLCHState;
