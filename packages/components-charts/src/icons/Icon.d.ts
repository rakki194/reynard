/**
 * Reynard Icon System
 *
 * Enhanced icon components and utilities for the Reynard design system.
 * Uses the modular icon registry system with advanced features like progress bars,
 * glow effects, and interactive states.
 */
import { Component, JSX } from "solid-js";
export interface IconProps extends Omit<JSX.ButtonHTMLAttributes<HTMLButtonElement>, "children" | "role"> {
    name: string;
    packageId?: string;
    size?: "xs" | "sm" | "md" | "lg" | "xl";
    variant?: "default" | "primary" | "secondary" | "muted" | "error" | "warning" | "success" | "info";
    class?: string;
    style?: JSX.CSSProperties;
    role?: string;
    "aria-label"?: string;
    "aria-hidden"?: boolean;
    title?: string;
    active?: boolean;
    loading?: boolean;
    progress?: number;
    glow?: boolean;
    glowColor?: string;
    tooltip?: string;
    interactive?: boolean;
}
/**
 * Enhanced Icon component for displaying SVG icons with advanced features
 */
export declare const Icon: Component<IconProps>;
export declare const Search: (props: Omit<IconProps, "name">) => any;
export declare const Upload: (props: Omit<IconProps, "name">) => any;
export declare const FileText: (props: Omit<IconProps, "name">) => any;
export declare const Code: (props: Omit<IconProps, "name">) => any;
export declare const Database: (props: Omit<IconProps, "name">) => any;
export declare const Settings: (props: Omit<IconProps, "name">) => any;
export declare const Download: (props: Omit<IconProps, "name">) => any;
export declare const Trash2: (props: Omit<IconProps, "name">) => any;
export declare const Eye: (props: Omit<IconProps, "name">) => any;
export declare const Clock: (props: Omit<IconProps, "name">) => any;
export declare const Zap: (props: Omit<IconProps, "name">) => any;
export declare const Brain: (props: Omit<IconProps, "name">) => any;
export { iconRegistry, getIcon, searchIcons, getAllIconNames, getIconPackages, } from "reynard-fluent-icons";
