/**
 * Debug Components Index
 * 
 * Exports all debug and performance monitoring components
 */

// Main Performance Dashboard
export { PerformanceDashboard } from "./PerformanceDashboard";
export type { PerformanceDashboardProps, PerformanceWarning, PerformanceHistory } from "./PerformanceDashboard";

// Performance Dashboard Tabs
export { PerformanceOverviewTab } from "./PerformanceOverviewTab";
export type { PerformanceOverviewTabProps } from "./PerformanceOverviewTab";

export { PerformanceMetricsTab } from "./PerformanceMetricsTab";
export type { PerformanceMetricsTabProps } from "./PerformanceMetricsTab";

export { PerformanceMemoryTab } from "./PerformanceMemoryTab";
export type { PerformanceMemoryTabProps } from "./PerformanceMemoryTab";

export { PerformanceAlertsTab } from "./PerformanceAlertsTab";
export type { PerformanceAlertsTabProps } from "./PerformanceAlertsTab";

export { PerformanceExportTab } from "./PerformanceExportTab";
export type { PerformanceExportTabProps } from "./PerformanceExportTab";
