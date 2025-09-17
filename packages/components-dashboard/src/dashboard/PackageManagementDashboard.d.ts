/**
 * PackageManagementDashboard Component
 * Comprehensive package management dashboard with discovery, installation, and lifecycle management
 */
import { Component } from "solid-js";
export interface PackageManagementDashboardProps {
    /** Whether to show package discovery */
    showDiscovery?: boolean;
    /** Whether to show installation panel */
    showInstallation?: boolean;
    /** Whether to show dependency graph */
    showDependencies?: boolean;
    /** Whether to show lifecycle management */
    showLifecycle?: boolean;
    /** Whether to show analytics */
    showAnalytics?: boolean;
    /** Whether to show configuration */
    showConfiguration?: boolean;
    /** Auto-refresh interval in milliseconds */
    refreshInterval?: number;
    /** Whether to show loading states */
    showLoading?: boolean;
    /** Custom dashboard title */
    title?: string;
}
export interface PackageSummary {
    totalPackages: number;
    installedPackages: number;
    availablePackages: number;
    failedPackages: number;
    loadingPackages: number;
    disabledPackages: number;
}
export interface PackageDiscoverySummary {
    totalDiscovered: number;
    newPackages: number;
    updatedPackages: number;
    conflictedPackages: number;
    readyToInstall: number;
}
export interface PackageAnalyticsSummary {
    totalLoads: number;
    averageLoadTime: number;
    successRate: number;
    memoryUsage: number;
    performanceScore: number;
}
export declare const PackageManagementDashboard: Component<PackageManagementDashboardProps>;
