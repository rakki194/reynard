/**
 * Reynard Dashboard Package
 * Integration package that combines charts and components for comprehensive dashboards
 */

// Export dashboard components
export * from "./components";

// Re-export commonly used types and utilities
export type { RealTimeDataPoint, StatisticalData, QualityData, QualityMetric } from "reynard-charts";
export type { ButtonProps, ToggleProps, SliderProps } from "reynard-components";
