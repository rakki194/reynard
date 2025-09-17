/**
 * ServiceHealthIndicator Component
 * Visual health indicator for service status
 */
import { Component } from "solid-js";
export interface ServiceHealthIndicatorProps {
    /** Health status */
    health: "healthy" | "degraded" | "unhealthy" | "unknown";
    /** Whether to show compact version */
    compact?: boolean;
    /** Custom size */
    size?: "sm" | "md" | "lg";
}
export declare const ServiceHealthIndicator: Component<ServiceHealthIndicatorProps>;
