/**
 * Composite data adapter that combines multiple data providers with fallback logic
 */

import type { EnumDataProvider, CompositeDataProviderConfig } from '../types/DataProvider';
import type { EnumData } from '../types/EnumTypes';

/**
 * Composite data provider implementation
 */
export class CompositeDataAdapter implements EnumDataProvider {
  private config: CompositeDataProviderConfig;
  private primary: EnumDataProvider;
  private fallbacks: EnumDataProvider[];
  private failureStrategy: 'fail-fast' | 'try-all' | 'best-effort';

  constructor(config: CompositeDataProviderConfig) {
    this.config = config;
    this.primary = config.primary;
    this.fallbacks = config.fallbacks;
    this.failureStrategy = config.failureStrategy;
  }

  /**
   * Fetch enum data for a specific enum type
   */
  async fetchEnumData(enumType: string): Promise<EnumData> {
    const providers = [this.primary, ...this.fallbacks];
    const errors: Error[] = [];

    for (let i = 0; i < providers.length; i++) {
      const provider = providers[i];
      
      try {
        // Check if provider is available
        if (!(await provider.isAvailable())) {
          throw new Error(`Provider ${provider.getProviderName()} is not available`);
        }

        // Try to fetch data
        const data = await provider.fetchEnumData(enumType);
        
        // Validate the data
        if (this.isValidEnumData(data)) {
          return data;
        } else {
          throw new Error(`Provider ${provider.getProviderName()} returned invalid data`);
        }
      } catch (error) {
        const errorMessage = `Provider ${provider.getProviderName()} failed: ${error}`;
        errors.push(new Error(errorMessage));
        
        // Handle failure strategy
        if (this.failureStrategy === 'fail-fast') {
          throw new Error(`Failed to fetch enum data for '${enumType}': ${errorMessage}`);
        }
        
        // Continue to next provider
        continue;
      }
    }

    // All providers failed
    const errorMessage = `All providers failed to fetch enum data for '${enumType}':\n${errors.map(e => e.message).join('\n')}`;
    throw new Error(errorMessage);
  }

  /**
   * Check if the provider is available/healthy
   */
  async isAvailable(): Promise<boolean> {
    const providers = [this.primary, ...this.fallbacks];
    
    switch (this.failureStrategy) {
      case 'fail-fast':
        // Only primary needs to be available
        return await this.primary.isAvailable();
        
      case 'try-all':
        // At least one provider needs to be available
        for (const provider of providers) {
          if (await provider.isAvailable()) {
            return true;
          }
        }
        return false;
        
      case 'best-effort':
        // Always return true, let fetchEnumData handle failures
        return true;
        
      default:
        return false;
    }
  }

  /**
   * Get the name/identifier of this provider
   */
  getProviderName(): string {
    const providerNames = [
      this.primary.getProviderName(),
      ...this.fallbacks.map(p => p.getProviderName())
    ];
    return `Composite[${providerNames.join(', ')}]`;
  }

  /**
   * Get the primary provider
   */
  getPrimaryProvider(): EnumDataProvider {
    return this.primary;
  }

  /**
   * Get the fallback providers
   */
  getFallbackProviders(): EnumDataProvider[] {
    return [...this.fallbacks];
  }

  /**
   * Get all providers
   */
  getAllProviders(): EnumDataProvider[] {
    return [this.primary, ...this.fallbacks];
  }

  /**
   * Get the failure strategy
   */
  getFailureStrategy(): string {
    return this.failureStrategy;
  }

  /**
   * Check if enum data is valid
   */
  private isValidEnumData(data: any): boolean {
    if (!data || typeof data !== 'object') {
      return false;
    }

    // Check if it has at least one valid enum value
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'object' && value !== null && 'value' in value) {
        return true;
      }
    }

    return false;
  }

  /**
   * Get health status of all providers
   */
  async getProviderHealthStatus(): Promise<Record<string, boolean>> {
    const providers = [this.primary, ...this.fallbacks];
    const status: Record<string, boolean> = {};

    for (const provider of providers) {
      try {
        status[provider.getProviderName()] = await provider.isAvailable();
      } catch (error) {
        status[provider.getProviderName()] = false;
      }
    }

    return status;
  }

  /**
   * Get detailed error information for debugging
   */
  async getDetailedErrorInfo(enumType: string): Promise<{
    primary: { available: boolean; error?: string };
    fallbacks: Array<{ name: string; available: boolean; error?: string }>;
  }> {
    const result = {
      primary: { available: false, error: undefined as string | undefined },
      fallbacks: [] as Array<{ name: string; available: boolean; error?: string }>
    };

    // Check primary provider
    try {
      result.primary.available = await this.primary.isAvailable();
    } catch (error) {
      result.primary.available = false;
      result.primary.error = String(error);
    }

    // Check fallback providers
    for (const provider of this.fallbacks) {
      try {
        const available = await provider.isAvailable();
        result.fallbacks.push({
          name: provider.getProviderName(),
          available,
          error: undefined
        });
      } catch (error) {
        result.fallbacks.push({
          name: provider.getProviderName(),
          available: false,
          error: String(error)
        });
      }
    }

    return result;
  }
}
