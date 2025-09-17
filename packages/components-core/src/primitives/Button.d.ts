/**
 * Button Component
 * A versatile button component with multiple variants and states
 */
import { Component, JSX } from "solid-js";
export interface ButtonProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
    /** Button variant */
    variant?: "primary" | "secondary" | "tertiary" | "ghost" | "icon" | "danger" | "success" | "warning";
    /** Button size */
    size?: "sm" | "md" | "lg";
    /** Loading state */
    loading?: boolean;
    /** Disabled state */
    disabled?: boolean;
    /** Full width */
    fullWidth?: boolean;
    /** Icon only button */
    iconOnly?: boolean;
    /** Left icon */
    leftIcon?: JSX.Element;
    /** Right icon */
    rightIcon?: JSX.Element;
    /** Children content */
    children?: JSX.Element;
}
export declare const Button: Component<ButtonProps>;
