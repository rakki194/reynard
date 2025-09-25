/**
 * Abstract base class for enum providers
 */

import type {
  EnumProvider,
  EnumData,
  EnumValue,
  EnumMetadata,
  ValidationResult,
  EnumOperationOptions,
  EnumResult,
  EnumProviderConfig,
} from "../types";
import type { EnumDataProvider } from "../types/DataProvider";

/**
 * Abstract base class that provides common functionality for enum providers
 */
export abstract class BaseEnumProvider implements EnumProvider {
  protected enumType: string;
  protected fallbackData: EnumData;
  protected defaultFallback: string;
  protected cacheTimeout?: number;
  protected enableMetrics: boolean;
  protected dataProvider?: EnumDataProvider;
  protected cachedData?: EnumData;
  protected lastFetchTime?: number;
  protected metrics: {
    requests: number;
    cacheHits: number;
    cacheMisses: number;
    errors: number;
    lastResponseTime: number;
  };

  constructor(config: EnumProviderConfig, dataProvider?: EnumDataProvider) {
    this.enumType = config.enumType;
    this.fallbackData = config.fallbackData;
    this.defaultFallback = config.defaultFallback;
    this.cacheTimeout = config.cacheTimeout;
    this.enableMetrics = config.enableMetrics ?? true;
    this.dataProvider = dataProvider;

    this.metrics = {
      requests: 0,
      cacheHits: 0,
      cacheMisses: 0,
      errors: 0,
      lastResponseTime: 0,
    };
  }

  /**
   * Get the type of enum this provider handles
   */
  getEnumType(): string {
    return this.enumType;
  }

  /**
   * Get all available enum values
   */
  async getEnumData(options?: EnumOperationOptions): Promise<EnumData> {
    const startTime = Date.now();
    this.metrics.requests++;

    try {
      // Check cache first
      if (this.isCacheValid()) {
        this.metrics.cacheHits++;
        this.metrics.lastResponseTime = Date.now() - startTime;
        return this.cachedData!;
      }

      // Fetch fresh data
      this.metrics.cacheMisses++;
      const data = await this.fetchEnumData();
      this.cachedData = data;
      this.lastFetchTime = Date.now();
      this.metrics.lastResponseTime = Date.now() - startTime;

      return data;
    } catch (error) {
      this.metrics.errors++;
      this.metrics.lastResponseTime = Date.now() - startTime;

      // Return fallback data on error
      return this.fallbackData;
    }
  }

  /**
   * Get a specific enum value by key
   */
  async getEnumValue(key: string, options?: EnumOperationOptions): Promise<EnumValue | null> {
    const data = await this.getEnumData(options);
    return data[key] || null;
  }

  /**
   * Get metadata for a specific enum value
   */
  async getMetadata(key: string): Promise<EnumMetadata | null> {
    const enumValue = await this.getEnumValue(key);
    return (enumValue?.metadata as EnumMetadata) || null;
  }

  /**
   * Validate an enum value
   */
  validateValue(value: string): ValidationResult {
    if (!value || typeof value !== "string") {
      return {
        isValid: false,
        value: null,
        error: "Value must be a non-empty string",
      };
    }

    // Check if value exists in current data or fallback
    const currentData = this.cachedData || this.fallbackData;
    const isValid = Object.values(currentData).some(enumValue => enumValue.value === value);

    if (!isValid) {
      return {
        isValid: false,
        value: null,
        error: `Value '${value}' is not valid for enum type '${this.enumType}'`,
      };
    }

    return {
      isValid: true,
      value,
      error: null,
    };
  }

  /**
   * Get a random enum value
   */
  async getRandomValue(options?: EnumOperationOptions): Promise<EnumResult> {
    const data = await this.getEnumData(options);
    const keys = Object.keys(data);

    if (keys.length === 0) {
      return {
        value: this.defaultFallback,
        isFallback: true,
      };
    }

    const selectedKey = this.selectRandomKey(keys, data, options?.weighted);
    const enumValue = data[selectedKey];

    return {
      value: enumValue.value,
      metadata: enumValue.metadata as EnumMetadata,
      fromCache: this.isCacheValid(),
    };
  }

  /**
   * Get multiple random enum values
   */
  async getRandomValues(count: number, options?: EnumOperationOptions): Promise<EnumResult[]> {
    const results: EnumResult[] = [];
    const data = await this.getEnumData(options);
    const keys = Object.keys(data);

    if (keys.length === 0) {
      return Array(count).fill({
        value: this.defaultFallback,
        isFallback: true,
      });
    }

    for (let i = 0; i < count; i++) {
      const selectedKey = this.selectRandomKey(keys, data, options?.weighted);
      const enumValue = data[selectedKey];

      results.push({
        value: enumValue.value,
        metadata: enumValue.metadata as EnumMetadata,
        fromCache: this.isCacheValid(),
      });
    }

    return results;
  }

  /**
   * Check if a value exists in this enum
   */
  hasValue(value: string): boolean {
    const currentData = this.cachedData || this.fallbackData;
    return Object.values(currentData).some(enumValue => enumValue.value === value);
  }

  /**
   * Get all enum keys
   */
  getKeys(): string[] {
    const currentData = this.cachedData || this.fallbackData;
    return Object.keys(currentData);
  }

  /**
   * Get the count of available enum values
   */
  getCount(): number {
    const currentData = this.cachedData || this.fallbackData;
    return Object.keys(currentData).length;
  }

  /**
   * Refresh the enum data from the data source
   */
  async refresh(): Promise<void> {
    try {
      const data = await this.fetchEnumData();
      this.cachedData = data;
      this.lastFetchTime = Date.now();
    } catch (error) {
      // Keep existing cache on refresh failure
      console.warn(`Failed to refresh enum data for ${this.enumType}:`, error);
    }
  }

  /**
   * Check if the provider is healthy and ready
   */
  isReady(): boolean {
    return this.cachedData !== undefined || Object.keys(this.fallbackData).length > 0;
  }

  /**
   * Get performance metrics
   */
  getMetrics() {
    return { ...this.metrics };
  }

  /**
   * Abstract method to fetch enum data from the data source
   */
  protected abstract fetchEnumData(): Promise<EnumData>;

  /**
   * Check if the cache is still valid
   */
  protected isCacheValid(): boolean {
    if (!this.cachedData || !this.lastFetchTime) {
      return false;
    }

    if (!this.cacheTimeout) {
      return true;
    }

    return Date.now() - this.lastFetchTime < this.cacheTimeout;
  }

  /**
   * Select a random key using weighted or uniform selection
   */
  protected selectRandomKey(keys: string[], data: EnumData, weighted = false): string {
    if (!weighted) {
      return keys[Math.floor(Math.random() * keys.length)];
    }

    // Weighted selection
    const totalWeight = keys.reduce((sum, key) => {
      return sum + (data[key].weight || 1.0);
    }, 0);

    let random = Math.random() * totalWeight;

    for (const key of keys) {
      const weight = data[key].weight || 1.0;
      random -= weight;
      if (random <= 0) {
        return key;
      }
    }

    // Fallback to last key
    return keys[keys.length - 1];
  }
}
