/**
 * Package Configuration Hook
 * Manages state and operations for package configuration
 */
import type { GlobalConfiguration, PackageConfigurationState } from "../types/PackageConfigurationTypes";
export declare function usePackageConfiguration(): {
    state: import("solid-js").Accessor<PackageConfigurationState>;
    refreshConfigurationData: () => Promise<void>;
    savePackageConfiguration: (packageName: string, settings: any[]) => Promise<void>;
    saveGlobalConfiguration: (config: GlobalConfiguration) => Promise<void>;
    selectPackage: (packageName: string | null) => void;
    setSearchQuery: (query: string) => void;
    setSelectedCategory: (category: string) => void;
};
