/**
 * OKLCH Showcase Demo Components
 * Demo and showcase components for the OKLCH showcase
 */
import { Component } from "solid-js";
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
interface DemoComponentsProps {
    computedValues: {
        colorVariations: () => ColorVariations;
    };
    animationFrame: () => number;
}
export declare const DemoComponents: Component<DemoComponentsProps>;
export { DemoComponents as OKLCHShowcaseDemo };
