/**
 * Package Lifecycle Hook
 * Manages state and operations for package lifecycle management
 */
import type { PackageLifecycleState } from "../types/PackageLifecycleTypes";
export declare function usePackageLifecycle(refreshInterval?: number): {
    state: import("solid-js").Accessor<PackageLifecycleState>;
    refreshLifecycleData: () => Promise<void>;
    loadPackage: (packageName: string) => Promise<void>;
    unloadPackage: (packageName: string) => Promise<void>;
    reloadPackage: (packageName: string) => Promise<void>;
    setSearchQuery: (query: string) => void;
    setSelectedStatus: (status: string) => void;
};
