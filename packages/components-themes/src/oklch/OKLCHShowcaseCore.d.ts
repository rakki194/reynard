/**
 * OKLCH Showcase Core Components
 * Core interactive components for the OKLCH showcase
 */
import { Component } from "solid-js";
import type { OKLCHState } from "./useOKLCHState";
interface ColorVariations {
    base: string;
    lighter: string;
    darker: string;
    moreSaturated: string;
    lessSaturated: string;
    complementary: string;
    triadic1: string;
    triadic2: string;
}
interface GradientDemoItem {
    name: string;
    gradient: string;
}
interface CoreComponentsProps {
    state: OKLCHState;
    computedValues: {
        colorVariations: () => ColorVariations;
        animatedPalette: () => string[];
        gradientDemos: () => GradientDemoItem[];
    };
    animationFrame: () => number;
}
export declare const CoreComponents: Component<CoreComponentsProps>;
export { CoreComponents as OKLCHShowcaseCore };
