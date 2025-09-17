/**
 * ServiceAuthStatus Component
 * Authentication service status monitoring
 */
import { Component } from "solid-js";
export interface ServiceAuthStatusProps {
    /** Whether to show only critical services */
    showCriticalOnly?: boolean;
    /** Whether to show progress */
    showProgress?: boolean;
    /** Whether to show retry button */
    showRetryButton?: boolean;
    /** Whether to show compact version */
    compact?: boolean;
}
export interface AuthServiceInfo {
    name: string;
    status: "available" | "unavailable" | "degraded";
    isCritical: boolean;
    lastCheck: Date;
    responseTime?: number;
    error?: string;
}
export declare const ServiceAuthStatus: Component<ServiceAuthStatusProps>;
