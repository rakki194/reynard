import { vi } from "vitest";
/**
 * Utility functions for creating and managing mocks in tests
 */
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
    const mockObj = {};
    methods.forEach((method) => {
        mockObj[method] = createMockFn();
    });
    return mockObj;
}
/**
 * Create a mock API response
 */
export function createMockResponse(data, options = {}) {
    const { status = 200, statusText = "OK", headers = {} } = options;
    return {
        ok: status >= 200 && status < 300,
        status,
        statusText,
        headers: new Headers(headers),
        json: vi.fn().mockResolvedValue(data),
        text: vi.fn().mockResolvedValue(JSON.stringify(data)),
        blob: vi.fn().mockResolvedValue(new Blob([JSON.stringify(data)])),
        arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(0)),
        formData: vi.fn().mockResolvedValue(new FormData()),
        clone: vi.fn().mockReturnThis(),
        redirected: false,
        type: "basic",
        url: "",
        body: null,
        bodyUsed: false,
        bytes: vi.fn().mockResolvedValue(new Uint8Array()),
    };
}
/**
 * Create a mock fetch function
 */
export function createMockFetch(responses = {}) {
    return vi.fn().mockImplementation((url) => {
        const urlString = url.toString();
        const response = responses[urlString] || responses["*"] || { data: {} };
        if (response instanceof Error) {
            return Promise.reject(response);
        }
        return Promise.resolve(createMockResponse(response.data, response.options));
    });
}
/**
 * Create a mock WebSocket
 */
export function createMockWebSocket() {
    const mockWs = {
        readyState: 0, // CONNECTING
        url: "",
        protocol: "",
        extensions: "",
        bufferedAmount: 0,
        binaryType: "blob",
        onopen: null,
        onclose: null,
        onmessage: null,
        onerror: null,
        close: vi.fn(),
        send: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn().mockReturnValue(true),
    };
    // Simulate connection
    setTimeout(() => {
        mockWs.readyState = 1; // OPEN
        if (mockWs.onopen) {
            mockWs.onopen(new Event("open"));
        }
    }, 0);
    return mockWs;
}
/**
 * Create a mock EventSource (Server-Sent Events)
 */
export function createMockEventSource() {
    const mockEs = {
        readyState: 0, // CONNECTING
        url: "",
        withCredentials: false,
        onopen: null,
        onmessage: null,
        onerror: null,
        close: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn().mockReturnValue(true),
    };
    // Simulate connection
    setTimeout(() => {
        mockEs.readyState = 1; // OPEN
        if (mockEs.onopen) {
            mockEs.onopen(new Event("open"));
        }
    }, 0);
    return mockEs;
}
/**
 * Create a mock File object
 */
export function createMockFile(name, content, options = {}) {
    const { type = "text/plain", lastModified = Date.now() } = options;
    const blob = content instanceof Blob ? content : new Blob([content], { type });
    return Object.assign(blob, {
        name,
        lastModified,
        webkitRelativePath: "",
    });
}
/**
 * Create a mock FileList
 */
export function createMockFileList(files) {
    const fileList = {
        length: files.length,
        item: (index) => files[index] || null,
        [Symbol.iterator]: function* () {
            for (const file of files) {
                yield file;
            }
        },
    };
    // Add numeric indices
    files.forEach((file, index) => {
        fileList[index] = file;
    });
    return fileList;
}
/**
 * Create a mock DataTransfer object
 */
export function createMockDataTransfer(files = []) {
    return {
        dropEffect: "none",
        effectAllowed: "none",
        items: {
            length: files.length,
            add: vi.fn(),
            clear: vi.fn(),
            remove: vi.fn(),
            [Symbol.iterator]: function* () {
                for (let i = 0; i < files.length; i++) {
                    yield {
                        kind: "file",
                        type: files[i].type,
                        getAsFile: () => files[i],
                        getAsString: vi.fn(),
                    };
                }
            },
        },
        files: createMockFileList(files),
        types: files.length > 0 ? ["Files"] : [],
        getData: vi.fn().mockReturnValue(""),
        setData: vi.fn(),
        clearData: vi.fn(),
        setDragImage: vi.fn(),
    };
}
/**
 * Create a mock IntersectionObserver
 */
export function createMockIntersectionObserver(entries = []) {
    const MockIntersectionObserver = vi.fn().mockImplementation((callback) => {
        return {
            observe: vi.fn(),
            unobserve: vi.fn(),
            disconnect: vi.fn(),
            root: null,
            rootMargin: "",
            thresholds: [],
        };
    });
    MockIntersectionObserver.mockReturnValue = vi.fn();
    return MockIntersectionObserver;
}
/**
 * Create a mock ResizeObserver
 */
export function createMockResizeObserver() {
    return vi.fn().mockImplementation(() => ({
        observe: vi.fn(),
        unobserve: vi.fn(),
        disconnect: vi.fn(),
    }));
}
/**
 * Create a mock MutationObserver
 */
export function createMockMutationObserver() {
    return vi.fn().mockImplementation(() => ({
        observe: vi.fn(),
        disconnect: vi.fn(),
        takeRecords: vi.fn().mockReturnValue([]),
    }));
}
/**
 * Create a mock PerformanceObserver
 */
export function createMockPerformanceObserver() {
    return vi.fn().mockImplementation(() => ({
        observe: vi.fn(),
        disconnect: vi.fn(),
        takeRecords: vi.fn().mockReturnValue([]),
    }));
}
/**
 * Create a mock crypto object
 */
export function createMockCrypto() {
    return {
        randomUUID: vi.fn().mockReturnValue("00000000-0000-4000-8000-000000000000"),
        getRandomValues: vi.fn().mockImplementation((array) => {
            for (let i = 0; i < array.length; i++) {
                array[i] = Math.floor(Math.random() * 256);
            }
            return array;
        }),
        subtle: {},
    };
}
/**
 * Create a mock matchMedia function
 */
export function createMockMatchMedia(matches = false) {
    return vi.fn().mockImplementation((query) => ({
        matches,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    }));
}
/**
 * Create a mock requestAnimationFrame
 */
export function createMockRequestAnimationFrame() {
    return vi.fn().mockImplementation((callback) => {
        setTimeout(() => callback(performance.now()), 0);
        return 1;
    });
}
/**
 * Create a mock cancelAnimationFrame
 */
export function createMockCancelAnimationFrame() {
    return vi.fn().mockImplementation((id) => {
        clearTimeout(id);
    });
}
