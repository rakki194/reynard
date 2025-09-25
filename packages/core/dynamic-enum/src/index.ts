/**
 * Dynamic Enum System for TypeScript
 *
 * A modular, provider-based system for managing dynamic enums with intelligent caching,
 * fallback strategies, and comprehensive validation.
 */

// Main service
export { DynamicEnumService } from "./DynamicEnumService";

// Core components
export * from "./core";

// Providers
export * from "./providers";

// Adapters
export * from "./adapters";

// Utilities
export * from "./utils";

// Types
export * from "./types";

// Re-export commonly used types for convenience
export type {
  EnumData,
  EnumValue,
  EnumMetadata,
  EnumServiceConfig,
  EnumServiceMetrics,
  ValidationResult,
  EnumResult,
  EnumOperationOptions,
} from "./types/EnumTypes";

export type { EnumProvider, EnumProviderFactory, EnumProviderRegistry } from "./types/Provider";

export type {
  EnumDataProvider,
  APIDataProviderConfig,
  FileDataProviderConfig,
  CompositeDataProviderConfig,
} from "./types/DataProvider";
