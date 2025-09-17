/**
 * Dependency Checker
 *
 * Utility for checking module availability and dependencies in Reynard's
 * caption generation system. Provides runtime dependency validation
 * without importing heavy modules.
 */
export interface DependencyInfo {
    name: string;
    available: boolean;
    version?: string;
    error?: string;
}
export interface DependencyCheckResult {
    allAvailable: boolean;
    dependencies: DependencyInfo[];
    missingDependencies: string[];
}
export declare class DependencyChecker {
    private static _cache;
    /**
     * Check if a module is available without importing it.
     *
     * @param moduleName - Name of the module to check
     * @returns True if the module is available, False otherwise
     */
    static isModuleAvailable(moduleName: string): boolean;
    /**
     * Check multiple dependencies at once.
     *
     * @param moduleNames - Array of module names to check
     * @returns Result object with availability information
     */
    static checkDependencies(moduleNames: string[]): DependencyCheckResult;
    /**
     * Check a single dependency with caching.
     *
     * @param moduleName - Name of the module to check
     * @returns Dependency information object
     */
    static checkDependency(moduleName: string): DependencyInfo;
    /**
     * Get cached dependency information.
     *
     * @param moduleName - Name of the module
     * @returns Cached dependency info or undefined
     */
    static getCachedDependency(moduleName: string): DependencyInfo | undefined;
    /**
     * Clear the dependency cache.
     */
    static clearCache(): void;
    /**
     * Check common ML dependencies.
     *
     * @returns Result for common ML packages
     */
    static checkMLDependencies(): DependencyCheckResult;
    /**
     * Check dependencies for a specific generator type.
     *
     * @param generatorType - Type of generator (jtp2, florence2, etc.)
     * @returns Result for generator-specific dependencies
     */
    static checkGeneratorDependencies(generatorType: string): DependencyCheckResult;
    /**
     * Validate that all required dependencies are available.
     *
     * @param requiredDeps - Array of required module names
     * @throws Error if any dependencies are missing
     */
    static validateDependencies(requiredDeps: string[]): void;
}
