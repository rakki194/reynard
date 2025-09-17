/**
 * 🦊 Modern Checkbox Component
 * Accessible checkbox with smooth CSS animations and theme integration
 */
import { Component } from "solid-js";
import "./Checkbox.css";
export interface CheckboxProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
    size?: "sm" | "md" | "lg";
    variant?: "default" | "primary" | "success" | "warning" | "danger";
    class?: string;
    "aria-label"?: string;
    id?: string;
    indeterminate?: boolean;
}
export declare const Checkbox: Component<CheckboxProps>;
