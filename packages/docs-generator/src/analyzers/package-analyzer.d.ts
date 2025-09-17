/**
 * @fileoverview Package analyzer for extracting package information
 */
import type { PackageInfo, PackageConfig } from "../config/types/package";
/**
 * Analyzes a package directory and extracts information
 */
export declare class PackageAnalyzer {
    private config;
    constructor(config: PackageConfig);
    /**
     * Analyze a package directory
     */
    analyze(packagePath: string): Promise<PackageInfo>;
}
