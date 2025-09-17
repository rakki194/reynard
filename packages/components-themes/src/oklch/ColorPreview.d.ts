/**
 * Color Preview Component
 * Live color preview with variations display
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
interface ColorPreviewProps {
    colorVariations: ColorVariations;
    selectedLightness: number;
    selectedChroma: number;
    selectedHue: number;
}
export declare const ColorPreview: Component<ColorPreviewProps>;
export {};
