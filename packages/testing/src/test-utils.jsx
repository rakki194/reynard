/**
 * Unified Testing Utilities for Reynard Framework
 *
 * This module provides comprehensive testing utilities that eliminate
 * duplication across Reynard packages and standardize common
 * testing patterns for components, APIs, validation, and performance.
 */
import { cleanup, render, waitFor } from "@solidjs/testing-library";
import { createComponent, createContext, createEffect, createSignal, useContext, } from "solid-js";
import { afterEach, beforeEach, expect, vi } from "vitest";
/**
 * Standard test setup that configures common testing patterns
 * including browser mocks, console suppression, and cleanup
 */
export function setupStandardTest(options = {}) {
    const { enableBrowserMocks = true, enableConsoleSuppression = true, enableCleanup = true, enableMockReset = true, } = options;
    // Browser mocks
    if (enableBrowserMocks) {
        setupBrowserMocks();
    }
    // Console suppression
    if (enableConsoleSuppression) {
        suppressConsoleWarnings();
    }
    // Mock reset
    if (enableMockReset) {
        beforeEach(() => {
            vi.clearAllMocks();
        });
    }
    // Cleanup
    if (enableCleanup) {
        afterEach(() => {
            cleanup();
        });
    }
}
/**
 * Setup browser mocks
 */
function setupBrowserMocks() {
    // Mock fetch
    global.fetch = vi.fn();
    // Mock localStorage
    const localStorageMock = {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
        length: 0,
        key: vi.fn(),
    };
    Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
    });
    // Mock sessionStorage
    const sessionStorageMock = {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
        length: 0,
        key: vi.fn(),
    };
    Object.defineProperty(window, "sessionStorage", {
        value: sessionStorageMock,
    });
    // Mock URL
    global.URL.createObjectURL = vi.fn(() => "mock-url");
    global.URL.revokeObjectURL = vi.fn();
    // Mock ResizeObserver
    global.ResizeObserver = vi.fn().mockImplementation(() => ({
        observe: vi.fn(),
        unobserve: vi.fn(),
        disconnect: vi.fn(),
    }));
    // Mock IntersectionObserver
    global.IntersectionObserver = vi.fn().mockImplementation(() => ({
        observe: vi.fn(),
        unobserve: vi.fn(),
        disconnect: vi.fn(),
    }));
}
/**
 * Suppress console warnings in tests
 */
function suppressConsoleWarnings() {
    const originalWarn = console.warn;
    console.warn = (...args) => {
        if (typeof args[0] === "string" &&
            (args[0].includes("computations created outside a `createRoot`") ||
                args[0].includes("Warning:") ||
                args[0].includes("Deprecated:"))) {
            return; // Suppress these warnings
        }
        originalWarn(...args);
    };
}
/**
 * Test component rendering with standard setup and provider support
 */
export async function testComponentRendering(Component, options = {}) {
    const { props = {}, wrapper, providers = [] } = options;
    // Render with providers
    let renderResult;
    if (providers.length > 0) {
        // Create a wrapper that nests all providers
        const Wrapper = () => {
            const componentElement = <Component {...props}/>;
            return providers.reduceRight((element, Provider) => {
                return <Provider {...{}}>{element}</Provider>;
            }, componentElement);
        };
        renderResult = render(Wrapper);
    }
    else if (wrapper) {
        // Use the provided wrapper component
        const WrapperComponent = wrapper;
        renderResult = render(() => {
            return (<WrapperComponent>
          <Component {...props}/>
        </WrapperComponent>);
        });
    }
    else {
        // Render component directly
        renderResult = render(() => <Component {...props}/>);
    }
    // Wait for component to be in DOM
    await waitFor(() => {
        expect(renderResult.container.firstChild).toBeTruthy();
    });
    return renderResult;
}
/**
 * Test component with signal updates
 */
export async function testComponentWithSignals(Component, signalUpdates, options = {}) {
    const renderResult = await testComponentRendering(Component, options);
    // Apply signal updates
    for (const update of signalUpdates) {
        update.signal = () => update.value;
        await waitFor(() => {
            expect(renderResult.container.firstChild).toBeTruthy();
        });
    }
    return renderResult;
}
/**
 * Test component error handling
 */
export async function testComponentErrorHandling(Component, errorTrigger, options = {}) {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => { });
    try {
        const renderResult = await testComponentRendering(Component, options);
        errorTrigger();
        // Wait for error to be handled
        await waitFor(() => {
            expect(consoleSpy).toHaveBeenCalled();
        });
        return renderResult;
    }
    finally {
        consoleSpy.mockRestore();
    }
}
/**
 * Test API client with standard setup and mock response handling
 */
