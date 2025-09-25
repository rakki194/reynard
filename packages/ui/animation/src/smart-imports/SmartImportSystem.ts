/**
 * 🦊 Smart Import System
 *
 * Provides intelligent import system for the Reynard animation package with:
 * - Dynamic import with fallbacks
 * - Package availability detection
 * - Graceful degradation
 * - Error handling for missing packages
 *
 * @author Agile-Prime-90 (Reynard Lizard Specialist)
 * @since 1.0.0
 */

import { createSignal, createMemo, createEffect, onCleanup } from "solid-js";

export interface SmartImportConfig {
  /** Whether to use fallback when package is unavailable */
  useFallback: boolean;
  /** Whether to cache import results */
  enableCaching: boolean;
  /** Timeout for import attempts in milliseconds */
  importTimeout: number;
  /** Whether to log import attempts */
  enableLogging: boolean;
}

export interface SmartImportResult<T> {
  /** Whether the import was successful */
  success: boolean;
  /** The imported module or null if failed */
  module: T | null;
  /** Error message if import failed */
  error: string | null;
  /** Whether fallback was used */
  usedFallback: boolean;
  /** Import duration in milliseconds */
  duration: number;
}

export interface PackageAvailability {
  /** Whether the package is available */
  isAvailable: boolean;
  /** Last check timestamp */
  lastChecked: number;
  /** Number of failed attempts */
  failedAttempts: number;
  /** Whether to retry import */
  shouldRetry: boolean;
}

/**
 * Smart import system for handling optional dependencies
 */
export class SmartImportSystem {
  private config: SmartImportConfig;
  private packageAvailability = new Map<string, PackageAvailability>();
  private importCache = new Map<string, any>();
  private retryTimeouts = new Map<string, NodeJS.Timeout>();

  constructor(config: Partial<SmartImportConfig> = {}) {
    this.config = {
      useFallback: true,
      enableCaching: true,
      importTimeout: 5000,
      enableLogging: false,
      ...config,
    };
  }

  /**
   * Check if a package is available
   */
  async checkPackageAvailability(packageName: string): Promise<PackageAvailability> {
    const cached = this.packageAvailability.get(packageName);
    const now = Date.now();

    // Return cached result if recent (within 30 seconds)
    if (cached && now - cached.lastChecked < 30000) {
      return cached;
    }

    const startTime = performance.now();

    try {
      // Try to dynamically import the package
      await Promise.race([
        import(packageName),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Import timeout")), this.config.importTimeout)),
      ]);

      const availability: PackageAvailability = {
        isAvailable: true,
        lastChecked: now,
        failedAttempts: 0,
        shouldRetry: false,
      };

      this.packageAvailability.set(packageName, availability);

      if (this.config.enableLogging) {
        console.log(
          `🦊 SmartImport: Package ${packageName} is available (${(performance.now() - startTime).toFixed(2)}ms)`
        );
      }

      return availability;
    } catch (error) {
      const failedAttempts = (cached?.failedAttempts || 0) + 1;
      const shouldRetry = failedAttempts < 3; // Retry up to 3 times

      const availability: PackageAvailability = {
        isAvailable: false,
        lastChecked: now,
        failedAttempts,
        shouldRetry,
      };

      this.packageAvailability.set(packageName, availability);

      if (this.config.enableLogging) {
        console.warn(`🦊 SmartImport: Package ${packageName} unavailable (attempt ${failedAttempts}):`, error);
      }

      // Schedule retry if needed
      if (shouldRetry) {
        this.scheduleRetry(packageName, failedAttempts);
      }

      return availability;
    }
  }

