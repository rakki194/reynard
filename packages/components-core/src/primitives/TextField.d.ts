/**
 * TextField Component
 * A flexible text input component with validation and styling
 */
import { Component, JSX } from "solid-js";
export interface TextFieldProps extends Omit<JSX.InputHTMLAttributes<HTMLInputElement>, "size"> {
    /** Input variant */
    variant?: "default" | "filled" | "outlined";
    /** Input size */
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
    /** Right icon */
    rightIcon?: JSX.Element;
    /** Full width */
    fullWidth?: boolean;
    /** Loading state */
    loading?: boolean;
}
export declare const TextField: Component<TextFieldProps>;
