/**
 * Main Dynamic Enum Service
 */

import type { 
  EnumServiceConfig, 
  EnumServiceMetrics, 
  EnumData, 
  EnumValue, 
  EnumResult,
  EnumOperationOptions,
  ValidationResult
} from './types';
import type { EnumProvider } from './types/Provider';
import type { EnumDataProvider } from './types/DataProvider';

import { DynamicEnumProviderRegistry } from './core/EnumProviderRegistry';
import { DynamicEnumProviderFactory } from './core/EnumProviderFactory';
import { CacheManager } from './utils/CacheManager';
import { FallbackManager } from './utils/FallbackManager';
import { ValidationUtils } from './utils/ValidationUtils';

import { SpiritEnumProvider } from './providers/SpiritEnumProvider';
import { StyleEnumProvider } from './providers/StyleEnumProvider';
import { TraitEnumProvider } from './providers/TraitEnumProvider';
import { CustomEnumProvider } from './providers/CustomEnumProvider';

/**
 * Main service for managing dynamic enums
 */
export class DynamicEnumService {
  private config: EnumServiceConfig;
  private providerRegistry: DynamicEnumProviderRegistry;
  private providerFactory: DynamicEnumProviderFactory;
  private cacheManager?: CacheManager;
  private fallbackManager: FallbackManager;
  private metrics: EnumServiceMetrics;
  private dataProvider?: EnumDataProvider;

  constructor(config: EnumServiceConfig = {}) {
    this.config = {
      enableCaching: true,
      cacheTimeout: 5 * 60 * 1000, // 5 minutes
      fallbackStrategy: 'warn',
      enableMetrics: true,
      maxRetries: 3,
      ...config
    };

    this.providerRegistry = new DynamicEnumProviderRegistry();
    this.providerFactory = new DynamicEnumProviderFactory();
    this.fallbackManager = new FallbackManager();
    this.dataProvider = config.dataProvider;

    this.metrics = {
      requests: 0,
      validations: 0,
      randomSelections: 0,
      metadataRequests: 0,
      cacheHits: 0,
      cacheMisses: 0,
      errors: 0,
      providerCount: 0,
      averageResponseTime: 0
    };

    this.initializeCache();
    this.initializeProviders();
  }

  /**
   * Initialize cache manager
   */
  private initializeCache(): void {
    if (this.config.enableCaching) {
      this.cacheManager = new CacheManager({
        ttl: this.config.cacheTimeout!,
        maxAge: this.config.cacheTimeout! * 2,
        cleanupInterval: this.config.cacheTimeout! / 2
      });
    }
  }

  /**
   * Initialize default providers
   */
  private initializeProviders(): void {
    // Register provider constructors
    this.providerFactory.registerProviderConstructor('spirits', SpiritEnumProvider);
    this.providerFactory.registerProviderConstructor('styles', StyleEnumProvider);
    this.providerFactory.registerProviderConstructor('traits', TraitEnumProvider);
    this.providerFactory.registerProviderConstructor('custom', CustomEnumProvider);

    // Set fallback strategy
    this.fallbackManager.setFallbackStrategy(this.config.fallbackStrategy!);
  }

  /**
   * Register a provider for an enum type
   */
  registerProvider(enumType: string, provider: EnumProvider): void {
    this.providerRegistry.registerProvider(enumType, provider);
    this.metrics.providerCount = this.providerRegistry.getProviderCount();
  }

  /**
   * Create and register a provider for an enum type
   */
  createAndRegisterProvider(
    enumType: string, 
    config: any, 
    dataProvider?: EnumDataProvider
  ): void {
    try {
      const provider = this.providerFactory.createProvider(enumType, config, dataProvider);
      this.registerProvider(enumType, provider);
    } catch (error) {
      this.metrics.errors++;
      throw new Error(`Failed to create provider for enum type '${enumType}': ${error}`);
    }
  }

  /**
   * Get enum data for a specific type
   */
  async getEnumData(enumType: string, options?: EnumOperationOptions): Promise<EnumData> {
    const startTime = Date.now();
    this.metrics.requests++;

    try {
      // Check cache first
      if (this.cacheManager) {
        const cached = this.cacheManager.get<EnumData>(enumType);
        if (cached) {
          this.metrics.cacheHits++;
          this.updateResponseTime(startTime);
          return cached;
        }
        this.metrics.cacheMisses++;
      }

      // Get provider
      const provider = this.providerRegistry.getProvider(enumType);
      if (!provider) {
        throw new Error(`No provider registered for enum type '${enumType}'`);
      }

      // Fetch data
      const data = await provider.getEnumData(options);
      
      // Cache the data
      if (this.cacheManager) {
        this.cacheManager.set(enumType, data);
      }

      this.updateResponseTime(startTime);
      return data;
    } catch (error) {
      this.metrics.errors++;
      this.updateResponseTime(startTime);
      
      // Try fallback
      const fallbackData = this.fallbackManager.getFallbackDataWithErrorHandling(enumType, error as Error);
      return fallbackData;
    }
  }

  /**
   * Get a specific enum value
   */
  async getEnumValue(enumType: string, key: string, options?: EnumOperationOptions): Promise<EnumValue | null> {
    const data = await this.getEnumData(enumType, options);
    return data[key] || null;
  }

