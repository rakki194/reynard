/**
 * Type definitions for Package Lifecycle System
 * Centralized types for package lifecycle management components
 */
export interface PackageLifecycleInfo {
    name: string;
    version: string;
    description: string;
    status: "loaded" | "unloaded" | "loading" | "unloading" | "reloading" | "error";
    loadTime: number;
    memoryUsage: number;
    lastLoaded: Date | null;
    lastUnloaded: Date | null;
    loadCount: number;
    error?: string;
    dependencies: string[];
    dependents: string[];
}
export interface LifecycleSummary {
    totalPackages: number;
    loadedPackages: number;
    unloadedPackages: number;
    loadingPackages: number;
    errorPackages: number;
    totalMemoryUsage: number;
    averageLoadTime: number;
}
export interface PackageLifecyclePanelProps {
    showLoadUnload?: boolean;
    showReload?: boolean;
    showBulkOperations?: boolean;
    refreshInterval?: number;
}
export interface PackageLifecycleListProps {
    packages: PackageLifecycleInfo[];
    onLoadPackage: (name: string) => void;
    onUnloadPackage: (name: string) => void;
    onReloadPackage: (name: string) => void;
    searchQuery: string;
    onSearchChange: (query: string) => void;
    selectedStatus: string;
    onStatusChange: (status: string) => void;
    isRefreshing: boolean;
    onRefresh: () => void;
}
export interface LifecycleSummaryCardProps {
    summary: LifecycleSummary;
    onRefresh: () => void;
    isRefreshing: boolean;
}
export interface PackageLifecycleState {
    packages: PackageLifecycleInfo[];
    summary: LifecycleSummary;
    isRefreshing: boolean;
    searchQuery: string;
    selectedStatus: string;
    lastUpdate: Date | null;
}
