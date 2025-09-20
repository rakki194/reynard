/**
 * OKLCH Color Variations
 * Generates color variations and harmonies from base OKLCH color
 */
import { type Accessor } from "solid-js";
import { type OKLCHColor } from "reynard-colors";
export interface ColorVariationsState {
    selectedHue: Accessor<number>;
    selectedLightness: Accessor<number>;
    selectedChroma: Accessor<number>;
}
export declare const createColorVariations: (state: ColorVariationsState) => {
    currentOKLCH: Accessor<OKLCHColor>;
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
};
