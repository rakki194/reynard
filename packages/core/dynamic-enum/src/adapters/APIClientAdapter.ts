/**
 * API client adapter for fetching enum data from REST APIs
 */

import type { EnumDataProvider, APIDataProviderConfig } from '../types/DataProvider';
import type { EnumData } from '../types/EnumTypes';

/**
 * API-based data provider implementation
 */
export class APIClientAdapter implements EnumDataProvider {
  private config: APIDataProviderConfig;
  private baseUrl: string;
  private endpoint: string;
  private timeout: number;
  private headers: Record<string, string>;
  private retryConfig: {
    maxRetries: number;
    retryDelay: number;
    backoffMultiplier: number;
  };

  constructor(config: APIDataProviderConfig) {
    this.config = config;
    this.baseUrl = config.baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.endpoint = config.endpoint.replace(/^\//, ''); // Remove leading slash
    this.timeout = config.timeout || 10000;
    this.headers = config.headers || {};
    this.retryConfig = config.retryConfig || {
      maxRetries: 3,
      retryDelay: 1000,
      backoffMultiplier: 2
    };
  }

  /**
   * Fetch enum data for a specific enum type
   */
  async fetchEnumData(enumType: string): Promise<EnumData> {
    const url = `${this.baseUrl}/${this.endpoint}/${enumType}`;
    
    try {
      const response = await this.makeRequest(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return this.transformResponse(data);
    } catch (error) {
      throw new Error(`Failed to fetch enum data for '${enumType}': ${error}`);
    }
  }

  /**
   * Check if the provider is available/healthy
   */
  async isAvailable(): Promise<boolean> {
    try {
      const url = `${this.baseUrl}/health`;
      const response = await this.makeRequest(url, { method: 'GET' });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get the name/identifier of this provider
   */
  getProviderName(): string {
    return `API-${this.baseUrl}`;
  }

  /**
   * Make an HTTP request with retry logic
   */
  private async makeRequest(url: string, options: RequestInit = {}): Promise<Response> {
    const requestOptions: RequestInit = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...this.headers,
        ...options.headers
      },
      signal: AbortSignal.timeout(this.timeout),
      ...options
    };

    let lastError: Error | null = null;
    let delay = this.retryConfig.retryDelay;

    for (let attempt = 0; attempt <= this.retryConfig.maxRetries; attempt++) {
      try {
        const response = await fetch(url, requestOptions);
        return response;
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === this.retryConfig.maxRetries) {
          break;
        }

        // Wait before retrying
        await this.sleep(delay);
        delay *= this.retryConfig.backoffMultiplier;
      }
    }

    throw lastError || new Error('Request failed after all retries');
  }

  /**
   * Transform API response to EnumData format
   */
  private transformResponse(data: any): EnumData {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid response format');
    }

    const enumData: EnumData = {};

    // Handle different response formats
    if (Array.isArray(data)) {
      // Array format: [{ key: 'value', weight: 1.0, metadata: {...} }]
      for (const item of data) {
        if (item.key && item.value) {
          enumData[item.key] = {
            value: item.value,
            weight: item.weight || 1.0,
            metadata: item.metadata || {}
          };
        }
      }
    } else {
      // Object format: { key: { value: 'value', weight: 1.0, metadata: {...} } }
      for (const [key, value] of Object.entries(data)) {
        if (typeof value === 'object' && value !== null) {
          const enumValue = value as any;
          enumData[key] = {
            value: enumValue.value || key,
            weight: enumValue.weight || 1.0,
            metadata: enumValue.metadata || {}
          };
        } else {
          // Simple key-value format: { key: 'value' }
          enumData[key] = {
            value: value as string,
            weight: 1.0,
            metadata: {}
          };
        }
      }
    }

    return enumData;
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