  /**
   * Smart import with fallback support
   */
  async smartImport<T>(
    packageName: string,
    fallbackModule?: T,
    options: { force?: boolean; timeout?: number } = {}
  ): Promise<SmartImportResult<T>> {
    const startTime = performance.now();
    const timeout = options.timeout || this.config.importTimeout;

    // Check cache first
    if (this.config.enableCaching && !options.force) {
      const cached = this.importCache.get(packageName);
      if (cached) {
        return {
          success: true,
          module: cached,
          error: null,
          usedFallback: false,
          duration: 0,
        };
      }
    }

    try {
      // Try to import the package
      const module = await Promise.race([
        import(packageName),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Import timeout")), timeout)),
      ]);

      const duration = performance.now() - startTime;

      // Cache successful import
      if (this.config.enableCaching) {
        this.importCache.set(packageName, module);
      }

      // Update availability
      this.packageAvailability.set(packageName, {
        isAvailable: true,
        lastChecked: Date.now(),
        failedAttempts: 0,
        shouldRetry: false,
      });

      if (this.config.enableLogging) {
        console.log(`🦊 SmartImport: Successfully imported ${packageName} (${duration.toFixed(2)}ms)`);
      }

      return {
        success: true,
        module: module as T,
        error: null,
        usedFallback: false,
        duration,
      };
    } catch (error) {
      const duration = performance.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);

      // Use fallback if available
      if (this.config.useFallback && fallbackModule) {
        if (this.config.enableLogging) {
          console.warn(`🦊 SmartImport: Using fallback for ${packageName}:`, errorMessage);
        }

        return {
          success: true,
          module: fallbackModule,
          error: null,
          usedFallback: true,
          duration,
        };
      }

      // Update availability with failure
      const cached = this.packageAvailability.get(packageName);
      const failedAttempts = (cached?.failedAttempts || 0) + 1;

      this.packageAvailability.set(packageName, {
        isAvailable: false,
        lastChecked: Date.now(),
        failedAttempts,
        shouldRetry: failedAttempts < 3,
      });

      if (this.config.enableLogging) {
        console.error(`🦊 SmartImport: Failed to import ${packageName}:`, errorMessage);
      }

      return {
        success: false,
        module: null,
        error: errorMessage,
        usedFallback: false,
        duration,
      };
    }
  }

  /**
   * Get package availability status
   */
  getPackageAvailability(packageName: string): PackageAvailability | null {
    return this.packageAvailability.get(packageName) || null;
  }

  /**
   * Clear import cache
   */
  clearCache(): void {
    this.importCache.clear();
    if (this.config.enableLogging) {
      console.log("🦊 SmartImport: Cache cleared");
    }
  }

  /**
   * Clear package availability cache
   */
  clearAvailabilityCache(): void {
    this.packageAvailability.clear();
    if (this.config.enableLogging) {
      console.log("🦊 SmartImport: Availability cache cleared");
    }
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<SmartImportConfig>): void {
    this.config = { ...this.config, ...newConfig };
    if (this.config.enableLogging) {
      console.log("🦊 SmartImport: Configuration updated", this.config);
    }
  }

  /**
   * Schedule retry for failed package
   */
  private scheduleRetry(packageName: string, attempt: number): void {
    // Clear existing timeout
    const existingTimeout = this.retryTimeouts.get(packageName);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Calculate retry delay (exponential backoff)
    const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);

    const timeout = setTimeout(() => {
      this.retryTimeouts.delete(packageName);
      this.checkPackageAvailability(packageName);
    }, delay);

    this.retryTimeouts.set(packageName, timeout);

    if (this.config.enableLogging) {
      console.log(`🦊 SmartImport: Scheduled retry for ${packageName} in ${delay}ms (attempt ${attempt})`);
    }
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    // Clear all timeouts
    this.retryTimeouts.forEach(timeout => clearTimeout(timeout));
    this.retryTimeouts.clear();

    // Clear caches
    this.clearCache();
    this.clearAvailabilityCache();

    if (this.config.enableLogging) {
      console.log("🦊 SmartImport: System cleaned up");
    }
  }
}

// Global smart import system instance
let globalSmartImportSystem: SmartImportSystem | null = null;

/**
 * Get or create the global smart import system
 */
export function getSmartImportSystem(config?: Partial<SmartImportConfig>): SmartImportSystem {
  if (!globalSmartImportSystem) {
    globalSmartImportSystem = new SmartImportSystem(config);
  }
  return globalSmartImportSystem;
}

/**
 * Create a new smart import system instance
 */
export function createSmartImportSystem(config?: Partial<SmartImportConfig>): SmartImportSystem {
  return new SmartImportSystem(config);
}

/**
 * Cleanup the global smart import system
 */
export function cleanupSmartImportSystem(): void {
  if (globalSmartImportSystem) {
    globalSmartImportSystem.cleanup();
    globalSmartImportSystem = null;
  }
}
