/**
 * SolidJS-specific mocks for testing
 */
/**
 * Mock SolidJS router
 */
export declare const mockRouter: {
    location: {
        pathname: string;
        search: string;
        hash: string;
        href: string;
        origin: string;
        protocol: string;
        host: string;
        hostname: string;
        port: string;
        state: null;
    };
    navigate: import("vitest").Mock<(...args: any[]) => any>;
    params: {};
    query: {};
};
/**
 * Mock SolidJS context
 */
export declare const mockContext: {
    theme: {
        name: string;
        colors: {};
    };
    notifications: never[];
    addNotification: import("vitest").Mock<(...args: any[]) => any>;
    removeNotification: import("vitest").Mock<(...args: any[]) => any>;
    clearNotifications: import("vitest").Mock<(...args: any[]) => any>;
};
/**
 * Mock SolidJS resource
 */
export declare function createMockSolidResource<T>(data: T): {
    loading: boolean;
    error: undefined;
    latest: T;
    state: "ready";
    mutate: import("vitest").Mock<(...args: any[]) => any>;
    refetch: import("vitest").Mock<(...args: any[]) => any>;
};
