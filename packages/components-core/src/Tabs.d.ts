/**
 * Tabs Component
 * A flexible tab navigation component with keyboard support
 */
import { Component } from "solid-js";
export interface TabItem {
    /** Unique identifier for the tab */
    id: string;
    /** Display label for the tab */
    label: string;
    /** Optional icon for the tab */
    icon?: any;
    /** Optional badge for the tab */
    badge?: string | number;
    /** Whether the tab is disabled */
    disabled?: boolean;
    /** Optional content for the tab (for backward compatibility) */
    content?: any;
}
export interface TabsProps {
    /** Array of tab items */
    items: TabItem[];
    /** Currently active tab ID */
    activeTab: string;
    /** Callback when tab changes */
    onTabChange: (tabId: string) => void;
    /** Visual variant */
    variant?: "default" | "pills" | "underline";
    /** Size variant */
    size?: "sm" | "md" | "lg";
    /** Whether tabs should take full width */
    fullWidth?: boolean;
    /** Tab content */
    children?: any;
    /** Additional CSS classes */
    class?: string;
}
export interface TabPanelProps {
    /** ID of the tab this panel belongs to */
    tabId: string;
    /** Currently active tab ID */
    activeTab: string;
    /** Panel content */
    children?: any;
    /** Additional CSS classes */
    class?: string;
}
export declare const Tabs: Component<TabsProps>;
export declare const TabPanel: Component<TabPanelProps>;
