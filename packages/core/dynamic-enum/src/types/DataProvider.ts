/**
 * Data provider interface for fetching enum data from various sources
 */

import type { EnumData, EnumValue } from './EnumTypes';

/**
 * Abstract interface for data providers
 * Implementations can fetch data from APIs, databases, files, etc.
 */
export interface EnumDataProvider {
  /**
   * Fetch enum data for a specific enum type
   * @param enumType - The type of enum to fetch
   * @returns Promise resolving to enum data
   */
  fetchEnumData(enumType: string): Promise<EnumData>;

  /**
   * Check if the provider is available/healthy
   * @returns Promise resolving to availability status
   */
  isAvailable(): Promise<boolean>;

  /**
   * Get the name/identifier of this provider
   * @returns Provider name
   */
  getProviderName(): string;
}

/**
 * API-based data provider configuration
 */
export interface APIDataProviderConfig {
  /** Base URL for the API */
  baseUrl: string;
  /** API endpoint for fetching enum data */
  endpoint: string;
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Authentication headers */
  headers?: Record<string, string>;
  /** Request retry configuration */
  retryConfig?: {
    maxRetries: number;
    retryDelay: number;
    backoffMultiplier: number;
  };
}

/**
 * File-based data provider configuration
 */
export interface FileDataProviderConfig {
  /** Path to the data file */
  filePath: string;
  /** File format (json, yaml, etc.) */
  format: 'json' | 'yaml' | 'toml';
  /** Whether to watch for file changes */
  watch?: boolean;
}

/**
 * Database data provider configuration
 */
export interface DatabaseDataProviderConfig {
  /** Database connection string */
  connectionString: string;
  /** Table name containing enum data */
  tableName: string;
  /** Column mappings */
  columns: {
    key: string;
    value: string;
    weight?: string;
    metadata?: string;
  };
}

/**
 * Composite data provider configuration
 * Combines multiple providers with fallback logic
 */
export interface CompositeDataProviderConfig {
  /** Primary data provider */
  primary: EnumDataProvider;
  /** Fallback data providers in order of preference */
  fallbacks: EnumDataProvider[];
  /** Strategy for handling provider failures */
  failureStrategy: 'fail-fast' | 'try-all' | 'best-effort';
}
