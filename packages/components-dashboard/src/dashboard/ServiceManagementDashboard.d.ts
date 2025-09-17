/**
 * ServiceManagementDashboard Component
 * Comprehensive service management dashboard with real-time monitoring and control
 */
import { Component } from "solid-js";
export interface ServiceManagementDashboardProps {
    /** Whether to show notifications */
    showNotifications?: boolean;
    /** Whether to show restart panel */
    showRestartPanel?: boolean;
    /** Whether to show feature panel */
    showFeaturePanel?: boolean;
    /** Whether to show auth status */
    showAuthStatus?: boolean;
    /** Auto-refresh interval in milliseconds */
    refreshInterval?: number;
    /** Whether to show loading states */
    showLoading?: boolean;
    /** Custom dashboard title */
    title?: string;
}
export interface ServiceSummary {
    totalServices: number;
    runningServices: number;
    healthyServices: number;
    failedServices: number;
    startingServices: number;
    stoppingServices: number;
}
export interface FeatureSummary {
    total: number;
    available: number;
    degraded: number;
    unavailable: number;
    criticalUnavailable: number;
}
export interface AuthStatus {
    criticalServicesAvailable: boolean;
    totalServices: number;
    availableServices: number;
    failedServices: number;
}
export declare const ServiceManagementDashboard: Component<ServiceManagementDashboardProps>;
