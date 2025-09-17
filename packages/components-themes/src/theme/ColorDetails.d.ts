/**
 * Color Details Component
 * Displays theme color palette with copy functionality
 */
import { Component } from "solid-js";
import { type ThemeColor } from "./theme-utils";
interface ColorDetailsProps {
    colors: ThemeColor[];
    onCopyColor: (color: string) => void;
}
export declare const ColorDetails: Component<ColorDetailsProps>;
export {};
