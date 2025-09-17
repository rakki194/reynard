/**
 * PerformanceAlertsTab Component
 * Performance alerts tab for performance dashboard
 */
import { Component } from "solid-js";
export interface PerformanceAlertsTabProps {
    warnings: Array<{
        type: "critical" | "high" | "medium" | "low";
        message: string;
        value: number;
        threshold: number;
        timestamp: number;
        severity: "critical" | "high" | "medium" | "low";
    }>;
    refreshInterval?: number;
}
export declare const PerformanceAlertsTab: Component<PerformanceAlertsTabProps>;
