import type { Plugin } from "vite";
export interface VitestConfigOptions {
    packageName: string;
    setupFiles?: string[];
    additionalPlugins?: Plugin[];
    coverageThresholds?: {
        branches?: number;
        functions?: number;
        lines?: number;
        statements?: number;
    };
    excludeFromCoverage?: string[];
}
/**
 * Base Vitest configuration for all Reynard packages
 * Provides common settings and can be extended by individual packages
 */
export declare const createBaseVitestConfig: (options?: VitestConfigOptions) => import("vite").UserConfig;
/**
 * Standard Vitest configuration for component testing
 */
export declare const createComponentTestConfig: (packageName: string) => import("vite").UserConfig;
/**
 * Standard Vitest configuration for utility/algorithm testing
 */
export declare const createUtilityTestConfig: (packageName: string) => import("vite").UserConfig;
/**
 * Standard Vitest configuration for integration testing
 */
export declare const createIntegrationTestConfig: (packageName: string) => import("vite").UserConfig;
