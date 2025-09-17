/**
 * PackageInstallationPanel Component
 * Package installation interface with progress tracking and dependency resolution
 */
import { Component } from "solid-js";
export interface PackageInstallationPanelProps {
    /** Whether to show progress tracking */
    showProgress?: boolean;
    /** Whether to show dependency resolution */
    showDependencies?: boolean;
    /** Whether to show bulk operations */
    showBulkOperations?: boolean;
    /** Auto-refresh interval in milliseconds */
    refreshInterval?: number;
}
export interface InstallationPackage {
    name: string;
    version: string;
    description: string;
    status: "pending" | "installing" | "installed" | "failed" | "cancelled";
    progress: number;
    dependencies: string[];
    size: number;
    estimatedTime: number;
    error?: string;
    startTime?: Date;
    endTime?: Date;
}
export interface InstallationSummary {
    totalPackages: number;
    pendingPackages: number;
    installingPackages: number;
    installedPackages: number;
    failedPackages: number;
    totalProgress: number;
}
export declare const PackageInstallationPanel: Component<PackageInstallationPanelProps>;
