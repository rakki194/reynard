/**
 * ServiceRestartPanel Component
 * Service restart functionality with bulk actions and recovery options
 */
import { Component } from "solid-js";
export interface ServiceRestartPanelProps {
    /** Whether to show only failed services */
    showFailedOnly?: boolean;
    /** Whether to show recovery options */
    showRecoveryOptions?: boolean;
    /** Whether to show bulk actions */
    showBulkActions?: boolean;
}
export interface ServiceInfo {
    name: string;
    status: "running" | "stopped" | "starting" | "stopping" | "failed";
    health: "healthy" | "degraded" | "unhealthy" | "unknown";
    canRestart: boolean;
    lastRestart?: Date;
    restartCount: number;
}
export declare const ServiceRestartPanel: Component<ServiceRestartPanelProps>;
