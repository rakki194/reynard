/**
 * @fileoverview Navigation components for documentation sites
 */
import { Component, JSX } from "solid-js";
/**
 * Main navigation component
 */
export declare const DocsNav: Component<{
    items: Array<{
        label: string;
        href?: string;
        icon?: string;
        children?: any[];
        external?: boolean;
        badge?: string;
        color?: string;
    }>;
    orientation?: "horizontal" | "vertical";
    className?: string;
}>;
/**
 * Breadcrumb navigation component
 */
export declare const DocsBreadcrumbs: Component<{
    items: Array<{
        label: string;
        href?: string;
    }>;
    separator?: string;
    className?: string;
}>;
/**
 * Table of contents component
 */
export declare const DocsTOC: Component<{
    headings: Array<{
        id: string;
        text: string;
        level: number;
    }>;
    activeId?: string;
    onNavigate?: (id: string) => void;
    className?: string;
}>;
/**
 * Pagination component
 */
export declare const DocsPagination: Component<{
    current: number;
    total: number;
    onPageChange: (page: number) => void;
    showFirstLast?: boolean;
    showPrevNext?: boolean;
    maxVisible?: number;
    className?: string;
}>;
/**
 * Tab navigation component
 */
export declare const DocsTabs: Component<{
    tabs: Array<{
        id: string;
        label: string;
        icon?: string;
        badge?: string;
        disabled?: boolean;
    }>;
    activeTab: string;
    onTabChange: (tabId: string) => void;
    orientation?: "horizontal" | "vertical";
    className?: string;
}>;
/**
 * Tab panel component
 */
export declare const DocsTabPanel: Component<{
    tabId: string;
    activeTab: string;
    children: JSX.Element;
    className?: string;
}>;
