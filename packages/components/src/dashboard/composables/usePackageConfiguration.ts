/**
 * Package Configuration Hook
 * Manages state and operations for package configuration
 */

import { createSignal, createEffect, onMount } from "solid-js";
import type {
  PackageConfiguration,
  GlobalConfiguration,
  PackageConfigurationState,
} from "../types/PackageConfigurationTypes";

export function usePackageConfiguration() {
  const [state, setState] = createSignal<PackageConfigurationState>({
    packages: [],
    globalConfig: {
      autoDiscovery: true,
      autoInstall: false,
      autoUpdate: false,
      maxConcurrentInstalls: 3,
      maxConcurrentLoads: 2,
      installationTimeout: 300,
      loadTimeout: 120,
      memoryLimit: 2048,
      cacheSize: 512,
      logLevel: "info",
      enableAnalytics: true,
      enablePerformanceMonitoring: true,
      enableErrorReporting: false,
    },
    selectedPackage: null,
    isSaving: false,
    isRefreshing: false,
    searchQuery: "",
    selectedCategory: "all",
    lastUpdate: null,
  });

  const refreshConfigurationData = async () => {
    setState((prev) => ({ ...prev, isRefreshing: true }));

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const mockPackages: PackageConfiguration[] = [
        {
          name: "reynard-core",
          version: "1.0.0",
          description: "Core Reynard functionality",
          settings: [],
          isConfigured: true,
          lastModified: new Date(),
          category: "core",
        },
      ];

      setState((prev) => ({
        ...prev,
        packages: mockPackages,
        lastUpdate: new Date(),
        isRefreshing: false,
      }));
    } catch (error) {
      console.error("Failed to refresh configuration data:", error);
      setState((prev) => ({ ...prev, isRefreshing: false }));
    }
  };

  const savePackageConfiguration = async (
    packageName: string,
    settings: any[],
  ) => {
    setState((prev) => ({ ...prev, isSaving: true }));

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      setState((prev) => ({
        ...prev,
        packages: prev.packages.map((pkg) =>
          pkg.name === packageName
            ? { ...pkg, settings, isConfigured: true, lastModified: new Date() }
            : pkg,
        ),
        isSaving: false,
      }));
    } catch (error) {
      console.error("Failed to save package configuration:", error);
      setState((prev) => ({ ...prev, isSaving: false }));
    }
  };

  const saveGlobalConfiguration = async (config: GlobalConfiguration) => {
    setState((prev) => ({ ...prev, isSaving: true }));

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      setState((prev) => ({
        ...prev,
        globalConfig: config,
        isSaving: false,
      }));
    } catch (error) {
      console.error("Failed to save global configuration:", error);
      setState((prev) => ({ ...prev, isSaving: false }));
    }
  };

  const selectPackage = (packageName: string | null) => {
    setState((prev) => ({ ...prev, selectedPackage: packageName }));
  };

  const setSearchQuery = (query: string) => {
    setState((prev) => ({ ...prev, searchQuery: query }));
  };

  const setSelectedCategory = (category: string) => {
    setState((prev) => ({ ...prev, selectedCategory: category }));
  };

  onMount(() => {
    refreshConfigurationData();
  });

  return {
    state,
    refreshConfigurationData,
    savePackageConfiguration,
    saveGlobalConfiguration,
    selectPackage,
    setSearchQuery,
    setSelectedCategory,
  };
}
