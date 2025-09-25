/**
 * Provider interface definitions for the Dynamic Enum System
 */

import type {
  EnumData,
  EnumValue,
  EnumMetadata,
  ValidationResult,
  EnumOperationOptions,
  EnumResult,
} from "./EnumTypes";

/**
 * Abstract base interface for enum providers
 * Each provider handles a specific type of enum (spirits, styles, traits, etc.)
 */
export interface EnumProvider {
  /**
   * Get the type of enum this provider handles
   * @returns The enum type identifier
   */
  getEnumType(): string;

  /**
   * Get all available enum values
   * @param options - Options for the operation
   * @returns Promise resolving to enum data
   */
  getEnumData(options?: EnumOperationOptions): Promise<EnumData>;

  /**
   * Get a specific enum value by key
   * @param key - The enum key to retrieve
   * @param options - Options for the operation
   * @returns Promise resolving to enum value or null
   */
  getEnumValue(key: string, options?: EnumOperationOptions): Promise<EnumValue | null>;

  /**
   * Get metadata for a specific enum value
   * @param key - The enum key
   * @returns Promise resolving to metadata or null
   */
  getMetadata(key: string): Promise<EnumMetadata | null>;

  /**
   * Validate an enum value
   * @param value - The value to validate
   * @returns Validation result
   */
  validateValue(value: string): ValidationResult;

  /**
   * Get a random enum value
   * @param options - Options for random selection
   * @returns Promise resolving to random enum result
   */
  getRandomValue(options?: EnumOperationOptions): Promise<EnumResult>;

  /**
   * Get multiple random enum values
   * @param count - Number of values to return
   * @param options - Options for random selection
   * @returns Promise resolving to array of enum results
   */
  getRandomValues(count: number, options?: EnumOperationOptions): Promise<EnumResult[]>;

  /**
   * Check if a value exists in this enum
   * @param value - The value to check
   * @returns Whether the value exists
   */
  hasValue(value: string): boolean;

  /**
   * Get all enum keys
   * @returns Array of all enum keys
   */
  getKeys(): string[];

  /**
   * Get the count of available enum values
   * @returns Number of enum values
   */
  getCount(): number;

  /**
   * Refresh the enum data from the data source
   * @returns Promise resolving when refresh is complete
   */
  refresh(): Promise<void>;

  /**
   * Check if the provider is healthy and ready
   * @returns Whether the provider is ready
   */
  isReady(): boolean;
}

/**
 * Provider factory interface for creating providers
 */
export interface EnumProviderFactory {
  /**
   * Create a new provider instance
   * @param enumType - The type of enum to create a provider for
   * @param config - Provider configuration
   * @returns New provider instance
   */
  createProvider(enumType: string, config: any): EnumProvider;

  /**
   * Get supported enum types
   * @returns Array of supported enum types
   */
  getSupportedTypes(): string[];

  /**
   * Check if a provider type is supported
   * @param enumType - The enum type to check
   * @returns Whether the type is supported
   */
  isSupported(enumType: string): boolean;
}

/**
 * Provider registry interface for managing providers
 */
export interface EnumProviderRegistry {
  /**
   * Register a provider for an enum type
   * @param enumType - The enum type
   * @param provider - The provider instance
   */
  registerProvider(enumType: string, provider: EnumProvider): void;

  /**
   * Get a provider for an enum type
   * @param enumType - The enum type
   * @returns Provider instance or null
   */
  getProvider(enumType: string): EnumProvider | null;

  /**
   * Unregister a provider
   * @param enumType - The enum type
   */
  unregisterProvider(enumType: string): void;

  /**
   * Get all registered enum types
   * @returns Array of registered enum types
   */
  getRegisteredTypes(): string[];

  /**
   * Check if a provider is registered
   * @param enumType - The enum type
   * @returns Whether a provider is registered
   */
  hasProvider(enumType: string): boolean;

  /**
   * Clear all registered providers
   */
  clear(): void;
}
