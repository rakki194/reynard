/**
 * OKLCH Showcase Advanced Components
 * Advanced features and theme components for the OKLCH showcase
 */
import { Component } from "solid-js";
import type { OKLCHState } from "./useOKLCHState";
import type { OKLCHColor } from "reynard-colors";
interface TagColorData {
    theme: string;
    color: OKLCHColor;
}
interface TagData {
    tag: string;
    colors: TagColorData[];
}
interface AdvancedComponentsProps {
    state: OKLCHState;
    computedValues: {
        availableThemes: string[];
        themeTagColors: () => TagData[];
    };
}
export declare const AdvancedComponents: Component<AdvancedComponentsProps>;
export { AdvancedComponents as OKLCHShowcaseAdvanced };
