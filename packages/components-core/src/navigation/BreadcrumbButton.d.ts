/**
 * BreadcrumbButton Component
 * Specialized button components for breadcrumb navigation with consistent styling
 * and behavior patterns used in breadcrumb interfaces.
 */
import { Component, JSX } from "solid-js";
export interface BreadcrumbButtonProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
    /** Icon name from the icon registry */
    icon: string;
    /** Icon package ID (optional) */
    iconPackageId?: string;
    /** Icon size */
    iconSize?: "xs" | "sm" | "md" | "lg" | "xl";
    /** Icon variant */
    iconVariant?: "default" | "primary" | "secondary" | "muted" | "error" | "warning" | "success" | "info";
    /** Button variant */
    variant?: "default" | "primary" | "secondary" | "ghost" | "icon" | "danger" | "success" | "warning";
    /** Button size */
    size?: "sm" | "md" | "lg";
    /** Icon only button (no text) */
    iconOnly?: boolean;
    /** Loading state */
    loading?: boolean;
    /** Disabled state */
    disabled?: boolean;
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
    /** Whether this is a navigation action */
    isNavigation?: boolean;
    /** Whether this is a destructive action */
    isDestructive?: boolean;
    /** Whether this is a primary action */
    isPrimary?: boolean;
    /** Children content */
    children?: JSX.Element;
}
export declare const BreadcrumbButton: Component<BreadcrumbButtonProps>;
/**
 * BreadcrumbActionButton Component
 * A specialized breadcrumb button for common actions like create, delete, settings, etc.
 */
export interface BreadcrumbActionButtonProps extends Omit<BreadcrumbButtonProps, "icon"> {
    /** Action type for predefined styling and behavior */
    action?: "create" | "delete" | "edit" | "settings" | "refresh" | "upload" | "download" | "search" | "filter" | "sort";
    /** Custom icon name (overrides action icon) */
    icon?: string;
}
export declare const BreadcrumbActionButton: Component<BreadcrumbActionButtonProps>;
