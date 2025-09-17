/**
 * Test Environment Configuration
 * Provides utilities for managing different DOM testing environments
 */
export type DOMEnvironment = 'happy-dom' | 'jsdom' | 'browser';
export interface TestEnvironmentConfig {
    environment: DOMEnvironment;
    fallbackToJsdom: boolean;
    skipFocusTests: boolean;
    skipComputedStyleTests: boolean;
}
/**
 * Default configuration for the testing environment
 */
export declare const defaultTestConfig: TestEnvironmentConfig;
/**
 * Get the current test environment configuration
 */
export declare function getTestEnvironmentConfig(): TestEnvironmentConfig;
/**
 * Check if the current environment supports a specific feature
 */
export declare function supportsFeature(feature: 'focus' | 'computedStyles' | 'documentContains'): boolean;
/**
 * Skip test if feature is not supported
 */
export declare function skipIfUnsupported(feature: 'focus' | 'computedStyles' | 'documentContains'): void;
/**
 * Get environment-specific test utilities
 */
export declare function getEnvironmentUtils(): {
    config: TestEnvironmentConfig;
    supportsFocus: boolean;
    supportsComputedStyles: boolean;
    supportsDocumentContains: boolean;
    skipIfUnsupported: typeof skipIfUnsupported;
};
