/**
 * Core type definitions for the Dynamic Enum System
 */

import type { EnumDataProvider } from "./DataProvider";

/**
 * Represents a single enum value with optional metadata
 */
export interface EnumValue {
  /** The actual enum value */
  value: string;
  /** Weight for weighted random selection (default: 1.0) */
  weight?: number;
  /** Additional metadata for this enum value */
  metadata?: Record<string, unknown>;
}

/**
 * Collection of enum values for a specific enum type
 */
export interface EnumData {
  [key: string]: EnumValue;
}

/**
 * Standard metadata structure for enum values
 */
export interface EnumMetadata {
  /** Emoji representation of the enum value */
  emoji?: string;
  /** Human-readable description */
  description?: string;
  /** Category or classification */
  category?: string;
  /** Tags for filtering and searching */
  tags?: string[];
  /** Additional custom metadata */
  [key: string]: unknown;
}

/**
 * Configuration for enum providers
 */
export interface EnumProviderConfig {
  /** The type of enum this provider handles */
  enumType: string;
  /** Fallback data when backend is unavailable */
  fallbackData: EnumData;
  /** Default value when validation fails */
  defaultFallback: string;
  /** Cache timeout in milliseconds (optional) */
  cacheTimeout?: number;
  /** Enable performance metrics (optional) */
  enableMetrics?: boolean;
}

/**
 * Configuration for the main dynamic enum service
 */
export interface EnumServiceConfig {
  /** Enable intelligent caching (default: true) */
  enableCaching?: boolean;
  /** Cache timeout in milliseconds (default: 5 minutes) */
  cacheTimeout?: number;
  /** Fallback strategy when backend fails */
  fallbackStrategy?: "silent" | "warn" | "error";
  /** Enable performance metrics (default: true) */
  enableMetrics?: boolean;
  /** Maximum retry attempts for failed requests */
  maxRetries?: number;
  /** Custom data provider (optional) */
  dataProvider?: EnumDataProvider;
}

/**
 * Performance metrics for the enum service
 */
export interface EnumServiceMetrics {
  /** Total number of requests made */
  requests: number;
  /** Total number of validations performed */
  validations: number;
  /** Total number of random selections */
  randomSelections: number;
  /** Total number of metadata requests */
  metadataRequests: number;
  /** Number of cache hits */
  cacheHits: number;
  /** Number of cache misses */
  cacheMisses: number;
  /** Number of errors encountered */
  errors: number;
  /** Number of registered providers */
  providerCount: number;
  /** Average response time in milliseconds */
  averageResponseTime: number;
}

/**
 * Cache entry for storing enum data
 */
export interface CacheEntry<T = EnumValue> {
  /** Cached data */
  data: Record<string, T>;
  /** Timestamp when data was created */
  created: number;
  /** Timestamp when data was last accessed */
  lastAccessed: number;
  /** Number of times this entry has been accessed */
  accessCount: number;
}

/**
 * Cache configuration
 */
export interface CacheConfig {
  /** Time to live in milliseconds */
  ttl: number;
  /** Maximum age before cleanup in milliseconds */
  maxAge: number;
  /** Cleanup interval in milliseconds */
  cleanupInterval: number;
}

/**
 * Validation result for enum values
 */
export interface ValidationResult {
  /** Whether the value is valid */
  isValid: boolean;
  /** The validated value (may be different from input) */
  value: string | null;
  /** Error message if validation failed */
  error: string | null;
}

/**
 * Options for enum operations
 */
export interface EnumOperationOptions {
  /** Whether to use weighted random selection */
  weighted?: boolean;
  /** Whether to include metadata in results */
  includeMetadata?: boolean;
  /** Custom fallback value */
  fallback?: string;
}

/**
 * Result of enum operations with metadata
 */
export interface EnumResult {
  /** The enum value */
  value: string;
  /** Associated metadata */
  metadata?: EnumMetadata;
  /** Whether this came from cache */
  fromCache?: boolean;
  /** Whether this is a fallback value */
  isFallback?: boolean;
}
