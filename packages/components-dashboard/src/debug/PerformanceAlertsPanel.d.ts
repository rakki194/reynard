/**
 * PerformanceAlertsPanel Component
 * Performance alerts and warnings management
 */
import { Component } from "solid-js";
export interface PerformanceAlertsPanelProps {
    /** Performance warnings */
    warnings: Array<{
        id: string;
        type: "critical" | "high" | "medium" | "low";
        message: string;
        value: number;
        threshold: number;
        timestamp: number;
        severity: "critical" | "high" | "medium" | "low";
    }>;
    /** Auto-refresh interval in milliseconds */
    refreshInterval?: number;
}
export interface PerformanceAlert {
    id: string;
    type: "critical" | "high" | "medium" | "low";
    message: string;
    value: number;
    threshold: number;
    timestamp: number;
    severity: "critical" | "high" | "medium" | "low";
    acknowledged: boolean;
    resolved: boolean;
    category: string;
    impact: string;
    recommendation: string;
}
export interface AlertSummary {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    acknowledged: number;
    resolved: number;
    unresolved: number;
}
export declare const PerformanceAlertsPanel: Component<PerformanceAlertsPanelProps>;
