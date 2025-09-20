/**
 * OKLCH Animated Palette
 * Generates animated color palettes based on animation state
 */
import { type Accessor } from "solid-js";
export interface AnimatedPaletteState {
    selectedHue: Accessor<number>;
    selectedChroma: Accessor<number>;
    selectedLightness: Accessor<number>;
    animationFrame: Accessor<number>;
    animationSpeed: Accessor<number>;
}
export declare const createAnimatedPalette: (state: AnimatedPaletteState) => {
    animatedPalette: Accessor<string[]>;
};
