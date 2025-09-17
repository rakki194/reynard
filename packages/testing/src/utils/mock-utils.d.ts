/**
 * Utility functions for creating and managing mocks in tests
 */
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
 * Create a mock API response
 */
export declare function createMockResponse(data: any, options?: {
    status?: number;
    statusText?: string;
    headers?: Record<string, string>;
}): Response;
/**
 * Create a mock fetch function
 */
export declare function createMockFetch(responses?: Record<string, unknown>): typeof fetch;
/**
 * Create a mock WebSocket
 */
export declare function createMockWebSocket(): WebSocket;
/**
 * Create a mock EventSource (Server-Sent Events)
 */
export declare function createMockEventSource(): EventSource;
/**
 * Create a mock File object
 */
export declare function createMockFile(name: string, content: string | Blob, options?: {
    type?: string;
    lastModified?: number;
}): File;
/**
 * Create a mock FileList
 */
export declare function createMockFileList(files: File[]): FileList;
/**
 * Create a mock DataTransfer object
 */
export declare function createMockDataTransfer(files?: File[]): DataTransfer;
/**
 * Create a mock IntersectionObserver
 */
export declare function createMockIntersectionObserver(entries?: IntersectionObserverEntry[]): typeof IntersectionObserver;
/**
 * Create a mock ResizeObserver
 */
export declare function createMockResizeObserver(): typeof ResizeObserver;
/**
 * Create a mock MutationObserver
 */
export declare function createMockMutationObserver(): typeof MutationObserver;
/**
 * Create a mock PerformanceObserver
 */
export declare function createMockPerformanceObserver(): typeof PerformanceObserver;
/**
 * Create a mock crypto object
 */
export declare function createMockCrypto(): Crypto;
/**
 * Create a mock matchMedia function
 */
export declare function createMockMatchMedia(matches?: boolean): typeof window.matchMedia;
/**
 * Create a mock requestAnimationFrame
 */
export declare function createMockRequestAnimationFrame(): typeof requestAnimationFrame;
/**
 * Create a mock cancelAnimationFrame
 */
export declare function createMockCancelAnimationFrame(): typeof cancelAnimationFrame;
