/**
 * Documentation Test Runner CLI
 *
 * Command-line tool to run documentation tests across all packages
 */
export interface PackageConfig {
    name: string;
    path: string;
    docPath: string;
    setup?: string;
}
export declare const PACKAGES: PackageConfig[];
/**
 * Generate documentation test files for all packages
 */
export declare function generateAllDocTests(rootPath?: string): void;
/**
 * Validate all documentation examples
 */
export declare function validateAllDocs(rootPath?: string): void;
/**
 * Run documentation tests for a specific package
 */
export declare function runPackageDocTests(packageName: string, rootPath?: string): void;
/**
 * Run documentation tests for all packages
 */
export declare function runAllDocTests(rootPath?: string): {
    package: string;
    success: boolean;
    error?: string;
}[];
/**
 * CLI interface
 */
export declare function main(): void;
