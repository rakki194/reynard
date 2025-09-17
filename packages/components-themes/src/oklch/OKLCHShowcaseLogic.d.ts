/**
 * OKLCH Showcase Logic
 * Orchestrates business logic and computed values for the OKLCH showcase
 */
import type { Accessor } from "solid-js";
export interface OKLCHShowcaseState {
    selectedHue: Accessor<number>;
    selectedLightness: Accessor<number>;
    selectedChroma: Accessor<number>;
    animationFrame: Accessor<number>;
    animationSpeed: Accessor<number>;
    customTag: Accessor<string>;
    tagIntensity: Accessor<number>;
}
export declare const createOKLCHShowcaseLogic: (state: OKLCHShowcaseState) => {
    availableThemes: import("reynard-themes").ThemeName[];
    sampleTags: string[];
    currentOKLCH: () => string;
    colorVariations: Accessor<{
        base: string;
        lighter: string;
        darker: string;
        moreSaturated: string;
        lessSaturated: string;
        complementary: string;
        triadic1: string;
        triadic2: string;
    }>;
    animatedPalette: Accessor<string[]>;
    themeTagColors: Accessor<{
        tag: string;
        colors: {
            theme: import("reynard-themes").ThemeName;
            color: import("reynard-colors").OKLCHColor;
        }[];
    }[]>;
    gradientDemos: Accessor<{
        name: string;
        gradient: string;
    }[]>;
};
