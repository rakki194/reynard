/**
 * Package Lifecycle Hook
 * Manages state and operations for package lifecycle management
 */

import { createSignal, createEffect, onMount, onCleanup } from "solid-js";
import type {
  PackageLifecycleInfo,
  LifecycleSummary,
  PackageLifecycleState,
} from "../types/PackageLifecycleTypes";

export function usePackageLifecycle(refreshInterval?: number) {
  const [state, setState] = createSignal<PackageLifecycleState>({
    packages: [],
    summary: {
      totalPackages: 0,
      loadedPackages: 0,
      unloadedPackages: 0,
      loadingPackages: 0,
      errorPackages: 0,
      totalMemoryUsage: 0,
      averageLoadTime: 0,
    },
    isRefreshing: false,
    searchQuery: "",
    selectedStatus: "all",
    lastUpdate: null,
  });

  let refreshTimer: ReturnType<typeof setInterval> | null = null;

  const refreshLifecycleData = async () => {
    setState((prev) => ({ ...prev, isRefreshing: true }));

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const mockPackages: PackageLifecycleInfo[] = [
        {
          name: "reynard-core",
          version: "1.0.0",
          description: "Core Reynard functionality",
          status: "loaded",
          loadTime: 150,
          memoryUsage: 45,
          lastLoaded: new Date(),
          lastUnloaded: null,
          loadCount: 1,
          dependencies: [],
          dependents: ["reynard-ui"],
        },
      ];

      const summary: LifecycleSummary = {
        totalPackages: mockPackages.length,
        loadedPackages: mockPackages.filter((p) => p.status === "loaded")
          .length,
        unloadedPackages: mockPackages.filter((p) => p.status === "unloaded")
          .length,
        loadingPackages: mockPackages.filter((p) => p.status === "loading")
          .length,
        errorPackages: mockPackages.filter((p) => p.status === "error").length,
        totalMemoryUsage: mockPackages.reduce(
          (sum, p) => sum + p.memoryUsage,
          0,
        ),
        averageLoadTime:
          mockPackages.reduce((sum, p) => sum + p.loadTime, 0) /
          mockPackages.length,
      };

      setState((prev) => ({
        ...prev,
        packages: mockPackages,
        summary,
        lastUpdate: new Date(),
        isRefreshing: false,
      }));
    } catch (error) {
      console.error("Failed to refresh lifecycle data:", error);
      setState((prev) => ({ ...prev, isRefreshing: false }));
    }
  };

  const loadPackage = async (packageName: string) => {
    setState((prev) => ({
      ...prev,
      packages: prev.packages.map((pkg) =>
        pkg.name === packageName ? { ...pkg, status: "loading" as const } : pkg,
      ),
    }));

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setState((prev) => ({
        ...prev,
        packages: prev.packages.map((pkg) =>
          pkg.name === packageName
            ? {
                ...pkg,
                status: "loaded" as const,
                lastLoaded: new Date(),
                loadCount: pkg.loadCount + 1,
              }
            : pkg,
        ),
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        packages: prev.packages.map((pkg) =>
          pkg.name === packageName
            ? {
                ...pkg,
                status: "error" as const,
                error: (error as Error).message,
              }
            : pkg,
        ),
      }));
    }
  };

  const unloadPackage = async (packageName: string) => {
    setState((prev) => ({
      ...prev,
      packages: prev.packages.map((pkg) =>
        pkg.name === packageName
          ? { ...pkg, status: "unloading" as const }
          : pkg,
      ),
    }));

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setState((prev) => ({
        ...prev,
        packages: prev.packages.map((pkg) =>
          pkg.name === packageName
            ? {
                ...pkg,
                status: "unloaded" as const,
                lastUnloaded: new Date(),
                memoryUsage: 0,
              }
            : pkg,
        ),
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        packages: prev.packages.map((pkg) =>
          pkg.name === packageName
            ? {
                ...pkg,
                status: "error" as const,
                error: (error as Error).message,
              }
            : pkg,
        ),
      }));
    }
  };

  const reloadPackage = async (packageName: string) => {
    await unloadPackage(packageName);
    await loadPackage(packageName);
  };

  const setSearchQuery = (query: string) => {
    setState((prev) => ({ ...prev, searchQuery: query }));
  };

  const setSelectedStatus = (status: string) => {
    setState((prev) => ({ ...prev, selectedStatus: status }));
  };

  onMount(() => {
    refreshLifecycleData();

    if (refreshInterval) {
      refreshTimer = setInterval(refreshLifecycleData, refreshInterval);
    }
  });

  onCleanup(() => {
    if (refreshTimer) {
      clearInterval(refreshTimer);
    }
  });

  return {
    state,
    refreshLifecycleData,
    loadPackage,
    unloadPackage,
    reloadPackage,
    setSearchQuery,
    setSelectedStatus,
  };
}
