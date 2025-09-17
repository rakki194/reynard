/**
 * Browser API mocks for testing
 */
/**
 * Mock localStorage
 */
export declare const mockLocalStorage: {
    getItem: import("vitest").Mock<(...args: any[]) => any>;
    setItem: import("vitest").Mock<(...args: any[]) => any>;
    removeItem: import("vitest").Mock<(...args: any[]) => any>;
    clear: import("vitest").Mock<(...args: any[]) => any>;
    length: number;
    key: import("vitest").Mock<(...args: any[]) => any>;
};
/**
 * Mock sessionStorage
 */
export declare const mockSessionStorage: {
    getItem: import("vitest").Mock<(...args: any[]) => any>;
    setItem: import("vitest").Mock<(...args: any[]) => any>;
    removeItem: import("vitest").Mock<(...args: any[]) => any>;
    clear: import("vitest").Mock<(...args: any[]) => any>;
    length: number;
    key: import("vitest").Mock<(...args: any[]) => any>;
};
/**
 * Mock matchMedia
 */
export declare const mockMatchMedia: import("vitest").Mock<(query: string) => {
    matches: boolean;
    media: string;
    onchange: null;
    addListener: import("vitest").Mock<(...args: any[]) => any>;
    removeListener: import("vitest").Mock<(...args: any[]) => any>;
    addEventListener: import("vitest").Mock<(...args: any[]) => any>;
    removeEventListener: import("vitest").Mock<(...args: any[]) => any>;
    dispatchEvent: import("vitest").Mock<(...args: any[]) => any>;
}>;
/**
 * Mock ResizeObserver
 */
export declare const mockResizeObserver: import("vitest").Mock<(...args: any[]) => any>;
/**
 * Mock IntersectionObserver
 */
export declare const mockIntersectionObserver: import("vitest").Mock<(...args: any[]) => any>;
/**
 * Mock MutationObserver
 */
export declare const mockMutationObserver: import("vitest").Mock<(...args: any[]) => any>;
/**
 * Mock PerformanceObserver
 */
export declare const mockPerformanceObserver: import("vitest").Mock<(...args: any[]) => any>;
/**
 * Mock requestAnimationFrame
 */
export declare const mockRequestAnimationFrame: import("vitest").Mock<(cb: FrameRequestCallback) => number>;
/**
 * Mock cancelAnimationFrame
 */
export declare const mockCancelAnimationFrame: import("vitest").Mock<(id: number) => void>;
/**
 * Mock fetch
 */
export declare const mockFetch: import("vitest").Mock<(_url?: string) => Promise<{
    ok: boolean;
    status: number;
    json: import("vitest").Mock<(...args: any[]) => any>;
    text: import("vitest").Mock<(...args: any[]) => any>;
    blob: import("vitest").Mock<(...args: any[]) => any>;
    arrayBuffer: import("vitest").Mock<(...args: any[]) => any>;
    formData: import("vitest").Mock<(...args: any[]) => any>;
    clone: import("vitest").Mock<(...args: any[]) => any>;
}>>;
/**
 * Mock WebSocket
 */
export declare const mockWebSocket: import("vitest").Mock<(...args: any[]) => any>;
/**
 * Mock EventSource
 */
export declare const mockEventSource: import("vitest").Mock<(...args: any[]) => any>;
/**
 * Mock crypto
 */
export declare const mockCrypto: {
    randomUUID: import("vitest").Mock<(...args: any[]) => any>;
    getRandomValues: import("vitest").Mock<(...args: any[]) => any>;
    subtle: SubtleCrypto;
};
/**
 * Mock performance
 */
export declare const mockPerformance: {
    now: import("vitest").Mock<(...args: any[]) => any>;
    mark: import("vitest").Mock<(...args: any[]) => any>;
    measure: import("vitest").Mock<(...args: any[]) => any>;
    getEntriesByType: import("vitest").Mock<(...args: any[]) => any>;
    getEntriesByName: import("vitest").Mock<(...args: any[]) => any>;
    clearMarks: import("vitest").Mock<(...args: any[]) => any>;
    clearMeasures: import("vitest").Mock<(...args: any[]) => any>;
    clearResourceTimings: import("vitest").Mock<(...args: any[]) => any>;
    getEntries: import("vitest").Mock<(...args: any[]) => any>;
    toJSON: import("vitest").Mock<(...args: any[]) => any>;
};
/**
 * Mock URL
 */
export declare const mockURL: import("vitest").Mock<(...args: any[]) => any>;
/**
 * Mock URLSearchParams
 */
export declare const mockURLSearchParams: import("vitest").Mock<(...args: any[]) => any>;
/**
 * Mock FormData
 */
export declare const mockFormData: import("vitest").Mock<(...args: any[]) => any>;
/**
 * Mock Headers
 */
export declare const mockHeaders: import("vitest").Mock<(...args: any[]) => any>;
/**
 * Mock AbortController
 */
