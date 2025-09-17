/**
 * Charts package i18n utilities
 * Provides optional i18n support with fallback translations
 */
/**
 * Translation function for charts package
 * Uses core i18n with charts-specific fallbacks
 */
export declare function t(key: string, params?: Record<string, unknown>): string;
/**
 * Get chart type display name
 */
export declare function getChartTypeName(chartType: string): string;
/**
 * Get axis label with fallback
 */
export declare function getAxisLabel(axis: "x" | "y", customLabel?: string): string;
/**
 * Get loading message for specific chart type
 */
export declare function getLoadingMessage(chartType?: string): string;
/**
 * Get quality assessment text
 */
export declare function getQualityText(quality: "excellent" | "good" | "fair" | "poor"): string;
/**
 * Get statistics label
 */
export declare function getStatisticsLabel(stat: string): string;
export { isI18nAvailable, getI18nModule, createMockI18n } from "reynard-core";
