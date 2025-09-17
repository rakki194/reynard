/**
 * OKLCH Showcase Sections
 * Orchestrates the different sections of the OKLCH showcase
 */
import { Component } from "solid-js";
import type { OKLCHState } from "./useOKLCHState";
interface ShowcaseSectionsProps {
    state: OKLCHState;
    computedValues: {
        availableThemes: string[];
        colorVariations: () => any;
        animatedPalette: () => any;
        themeTagColors: () => any;
        gradientDemos: () => any;
    };
    animationFrame: () => number;
}
export declare const ShowcaseSections: Component<ShowcaseSectionsProps>;
export { ShowcaseSections as OKLCHShowcaseSections };
