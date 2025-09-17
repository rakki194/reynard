/**
 * Core i18n Package Testing Orchestrator
 * Main coordination logic for i18n testing across all Reynard packages
 */
import { type PackageI18nConfig } from "../config/i18n-testing-config";
import type { PackageI18nTestResult, GlobalI18nTestResult } from "./i18n-orchestrator-types";
/**
 * Run i18n tests for all enabled packages
 */
export declare function runAllPackageI18nTests(): Promise<GlobalI18nTestResult>;
/**
 * Run i18n tests for a specific package
 */
export declare function runPackageI18nTests(pkg: PackageI18nConfig): Promise<PackageI18nTestResult>;
