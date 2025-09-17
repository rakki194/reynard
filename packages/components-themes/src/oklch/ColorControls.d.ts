/**
 * Color Controls Component
 * Interactive controls for OKLCH color manipulation
 */
import { Component } from "solid-js";
interface ColorControlsProps {
    selectedHue: number;
    selectedLightness: number;
    selectedChroma: number;
    animationSpeed: number;
    onHueChange: (hue: number) => void;
    onLightnessChange: (lightness: number) => void;
    onChromaChange: (chroma: number) => void;
    onSpeedChange: (speed: number) => void;
}
export declare const ColorControls: Component<ColorControlsProps>;
export {};
