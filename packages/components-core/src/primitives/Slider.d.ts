/**
 * 🦊 Advanced Slider Component
 * Sophisticated range input with full accessibility and touch support
 */
import { Component } from "solid-js";
import "./Slider.css";
export interface SliderProps {
    min?: number;
    max?: number;
    step?: number;
    value?: number;
    onChange?: (value: number) => void;
    class?: string;
    disabled?: boolean;
    "aria-label"?: string;
    id?: string;
}
export declare const Slider: Component<SliderProps>;
