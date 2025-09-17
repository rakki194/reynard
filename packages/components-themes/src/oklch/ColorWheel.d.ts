/**
 * Color Wheel Component
 * Animated color wheel with dynamic palette
 */
import { Component } from "solid-js";
interface ColorWheelProps {
    animatedPalette: string[];
    animationFrame: number;
}
export declare const ColorWheel: Component<ColorWheelProps>;
export {};
