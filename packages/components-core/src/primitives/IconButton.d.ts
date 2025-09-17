/**
 * IconButton Component
 * A specialized button component that combines icons with text or displays icon-only buttons.
 * Provides consistent styling and behavior for icon-based interactions.
 */
import { Component, JSX } from "solid-js";
export interface IconButtonProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
    /** Icon name from the icon registry */
    icon: string;
    /** Icon package ID (optional) */
    iconPackageId?: string;
    /** Icon position relative to text */
    iconPosition?: "left" | "right";
    /** Icon size */
    iconSize?: "xs" | "sm" | "md" | "lg" | "xl";
    /** Icon variant */
    iconVariant?: "default" | "primary" | "secondary" | "muted" | "error" | "warning" | "success" | "info";
    /** Button variant */
    variant?: "primary" | "secondary" | "tertiary" | "ghost" | "icon" | "danger" | "success" | "warning";
    /** Button size */
    size?: "sm" | "md" | "lg";
    /** Icon only button (no text) */
    iconOnly?: boolean;
    /** Loading state */
    loading?: boolean;
    /** Disabled state */
    disabled?: boolean;
    /** Full width */
    fullWidth?: boolean;
    /** Active state */
    active?: boolean;
    /** Progress value (0-100) for progress bar */
    progress?: number;
    /** Glow effect */
    glow?: boolean;
    /** Glow color */
    glowColor?: string;
    /** Tooltip text */
    tooltip?: string;
    /** Children content */
    children?: JSX.Element;
}
export declare const IconButton: Component<IconButtonProps>;
