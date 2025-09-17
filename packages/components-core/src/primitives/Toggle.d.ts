/**
 * 🦊 Toggle Component
 * Accessible toggle switch with size variants and theme support
 */
import { Component } from "solid-js";
import "./Toggle.css";
export interface ToggleProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
    size?: "sm" | "md" | "lg";
    class?: string;
    "aria-label"?: string;
    id?: string;
}
export declare const Toggle: Component<ToggleProps>;