export declare const mockAbortController: import("vitest").Mock<(...args: any[]) => any>;
/**
 * Mock AbortSignal
 */
export declare const mockAbortSignal: import("vitest").Mock<(...args: any[]) => any>;
/**
 * Mock navigator
 */
export declare const mockNavigator: {
    userAgent: string;
    language: string;
    languages: string[];
    platform: string;
    onLine: boolean;
    cookieEnabled: boolean;
    doNotTrack: string;
    maxTouchPoints: number;
    hardwareConcurrency: number;
    deviceMemory: number;
    connection: {
        effectiveType: string;
        downlink: number;
        rtt: number;
    };
    geolocation: {
        getCurrentPosition: import("vitest").Mock<(...args: any[]) => any>;
        watchPosition: import("vitest").Mock<(...args: any[]) => any>;
        clearWatch: import("vitest").Mock<(...args: any[]) => any>;
    };
    mediaDevices: {
        getUserMedia: import("vitest").Mock<(...args: any[]) => any>;
        enumerateDevices: import("vitest").Mock<(...args: any[]) => any>;
    };
    clipboard: {
        readText: import("vitest").Mock<(...args: any[]) => any>;
        writeText: import("vitest").Mock<(...args: any[]) => any>;
        read: import("vitest").Mock<(...args: any[]) => any>;
        write: import("vitest").Mock<(...args: any[]) => any>;
    };
    permissions: {
        query: import("vitest").Mock<(...args: any[]) => any>;
        request: import("vitest").Mock<(...args: any[]) => any>;
    };
    serviceWorker: {
        register: import("vitest").Mock<(...args: any[]) => any>;
        getRegistration: import("vitest").Mock<(...args: any[]) => any>;
        getRegistrations: import("vitest").Mock<(...args: any[]) => any>;
    };
};
/**
 * Mock window
 */
