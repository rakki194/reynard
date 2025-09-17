/**
 * Select Component
 * A flexible select dropdown component with styling and validation
 */
import { Component, JSX } from "solid-js";
export interface SelectOption {
    value: string | number;
    label: string;
    disabled?: boolean;
}
export interface SelectProps extends Omit<JSX.SelectHTMLAttributes<HTMLSelectElement>, "size"> {
    /** Select variant */
    variant?: "default" | "filled" | "outlined";
    /** Select size */
    size?: "sm" | "md" | "lg";
    /** Error state */
    error?: boolean;
    /** Error message */
    errorMessage?: string;
    /** Helper text */
    helperText?: string;
    /** Label text */
    label?: string;
    /** Whether label is required */
    required?: boolean;
    /** Left icon */
    leftIcon?: JSX.Element;
    /** Full width */
    fullWidth?: boolean;
    /** Loading state */
    loading?: boolean;
    /** Options array */
    options?: SelectOption[];
    /** Placeholder text */
    placeholder?: string;
}
export declare const Select: Component<SelectProps>;
