/**
 * 🦊 Smart Import Composable
 * 
 * SolidJS composable for smart imports with fallback support.
 * Provides reactive state management for package availability and imports.
 * 
 * @author Agile-Prime-90 (Reynard Lizard Specialist)
 * @since 1.0.0
 */

import { createSignal, createMemo, createEffect, onCleanup } from "solid-js";
import { SmartImportSystem, SmartImportConfig, SmartImportResult, PackageAvailability } from "./SmartImportSystem";

export interface UseSmartImportOptions {
  /** Package name to import */
  packageName: string;
  /** Fallback module to use if import fails */
  fallbackModule?: any;
  /** Smart import configuration */
  config?: Partial<SmartImportConfig>;
  /** Whether to auto-import on mount */
  autoImport?: boolean;
  /** Retry configuration */
  retry?: {
    enabled: boolean;
    maxAttempts: number;
    delay: number;
  };
}

export interface UseSmartImportReturn<T> {
  /** Whether the import is currently loading */
  isLoading: () => boolean;
  /** Whether the import was successful */
  isSuccess: () => boolean;
  /** Whether the import failed */
  isError: () => boolean;
  /** Whether fallback was used */
  usedFallback: () => boolean;
  /** The imported module or fallback */
  module: () => T | null;
  /** Error message if import failed */
  error: () => string | null;
  /** Package availability status */
  availability: () => PackageAvailability | null;
  /** Import duration in milliseconds */
  duration: () => number;
  /** Manually trigger import */
  import: () => Promise<SmartImportResult<T>>;
  /** Retry failed import */
  retry: () => Promise<SmartImportResult<T>>;
  /** Clear cache and retry */
  refresh: () => Promise<SmartImportResult<T>>;
}

/**
 * Smart import composable with reactive state management
 */
export function useSmartImport<T>(options: UseSmartImportOptions): UseSmartImportReturn<T> {
  const {
    packageName,
    fallbackModule,
    config = {},
    autoImport = true,
    retry = { enabled: true, maxAttempts: 3, delay: 1000 },
  } = options;

  // Get or create smart import system
  const smartImportSystem = new SmartImportSystem({
    useFallback: true,
    enableCaching: true,
    importTimeout: 5000,
    enableLogging: false,
    ...config,
  });

  // Reactive state
  const [isLoading, setIsLoading] = createSignal(false);
  const [isSuccess, setIsSuccess] = createSignal(false);
  const [isError, setIsError] = createSignal(false);
  const [usedFallback, setUsedFallback] = createSignal(false);
  const [module, setModule] = createSignal<T | null>(null);
  const [error, setError] = createSignal<string | null>(null);
  const [availability, setAvailability] = createSignal<PackageAvailability | null>(null);
  const [duration, setDuration] = createSignal(0);

  // Computed state
  const canRetry = createMemo(() => {
    const avail = availability();
    return avail && !avail.isAvailable && avail.shouldRetry && retry.enabled;
  });

  // Import function
  const performImport = async (): Promise<SmartImportResult<T>> => {
    setIsLoading(true);
    setIsError(false);
    setError(null);

    try {
      const result = await smartImportSystem.smartImport<T>(packageName, fallbackModule);
      
      setIsSuccess(result.success);
      setIsError(!result.success);
      setUsedFallback(result.usedFallback);
      setModule(result.module);
      setError(result.error);
      setDuration(result.duration);

      // Update availability
      const avail = smartImportSystem.getPackageAvailability(packageName);
      setAvailability(avail);

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setIsSuccess(false);
      setIsError(true);
      setUsedFallback(false);
      setModule(null);
      setError(errorMessage);
      setDuration(0);

      return {
        success: false,
        module: null,
        error: errorMessage,
        usedFallback: false,
        duration: 0,
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Retry function
  const retryImport = async (): Promise<SmartImportResult<T>> => {
    if (!canRetry()) {
      throw new Error("Retry not available or disabled");
    }

    // Clear availability cache to force recheck
    smartImportSystem.clearAvailabilityCache();
    
    return performImport();
  };

  // Refresh function (clear cache and retry)
  const refreshImport = async (): Promise<SmartImportResult<T>> => {
    smartImportSystem.clearCache();
    smartImportSystem.clearAvailabilityCache();
    
    return performImport();
  };

  // Auto-import on mount
  createEffect(() => {
    if (autoImport) {
      performImport();
    }
  });

  // Cleanup on unmount
  onCleanup(() => {
    smartImportSystem.cleanup();
  });

  return {
    isLoading,
    isSuccess,
    isError,
    usedFallback,
    module,
    error,
    availability,
    duration,
    import: performImport,
    retry: retryImport,
    refresh: refreshImport,
  };
}

/**
 * Hook for checking package availability without importing
 */
export function usePackageAvailability(packageName: string, config?: Partial<SmartImportConfig>) {
  const [availability, setAvailability] = createSignal<PackageAvailability | null>(null);
  const [isChecking, setIsChecking] = createSignal(false);

  const smartImportSystem = new SmartImportSystem(config);

  const checkAvailability = async (): Promise<PackageAvailability> => {
    setIsChecking(true);
    try {
      const result = await smartImportSystem.checkPackageAvailability(packageName);
      setAvailability(result);
      return result;
    } finally {
      setIsChecking(false);
    }
  };

  // Auto-check on mount
  createEffect(() => {
    checkAvailability();
  });

  // Cleanup on unmount
  onCleanup(() => {
    smartImportSystem.cleanup();
  });

  return {
    availability,
    isChecking,
    checkAvailability,
  };
}

/**
 * Hook for multiple package availability checks
 */
export function useMultiplePackageAvailability(
  packageNames: string[],
  config?: Partial<SmartImportConfig>
) {
  const [availabilities, setAvailabilities] = createSignal<Map<string, PackageAvailability>>(new Map());
  const [isChecking, setIsChecking] = createSignal(false);

  const smartImportSystem = new SmartImportSystem(config);

  const checkAllAvailability = async (): Promise<Map<string, PackageAvailability>> => {
    setIsChecking(true);
    try {
      const results = new Map<string, PackageAvailability>();
      
      await Promise.all(
        packageNames.map(async (packageName) => {
          const result = await smartImportSystem.checkPackageAvailability(packageName);
          results.set(packageName, result);
        })
      );

      setAvailabilities(results);
      return results;
    } finally {
      setIsChecking(false);
    }
  };

  const checkPackageAvailability = async (packageName: string): Promise<PackageAvailability> => {
    const result = await smartImportSystem.checkPackageAvailability(packageName);
    setAvailabilities(prev => new Map(prev).set(packageName, result));
    return result;
  };

  // Auto-check all on mount
  createEffect(() => {
    checkAllAvailability();
  });

  // Cleanup on unmount
  onCleanup(() => {
    smartImportSystem.cleanup();
  });

  return {
    availabilities,
    isChecking,
    checkAllAvailability,
    checkPackageAvailability,
  };
}