export async function testAPIClient(apiCall, options = {}) {
    const { baseURL = "http://localhost:8000", timeout = 5000, retries = 3, mockResponse = { data: "test" }, mockError, } = options;
    // Mock fetch response
    if (mockError) {
        global.fetch.mockRejectedValueOnce(mockError);
    }
    else {
        global.fetch.mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: () => Promise.resolve(mockResponse),
            text: () => Promise.resolve(JSON.stringify(mockResponse)),
        });
    }
    // Test API call
    const result = await apiCall();
    // Verify fetch was called
    expect(global.fetch).toHaveBeenCalled();
    return result;
}
/**
 * Test API error handling
 */
export async function testAPIErrorHandling(apiCall, expectedError, options = {}) {
    const { mockError = new Error("Network error") } = options;
    // Mock fetch to reject
    global.fetch.mockRejectedValueOnce(mockError);
    // Test API call should throw
    await expect(apiCall()).rejects.toThrow(expectedError);
}
/**
 * Test API retry logic
 */
export async function testAPIRetry(apiCall, retryCount = 3, options = {}) {
    const { mockError = new Error("Network error") } = options;
    // Mock fetch to fail multiple times then succeed
    global.fetch
        .mockRejectedValueOnce(mockError)
        .mockRejectedValueOnce(mockError)
        .mockRejectedValueOnce(mockError)
        .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ data: "success" }),
    });
    const result = await apiCall();
    // Verify fetch was called retryCount + 1 times
    expect(global.fetch).toHaveBeenCalledTimes(retryCount + 1);
    return result;
}
/**
 * Test validation function with comprehensive valid/invalid value testing
 */
export function testValidation(validator, options = {}) {
    const { validValues = [], invalidValues = [], errorMessages = [] } = options;
    // Test valid values
    validValues.forEach((value) => {
        const result = validator(value);
        expect(result.isValid).toBe(true);
        expect(result.error).toBeUndefined();
    });
    // Test invalid values
    invalidValues.forEach((value, index) => {
        const result = validator(value);
        expect(result.isValid).toBe(false);
        if (errorMessages[index]) {
            expect(result.error).toContain(errorMessages[index]);
        }
    });
}
/**
 * Test validation with error throwing
 */
export function testValidationWithError(validator, invalidValues, expectedError) {
    invalidValues.forEach((value) => {
        if (expectedError) {
            expect(() => validator(value)).toThrow(expectedError);
        }
        else {
            expect(() => validator(value)).toThrow();
        }
    });
}
/**
 * Test function performance
 */
export async function testPerformance(fn, options = {}) {
    const { iterations = 1000, timeout = 5000, threshold = 100 } = options;
    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
        await fn();
    }
    const end = performance.now();
    const averageTime = (end - start) / iterations;
    expect(averageTime).toBeLessThan(threshold);
    return {
        totalTime: end - start,
        averageTime,
        iterations,
    };
}
/**
 * Test memory usage
 */
export async function testMemoryUsage(fn, options = {}) {
    const { iterations = 100, timeout = 5000 } = options;
    // Force garbage collection if available
    if (global.gc) {
        global.gc();
    }
    const initialMemory = performance.memory?.usedJSHeapSize || 0;
    for (let i = 0; i < iterations; i++) {
        await fn();
    }
    // Force garbage collection if available
    if (global.gc) {
        global.gc();
    }
    const finalMemory = performance.memory?.usedJSHeapSize || 0;
    const memoryIncrease = finalMemory - initialMemory;
    return {
        initialMemory,
        finalMemory,
        memoryIncrease,
        iterations,
    };
}
// ============================================================================
// Mock Creation Utilities
// ============================================================================
/**
 * Create mock function with comprehensive mock methods
 */
export function createMockFunction(implementation) {
    const mockFn = vi.fn(implementation);
    mockFn.mockResolvedValue = (value) => {
        mockFn.mockImplementation(() => Promise.resolve(value));
    };
    mockFn.mockRejectedValue = (error) => {
        mockFn.mockImplementation(() => Promise.reject(error));
    };
    mockFn.mockReturnValue = (value) => {
        mockFn.mockImplementation(() => value);
    };
    return mockFn;
}
/**
 * Create a mock function with additional properties for testing
 */
export function createMockFn(implementation) {
    const mockFn = vi.fn(implementation);
    // vi.fn() already provides mockClear and mockReset methods
    return mockFn;
}
/**
 * Create a mock object with all methods mocked
 */
export function createMockObject(methods) {
    const mockObject = {};
    for (const method of methods) {
        mockObject[method] = createMockFn();
    }
    return mockObject;
}
// ============================================================================
// Test Helper Utilities
// ============================================================================
/**
 * Wait for condition with timeout
 */
export async function waitForCondition(condition, timeout = 5000, interval = 100) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
        if (condition()) {
            return;
        }
        await new Promise((resolve) => setTimeout(resolve, interval));
    }
    throw new Error(`Condition not met within ${timeout}ms`);
}
/**
 * Create test data factory
 */
