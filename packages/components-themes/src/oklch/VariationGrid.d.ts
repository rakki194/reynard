/**
 * Variation Grid Component
 * Displays color variations in a grid layout
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
interface VariationGridProps {
    colorVariations: ColorVariations;
}
export declare const VariationGrid: Component<VariationGridProps>;
export {};