  /**
   * Get metadata for an enum value
   */
  async getMetadata(enumType: string, key: string): Promise<any> {
    this.metrics.metadataRequests++;
    
    const provider = this.providerRegistry.getProvider(enumType);
    if (provider) {
      return await provider.getMetadata(key);
    }
    
    return null;
  }

  /**
   * Validate an enum value
   */
  validateValue(enumType: string, value: string): ValidationResult {
    this.metrics.validations++;
    
    const provider = this.providerRegistry.getProvider(enumType);
    if (provider) {
      return provider.validateValue(value);
    }
    
    return {
      isValid: false,
      value: null,
      error: `No provider registered for enum type '${enumType}'`
    };
  }

  /**
   * Get a random enum value
   */
  async getRandomValue(enumType: string, options?: EnumOperationOptions): Promise<EnumResult> {
    this.metrics.randomSelections++;
    
    const provider = this.providerRegistry.getProvider(enumType);
    if (!provider) {
      const fallbackValue = this.fallbackManager.getDefaultFallback(enumType);
      return {
        value: fallbackValue || 'unknown',
        isFallback: true
      };
    }
    
    return await provider.getRandomValue(options);
  }

  /**
   * Get multiple random enum values
   */
  async getRandomValues(enumType: string, count: number, options?: EnumOperationOptions): Promise<EnumResult[]> {
    this.metrics.randomSelections++;
    
    const provider = this.providerRegistry.getProvider(enumType);
    if (!provider) {
      const fallbackValue = this.fallbackManager.getDefaultFallback(enumType);
      return Array(count).fill({
        value: fallbackValue || 'unknown',
        isFallback: true
      });
    }
    
    return await provider.getRandomValues(count, options);
  }

  /**
   * Check if a value exists in an enum type
   */
  async hasValue(enumType: string, value: string): Promise<boolean> {
    const provider = this.providerRegistry.getProvider(enumType);
    if (provider) {
      return provider.hasValue(value);
    }
    
    return false;
  }

  /**
   * Get all keys for an enum type
   */
  async getKeys(enumType: string): Promise<string[]> {
    const provider = this.providerRegistry.getProvider(enumType);
    if (provider) {
      return provider.getKeys();
    }
    
    return [];
  }

  /**
   * Get the count of enum values for a type
   */
  async getCount(enumType: string): Promise<number> {
    const provider = this.providerRegistry.getProvider(enumType);
    if (provider) {
      return provider.getCount();
    }
    
    return 0;
  }

  /**
   * Refresh enum data for a specific type
   */
  async refresh(enumType: string): Promise<void> {
    const provider = this.providerRegistry.getProvider(enumType);
    if (provider) {
      await provider.refresh();
    }
    
    // Clear cache for this type
    if (this.cacheManager) {
      this.cacheManager.delete(enumType);
    }
  }

  /**
   * Refresh all enum data
   */
  async refreshAll(): Promise<void> {
    await this.providerRegistry.refreshAllProviders();
    
    // Clear all cache
    if (this.cacheManager) {
      this.cacheManager.clear();
    }
  }

  /**
   * Get service metrics
   */
  getMetrics(): EnumServiceMetrics {
    return { ...this.metrics };
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): any {
    return this.cacheManager?.getStats() || null;
  }

  /**
   * Get fallback statistics
   */
  getFallbackStats(): any {
    return this.fallbackManager.getFallbackStatistics();
  }

  /**
   * Get provider statistics
   */
  getProviderStats(): any {
    return this.providerRegistry.getAggregatedMetrics();
  }

  /**
   * Set fallback data for an enum type
   */
  setFallbackData(enumType: string, data: EnumData): void {
    this.fallbackManager.setFallbackData(enumType, data);
  }

  /**
   * Set default fallback value for an enum type
   */
  setDefaultFallback(enumType: string, value: string): void {
    this.fallbackManager.setDefaultFallback(enumType, value);
  }

  /**
   * Get all registered enum types
   */
  getRegisteredTypes(): string[] {
    return this.providerRegistry.getRegisteredTypes();
  }

  /**
   * Check if a provider is registered for an enum type
   */
  hasProvider(enumType: string): boolean {
    return this.providerRegistry.hasProvider(enumType);
  }

  /**
   * Unregister a provider
   */
  unregisterProvider(enumType: string): void {
    this.providerRegistry.unregisterProvider(enumType);
    this.metrics.providerCount = this.providerRegistry.getProviderCount();
  }

  /**
   * Clear all providers
   */
  clearProviders(): void {
    this.providerRegistry.clear();
    this.metrics.providerCount = 0;
  }

  /**
   * Update response time metric
   */
  private updateResponseTime(startTime: number): void {
    const responseTime = Date.now() - startTime;
    this.metrics.averageResponseTime = 
      (this.metrics.averageResponseTime * (this.metrics.requests - 1) + responseTime) / this.metrics.requests;
  }

  /**
   * Destroy the service
   */
  destroy(): void {
    if (this.cacheManager) {
      this.cacheManager.destroy();
    }
    this.clearProviders();
  }
}
