/**
 * @fileoverview Layout components for documentation sites
 */
import { Component, JSX } from "solid-js";
/**
 * Main documentation layout component
 */
export declare const DocsLayout: Component<{
    children: JSX.Element;
    sidebar?: JSX.Element;
    header?: JSX.Element;
    footer?: JSX.Element;
    className?: string;
}>;
/**
 * Documentation header component
 */
export declare const DocsHeader: Component<{
    title: string;
    logo?: string;
    navigation?: JSX.Element;
    actions?: JSX.Element;
    className?: string;
}>;
/**
 * Documentation sidebar component
 */
export declare const DocsSidebar: Component<{
    children: JSX.Element;
    title?: string;
    className?: string;
}>;
/**
 * Documentation content wrapper
 */
export declare const DocsContent: Component<{
    children: JSX.Element;
    className?: string;
}>;
/**
 * Documentation footer component
 */
export declare const DocsFooter: Component<{
    children: JSX.Element;
    className?: string;
}>;
/**
 * Page container component
 */
export declare const DocsPage: Component<{
    children: JSX.Element;
    title?: string;
    description?: string;
    className?: string;
}>;
/**
 * Section component for organizing content
 */
export declare const DocsSection: Component<{
    children: JSX.Element;
    title?: string;
    description?: string;
    className?: string;
}>;
/**
 * Grid layout for documentation content
 */
export declare const DocsGrid: Component<{
    children: JSX.Element;
    columns?: number;
    gap?: string;
    className?: string;
}>;
/**
 * Card grid for feature showcases
 */
export declare const DocsCardGrid: Component<{
    items: Array<{
        title: string;
        description: string;
        icon?: string;
        href?: string;
        badge?: string;
    }>;
    columns?: number;
    className?: string;
}>;
/**
 * Hero section component
 */
export declare const DocsHero: Component<{
    title: string;
    subtitle?: string;
    description?: string;
    actions?: JSX.Element;
    image?: string;
    className?: string;
}>;
