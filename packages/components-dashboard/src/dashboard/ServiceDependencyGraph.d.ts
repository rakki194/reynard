/**
 * ServiceDependencyGraph Component
 * Service dependency graph visualization
 */
import { Component } from "solid-js";
export interface ServiceDependencyGraphProps {
    /** Service name to show dependencies for */
    serviceName: string;
    /** Whether to show compact version */
    compact?: boolean;
}
export interface ServiceDependency {
    name: string;
    status: "running" | "stopped" | "starting" | "stopping" | "failed";
    health: "healthy" | "degraded" | "unhealthy" | "unknown";
    isRequired: boolean;
}
export declare const ServiceDependencyGraph: Component<ServiceDependencyGraphProps>;
