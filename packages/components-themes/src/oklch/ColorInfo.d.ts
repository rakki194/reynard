/**
 * Color Info Component
 * Displays color metadata and values
 */
import { Component } from "solid-js";
interface ColorInfoProps {
    color: string;
    lightness: number;
    chroma: number;
    hue: number;
    title?: string;
}
export declare const ColorInfo: Component<ColorInfoProps>;
export {};
