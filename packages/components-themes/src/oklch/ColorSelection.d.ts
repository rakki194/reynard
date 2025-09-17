/**
 * Color Selection Component
 * Handles base color selection for OKLCH demo
 */
import { Component } from "solid-js";
import "./ColorSelection.css";
interface ColorSelectionProps {
    selectedColor: string;
    onColorSelect: (color: string) => void;
}
export declare const ColorSelection: Component<ColorSelectionProps>;
export {};
