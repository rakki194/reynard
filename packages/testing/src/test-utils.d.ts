/**
 * Unified Testing Utilities for Reynard Framework
 *
 * This module provides comprehensive testing utilities that eliminate
 * duplication across Reynard packages and standardize common
 * testing patterns for components, APIs, validation, and performance.
 */
import { render } from "@solidjs/testing-library";
import { Component, JSX } from "solid-js";
export interface TestSetupOptions {
    enableBrowserMocks?: boolean;
    enableConsoleSuppression?: boolean;
    enableCleanup?: boolean;
    enableMockReset?: boolean;
}
/**
 * Standard test setup that configures common testing patterns
 * including browser mocks, console suppression, and cleanup
 */
export declare function setupStandardTest(options?: TestSetupOptions): void;
export interface ComponentTestOptions {
    props?: Record<string, unknown>;
    wrapper?: Component<any>;
    providers?: Component<any>[];
}
/**
 * Test component rendering with standard setup and provider support
 */
export declare function testComponentRendering<T extends Component<any>>(Component: T, options?: ComponentTestOptions): Promise<ReturnType<typeof render>>;
/**
 * Test component with signal updates
 */
export declare function testComponentWithSignals<T extends Component<any>>(Component: T, signalUpdates: Array<{
    signal: () => any;
    value: any;
}>, options?: ComponentTestOptions): Promise<ReturnType<typeof render>>;
/**
 * Test component error handling
 */
export declare function testComponentErrorHandling<T extends Component<any>>(Component: T, errorTrigger: () => void, options?: ComponentTestOptions): Promise<ReturnType<typeof render>>;
export interface APITestOptions {
    baseURL?: string;
    timeout?: number;
    retries?: number;
    mockResponse?: any;
    mockError?: Error;
}
/**
 * Test API client with standard setup and mock response handling
 */
export declare function testAPIClient(apiCall: () => Promise<any>, options?: APITestOptions): Promise<any>;
/**
 * Test API error handling
 */
export declare function testAPIErrorHandling(apiCall: () => Promise<any>, expectedError: string | RegExp, options?: APITestOptions): Promise<void>;
/**
 * Test API retry logic
 */
export declare function testAPIRetry(apiCall: () => Promise<any>, retryCount?: number, options?: APITestOptions): Promise<any>;
export interface ValidationTestOptions {
    validValues?: any[];
    invalidValues?: any[];
    errorMessages?: string[];
}
/**
 * Test validation function with comprehensive valid/invalid value testing
 */
export declare function testValidation(validator: (value: any) => {
    isValid: boolean;
    error?: string;
}, options?: ValidationTestOptions): void;
/**
 * Test validation with error throwing
 */
export declare function testValidationWithError(validator: (value: any) => void, invalidValues: any[], expectedError?: string | RegExp): void;
export interface PerformanceTestOptions {
    iterations?: number;
    timeout?: number;
    threshold?: number;
}
/**
 * Test function performance
 */
export declare function testPerformance(fn: () => void | Promise<void>, options?: PerformanceTestOptions): Promise<{
    totalTime: number;
    averageTime: number;
    iterations: number;
}>;
/**
 * Test memory usage
 */
export declare function testMemoryUsage(fn: () => void | Promise<void>, options?: PerformanceTestOptions): Promise<{
    initialMemory: any;
    finalMemory: any;
    memoryIncrease: number;
    iterations: number;
}>;
/**
 * Create mock function with comprehensive mock methods
 */
export declare function createMockFunction<T extends (...args: any[]) => any>(implementation?: T): T & {
    mockResolvedValue: (value: any) => void;
    mockRejectedValue: (error: any) => void;
    mockReturnValue: (value: any) => void;
};
/**
 * Create a mock function with additional properties for testing
 */
export declare function createMockFn<T extends (...args: any[]) => any>(implementation?: T): T & {
    mockClear: () => void;
    mockReset: () => void;
};
/**
 * Create a mock object with all methods mocked
 */
export declare function createMockObject<T extends Record<string, unknown>>(methods: (keyof T)[]): {
    [K in keyof T]: T[K] extends (...args: any[]) => any ? T[K] & {
        mockClear: () => void;
        mockReset: () => void;
        mockReturnValue: (value: ReturnType<T[K]>) => any;
    } : T[K];
};
/**
 * Wait for condition with timeout
 */
export declare function waitForCondition(condition: () => boolean, timeout?: number, interval?: number): Promise<void>;
/**
 * Create test data factory
 */
export declare function createTestDataFactory<T>(defaultData: T, overrides?: Partial<T>): T;
/**
 * Create test signal
 */
export declare function createTestSignal<T>(initialValue: T): {
    signal: import("solid-js").Accessor<T>;
    setSignal: import("solid-js").Setter<T>;
};
/**
 * Create test effect
 */
export declare function createTestEffect(fn: () => void): void;
/**
 * Hook to use the test app context
 */
export declare function useTestAppContext(): any;
/**
 * Render with theme provider
 */
export declare function renderWithTheme(ui: () => JSX.Element, theme?: any, options?: Omit<Parameters<typeof render>[1], "wrapper">): ReturnType<typeof render>;
/**
 * Render with router context
 */
export declare function renderWithRouter(ui: () => JSX.Element, initialUrl?: string, options?: Omit<Parameters<typeof render>[1], "wrapper">): ReturnType<typeof render>;
/**
 * Render with app context
 */
export declare function renderWithAppContext(ui: () => JSX.Element, options?: Omit<Parameters<typeof render>[1], "wrapper">): ReturnType<typeof render>;
/**
 * Render with multiple providers
 */
export declare function renderWithProviders(ui: () => JSX.Element, providers?: Component<any>[], options?: Omit<Parameters<typeof render>[1], "wrapper">): ReturnType<typeof render>;
export { setupBaseTest, suppressConsoleWarnings } from "./setup/base-setup";
export { setupBrowserTest } from "./setup/browser-setup";
export { setupCoreTest } from "./setup/core-setup";
export { setupConnectionTest } from "./setup/connection-setup";
export { setupAITest } from "./setup/ai-setup";
export { setupCanvasTest } from "./setup/canvas-setup";
export { setup3DTest } from "./setup/3d-setup";
export { setupComponentTest } from "./setup/component-setup";
export { setupGalleryTest } from "./setup/gallery-setup";
export { setupMediaTest } from "./setup/media-setup";
export { setupBackendTest } from "./setup/backend-setup";
/**
 * Quick test setup with all features enabled
 */
export declare function quickTestSetup(): void;
/**
 * Minimal test setup with only essential features
 */
export declare function minimalTestSetup(): void;
/**
 * Full test setup with comprehensive testing features
 */
export declare function fullTestSetup(): void;
