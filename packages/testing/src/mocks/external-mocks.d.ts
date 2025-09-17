/**
 * External library mocks for testing
 */
/**
 * Mock Fabric.js
 */
export declare const mockFabric: {
    Canvas: import("vitest").Mock<(...args: any[]) => any>;
    Rect: import("vitest").Mock<(...args: any[]) => any>;
};
/**
 * Mock Monaco Editor
 */
export declare const mockMonaco: {
    editor: {
        create: import("vitest").Mock<(...args: any[]) => any>;
        setModel: import("vitest").Mock<(...args: any[]) => any>;
        getModel: import("vitest").Mock<(...args: any[]) => any>;
        dispose: import("vitest").Mock<(...args: any[]) => any>;
    };
    languages: {
        register: import("vitest").Mock<(...args: any[]) => any>;
        setLanguageConfiguration: import("vitest").Mock<(...args: any[]) => any>;
    };
};
/**
 * Mock D3.js
 */
export declare const mockD3: {
    select: import("vitest").Mock<() => {
        append: import("vitest").Mock<(...args: any[]) => any>;
        attr: import("vitest").Mock<(...args: any[]) => any>;
        style: import("vitest").Mock<(...args: any[]) => any>;
        data: import("vitest").Mock<(...args: any[]) => any>;
        enter: import("vitest").Mock<(...args: any[]) => any>;
        exit: import("vitest").Mock<(...args: any[]) => any>;
        remove: import("vitest").Mock<(...args: any[]) => any>;
        transition: import("vitest").Mock<(...args: any[]) => any>;
        duration: import("vitest").Mock<(...args: any[]) => any>;
        delay: import("vitest").Mock<(...args: any[]) => any>;
        ease: import("vitest").Mock<(...args: any[]) => any>;
    }>;
    scaleLinear: import("vitest").Mock<() => {
        domain: import("vitest").Mock<(...args: any[]) => any>;
        range: import("vitest").Mock<(...args: any[]) => any>;
    }>;
    scaleBand: import("vitest").Mock<() => {
        domain: import("vitest").Mock<(...args: any[]) => any>;
        range: import("vitest").Mock<(...args: any[]) => any>;
        padding: import("vitest").Mock<(...args: any[]) => any>;
    }>;
};
