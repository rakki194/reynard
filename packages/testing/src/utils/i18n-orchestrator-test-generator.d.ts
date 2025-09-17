/**
 * Test File Generator for i18n Package Testing
 */
import type { PackageI18nConfig } from "../config/i18n-testing-config";
/**
 * Create package-specific i18n test files
 */
export declare function createPackageI18nTestFiles(): Promise<void>;
/**
 * Generate test file content for a package
 */
export declare function generatePackageTestFile(pkg: PackageI18nConfig): string;
