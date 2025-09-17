/**
 * ServiceStatusPanel Component
 * Detailed service status panel with actions, progress, dependencies, and metrics
 */
import { Component } from "solid-js";
export interface ServiceStatusPanelProps {
    /** Whether to show detailed service information */
    showDetails?: boolean;
    /** Whether to show service action buttons */
    showActions?: boolean;
    /** Whether to show loading progress */
    showProgress?: boolean;
    /** Whether to show dependency graph */
    showDependencies?: boolean;
    /** Whether to show performance metrics */
    showMetrics?: boolean;
    /** Auto-refresh interval in milliseconds */
    refreshInterval?: number;
}
export interface ServiceStatus {
    name: string;
    status: "running" | "stopped" | "starting" | "stopping" | "failed";
    health: "healthy" | "degraded" | "unhealthy" | "unknown";
    isHealthy: boolean;
    message?: string;
    lastCheck?: Date;
    uptime?: number;
    startupTime?: number;
    memoryUsage?: number;
    cpuUsage?: number;
    connection_state?: string;
}
export interface ServiceSummary {
    totalServices: number;
    runningServices: number;
    healthyServices: number;
    failedServices: number;
    successRate?: number;
}
export declare const ServiceStatusPanel: Component<ServiceStatusPanelProps>;
