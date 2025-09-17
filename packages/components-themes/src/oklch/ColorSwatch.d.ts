/**
 * Color Swatch Component
 * Reusable color display with dynamic background
 */
import { Component } from "solid-js";
interface ColorSwatchProps {
    color: string;
    size: "small" | "large";
    ref?: (el: HTMLDivElement) => void;
}
export declare const ColorSwatch: Component<ColorSwatchProps>;
export {};
