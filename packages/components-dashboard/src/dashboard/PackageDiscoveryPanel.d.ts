/**
 * PackageDiscoveryPanel Component
 * Package discovery and registration interface with conflict resolution
 */
import { Component } from "solid-js";
export interface PackageDiscoveryPanelProps {
    /** Whether to show auto-discovery */
    showAutoDiscovery?: boolean;
    /** Whether to show package registry */
    showPackageRegistry?: boolean;
    /** Whether to show conflict resolution */
    showConflictResolution?: boolean;
    /** Auto-refresh interval in milliseconds */
    refreshInterval?: number;
    /** Function to set active tab */
    setActiveTab?: (tab: string) => void;
}
export interface PackageInfo {
    name: string;
    version: string;
    description: string;
    status: "discovered" | "registered" | "installed" | "conflict" | "error";
    dependencies: string[];
    conflicts: string[];
    size: number;
    lastUpdated: Date;
    source: string;
    category: string;
}
export interface DiscoverySummary {
    totalDiscovered: number;
    newPackages: number;
    updatedPackages: number;
    conflictedPackages: number;
    readyToInstall: number;
}
export declare const PackageDiscoveryPanel: Component<PackageDiscoveryPanelProps>;