export declare const mockWindow: {
    innerWidth: number;
    innerHeight: number;
    outerWidth: number;
    outerHeight: number;
    devicePixelRatio: number;
    screen: {
        width: number;
        height: number;
        availWidth: number;
        availHeight: number;
        colorDepth: number;
        pixelDepth: number;
    };
    location: {
        href: string;
        origin: string;
        protocol: string;
        host: string;
        hostname: string;
        port: string;
        pathname: string;
        search: string;
        hash: string;
        assign: import("vitest").Mock<(...args: any[]) => any>;
        replace: import("vitest").Mock<(...args: any[]) => any>;
        reload: import("vitest").Mock<(...args: any[]) => any>;
    };
    history: {
        length: number;
        state: null;
        back: import("vitest").Mock<(...args: any[]) => any>;
        forward: import("vitest").Mock<(...args: any[]) => any>;
        go: import("vitest").Mock<(...args: any[]) => any>;
        pushState: import("vitest").Mock<(...args: any[]) => any>;
        replaceState: import("vitest").Mock<(...args: any[]) => any>;
    };
    document: {
        title: string;
        body: {
            scrollTop: number;
            scrollLeft: number;
        };
        documentElement: {
            scrollTop: number;
            scrollLeft: number;
        };
    };
    addEventListener: import("vitest").Mock<(...args: any[]) => any>;
    removeEventListener: import("vitest").Mock<(...args: any[]) => any>;
    dispatchEvent: import("vitest").Mock<(...args: any[]) => any>;
    open: import("vitest").Mock<(...args: any[]) => any>;
    close: import("vitest").Mock<(...args: any[]) => any>;
    focus: import("vitest").Mock<(...args: any[]) => any>;
    blur: import("vitest").Mock<(...args: any[]) => any>;
    scroll: import("vitest").Mock<(...args: any[]) => any>;
    scrollTo: import("vitest").Mock<(...args: any[]) => any>;
    scrollBy: import("vitest").Mock<(...args: any[]) => any>;
    alert: import("vitest").Mock<(...args: any[]) => any>;
    confirm: import("vitest").Mock<(...args: any[]) => any>;
    prompt: import("vitest").Mock<(...args: any[]) => any>;
    setTimeout: import("vitest").Mock<(...args: any[]) => any>;
    clearTimeout: import("vitest").Mock<(...args: any[]) => any>;
    setInterval: import("vitest").Mock<(...args: any[]) => any>;
    clearInterval: import("vitest").Mock<(...args: any[]) => any>;
    requestAnimationFrame: import("vitest").Mock<(cb: FrameRequestCallback) => number>;
    cancelAnimationFrame: import("vitest").Mock<(id: number) => void>;
    fetch: import("vitest").Mock<(_url?: string) => Promise<{
        ok: boolean;
        status: number;
        json: import("vitest").Mock<(...args: any[]) => any>;
        text: import("vitest").Mock<(...args: any[]) => any>;
        blob: import("vitest").Mock<(...args: any[]) => any>;
        arrayBuffer: import("vitest").Mock<(...args: any[]) => any>;
        formData: import("vitest").Mock<(...args: any[]) => any>;
        clone: import("vitest").Mock<(...args: any[]) => any>;
    }>>;
    WebSocket: import("vitest").Mock<(...args: any[]) => any>;
    EventSource: import("vitest").Mock<(...args: any[]) => any>;
    crypto: {
        randomUUID: import("vitest").Mock<(...args: any[]) => any>;
        getRandomValues: import("vitest").Mock<(...args: any[]) => any>;
        subtle: SubtleCrypto;
    };
    performance: {
        now: import("vitest").Mock<(...args: any[]) => any>;
        mark: import("vitest").Mock<(...args: any[]) => any>;
        measure: import("vitest").Mock<(...args: any[]) => any>;
        getEntriesByType: import("vitest").Mock<(...args: any[]) => any>;
        getEntriesByName: import("vitest").Mock<(...args: any[]) => any>;
        clearMarks: import("vitest").Mock<(...args: any[]) => any>;
        clearMeasures: import("vitest").Mock<(...args: any[]) => any>;
        clearResourceTimings: import("vitest").Mock<(...args: any[]) => any>;
        getEntries: import("vitest").Mock<(...args: any[]) => any>;
        toJSON: import("vitest").Mock<(...args: any[]) => any>;
    };
    URL: import("vitest").Mock<(...args: any[]) => any>;
    URLSearchParams: import("vitest").Mock<(...args: any[]) => any>;
    FormData: import("vitest").Mock<(...args: any[]) => any>;
    Headers: import("vitest").Mock<(...args: any[]) => any>;
    AbortController: import("vitest").Mock<(...args: any[]) => any>;
    AbortSignal: import("vitest").Mock<(...args: any[]) => any>;
    navigator: {
        userAgent: string;
        language: string;
        languages: string[];
        platform: string;
        onLine: boolean;
        cookieEnabled: boolean;
        doNotTrack: string;
        maxTouchPoints: number;
        hardwareConcurrency: number;
        deviceMemory: number;
        connection: {
            effectiveType: string;
            downlink: number;
            rtt: number;
        };
        geolocation: {
            getCurrentPosition: import("vitest").Mock<(...args: any[]) => any>;
            watchPosition: import("vitest").Mock<(...args: any[]) => any>;
            clearWatch: import("vitest").Mock<(...args: any[]) => any>;
        };
        mediaDevices: {
            getUserMedia: import("vitest").Mock<(...args: any[]) => any>;
            enumerateDevices: import("vitest").Mock<(...args: any[]) => any>;
        };
        clipboard: {
            readText: import("vitest").Mock<(...args: any[]) => any>;
            writeText: import("vitest").Mock<(...args: any[]) => any>;
            read: import("vitest").Mock<(...args: any[]) => any>;
            write: import("vitest").Mock<(...args: any[]) => any>;
        };
        permissions: {
            query: import("vitest").Mock<(...args: any[]) => any>;
            request: import("vitest").Mock<(...args: any[]) => any>;
        };
        serviceWorker: {
            register: import("vitest").Mock<(...args: any[]) => any>;
            getRegistration: import("vitest").Mock<(...args: any[]) => any>;
            getRegistrations: import("vitest").Mock<(...args: any[]) => any>;
        };
    };
    localStorage: {
        getItem: import("vitest").Mock<(...args: any[]) => any>;
        setItem: import("vitest").Mock<(...args: any[]) => any>;
        removeItem: import("vitest").Mock<(...args: any[]) => any>;
        clear: import("vitest").Mock<(...args: any[]) => any>;
        length: number;
        key: import("vitest").Mock<(...args: any[]) => any>;
    };
    sessionStorage: {
        getItem: import("vitest").Mock<(...args: any[]) => any>;
        setItem: import("vitest").Mock<(...args: any[]) => any>;
        removeItem: import("vitest").Mock<(...args: any[]) => any>;
        clear: import("vitest").Mock<(...args: any[]) => any>;
        length: number;
        key: import("vitest").Mock<(...args: any[]) => any>;
    };
    matchMedia: import("vitest").Mock<(query: string) => {
        matches: boolean;
        media: string;
        onchange: null;
        addListener: import("vitest").Mock<(...args: any[]) => any>;
        removeListener: import("vitest").Mock<(...args: any[]) => any>;
        addEventListener: import("vitest").Mock<(...args: any[]) => any>;
        removeEventListener: import("vitest").Mock<(...args: any[]) => any>;
        dispatchEvent: import("vitest").Mock<(...args: any[]) => any>;
    }>;
    ResizeObserver: import("vitest").Mock<(...args: any[]) => any>;
    IntersectionObserver: import("vitest").Mock<(...args: any[]) => any>;
    MutationObserver: import("vitest").Mock<(...args: any[]) => any>;
    PerformanceObserver: import("vitest").Mock<(...args: any[]) => any>;
};
/**
 * Setup all browser mocks
 */
export declare function setupBrowserMocks(): void;
/**
 * Reset all browser mocks
 */
export declare function resetBrowserMocks(): void;
