/**
 * i18n Testing Configuration Utilities
 * Helper functions for working with i18n testing configuration
 */
import type { PackageI18nConfig } from "./types.js";
/**
 * Get configuration for a specific package
 */
export declare function getPackageI18nConfig(packageName: string): PackageI18nConfig | undefined;
/**
 * Get all enabled packages for i18n testing
 */
export declare function getEnabledPackages(): PackageI18nConfig[];
/**
 * Get all package paths for i18n testing
 */
export declare function getEnabledPackagePaths(): string[];
/**
 * Get all namespaces used across packages
 */
export declare function getAllNamespaces(): string[];