export function createTestDataFactory(defaultData, overrides = {}) {
    return { ...defaultData, ...overrides };
}
/**
 * Create test signal
 */
export function createTestSignal(initialValue) {
    const [signal, setSignal] = createSignal(initialValue);
    return { signal, setSignal };
}
/**
 * Create test effect
 */
export function createTestEffect(fn) {
    const cleanup = createEffect(fn);
    return cleanup;
}
// ============================================================================
// App Context & Provider Utilities
// ============================================================================
/**
 * Test-specific app context that doesn't use router primitives
 */
const TestAppContext = createContext();
const TestAppProvider = (props) => {
    // Create a mock app context that provides all the necessary properties
    const mockContext = {
        prevRoute: undefined,
        location: {
            pathname: "/test",
            search: "",
            hash: "",
            href: "/test",
            origin: "http://localhost",
            protocol: "http:",
            host: "localhost",
            hostname: "localhost",
            port: "",
            state: null,
        },
        theme: "light",
        setTheme: vi.fn(),
        instantDelete: false,
        setInstantDelete: vi.fn(),
        disableAnimations: false,
        setDisableAnimations: vi.fn(),
        disableNonsense: false,
        setDisableNonsense: vi.fn(),
        disableCollisionHandling: false,
        setDisableCollisionHandling: vi.fn(),
        jtp2: {
            threshold: 0.5,
            forceCpu: false,
            setThreshold: vi.fn(),
            setForceCpu: vi.fn(),
        },
        wdv3: {
            modelName: "",
            genThreshold: 0.5,
            setModelName: vi.fn(),
            setGenThreshold: vi.fn(),
        },
        florence2: {
            modelName: "",
            threshold: 0.5,
            setModelName: vi.fn(),
            setThreshold: vi.fn(),
        },
        joy: {
            modelName: "",
            threshold: 0.5,
            setModelName: vi.fn(),
            setThreshold: vi.fn(),
        },
    };
    return createComponent(TestAppContext.Provider, {
        value: mockContext,
        get children() {
            return props.children;
        },
    });
};
/**
 * Hook to use the test app context
 */
export function useTestAppContext() {
    const context = useContext(TestAppContext);
    if (!context) {
        throw new Error("useTestAppContext must be used within TestAppProvider");
    }
    return context;
}
// ============================================================================
// Custom Render Utilities
// ============================================================================
/**
 * Render with theme provider
 */
export function renderWithTheme(ui, theme = { name: "light", colors: {} }, options) {
    const ThemeProvider = (props) => {
        return createComponent(() => props.children, { theme });
    };
    return render(() => <ThemeProvider>{ui()}</ThemeProvider>, options);
}
/**
 * Render with router context
 */
export function renderWithRouter(ui, initialUrl = "/", options) {
    const RouterProvider = (props) => {
        // Mock router context
        const routerContext = {
            location: {
                pathname: initialUrl,
                search: "",
                hash: "",
                href: initialUrl,
                origin: "http://localhost",
                protocol: "http:",
                host: "localhost",
                hostname: "localhost",
                port: "",
                state: null,
            },
            navigate: vi.fn(),
            params: {},
            query: {},
        };
        return createComponent(() => props.children, { router: routerContext });
    };
    return render(() => <RouterProvider>{ui()}</RouterProvider>, options);
}
/**
 * Render with app context
 */
export function renderWithAppContext(ui, options) {
    return render(() => <TestAppProvider>{ui()}</TestAppProvider>, options);
}
/**
 * Render with multiple providers
 */
export function renderWithProviders(ui, providers = [], options) {
    const Wrapper = (props) => {
        return providers.reduceRight((element, Provider) => {
            return <Provider>{element}</Provider>;
        }, props.children);
    };
    return render(() => <Wrapper>{ui()}</Wrapper>, options);
}
// ============================================================================
// Unified Test Setup Functions
// ============================================================================
// Re-export all setup functions for easy access
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
// ============================================================================
// Convenience Functions
// ============================================================================
/**
 * Quick test setup with all features enabled
 */
export function quickTestSetup() {
    setupStandardTest({
        enableBrowserMocks: true,
        enableConsoleSuppression: true,
        enableCleanup: true,
        enableMockReset: true,
    });
}
/**
 * Minimal test setup with only essential features
 */
export function minimalTestSetup() {
    setupStandardTest({
        enableBrowserMocks: false,
        enableConsoleSuppression: false,
        enableCleanup: true,
        enableMockReset: true,
    });
}
/**
 * Full test setup with comprehensive testing features
 */
export function fullTestSetup() {
    setupStandardTest({
        enableBrowserMocks: true,
        enableConsoleSuppression: true,
        enableCleanup: true,
        enableMockReset: true,
    });
}
