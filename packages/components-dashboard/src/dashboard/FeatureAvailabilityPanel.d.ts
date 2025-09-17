/**
 * FeatureAvailabilityPanel Component
 * Feature availability monitoring with categories and priorities
 */
import { Component } from "solid-js";
export interface FeatureAvailabilityPanelProps {
    /** Whether to show feature categories */
    showCategories?: boolean;
    /** Whether to show feature priorities */
    showPriorities?: boolean;
    /** Whether to show feature dependencies */
    showDependencies?: boolean;
}
export interface FeatureInfo {
    name: string;
    category: string;
    priority: "critical" | "high" | "medium" | "low";
    status: "available" | "degraded" | "unavailable";
    dependencies: string[];
    description: string;
    lastCheck: Date;
    healthScore: number;
}
export declare const FeatureAvailabilityPanel: Component<FeatureAvailabilityPanelProps>;
