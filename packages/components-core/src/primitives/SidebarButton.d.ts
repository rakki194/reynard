/**
 * SidebarButton Component
 * A specialized button component for sidebar navigation with support for secondary actions,
 * content areas, and various layout styles.
 */
import { Component, JSX } from "solid-js";
export interface SidebarButtonProps extends Omit<JSX.ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
    /** Icon name from the icon registry */
    icon: string;
    /** Icon package ID (optional) */
    iconPackageId?: string;
    /** Icon size */
    iconSize?: "xs" | "sm" | "md" | "lg" | "xl";
    /** Icon variant */
    iconVariant?: "default" | "primary" | "secondary" | "muted" | "error" | "warning" | "success" | "info";
    /** Whether the button is active/selected */
    active?: boolean;
    /** Whether the button is disabled */
    disabled?: boolean;
    /** Whether to show the button */
    show?: boolean;
    /** Custom CSS class for styling */
    class?: string;
    /** Button text/label */
    label?: string;
    /** Whether to show the label */
    showLabel?: boolean;
    /** Secondary icon (e.g., status indicator) */
    secondaryIcon?: string;
    /** Secondary icon variant */
    secondaryIconVariant?: "default" | "primary" | "secondary" | "muted" | "error" | "warning" | "success" | "info";
    /** Whether to show secondary actions */
    showSecondaryActions?: boolean;
    /** Secondary action buttons */
    secondaryActions?: Array<{
        icon: string;
        variant?: "default" | "primary" | "secondary" | "muted" | "error" | "warning" | "success" | "info";
        size?: "xs" | "sm" | "md" | "lg" | "xl";
        ariaLabel: string;
        tooltip: string;
        onClick: (e: MouseEvent) => void;
        disabled?: boolean;
    }>;
    /** Whether to show content area */
    showContent?: boolean;
    /** Content to display when active */
    content?: JSX.Element;
    /** Button layout style */
    layout?: "default" | "toggle" | "action" | "header";
    /** Loading state */
    loading?: boolean;
    /** Progress value (0-100) for progress bar */
    progress?: number;
    /** Glow effect */
    glow?: boolean;
    /** Glow color */
    glowColor?: string;
    /** Tooltip text */
    tooltip?: string;
}
export declare const SidebarButton: Component<SidebarButtonProps>;
