/**
 * Summary and Reporting for i18n Package Testing
 */
import type { PackageI18nTestResult, GlobalI18nTestResult } from "./i18n-orchestrator-types";
/**
 * Generate summary statistics
 */
export declare function generateSummary(packageResults: PackageI18nTestResult[]): GlobalI18nTestResult["summary"];
/**
 * Generate global test report
 */
export declare function generateGlobalReport(packageResults: PackageI18nTestResult[], summary: GlobalI18nTestResult["summary"], duration: number): string;
